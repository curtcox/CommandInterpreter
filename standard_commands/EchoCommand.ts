import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { string_for } from "../command/ToolsForCommandWriters.ts";

const meta: CommandMeta = {
  name: 'echo',
  doc: "Show the info given to the command",
  source: import.meta.url,
}

const func = (context: CommandContext, options: CommandData): Promise<CommandResult> => {
  const format = "string";
  const content = string_for({ options, context });
  const output = { format, content };
  return Promise.resolve({
      commands: context.commands,
      output
  });
}

export const echo_cmd : CommandDefinition = {
  meta, func
};