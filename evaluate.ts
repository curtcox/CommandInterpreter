import { commands } from "./commands/Commands.ts";
import { CommandDefinition, CommandResult } from "./command/CommandDefinition.ts";
import { def_from_simple } from "./command/ToolsForCommandWriters.ts";
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

function combine(command: CommandDefinition[], commands: Record<string, CommandDefinition>) : Record<string, CommandDefinition> {
  const extra = command.map((cmd) => [cmd.meta.name, cmd]);
  return {
    ...commands,
    ...Object.fromEntries(extra),
  };
}

const context = (format: string, content: string) => ({
    commands: combine([
      def_from_simple(env_cmd(native_env)),
      store_cmd(native_store),
    ], commands),
    previous: nop_cmd,
    input: { format: format, content: content }
});

const evaluate = (format: string, content: string, expression: string): Promise<CommandResult> => {
  return run(context(format,content), expression);
};

export default evaluate;