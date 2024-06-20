import { assertEquals, assert, assertStringIncludes } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { assertInstanceOf } from "https://deno.land/std@0.223.0/assert/assert_instance_of.ts";
import { CommandContext, ContextMeta, CommandData, CommandDefinition, CommandCompletionRecord, CommandError } from "../command/CommandDefinition.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { OBJ } from "../command/CommandDefinition.ts";
import { emptyContext, emptyContextMeta, emptyData } from "../command/Empty.ts";
import { are_equal } from "../Objects.ts";
import { Duration } from "../Time.ts";
import { PreciseTime } from "../Time.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { nop_cmd } from "./NopCommand.ts";
import { emptyCommand } from "../command/Empty.ts";
import { obj_cmd, object, string, serialize, deserialize } from "./ObjCommand.ts";
import { nonEmpty } from "../Check.ts";
import { dump } from "../Strings.ts";

const empty = emptyData;

const contextWithObj = () : CommandContext => ({
  commands: new Map([["obj",obj_cmd]]),
  meta: emptyContextMeta,
  input: empty,
});

const contextWithObjAndLog = () : CommandContext => ({
  commands: new Map([["obj",obj_cmd],["log", nop_cmd]]),
  meta: emptyContextMeta,
  input: empty,
});

Deno.test("Get command throws an exception when missing log command -- this should log a config issue.", async () => {
  const context = contextWithObj();
  try {
    const result = await invoke(context, OBJ, {format: "string", content: "get"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.message, "Command not found: log in obj");
  }
});

Deno.test("Get command throws an exception when no key specified", async () => {
  const context = contextWithObjAndLog();
  try {
    const result = await invoke(context, OBJ, {format: "string", content: "get"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.cause, "Invalid obj command: get");
  }
});

function bogus(result: unknown) {
  console.log({result});
  throw "A result was returned when an exception should have been thrown.";
}

Deno.test("obj throws an exception for anything but read and write", async () => {
  const context = contextWithObjAndLog();
  try {
    const result = await invoke(context, OBJ, {format: "string", content: "vend"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.cause, "Invalid obj command: vend");
  }
});

Deno.test("Written value can be read using commands", async () => {
  const value: CommandData = {
    format: "jazzy",
    content: "bar",
  };
  const context = contextWithObjAndLog();
  const write_foo = {format: "string", content: "write"};
  const written = await invoke_with_input(context, OBJ, write_foo, value);
  const read_foo = {format: "string", content: "read"};
  const read = await invoke_with_input(context, OBJ, read_foo, written.output);
  assertEquals(read.output, value);
});

Deno.test("Written value can be read using convenience functions", async () => {
  const value: CommandData = {
    format: "angry",
    content: "Bartok",
  };
  const context = contextWithObj();
  const written = await string(context, value);
  const read = await object(context, written);
  assertEquals(read, value);
});

function now_now(): PreciseTime {
  return { millis: Date.now(), micros: performance.now() };
}

Deno.test("Empty command record can be written and read", async () => {
  const context = contextWithObj();
  const id = 1;
  const command = nop_cmd;
  const options = empty;
  const result: CommandResult = {
    commands: new Map(),
    output: empty,
  }
  const duration: Duration = {
     start: now_now(), end: now_now()
  }
  const record: CommandCompletionRecord = {
    id, command, options, context, result, duration, store: ''
  }
  const from_store = await save_and_load(context, {format: "CommandCompletionRecord", content: record});
  const loaded = from_store.content as CommandCompletionRecord;
  assertEquals(loaded.id, record.id);
  // assert(are_equal(loaded, record)); <<<< TODO - fix this
});

async function save_and_load(context: CommandContext, value: CommandData) : Promise<CommandData> {
  const written = await string(context, value);
  const read = await object(context, written);
  assertEquals(read.format, value.format);
  return read;
}

async function write_and_read(value: CommandData) : Promise<CommandData> {
  const context = contextWithObjAndLog();
  const written = await string(context, value);
  const read = await object(context, written);
  assertEquals(read.format, value.format);
  return read;
}

Deno.test("command error can be written and read", async () => {
  const context = contextWithObj();

  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);
  const from_store = await save_and_load(context, {format: "CommandError", content: error});
  const loaded = from_store.content as Error;
  assertInstanceOf(loaded, CommandError);
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assertEquals(loaded.cause, error.cause);
  // assertEquals(loaded.context, error.context); <<<< TODO - fix this
  assertEquals(loaded.id, error.id);
  // assertEquals(loaded.command, error.command); <<<< TODO - fix this
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  // assert(are_equal(loaded, error)); <<<< TODO - fix this
});

Deno.test("command error can be written and read", async () => {
  const context = contextWithObjAndLog();

  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);
  const from_store = await save_and_load(context, {format: "CommandError", content: error});
  const loaded = from_store.content as Error;
  assertInstanceOf(loaded, CommandError);
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assertEquals(loaded.cause, error.cause);
  // assertEquals(loaded.context, error.context); <<<< TODO - fix this
  assertEquals(loaded.id, error.id);
  // assertEquals(loaded.command, error.command); 
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  // assert(are_equal(loaded, error)); <<<< TODO - fix this
});

Deno.test("command error can be loaded and saved via json", async () => {

  const context = emptyContext
  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);

  const from_store = await write_and_read({format:"CommandError", content:error});

  const loaded = from_store.content as Error;
  assertInstanceOf(loaded, CommandError);
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assertEquals(loaded.cause, error.cause);
  // assertEquals(loaded.context, error.context); <<<< TODO - fix this
  assertEquals(loaded.id, error.id);
  // assertEquals(loaded.command, error.command); <<<< TODO - fix this
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  // assert(are_equal(loaded, error)); <<<< TODO - fix this
});

