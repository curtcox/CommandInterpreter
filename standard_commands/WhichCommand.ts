import { simple, SimpleCommand } from "../ToolsForCommandWriters.ts";

export const which_cmd: SimpleCommand = {
  name: "which",
  doc: "which {command} you want info about",
  source: import.meta.url,
  func: (context,options) => simple(context.commands[options]),
};