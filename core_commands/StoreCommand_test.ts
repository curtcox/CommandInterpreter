import { assertEquals, assert } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition, CommandRecord } from "../command/CommandDefinition.ts";
import { memory, store_cmd, get, set } from "./StoreCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { are_equal } from "../Objects.ts";
import { Duration } from "../command/CommandDefinition.ts";
import { PreciseTime } from "../command/CommandDefinition.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { nop_cmd } from "./NopCommand.ts";

const empty = emptyData;

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store},
  meta: emptyContextMeta,
  input: empty,
});

Deno.test("Get value is undefined when not set", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  const result = await invoke(context, STORE, {format: "text", content: "get foo"});
  assertEquals(result.output, undefined);
});

Deno.test("Get command throws an exception when no key specified", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  try {
    const result = await invoke(context, STORE, {format: "text", content: "get"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e, "Invalid store command: get");
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
    console.log({e});
    assertEquals(e, "Invalid store command: get");
  }
});

Deno.test("Set throws an exception when no key specified", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  try {
    const result = await invoke(context, STORE, {format: "text", content: "set"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e, "Invalid store command: set");
  }
});

Deno.test("Store throws an exception for anything but get and set", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);
  try {
    const result = await invoke(context, STORE, {format: "text", content: "vend"});
    assertEquals(result, undefined);
  } catch (e) {
    assertEquals(e, "Invalid store command: vend");
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
  const record: CommandRecord = {
    id, command, options, context, result, duration
  }
  const from_store = await save_and_load(context, {format: "CommandRecord", content: record});
  const loaded = from_store.content as CommandRecord;
  assert(are_equal(loaded, record));
});

async function save_and_load(context: CommandContext, value: CommandData) : Promise<CommandData> {
  const key = "x";
  set(context, key, value);
  const data = await get(context, key);
  assertEquals(data.format, value.format);
  return data;
}

Deno.test("error can be loaded and saved from memory store", async () => {
  const store = store_cmd(memory());
  const context = contextWithStore(store);

  const error = new Error("This is an error.");
  const from_store = await save_and_load(context, {format: "Error", content: error});
  const loaded = from_store.content as Error;
  assertEquals(loaded.name, error.name);
  assertEquals(loaded.message, error.message);
  assertEquals(loaded.stack, error.stack);
  assert(are_equal(loaded, error));
});
