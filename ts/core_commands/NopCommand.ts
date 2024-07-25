import { CommandDefinition, CommandContext, CommandData } from "../command/CommandDefinition.ts";

/**
 * Right now, this isn't completely information preserving and thus a bit of an op.
 */
export const nop_cmd: CommandDefinition = {
    meta: {
      name: "nop",
      doc: "",
      source: import.meta.url,
    },
    func: (context: CommandContext, _options: CommandData) => {
      return Promise.resolve({
        commands: context.commands,
        output: context.input
      });
    }
  };
