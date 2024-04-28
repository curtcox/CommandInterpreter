import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext, CommandDefinition } from "../CommandDefinition.ts";
import { define_cmd } from "./DefineCommand.ts";
import { nop_cmd } from "./NopCommand.ts";

const empty_commands: Record<string, CommandDefinition> = {};

const empty_context: CommandContext = {
  commands: empty_commands,
  previous: nop_cmd,
  input: {
    format: "text",
    content: "prefix"
  }
}

const context_with_func = (content: string) => ({
  commands: empty_commands,
  previous: nop_cmd,
  input: {
    format: "text",
    content: content
  }
});

const options = (options: string) => ({
  format: "options",
  content: options
});

Deno.test("define function from options using arrow function", async () => {
    const f = "add: (x: number, y: number) => x + y";
    const defined = await define_cmd.func(empty_context, f);
    assertEquals(defined.output.content, "defined add");

    const commands = defined.commands;
    const sum = await commands["add"].func(empty_context, options("--x=10 --y=2"));
    assertEquals(sum.output.content, "12");
});

Deno.test("define function from options using function declaration", async () => {
    const f = "function cat(p1, p2) { return p1 + p2; }";
    const defined = await define_cmd.func(empty_context, options(f));
    assertEquals(defined.output.content, "defined cat");

    const commands = defined.commands;
    const cat = await commands["cat"].func(empty_context, options("--p1=Hey --p2=You"));
    assertEquals(cat.output.content, "HeyYou");
});

Deno.test("define function from options using function expression", async () => {
    const f = "const rgb = function(r, g, b) { return `rgb(${r},${g},${b})`; }";
    const defined = await define_cmd.func(empty_context, f);
    assertEquals(defined.output.content, "defined rbg");

    const commands = defined.commands;
    const rgb = await commands["rgb"].func(empty_context, options("--r=10 --g=4 --b=2"));
    assertEquals(rgb.output.content, "rgb(10,4,2)");
});

Deno.test("define function from input using arrow function", async () => {
    const f = "multiply: (a: number, b: number) => a * b";
    const defined = await define_cmd.func(context_with_func(f), options(""));
    assertEquals(defined.output.content, "defined multiply");

    const commands = defined.commands;
    const multiply = await commands["multiply"].func(empty_context, options("--a=10 --b=2"));
    assertEquals(multiply.output.content, "20");
});

Deno.test("define function from input using function declaration", async () => {
    const f = `
    function dup(times: number) {
        let out = "";
        for (let i = 0; i < times; i++) {
            out += input;
        }
        return out;
    }`;
    const defined = await define_cmd.func(context_with_func(f), options(""));
    assertEquals(defined.output.content, "dup");

    const commands = defined.commands;
    const duped = await commands["dup"].func(context_with_func("root"), options("3"));
    assertEquals(duped.output.content, "rootrootroot");
});