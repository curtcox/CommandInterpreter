import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { invoke } from "../command/ToolsForCommandWriters.ts";
import { run, run_cmd } from "./RunCommand.ts";
import { assertStringIncludes } from "https://deno.land/std@0.223.0/assert/assert_string_includes.ts";
import { emptyContextMeta } from "../command/Empty.ts";

Deno.test("date returns expected value.", async () => {
  const command = run_cmd;
  const context: CommandContext = {
    commands: new Map([["run", command]]),
    meta: emptyContextMeta,
    input: {format: "", content: ""},
  };
  const options = {format: "string", content: "date"};
  const result = await invoke(context, "run", options);
  assertEquals(result.output.format, "string");
  const out = result.output as CommandData;
  const response = out.content as string;
  assertStringIncludes(response, ":");
});

Deno.test("direct run demo", () => {
    console.log({result:run(`sh`,`-c 'echo "howdy" | say`)});
});