import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { invoke, def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "../standard_commands/VersionCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { store_cmd } from "./StoreCommand.ts";
import { filename_safe } from "./StoreCommand.ts";
import { define_cmd } from "./DefineCommand.ts";
import { io_cmd } from "./IoCommand.ts";
import { CommandCompletionRecord, CommandResult } from "../command/CommandDefinition.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { debug as debugStore } from "./StoreCommand.ts";
import { memory as normalStore } from "./StoreCommand.ts";
import { Native } from "./StoreCommand.ts";
import { memory as memoryEnv } from "./EnvCommand.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { CommandRecord } from "../command/CommandDefinition.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { echo_cmd } from "../standard_commands/EchoCommand.ts";
import { env_cmd } from "./EnvCommand.ts";
import { alias_cmd } from "../standard_commands/AliasCommand.ts";
import { check } from "../Check.ts";
import { deserialize } from "./ObjCommand.ts";
import { Hash } from '../Ref.ts';
import { lookupJson } from '../core_commands/RefCommand.ts';
import { dump } from "../Strings.ts";

const debug = false;
const memoryStore = debug ? debugStore : normalStore;

const commands = (store: Native):Map<string, CommandDefinition> => new Map([
  ["nop", nop_cmd],
  ["version", def_from_simple(version_cmd)],
  ["echo", echo_cmd],
  ["env", def_from_simple(env_cmd(memoryEnv()))],
  ["do", do_cmd],
  ["log", log_cmd(store)],
  ["io", io_cmd],
  ["alias", alias_cmd],
  ["define", define_cmd],
  ["store", store_cmd(store)],
 ]);

const context = (store: Native, extra: CommandDefinition[], input: CommandData): CommandContext => ({
  meta: emptyContextMeta,
  commands: combine(commands(store), extra),
  input,
});

async function run_with(store: Native, extra: CommandDefinition[], pipeline: string): Promise<CommandResult> {
  const result = await invoke(context(store, extra, emptyData), "do", {format:"text", content:pipeline});
  console.log({run_with});
  return result;
}

async function run(pipeline: string): Promise<CommandResult> {
  return await invoke(context(memoryStore(),[], emptyData), "do", {format:"text", content:pipeline});
}

async function pipelineResult(pipeline: string): Promise<CommandData> {
  const result = await run(pipeline);
  return await result.output;
}

async function assertPipelineResult(pipeline: string, expected: string) {
  const result = await pipelineResult(pipeline);
  const actual = await result.content;
  // console.log({actual, expected});
  assertEquals(actual, expected);
}

async function assertResultWith(store: Native, extra: CommandDefinition[], pipeline: string, expected: string) {
  const result = await run_with(store,extra,pipeline);
  assertEquals(result.output.content, expected);
}

async function delay() {
  // https://github.com/denoland/deno/issues/15425
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function isolate(name: string, testFn: () => Promise<void>) {
  Deno.test(name, async () => {
    await delay();
    await testFn();
    await delay();
  });
}

isolate("do version returns current version.", async () => {
   await assertPipelineResult("version", "0.0.7");
});

isolate("do version piped thu nop is still version", async () => {
  await assertPipelineResult("version | nop", "0.0.7");
});

isolate("do version piped thu nop twice is still version", async () => {
  await assertPipelineResult("version | nop | nop", "0.0.7");
});

isolate("Help is returned when there is no matching command", async () => {
  const help = def_from_simple(
    {
      name: "help",
      doc: "help text",
      source: import.meta.url,
      func: (_context, _options) => Promise.resolve("help text"),
    }
  );
  await assertResultWith(memoryStore(),[help], "what", "help text");
});

isolate("Exception is thrown when there is no matching command and no help", async () => {
  try {
    await run("boo");
    assertEquals(true, false);
  } catch (e) {
    assertEquals(e.message, "Command not found: boo");
  }
});

isolate("The store starts with no log records", async () => {
  const result = await run("store get log/0");
  assertEquals(result.output, {format:'string', content:undefined});
});

function log_file_contents(name: string, store: Native): CommandCompletionRecord {
  const lookup = (key:Hash) => store.get(`hash/${filename_safe(key.value)}`);
  const json = lookupJson(name, lookup) as string;
  const data = JSON.parse(json) as CommandData;
  return data.content as CommandCompletionRecord;
}

isolate("Execution records can be read from the log", async () => {
  const store = memoryStore();
  const { output } = await run_with(store, [], "version | store get log/0");
  assertEquals(output.format, "string");
  const key = output.content as string;
  const record = log_file_contents(key, store);
  assertEquals(record.id, 0);
  assertEquals(record.options, {format: "string", content: ""});
  const meta = record.command.meta;
  assertEquals(version_cmd.name, meta.name);
  assertEquals(version_cmd.doc, meta.doc);
  assertEquals(version_cmd.source, meta.source);
  assertEquals("0.0.7", record.result.output.content);
});

isolate("Execution records in the log contain expected command info", async () => {
  // content.command, content.context.commands, and result.commands should all agree
  const store = memoryStore();
  const { output } = await run_with(store, [], "version | store get log/0");
  assertEquals(output.format, "string");
  const key = output.content as string;
  const record = log_file_contents(key, store);
  assertEquals(record.context.commands, record.result.commands);
});

function find(commands: Map<string, CommandDefinition>, name: string): CommandDefinition {
  const command = commands.get(name);
  if (!command) {
    throw new Error(`Command not found: ${name}`);
  }
  return command;
}

isolate("A single command with no args is given the expected options", async () => {
  const echoed = await run("echo");
  const { output, commands } = echoed;
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = deserialize(content as string);
  assertEquals(options, {"format":"string", "content":""});
  assertEquals(context.commands.get("echo").meta, find(commands,"echo").meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

isolate("A single command with 1 arg is given the expected options", async () => {
  const { output, commands } = await run("echo base");
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = deserialize(content as string);
  assertEquals(options, {format:"string", content:"base"});
  assertEquals(context.commands.get("echo").meta, find(commands,"echo").meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

isolate("A single command with 3 args is given the expected options", async () => {
  const { output, commands } = await run("echo whiskey tango foxtrot");
  // This uses the fact that echo simply returns the options it was given.
  const { format, content } = output;
  assertEquals(format, "string");
  const { options, context } = deserialize(content as string);
  assertEquals(options, {format:"string", content:"whiskey tango foxtrot"});
  assertEquals(context.commands.get("echo").meta, find(commands,"echo").meta);
  assertEquals(context.input, {format: "", content: ""});
  assertEquals(context.meta.id, 0);
});

isolate("Multiple commands are given the expected options", async () => {
  const { output } = await run("env set whiskey tango| env get whiskey");
  assertEquals(output.content, "tango");
});

isolate("One step pipeline only has 2 log entries (1 for the pipeline itself)", async () => {
  const store = memoryStore();
  const result = await run_with(store,[],"version");
  command_record(store,0);
  command_record(store,1);
  assertEquals(store.get("log/2"), undefined);
});

isolate("Two step pipeline only has 3 log entries (1 for the pipeline itself)", async () => {
  const store = memoryStore();
  await run_with(store,[],"version | nop");
  command_record(store,0);
  command_record(store,1);
  command_record(store,2);
  assertEquals(store.get("log/3"), undefined);
});

function command_record(store: Native, id: number) : CommandCompletionRecord {
  const logged = store.get(`log/${id}`);
  if (!logged) {
    throw new Error(`No log record found for id ${id}`);
  }
  // const data = deserialize(logged);
  // assertEquals(data.format, "CommandCompletionRecord");
  // const record = data.content as CommandCompletionRecord;
  const record = log_file_contents(logged, store);
  return check(record);
}

isolate("1st pipeline step gets input from context", async () => {
  const store = memoryStore();
  const pipeline = "nop";
  const input = {format:"secret", content:"from input"};
  const result = await invoke(context(store, [], input), "do", {format:"text", content:pipeline});
  const { output } = result;
  assertEquals(output.format, input.format);
  assertEquals(output.content, input.content);
});

isolate("1st pipeline step gets commands from context", async () => {
  try {
    await run("boo");
    assertEquals(true, false);
  } catch (e) {
    assertEquals(e.message, "Command not found: boo");
  }
});

isolate("2nd pipeline step gets commands from 1st", async () => {
  await assertPipelineResult("alias boo version | boo", "0.0.7");
});

isolate("Can define command from a URL string.", async () => {
  const actual = await pipelineResult("define https://esm.town/v/curtcox/MarkdownCommand?v=4");
  const command = actual.content as CommandDefinition;
  assertEquals(command.meta.name, "markdown");
  assertEquals(command.meta.source, "https://esm.town/v/curtcox/MarkdownCommand?v=4");
  assertEquals(command.meta.doc, "return the contents of a specified URL as markdown.");
});