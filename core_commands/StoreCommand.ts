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

function read_CommandData(value: string): CommandData {
  const parsed = JSON.parse(value);
  if (parsed.format === "CommandError") {
    const { name, context, id, command, options, duration, message, stack, cause } = parsed;
    if (name === undefined) {
      return parsed;
    }
    const invocation = {id, command, options};
    const newed = new CommandError(context, invocation, duration, message);
    newed.stack = stack;
    newed.cause = cause;
    return {format:"CommandError", content:newed};
  }
  return parsed;
}

function write_CommandData(value: CommandData): string {
  const { format, content } = value;
  if (format === "CommandError") {
    const { name, context, id, command, options, duration, message, stack, cause } = content as CommandError;
    return JSON.stringify({ format, name, context, id, command, options, duration, message, stack, cause });
  }
  return JSON.stringify(value);
}

export function json_io(): Codec {
  return {
    read: (value: string): CommandData => read_CommandData(value),
    write: (value: CommandData) => write_CommandData(value),
  };
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
