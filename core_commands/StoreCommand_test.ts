import { assertEquals, assert } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, ContextMeta, CommandData, CommandDefinition, CommandCompletionRecord, CommandError } from "../command/CommandDefinition.ts";
import { memory, filesystem, store_cmd, get, set, json_io, Codec } from "./StoreCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { emptyContext, emptyContextMeta, emptyData } from "../command/Empty.ts";
import { are_equal } from "../Objects.ts";
import { Duration } from "../Time.ts";
import { PreciseTime } from "../Time.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { nop_cmd } from "./NopCommand.ts";
import { assertInstanceOf } from "https://deno.land/std@0.223.0/assert/assert_instance_of.ts";
import { emptyCommand } from "../command/Empty.ts";

const empty = emptyData;

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store},
  meta: emptyContextMeta,
  input: empty,
});

const contextWithStoreAndLog = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store, "log": nop_cmd},
  meta: emptyContextMeta,
  input: empty,
});

Deno.test("Get value is undefined when not set", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  const result = await invoke(context, STORE, {format: "text", content: "get foo"});
  assertEquals(result.output, undefined);
});

Deno.test("Get command throws an exception when missing log command -- this should log a config issue.", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  try {
    const result = await invoke(context, STORE, {format: "string", content: "get"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.message, "Command not found: log in store");
  }
});

Deno.test("Get command throws an exception when no key specified", async () => {
  const store = store_cmd(memory());
  const context = contextWithStoreAndLog(store);
  try {
    const result = await invoke(context, STORE, {format: "string", content: "get"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.cause, "Invalid store command: get");
  }
});

function bogus(result: unknown) {
  console.log({result});
  throw "A result was returned when an exception should have been thrown.";
}

Deno.test("Get function throws an exception when no key specified", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  try {
    const result = await get(context,"");
    bogus(result);
  } catch (e) {
    const ctx = e.context;
    assertEquals(ctx.input.content.cause, "Invalid store command: get");
  }
});

Deno.test("Set throws an exception when no key specified", async () => {
  const store = store_cmd(memory());
  const context = contextWithStoreAndLog(store);
  try {
    const result = await invoke(context, STORE, {format: "text", content: "set"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.cause, "Invalid store command: set");
  }
});

Deno.test("Store throws an exception for anything but get and set", async () => {
  const store = store_cmd(memory());
  const context = contextWithStoreAndLog(store);
  try {
    const result = await invoke(context, STORE, {format: "text", content: "vend"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e.cause, "Invalid store command: vend");
  }
});

Deno.test("Set value can be obtained via get using commands", async () => {
  const store = store_cmd(memory());
  const value: CommandData = {
    format: "jazzy",
    content: "bar",
  };
  const context = contextWithStore(store);
  const set_foo = {format: "text", content: "set foo"};
  await invoke_with_input(context, STORE, set_foo, value);
  const get_foo = {format: "text", content: "get foo"};
  const result = await invoke(context, STORE, get_foo);
  assertEquals(result.output, value);
});

Deno.test("Set value can be obtained via get using convenience functions", async () => {
  const store = store_cmd(memory());
  const value: CommandData = {
    format: "angry",
    content: "Bartok",
  };
  const context = contextWithStore(store);
  await set(context, "bar", value);
  const result = await get(context, "bar");
  assertEquals(result, value);
});

function now_now(): PreciseTime {
  return { millis: Date.now(), micros: performance.now() };
}

Deno.test("Empty command record can be loaded and saved from memory store", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  const id = 1;
  const command = nop_cmd;
  const options = empty;
  const result: CommandResult = {
    commands: {},
    output: empty,
  }
  const duration: Duration = {
     start: now_now(), end: now_now()
  }
  const record: CommandCompletionRecord = {
    id, command, options, context, result, duration
  }
  const from_store = await save_and_load(context, {format: "CommandCompletionRecord", content: record});
  const loaded = from_store.content as CommandCompletionRecord;
  assert(are_equal(loaded, record));
});

async function save_and_load(context: CommandContext, value: CommandData) : Promise<CommandData> {
  const key = "x";
  set(context, key, value);
  const data = await get(context, key);
  console.log({data});
  assertEquals(data.format, value.format);
  return data;
}

Deno.test("error can be loaded and saved from memory store", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);

  const error = new Error("This is an error.");
  const from_store = await save_and_load(context, {format: "Error", content: error});
  const loaded = from_store.content as Error;
  assertInstanceOf(loaded, Error);
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assert(are_equal(loaded, error));
});

