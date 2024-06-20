import { CommandDefinition } from "../command/CommandDefinition.ts";
import { combine, def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { nop_cmd } from "./NopCommand.ts";
import { help_cmd } from "./HelpCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { io_cmd } from "./IoCommand.ts";
import { define_cmd } from "./DefineCommand.ts";

const text_commands = [
  help_cmd,
].map((cmd) => def_from_simple(cmd));

export const commands: Map<string, CommandDefinition> = combine(text_commands, define_cmd, do_cmd, nop_cmd, io_cmd);