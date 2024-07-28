import { isString, nonEmpty } from "../core/Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../core/Strings.ts";
import { invoke, invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { STORE } from "../command/CommandDefinition.ts";
import { checkFormat } from "../core/Check.ts";
import { Store } from "../native/Native.ts";

/**
 * Think filesystem. 
 */
async function store(native: Store, context: CommandContext, code: string): Promise<string | undefined> {
  const trimmed = nonEmpty(code).trim();
  const parts = words(trimmed);
  if (parts.length < 2 || parts.length > 3) {
    throw `Invalid store command: ${trimmed}`;
  }
  const arg = parts[0];
  const key = parts[1];
  // console.log({store, code, arg, key});
  if (arg === "get") {
    const value = native.get(key);
    if (value === undefined) {
      return undefined;
    } else {
      return value;
    }
  }
  if (arg === "set") {
    const input = context.input;
    const data = checkFormat(input, "string");
    return await native.set(key,isString(data.content));
  }
  throw `Invalid store command: ${arg}`;
}

async function result_from_store(native: Store, context: CommandContext, code: string): Promise<CommandData> {
  const value = await store(native, context, code);
  return { format: "string", content: value };
}

const meta: CommandMeta = {
  name: "store",
  doc: "Store and retrieve values.",
  source: import.meta.url,
}

export const store_cmd = (native:Store): CommandDefinition => ({
  meta,
  func: async (context: CommandContext, options: CommandData) => ({
    commands: context.commands,
    output: await result_from_store(native,context,isString(options.content))
  })
});

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