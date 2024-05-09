import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { memory, store_cmd } from "./StoreCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";

const emptyInput = {
  format: "",
  content: "",
};

const contextWithStore = (store: CommandDefinition) : CommandContext => ({
  commands: {"store": store},
  previous: nop_cmd,
  input: emptyInput,
});

Deno.test("Set value can be obtained via get", async () => {
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
