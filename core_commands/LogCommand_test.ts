import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition, ContextMeta } from "../command/CommandDefinition.ts";
import { CommandCompletionRecord, CommandError } from "../command/CommandDefinition.ts";
import { store_cmd, memory, get } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { log_cmd, log, error } from "./LogCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE, LOG } from "../command/CommandDefinition.ts";
import { emptyContextMeta } from "../command/Empty.ts";

const empty = {format:"", content:""};
const contextMeta: ContextMeta = emptyContextMeta;

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store, "log": log_cmd},
  meta: contextMeta,
  input: {format: "", content: ""},
});

Deno.test("Command record logged via invoke with input can be read from the store", async () => {
  const store = store_cmd(memory());
  const record: CommandCompletionRecord = {
    id: 42,
    command: nop_cmd,
    options: {format:"", content:"Hey!!! It's a NOP!!!"},
    context: {commands: {}, meta: contextMeta, input: empty },
    result: {commands: {}, output: {format: "jazzy", content: "bar"}},
    duration: {start: { millis: 10, micros: 11}, end: {millis: 20, micros: 21}},
  };
  const value: CommandData = {
    format: "CommandCompletionRecord",
    content: record,
  };
  const context = contextWithStore(store);
  const options = empty;
  await invoke_with_input(context, LOG, options, value);
  const data = {format: "text", content: "get log/42"};
  const result = await invoke(context, STORE, data);
  assertEquals(result.output, value);
});

Deno.test("Command completions record logged via log function can be read from the store", async () => {
  const store = store_cmd(memory());
  const record: CommandCompletionRecord = {
    id: 12,
    command: nop_cmd,
    options: {format:"??", content:"noppy nop nop"},
    context: {commands: {}, meta: contextMeta, input: empty },
    result: {commands: {}, output: {format: "foosy", content: "bingo"}},
    duration: {start: { millis: 1, micros: 1}, end: {millis: 2, micros: 2}},
  };
  const value: CommandData = {
    format: "CommandCompletionRecord",
    content: record,
  };
  const context = contextWithStore(store);
  await log(context, record);
  const data = {format: "text", content: "get log/12"};
  const result = await invoke(context, STORE, data);
  assertEquals(result.output, value);
});

Deno.test("Command error record logged via error function can be read from the store via command", async () => {
  const store = store_cmd(memory());
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
  const data = {format: "text", content: "get log/12"};
  const result = await invoke(context, STORE, data);
  assertEquals(result.output, value);
});

Deno.test("Command error record logged via error function can be read from the store via function", async () => {
  const store = store_cmd(memory());
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
  const data = await get(context, "log/12");
  assertEquals(data, value);
});
