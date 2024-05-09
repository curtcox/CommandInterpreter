import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { command_with_replacements } from "../command/ToolsForCommandWriters.ts";

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
    doc: "Run a command from the underlying system.",
    source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
    return {
        commands: context.commands,
        output: {
            format: "Run.Result",
            content: run(command_with_replacements(context, options.content))
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