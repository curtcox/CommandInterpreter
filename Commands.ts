import { CommandDefinition } from "./CommandDefinition.ts";
import { commands as core } from "./CoreCommands.ts";
import { commands as handy } from "./HandyCommands.ts";

export const commands: Record<string, CommandDefinition> = {...core, ...handy};