import { CommandContext } from "../command/CommandDefinition.ts";
import { SimpleCommand, invoke } from "../command/ToolsForCommandWriters.ts";
import { nonEmpty,isString } from "../Check.ts";
import { words } from "../Strings.ts";

function env(native: Native, code: string): string {
  const trimmed = nonEmpty(code).trim();
  const parts = words(trimmed);
  if (parts.length < 2 || parts.length > 3) {
    throw `Invalid env command: ${trimmed}`;
  }
  const arg = parts[0];
  const key = parts[1];
  // console.log({code, arg, key});
  if (arg === "get") {
    return native.get(key);
  }
  if (arg === "set") {
    const value = parts[2];
    native.set(key,value);
    return "";
  }
  throw `Invalid env command: ${trimmed}`;
}

export const env_cmd = (native:Native): SimpleCommand => ({
  name: "env",
  doc: "Get, set, or supply an environment variables.",
  source: import.meta.url,
  func: (_context: CommandContext, options: string) => Promise.resolve(env(native,options))
});

export const get = async (context: CommandContext, key: string) : Promise<string> => {
  const result = await invoke(context,"env", {format: "text", content:`get ${nonEmpty(key)}`});
  const value = await result.output.content;
  return isString(value);
};

export const set = (context: CommandContext, key: string, value: string): void => {
  invoke(context,"env", {format: "text", content:`set ${nonEmpty(key)} ${isString(value)}`});
};


export interface Native {
  get: (key:string) => string;
  set: (key:string, value:string) => void;
}

export function memory(): Native {
  const memory: Map<string, string> = new Map();
  return {
    get: (key: string)                => { return memory.get(key) || ""; },
    set: (key: string, value: string) => { memory.set(key,value); },
  };
}