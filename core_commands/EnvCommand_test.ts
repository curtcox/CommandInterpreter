import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandDefinition, CommandData } from "../CommandDefinition.ts";
import { env_cmd, memory } from "./EnvCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { invoke, def_from_text } from "../ToolsForCommandWriters.ts";
import { ENV } from "../CommandDefinition.ts";

const emptyInput = {
  format: "",
  content: "",
};

const contextWithEnv = (env: CommandDefinition) : CommandContext => ({
  commands: {"env": env},
  previous: nop_cmd,
  input: emptyInput,
});

Deno.test("Set value can be obtained via get", async () => {
  const env = def_from_text(env_cmd(memory()));
  const value: CommandData = {
    format: "jazzy",
    content: "bar",
  };
  const context = contextWithEnv(env);
  const set_foo = {format: "text", content: "set foo"};
  await invoke(context, ENV, set_foo, value);
  const get_foo = {format: "text", content: "get foo"};
  const result = await invoke(context, ENV, get_foo);
  assertEquals(result.output, value);
});
