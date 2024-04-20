import { command_processor } from "./CommandProcessor.ts";
import { commands } from "./Commands.ts";
import { help } from "./CoreCommands.ts";
import { log } from "./Logger.ts";

const context = (format: string, content: string) => ({
    commands: commands,
    help: help,
    previous: "",
    input: { format: format, content: content }
});

const createRecorder = (verbose: boolean) => ({
  record: (command: string, result: any) => {
    if (verbose) {
      log(`${command} => ${result.output.content}`);
    }
  }
});

const evaluate = (format: string, content: string, expression: string, verbose: boolean): any => {
  const recorder = createRecorder(verbose);
  return command_processor(expression, context(format,content), recorder);
};
  
export default evaluate;