import { CommandContext, CommandDefinition, CommandData } from "../CommandDefinition.ts";
import { send } from "./Anthropic.ts";

const messages = (prompt: string, content: string) => (
  [
    {
      role: "user",
      content: prompt + "\n" + content,
    },
  ]
);

const meta = {
  name: "claude",
  doc: "Ask Anthropic Claude",
  source: import.meta.url,
  input_formats: ["text"],
  output_formats: ["text"],
};

const func = async (context: CommandContext, options: CommandData) => {
  const model = "claude-3-opus-20240229";
  const max_tokens = 4096;

  const result = await send(
    {model,max_tokens},
    messages(options.content,context.input.content)
  );

  return {
    commands: context.commands,
    output: {
      format: "text",
      content: result.content[0].text
    }
  };
};

export const claude_cmd: CommandDefinition = {
    meta, func
};