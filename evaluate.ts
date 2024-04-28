import { commands } from "./Commands.ts";
import { DO, CommandDefinition } from "./CommandDefinition.ts";
import { def_from_text } from "./ToolsForCommandWriters.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";
import { env_cmd } from "./core_commands/EnvCommand.ts";
import { store_cmd, memory } from "./core_commands/StoreCommand.ts";

const env:Map<string,string> = new Map();

const native_env = {
  get: (key:string) => env.get(key) || Deno.env.get(key) || `Missing environment variable: ${key}`,
  set: (key:string, value:string) => env.set(key,value)
}

const native_store = memory();

function combine(command: CommandDefinition[], commands: Record<string, CommandDefinition>) : Record<string, CommandDefinition> {
  const extra = command.map((cmd) => [cmd.meta.name, cmd]);
  return {
    ...commands,
    ...Object.fromEntries(extra),
  };
}

const context = (format: string, content: string) => ({
    commands: combine([
      def_from_text(env_cmd(native_env)),
      store_cmd(native_store),
    ], commands),
    previous: nop_cmd,
    input: { format: format, content: content }
});

const evaluate = (format: string, content: string, expression: string): any => {
  const ctx = context(format,content);
  const cmd = ctx.commands[DO];
  return cmd.func(ctx, {format: "text", content: expression});
};
  
export default evaluate;