import { check } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandRecord, CommandData } from "../CommandDefinition.ts";
import { CommandContext, CommandResult } from "../CommandDefinition.ts";
import { LOG, STORE } from "../CommandDefinition.ts";
import { invoke_command } from "../ToolsForCommandWriters.ts";

const meta: CommandMeta = {
    name: LOG,
    doc: "Log command result",
    source: import.meta.url,
    input_formats: ["CommandRecord"],
    output_formats: ["any"]
}

const result = (record: CommandRecord): CommandResult => {
    return {
        commands: record.context.commands,
        output: record.result.output
    };
};

const save_record = (context: CommandContext, record: CommandRecord): void => {
    check(record);
    invoke_command(context,STORE,
        { format: "string", content: `set log/${record.id}`},
        { format: "CommandRecord", content: record });
};

const func = (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    const record = context.input.content;
    save_record(context,record);
    return Promise.resolve(result(record));
}

export const log_cmd : CommandDefinition = {
    meta, func
};