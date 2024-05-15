import { isString } from "../Check.ts";
import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { command_with_replacements } from "../command/ToolsForCommandWriters.ts";

async function run(command: string, stdin: string) : Promise<Result> {
    isString(command);
    isString(stdin);
    console.log(`Running command: ${command}`);
    const parts = command.split(" ");
    const process = Deno.run({
         cmd: parts,
         stdin: "piped",
         stdout: "piped",
    });
    const encoder = new TextEncoder();
    const input = encoder.encode(stdin);
    await process.stdin.write(input);
    process.stdin.close();
    const rawOutput = await process.output();
    const decodedOut = new TextDecoder().decode(rawOutput);

    const status = await process.status();
    process.close();
    const output = decodedOut || "";

    return { status, output };
}

const meta = {
    name: "run",
    doc: "Run a command from the underlying system.",
    source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
    console.log({options});
    const stdin = context.input.content || "";
    const command = command_with_replacements(context, options.content);
    return {
        commands: context.commands,
        output: {
            format: "string",
            content: await run(command, stdin)
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