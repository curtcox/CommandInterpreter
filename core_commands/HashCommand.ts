import { isString } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { HASH } from "../command/CommandDefinition.ts";
import { checkFormat } from "../Check.ts";
import { hash } from "../Ref.ts";

/**
 * For creating a hash of a string.
 */
function hash_from_context(context: CommandContext, code: string): CommandData {
  const trimmed = isString(code).trim();
  const parts = words(trimmed);
  if (parts.length == 0) {
    throw `Invalid hash command: ${trimmed}`;
  }
  checkFormat(context.input, "string");
  return { format: "string", content: hash(isString(context.input.content)) };
}

const meta: CommandMeta = {
  name: HASH,
  doc: "Create a hash of a string.",
  source: import.meta.url,
}

export const hash_cmd:CommandDefinition = {
  meta,
  func: (context: CommandContext, options: CommandData) => Promise.resolve({
    commands: context.commands,
    output: hash_from_context(context,isString(options.content))
  })
};