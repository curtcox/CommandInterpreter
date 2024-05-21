import { CommandDefinition, CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";
import { nonEmpty } from "../Check.ts";

const url = "URL";
const javascript = "application/javascript";
const typescript = "application/typescript";
const definition = "CommandDefinition";

const meta = {
    name: "define",
    doc: "define a command",
    source: import.meta.url,
};

// deno-lint-ignore no-explicit-any
function define_from_module(module: any): Promise<CommandDefinition> {
    if (!module) throw new Error("no module found");
    if (module.command) return module.command;
    if (module.meta && module.func) return Promise.resolve({ meta: module.meta, func: module.func });
    console.log({module});
    throw new Error(`No command found in module ${module}`);
}

async function define_from_url(url: string): Promise<CommandDefinition> {
    const module = await import(url);
    return define_from_module(module);
}

async function define_from_script(type: string, script: string): Promise<CommandDefinition> {
    const blob = new Blob([script], { type });
    const url = URL.createObjectURL(blob);
    return await define_from_url(url);
}

export async function define(data: CommandData): Promise<CommandDefinition> {
    const format = nonEmpty(data.format);
    const content = nonEmpty(data.content);
    if (format === url)        return await define_from_url(content);
    if (format === javascript) return await define_from_script(javascript,content);
    if (format === typescript) return await define_from_script(typescript,content);
    throw new Error(`Unsupported format ${format}`);
}

const func = async (context: CommandContext, data: CommandData) => {
    const command = await define(data);
    return Promise.resolve({
           commands: combine(command, context.commands),
           output: {
               format: definition,
               content: command
           }
        }
    );
}

export const define_cmd: CommandDefinition = {
    meta, func
};