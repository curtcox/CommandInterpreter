import { CommandContext, CommandDefinition, CommandData } from "../command/CommandDefinition.ts";
import { get } from "../core_commands/EnvCommand.ts";
import { isString } from "../core/Check.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";

// See https://docs.anthropic.com/en/api/messages

export interface Options {
  model: string;
  max_tokens: number;
}

export interface Message {
  role: string;
  content: string;
}

interface RequestData {
  model: string;
  messages: Message[];
  max_tokens: number;
}

const createRequestData = (options: Options, messages: Message[]) => (
  {
    model: options.model,
    messages: messages,
    max_tokens: options.max_tokens,
  }
)

function createRequestOptions(apiKey: string, requestData: RequestData) {
  return {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "x-api-key": `${apiKey}`,
      "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestData),
  };
}

// deno-lint-ignore no-explicit-any
async function send(options: Options, messages: Message[], apiKey: string) : Promise<any> {
  const requestData = createRequestData(options, messages);
  const requestOptions = createRequestOptions(apiKey, requestData);

  try {
      const apiUrl = "https://api.anthropic.com/v1/messages";
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();

      if (response.ok) {
          return data;
      } else {
          throw new Error(`Request failed with status ${response.status}`);
      }
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
}

const messages = (prompt: string, content: string) => (
  [
    {
      role: "user",
      content: isString(prompt) + "\n" + isString(content),
    },
  ]
);

const meta = {
  name: "claude",
  doc: "Ask Anthropic Claude",
  source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
  const model = "claude-3-opus-20240229";
  const max_tokens = 4096;
  const apiKey = await get(context, "ANTHROPIC_API_KEY");
  const prompt = isString(options.content);
  const input = isString(context.input.content);

  const result = await send(
    {model,max_tokens},
    messages(prompt, input),
    apiKey
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

export async function claude(context: CommandContext, prompt: string, content: string): Promise<CommandData> {
    const result = await invoke_with_input(context, 'claude', {format:'string', content: prompt}, {format:'string', content});
    return result.output
}