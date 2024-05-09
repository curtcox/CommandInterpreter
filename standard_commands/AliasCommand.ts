import { isString } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { use } from "../command/ToolsForCommandWriters.ts";
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
        return run(context, `${expansion} ${content}`);
    }
});

const func = (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const { content } = options;
    const alias = head(content);
    const expansion = tail(content);
    const command = new_alias(alias, expansion);
    return Promise.resolve({
        commands: use(command,context.commands),
        output: context.input
    });
}

export const alias_cmd : CommandDefinition = {
    meta, func
};

export const alias = (context: CommandContext, alias: string, expansion: string): Promise<CommandResult> => {
    const options = {
        format: "text",
        content: `${alias} ${expansion}`
    }
    return func(context, options);
}