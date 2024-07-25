import { gpt_cmd } from "./GptCommand.ts";
import { claude_cmd } from "./ClaudeCommand.ts";
import { fetch_cmd } from "./FetchCommand.ts";
import { run_cmd } from "./RunCommand.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";
import { unix_cmd } from "../standard_commands/UnixCommand.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";

const handy_commands = [
  gpt_cmd,
  fetch_cmd,
  claude_cmd,
  run_cmd,
  unix_cmd
];

export const commands: Map<string, CommandDefinition> = combine(handy_commands);