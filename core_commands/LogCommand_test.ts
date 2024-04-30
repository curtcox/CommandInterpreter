import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition, CommandRecord } from "../CommandDefinition.ts";
import { Native, store_cmd } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { invoke_command } from "../ToolsForCommandWriters.ts";
import { STORE } from "../CommandDefinition.ts";

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store, "log": log_cmd},
  previous: nop_cmd,
  input: {format: "", content: ""},
});

function newMemory(): Native {
  const memory: Record<string, any> = {};
  return {
    get: (key: string) => {
      // console.log({key, memory});
      return memory[key];
    },
    set: (key: string, value: any) => {
      // console.log({key, value, memory});
      memory[key] = value;
    },
  };
}

Deno.test("Logged data can be read from the store", async () => {
  const memory = newMemory();
  const store = store_cmd(memory);
  const record: CommandRecord = {
    id: 42,
    command: nop_cmd,
    options: "Hey!!! It's a NOP!!!",
    context: {commands: {}, previous: nop_cmd, input: {format: "", content: ""}},
    result: {commands: {}, output: {format: "jazzy", content: "bar"}},
    duration: {start: 10, end: 20},
  };
  const value: CommandData = {
    format: "CommandRecord",
    content: record,
  };
  const context = contextWithStore(store);
  await invoke_command(context, "log", {format:"", content:""}, value);
  const data = {format: "text", content: "get log/42"};
  const result = await invoke_command(context, STORE, data, {format: "", content: ""});
  // console.log({result});
  assertEquals(result.output, value);
});
