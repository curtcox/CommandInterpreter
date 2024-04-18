import { CommandContext, CommandDefinition } from "./CommandDefinition.ts";

// A simplified version of CommandDefinition.
// Assume no format choices and no command modification.
export interface SimpleCommand {
    name: string;
    doc: string;
    input_format: string;
    output_format: string;
    func: (options: string, context: CommandContext) => Promise<string>;
  }

// A simplified version of SimpleCommand. Assume text IO.
export interface TextCommand {
    name: string;
    doc: string;
    func: (options: string, context: CommandContext) => Promise<string>;
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
    return words[0].toLowerCase().trim();
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
      name: command.name,
      doc: command.doc,
      input_formats: [command.input_format],
      output_formats: [command.output_format],
      func: async (options: string, context: CommandContext) => {
        const result = await command.func(options, context);
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
      input_format: "text",
      output_format: "text",
      func: command.func,
    };
    return def_from_simple(simple);
}