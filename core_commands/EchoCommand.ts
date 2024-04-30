import { simple, TextCommand } from "../ToolsForCommandWriters.ts";

export const echo_cmd: TextCommand = {
  name: "echo",
  doc: "show the info given to the command",
  source: import.meta.url,
  func: (options, context) => simple({ options, context }),
};
