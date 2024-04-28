import { CommandContext } from "../CommandDefinition.ts";
import { TextCommand } from "../ToolsForCommandWriters.ts";
import { send } from "./OpenAI.ts";

export const gpt_cmd: TextCommand = {
  name: "gpt",
  doc: "ask OpenAI ChatGPT",
  func: async (_context: CommandContext, text: string) => {
    const messages = [
      {
        role: "user",
        content: text,
      },
    ];
    const result = await send(messages);
    return result.choices[0].message.content;
  },
};