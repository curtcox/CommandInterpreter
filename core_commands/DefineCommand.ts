import { CommandDefinition, CommandContext, CommandData } from "../CommandDefinition.ts";
import { use } from "../ToolsForCommandWriters.ts";

const meta = {
    name: "define",
    doc: "define a command",
    source: import.meta.url,
    input_formats: ["URL","text/javascript","text/typescript"],
    output_formats: ["CommandDefinition"],
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
    const blob = new Blob([text], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return define_from_url(url);
}

async function define_from_typescript(text: string): Promise<CommandDefinition> {
    const blob = new Blob([text], { type: 'application/typescript' });
    const url = URL.createObjectURL(blob);
    return define_from_url(url);
}

async function define(data: CommandData): Promise<CommandDefinition> {
    const format = data.format;
    if (format === "URL")             return define_from_url(data.content);
    if (format === "text/javascript") return define_from_javascript(data.content);
    if (format === "text/typescript") return define_from_typescript(data.content);
    throw new Error("unsupported format");
}

const func = async (context: CommandContext, data: CommandData) => {
    const command = await define(data);
    return Promise.resolve({
           commands: use(command, context.commands),
           output: {
               format: "CommandDefinition",
               content: command
           }
        }
    );
}


export const define_cmd: CommandDefinition = {
    meta, func
};