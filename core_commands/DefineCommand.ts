import { CommandDefinition, CommandContext, CommandData } from "../CommandDefinition.ts";

export const define_cmd: CommandDefinition = {
    meta: {
        name: "define",
        doc: "define a word",
        args: [],
        input_formats: ["text"],
        output_formats: ["text"],
    },
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
