import { CommandContext } from "../command/CommandDefinition.ts";
import { SimpleCommand, simple } from "../command/ToolsForCommandWriters.ts";
import { command_with_replacements } from "../command/ToolsForCommandWriters.ts";
import { isString } from "../Check.ts";

function safeEval(context: CommandContext, code: string) {
  // console.log({code});
  return new Function('context', `with (context) { return ${code} }`)(context);
}

function unsafeEval(context: CommandContext, code: string) {
  // console.log({code});
  return eval(code);
}

function evaluate(context: CommandContext, code: string) {
  return simple(safeEval(context,command_with_replacements(context,code)));
}

export const eval_cmd: SimpleCommand = {
  name: "eval",
  doc: "Evaluate some code.",
  source: import.meta.url,
  func: (context: CommandContext, code: string) => evaluate(context, isString(code))
};
