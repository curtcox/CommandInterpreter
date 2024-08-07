import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { claude, claude_cmd } from "./ClaudeCommand.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { store_cmd } from "../core_commands/StoreCommand.ts";
import { memory } from "../native/Stores.ts";
import { env_cmd } from "../core_commands/EnvCommand.ts";
import { def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { DenoEnv } from "../native/Envs.ts";

function run(prompt: string, content: string) {
    const store = memory();
    const context = {
        meta:emptyContextMeta,
        commands: new Map([
            ['claude', claude_cmd],
            ['log', log_cmd(store)],
            ['env', def_from_simple(env_cmd(DenoEnv))],
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
