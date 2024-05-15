import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { def_from_simple, invoke } from "../command/ToolsForCommandWriters.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { unix_cmd } from "./UnixCommand.ts";
import { echo_cmd } from "./EchoCommand.ts";

Deno.test("unix returns commands with unix commands", async () => {
  const empty = {format: "", content: ""};
  const context: CommandContext = {
    commands: {"unix": unix_cmd},
    previous: {command: nop_cmd, options: empty},
    input: empty,
  };
  const options = empty;
  const result = await invoke(context, "unix", options);
  const commands = result.commands;
  assertEquals(commands['cat'].meta.name, 'cat');
  assertEquals(commands['curl'].meta.name, 'curl');
});

Deno.test("unix replaces existing echo", async () => {
  const empty = {format: "", content: ""};
  const context: CommandContext = {
    commands: {"unix": unix_cmd, "echo": def_from_simple(echo_cmd) },
    previous: {command: nop_cmd, options: empty},
    input: empty,
  };
  const options = empty;
  const result = await invoke(context, "unix", options);
  const commands = result.commands;
  assertEquals(commands['echo'].meta.doc, 'Alias for run echo');
});
