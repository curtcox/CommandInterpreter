/**
 * Commands can be found by other commands in the context.
 * The names below are use for core interpreter functionality.
 */
export const HELP = "help";
export const DO = "do";
export const IO = "io";
export const LOG = "log";
export const STORE = "store";
export const ENV = "env";

// Input to, output from, or configuration for a command.
export interface CommandData {
  format: string;
  content: any; // commands should consider exporting interfaces for the content they need,
  // or accept a universal format like plain text or JSON.
}

export interface CommandContext {
  commands: Record<string, CommandDefinition>;
  previous: CommandDefinition;
  input: CommandData;
}

/**
 * The result of running a command.
 * It is more than just the output because commands can change what commands are available.
 */
export interface CommandResult {
  commands: Record<string, CommandDefinition>;
  output: CommandData;
}

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

export interface PreciseTime {
  millis: number;
  micros: number;
}

export interface Duration {
  start: PreciseTime;
  end: PreciseTime;
}

/**
 * A record of a command that has been run.
 */
export interface CommandRecord {
  id: number; // A unique sequence number for the command.
  command: CommandDefinition; // The command that was run.
  options: CommandData; // The options that were passed to the command.
  context: CommandContext; // The context in which the command was run.
  result: CommandResult; // The result of running the command.
  duration: Duration; // The duration of the command.
}