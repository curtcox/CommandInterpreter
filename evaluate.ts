import { commands } from "./commands/Commands.ts";
import { CommandContext, CommandResult } from "./command/CommandDefinition.ts";
import { def_from_simple, combine } from "./command/ToolsForCommandWriters.ts";
import { run } from "./core_commands/DoCommand.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";
import { env_cmd } from "./core_commands/EnvCommand.ts";
import { store_cmd, memory, filesystem, json_io } from "./core_commands/StoreCommand.ts";

const env:Map<string,string> = new Map();

const native_env = {
  get: (key:string) => env.get(key) || Deno.env.get(key) || `Missing environment variable: ${key}`,
  set: (key:string, value:string) => env.set(key,value)
}

const memory_store = memory();
const file_store = filesystem("store",json_io(),"json");
const native_store = file_store;

const context = (format: string, content: string) : CommandContext => ({
    commands: combine([
      def_from_simple(env_cmd(native_env)),
      store_cmd(native_store),
    ], commands),
    previous: {command: nop_cmd, options: { format: "", content: "" }},
    input: { format: format, content: content }
});

const evaluate = (format: string, content: string, expression: string): Promise<CommandResult> => {
  return run(context(format,content), expression);
};

export default evaluate;