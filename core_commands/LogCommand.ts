import { check } from "../Check.ts";
import { CommandDefinition, CommandMeta, CommandData } from "../command/CommandDefinition.ts";
import { CommandRecord, CommandError } from "../command/CommandDefinition.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { CommandCompletionRecord } from "../command/CommandDefinition.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { LOG } from "../command/CommandDefinition.ts";
import { Native } from "./StoreCommand.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { serialize } from "./ObjCommand.ts";
import { jsonToRef } from "./RefCommand.ts";
import { filename_safe } from "./StoreCommand.ts";
import { Hash } from "../Ref.ts";

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

const result = (record: CommandRecord): CommandResult => ({
    commands: record.context.commands,
    output: output(record)
})

const save_record = async (native: Native, record: CommandRecord): Promise<Hash> => {
    check(record);
    const snapshot = await native.snapshot();
    record.store = await snapshot.value;
    const serialized = await serialize({ format: format(record), content: record });
    const ref = await jsonToRef(serialized);
    native.set(`log/${record.id}`, ref.result);
    for (const [hash, subtree] of ref.replacements.entries()) {
        native.set(`hash/${filename_safe(hash.value)}`, subtree);
    }
    return snapshot;
}

function record_from_context(context: CommandContext): CommandRecord {
    const record = context.input.content as CommandRecord;
    return check(record);
}

export const log_cmd = (native:Native) : CommandDefinition => ({
    meta, func: async (context: CommandContext, _options: CommandData) => {
        const record = record_from_context(context);
        const hash = await save_record(native,record);
        record.store = hash.value;
        return Promise.resolve(result(record));
    }
});

let already_logging = false;
async function log_record(context: CommandContext, format: string, input: CommandRecord): Promise<CommandResult> {
    if (already_logging) {
        const message = `Attempting to log while already logging.
        This likely represents a log configuration error.`
        console.error(message);
        console.error({context, format, input});
        already_logging = false;
        return { commands: context.commands, output: { format: "string", content: message}};
    }
    already_logging = true;
    const options = { format: "string", content: format };
    const logged = await invoke_with_input(context,LOG,options,{ format, content: input });
    already_logging = false;
    return logged;
}

export const log = async (context: CommandContext, record: CommandCompletionRecord): Promise<CommandResult> => {
    return await log_record(context,"CommandCompletionRecord",record);
}

export const error = async (context: CommandContext, record: CommandError): Promise<CommandResult> => {
    return await log_record(context,"CommandError",record);
}