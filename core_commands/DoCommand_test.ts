import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { invoke, def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "../standard_commands/VersionCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { store_cmd } from "./StoreCommand.ts";
import { io_cmd } from "./IoCommand.ts";
import { CommandRecord, CommandResult } from "../command/CommandDefinition.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";
import { memory } from "./StoreCommand.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { emptyContextMeta } from "../command/Empty.ts";
import { echo_cmd } from "../standard_commands/EchoCommand.ts";

const commands = ():Record<string, CommandDefinition> => ({
  "nop": nop_cmd,
  "version": def_from_simple(version_cmd),
  "echo": def_from_simple(echo_cmd),
  "do": do_cmd,
  "log": log_cmd,
  "io": io_cmd,
  "store": store_cmd(memory()),
});

const context = (extra: CommandDefinition[]): CommandContext => ({
  meta: emptyContextMeta,
  commands: combine(commands(), extra),
  input: {format: "", content: ""},
});

async function run(extra: CommandDefinition[],pipeline: string): Promise<CommandResult> {
  return await invoke(context(extra), "do", {format:"text", content:pipeline});
}

async function assertPipelineResult(pipeline: string, expected: string) {
  const result = await run([],pipeline);
  assertEquals(result.output.content, expected);
}

async function assertResultWith(extra: CommandDefinition[], pipeline: string, expected: string) {
  const result = await run(extra,pipeline);
  assertEquals(result.output.content, expected);
}

Deno.test("do version returns current version.", async () => {
  await assertPipelineResult("version", "0.0.7");
});

Deno.test("do version piped thu nop is still version", async () => {
  await assertPipelineResult("version | nop", "0.0.7");
});

Deno.test("do version piped thu nop twice is still version", async () => {
  await assertPipelineResult("version | nop | nop", "0.0.7");
});

Deno.test("Help is returned when there is no matching command", async () => {
  const help = def_from_simple(
    {
      name: "help",
      doc: "help text",
      source: import.meta.url,
      func: (_context, _options) => Promise.resolve("help text"),
    }
  );
  await assertResultWith([help], "what", "help text");
});

Deno.test("Exception is thrown when there is no matching command and no help", async () => {
  try {
    await run([],"boo");
    assertEquals(true, false);
  } catch (e) {
    assertEquals(e.message, "Command not found: boo");
  }
});

Deno.test("The store starts with no log records", async () => {
  const result = await run([],"store get log/0");
  assertEquals(result.output, undefined);
});

Deno.test("Execution records can be read from the log", async () => {
  const { output } = await run([],"version | store get log/0");
  assertEquals(output.format, "CommandRecord");
  const record = output.content as CommandRecord;
  const { content } = output;
  assertEquals(content.id, 0);
  assertEquals(content.options, {format: "string", content: ""});
  const meta = record.command.meta;
  assertEquals(version_cmd.name, meta.name);
  assertEquals(version_cmd.doc, meta.doc);
  assertEquals(version_cmd.source, meta.source);
  assertEquals("0.0.7", record.result.output.content);
});

Deno.test("Execution records in the log contain expected command info", async () => {
  // content.command, content.context.commands, and result.commands should all agree
  const { output } = await run([],"version | store get log/0");
  const record = output.content as CommandRecord;
  const { content } = output;
  assertEquals(content.command, record.command);
  assertEquals(content.context.commands, record.context.commands);
  assertEquals(record.context.commands, record.result.commands);
});

Deno.test("A single command with no args is given the expected options", async () => {
  const { output, commands } = await run([],"echo");
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = JSON.parse(content);
  assertEquals(options, "");
  assertEquals(context.commands["echo"].meta, commands["echo"].meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

Deno.test("A single command with 1 arg is given the expected options", async () => {
  const { output, commands } = await run([],"echo base");
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = JSON.parse(content);
  assertEquals(options, "base");
  assertEquals(context.commands["echo"].meta, commands["echo"].meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

Deno.test("A single command with 3 args is given the expected options", async () => {
  const { output, commands } = await run([],"echo whiskey tango foxtrot");
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = JSON.parse(content);
  assertEquals(options, "whiskey tango foxtrot");
  assertEquals(context.commands["echo"].meta, commands["echo"].meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

Deno.test("Multiple commands are given the expected options", async () => {
  assertEquals(true, false);
});

// Deno.test("One step pipeline only has one log entry", async () => {
//   assertEquals(true, false);
// });

// Deno.test("Two step pipeline only has 3 log entries (1 for the pipeline itself)", async () => {
//   assertEquals(true, false);
// });

// Deno.test("1st pipeline step gets input from context", async () => {
//   assertEquals(true, false);
// });

// Deno.test("1st pipeline step gets commands from context", async () => {
//   assertEquals(true, false);
// });

// Deno.test("2nd pipeline step gets commands from 1st", async () => {
//   assertEquals(true, false);
// });
