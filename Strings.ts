export function replace_all(command: string, replacements: Record<string, string>) : string {
  let result = command;

  for (const [key, value] of Object.entries(replacements)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedKey, "g");
    result = result.replace(regex, value);
  }

  return result;
}

export function head(text: string): string {
  if (text === undefined) {
    return "";
  }
  const words = text.split(/\s+/);
  if (!words.length) {
    return "";
  }
  return words[0].trim();
}

export function tail(text: string): string {
  const trimmed = text.trimStart();
  const index = trimmed.indexOf(" ");

  if (index !== -1) {
    return trimmed.substring(index + 1);
  } else {
    return "";
  }
}
