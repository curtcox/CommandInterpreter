import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { def_from_text, def_from_simple, SimpleCommand, TextCommand } from "./ToolsForCommandWriters.ts";
import { help } from "./core_commands/CoreCommands.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";

const commands: Record<string, CommandDefinition> = {};

const context: CommandContext = {
  commands: commands,
  help: help,
  previous: "",
  input: {
    format: "text",
    content: "World"
  }
}

const dasher: SimpleCommand = {
  name: "dasher",
  doc: "put in a dash",
  input_format: "text",
  output_format: "text",
  func: async (options: string, context: any) => {
    return `${options}-${context.input.content}`;
  }
};

Deno.test("def from simple produces expected command", () => {
  const command = def_from_simple(dasher);
  const meta = command.meta;
  assertEquals(meta.name, "dasher");
  assertEquals(meta.doc, "put in a dash");
  assertEquals(meta.input_formats, ["text"]);
  assertEquals(meta.output_formats, ["text"]);
});

Deno.test("calling def from simple produces the expected result", async () => {
  const command = def_from_simple(dasher);
  const result = await command.func("Hello", context);
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
  func: async (options: string, context: any) => {
    return `${options}:${context.input.content}`;
  }
};

Deno.test("def from text produces expected command", () => {
  const command = def_from_text(coloner);
  const meta = command.meta;
  assertEquals(meta.name, "coloner");
  assertEquals(meta.doc, "put in a colon");
  assertEquals(meta.input_formats, ["text"]);
  assertEquals(meta.output_formats, ["text"]);
});

Deno.test("calling def from text produces expected value", async () => {
  const command = def_from_text(coloner);
  const result = await command.func("Hello", context);
  assertEquals(result, {
    commands: commands,
    output: {
      format: "text",
      content: "Hello:World"
    }
  });
});
