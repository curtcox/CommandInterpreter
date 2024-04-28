import { CommandDefinition } from "../CommandDefinition.ts";
import { def_from_text } from "../ToolsForCommandWriters.ts";
import { echo_cmd } from "./EchoCommand.ts";
import { eval_cmd } from "./EvalCommand.ts";
import { help_cmd } from "./HelpCommand.ts";
import { which_cmd } from "./WhichCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { version_cmd } from "./VersionCommand.ts";

const text_commands = [
  eval_cmd,
  version_cmd,
  echo_cmd,
  which_cmd,
  help_cmd,
].map((cmd) => def_from_text(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, do_cmd, log_cmd].map((cmd) => [cmd.meta.name, cmd]),
);