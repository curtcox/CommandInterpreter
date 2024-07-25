import { CommandDefinition } from "../command/CommandDefinition.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";
import { commands as core } from "../core_commands/CoreCommands.ts";
import { commands as standard } from "../standard_commands/StandardCommands.ts";
import { commands as handy } from "./HandyCommands.ts";

export const commands: Map<string, CommandDefinition> = combine(core,standard,handy);