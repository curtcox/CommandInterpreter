import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition } from "../CommandDefinition.ts";
import { Native, store_cmd } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { invoke_command } from "../ToolsForCommandWriters.ts";
import { STORE } from "../CommandDefinition.ts";

const emptyInput = {
  format: "",
  content: "",
};

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store},
  previous: nop_cmd,
  input: emptyInput,
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

Deno.test("Set value can be obtained via get", async () => {
  const memory = newMemory();
  const store = store_cmd(memory);
  const value: CommandData = {
    format: "jazzy",
    content: "bar",
  };
  const context = contextWithStore(store);
  const set_foo = {format: "text", content: "set foo"};
  await invoke_command(context, STORE, set_foo, value);
  const get_foo = {format: "text", content: "get foo"};
  const result = await invoke_command(context, STORE, get_foo, {format: "", content: ""});
  // console.log({result});
  assertEquals(result.output, value);
});
