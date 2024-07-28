import { check, isString, nonEmpty } from "../core/Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandError, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../core/Strings.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { OBJ } from "../command/CommandDefinition.ts";
import { Hash } from "../core/Ref.ts";
import { checkFormat } from "../core/Check.ts";
import { dump } from '../core/Strings.ts';

/**
 * For converting between strings and objects. 
 */
function obj(context: CommandContext, code: string): CommandData {
  const trimmed = nonEmpty(code).trim();
  const parts = words(trimmed);
  if (parts.length != 1) {
    throw `Invalid obj command: ${trimmed}`;
  }
  const arg = parts[0];
  if (arg === "read") {
    checkFormat(context.input, "string");
    return deserialize(isString(context.input.content));
  }
  if (arg === "write") {
    return { format:"string", content:serialize(context.input) };
  }
  throw `Invalid obj command: ${arg}`;
}

const meta: CommandMeta = {
  name: OBJ,
  doc: "Converts between strings and objects.",
  source: import.meta.url,
}

export const obj_cmd:CommandDefinition = {
  meta,
  func: (context: CommandContext, options: CommandData) => Promise.resolve({
    commands: context.commands,
    output: obj(context,isString(options.content))
  })
};

export function serialize(obj: any): string {
  return JSON.stringify(obj, (key, value) => replacer(key, value));
}

export function deserialize(obj: string): any {
  return JSON.parse(isString(obj), (key, value) => reviver(key, value));
}

function replacer(_key: string, value: any): any {
  if (value instanceof Hash)       return { __type: 'Hash',     value: value.value };
  if (value instanceof Map)        return { __type: 'Map',      value: Array.from(value.entries()) };
  if (typeof value === 'function') return { __type: 'Function', value: value.toString() };
  if (value instanceof CommandError) {
    return {
      __type: 'CommandError',
      message: value.message,
      stack: value.stack,
      ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'message' && key !== 'stack')),
    };
  }
  return value;
}

/**
 * The pattern being developed here requires a growing amount of special casing.
 * Moreover, it isn't obvious to the user how and when to add new special cases.
 */

function reviver(key: string, value: any): any {
  if (typeof value === 'object' && value !== null) {
     if (value.__type === 'Hash')     return new Hash(value.value);
     if (value.__type === 'Map')      return new Map(value.value);
     if (value.__type === 'Function') return eval(`(${nonEmpty(value.value)})`);
  }
  if (value && value.__type === 'CommandError') {
    const { id, context, command, options, duration, message } = value;
    const invocation = {id, command, options};
    const error = new CommandError(context, invocation, duration, message);
    Object.assign(error, value);
    return error;
  }
  return value;
}

// Convenience function for converting an object to a string.
export const string = async (context: CommandContext, data: CommandData): Promise<string> => {
  const result = await invoke_with_input(context, OBJ, { format: 'string', content: 'write'}, check(data));
  return Promise.resolve(isString(result.output.content));
};

// Convenience function for for converting a string to an object.
export const object = async (context: CommandContext, data: string): Promise<CommandData> => {
  const input = { format: 'string', content: isString(data) };
  const result = await invoke_with_input(context, OBJ, { format: 'string', content: 'read'}, input);
  return Promise.resolve(result.output);
};
