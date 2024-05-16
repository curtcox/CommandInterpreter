import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { commands } from "./commands/Commands.ts";
import { CommandContext, CommandDefinition, CommandResult } from "./command/CommandDefinition.ts";
import { run } from "./core_commands/DoCommand.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";
import { aliases_from_lines } from "./standard_commands/AliasesCommand.ts";
import { store_cmd, memory } from "./core_commands/StoreCommand.ts";
import { combine } from "./command/ToolsForCommandWriters.ts";
import { unix } from "./standard_commands/UnixCommand.ts";
import { define } from "./core_commands/DefineCommand.ts";
import { alias } from "./standard_commands/AliasCommand.ts";

const memory_store = memory();
const native_store = memory_store;
const empty = { format: "", content: "" };

const context = () => ({
    commands: combine(commands, [store_cmd(native_store)]),
    previous: { command: nop_cmd, options: empty},
    input: empty
});

const context_with = (extra: CommandDefinition) => ({
    commands: combine(commands, store_cmd(native_store), extra),
    previous: { command: nop_cmd, options: empty},
    input: empty
});

const after = (result: CommandResult): CommandContext =>  {
    const previous = { command:nop_cmd, options: result.output };
    return { commands: result.commands, previous, input: result.output };
}

const url = (content: string) => ({
    format: "URL",
    content: content
});

Deno.test("eval", async () => {
    const pipeline = "eval 8 * 8";
    const result = await run(context(), pipeline);
    assertEquals(result.output.content, "64");
});

Deno.test("alias and eval", async () => {
    const pipeline = "alias greet eval 'Hi' | greet";
    const result = await run(context(), pipeline);
    // console.log({result});
    assertEquals(result.output.content, "Hi");
});

Deno.test("piping eval to eval", async () => {
    const pipeline = "eval 6 | eval ${input} * 7";
    const result = await run(context(), pipeline);
    assertEquals(result.output.content, "42");
});

Deno.test("Pipeline using alias with multiple stages", async () => {
    const pipeline = "alias x2 eval ${input} * 2 | eval 2 | x2 | x2 | x2 | x2 | x2 | x2 | x2 ";
    const result = await run(context(), pipeline);
    assertEquals(result.output.content, "256");
});

Deno.test("unix echo output", async () => {
    const tools = await unix(context());

    const result = await run(after(tools),
      'echo What say you good sir?'
    );
    const content = result.output.content;
    const output = content.output;
    assertEquals(output, "What say you good sir?\n");
});


Deno.test("Pipeline using nested aliases", async () => {
    const tools = await unix(context());
    const definitions = await aliases_from_lines(after(tools), [
        'words tr -s [:punct:][:blank:] \\n',
        "source echo 'When in the course of human events'",
        "counts wc -w",
    ]);

    const result = await run(after(definitions),
      "source | words | counts"
    );
    const content = result.output.content;
    const output = content.output;
    assertEquals(output.trim(), "7");
});

Deno.test("Pipeline with alias that has a pipe", async () => {
    const tools = await unix(context());
    const definitions = await aliases_from_lines(after(tools), [
        'words tr -s [:punct:][:blank:] \\n',
        "source echo I love the smell of napalm in the morning",
        "counts sort | uniq -c",
        "reverse sort --reverse",
        "top head -n 1"
    ]);
    const result = await run(after(definitions),
      "source | words | sort | counts | reverse | top"
    );
    const content = result.output.content;
    const output = content.output;
    assertEquals(output.trim(), "2 the");
});


Deno.test("The most frequently ocurring word in Frankenstein.", async () => {
    const tools = await unix(context());
    const books = await aliases_from_lines(after(tools), [
        "frankenstein curl https://www.gutenberg.org/cache/epub/84/pg84.txt"
    ]);
    const distribution = await aliases_from_lines(after(books), [
        "words tr -s [:punct:][:blank:] \\n",
        "lowercase tr [:upper:] [:lower:]",
        "reverse sort --reverse",
        "counts sort | uniq -c",
        "top head -n 1"
    ]);

    const result = await run(after(distribution),
        "frankenstein | words | lowercase | sort | counts | reverse | top"
    );
    const content = result.output.content;
    const output = content.output;
    assertEquals(output.trim(), "526 the");
});

Deno.test("Summarize content from a url.", async () => {
    const markdown = await define(url("https://esm.town/v/curtcox/MarkdownCommand?v=4"));
    const summarize = await alias(context_with(markdown), {name: "summarize", expansion: "run cat"});
    // const summarize = await alias(markdown, {name: "summarize", expansion: "gpt Summarize the following text.\n\n"});
    const page = "";

    const result = await run(after(summarize),
        `markdown ${page} | summarize`
    );
    console.log({result});
});

// intersection \ 
//     <(curl http...address.txt | \ 
//         tr -s '[:punct:][:blank:]' '\n' | \ 
//         tr '[:upper:]' '[:lower:]' | \ 
//         sort | \ 
//         uniq) \ 
//     <(curl http...dream.txt | \ 
//         tr -s '[:punct:][:blank:]' '\n' | \ 
//         tr '[:upper:]' '[:lower:]' | \ 
//         sort | \ 
//         uniq) \ 
//     2> /dev/null 
// Deno.test("Common words from urls.", async () => {
//   const command = "fetch | content | summarize";
//   fail("Not implemented");
// });


