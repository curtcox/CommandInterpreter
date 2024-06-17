import { isString } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition, CommandMeta } from "../command/CommandDefinition.ts";
import { words } from "../Strings.ts";
import { HASH } from "../command/CommandDefinition.ts";
import { checkFormat } from "../Check.ts";
import { Hash } from "../Ref.ts";

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

export async function hash(value: string): Promise<Hash> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hash));
  const base64Hash = btoa(String.fromCharCode.apply(null, hashArray));
  return new Hash(base64Hash);
}

const meta: CommandMeta = {
  name: HASH,
  doc: "Converts between strings and objects.",
  source: import.meta.url,
}

export const hash_cmd:CommandDefinition = {
  meta,
  func: (context: CommandContext, options: CommandData) => Promise.resolve({
    commands: context.commands,
    output: hash_from_context(context,isString(options.content))
  })
};