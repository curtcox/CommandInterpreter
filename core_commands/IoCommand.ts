import { simple, TextCommand } from "../ToolsForCommandWriters.ts";

export const io_cmd: TextCommand = {
  name: "io",
  doc: "Read from input and write to output",
  func: (context, _options) => simple(context.input.content),
};
