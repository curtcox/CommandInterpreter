import { CommandDefinition, Duration } from "../command/CommandDefinition.ts";
import { CommandMeta } from "../command/CommandDefinition.ts";
import { CommandRecord } from "../command/CommandDefinition.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { CommandInvocation } from "../command/CommandDefinition.ts";
import { PreciseTime } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { HELP, DO } from "../command/CommandDefinition.ts";
import { head, tail } from "../Strings.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { log } from "./LogCommand.ts";
import { isString } from "../Check.ts";
import { nop_cmd } from "./NopCommand.ts";
import { convert_data, Conversion } from "./IoCommand.ts";

const meta: CommandMeta = {
    name: DO,
    doc: "Execute a sequence of commands.",
    source: import.meta.url,
}

function now_now(): PreciseTime {
    return { millis: Date.now(), micros: performance.now() };
}

const func = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    console.log({func, options});
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

const null_data = { format: "", content: "" };
const null_step: CommandInvocation = { command: nop_cmd, options: null_data };

function parse_command_step(context: CommandContext, step_text: string): CommandInvocation {
    const name = head(step_text).toLowerCase();
    const command = command_to_run(context, name);
    const content = tail(step_text);
    const options = { format: "text", content };
    console.log({parse_command_step, name, step_text, options});
    return { command, options };
}

function command_to_run(context: CommandContext, name: string): CommandDefinition {
    const command = context.commands[name] || context.commands[HELP];
    // console.log({command_to_run, name, command});
    if (!command) {
        throw new Error(`Command not found: ${name}`);
    }
    return command;
}

interface TimedInvocation {
    duration: Duration;
    step: CommandInvocation
    result: CommandResult;
}

async function execute_step(context: CommandContext, step: CommandInvocation): Promise<TimedInvocation> {
    // console.log({execute_step, step});
    const start = now_now();
    const result = await step.command.func(context, step.options);
    const end = now_now();
    const duration = { start, end };
    return Promise.resolve({ duration, result, step });
}

function output_to_input(data: CommandResult, previous: CommandInvocation, current:CommandInvocation): Conversion {
    return { data, source: previous, target: current };
}

async function context_for_step(previousContext: CommandContext, previous: CommandInvocation, result: CommandResult, current:CommandInvocation): Promise<CommandContext> {
    const commands = (previous === null_step) ? previousContext.commands: result.commands;
    const data = (result === null_result) ? { commands, output: previousContext.input } : result;
    const converted = await convert_data(previousContext, output_to_input(data, previous, current));
    const input = converted.output;
    return {commands, previous, input};
}

const null_result: CommandResult = { commands: {}, output: { format: "", content: "" } };

const process_entire_pipeline = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const steps = split_into_commands(options);
    console.log({process_entire_pipeline, steps});
    let output: CommandResult = null_result;
    let result: CommandResult = null_result;
    let previousStep = null_step;

    for (const step of steps) {
        const currentStep = parse_command_step(context, step);
        context = await context_for_step(context, previousStep, result, currentStep);
        const execution = await execute_step(context, currentStep);
        await record_step(context, record(context, execution));
        context = { commands: execution.result.commands, previous: currentStep, input: result.output };
        result = execution.result;
        output = result;
        previousStep = currentStep;
    }
    if (output === null) {
        throw new Error(`No output from command: ${options}`);
    }
    return Promise.resolve(output);
};

function record(context: CommandContext, invocation: TimedInvocation) : CommandRecord {
    const result = invocation.result;
    const step = invocation.step;
    const command = step.command;
    const options = step.options;
    const duration = invocation.duration;
    return { id, command, options, context, result, duration };
}

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