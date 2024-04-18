import { send as claude } from "./Anthropic.ts";
import { CommandContext, CommandDefinition } from "./CommandDefinition.ts";
import { send as gpt } from "./OpenAI.ts";
import { TextCommand, SimpleCommand, def_from_text, def_from_simple, string_for } from "./ToolsForCommandWriters.ts";

const gptCommand: TextCommand = {
  name: "gpt",
  doc: "ask OpenAI ChatGPT",
  func: async (text: string, _context: CommandContext) => {
    const messages = [
      {
        role: "user",
        content: text,
      },
    ];
    const result = await gpt(messages);
    return result.choices[0].message.content;
  },
};

const claudeCommand: TextCommand = {
  name: "claude",
  doc: "ask Anthropic Claude",
  func: async (text, _context) => {
    const messages = [
      {
        role: "user",
        content: text,
      },
    ];
    const result = await claude(messages);
    return result.content[0].text;
  },
};

const fetchCommand: SimpleCommand = {
  name: "fetch",
  input_format: "",
  output_format: "JSON",
  doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
  func: async (options, _context) => {
    const result = await fetch(options);
    const json = await result.json();
    return string_for(json);
  },
};

const text_commands = [
  gptCommand,
  claudeCommand,
].map((cmd) => def_from_text(cmd));
const simple_commands = [
  fetchCommand,
].map((cmd) => def_from_simple(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, ...simple_commands].map((cmd) => [cmd.name, cmd]),
);