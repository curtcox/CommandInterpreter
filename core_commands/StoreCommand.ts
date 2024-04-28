import { check } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../CommandDefinition.ts";
import { head, tail } from "../ToolsForCommandWriters.ts";

function store(native: Native, context: CommandContext, code: string): any {
  const arg = head(code);
  const key = head(tail(code));
  if (arg === "get") {
    return native.get(key);
  }
  if (arg === "set") {
    native.set(key,context.input);
    return "";
  }
  return `Invalid argument: ${arg}`;
}

const meta: CommandMeta = {
  name: "store",
  doc: "Store and retrieve values.",
  args:[],
  input_formats: ["any"],
  output_formats: ["any"]
}

export const store_cmd = (native:Native): CommandDefinition => ({
  meta,
  func: (context: CommandContext, options: CommandData) => Promise.resolve({
    commands: context.commands,
    output: store(native,context,check(options.content))
  })
});

export interface Native {
  get: (key:string) => any;
  set: (key:string, value:any) => void;
}

export function memory(): Native {
  const memory: Record<string, any> = {};
  return {
    get: (key: string) => {
      // console.log({key, memory});
      return memory[key];
    },
    set: (key: string, value: any) => {
      // console.log({key, value, memory});
      memory[key] = value;
    },
  };
}
