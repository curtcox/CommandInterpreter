import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../CommandDefinition.ts";
import { invoke_command } from "../ToolsForCommandWriters.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { fetch_cmd } from "./FetchCommand.ts";
import { assertStringIncludes } from "https://deno.land/std@0.223.0/assert/assert_string_includes.ts";

Deno.test("Fetch return expected value.", async () => {
  const command = fetch_cmd;
  const context: CommandContext = {
    commands: {"fetch": command},
    previous: nop_cmd,
    input: {format: "", content: ""},
  };
  const result = await invoke_command(context, "fetch", "https://api64.ipify.org?format=json", {format: "", content: ""});
  assertEquals(result.output.format, "application/json");
  assertStringIncludes(result.output.content, "ip:");
});
