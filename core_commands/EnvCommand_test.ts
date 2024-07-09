import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandDefinition } from "../command/CommandDefinition.ts";
import { env_cmd, memory, get, set } from "./EnvCommand.ts";
import { invoke, def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { ENV } from "../command/CommandDefinition.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";

const contextWithEnv = (env: CommandDefinition) : CommandContext => ({
  commands: new Map([["env", env]]),
  meta: emptyContextMeta,
  input: emptyData,
});

Deno.test("Set value can be obtained via get using command", async () => {
  const env = def_from_simple(env_cmd(memory()));
  const context = contextWithEnv(env);
  const set_foo = {format: "text", content: "set foo bar"};
  await invoke(context, ENV, set_foo);
  const get_foo = {format: "text", content: "get foo"};
  const result = await invoke(context, ENV, get_foo);
  assertEquals(result.output.content, "bar");
});

Deno.test("Set value can be obtained via get using function", async () => {
  const env = def_from_simple(env_cmd(memory()));
  const context = contextWithEnv(env);
  await set(context, "foo", "baz");
  const result = await get(context, "foo");
  assertEquals(result, "baz");
});
