import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { claude, claude_cmd } from "./ClaudeCommand.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { store_cmd } from "../core_commands/StoreCommand.ts";
import { memory } from "../core_commands/StoreCommand.ts";
import { env_cmd } from "../core_commands/EnvCommand.ts";
import { def_from_simple } from "../command/ToolsForCommandWriters.ts";

const env:Map<string,string> = new Map();
const native_env = {
    get: (key:string) => env.get(key) || Deno.env.get(key) || `Missing environment variable: ${key}`,
    set: (key:string, value:string) => env.set(key,value)
}

function run(prompt: string, content: string) {
    const store = memory();
    const context = {
        meta:emptyContextMeta,
        commands: new Map([
            ['claude', claude_cmd],
            ['log', log_cmd(store)],
            ['env', def_from_simple(env_cmd(native_env))],
            ['store', store_cmd(store)]
            ]),
        input: emptyData
    }
    return claude(context,prompt,content);
}

Deno.test("Claude demo", async () => {
    const x = await run("What is your name?","");
    console.log({x});
});
