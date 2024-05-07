import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import { def_from_text, def_from_simple, SimpleCommand, TextCommand, use, invoke_with_input } from "./ToolsForCommandWriters.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { nop_cmd } from "./core_commands/NopCommand.ts";


Deno.test("Summarize content from a url.", () => {
  const command = "fetch | content | summarize";
  fail("Not implemented");
});

// intersection \ 
//     <(curl http...address.txt | \ 
//         tr -s '[:punct:][:blank:]' '\n' | \ 
//         tr '[:upper:]' '[:lower:]' | \ 
//         sort | \ 
//         uniq) \ 
//     <(curl http...dream.txt | \ 
//         tr -s '[:punct:][:blank:]' '\n' | \ 
//         tr '[:upper:]' '[:lower:]' | \ 
//         sort | \ 
//         uniq) \ 
//     2> /dev/null 
Deno.test("Common words from urls.", async () => {
  const command = "fetch | content | summarize";
  fail("Not implemented");
});

