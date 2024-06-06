import { check, isString, nonEmpty } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandError, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { checkFormat } from "../Check.ts";

/**
 * Think filesystem. 
 */
function store(native: Native, context: CommandContext, code: string): string {
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
    const input = context.input;
    const data = checkFormat(input, "string");
    native.set(key,isString(data.content));
    return "";
  }
  throw `Invalid store command: ${arg}`;
}

function result_from_store(native: Native, context: CommandContext, code: string): CommandData {
  const value = store(native, context, code);
  return { format: "string", content: value };
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
  get: (key:string)               => string;
  set: (key:string, value:string) => void;
}

export function memory(): Native {
  const memory: Record<string, string> = {};
  return {
    get: (key: string)                => { return memory[key]; },
    set: (key: string, value: string) => { memory[key] = value; },
  };
}

export function filesystem(base: string, extension: string): Native {
  isString(base);
  isString(extension);
  ensureDirSync(base);

  function path(key: string): string {
    return join(base, `${key}.${extension}`);
  }

  return {
    get: (key: string) => {
      return Deno.readTextFileSync(path(key));
    },
    set: (key: string, value: string) => {
      Deno.mkdir(dirname(path(key)), { recursive: true});
      Deno.writeTextFileSync(path(key), value);
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
