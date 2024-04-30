import { CommandDefinition, CommandContext, CommandData } from "../CommandDefinition.ts";

const meta = {
    name: "define",
    doc: "define a command",
    source: import.meta.url,
    input_formats: ["text"],
    output_formats: ["text"],
};

export const define_cmd: CommandDefinition = {
    meta,
    func: async (context: CommandContext, _options: CommandData) => {
        return Promise.resolve({
             commands: context.commands,
             output: {
                 format: "text",
                 content: "defined"
             }
            }
        );
    },
};
