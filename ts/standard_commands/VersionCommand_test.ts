import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { invoke, def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "./VersionCommand.ts";
import { emptyContextMeta } from "../command/Empty.ts";

Deno.test("Version returns current version.", async () => {
  const empty = {format: "", content: ""};
  const context: CommandContext = {
    commands: new Map([["version", def_from_simple(version_cmd)]]),
    meta: emptyContextMeta,
    input: empty,
  };
  const options = empty;
  const result = await invoke(context, "version", options);
  assertEquals(result.output.content, "0.0.7");
});
