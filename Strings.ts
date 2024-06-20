import { isString, nonEmpty } from "./Check.ts";

export interface Replacement {
  key: string;
  value: string;
}

export function use_replacement(template: string, replacement: Replacement) : string {
  const {key, value} = replacement;
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedKey, "g");
  return template.replace(regex, value);
}

export function use_replacements(template: string, replacements: Map<string, string>) : string {
  let result = template;

  for (const key of replacements.keys()) {
    const value = replacements.get(key) || "";
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

export function dump(obj: any) {
  console.log("------------------------");
  console.log("Object Value:", obj);

  const typeOfResult = typeof obj;
  const instanceofResult = obj?.constructor ? obj.constructor.name : "N/A";

  console.log("typeof:", typeOfResult);
  console.log("instanceof:", instanceofResult);

  if (typeOfResult === "object" && obj !== null) {
    const keys = Object.keys(obj);
    console.log("Keys:", keys);

    for (const key of keys) {
      const value = obj[key];
      console.log(`  ${key}:`, value);
    }
  }

  console.log("------------------------");
}
