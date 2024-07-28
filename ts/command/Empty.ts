import { CommandContext, CommandData, CommandInvocation, ContextMeta, CommandDefinition } from "./CommandDefinition.ts";
import { Duration, PreciseTime } from "../core/Time.ts";
import { empty } from "../core/Ref.ts";

export const emptyData: CommandData = { format: "", content: "" };
export const timeZero: PreciseTime = { millis: 0, micros: 0 };
export const emptyDuration: Duration = { start: timeZero, end: timeZero};
export const emptyCommandMeta = { name: "", doc: "", source: "" };
export const emptyCommand: CommandDefinition = { meta: emptyCommandMeta, func: () => (Promise.resolve({ commands: new Map(), output: emptyData })) };
export const emptyInvocation: CommandInvocation = { id: 0, command: emptyCommand, options: emptyData };
export const emptyHash = empty;

export const emptyContextMeta: ContextMeta = {
    id: 0,
    start: timeZero,
    source: emptyInvocation,
    prior: undefined as unknown as CommandContext
}

export const emptyContext: CommandContext = {
    meta: emptyContextMeta,
    commands: new Map<string, CommandDefinition>(),
    input: emptyData,
}
