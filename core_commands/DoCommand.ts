import { CommandDefinition } from "../command/CommandDefinition.ts";
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
import { convert_data } from "./IoCommand.ts";

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

const null_data = { format: "", content: "" };
const null_step: CommandInvocation = { command: nop_cmd, options: null_data };

function parse_command_step(context: CommandContext, step_text: string): CommandInvocation {
    const name = head(step_text).toLowerCase();
    const command = command_to_run(context, name);
    const content = tail(step_text);
    const options = { format: "text", content };
    return { command, options };
}

function command_to_run(context: CommandContext, name: string): CommandDefinition {
    const command = context.commands[name] || context.commands[HELP];
    if (!command) {
        throw new Error(`Command not found: ${name}`);
    }
    return command;
}

function execute_step(context: CommandContext, step: CommandInvocation): Promise<CommandResult> {
    return step.command.func(context, step.options);
}

async function context_for_step(previousContext: CommandContext, previousStep: CommandInvocation, result: CommandResult, currentStep:CommandInvocation): Promise<CommandContext> {
    const commands = (previousStep === null_step) ? previousContext.commands: result.commands;
    const data = (result === null_result) ? { commands, output: previousContext.input } : result;
    const previous = { command: previousStep.command, options: previousStep.options };
    const conversion = { data, source: previousStep, target: currentStep };
    const converted = await convert_data(previousContext, conversion);
    const input = converted.output;
    return {commands, previous, input};
}

const null_result: CommandResult = { commands: {}, output: { format: "", content: "" } };

const process_entire_pipeline = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    const steps = split_into_commands(options);
    let output: CommandResult = null_result;
    let result: CommandResult = null_result;
    let previousStep = null_step;

    for (const step of steps) {
        const currentStep = parse_command_step(context, step);
        const start = now_now();
        context = await context_for_step(context, previousStep, result, currentStep);
        result = await execute_step(context, currentStep);
        const end = now_now();
        const command = currentStep.command;
        const options = currentStep.options;
        const duration = { start, end };
        const record = {id, command, options, context, result, duration };
        await record_step(context, record);
        output = result;
        previousStep = currentStep;
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