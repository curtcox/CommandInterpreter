import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { invoke, def_from_simple } from "../command/ToolsForCommandWriters.ts";
import { version_cmd } from "../standard_commands/VersionCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { do_cmd } from "./DoCommand.ts";
import { log_cmd } from "./LogCommand.ts";
import { store_cmd } from "./StoreCommand.ts";
import { io_cmd } from "./IoCommand.ts";

const empty_previous = { command: nop_cmd, options: {format:"", content:""}};

const context = () => ({
  commands: {
      "nop": nop_cmd,
      "version": def_from_simple(version_cmd),
      "do": do_cmd,
      "log": log_cmd,
      "io": io_cmd,
      "store": store_cmd({
          get: (_key: string) => {
              return {};
          },
          set: (_key: string, _value: any) => {},
      }),
  },
  previous: empty_previous,
  input: {format: "", content: ""},
});

Deno.test("do version returns current version.", async () => {
  const result = await invoke(context(), "do", {format:"text", content:"version"});
  assertEquals(result.output.content, "0.0.7");
});

Deno.test("do version piped thu nop is still version", async () => {
  const result = await invoke(context(), "do", {format:"text", content:"version | nop"});
  assertEquals(result.output.content, "0.0.7");
});

Deno.test("do version piped thu nop twice is still version", async () => {
  const result = await invoke(context(), "do", {format:"text", content:"version | nop | nop"});
  assertEquals(result.output.content, "0.0.7");
});

Deno.test("Help is returned when there is no matching command", async () => {
  assertEquals(true, false);
});

Deno.test("Exception is thrown when there is no matching command and no help", async () => {
  assertEquals(true, false);
});

Deno.test("Execution records are sent to log", async () => {
  assertEquals(true, false);
});

Deno.test("A single command is given the expected options", async () => {
  assertEquals(true, false);
});

Deno.test("Multiple commands are given the expected options", async () => {
  assertEquals(true, false);
});

Deno.test("One step pipeline only has one log entry", async () => {
  assertEquals(true, false);
});

Deno.test("Two step pipeline only has 3 log entries (1 for the pipeline itself)", async () => {
  assertEquals(true, false);
});

Deno.test("1st pipeline step gets input from context", async () => {
  assertEquals(true, false);
});

Deno.test("1st pipeline step gets commands from context", async () => {
  assertEquals(true, false);
});

Deno.test("2nd pipeline step gets commands from 1st", async () => {
  assertEquals(true, false);
});
