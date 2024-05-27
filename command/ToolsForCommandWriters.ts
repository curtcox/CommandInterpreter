import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { CommandData } from "./CommandDefinition.ts";
import { CommandResult } from "./CommandDefinition.ts";
import { CommandError } from "./CommandDefinition.ts";
import { replace_all } from "../Strings.ts";
import { isString, check } from "../Check.ts";
import { CommandInvocation } from "./CommandDefinition.ts";

// A simplified version of CommandDefinition.
// Assume no command modification.
export interface SimpleCommand {
    name: string;
    doc: string;
    source: string;
    func: (context: CommandContext, options: string) => Promise<string>;
  }

export function command_with_replacements(context: CommandContext, original: string): string {
    const text = isString(original);
    const input = isString(context.input.content || "");
    const format = isString(context.input.format || "");
    const replacements = {
        "${input}": input,
        "${format}": format,
    };
    return replace_all(text, replacements);
}

export function string_for(x: unknown) {
   if (typeof x === 'string') return x;
   return JSON.stringify(x);
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
  const command = context.commands[name];
  const id = context.meta.id;
  const invocation: CommandInvocation = {id, command, options}
  if (!command) {
    const message = `Command not found: ${name} in ${Object.keys(context.commands)}`;
    throw new CommandError(message,context,invocation);
  }
  try {
    return await command.func(context, options);
  } catch (e) {
    const commandError = new CommandError(e.message,context,invocation);
    commandError.cause = e;
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

export type CommandCollection = CommandDefinition | CommandDefinition[] | Record<string, CommandDefinition>;

function add(a: Record<string, CommandDefinition>, b: CommandCollection) {
  if (Array.isArray(b)) {
    for (const cmd of b) {
      a[cmd.meta.name] = cmd;
    }
  } else if ('meta' in b) {
    const definition = b as CommandDefinition;
    a[definition.meta.name] = check(definition);
  } else {
    for (const name in b) {
      a[name] = b[name];
    }
  }
  return a;
}

// Return the combined commands of the two collections.
export function combine(...collections: CommandCollection[]) : Record<string, CommandDefinition> {
  const all: Record<string, CommandDefinition> = {}
  for (const a of check(collections)) {
    add(all, check(a));
  }
  return all;
}
