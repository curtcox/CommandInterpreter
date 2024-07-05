import { CommandContext, CommandDefinition } from "../command/CommandDefinition.ts";
import { define_cmd } from "./DefineCommand.ts";
import { emptyCommand, emptyContext, emptyData, emptyContextMeta } from "../command/Empty.ts";
import { convert_data, io_cmd } from "./IoCommand.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { CommandInvocation } from "../command/CommandDefinition.ts";
import { nop_cmd } from "./NopCommand.ts";
import { DataConversion } from "./IoCommand.ts";
import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { eval_cmd } from "../standard_commands/EvalCommand.ts";
import { which_cmd } from "../standard_commands/WhichCommand.ts";
import { def_from_simple } from "../command/ToolsForCommandWriters.ts";

const commands:Map<string, CommandDefinition> = new Map([
  ["nop", nop_cmd],
  ["io", io_cmd],
  ["define", define_cmd],
 ]);

 const context: CommandContext = ({
  meta: emptyContextMeta,
  commands,
  input: emptyData,
});

Deno.test("IO should not convert for nop", async () => {
  const address = "https://esm.town/v/curtcox/MarkdownCommand?v=4";
  const output: CommandData = { format: "string", content: address }
  const result: CommandResult = { commands, output };
  const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
  const target: CommandInvocation = { id:1, command:nop_cmd, options:emptyData };
  const conversion: DataConversion = { result, source, target };

  const converted = await convert_data(context, conversion);

  assertEquals(converted.output, output);
  assertEquals(converted.commands, commands);
});

Deno.test("IO should give string value directly to eval", async () => {
  const content = "console.log('Hello, World!')";
  const output: CommandData = { format: "string", content }
  const result: CommandResult = { commands, output };
  const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
  const target: CommandInvocation = { id:1, command:def_from_simple(eval_cmd), options:emptyData };
  const conversion: DataConversion = { result, source, target };

  const converted = await convert_data(context, conversion);

  assertEquals(converted.output, output);
  assertEquals(converted.commands, commands);
});

Deno.test("IO should unwrap wrapped strings going to eval", async () => {
  const code = "console.log('Hello, World!')";
  const output: CommandData = { format: "wrapped", content: { format:'string', content: code } };
  const result: CommandResult = { commands, output };
  const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
  const target: CommandInvocation = { id:1, command:def_from_simple(eval_cmd), options:emptyData };
  const conversion: DataConversion = { result, source, target };

  const converted = await convert_data(context, conversion);

  assertEquals(converted.output, { format: "string", content: code });
  assertEquals(converted.commands, commands);
});

Deno.test("IO should give string value directly to eval", async () => {
  const code = "console.log('Hello, World!')";
  const output: CommandData = { format: "string", content: code };
  const result: CommandResult = { commands, output };
  const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
  const target: CommandInvocation = { id:1, command:def_from_simple(eval_cmd), options:emptyData };
  const conversion: DataConversion = { result, source, target };

  const converted = await convert_data(context, conversion);

  assertEquals(converted.output, { format: "string", content: code });
  assertEquals(converted.commands, commands);
});

Deno.test("IO should give string value directly to which", async () => {
  const output: CommandData = { format: "string", content: 'eval' };
  const result: CommandResult = { commands, output };
  const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
  const target: CommandInvocation = { id:1, command:def_from_simple(which_cmd), options:emptyData };
  const conversion: DataConversion = { result, source, target };

  const converted = await convert_data(context, conversion);

  assertEquals(converted.output, { format: "string", content: 'eval' });
  assertEquals(converted.commands, commands);
});

Deno.test("IO should give string value directly to eval", async () => {
  // env, version, which, eval, help
});

//   await assertPipelineResult("define https://esm.town/v/curtcox/MarkdownCommand?v=4", "defined");
Deno.test("IO should convert string to URL for define command", async () => {
    const address = "https://esm.town/v/curtcox/MarkdownCommand?v=4";
    const output: CommandData = { format: "string", content: address }
    const result: CommandResult = { commands, output };
    const source: CommandInvocation = { id:0, command:emptyCommand, options:emptyData };
    const target: CommandInvocation = { id:1, command:define_cmd, options:emptyData };
    const conversion: DataConversion = { result, source, target };

    const converted = await convert_data(context, conversion);

    assertEquals(converted.output, { format: "URL", content: new URL(address) });
    assertEquals(converted.commands, commands);
});
