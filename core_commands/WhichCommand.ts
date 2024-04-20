import { simple, TextCommand } from "../ToolsForCommandWriters.ts";

export const which_cmd: TextCommand = {
  name: "which",
  doc: "which {command} you want info about",
  func: (options, context) => simple(context.commands[options]),
};