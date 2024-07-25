import { CommandDefinition } from "../command/CommandDefinition.ts";
import { def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { echo_cmd } from "./EchoCommand.ts";
import { eval_cmd } from "./EvalCommand.ts";
import { which_cmd } from "./WhichCommand.ts";
import { version_cmd } from "./VersionCommand.ts";
import { alias_cmd } from "./AliasCommand.ts";
import { aliases_cmd } from "./AliasesCommand.ts";

const text_commands = [
  eval_cmd,
  version_cmd,
  which_cmd,
].map((cmd) => def_from_simple(cmd));

export const commands: Map<string, CommandDefinition> = combine(text_commands, alias_cmd, aliases_cmd, echo_cmd);