Deno.test("empty context can be loaded and saved via json", async () => {
  const context = emptyContext

  const from_store = await write_and_read({format:"CommandContext", content:context});

  const loaded = from_store.content as CommandContext;

  assertEquals(loaded.commands, context.commands);
  assertEquals(loaded.input, context.input);
  // assertEquals(loaded.meta, context.meta); <<<< TODO - fix this
  // assert(are_equal(loaded, context)); <<<< TODO - fix this
});

Deno.test("empty context meta can be loaded and saved via json", async () => {
  const meta = emptyContextMeta

  const from_store = await write_and_read({format:"ContextMeta",content:meta});

  const loaded = from_store.content as ContextMeta;

  assertEquals(loaded.id, meta.id);
  assertEquals(loaded.start, meta.start);
  // assertEquals(loaded.source, meta.source); <<<< TODO - fix this
  // assert(are_equal(loaded, meta)); <<<< TODO - fix this
});

Deno.test("empty command can be loaded and saved via json", async () => {
  const command = emptyCommand

  const from_store = await write_and_read({format:"CommandDefinition",content:command});

  const loaded = from_store.content as CommandDefinition;

  assertEquals(loaded.meta, command.meta);
  // assertEquals(loaded.func, command.func); <<<< TODO - fix this
  // assert(are_equal(loaded, command)); <<<< TODO - fix this
});

Deno.test("map can be loaded and saved via json", async () => {
  const map = new Map([['a','b'],['c','d']]);

  const from_store = await write_and_read({format:"commands",content:map});

  const loaded = from_store.content as Map<string,string>;

  assertEquals(loaded.size, map.size);
  assertEquals(loaded, map);
});

Deno.test("commands can be loaded and saved via json", async () => {
  const commands = new Map([["nop",nop_cmd],["empty",emptyCommand]]);

  const from_store = await write_and_read({format:"commands",content:commands});

  const loaded = from_store.content as Map<string, CommandDefinition>;

  assertEquals(loaded.size, commands.size);
  assertEquals(loaded.get('nop')?.meta, commands.get('nop')?.meta);
  assertEquals(loaded.get('empty')?.meta, commands.get('empty')?.meta);
});

