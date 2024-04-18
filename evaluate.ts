import { command_processor } from "./CommandProcessor.ts";
import { commands } from "./Commands.ts";
import { help } from "./CoreCommands.ts";
import { log } from "./Logger.ts";

const context = {
    commands: commands,
    help: help,
    previous: "",
    input: { format: "", content: "" }
};

const createRecorder = (verbose: boolean) => ({
  record: (command: string, result: any) => {
    if (verbose) {
      log(`${command} => ${result.output.content}`);
    }
  }
});

const evaluate = (expression: string, verbose: boolean): any => {
  const recorder = createRecorder(verbose);
  return command_processor(expression, context, recorder);
};
  
export default evaluate;