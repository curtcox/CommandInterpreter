import { check, isString, nonEmpty } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandError, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { OBJ } from "../command/CommandDefinition.ts";
import { checkFormat } from "../Check.ts";

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

function result_from_obj(context: CommandContext, code: string): CommandData {
  const value = obj(context, code);
  return value as CommandData;
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
    output: result_from_obj(context,isString(options.content))
  })
};

function serialize(obj: any): string {
  return JSON.stringify(obj, (key, value) => replacer(key, value));
}

function deserialize(obj: string): any {
  return JSON.parse(isString(obj), (key, value) => reviver(key, value));
}

function replacer(_key: string, value: any): any {
  if (typeof value === 'function') {
    return value.toString();
  }
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

function reviver(key: string, value: any): any {
  if (typeof value === 'string' && value.startsWith('function') && value.trim()!=='function') {
    return eval(`(${nonEmpty(value)})`);
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
