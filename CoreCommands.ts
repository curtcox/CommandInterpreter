import { CommandDefinition, CommandContext } from "./CommandDefinition.ts";
import { def_from_text, simple, promised, TextCommand } from "./ToolsForCommandWriters.ts";

function safeEval(code: string, context: CommandContext) {
  return new Function('context', `with (context) { return ${code} }`)(context);
}

export const evalCommand: TextCommand = {
  name: "eval",
  doc: "Evaluate some code.",
  func: (arg, context: CommandContext) => simple(safeEval(arg,context))
};

const versionCommand: TextCommand = {
  name: "version",
  doc: "version info",
  func: (_arg, _context) => promised("0.0.7"),
};

const echoCommand: TextCommand = {
  name: "echo",
  doc: "show the info given to the command",
  func: (options, context) => simple({ options, context }),
};

const whichCommand: TextCommand = {
  name: "which",
  doc: "which {command} you want info about",
  func: (options, context) => simple(context.commands[options]),
};

const helpCommand: TextCommand = {
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

export const help = def_from_text(helpCommand);

const text_commands = [
  evalCommand,
  versionCommand,
  echoCommand,
  whichCommand,
].map((cmd) => def_from_text(cmd));

export const commands: Record<string, CommandDefinition> = Object.fromEntries(
  [...text_commands, help].map((cmd) => [cmd.name, cmd]),
);