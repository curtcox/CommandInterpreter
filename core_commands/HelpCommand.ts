import { promised, TextCommand } from "../ToolsForCommandWriters.ts";

export const help_cmd: TextCommand = {
  name: "help",
  doc: "Displays info about available commands.",
  func: (context, _options: string) => {
    const commands = context.commands;
    return promised(
      Object.values(commands)
        .map((command) => `${command.meta.name} : ${command.meta.doc}`)
        .join("\n"),
    );
  },
};
