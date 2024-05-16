import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { define_cmd } from "./DefineCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { fail } from "https://deno.land/std@0.223.0/assert/fail.ts";

const empty_commands: Record<string, CommandDefinition> = {};
const empty_data: CommandData = {
  format: "text",
  content: ""
}
const no_previous = {command: nop_cmd, options: empty_data};

const empty_context: CommandContext = {
  commands: empty_commands,
  previous: no_previous,
  input: {
    format: "text",
    content: "prefix"
  }
}

const input = (data: CommandData) => ({
  commands: empty_commands,
  previous: no_previous,
  input: data
})

const javascript = (content: string) => ({
  format: "application/javascript",
  content: content
});

const typescript = (content: string) => ({
  format: "application/typescript",
  content: content
});

const url = (content: string) => ({
  format: "URL",
  content: content
});

Deno.test("define function from full JavaScript definition", async () => {
    const defined = await define_cmd.func(empty_context, javascript(
      `export const command = {
        meta: {
          name: "nop",
          doc: "javascript nop",
          source: import.meta.url,
        },
        func: (context, _options) => {
          return Promise.resolve({
            commands: context.commands,
            output: context.input
          });
        }
      };
    `));
    const out = defined.output.content.meta;
    assertEquals(out.name, "nop");

    const commands = defined.commands;
    const nop = commands["nop"];
    const meta = nop.meta;
    assertEquals(meta.name, "nop");
    assertEquals(meta.doc, "javascript nop");

    const data1 = {format: "URL", content: new URL(import.meta.url)};
    const result1 = await nop.func(input(data1), empty_data);
    assertEquals(result1.output, data1);

    const data2 = {format: "URL", content: {p1:"Hello", p2:"There"}};
    const result2 = await nop.func(input(data2), empty_data);
    assertEquals(result2.output, data2);
});

Deno.test("define function from full TypeScript definition", async () => {
  const defined = await define_cmd.func(empty_context, typescript(
    `import { CommandDefinition, CommandContext, CommandData } from "https://raw.githubusercontent.com/curtcox/CommandInterpreter/main/CommandDefinition.ts";

    export const command: CommandDefinition = {
        meta: {
          name: "nop",
          doc: "typescript nop",
          source: import.meta.url,
        },
        func: (context: CommandContext, _options: CommandData) => {
          return Promise.resolve({
            commands: context.commands,
            output: context.input
          });
        }
      };
  `));
  const out = defined.output.content.meta;
  assertEquals(out.name, "nop");

  const commands = defined.commands;
  const nop = commands["nop"];
  const meta = nop.meta;
  assertEquals(meta.name, "nop");
  assertEquals(meta.doc, "typescript nop");

  const data1 = {format: "URL", content: new URL(import.meta.url)};
  const result1 = await nop.func(input(data1), empty_data);
  assertEquals(result1.output, data1);

  const data2 = {format: "URL", content: {p1:"Hello", p2:"There"}};
  const result2 = await nop.func(input(data2), empty_data);
  assertEquals(result2.output, data2);
});

Deno.test("define function from full TypeScript URL", async () => {
  const defined = await define_cmd.func(empty_context, url("https://esm.town/v/curtcox/EmailCommand"));
  const out = defined.output.content.meta;
  assertEquals(out.name, "email");

  const commands = defined.commands;
  const email = commands["email"];
  const meta = email.meta;
  assertEquals(meta.name, "email");
  assertEquals(meta.doc, "send an email");

  const message = {format: "EmailOptions", content: {subject:"Hello", text:"There"}};
  try {
    await email.func(input(message), message);
    fail("should have thrown an error");
  } catch (error) {
    assertEquals(error.message, "Val Town Email Error: Unauthorized");
  }
});

Deno.test("execute function definedfrom full TypeScript URL", async () => {
  const defined = await define_cmd.func(empty_context, url("https://esm.town/v/curtcox/MarkdownCommand?v=4"));
  const out = defined.output.content.meta;
  assertEquals(out.name, "markdown");

  const commands = defined.commands;
  const markdown = commands["markdown"];
  const meta = markdown.meta;
  assertEquals(meta.name, "markdown");
  assertEquals(meta.doc, "return the contents of a specified URL as markdown.");
  const content = "https://www.nytimes.com/2024/04/12/podcasts/transcript-ezra-klein-interviews-dario-amodei.html";
  const options = {format: "text", content};
  const result = await markdown.func(input(empty_data), options);
  const contents = result.output.content;
  assertStringIncludes(contents, "The Ezra Klein Show");
  assertStringIncludes(contents, "The really disorienting thing about talking");
  assertStringIncludes(contents, "I’m a believer in exponentials.");
  assertStringIncludes(contents, "Behind those predictions are what are called the scaling laws.");
});