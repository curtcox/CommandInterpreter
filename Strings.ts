import { isString, nonEmpty } from "./Check.ts";

export function use_replacement(template: string, replacement: Record<string, string>) : string {
  const {key, value} = replacement;
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedKey, "g");
  return template.replace(regex, value);
}

export function use_replacements(template: string, replacements: Record<string, string>) : string {
  let result = template;

  for (const [key, value] of Object.entries(replacements)) {
    result = use_replacement(result, {key, value});
  }

  return result;
}

export const head = (text: string): string => before(" ", text);
export const tail = (text: string): string => after(" ", text);

export function before(divider: string, text: string): string {
  const trimmed = isString(text).trim();
  const index = trimmed.indexOf(nonEmpty(divider));

  if (index == -1) {
    return trimmed;
  } else {
    return trimmed.substring(0,index);
  }
}

export function after(divider: string, text: string): string {
  const trimmed = isString(text).trim();
  const index = trimmed.indexOf(nonEmpty(divider));

  if (index == -1) {
    return "";
  } else {
    return trimmed.substring(index + 1);
  }
}

export function words(text: string): string[] {
  return text.trim().split(/\s+/);
}