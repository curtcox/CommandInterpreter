import { CommandContext } from "../CommandDefinition.ts";
import { simple, TextCommand } from "../ToolsForCommandWriters.ts";

function safeEval(context: CommandContext, code: string) {
  return new Function('context', `with (context) { return ${code} }`)(context);
}

export const eval_cmd: TextCommand = {
  name: "eval",
  doc: "Evaluate some code.",
  source: import.meta.url,
  func: (context: CommandContext, arg: string) => simple(safeEval(context,arg))
};