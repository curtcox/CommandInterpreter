import { CommandContext, CommandDefinition, CommandData } from "./CommandDefinition.ts";

// A simplified version of CommandDefinition.
// Assume no command modification.
export interface SimpleCommand {
    name: string;
    doc: string;
    source: string;
    func: (context: CommandContext, options: string) => Promise<string>;
  }

export function string_for(x: any) {
   return JSON.stringify(x);
}

export function simple(stuff: any) {
   return Promise.resolve(string_for(stuff));
}

export function promised(text: string) {
   return Promise.resolve(text);
}

export function head(text: string): string {
    if (text === undefined) {
      return "";
    }
    const words = text.split(/\s+/);
    if (!words.length) {
      return "";
    }
    return words[0].trim();
}

export function tail(text: string): string {
    const trimmed = text.trimStart();
    const index = trimmed.indexOf(" ");

    if (index !== -1) {
      return trimmed.substring(index + 1);
    } else {
      return "";
    }
}

export function def_from_simple(command: SimpleCommand): CommandDefinition {
    return {
      meta: {
        name: command.name,
        doc: command.doc,
        source: command.source,
      },
      func: async (context: CommandContext, data: CommandData) => {
        const options = data.content;
        const result = await command.func(context,options);
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

// Return a new set of commands with the new command added.
// Replaces any existing command with the same name.
export function use(command: CommandDefinition, commands: Record<string, CommandDefinition>) : Record<string, CommandDefinition> {
    return {
      ...commands,
      [command.meta.name]: command,
    };
}

// Invoke the named command using the supplied context.
export const invoke = async (context: CommandContext, name: string, options: CommandData) => {
  const command = context.commands[name];
  if (!command) {
    throw new Error(`Command not found: ${name} in ${Object.keys(context.commands)}`);
  }
  return await command.func(context, options);
}

// Invoke the named command using the supplied input rather than the context input.
export const invoke_with_input = async (context: CommandContext, name: string, options: CommandData, input: CommandData) => {
    const with_input: CommandContext = { commands: context.commands, previous: context.previous, input };
    return await invoke(with_input, name, options);
}