import { CommandDefinition, CommandMeta, CommandResult, CommandContext, CommandData } from "../CommandDefinition.ts";

const func = async (context: CommandContext, data: CommandData): Promise<CommandResult> => {
    const {url, options} = data.content;
    const result = await fetch(url, options);
    const json = await result.json();
    return Promise.resolve({
      commands: context.commands,
      output: {format: "application/json", content: json}
    });
}

const meta: CommandMeta = {
  name: "fetch",
  source: import.meta.url,
  doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
  input_formats: ["FetchOptions"],
  output_formats: ["JSON","Object"]
}

export interface FetchOptions {
  url: string;
  optons?: RequestInit;
}

export const fetch_cmd : CommandDefinition = {
  meta, func
};