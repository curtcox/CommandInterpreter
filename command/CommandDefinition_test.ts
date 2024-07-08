import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { invoke, def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "../standard_commands/VersionCommand.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { do_cmd } from "../core_commands/DoCommand.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { Native, store_cmd, filename_safe } from "../core_commands/StoreCommand.ts";
import { io_cmd } from "../core_commands/IoCommand.ts";
import { eval_cmd } from "../standard_commands/EvalCommand.ts";
import { CommandCompletionRecord } from "../command/CommandDefinition.ts";
import { CommandDefinition, DO } from "../command/CommandDefinition.ts";
import { debug as memoryStore, Native as nativeStore } from "../core_commands/StoreCommand.ts";
import { memory as memoryEnv } from "../core_commands/EnvCommand.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { CommandData } from "../command/CommandDefinition.ts";
import { CommandError } from "../command/CommandDefinition.ts";
import { emptyContext, emptyContextMeta, emptyData, emptyDuration } from "../command/Empty.ts";
import { echo_cmd } from "../standard_commands/EchoCommand.ts";
import { env_cmd } from "../core_commands/EnvCommand.ts";
import { alias_cmd } from "../standard_commands/AliasCommand.ts";
import { rerun, retry, resume } from "./ToolsForCommandExecution.ts";
import { fail } from "https://deno.land/std@0.223.0/assert/fail.ts";
import { assertInstanceOf } from "https://deno.land/std@0.223.0/assert/assert_instance_of.ts";
import { emptyInvocation } from "./Empty.ts";
import { lookupJson } from '../core_commands/RefCommand.ts';
import { Hash } from "../Ref.ts";
import { nonEmpty } from "../Check.ts";
import { deserialize } from "../core_commands/ObjCommand.ts";

const eval_command = def_from_simple(eval_cmd);

const commands = (store: nativeStore):Map<string, CommandDefinition> => new Map([
    ['nop', nop_cmd],
    ['version', def_from_simple(version_cmd)],
    ['echo', echo_cmd],
    ['env', def_from_simple( env_cmd( memoryEnv())) ],
    ['eval', eval_command],
    ['do', do_cmd],
    ['log', log_cmd(store)],
    ['io', io_cmd],
    ['alias', alias_cmd],
    ['store', store_cmd(store)],
]);
  
const context = (store: nativeStore): CommandContext => ({
    meta: emptyContextMeta,
    commands: combine(commands(store)),
    input: emptyData,
});
  
async function run(pipeline: string): Promise<CommandCompletionRecord> {
    return await run_pipeline(pipeline, 1);
}

function lookup_hash_in_store(key:Hash, store: Native): string {
    const name = `hash/${filename_safe(key.value)}`;
    return store.get(name) || "";
}

async function run_pipeline(pipeline: string, index: number): Promise<CommandCompletionRecord> {
    const store = memoryStore();
    const ctx = context(store);
    const result = await invoke(ctx, DO, {format: "string", content:pipeline});
    const logged = await store.get(`log/${index}`);
    if (logged === undefined) {
        fail(`No log entry for index ${index}`);
    }
    // console.log({index, logged});
    const lookup = (key:Hash) => lookup_hash_in_store(key, store);
    const json = nonEmpty(lookupJson(logged, lookup));
    const data = deserialize(json) as CommandData;
    assertEquals(data.format, "CommandCompletionRecord");
    const record = data.content as CommandCompletionRecord;
    assertEquals(record.result.output.content, result.output.content);
    assertEquals(record.result.commands.size, result.commands.size);
    assertEquals(record.result.commands.keys, result.commands.keys);
    return record;
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

Deno.test("version can be continued from a command record", async () => {
    const record = await run_pipeline("version",1);
    const result = await resume(record, 'eval "Mr. ${input}"');
    assertEquals(result.output.content, 'Mr. 0.0.7');
});

Deno.test("nop can be continued from a command record", async () => {
    const record = await run_pipeline("version | nop", 2);
    const result = await resume(record, 'eval ">>> ${input} <<<"');
    assertEquals(result.output.content, '>>> 0.0.7 <<<');
});

Deno.test("eval error can be recreated from a CommandError", async () => {
    try {
        await run("eval 0.0.7");
        fail();
    } catch (e1) {
        // console.log({e1});
        assertInstanceOf(e1, CommandError);
        const ce1 = e1 as CommandError;
        assertEquals(ce1.id,0);
        assertEquals(ce1.command,do_cmd);
        assertEquals(ce1.options,{format:"string", content:"eval 0.0.7"});
        assertEquals(ce1.name,"CommandError");
        assertEquals(ce1.message,"Unexpected number");
        try {
            await retry(ce1);
            fail();
        } catch (e2) {
            const ce2 = e2 as CommandError;
            assertEquals(ce1.name,ce2.name);
            assertEquals(ce1.message,ce1.message);
            assertEquals(ce1.context,ce2.context);
            assertEquals(ce1.command,ce2.command);
            assertEquals(ce1.options,ce2.options);
        }
    }
});

Deno.test("Command error can accept attributes from error", () => {
    const message = "Test error";
    const error = new Error(message);
    const context = emptyContext;
    const duration = emptyDuration;
    const invocation = emptyInvocation;
    const ce = new CommandError(context, invocation, duration, message);
    ce.cause = error;
    ce.stack = error.stack;
    assertEquals(ce.message, message);
    assertEquals(ce.cause, error);
    assertEquals(ce.stack, error.stack);
});
