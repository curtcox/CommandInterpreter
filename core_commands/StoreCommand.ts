import { check } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../CommandDefinition.ts";
import { head, tail } from "../ToolsForCommandWriters.ts";
import { ensureDirSync } from "https://deno.land/std/fs/mod.ts";
import { join, dirname } from "https://deno.land/std/path/mod.ts";

function store(native: Native, context: CommandContext, code: string): any {
  const arg = check(head(code));
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
  source: import.meta.url,
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

export interface IO {
  read: (value:string) => any;
  write: (value:any) => string;
}

export function memory(): Native {
  const memory: Record<string, any> = {};
  return {
    get: (key: string)             => { return memory[key]; },
    set: (key: string, value: any) => { memory[key] = value; },
  };
}

export function json_io(): IO {
  return {
    read: (value: string) => JSON.parse(value),
    write: (value: any) => JSON.stringify(value),
  };
}

export function filesystem(base: string, io: IO, extension: string): Native {
  check(base);
  check(io);
  check(extension);
  ensureDirSync(base);

  function path(key: string): string {
    return join(base, `${key}.${extension}`);
  }

  return {
    get: (key: string) => {
      return io.read(Deno.readTextFileSync(path(key)));
    },
    set: (key: string, value: any) => {
      Deno.mkdir(dirname(path(key)), { recursive: true});
      Deno.writeTextFileSync(path(key), io.write(value));
    },
  };
}