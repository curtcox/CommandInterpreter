import { CommandDefinition, CommandMeta, CommandRecord, CommandData, Duration, PreciseTime } from "../CommandDefinition.ts";
import { CommandContext, CommandResult } from "../CommandDefinition.ts";
import { HELP, DO } from "../CommandDefinition.ts";
import { head, invoke, tail } from "../ToolsForCommandWriters.ts";
import { log } from "./LogCommand.ts";

const meta: CommandMeta = {
    name: DO,
    doc: "Execute a sequence of commands.",
    source: import.meta.url,
    input_formats: ["string"],
    output_formats: ["string"]
}

function now_now(): PreciseTime {
    return { millis: Date.now(), micros: performance.now() };
}

const func = async (context: CommandContext, data: CommandData): Promise<CommandResult> => {
    const start = now_now();
    const options = data.content;
    const result = await process_entire_pipeline(context, options);
    const end = now_now();
    const step = { command: do_cmd, options };
    record_step(context, step, result, { start, end });
    return result;
}

function split_into_commands(input: string): string[] {
    const regex = /(?:[^|'"`]+|'[^']*'|"[^"]*"|`[^`]*`)+/g;
    const matches = input.match(regex);
    return matches ? matches.map(match => match.trim()) : [];
}

interface CommandStep {
    command: CommandDefinition;
    options: string;
}

function parse_command_step(context: CommandContext, step_text: string): CommandStep {
    const name = head(step_text).toLowerCase();
    const options = tail(step_text);
    const command = context.commands[name] || context.commands[HELP];
    return { command, options };
}

function execute_step(context: CommandContext, step: CommandStep): Promise<CommandResult> {
    return step.command.func(context, { format: "string", content: step.options });
}

const process_entire_pipeline = async (context: CommandContext, entire_command: string): Promise<CommandResult> => {
    const steps = split_into_commands(entire_command);
    let output = null;
    for (const step of steps) {
        const command = parse_command_step(context, step);
        const start = now_now();
        const result = await execute_step(context, command);
        const end = now_now();
        record_step(context, command, result, { start, end });
        output = result;
        context = { commands: result.commands, previous: command.command, input: result.output };
    }
    if (output === null) {
        throw new Error(`No output from command: ${entire_command}`);
    }
    return Promise.resolve(output);
};

let id = 0;

const record_step = (context: CommandContext, step: CommandStep, result: CommandResult, duration: Duration) => {
    const { command, options } = step;
    const record: CommandRecord = { id, command, options, context, result, duration };
    id += 1;
    log(context, record);
};

export const do_cmd : CommandDefinition = {
    meta, func
};

export const run = (context: CommandContext, expression: string): Promise<CommandResult> => {
    return invoke(context, 'do', {format: "text", content: expression});
};