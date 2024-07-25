import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { gpt, gpt_cmd } from "./GptCommand.ts";
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
            ['gpt', gpt_cmd],
            ['log', log_cmd(store)],
            ['env', def_from_simple(env_cmd(DenoEnv))],
            ['store', store_cmd(store)]
        ]),
        input: emptyData
    }
    return gpt(context,prompt,content);
}

Deno.test("GPT demo", async () => {
    const x = await run("What is your name?","");
    console.log({x});
});