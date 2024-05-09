import { simple, SimpleCommand } from "../command/ToolsForCommandWriters.ts";

export const io_cmd: SimpleCommand = {
  name: "io",
  doc: "Read from input and write to output",
  source: import.meta.url,
  func: (context, _options) => simple(context.input.content),
};
