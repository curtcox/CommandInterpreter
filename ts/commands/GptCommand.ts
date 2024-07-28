import { CommandContext, CommandDefinition, CommandData } from "../command/CommandDefinition.ts";
import { get } from "../core_commands/EnvCommand.ts";
import { isString } from "../core/Check.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";

export interface Message {
  role: string;
  content: string;
}

interface RequestData {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

function createRequestData(messages: Message[]) : RequestData {
  return {
    model: "gpt-4o-2024-05-13",
    messages: messages,
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
}

function createRequestOptions(apiKey: string, requestData: RequestData) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestData),
  };
}

export async function send(messages: Message[], apiKey: string) {
  const requestData = createRequestData(messages);
  const requestOptions = createRequestOptions(apiKey, requestData);

  try {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
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

const messages = (prompt: string, content: string) => [
  {
    role: "user",
    content: isString(prompt) + "\n" + isString(content),
  },
];

const meta = {
  name: "gpt",
  doc: "ask OpenAI ChatGPT",
  source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
  const apiKey = await get(context, "OPENAI_API_KEY");
  const prompt = isString(options.content);
  const input = isString(context.input.content);
  const result = await send(messages(prompt,input),apiKey);

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

export async function gpt(context: CommandContext, prompt: string, content: string): Promise<CommandData> {
  const result = await invoke_with_input(context, 'gpt', {format:'string', content: prompt}, {format:'string', content});
  return result.output
}