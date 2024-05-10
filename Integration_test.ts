import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "./command/CommandDefinition.ts";
import { run } from "./core_commands/DoCommand.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";
import { do_cmd } from "./core_commands/DoCommand.ts";
import { log_cmd } from "./core_commands/LogCommand.ts";
import { store_cmd } from "./core_commands/StoreCommand.ts";
import { eval_cmd } from "./standard_commands/EvalCommand.ts";
import { def_from_simple } from "./command/ToolsForCommandWriters.ts";
import { alias_cmd } from "./standard_commands/AliasCommand.ts";

const context: CommandContext = {
    commands: {
        "eval": def_from_simple(eval_cmd),
        "alias": alias_cmd,
        "do": do_cmd,
        "log": log_cmd,
        "store": store_cmd({
            get: (_key: string) => {
                return {};
            },
            set: (_key: string, _value: any) => {},
        }),
    },
    previous: nop_cmd,
    input: {format: "", content: ""},
  };

Deno.test("eval and alias", async () => {
    const pipeline = "eval 8 * 8";
    const result = await run(context, pipeline);
    assertEquals(result.output.content, "64");
});

Deno.test("Pipeline using eval and alias", async () => {
    const pipeline = "alias x2 eval ${input} * 2 | eval 2 | x2 | x2 | x2 | x2 | x2 | x2 | x2 ";
    const result = await run(context, pipeline);
    assertEquals(result.output.content, "256");
});

// Deno.test("Summarize content from a url.", () => {
//   const command = "fetch | content | summarize";
//   fail("Not implemented");
// });

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


// Frankenstein word distribution
// curl https://www.gutenberg.org/cache/epub/84/pg84.txt | tr -s '[:punct:][:blank:]' '\n' | tr '[:upper:]' '[:lower:]' | sort | uniq -c | sort