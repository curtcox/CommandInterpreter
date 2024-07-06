import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition, CommandCompletionRecord, CommandError } from "../command/CommandDefinition.ts";
import { memory, debug, filesystem, store_cmd, get, set, Native } from "./StoreCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { nop_cmd } from "./NopCommand.ts";
import { Hash } from "../Ref.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";
import { assertNotEquals } from "https://deno.land/std@0.223.0/assert/assert_not_equals.ts";

const empty = emptyData;

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: new Map([['store', store]]),
  meta: emptyContextMeta,
  input: empty,
});

const contextWithStoreAndLog = (store: CommandDefinition) : CommandContext => ({
  commands: new Map([['store', store], ['log', nop_cmd]] ),
  meta: emptyContextMeta,
  input: empty,
});

Deno.test("Get value is undefined when not set", async () => {
  const store = store_cmd(memory());
  const context = contextWithStoreAndLog(store);
  const result = await invoke(context, STORE, {format: "text", content: "get foo"});
  assertEquals(result.output, {format: "string", content: undefined});
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
    format: "string",
    content: "bar",
  };
  const context = contextWithStoreAndLog(store);
  const set_foo = {format: "text", content: "set foo"};
  await invoke_with_input(context, STORE, set_foo, value);
  const get_foo = {format: "text", content: "get foo"};
  const result = await invoke(context, STORE, get_foo);
  assertEquals(result.output, value);
});

Deno.test("Set value can be obtained via get using convenience functions", async () => {
  const store = store_cmd(memory());
  const value = '{ format: "string", content: "Bartok" }';
  const context = contextWithStoreAndLog(store);
  await set(context, "bar", value);
  const result = await get(context, "bar");
  assertEquals(result, value);
});

async function assertEqualSnapshots(store1: Native, store2: Native, store3: Native) {
  const snap1 = await store1.snapshot();
  const snap2 = await store2.snapshot();
  const snap3 = await store3.snapshot();
  assertEquals(snap1, snap2);
  assertEquals(snap2, snap3);
}

Deno.test("Empty store snapshots are equal", async () => {
  const store1 = memory();
  const store2 = debug();
  const store3 = filesystem('store','json');
  await assertEqualSnapshots(store1, store2, store3);
});

Deno.test("Empty store snapshot value changes when a value is added", async () => {
  const store = memory();
  const snap1 = await store.snapshot();
  await store.set('foo','bar');
  const snap2 = await store.snapshot();
  assertNotEquals(snap1, snap2);
});

Deno.test("Stores with one value have equal snapshots", async () => {
  const store1 = memory();
  const store2 = debug();
  const store3 = filesystem('store','json');
  await store1.set('foo','bar');
  await store2.set('foo','bar');
  await store3.set('foo','bar');
  await assertEqualSnapshots(store1, store2, store3);
});

Deno.test("Stores with 100 value have equal snapshots", async () => {
  const store1 = memory();
  const store2 = debug();
  const store3 = filesystem('store','json');
  for (let i = 0; i < 100; i++) {
    await store1.set(`foo${i}`,`bar${i}`);
    await store2.set(`foo${i}`,`bar${i}`);
    await store3.set(`foo${i}`,`bar${i}`);
    await assertEqualSnapshots(store1, store2, store3);
  }
});

Deno.test("Stores with 1000 value have equal snapshots", async () => {
  const store1 = memory();
  const store2 = debug();
  const store3 = filesystem('store','json');
  for (let i = 0; i < 1000; i++) {
    await store1.set(`big${i}`,`1K${i}`);
    await store2.set(`big${i}`,`1K${i}`);
    await store3.set(`big${i}`,`1K${i}`);
    await assertEqualSnapshots(store1, store2, store3);
  }
});

// The current implementation runs out of memery somewhere between 2K and 5K.
// A better future implementation could fix that by chaining snapshots, so that the the
// latest snapshot is less likely to ever be so big.
Deno.test("Stores with 2,000 value have equal snapshots", async () => {
  const store1 = memory();
  const store2 = debug();
  const store3 = filesystem('store','json');
  for (let i = 0; i < 2000; i++) {
    await store1.set(`max${i}`,`2K${i}`);
    await store2.set(`max${i}`,`2K${i}`);
    await store3.set(`max${i}`,`2K${i}`);
    await assertEqualSnapshots(store1, store2, store3);
  }
});

Deno.test("Changing contents changes snapshot", async () => {
  const store = memory();
  const snapshots = new Set();
  for (let i = 0; i < 1000; i++) {
    await store.set(`max${i}`,`10K${i}`);
    const snap = await store.snapshot();
    snapshots.add(snap.value);
    assertEquals(snapshots.size, i + 1);
  }
});