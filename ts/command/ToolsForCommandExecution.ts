import { CommandResult } from "./CommandDefinition.ts";
import { CommandCompletionRecord } from "./CommandDefinition.ts";
import { CommandRecord } from "./CommandDefinition.ts";
import { CommandError } from "./CommandDefinition.ts";
import { DO } from "./CommandDefinition.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { invoke } from "./ToolsForCommandWriters.ts";

export async function rerun(record: CommandRecord): Promise<CommandResult> {
    const result = await invoke(record.context, record.command.meta.name, record.options);
    return result;
}

export async function retry(error: CommandError): Promise<CommandResult> {
    const invocation = {command: error.command, options: error.options};
    const result = await invoke(error.context, invocation.command.meta.name, invocation.options);
    return result;
}

export async function resume(record: CommandCompletionRecord, pipeline: string): Promise<CommandResult> {
    const { meta } = record.context;
    const commands = record.result.commands;
    const input = record.result.output;
    const context: CommandContext = {meta, commands, input}
    const result = await invoke(context, DO, {format: "string", content:pipeline});
    return result;
}

