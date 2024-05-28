import { check } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandRecord, CommandError } from "../command/CommandDefinition.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { CommandCompletionRecord } from "../command/CommandDefinition.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { LOG } from "../command/CommandDefinition.ts";
import { set } from "./StoreCommand.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";

const meta: CommandMeta = {
    name: LOG,
    doc: "Log command result",
    source: import.meta.url,
}

const format = (record: CommandRecord): string => {
    if (record instanceof CommandError)
        return "CommandError";
    return "CommandCompletionRecord";
}

const output = (record: CommandRecord): CommandData => {
    if (record instanceof CommandError)
        return { format: format(record), content: record };
    const completion = record as CommandCompletionRecord;
    return completion.result.output;
}

const result = (record: CommandRecord): CommandResult => {
    return {
        commands: record.context.commands,
        output: output(record)
    }
}

const save_record = (context: CommandContext, record: CommandRecord): void => {
    check(record);
    set(context,`log/${record.id}`, { format: format(record), content: record });
}

function record_from_context(context: CommandContext): CommandRecord {
    const record = context.input.content as CommandRecord;
    return check(record);
}

const func = (context: CommandContext, _options: CommandData): Promise<CommandResult> => {
    const record = record_from_context(context);
    save_record(context,record);
    return Promise.resolve(result(record));
}

export const log_cmd : CommandDefinition = {
    meta, func
}

let already_logging = false;
async function log_record(context: CommandContext, format: string, input: CommandRecord) {
    if (already_logging) {
        console.error(
            `Attempting to log while already logging.
            This likely represents a log configuration error.`
        );
        console.error({context, format, input});
        already_logging = false;
        return;
    }
    already_logging = true;
    const options = { format: "string", content: format };
    await invoke_with_input(context,LOG,options,{ format, content: input });
    already_logging = false;
}

export const log = async (context: CommandContext, record: CommandCompletionRecord) => {
    await log_record(context,"CommandCompletionRecord",record);
}

export const error = async (context: CommandContext, record: CommandError) => {
    await log_record(context,"CommandError",record);
}