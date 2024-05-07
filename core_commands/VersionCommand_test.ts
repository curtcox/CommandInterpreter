import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../CommandDefinition.ts";
import { invoke, def_from_text } from "../ToolsForCommandWriters.ts";
import { version_cmd } from "./VersionCommand.ts";
import { nop_cmd } from "./NopCommand.ts";

Deno.test("Version returns current version.", async () => {
  const context: CommandContext = {
    commands: {"version": def_from_text(version_cmd)},
    previous: nop_cmd,
    input: {format: "", content: ""},
  };
  const data = {format: "", content: ""};
  const result = await invoke(context, "version", data);
  assertEquals(result.output.content, "0.0.7");
});
