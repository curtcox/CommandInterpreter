import { isString } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";
import { head, tail } from "../Strings.ts";
import { run } from "../core_commands/DoCommand.ts";

const meta: CommandMeta = {
    name: 'alias',
    doc: "For defining command aliases.",
    source: import.meta.url,
}

const new_alias = (alias: string, expansion: string): CommandDefinition => ({
    meta: {
        name: alias,
        doc: `Alias for ${expansion}`,
        source: import.meta.url,
    },
    func: async (context: CommandContext, options: CommandData) => {
        const { content } = options;
        isString(content);
        // console.log({alias, expansion, content});
        return await run(context, `${expansion} ${content}`);
    }
});

function check_alias(alias: string, expansion: string) {
    if (alias.toLowerCase() === head(expansion).toLowerCase()) {
        throw new Error(`Alias (${alias}) cannot be the same as the command it expands to. (${expansion})`);
    }
}

const func = (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const { content } = options;
    const alias = head(content);
    const expansion = tail(content);
    check_alias(alias, expansion);
    const command = new_alias(alias, expansion);
    return Promise.resolve({
        commands: combine(context.commands,command),
        output: context.input
    });
}

export const alias_cmd : CommandDefinition = {
    meta, func
};

export interface Alias {
    name: string;
    expansion: string;
}

export const alias = (context: CommandContext, alias: Alias): Promise<CommandResult> => {
    const { name, expansion } = alias;
    return func(context, {
        format: "text",
        content: `${name} ${expansion}`
    });
}