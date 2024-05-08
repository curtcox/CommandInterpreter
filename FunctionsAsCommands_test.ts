import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext, CommandDefinition, CommandData } from "./CommandDefinition.ts";
import { FunctionCommand, def_from_function } from "./FunctionsAsCommands.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";

const commands: Record<string, CommandDefinition> = {};

const context: CommandContext = {
  commands: commands,
  previous: nop_cmd,
  input: {
    format: "text",
    content: "prefix"
  }
}

function options(content: string): CommandData {
  return { format: "text", content: content };
}

const duper: FunctionCommand = {
  doc: "make duplicates",
  args: [
    { name: "text", type: "string", required: true, default_value: "" },
    { name: "times", type: "number", required: false, default_value: 2 },
  ],
  func: (context: CommandContext, text: string, times: number) => {
    let out = context.input.content;
    for (let i = 0; i < times; i++) {
      out += text;
    }
    return out;
  }
};

Deno.test("function command meta has function info", () => {
  const command = def_from_function(duper);
  const meta = command.meta;
  assertEquals(meta.name, "duper");
  assertEquals(meta.doc, "make duplicates");
});

Deno.test("function command can be invoked with all args", async () => {
  const command = def_from_function(duper);
  const result = await command.func(context, options('--text="dot " --times=3'));
  assertEquals(result.output.content, "prefixdot dot dot ");
});

Deno.test("function command can be invoked with required args", async () => {
  const command = def_from_function(duper);
  const result = await command.func(context, options('--text="dash"'));
  assertEquals(result.output.content, "prefixdashdash");
});

Deno.test("function interprets options as one required arg", async () => {
  const command = def_from_function(duper);
  const result = await command.func(context, options('Conner'));
  assertEquals(result.output.content, "prefixConnerConner");
});
