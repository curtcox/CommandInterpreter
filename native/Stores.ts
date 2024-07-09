import { isString } from "../Check.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { Hash } from "../Ref.ts";
import { hash } from "../core_commands/HashCommand.ts";
import { Store } from "../native/Native.ts";

interface Snapshot {
  hash: Hash;
  json: string;
}

async function snapsot_of(hashes: Map<string, Hash>): Promise<Snapshot> {
  const entries = Object.fromEntries(hashes.entries());
  // console.log({entries});
  const json = JSON.stringify(entries);
  const hashed = await hash(json);
  return { hash: hashed, json };
}

export function memory(): Store {
  const memory: Map<string, string> = new Map();
  const hashes = new Map<string, Hash>();
  const save = async (key: string, value: string) => {
    memory.set(key,value);
    hashes.set(key, await hash(value));
    return value;
  }
  return {
         get:       (key: string)                => { return memory.get(key); },
         set: async (key: string, value: string) => { return await save(key,value); },
    snapshot: async ()                           => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      await save(name, snap.json);
      return snap.hash;
    }
  };
}

export function debug(): Store {
  const memory: Map<string, string> = new Map();
  const hashes = new Map<string, Hash>();
  const save = async (key: string, value: string) => {
    // console.log(`debug store set: ${key} = ${value}`);
    // console.log(new Error().stack);
    memory.set(key,value);
    hashes.set(key, await hash(value));
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
          console.log({key, memory});
       }
       return value;
    },
    set: async (key: string, value: string) => {
       return await save(key,value);
    },
    snapshot: async ()                => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      await save(name, snap.json);
      return snap.hash;
    }
  };
}

export function filesystem(base: string, extension: string): Store {
  isString(base);
  isString(extension);
  ensureDirSync(base);
  const hashes = new Map<string, Hash>();

  function path(key: string): string {
    return join(base, `${key}.${extension}`);
  }
  const save = async (key: string, value: string) => {
    Deno.mkdir(dirname(path(key)), { recursive: true});
    Deno.writeTextFileSync(path(key), value);
    hashes.set(key, await hash(value));
    return value;
  }

  return {
         get:       (key: string)     => { return Deno.readTextFileSync(path(key)); },
         set: async (key: string, value: string) => { return await save(key,value); },
    snapshot: async ()                => {
      const snap = await snapsot_of(hashes);
      const name = `hash/${filename_safe(snap.hash.value)}`;
      await save(name, snap.json);
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
