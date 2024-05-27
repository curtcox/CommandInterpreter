import { CommandResult } from "./CommandDefinition.ts";
import { CommandRecord } from "./CommandDefinition.ts";
import { CommandError } from "./CommandDefinition.ts";
import { DO } from "./CommandDefinition.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { invoke } from "./ToolsForCommandWriters.ts";

export async function rerun(record: CommandRecord): Promise<CommandResult> {
    const result = await invoke(record.context, record.command.meta.name, record.options);
    return Promise.resolve(result);
}

export async function retry(error: CommandError): Promise<CommandResult> {
    const invocation = error.invocation;
    const result = await invoke(error.context, invocation.command.meta.name, invocation.options);
    return Promise.resolve(result);
}

export async function resume(record: CommandRecord, pipeline: string): Promise<CommandResult> {
    const { meta } = record.context;
    const commands = record.result.commands;
    const input = record.result.output;
    const context: CommandContext = {meta, commands, input}
    const result = await invoke(context, DO, {format: "string", content:pipeline});
    return Promise.resolve(result);
}

