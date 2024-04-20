import { CommandDefinition } from "./CommandDefinition.ts";
import { commands as core } from "./core_commands/CoreCommands.ts";
import { commands as handy } from "./HandyCommands.ts";

export const commands: Record<string, CommandDefinition> = {...core, ...handy};