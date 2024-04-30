import { gpt_cmd } from "./commands/GptCommand.ts";
import { claude_cmd } from "./commands/ClaudeCommand.ts";
import { fetch_cmd } from "./commands/FetchCommand.ts";
import { CommandDefinition } from "./CommandDefinition.ts";

const handy_commands = [
  gpt_cmd,
  fetch_cmd,
  claude_cmd,
];

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...handy_commands].map((cmd) => [cmd.meta.name, cmd]),
);