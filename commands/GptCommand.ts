import { CommandContext, CommandDefinition, CommandData } from "../CommandDefinition.ts";
import { get } from "../core_commands/EnvCommand.ts";

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
    model: "gpt-4-turbo-preview",
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
    content: prompt + "\n" + content,
  },
];

const meta = {
  name: "gpt",
  doc: "ask OpenAI ChatGPT",
  source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
  const apiKey = await get(context, "OPENAI_API_KEY");
  const result = await send(messages(options.content,context.input.content),apiKey);

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