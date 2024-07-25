import { CommandDefinition, CommandMeta, CommandResult, CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { check } from "../Check.ts";

function as_fetch_options(data: CommandData): FetchOptions {
  const options = data.content as FetchOptions;
  return check(options);
}

const func = async (context: CommandContext, data: CommandData): Promise<CommandResult> => {
    const options = as_fetch_options(data);
    const response: Response = await fetch(options.url, options.optons);
    const json = await response.json();
    return Promise.resolve({
      commands: context.commands,
      output: {format: "application/json", content: json}
    });
}

const meta: CommandMeta = {
  name: "fetch",
  source: import.meta.url,
  doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
}

export interface FetchOptions {
  url: string;
  optons?: RequestInit;
}

export const fetch_cmd : CommandDefinition = {
  meta, func
};