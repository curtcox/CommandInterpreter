import { check, isString } from "../Check.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { CommandMeta } from "../command/CommandDefinition.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";
import { CommandInvocation } from "../command/CommandDefinition.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { IO } from "../command/CommandDefinition.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";

const meta: CommandMeta = {
  name: IO,
  doc: "Convert data to a different format.",
  source: import.meta.url,
}

// This would be a good place for extensive conversion logic.
// deno-lint-ignore no-explicit-any
function convert_to_target_input(content: any, target_source: string): string {
  if (typeof content === "string") {
      return content;
  }
  if (target_source.includes("SimpleCommand") && 'content' in content) {
      return content.content;
  }
  if ('output' in content) {
      return content.output;
  }
  return content;
}

const convert = async (_context: CommandContext, conversion: DataConversion): Promise<CommandData> => {
  const output = conversion.result.output;
  const format = output.format;
  const unconverted = output.content;
  const target_source = isString(await fetch_source(conversion.target.command.meta.source));
  const content = convert_to_target_input(unconverted, target_source);
  // console.log({convert, format, unconverted, target_source, content});
  return { format, content };
}


async function fetch_source(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return await response.text();
}

const func = async (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
  const conversion = check(context.input.content) as DataConversion;
  const commands = context.commands;
  const output = await convert(context, conversion);
  const result: CommandResult = { commands, output }
  return Promise.resolve(result);
}

export const io_cmd : CommandDefinition = {
  meta, func
};

export interface DataConversion {
  result: CommandResult, 
  source: CommandInvocation,
  target: CommandInvocation,
}

export const convert_data = (context:CommandContext, conversion: DataConversion): Promise<CommandResult> => {
  const options = { format: "", content: "" };
  return invoke_with_input(check(context), IO, options, {format: "Conversion", content: check(conversion)});
};