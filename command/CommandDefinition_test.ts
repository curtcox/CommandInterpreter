import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { invoke, def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "../standard_commands/VersionCommand.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { do_cmd } from "../core_commands/DoCommand.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { store_cmd } from "../core_commands/StoreCommand.ts";
import { io_cmd } from "../core_commands/IoCommand.ts";
import { eval_cmd } from "../standard_commands/EvalCommand.ts";
import { CommandRecord } from "../command/CommandDefinition.ts";
import { CommandDefinition, DO } from "../command/CommandDefinition.ts";
import { memory as memoryStore, Native as nativeStore } from "../core_commands/StoreCommand.ts";
import { memory as memoryEnv } from "../core_commands/EnvCommand.ts";
import { CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";
import { echo_cmd } from "../standard_commands/EchoCommand.ts";
import { env_cmd } from "../core_commands/EnvCommand.ts";
import { alias_cmd } from "../standard_commands/AliasCommand.ts";
import { rerun, resume } from "./ToolsForCommandExecution.ts";

const commands = (store: nativeStore):Record<string, CommandDefinition> => ({
    "nop": nop_cmd,
    "version": def_from_simple(version_cmd),
    "echo": echo_cmd,
    "env": def_from_simple(env_cmd(memoryEnv())),
    "eval": def_from_simple(eval_cmd),
    "do": do_cmd,
    "log": log_cmd,
    "io": io_cmd,
    "alias": alias_cmd,
    "store": store_cmd(store),
});
  
const context = (store: nativeStore): CommandContext => ({
    meta: emptyContextMeta,
    commands: combine(commands(store)),
    input: emptyData,
});
  
async function run(pipeline: string): Promise<CommandRecord> {
    return await run_pipeline(pipeline, 1);
}

async function run_pipeline(pipeline: string, index: number): Promise<CommandRecord> {
    const store = memoryStore();
    const ctx = context(store);
    const result = await invoke(ctx, DO, {format: "string", content:pipeline});
    const logged = await store.get(`log/${index}`) as CommandData;
    assertEquals(logged.format, "CommandRecord");
    const record = logged.content as CommandRecord;
    assertEquals(record.result.output.content, result.output.content);
    return Promise.resolve(record);
}
  
Deno.test("version command can be re-run from a command record", async () => {
    const record = await run("version");
    const result = await rerun(record);
    assertEquals(result.output, record.result.output);
});

Deno.test("nop command can be re-run from a command record", async () => {
    const record = await run("nop");
    const result = await rerun(record);
    assertEquals(result.output, record.result.output);
});

Deno.test("eval command can be re-run from a command record", async () => {
    const record = await run("eval 8 * 8");
    const result = await rerun(record);
    assertEquals(result.output.content, "64");
    assertEquals(result.output, record.result.output);
});

Deno.test("eval command can be re-run from a pipeline record", async () => {
    const record = await run_pipeline("alias x2 eval ${input} * 2 | eval 2 | x2",3);
    const result = await rerun(record);
    assertEquals(result.output.content, "4");
    assertEquals(result.output, record.result.output);
});

Deno.test("eval can be continued from a pipeline record", async () => {
    const record = await run_pipeline("alias x2 eval ${input} * 2 | eval 2 | x2",3);
    const result = await resume(record, "x2 | x2");
    assertEquals(result.output.content, "16");
});

// Deno.test("version can be continued from a command record", async () => {
// });

// Deno.test("nop can be continued from a command record", async () => {
// });


// Deno.test("eval error can be recreated from a CommandError", async () => {
// });