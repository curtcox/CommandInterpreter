import { commands } from "../commands/Commands.ts";
import { CommandRecord } from "../command/CommandDefinition.ts";
import { CommandContext, CommandResult } from "../command/CommandDefinition.ts";
import { def_from_simple, combine } from "../command/ToolsForCommandWriters.ts";
import { run } from "../core_commands/DoCommand.ts";
import { env_cmd } from "../core_commands/EnvCommand.ts";
import { store_cmd } from "../core_commands/StoreCommand.ts";
import { Store } from "../native/Native.ts";
import { emptyContextMeta } from "../command/Empty.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { DenoEnv } from "../native/Envs.ts";

const context = (store: Store, format: string, content: string) : CommandContext => ({
    commands: combine([
      def_from_simple(env_cmd(DenoEnv)),
      store_cmd(store),
      log_cmd(store)
    ], commands),
    meta: emptyContextMeta,
    input: { format: format, content: content }
});

const evaluate = (store: Store, format: string, content: string, expression: string): Promise<CommandResult> => {
  return run(context(store,format,content), expression);
};

export interface CommandEvalationRecord {
  commandRecord: CommandRecord;
  store: URL;
}

export default evaluate;