import { PreciseTime } from "../Time.ts";
import { Duration } from "../Time.ts";

/**
 * Commands can be found by other commands in the context.
 * The names below are use for core interpreter functionality.
 */
export const HELP = "help";
export const DO = "do";
export const IO = "io";
export const LOG = "log";
export const STORE = "store";
export const OBJ = "obj";
export const HASH = "hash";
export const REF = "ref";
export const ENV = "env";

// Input to, output from, or configuration for a command.
export interface CommandData {
  format: string;
  content: unknown; // commands should consider exporting interfaces for the content they need,
  // or accept a universal format like plain text or JSON.
}

export interface CommandInvocation {
  id: number; // A unique sequence number for the command.
  command: CommandDefinition;
  options: CommandData;
}

export interface ContextMeta {
  id: number; // The sequence number that the next command executed in this context will have.
  start: PreciseTime; // The time the context was created.
  source: CommandInvocation; // The command that produced this context.
  prior: CommandContext; // The context that produced this context.
}

/**
 * The context in which a command is run.
 * The context includes the commands that are available, the input to the command, and metadata about the context.
 */
export interface CommandContext {
  meta: ContextMeta; // Metadata about the context.
  commands: Map<string, CommandDefinition>; // The commands that are available. Should this be a record?
  input: CommandData; // Data that is passed to the command.
}

/**
 * The result of running a command.
 * It is more than just the output because commands can change what commands are available.
 */
export interface CommandResult {
  commands: Map<string, CommandDefinition>;
  output: CommandData;
}

/**
 * The metadata for a command.
 */
export interface CommandMeta {
  name: string;
  doc: string;
  source: string;
}

/**
 * A command definition.
 * When a command is run, the function will be called with the context and the options.
 * The function should return a promise that resolves to a CommandResult.
 * @param meta The metadata for the command.
 * @param func The function that implements the command.
 * What can a command do?
 * 1. It can produce a result -- possibly using the input.
 * 2. It can modify the context -- possibly adding new commands.
 * What data does it have access to?
 * 1. The context -- which includes the commands and the input.
 * 2. The options -- which are the arguments to the command.
 */
export interface CommandDefinition {
  meta: CommandMeta;
  func: (context: CommandContext, options: CommandData) => Promise<CommandResult>;
}

// A record of a command that has been run.
export interface CommandRecord extends CommandInvocation {
  context: CommandContext; // The context in which the command was run.
  duration: Duration; // The duration of the command.
  store: string | Map<string,object>; // The contents of the store after the command was run.
}

// A record of a command that has been run to completion.
export interface CommandCompletionRecord extends CommandRecord {
  result: CommandResult; // The result of running the command.
}

// A record of a command that failed.
export class CommandError extends Error implements CommandRecord {
  public context: CommandContext;
  public id: number; // A unique sequence number for the command.
  public command: CommandDefinition;
  public options: CommandData;
  public duration: Duration; // The duration of the command.
  public store: Map<string,object>; // The contents of the store after the command was run.

  constructor(context: CommandContext, invocation: CommandInvocation, duration: Duration, message: string) {
    super(message);
    this.id = invocation.id;
    this.name = "CommandError";
    this.context = context;
    this.command = invocation.command;
    this.options = invocation.options;
    this.duration = duration;
    this.store = new Map<string,object>();
  }
}