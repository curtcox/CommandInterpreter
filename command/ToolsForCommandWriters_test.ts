import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import { def_from_simple, SimpleCommand, invoke_with_input, combine, string_for } from "./ToolsForCommandWriters.ts";
import { CommandContext } from "./CommandDefinition.ts";
import { CommandDefinition } from "./CommandDefinition.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { emptyContextMeta, emptyData } from "./Empty.ts";
import { log_cmd } from "../core_commands/LogCommand.ts";
import { store_cmd } from "../core_commands/StoreCommand.ts";
import { memory as memoryStore } from "../core_commands/StoreCommand.ts";
import { assertStringIncludes } from "https://deno.land/std@0.223.0/assert/assert_string_includes.ts";

const commands: Map<string, CommandDefinition> = new Map();

const context: CommandContext = {
  commands: commands,
  meta: emptyContextMeta,
  input: {
    format: "text",
    content: "World"
  }
}

const dasher: SimpleCommand = {
  name: "dasher",
  doc: "put in a dash",
  source: import.meta.url,
  func: (context: CommandContext, options: string) => {
    return Promise.resolve(`${options}-${context.input.content}`);
  }
};

Deno.test("def from simple produces expected command", () => {
  const command = def_from_simple(dasher);
  const meta = command.meta;
  assertEquals(meta.name, "dasher");
  assertEquals(meta.doc, "put in a dash");
});

Deno.test("calling def from simple produces the expected result", async () => {
  const command = def_from_simple(dasher);
  const result = await command.func(context, {format:"string", content:"Hello"});
  assertEquals(result, {
    commands: commands,
    output: {
      format: "string",
      content: "Hello-World"
    }
  });
});

const coloner: SimpleCommand = {
  name: "coloner",
  doc: "put in a colon",
  source: import.meta.url,
  func: (context: CommandContext, options: string) => {
    return Promise.resolve(`${options}:${context.input.content}`);
  }
};

Deno.test("def from text produces expected command", () => {
  const command = def_from_simple(coloner);
  const meta = command.meta;
  assertEquals(meta.name, "coloner");
  assertEquals(meta.doc, "put in a colon");
});

Deno.test("calling def from text produces expected value", async () => {
  const command = def_from_simple(coloner);
  const result = await command.func(context, {format:"string", content:"Hello"});
  assertEquals(result, {
    commands: commands,
    output: {
      format: "string",
      content: "Hello:World"
    }
  });
});

Deno.test("Invoke command returns input from nop command", async () => {
  const ignored = emptyData;
  const meta = emptyContextMeta;
  const ctx = { meta, commands: combine(nop_cmd,commands), input: ignored };
  const input = {format: "string", content: "value"};
  const data = {format: "string", content: ""};
  const result = await invoke_with_input(ctx, "nop", data, input);
  assertEquals(result.output, input);
});

Deno.test("Invoke command throws a helpful exception when log is misconfigured.", async () => {
  const ignored = emptyData;
  const meta = emptyContextMeta;
  const ctx = { meta, commands: combine(nop_cmd,commands), input: ignored };
  const input = {format: "string", content: "value"};
  const data = {format: "string", content: ""};
  try {
    await invoke_with_input(ctx, "nope", data, input);
    fail("Expected an exception.");
  } catch (e) {
    assertEquals(e.message, "Command not found: log in nop");
  }
});

Deno.test("Invoke command throws a helpful exception when command not found.", async () => {
  const ignored = emptyData;
  const meta = emptyContextMeta;
  const memory = memoryStore(); 
  const ctx = { meta, commands: combine(nop_cmd,log_cmd(memory), store_cmd(memory)), input: ignored };
  const input = {format: "string", content: "value"};
  const data = {format: "string", content: ""};
  try {
    await invoke_with_input(ctx, "nope", data, input);
    fail("Expected an exception.");
  } catch (e) {
    assertEquals(e.message, "Command not found: nope in nop,log,store");
  }
});

Deno.test("Combine produces expected commands from singles", () => {
  const memory = memoryStore();
  const nop = nop_cmd;
  const log = log_cmd(memory);
  const store = store_cmd(memory);
  const commands = combine(nop, log, store);
  const keys = Array.from(commands.keys());
  assertEquals(keys, ["nop", "log", "store"]);
  assertEquals(commands.get("nop"), nop);
  assertEquals(commands.get("log"), log);
  assertEquals(commands.get("store"), store);
});

Deno.test("Combine produces expected commands from arrays", () => {
  const memory = memoryStore();
  const nop = nop_cmd;
  const log = log_cmd(memory);
  const store = store_cmd(memory);
  const commands = combine([nop], [log], [store]);
  const keys = Array.from(commands.keys());
  assertEquals(keys, ["nop", "log", "store"]);
  assertEquals(commands.get("nop"), nop);
  assertEquals(commands.get("log"), log);
  assertEquals(commands.get("store"), store);
});

Deno.test("Combine produces expected commands from maps", () => {
  const memory = memoryStore();
  const nop = nop_cmd;
  const log = log_cmd(memory);
  const store = store_cmd(memory);
  const commands = combine(new Map([['nop',nop]]), new Map([['log',log]]), new Map([['store',store]]));
  const keys = Array.from(commands.keys());
  assertEquals(keys, ["nop", "log", "store"]);
  assertEquals(commands.get("nop"), nop);
  assertEquals(commands.get("log"), log);
  assertEquals(commands.get("store"), store);
});

Deno.test("Combine produces expected commands from singleton map", () => {
  const nop = nop_cmd;
  const commands = combine(new Map([['nop',nop]]));
  const keys = Array.from(commands.keys());
  assertEquals(keys, ["nop"]);
  assertEquals(commands.get("nop"), nop);
});

Deno.test("string_for string returns that string", () => {
  assertEquals(string_for("string"), "string");
  assertEquals(string_for("Hello"), "Hello");
  assertEquals(string_for("Hello World"), "Hello World");
  assertEquals(string_for("{}"), "{}");
});

Deno.test("string_for map contains keys and values", () => {
  assertEquals(string_for(new Map()), "{}");
  assertEquals(string_for(new Map([['key','value']])), "{key: value}");
  assertEquals(string_for(new Map([['k1','v1'],['k2','v2']])), "{k1: v1, k2: v2}");
});

Deno.test("string_for context contains commands", () => {
  const context = {
    meta: emptyContextMeta,
    commands: new Map([['echo','def of comm']]),
    input: emptyData
  };

  const actual = string_for(context);
  assertStringIncludes(actual, "meta");
  assertStringIncludes(actual, "commands");
  assertStringIncludes(actual, "input");
  assertStringIncludes(actual, "echo");
  assertStringIncludes(actual, "def of comm");
});
