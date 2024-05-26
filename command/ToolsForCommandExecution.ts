import { CommandResult, CommandRecord, DO, CommandContext } from "./CommandDefinition.ts";
import { invoke } from "./ToolsForCommandWriters.ts";

export async function rerun(record: CommandRecord): Promise<CommandResult> {
    const result = await invoke(record.context, DO, record.options);
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

