import { CommandContext } from "../CommandDefinition.ts";
import { TextCommand, head, tail } from "../ToolsForCommandWriters.ts";

function env(native: Native, code: string): string {
  const arg = head(code);
  const key = head(tail(code));
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

export const env_cmd = (native:Native): TextCommand => ({
  name: "env",
  doc: "Get, set, or supply an environment variables.",
  func: (_context: CommandContext, options: string) => Promise.resolve(env(native,options))
});

export interface Native {
  get: (key:string) => string;
  set: (key:string, value:string) => void;
} 