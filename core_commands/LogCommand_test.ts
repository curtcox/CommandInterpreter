import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition, CommandRecord } from "../CommandDefinition.ts";
import { store_cmd, memory } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { invoke, invoke_with_input } from "../ToolsForCommandWriters.ts";
import { STORE } from "../CommandDefinition.ts";

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store, "log": log_cmd},
  previous: nop_cmd,
  input: {format: "", content: ""},
});


Deno.test("Logged data can be read from the store", async () => {
  const store = store_cmd(memory());
  const record: CommandRecord = {
    id: 42,
    command: nop_cmd,
    options: "Hey!!! It's a NOP!!!",
    context: {commands: {}, previous: nop_cmd, input: {format: "", content: ""}},
    result: {commands: {}, output: {format: "jazzy", content: "bar"}},
    duration: {start: { millis: 10, micros: 11}, end: {millis: 20, micros: 21}},
  };
  const value: CommandData = {
    format: "CommandRecord",
    content: record,
  };
  const context = contextWithStore(store);
  const options = {format: "", content: ""};
  await invoke_with_input(context, "log", options, value);
  const data = {format: "text", content: "get log/42"};
  const result = await invoke(context, STORE, data);
  // console.log({result});
  assertEquals(result.output, value);
});
