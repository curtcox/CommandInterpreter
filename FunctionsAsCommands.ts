import { CommandContext, CommandDefinition, CommandMeta, CommandArg, CommandData } from "./CommandDefinition.ts";

// A simplified version of CommandDefinition.
export interface FunctionCommand {
  doc: string;
  args: CommandArg[];
  func: Function;
}

export interface FunctionMeta {
  name: string;
  args: Record<string, string>;
  output: string;
}

/**
 * Extracts metadata from a function.
 * @param func The function to analyze.
 * @returns The metadata of the function.
 */
function function_meta(func: Function): FunctionMeta {
  const funcString = func.toString();
  console.log(funcString);

  // Extract the function name or use an anonymous placeholder
  const name = func.name || "anonymous";

  // Use regex to extract the argument list part from function definition
  const argsRegex = /function.*?\(([^)]*)\)/;
  const argsMatch = argsRegex.exec(funcString);
  const argsString = argsMatch ? argsMatch[1] : "";
  const argsArray = argsString.split(",").map(arg => arg.trim()).filter(arg => arg);

  // Infer argument types as 'unknown' because JavaScript does not provide runtime type information
  const args: Record<string, string> = {};
  argsArray.forEach(arg => {
    args[arg] = "unknown";
  });

  // Infer output type as 'unknown' for the same reason
  const output = "unknown";

  return { name, args, output };
}

function command_meta(functionMeta: FunctionMeta, args: CommandArg[]) : CommandMeta {
  return {
    name: functionMeta.name,
    doc: functionMeta.name,
    args: args,
  };
}

export function def_from_function(command: FunctionCommand): CommandDefinition {
  return {
    meta: command_meta(function_meta(command.func), command.args),
    func: async (context: CommandContext, data: CommandData) => {
      const args = data.content.split(" ");
      const result = command.func(context, ...args);
      return {
        commands: context.commands,
        output: {
          format: "text",
          content: result
        }
      };
    }
  };
}
