import { promised, TextCommand } from "../ToolsForCommandWriters.ts";

export const version_cmd: TextCommand = {
  name: "version",
  doc: "version info",
  source: import.meta.url,
  func: (_arg, _context) => promised("0.0.7"),
};

