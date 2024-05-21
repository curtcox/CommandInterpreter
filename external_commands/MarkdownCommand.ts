import { CommandContext, CommandDefinition } from "../command/CommandDefinition.ts";
import { def_from_simple } from "../command/ToolsForCommandWriters.ts";

export async function markdown(url: string): Promise<string> {
  const encoded = encodeURIComponent(url);
  const server = "curtcox-markdown_download.web.val.run";
  const response = await fetch(`https://${server}/?url=${encoded}`);
  return await response.text();
}

export const command: CommandDefinition = def_from_simple({
  name: "markdown",
  doc: "return the contents of a specified URL as markdown.",
  source: import.meta.url,
  func: (_context: CommandContext, url: string) => markdown(url)
});
