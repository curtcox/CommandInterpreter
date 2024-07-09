import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { fetch_cmd } from "./FetchCommand.ts";
import { assertStringIncludes } from "https://deno.land/std@0.223.0/assert/assert_string_includes.ts";
import { emptyContextMeta } from "../command/Empty.ts";

interface IpResponse {
  ip: string;
}

Deno.test("Fetch return expected value.", async () => {
  const command = fetch_cmd;
  const context: CommandContext = {
    commands: new Map([["fetch", command]]),
    meta: emptyContextMeta,
    input: {format: "", content: ""},
  };
  const fetchOptions = {url: "https://api64.ipify.org?format=json"};
  const options = {format: "text", content: fetchOptions};
  const result = await invoke(context, "fetch", options);
  assertEquals(result.output.format, "application/json");
  const out = result.output as CommandData;
  const response = out.content as IpResponse;
  assertStringIncludes(response.ip, ".");
});
