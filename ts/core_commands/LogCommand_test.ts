import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, ContextMeta } from "../command/CommandDefinition.ts";
import { CommandCompletionRecord, CommandError } from "../command/CommandDefinition.ts";
import { store_cmd } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { log_cmd, log, error } from "./LogCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE, LOG } from "../command/CommandDefinition.ts";
import { emptyContextMeta } from "../command/Empty.ts";
import { obj_cmd } from "./ObjCommand.ts";
import { deserialize } from "./ObjCommand.ts";
import { checkFormat, isResult } from "../Check.ts";
import { Store } from "../native/Native.ts";
import { memory } from "../native/Stores.ts";

const empty = {format:"", content:""};
const contextMeta: ContextMeta = emptyContextMeta;

const contextWithStore = (store: Store) : CommandContext => ({
  commands: new Map([
      ['store', store_cmd(store)],
      ['log', log_cmd(store)],
      ['obj', obj_cmd]
  ]),
  meta: contextMeta,
  input: empty,
});

async function get_log_entry(context: CommandContext, id: number): Promise<CommandData> {
  const data = {format: "text", content: `get log/${id}`};
  const result = await invoke(context, STORE, data);
  isResult(result);
  checkFormat(result.output, "string");
  const deserialized = deserialize(result.output.content as string);
  return deserialized;
}

function assertEquivalentRecords(expected: CommandCompletionRecord, actual: CommandCompletionRecord) {
  assertEquals(expected.id, actual.id);
  // assertEquals(expected.command, actual.command); <<<< TODO - fix this
  assertEquals(expected.options, actual.options);
  // assertEquals(expected.context, actual.context); <<<< TODO - fix this
  assertEquals(expected.result, actual.result);
  assertEquals(expected.duration, actual.duration);
}

function assertEquivalentErrors(expected: CommandError, actual: CommandError) {
  assertEquals(expected.id, actual.id);
  assertEquals(expected.options, actual.options);
  assertEquals(expected.duration, actual.duration);
}

Deno.test("Command record logged via invoke with input can be read from the store", async () => {
  const store = memory();
  const record: CommandCompletionRecord = {
    id: 42,
    command: nop_cmd,
    options: {format:"", content:"Hey!!! It's a NOP!!!"},
    context: {commands: new Map(), meta: contextMeta, input: empty },
    result: {commands: new Map(), output: {format: "jazzy", content: "bar"}},
    duration: {start: { millis: 10, micros: 11}, end: {millis: 20, micros: 21}},
    store: new Map(),
  };
  const value: CommandData = {
    format: "CommandCompletionRecord",
    content: record,
  };
  const context = contextWithStore(store);
  const options = empty;
  await invoke_with_input(context, LOG, options, value);
  const deserialized = await get_log_entry(context, 42);
  assertEquals(deserialized.format, value.format);
  assertEquivalentRecords((deserialized.content as CommandCompletionRecord), (value.content as CommandCompletionRecord));
});

Deno.test("Command completions record logged via log function can be read from the store", async () => {
  const store = memory();
  const record: CommandCompletionRecord = {
    id: 12,
    command: nop_cmd,
    options: {format:"??", content:"noppy nop nop"},
    context: {commands: new Map(), meta: contextMeta, input: empty },
    result: {commands: new Map(), output: {format: "foosy", content: "bingo"}},
    duration: {start: { millis: 1, micros: 1}, end: {millis: 2, micros: 2}},
    store: new Map(),
  };
  const value: CommandData = {
    format: "CommandCompletionRecord",
    content: record,
  };
  const context = contextWithStore(store);
  await log(context, record);
  const deserialized = await get_log_entry(context, 12);
  assertEquals(deserialized.format, value.format);
  assertEquivalentRecords((deserialized.content as CommandCompletionRecord), (value.content as CommandCompletionRecord));
});

Deno.test("Command error record logged via error function can be read from the store via command", async () => {
  const store = memory();
  const id = 12;
  const command = nop_cmd;
  const options = {format:"??", content:"noppy nop nop"}
  const context = contextWithStore(store);
  const invocation = {id, command, options};
  const duration = {start: { millis: 1, micros: 1}, end: {millis: 2, micros: 2}};
  const message = "This is a test error message";
  const record: CommandError = new CommandError(context, invocation, duration, message);
  const value: CommandData = {
    format: "CommandError",
    content: record,
  };
  await error(context, record);
  const deserialized = await get_log_entry(context, 12);
  assertEquals(deserialized.format, value.format);
  assertEquivalentErrors((deserialized.content as CommandError), (value.content as CommandError));
});

Deno.test("Command error record logged via error function can be read from the store via function", async () => {
  const store = memory();
  const id = 12;
  const command = nop_cmd;
  const options = {format:"??", content:"noppy nop nop"}
  const context = contextWithStore(store);
  const invocation = {id, command, options};
  const duration = {start: { millis: 1, micros: 1}, end: {millis: 2, micros: 2}};
  const message = "This is a test error message";
  const record: CommandError = new CommandError(context, invocation, duration, message);
  const value: CommandData = {
    format: "CommandError",
    content: record,
  };
  await error(context, record);
  const deserialized = await get_log_entry(context, 12);
  assertEquals(deserialized.format, value.format);
  assertEquivalentErrors((deserialized.content as CommandError), (value.content as CommandError));
});
