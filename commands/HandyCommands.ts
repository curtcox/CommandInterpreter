import { gpt_cmd } from "./GptCommand.ts";
import { claude_cmd } from "./ClaudeCommand.ts";
import { fetch_cmd } from "./FetchCommand.ts";
import { run_cmd } from "./RunCommand.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";

const handy_commands = [
  gpt_cmd,
  fetch_cmd,
  claude_cmd,
  run_cmd,
];

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...handy_commands].map((cmd) => [cmd.meta.name, cmd]),
);