import { simple, SimpleCommand } from "../command/ToolsForCommandWriters.ts";
import { CommandContext } from "../command/CommandDefinition.ts";

export const echo_cmd: SimpleCommand = {
  name: "echo",
  doc: "show the info given to the command",
  source: import.meta.url,
  func: (context:CommandContext, options:string) => simple({ options, context }),
};