Deno.test("loaded command can be executed", async () => {
  const commands = new Map([["nop",nop_cmd]]);

  const from_store = await write_and_read({format:"commands",content:commands});

  const loaded = from_store.content as Map<string, CommandDefinition>;
  const context = contextWithObj();
  const result = await loaded.get('nop')?.func(context,empty) as CommandResult;
  assertEquals(result.commands, context.commands);
  assertEquals(result.output, empty);
});

Deno.test("loaded commands are equal to saved commands", async () => {
  const commands = new Map([["nop",nop_cmd],["empty",emptyCommand]]);

  const from_store = await write_and_read({format:"commands",content:commands});

  const loaded = from_store.content as Map<string, CommandDefinition>;

  assertEquals(loaded.size, commands.size);
  // dump(loaded.get('nop'));
  // dump(commands.get('nop'));
  // assertEquals(loaded, commands); <<<< TODO - fix this
});

function add(a: number, b: number): number {
  return a + b;
}

Deno.test("function can be loaded and saved via json", async () => {
  const fn_str = add.toString();

  const from_store = await write_and_read({format:"function", content:fn_str});

  const loaded = from_store;

  // assert(are_equal(loaded, fn_str)); <<<< TODO - fix this

  const fn = new Function(`return (${fn_str})`)();
  // assert(are_equal(fn, add)); <<<< TODO - fix this
});

Deno.test("Error written by JSON includes expected contents.", async () => {
  const context = contextWithObjAndLog();
  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);
  error.cause = e;

  const stored = await string(context,{format:"error", content:error});
  const out = nonEmpty(stored);

  assertStringIncludes(out,"cause");
  assertStringIncludes(out,"stack");
  assertStringIncludes(out,"ObjCommand_test.ts");
});

Deno.test("empty command data can be loaded and saved via json", async () => {
  const data = emptyData;
  const from_store = await write_and_read(empty);
  const loaded = from_store;
  assert(are_equal(loaded, data));
});

Deno.test("string command data can be loaded and saved via json", async () => {
  const data = {format: "string", content: "Hello, world!"};
  const from_store = await write_and_read(data);
  const loaded = from_store;
  assert(are_equal(loaded, data));
});

Deno.test("serialize string returns that string", () => {
  assertEquals(serialize("string"), '"string"');
  assertEquals(serialize("Hello"), '"Hello"');
  assertEquals(serialize("Hello World"), '"Hello World"');
  assertEquals(serialize("{}"), '"{}"');
});

Deno.test("serialize map contains keys and values", () => {
  assertEquals(serialize(new Map()), '{"__type":"Map","value":[]}');
  assertEquals(serialize(new Map([['key','value']])), '{"__type":"Map","value":[["key","value"]]}');
  assertEquals(serialize(new Map([['k1','v1'],['k2','v2']])), '{"__type":"Map","value":[["k1","v1"],["k2","v2"]]}');
});

Deno.test("serialize context contains commands", () => {
  const context = {
    meta: emptyContextMeta,
    commands: new Map([['echo','def of comm']]),
    input: emptyData
  };

  const actual = serialize(context);
  assertStringIncludes(actual, "meta");
  assertStringIncludes(actual, "commands");
  assertStringIncludes(actual, "input");
  assertStringIncludes(actual, "echo");
  assertStringIncludes(actual, "def of comm");
});

function assertTransfer(value: any) {
  const json = serialize(value);
  const loaded = deserialize(json);
  assertEquals(loaded, value);
}

Deno.test("XXX Can transfer values", () => {
  assertTransfer("string");
  assertTransfer("Hello");
  assertTransfer("Hello World");
  assertTransfer("{}");
  assertTransfer(7);
  assertTransfer(42);
  assertTransfer(new Map());
  assertTransfer(new Map([['key','value']]));
  assertTransfer(new Map([['k1','v1'],['k2','v2']]));
  assertTransfer({});
  assertTransfer({'key':'value'});
  assertTransfer({'k1':'v1','k2':'v2'});
});
