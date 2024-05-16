import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";
import { alias, Alias } from "./AliasCommand.ts";
import { check } from "../Check.ts";
import { head, tail } from "../Strings.ts";


const meta: CommandMeta = {
    name: 'aliases',
    doc: "For defining a bunch of aliases.",
    source: import.meta.url,
}

const split_into_aliases = (text: string | string[]): Alias[] => {
    const lines: string[] = text instanceof Array ? text : text.split("\n");
    return lines.map(line => {
        return {
            name: head(line),
            expansion: tail(line)
        };
    });
}

const func = async (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    return await define(context, split_into_aliases(context.input.content));
}

const define = async (context: CommandContext, aliases: Alias[]): Promise<CommandResult> => {
    const added = [];
    for (const a of aliases) {
        const result = await alias(context,a);
        const command = check(result.commands[a.name]);
        added.push(command);
    }
    return Promise.resolve({
        commands: combine(context.commands,added),
        output: context.input
    });
}

export const aliases_cmd : CommandDefinition = {
    meta, func
};

export const aliases = (context: CommandContext, aliases: Alias[]): Promise<CommandResult> => {
    return define(context, aliases);
}

export const aliases_from_lines = (context: CommandContext, lines: string | string[]): Promise<CommandResult> => {
    return define(context, split_into_aliases(lines));
}