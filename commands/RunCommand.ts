import { CommandContext, CommandData, CommandDefinition } from "../CommandDefinition.ts";
import { check } from "../Check.ts";

function replace_all(command: string, replacements: Record<string, string>) : string {
    let result = command;

    for (const [key, value] of Object.entries(replacements)) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKey, "g");
      result = result.replace(regex, value);
    }

    return result;
}



function command_with_replacements(context: CommandContext, options: CommandData) {
    const command = check(options.content);
    const input = context.input.content || "";
    const format = context.input.format || "";
    const replacements = {
        "${input}": input,
        "${format}": format,
    };
    return replace_all(command, replacements);
}

async function run(command: string) : Promise<Result> {
    const result = Deno.run({ cmd: command.split(" "), stdout: "piped"});
    const rawOutput = await result.output();
    const decoded = (new TextDecoder().decode(rawOutput)).trim();
    const status = await result.status();
    result.close();
    const output = decoded || "";
    return { status, output };
}

const meta = {
    name: "run",
    doc: "Run a command.",
    source: import.meta.url,
    input_formats: ["text"],
    output_formats: ["text"],
};

const func = async (context: CommandContext, options: CommandData) => {
    return {
        commands: context.commands,
        output: {
            format: "Run.Result",
            content: run(command_with_replacements(context, options))
        },
    };
};

export interface Result {
    status: Deno.ProcessStatus;
    output: string;
}

export const run_cmd: CommandDefinition = {
    meta, func
};