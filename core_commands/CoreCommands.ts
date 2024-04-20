import { CommandDefinition } from "../CommandDefinition.ts";
import { def_from_text } from "../ToolsForCommandWriters.ts";
import { echo_cmd } from "./EchoCommand.ts";
import { eval_cmd } from "./EvalCommand.ts";
import { help_cmd } from "./HelpCommand.ts";
import { which_cmd } from "./WhichCommand.ts";
import { version_cmd } from "./VersionCommand.ts";

export const help = def_from_text(help_cmd);

const text_commands = [
  eval_cmd,
  version_cmd,
  echo_cmd,
  which_cmd,
].map((cmd) => def_from_text(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, help].map((cmd) => [cmd.name, cmd]),
);