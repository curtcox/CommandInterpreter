import { gpt_cmd } from "./commands/GptCommand.ts";
import { claude_cmd } from "./commands/ClaudeCommand.ts";
import { fetch_cmd } from "./commands/FetchCommand.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { def_from_text, def_from_simple } from "./ToolsForCommandWriters.ts";

const text_commands = [
  gpt_cmd,
  claude_cmd,
].map((cmd) => def_from_text(cmd));

const simple_commands = [
  fetch_cmd,
].map((cmd) => def_from_simple(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, ...simple_commands].map((cmd) => [cmd.meta.name, cmd]),
);