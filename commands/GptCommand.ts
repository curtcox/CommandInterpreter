import { CommandContext, CommandDefinition, CommandData } from "../CommandDefinition.ts";
import { send } from "./OpenAI.ts";

const messages = (prompt: string, content: string) => [
  {
    role: "user",
    content: prompt + "\n" + content,
  },
];

const meta = {
  name: "gpt",
  doc: "ask OpenAI ChatGPT",
  source: import.meta.url,
  input_formats: ["text"],
  output_formats: ["text"],
};

const func = async (context: CommandContext, options: CommandData) => {

  const result = await send(messages(options.content,context.input.content));

  return {
    commands: context.commands,
    output: {
      format: "text",
      content: result.choices[0].message.content,
    },
  };
};

export const gpt_cmd: CommandDefinition = {
  meta, func
};