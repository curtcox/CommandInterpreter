import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandDefinition } from "../command/CommandDefinition.ts";
import { nop_cmd } from "../core_commands/NopCommand.ts";
import { alias_cmd, alias } from "./AliasCommand.ts";

const emptyInput = {
  format: "",
  content: "",
};

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
  commands: commands.reduce((acc, cmd) => ({ ...acc, [cmd.meta.name]: cmd }), {}),
  previous: nop_cmd,
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
  const defined = await alias(context, 'say', 'run','say');
  assertEquals('run', defined.commands['say'].meta.name);
});
