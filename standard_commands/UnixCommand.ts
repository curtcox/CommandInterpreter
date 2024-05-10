import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { use } from "../command/ToolsForCommandWriters.ts";
import { alias } from "./AliasCommand.ts";

const meta: CommandMeta = {
    name: 'unix',
    doc: "For defining some common unix aliases.",
    source: import.meta.url,
}

const func = async (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    let commands = context.commands;
    let ctx = context;
    for (const word of ["awk", "sed", "tr", "curl", "say", "uniq", "head", "tail", "echo", "cat", "sort", "wc"]) {
        const result = await alias(ctx,word,`run ${word}`);
        const command = result.commands[word];
        commands = use(command,commands);
        ctx = {
            ...ctx,
            commands: commands
        }
    }
    return Promise.resolve({
        commands: commands,
        output: context.input
    });
}

export const unix_cmd : CommandDefinition = {
    meta, func
};

export const unix = (context: CommandContext): Promise<CommandResult> => {
    const options = {
        format: "",
        content: ""
    }
    return func(context, options);
}