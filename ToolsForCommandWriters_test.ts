import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import { def_from_text, def_from_simple, SimpleCommand, TextCommand, use, invoke_with_input } from "./ToolsForCommandWriters.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";

const commands: Record<string, CommandDefinition> = {};

const context: CommandContext = {
  commands: commands,
  previous: nop_cmd,
  input: {
    format: "text",
    content: "World"
  }
}

const dasher: SimpleCommand = {
  name: "dasher",
  doc: "put in a dash",
  func: async (context: CommandContext, options: string) => {
    return `${options}-${context.input.content}`;
  }
};

Deno.test("def from simple produces expected command", () => {
  const command = def_from_simple(dasher);
  const meta = command.meta;
  assertEquals(meta.name, "dasher");
  assertEquals(meta.doc, "put in a dash");
});

Deno.test("calling def from simple produces the expected result", async () => {
  const command = def_from_simple(dasher);
  const result = await command.func(context, {format:"text", content:"Hello"});
  assertEquals(result, {
    commands: commands,
    output: {
      format: "text",
      content: "Hello-World"
    }
  });
});

const coloner: TextCommand = {
  name: "coloner",
  doc: "put in a colon",
  func: (context: CommandContext, options: string) => {
    return Promise.resolve(`${options}:${context.input.content}`);
  }
};

Deno.test("def from text produces expected command", () => {
  const command = def_from_text(coloner);
  const meta = command.meta;
  assertEquals(meta.name, "coloner");
  assertEquals(meta.doc, "put in a colon");
});

Deno.test("calling def from text produces expected value", async () => {
  const command = def_from_text(coloner);
  const result = await command.func(context, {format:"text", content:"Hello"});
  assertEquals(result, {
    commands: commands,
    output: {
      format: "text",
      content: "Hello:World"
    }
  });
});

Deno.test("Invoke command returns input from nop command", async () => {
  const ignored = {format: "", content: ""};
  const ctx = { commands: use(nop_cmd,commands), previous: nop_cmd, input: ignored };
  const input = {format: "text", content: "value"};
  const data = {format: "text", content: ""};
  const result = await invoke_with_input(ctx, "nop", data, input);
  assertEquals(result.output, input);
});

Deno.test("Invoke command throws a helpful exception when command not found.", async () => {
  const ignored = {format: "", content: ""};
  const ctx = { commands: use(nop_cmd,commands), previous: nop_cmd, input: ignored };
  const input = {format: "text", content: "value"};
  const data = {format: "text", content: ""};
  try {
    await invoke_with_input(ctx, "nope", data, input);
    fail("Expected an exception.");
  } catch (e) {
    assertEquals(e.message, "Command not found: nope in nop");
  }
});