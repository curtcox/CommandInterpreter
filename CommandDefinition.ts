export interface CommandData {
  format: string;
  content: string;
}

export interface CommandContext {
  commands: Record<string, CommandDefinition>;
  help: CommandDefinition;
  previous: string;
  input: CommandData;
}

export interface CommandResult {
  commands: Record<string, CommandDefinition>;
  output: CommandData;
}

export interface CommandMeta {
  name: string;
  doc: string;
  input_formats: string[];
  output_formats: string[];
}

export interface CommandDefinition {
  meta: CommandMeta;
  func: (options: string, context: CommandContext) => Promise<CommandResult>;
}

export interface CommandRecorder {
    record: (command: string, result: CommandResult) => void;
}