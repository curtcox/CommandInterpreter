import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandDefinition } from "../command/CommandDefinition.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { alias_cmd, alias } from "./AliasCommand.ts";
import { combine } from "../command/ToolsForCommandWriters.ts";
import { emptyContextMeta, emptyData } from "../command/Empty.ts";

const emptyInput = emptyData;

const def = (name: string): CommandDefinition => ({
  meta: {
    name,
    doc: "",
    source: "",
  },
  func: async (context, _options) => ({
    commands: context.commands,
    output: context.input,
  }),
});

const resolve = (context: CommandContext, text: string): CommandDefinition => {
  return context.commands[text];
}

const contextWith = (commands: CommandDefinition[]) : CommandContext => ({
  commands: combine(commands),
  meta: emptyContextMeta,
  input: emptyInput,
});

Deno.test("Text resolves to itself when no aliases", () => {
  const foo = def("foo");
  const bar = def("bar");
  const baz = def("baz");
  const context = contextWith([alias_cmd,foo, bar,baz]);
  assertEquals(foo, resolve(context, "foo"));
  assertEquals(bar, resolve(context, "bar"));
  assertEquals(baz, resolve(context, "baz"));
});

Deno.test("Can use alias to supply prefix", async () => {
  const context = contextWith([alias_cmd]);
  const defined = await alias(context, { name: 'say', expansion: 'run say' });
  assertEquals('say', defined.commands['say'].meta.name);
});

Deno.test("Can use alias to replace a command", async () => {
  const context = contextWith([alias_cmd, nop_cmd]);
  const defined = await alias(context, { name: 'nop', expansion: 'debug' });
  const replaced = defined.commands['nop'];
  assertEquals('nop', replaced.meta.name);
  assertEquals('Alias for debug', replaced.meta.doc);
});
