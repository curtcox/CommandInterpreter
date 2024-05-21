import { check, isString, nonEmpty } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../command/CommandDefinition.ts";
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
  // console.log({code, arg, key});
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
  get: (key:string)                => unknown;
  set: (key:string, value:unknown) => void;
}

/**
 * Translates between strings and objects.
 */
export interface IO {
  read: (value:string) => unknown;
  write: (value:unknown) => string;
}

export function memory(): Native {
  const memory: Record<string, unknown> = {};
  return {
    get: (key: string)                 => { return memory[key]; },
    set: (key: string, value: unknown) => { memory[key] = value; },
  };
}

export function json_io(): IO {
  return {
    read: (value: string) => JSON.parse(value),
    write: (value: unknown) => JSON.stringify(value),
  };
}

export function filesystem(base: string, io: IO, extension: string): Native {
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
    set: (key: string, value: unknown) => {
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
