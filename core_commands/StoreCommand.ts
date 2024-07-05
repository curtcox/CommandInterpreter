import { isString, nonEmpty } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { checkFormat } from "../Check.ts";
import { Hash } from "../Ref.ts";
import { hash } from "./HashCommand.ts";

/**
 * Think filesystem. 
 */
function store(native: Native, context: CommandContext, code: string): string | undefined {
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
    return native.set(key,isString(data.content));
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
  get: (key:string)               => string | undefined;
  set: (key:string, value:string) => string;
  snapshot: ()                    => Promise<Hash>;
}

interface Snapshot {
  hash: Hash;
  json: string;
}

async function snapsot_of(hashes: Map<string, Hash>): Promise<Snapshot> {
  const json = JSON.stringify(Object.fromEntries(hashes.entries()));
  const hashed = await hash(json);
  return { hash: hashed, json };
}

export function memory(): Native {
  const memory: Map<string, string> = new Map();
  const hashes = new Map<string, Hash>();
  const save = (key: string, value: string) => {
    memory.set(key,value);
    hashes.set(key, new Hash(value));
    return value;
  }
  return {
    get: (key: string)                => { return memory.get(key); },
    set: (key: string, value: string) => { return save(key,value); },
    snapshot: async ()                => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      save(name, snap.json);
      return snap.hash;
    }
  };
}

export function debug(): Native {
  const memory: Map<string, string> = new Map();
  const hashes = new Map<string, Hash>();
  const save = (key: string, value: string) => {
    // console.log(`debug store set: ${key} = ${value}`);
    // console.log(new Error().stack);
    memory.set(key,value);
    hashes.set(key, new Hash(value));
    return value;
  }
  return {
    get: (key: string)                => {
      //  console.log(`debug store get: ${key}`);
      //  console.log(new Error().stack);
       const value = memory.get(key);
       if (value === undefined) {
          console.log(`debug store get: ${key} not in ${memory}`);
          console.log(new Error().stack);
          // console.log({memory});
       }
       return value;
    },
    set: (key: string, value: string) => {
       return save(key,value);
    },
    snapshot: async ()                => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      save(name, snap.json);
      return snap.hash;
    }
  };
}

export function filesystem(base: string, extension: string): Native {
  isString(base);
  isString(extension);
  ensureDirSync(base);
  const hashes = new Map<string, Hash>();

  function path(key: string): string {
    return join(base, `${key}.${extension}`);
  }
  const save = (key: string, value: string) => {
    Deno.mkdir(dirname(path(key)), { recursive: true});
    Deno.writeTextFileSync(path(key), value);
    hashes.set(key, new Hash(value));
    return value;
  }

  return {
    get: (key: string) => {
      return Deno.readTextFileSync(path(key));
    },
    set: (key: string, value: string) => { return save(key,value); },
    snapshot: async ()                => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      save(name, snap.json);
      return snap.hash;
    }
  };
}

// Convenience function for setting a store value.
export const set = (context: CommandContext, name: string, content: string): void => {
  isString(name);
  isString(content);
  invoke_with_input(context, STORE, { format: "string", content: `set ${name}`}, {format: "string", content});
};

// Convenience function for getting a store value.
export const get = async (context: CommandContext, name: string): Promise<string> => {
  isString(name);
  const result = await invoke(context, STORE, { format: "string", content: `get ${name}`});
  return await result.output.content as string;
};

export const filename_safe = (input: string): string => input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
