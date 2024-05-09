import { check } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandRecord, CommandData } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { LOG } from "../command/CommandDefinition.ts";
import { set } from "./StoreCommand.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";

const meta: CommandMeta = {
    name: LOG,
    doc: "Log command result",
    source: import.meta.url,
}

const result = (record: CommandRecord): CommandResult => {
    return {
        commands: record.context.commands,
        output: record.result.output
    };
};

const save_record = (context: CommandContext, record: CommandRecord): void => {
    check(record);
    set(context,`log/${record.id}`, { format: "CommandRecord", content: record });
};

const func = (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    const record = context.input.content;
    save_record(context,record);
    return Promise.resolve(result(record));
}

export const log_cmd : CommandDefinition = {
    meta, func
};

export const log = async (context: CommandContext, record: CommandRecord) => {
    const data = { format: "text", content: "" };
    await invoke_with_input(context,LOG,data,{ format: "CommandRecord", content: record });
}