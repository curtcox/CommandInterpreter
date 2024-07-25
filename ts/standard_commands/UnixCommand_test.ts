import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { unix_cmd } from "./UnixCommand.ts";
import { echo_cmd } from "./EchoCommand.ts";
import { emptyContextMeta } from "../command/Empty.ts";

Deno.test("unix returns commands with unix commands", async () => {
  const empty = {format: "", content: ""};
  const context: CommandContext = {
    commands: new Map([["unix", unix_cmd]]),
    meta: emptyContextMeta,
    input: empty,
  };
  const options = empty;
  const result = await invoke(context, "unix", options);
  const commands = result.commands;
  assertEquals(commands.get('cat')!.meta.name, 'cat');
  assertEquals(commands.get('curl')!.meta.name, 'curl');
});

Deno.test("unix replaces existing echo", async () => {
  const empty = {format: "", content: ""};
  const context: CommandContext = {
    commands: new Map([["unix", unix_cmd], ["echo", echo_cmd]]),
    meta: emptyContextMeta,
    input: empty,
  };
  const options = empty;
  const result = await invoke(context, "unix", options);
  const commands = result.commands;
  assertEquals(commands.get('echo')!.meta.doc, 'Alias for run echo');
});
