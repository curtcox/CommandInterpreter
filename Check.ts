import { CommandData, CommandResult } from './command/CommandDefinition.ts';

/**
 * Check that this thing is defined, because we really need it to be defined, OK? 
 */
export function check<T>(value: T) : T {
    if (!value) {
      throw new Error("Value is undefined");
    }
    return value;
}

export function checkFormat(data: CommandData, format: string): CommandData {
  if (data.format === format) {
    return data;
  }
  throw new Error(`Expected format ${format}, but got ${data.format}`);
}

export function isString(obj: unknown): string {
  if (typeof obj === 'string') {
    return obj;
  }
  throw new Error(`Expected string, but got ${typeof obj} : ${obj}`);
}

export function nonEmpty(obj: unknown): string {
  if (isString(obj) === '') {
    throw new Error('Must not be empty');
  }
  return obj as string;
}

export function isResult(obj: unknown): CommandResult {
  const { commands, output } = obj as CommandResult;
  if (obj && typeof commands && output) {
    isData(output);
    return obj as CommandResult;
  }
  throw new Error(`Expected CommandResult, but got ${typeof obj} : ${obj}`);
}

export function isData(obj: unknown): CommandData {
  const {format, content} = obj as CommandData;
  if (obj && typeof format === 'string' && content !== undefined ) {
    return obj as CommandData;
  }
  throw new Error(`Expected CommandData, but got ${typeof obj} : ${obj}`);
}
