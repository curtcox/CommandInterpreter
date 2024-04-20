import { promised, TextCommand } from "../ToolsForCommandWriters.ts";

export const help_cmd: TextCommand = {
  name: "help",
  doc: "Displays info about available commands.",
  func: (_options: string, context) => {
    const commands = context.commands;
    return promised(
      Object.values(commands)
        .map((command) => `${command.name} : ${command.doc}`)
        .join("\n"),
    );
  },
};
