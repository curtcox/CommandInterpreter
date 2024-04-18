import { CommandContext, CommandResult, CommandRecorder } from "./CommandDefinition.ts";
import { head, tail } from "./ToolsForCommandWriters.ts";
import { log } from "./Logger.ts";

function split_into_commands(input: string): string[] {
  const regex = /(?:[^|'"`]+|'[^']*'|"[^"]*"|`[^`]*`)+/g;
  const matches = input.match(regex);
  return matches ? matches.map(match => match.trim()) : [];
}

function process_single_command(single_command: string, context: CommandContext): Promise<CommandResult> {
  log("processor " + single_command);
  const command = head(single_command);
  const options = tail(single_command);
//   log({ single_command, command, options });
  const command_to_run = context.commands[command] || context.help;
  return command_to_run.func(options, context);
}

export const command_processor = async (entire_command: string, context: CommandContext, recorder: CommandRecorder) => {
  const steps = split_into_commands(entire_command);
  let output = null;
  for (const step of steps) {
    const result = await process_single_command(step, context);
    recorder.record(step, result);
    output = result;
    context = { commands: result.commands, help: context.help, previous: step, input: result.output };
  }
  return output;
};