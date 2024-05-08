import { simple, SimpleCommand } from "../ToolsForCommandWriters.ts";

export const echo_cmd: SimpleCommand = {
  name: "echo",
  doc: "show the info given to the command",
  source: import.meta.url,
  func: (options, context) => simple({ options, context }),
};
