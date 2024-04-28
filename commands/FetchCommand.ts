// import { SimpleCommand, string_for } from "../ToolsForCommandWriters.ts";
import { CommandDefinition, CommandMeta, CommandResult, CommandContext, CommandData } from "../CommandDefinition.ts";

// export const fetch_cmd: SimpleCommand = {
//   name: "fetch",
//   input_format: "",
//   output_format: "application/json",
//   doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
//   func: async (_context, url ,options) => {
//     const result = await fetch(url, options);
//     const json = await result.json();
//     return string_for(json);
//   },
// };

const func = async (context: CommandContext, data: CommandData): Promise<CommandResult> => {
    const url = data.content.url;
    const options = data.content.options;
    const result = await fetch(url, options);
    const json = await result.json();
    return Promise.resolve({
      commands: context.commands,
      output: {format: "application/json", content: json}
    });
}

const meta: CommandMeta = {
  name: "fetch",
  doc: "fetch from a given URL like say https://api64.ipify.org?format=json",
  args:[],
  input_formats: ["CommandRecord"],
  output_formats: ["any"]
}

export const fetch_cmd : CommandDefinition = {
  meta, func
};