import { TextCommand } from "../ToolsForCommandWriters.ts";
import { parseArgs } from "../deps.ts";
import { send } from "./Anthropic.ts";

const messages = (prompt: string, content: string) => (
  [
    {
      role: "user",
      content: prompt + "\n" + content,
    },
  ]
);

export const claude_cmd: TextCommand = {

  name: "claude",
  doc: "Ask Anthropic Claude",
  
  func: async (options, context) => {

    const args = options.split(" ");
    let {model,max_tokens,prompt} = parseArgs(args);
    if (!(model && max_tokens && prompt)) {
      model = "claude-3-opus-20240229";
      max_tokens = 4096;
      prompt = options;
    }

    const result = await send(
      {model,max_tokens},
      messages(prompt,context.input.content)
    );

    return result.content[0].text;
  },

};