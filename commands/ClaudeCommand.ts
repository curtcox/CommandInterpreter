import { CommandContext } from "../CommandDefinition.ts";
import { FunctionCommand } from "../FunctionsAsCommands.ts";
// import { parseArgs } from "../deps.ts";
import { send } from "./Anthropic.ts";

const messages = (prompt: string, content: string) => (
  [
    {
      role: "user",
      content: prompt + "\n" + content,
    },
  ]
);

export const claude_cmd: FunctionCommand = {

  name: "claude",
  doc: "Ask Anthropic Claude",
  args: [
    { name: "prompt", type: "string", required: true, default_value: "" },
    { name: "model", type: "string", required: false, default_value: "claude-3-opus-20240229" },
    { name: "max_tokens", type: "number", required: false, default_value: 4096 },
  ],
  
  func: async (context: CommandContext, prompt: string, model: string, max_tokens: number) => {

    //const args = options.split(" ");
    //let {model,max_tokens,prompt} = parseArgs(args);
    
    // if (!(model && max_tokens && prompt)) {
    //   model = "claude-3-opus-20240229";
    //   max_tokens = 4096;
    //   prompt = options;
    // }

    const result = await send(
      {model,max_tokens},
      messages(prompt,context.input.content)
    );

    return result.content[0].text;
  },

};