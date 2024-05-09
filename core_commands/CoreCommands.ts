import { CommandDefinition } from "../command/CommandDefinition.ts";
import { def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { help_cmd } from "./HelpCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { define_cmd } from "./DefineCommand.ts";

const text_commands = [
  help_cmd,
].map((cmd) => def_from_simple(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, define_cmd, do_cmd, log_cmd].map((cmd) => [cmd.meta.name, cmd]),
);