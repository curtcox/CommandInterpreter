import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { memory, store_cmd, get, set } from "./StoreCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { emptyContextMeta } from "../command/Empty.ts";

const empty = {format:"", content:""};

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

function bogus(result: any) {
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
