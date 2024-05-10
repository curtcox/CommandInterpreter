import { CommandDefinition, CommandMeta, CommandRecord, CommandData, PreciseTime } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { HELP, DO } from "../command/CommandDefinition.ts";
import { head, tail } from "../Strings.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { log } from "./LogCommand.ts";
import { isString } from "../Check.ts";

const meta: CommandMeta = {
    name: DO,
    doc: "Execute a sequence of commands.",
    source: import.meta.url,
}

function now_now(): PreciseTime {
    return { millis: Date.now(), micros: performance.now() };
}

const func = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const start = now_now();
    const result = await process_entire_pipeline(context, options);
    const end = now_now();
    const duration = { start, end };
    const command = do_cmd;
    const record = {id, command, options, context, result, duration };
    record_step(context, record);
    return result;
}

function split_into_commands(options: CommandData): string[] {
    const input = isString(options.content);
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
    const command = command_to_run(context, name);
    return { command, options };
}

function command_to_run(context: CommandContext, name: string): CommandDefinition {
    const command = context.commands[name] || context.commands[HELP];
    if (!command) {
        throw new Error(`Command not found: ${name}`);
    }
    return command;
}

function execute_step(context: CommandContext, step: CommandStep): Promise<CommandResult> {
    return step.command.func(context, { format: "string", content: step.options });
}

const process_entire_pipeline = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const steps = split_into_commands(options);
    let output = null;
    for (const step of steps) {
        const commandStep = parse_command_step(context, step);
        const start = now_now();
        const result = await execute_step(context, commandStep);
        const end = now_now();
        const command = commandStep.command;
        const options = { format: "string", content: commandStep.options };
        const duration = { start, end };
        const record = {id, command, options, context, result, duration };
        record_step(context, record);
        output = result;
        context = { commands: result.commands, previous: commandStep.command, input: result.output };
    }
    if (output === null) {
        throw new Error(`No output from command: ${options}`);
    }
    return Promise.resolve(output);
};

let id = 0;
const record_step = (context: CommandContext, record: CommandRecord) => {
    id += 1;
    log(context, record);
};

export const do_cmd : CommandDefinition = {
    meta, func
};

export const run = (context: CommandContext, expression: string): Promise<CommandResult> => {
    return invoke(context, 'do', {format: "text", content: expression});
};