Deno.test("command error can be loaded and saved from memory store", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);

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
  assertEquals(loaded.context, error.context);
  assertEquals(loaded.id, error.id);
  assertEquals(loaded.command, error.command);
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  assert(are_equal(loaded, error));
});

Deno.test("command error can be loaded and saved from file store", async () => {
  const store = store_cmd(filesystem("store",json_io(),"json"));
  const context = contextWithStoreAndLog(store);

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
  assertEquals(loaded.context, error.context);
  assertEquals(loaded.id, error.id);
  assertEquals(loaded.command, error.command);
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  assert(are_equal(loaded, error));
});

async function write_and_read(value: CommandData, io: Codec) : Promise<CommandData> {
  const data = await io.read(await io.write(value));
  assertEquals(data.format, value.format);
  return data;
}

Deno.test("command error can be loaded and saved via json", async () => {
  const io = json_io();

  const context = emptyContext
  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);

  const from_store = await write_and_read({format:"CommandError", content:error},io);

  const loaded = from_store.content as Error;
  assertInstanceOf(loaded, CommandError);
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assertEquals(loaded.cause, error.cause);
  assertEquals(loaded.context, error.context);
  assertEquals(loaded.id, error.id);
  assertEquals(loaded.command, error.command);
  assertEquals(loaded.options, error.options);
  assertEquals(loaded.duration, error.duration);

  assert(are_equal(loaded, error));
});

Deno.test("empty context can be loaded and saved via json", async () => {
  const io = json_io();

  const context = emptyContext

  const from_store = await write_and_read({format:"CommandContext", content:context},io);

  const loaded = from_store.content as CommandContext;

  assertEquals(loaded.commands, context.commands);
  assertEquals(loaded.input, context.input);
  assertEquals(loaded.meta, context.meta);
  assert(are_equal(loaded, context));
});

Deno.test("empty context meta can be loaded and saved via json", async () => {
  const io = json_io();

  const meta = emptyContextMeta

  const from_store = await write_and_read({format:"ContextMeta",content:meta},io);

  const loaded = from_store.content as ContextMeta;

  assertEquals(loaded.id, meta.id);
  assertEquals(loaded.start, meta.start);
  assertEquals(loaded.source, meta.source);
  assert(are_equal(loaded, meta));
});

Deno.test("empty command can be loaded and saved via json", async () => {
  const io = json_io();

  const command = emptyCommand

  const from_store = await write_and_read({format:"CommandDefinition",content:command},io);

  const loaded = from_store.content as CommandDefinition;

  assertEquals(loaded.meta, command.meta);
  assertEquals(loaded.func, command.func);
  assert(are_equal(loaded, command));
});

function add(a: number, b: number): number {
  return a + b;
}

Deno.test("function can be loaded and saved via json", async () => {
  const io = json_io();

  const fn_str = add.toString();

  const from_store = await write_and_read({format:"function", content:fn_str},io);

  const loaded = from_store;

  assert(are_equal(loaded, fn_str));

  const fn = new Function(`return (${fn_str})`)();
  assert(are_equal(fn, add));
});

Deno.test("Error written by JSON includes expected contents.", async () => {
  const io = json_io();

  const context = emptyContext
  const e = new Error("This is an error.");
  const invocation = {id: 1, command: nop_cmd, options: empty};
  const duration = {start: now_now(), end: now_now()};
  const error = new CommandError(context, invocation, duration, e.message);
  error.cause = e;

  const stored = await io.write({format:"error", content:error});

  assert(stored.includes("cause"));
  assert(stored.includes("stack"));
  assert(stored.includes("StoreCommand_test.ts"));
});

Deno.test("empty command data can be loaded and saved via json", async () => {
  const io = json_io();
  const data = emptyData;
  const from_store = await write_and_read(empty,io);
  const loaded = from_store;
  assert(are_equal(loaded, data));
});

Deno.test("string command data can be loaded and saved via json", async () => {
  const io = json_io();
  const data = {format: "string", content: "Hello, world!"};
  const from_store = await write_and_read(data,io);
  const loaded = from_store;
  assert(are_equal(loaded, data));
});
