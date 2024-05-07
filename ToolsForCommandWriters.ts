import { CommandContext, CommandDefinition, CommandData } from "./CommandDefinition.ts";

// A simplified version of CommandDefinition.
// Assume no format choices and no command modification.
export interface SimpleCommand {
    name: string;
    doc: string;
    source: string;
    input_format: string;
    output_format: string;
    func: (context: CommandContext, options: string) => Promise<string>;
  }

// A simplified version of SimpleCommand. Assume text IO.
export interface TextCommand {
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
        input_formats: [command.input_format],
        output_formats: [command.output_format],
      },
      func: async (context: CommandContext, data: CommandData) => {
        const options = data.content;
        const result = await command.func(context,options);
        return {
          commands: context.commands,
          output: {
            format: command.output_format,
            content: result,
          },
        };
      },
    };
}

export function def_from_text(command: TextCommand): CommandDefinition {
    const simple = {
      name: command.name,
      doc: command.doc,
      source: command.source,
      input_format: "text",
      output_format: "text",
      func: command.func,
    };
    return def_from_simple(simple);
}

// Return a new set of commands with the new command added.
// Replaces any existing command with the same name.
export function use(command: CommandDefinition, commands: Record<string, CommandDefinition>) : Record<string, CommandDefinition> {
    return {
      ...commands,
      [command.meta.name]: command,
    };
}

// Invoke the named command using the supplied input rather than the context input.
export const invoke_command = async (context: CommandContext, name: string, data: CommandData, input: CommandData) => {
    const command = context.commands[name];
    if (!command) {
      throw new Error(`Command not found: ${name} in ${Object.keys(context.commands)}`);
    }
    const with_input: CommandContext = { commands: context.commands, previous: context.previous, input };
    return await command.func(with_input, data);
}