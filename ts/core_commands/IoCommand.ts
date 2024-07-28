import { check, isString } from "../core/Check.ts";
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

function simple_command(target_source_code: string): boolean {
  return target_source_code.includes('SimpleCommand');
}

// This would be a good place for extensive conversion logic.
// Asking an LLM an caching the output is an obvious choice.
// deno-lint-ignore no-explicit-any
function convert_to_target_input(format: string, content: any, target: CommandDefinition, target_source_code: string): CommandData {
  if (target.meta.name === 'nop') {
    return {format, content};
  }
  if (typeof content === 'string' && content.startsWith('http')) {
    return {format:'URL', content: new URL(content)};
  }
  if (typeof content === 'string') {
      return {format, content};
  }
  if (simple_command(target_source_code) && 'content' in content) {
      return {format: content.format, content: content.content};
  }
  if ('output' in content) {
      return {format, content: content.output};
  }
  return {format, content};
}

const convert = async (conversion: DataConversion): Promise<CommandData> => {
  const output = conversion.result.output;
  const {format, content } = output;
  const target = conversion.target.command;
  const target_source = isString(await fetch_source(target.meta.source));
  const converted = convert_to_target_input(isString(format), content, target, target_source);
  // console.log({ convert, format, content, converted, target_source });
  return converted;
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
  const output = await convert(conversion);
  const result: CommandResult = { commands, output }
  return Promise.resolve(result);
}

export const io_cmd : CommandDefinition = {
  meta, func
};

export interface DataConversion {
  result: CommandResult, // The result of the source command might need to be converted
  source: CommandInvocation, // Where the data comes from
  target: CommandInvocation, // Where the data goes to
}

export const convert_data = (context:CommandContext, conversion: DataConversion): Promise<CommandResult> => {
  const options = { format: "", content: "" };
  return invoke_with_input(check(context), IO, options, {format: "Conversion", content: check(conversion)});
};