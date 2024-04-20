import { CommandContext } from "../CommandDefinition.ts";
import { simple, TextCommand } from "../ToolsForCommandWriters.ts";

function safeEval(code: string, context: CommandContext) {
  return new Function('context', `with (context) { return ${code} }`)(context);
}

export const eval_cmd: TextCommand = {
  name: "eval",
  doc: "Evaluate some code.",
  func: (arg, context: CommandContext) => simple(safeEval(arg,context))
};