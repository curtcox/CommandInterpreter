import { check, isString, nonEmpty } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandError, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { STORE } from "../command/CommandDefinition.ts";

/**
 * Think filesystem. 
 */
function store(native: Native, context: CommandContext, code: string): unknown {
  const trimmed = nonEmpty(code).trim();
  const parts = words(trimmed);
  if (parts.length < 2 || parts.length > 3) {
    throw `Invalid store command: ${trimmed}`;
  }
  const arg = parts[0];
  const key = parts[1];
  // console.log({store, code, arg, key});
  if (arg === "get") {
    return native.get(key);
  }
  if (arg === "set") {
    native.set(key,context.input);
    return "";
  }
  throw `Invalid store command: ${arg}`;
}

function result_from_store(native: Native, context: CommandContext, code: string): CommandData {
  const value = store(native, context, code);
  return value as CommandData;
}

const meta: CommandMeta = {
  name: "store",
  doc: "Store and retrieve values.",
  source: import.meta.url,
}

export const store_cmd = (native:Native): CommandDefinition => ({
  meta,
  func: (context: CommandContext, options: CommandData) => Promise.resolve({
    commands: context.commands,
    output: result_from_store(native,context,isString(options.content))
  })
});

export interface Native {
  get: (key:string)                    => CommandData;
  set: (key:string, value:CommandData) => void;
}

/**
 * Translates between strings and objects.
 */
export interface Codec {
  read: (value:string) => CommandData;
  write: (value:CommandData) => string;
}

export function memory(): Native {
  const memory: Record<string, CommandData> = {};
  return {
    get: (key: string)                     => { return memory[key]; },
    set: (key: string, value: CommandData) => { memory[key] = value; },
  };
}

export function json_io(): Codec {
  return {
    read: (value: string): CommandData => deserialize(value),
    write: (value: CommandData) => serialize(value),
  };
}

function serialize(obj: any): string {
  return JSON.stringify(obj, (key, value) => replacer(key, value));
}

function deserialize(obj: string): any {
  return JSON.parse(obj, (key, value) => reviver(key, value));
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

function reviver(_key: string, value: any): any {
  if (typeof value === 'string' && value.startsWith('function')) {
    return eval(`(${value})`);
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

export function filesystem(base: string, io: Codec, extension: string): Native {
  isString(base);
  check(io);
  isString(extension);
  ensureDirSync(base);

  function path(key: string): string {
    return join(base, `${key}.${extension}`);
  }

  return {
    get: (key: string) => {
      return io.read(Deno.readTextFileSync(path(key)));
    },
    set: (key: string, value: CommandData) => {
      Deno.mkdir(dirname(path(key)), { recursive: true});
      Deno.writeTextFileSync(path(key), io.write(value));
    },
  };
}

// Convenience function for setting a store value.
export const set = (context: CommandContext, name: string, data: CommandData): void => {
  isString(name);
  check(data);
  invoke_with_input(context, STORE, { format: "string", content: `set ${name}`}, data);
};

// Convenience function for getting a store value.
export const get = async (context: CommandContext, name: string): Promise<CommandData> => {
  isString(name);
  const result = await invoke(context, STORE, { format: "string", content: `get ${name}`});
  return result.output;
};
