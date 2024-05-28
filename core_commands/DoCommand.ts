import { Duration } from "../Time.ts";
import { CommandDefinition } from "../command/CommandDefinition.ts";
import { CommandMeta } from "../command/CommandDefinition.ts";
import { CommandRecord } from "../command/CommandDefinition.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { CommandInvocation } from "../command/CommandDefinition.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { CommandResult } from "../command/CommandDefinition.ts";
import { CommandCompletionRecord } from "../command/CommandDefinition.ts";
import { HELP, DO } from "../command/CommandDefinition.ts";
import { head, tail } from "../Strings.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { log } from "./LogCommand.ts";
import { isString } from "../Check.ts";
import { nop_cmd } from "./NopCommand.ts";
import { convert_data, DataConversion } from "./IoCommand.ts";
import { are_equal } from "../Objects.ts";
import { now_now } from "../Time.ts";

const meta: CommandMeta = {
    name: DO,
    doc: "Execute a sequence of commands.",
    source: import.meta.url,
}

interface NumberedCommandResult {
    id: number;
    result: CommandResult;
}

const func = async (context: CommandContext, options: CommandData): Promise<CommandResult> => {
    // console.log({func, options});
    const start = now_now();
    const {id, result} = await process_entire_pipeline(context, options);
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
const null_step: CommandInvocation = { id: 0, command: nop_cmd, options: null_data };

function parse_command_step(context: CommandContext, id: number, step_text: string): CommandInvocation {
    const name = head(step_text).toLowerCase();
    const command = command_to_run(context, name);
    const content = tail(step_text);
    const options = { format: "string", content };
    // console.log({parse_command_step, name, step_text, options});
    return { id, command, options };
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

function output_to_input(result: CommandResult, source: CommandInvocation, target: CommandInvocation): DataConversion {
    return { result, source, target };
}

async function context_for_step(id: number, previousContext: CommandContext, previousInvocation: CommandInvocation, previousResult: CommandResult, current:CommandInvocation): Promise<CommandContext> {
    const commands = (previousInvocation === null_step) ? previousContext.commands: previousResult.commands;
    const result = (previousResult === null_result) ? { commands, output: previousContext.input } : previousResult;
    const converted = await convert_data(previousContext, output_to_input(result, previousInvocation, current));
    let input = result.output;
    if (!are_equal(converted.output,result.output)) {
        id = id + 1;
        input = converted.output;
    }
    const prior = previousContext;
    const source = previousInvocation;
    const start = now_now();
    const meta = {id, start, source, prior };
    return {meta, commands, input};
}

const null_result: CommandResult = { commands: {}, output: { format: "", content: "" } };

const process_entire_pipeline = async (context: CommandContext, options: CommandData): Promise<NumberedCommandResult> => {
    const steps = split_into_commands(options);
    // console.log({process_entire_pipeline, steps});
    let output: CommandResult = null_result;
    let result: CommandResult = null_result;
    let previousStep = null_step;
    let id = context.meta.id;

    for (const step of steps) {
        const currentStep = parse_command_step(context, id, step);
        context = await context_for_step(id, context, previousStep, result, currentStep);
        const execution = await execute_step(context, currentStep);
        await record_step(context, record(context, execution));
        id = id + 1;
        const meta = {id, start: now_now(), source: currentStep, prior: context};
        context = { meta, commands: execution.result.commands, input: result.output };
        result = execution.result;
        output = result;
        previousStep = currentStep;
    }
    if (output === null) {
        throw new Error(`No output from command: ${options}`);
    }
    return Promise.resolve({id, result:output});
};

function record(context: CommandContext, invocation: TimedInvocation) : CommandCompletionRecord {
    const result = invocation.result;
    const step = invocation.step;
    const command = step.command;
    const options = step.options;
    const duration = invocation.duration;
    const id = invocation.step.id;
    return { id, command, options, context, result, duration };
}

const record_step = (context: CommandContext, record: CommandCompletionRecord) => {
    // console.log({record_step, record});
    log(context, record);
};

export const do_cmd : CommandDefinition = {
    meta, func
};

export const run = (context: CommandContext, expression: string): Promise<CommandResult> => {
    return invoke(context, DO, {format: "string", content: expression});
};