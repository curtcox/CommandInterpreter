import { CommandDefinition, CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";

const url = "URL";
const javascript = "application/javascript";
const typescript = "application/typescript";
const definition = "CommandDefinition";

const meta = {
    name: "define",
    doc: "define a command",
    source: import.meta.url,
};

async function define_from_module(module:any): Promise<CommandDefinition> {
    if (!module) throw new Error("no module found");
    if (module.command) return module.command;
    if (module.meta && module.func) return { meta: module.meta, func: module.func };
    console.log({module});
    throw new Error(`No command found in module ${module}`);
}

async function define_from_url(url: string): Promise<CommandDefinition> {
    const module = await import(url);
    return define_from_module(module);
}

async function define_from_javascript(text: string): Promise<CommandDefinition> {
    const blob = new Blob([text], { type: javascript });
    const url = URL.createObjectURL(blob);
    return define_from_url(url);
}

async function define_from_typescript(text: string): Promise<CommandDefinition> {
    const blob = new Blob([text], { type: typescript });
    const url = URL.createObjectURL(blob);
    return define_from_url(url);
}

async function define(data: CommandData): Promise<CommandDefinition> {
    const format = data.format;
    if (format === url)        return define_from_url(data.content);
    if (format === javascript) return define_from_javascript(data.content);
    if (format === typescript) return define_from_typescript(data.content);
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