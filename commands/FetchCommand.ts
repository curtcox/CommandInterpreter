import { SimpleCommand, string_for } from "../ToolsForCommandWriters.ts";

export const fetch_cmd: SimpleCommand = {
  name: "fetch",
  input_format: "",
  output_format: "JSON",
  doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
  func: async (options, _context) => {
    const result = await fetch(options);
    const json = await result.json();
    return string_for(json);
  },
};