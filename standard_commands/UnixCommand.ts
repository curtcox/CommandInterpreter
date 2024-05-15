import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { aliases } from "./AliasesCommand.ts";

const meta: CommandMeta = {
    name: 'unix',
    doc: "For defining some common unix aliases.",
    source: import.meta.url,
}

const func = async (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    const words = ["awk", "sed", "tr", "curl", "say", "uniq", "head", "tail", "echo", "cat", "sort", "wc"];
    return await aliases(context, words.map(word => { return { name: word, expansion: `run ${word}` } } ) );
}

export const unix_cmd : CommandDefinition = {
    meta, func
};

export const unix = (context: CommandContext): Promise<CommandResult> => {
    return func(context, {
        format: "",
        content: ""
    });
}