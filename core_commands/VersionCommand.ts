import { promised, TextCommand } from "../ToolsForCommandWriters.ts";

export const version_cmd: TextCommand = {
  name: "version",
  doc: "version info",
  func: (_arg, _context) => promised("0.0.7"),
};

