import { promised, SimpleCommand } from "../command/ToolsForCommandWriters.ts";

export const help_cmd: SimpleCommand = {
  
  name: "help",
  doc: "Displays info about available commands.",
  source: import.meta.url,

  func: (context, options: string) => {
    const commands = context.commands;
    const docs = Array.from(commands.values(), (command) => `${command.meta.name} : ${command.meta.doc}`);
    const help_text = `${options} 
    Available commands:
    ${docs.join("\n")}
    `;
    return promised(help_text);
  },
};
