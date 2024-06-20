import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { CommandData } from "./CommandDefinition.ts";
import { CommandResult } from "./CommandDefinition.ts";
import { CommandError } from "./CommandDefinition.ts";
import { use_replacements } from "../Strings.ts";
import { isString, check } from "../Check.ts";
import { CommandInvocation } from "./CommandDefinition.ts";
import { now_now } from "../Time.ts";
import { error } from "../core_commands/LogCommand.ts";
import { emptyData } from "./Empty.ts";
import { serialize } from "../core_commands/ObjCommand.ts";

// A simplified version of CommandDefinition.
// Assume no command modification.
export interface SimpleCommand {
    name: string;
    doc: string;
    source: string;
    func: (context: CommandContext, options: string) => Promise<string>;
  }

export function command_with_replacements(context: CommandContext, original: string): string {
    const text   = isString(original);
    const input  = isString(context.input.content || "");
    const format = isString(context.input.format || "");
    const replacements = new Map<string, string>(
      [
        ["${input}", input],
        ["${format}", format],
      ]
    )
    return use_replacements(text, replacements);
}

export function string_for(obj: any): string {
     if (typeof obj === 'string') return obj;
  return serialize(obj);
}

export function simple(stuff: unknown): Promise<string> {
   return Promise.resolve(string_for(stuff));
}

export function promised(text: string) {
   return Promise.resolve(text);
}

export function def_from_simple(command: SimpleCommand): CommandDefinition {
    return {
      meta: {
        name: command.name,
        doc: command.doc,
        source: command.source,
      },
      func: async (context: CommandContext, options: CommandData) => {
        const args = check(options).content;
        const result = await command.func(context,isString(args));
        return {
          commands: context.commands,
          output: {
            format: typeof result,
            content: result,
          },
        };
      },
    };
}

// Invoke the named command using the supplied context.
export const invoke = async (context: CommandContext, name: string, options: CommandData): Promise<CommandResult> => {
  // console.log({invoke, name, options});
  const start = now_now();
  const commands = context.commands;
  const command = commands.get(name);
  const id = context.meta.id;
  if (!command) {
    const keys = Array.from(commands.keys());
    const message = `Command not found: ${name} in ${keys}`;
    const duration = { start, end: now_now() };
    const command = { meta: { name, doc: "Missing command", source: "" }, func: (context: CommandContext, _options: CommandData) => (Promise.resolve({
      commands: context.commands,
      output: emptyData
    })) };
    const invocation: CommandInvocation = {id, command, options}
    const commandError = new CommandError(context,invocation,duration,message);
    await error(context, commandError);
    throw commandError;
  }
  const invocation: CommandInvocation = {id, command, options}
  try {
    return await command.func(context, options);
  } catch (e) {
    const duration = { start, end: now_now() };
    const commandError = new CommandError(context,invocation,duration,e.message);
    commandError.cause = e;
    await error(context, commandError);
    throw commandError;
  }
}

// Invoke the named command using the supplied input rather than the context input.
export const invoke_with_input = async (context: CommandContext, name: string, options: CommandData, input: CommandData): Promise<CommandResult> => {
    const meta = context.meta;
    const commands = context.commands;
    const with_input: CommandContext = { commands, meta, input };
    return await invoke(with_input, name, options);
}

export type CommandCollection = CommandDefinition | CommandDefinition[] | Map<string, CommandDefinition>;

function add(a: Map<string, CommandDefinition>, b: CommandCollection) {
  if (Array.isArray(b)) {
    for (const cmd of b) {
      a.set(cmd.meta.name,cmd);
    }
  } else if ('meta' in b) {
    const definition = b as CommandDefinition;
    a.set(definition.meta.name,check(definition));
  } else {
    const source = b as Map<string, CommandDefinition>;
    a = new Map([...a, ...source]);
  }
  return a;
}

// Return the combined commands of the two collections.
export function combine(...collections: CommandCollection[]) : Map<string, CommandDefinition> {
  let all: Map<string, CommandDefinition> = new Map();
  for (const a of check(collections)) {
    all = add(all, check(a));
  }
  return all;
}
