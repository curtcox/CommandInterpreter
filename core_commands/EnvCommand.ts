import { CommandContext } from "../command/CommandDefinition.ts";
import { SimpleCommand, invoke } from "../command/ToolsForCommandWriters.ts";
import { head, tail } from "../Strings.ts";
import { nonEmpty } from "../Check.ts";

function env(native: Native, code: string): string {
  const arg = nonEmpty(head(code));
  const key = nonEmpty(head(tail(code)));
  if (arg === "get") {
    return native.get(key);
  }
  if (arg === "set") {
    const value = head(tail(tail(code)));
    native.set(key,value);
    return "";
  }
  return `Invalid argument: ${arg}`;
}

export const env_cmd = (native:Native): SimpleCommand => ({
  name: "env",
  doc: "Get, set, or supply an environment variables.",
  source: import.meta.url,
  func: (_context: CommandContext, options: string) => Promise.resolve(env(native,options))
});

export const get = async (context: CommandContext, key: string) : Promise<string> => {
  const result = await invoke(context,"env", {format: "text", content:`get ${nonEmpty(key)}`});
  return await result.output.content;
};

export interface Native {
  get: (key:string) => string;
  set: (key:string, value:string) => void;
}

export function memory(): Native {
  const memory: Record<string, string> = {};
  return {
    get: (key: string)             => { return memory[key]; },
    set: (key: string, value: string) => { memory[key] = value; },
  };
}