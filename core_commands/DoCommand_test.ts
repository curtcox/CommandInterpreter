import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext } from "../CommandDefinition.ts";
import { invoke_command, def_from_text } from "../ToolsForCommandWriters.ts";
import { version_cmd } from "./VersionCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { store_cmd } from "./StoreCommand.ts";

Deno.test("do version returns current version.", async () => {
  const context: CommandContext = {
    commands: {
        "version": def_from_text(version_cmd),
        "do": do_cmd,
        "log": log_cmd,
        "store": store_cmd({
            get: (_key: string) => {
                return {};
            },
            set: (_key: string, _value: any) => {},
        }),
    },
    previous: nop_cmd,
    input: {format: "", content: ""},
  };
  const ignore = {format: "", content: ""}
  const result = await invoke_command(context, "do", {format:"text", content:"version"}, ignore);
  assertEquals(result.output.content, "0.0.7");
});

Deno.test("do version piped thu nop is still version", async () => {
  const context: CommandContext = {
    commands: {
        "version": def_from_text(version_cmd),
        "nop": nop_cmd,
        "do": do_cmd,
        "log": log_cmd,
        "store": store_cmd({
            get: (_key: string) => {
                return {};
            },
            set: (_key: string, _value: any) => {},
        }),
    },
    previous: nop_cmd,
    input: {format: "", content: ""},
  };
  const ignore = {format: "", content: ""}
  const result = await invoke_command(context, "do", {format:"text", content:"version | nop"}, ignore);
  assertEquals(result.output.content, "0.0.7");
});
