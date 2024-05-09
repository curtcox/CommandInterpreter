import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
import { define_cmd } from "./DefineCommand.ts";
import { nop_cmd } from "./NopCommand.ts";
import { fail } from "https://deno.land/std@0.223.0/assert/fail.ts";

const empty_commands: Record<string, CommandDefinition> = {};
const empty_data: CommandData = {
  format: "text",
  content: ""
}

const empty_context: CommandContext = {
  commands: empty_commands,
  previous: nop_cmd,
  input: {
    format: "text",
    content: "prefix"
  }
}

const input = (data: CommandData) => ({
  commands: empty_commands,
  previous: nop_cmd,
  input: data
})

const javascript = (content: string) => ({
  format: "application/javascript",
  content: content
});

const typescript = (content: string) => ({
  format: "application/typescript",
  content: content
});

const url = (content: string) => ({
  format: "URL",
  content: content
});

Deno.test("define function from full JavaScript definition", async () => {
    const defined = await define_cmd.func(empty_context, javascript(
      `export const command = {
        meta: {
          name: "nop",
          doc: "javascript nop",
          source: import.meta.url,
        },
        func: (context, _options) => {
          return Promise.resolve({
            commands: context.commands,
            output: context.input
          });
        }
      };
    `));
    const out = defined.output.content.meta;
    assertEquals(out.name, "nop");

    const commands = defined.commands;
    const nop = commands["nop"];
    const meta = nop.meta;
    assertEquals(meta.name, "nop");
    assertEquals(meta.doc, "javascript nop");

    const data1 = {format: "URL", content: new URL(import.meta.url)};
    const result1 = await nop.func(input(data1), empty_data);
    assertEquals(result1.output, data1);

    const data2 = {format: "URL", content: {p1:"Hello", p2:"There"}};
    const result2 = await nop.func(input(data2), empty_data);
    assertEquals(result2.output, data2);
});

Deno.test("define function from full TypeScript definition", async () => {
  const defined = await define_cmd.func(empty_context, typescript(
    `import { CommandDefinition, CommandContext, CommandData } from "https://raw.githubusercontent.com/curtcox/CommandInterpreter/main/CommandDefinition.ts";

    export const command: CommandDefinition = {
        meta: {
          name: "nop",
          doc: "typescript nop",
          source: import.meta.url,
        },
        func: (context: CommandContext, _options: CommandData) => {
          return Promise.resolve({
            commands: context.commands,
            output: context.input
          });
        }
      };
  `));
  const out = defined.output.content.meta;
  assertEquals(out.name, "nop");

  const commands = defined.commands;
  const nop = commands["nop"];
  const meta = nop.meta;
  assertEquals(meta.name, "nop");
  assertEquals(meta.doc, "typescript nop");

  const data1 = {format: "URL", content: new URL(import.meta.url)};
  const result1 = await nop.func(input(data1), empty_data);
  assertEquals(result1.output, data1);

  const data2 = {format: "URL", content: {p1:"Hello", p2:"There"}};
  const result2 = await nop.func(input(data2), empty_data);
  assertEquals(result2.output, data2);
});

Deno.test("define function from full TypeScript URL", async () => {
  const defined = await define_cmd.func(empty_context, url("https://esm.town/v/curtcox/EmailCommand"));
  const out = defined.output.content.meta;
  assertEquals(out.name, "email");

  const commands = defined.commands;
  const email = commands["email"];
  const meta = email.meta;
  assertEquals(meta.name, "email");
  assertEquals(meta.doc, "send an email");

  const message = {format: "EmailOptions", content: {subject:"Hello", text:"There"}};
  try {
    await email.func(input(message), message);
    fail("should have thrown an error");
  } catch (error) {
    assertEquals(error.message, "Val Town Email Error: Unauthorized");
  }
});



// Deno.test("define function from options using arrow function", async () => {
//     const defined = await define_cmd.func(empty_context, javascript("add: (x: number, y: number) => x + y"));
//     assertEquals(defined.output.content, "defined add");

//     const commands = defined.commands;
//     const add = commands["add"];
//     assertEquals(add.meta.name, "add");

//     const json = await add.func(empty_context, { format: "JSON", content: '{"x":10, "y":2}' });
//     assertEquals(json.output.content, 12);

//     const obj = await add.func(empty_context, { format: "object", content: {x:10, y:2} });
//     assertEquals(obj.output.content, 12);
// });

// Deno.test("define function from options using function declaration", async () => {
//     const defined = await define_cmd.func(empty_context, javascript("function cat(p1, p2) { return p1 + p2; }"));
//     assertEquals(defined.output.content, "defined cat");

//     const commands = defined.commands;
//     const cat = commands["cat"];
//     assertEquals(cat.meta.name, "cat");
    
//     const json = await cat.func(empty_context, { format: "JSON", content: '{"p1":"Hey", "p2":"You"}' });
//     assertEquals(json.output.content, "HeyYou");

//     const obj = await cat.func(empty_context, { format: "object", content: {p1:"Hello", p2:"There"} });
//     assertEquals(obj.output.content, "HelloThere");
// });

// Deno.test("define function from options using function expression", async () => {
//     const defined = await define_cmd.func(empty_context, javascript("const rgb = function(r, g, b) { return `rgb(${r},${g},${b})`; }"));
//     assertEquals(defined.output.content, "defined rgb");

//     const commands = defined.commands;
//     const rgb = commands["rgb"];
//     assertEquals(rgb.meta.name, "rgb");
    
//     const json = await rgb.func(empty_context, { format: "JSON", content: '{"r":10, "g":4, "b":2}' });
//     assertEquals(json.output.content, "rgb(10,4,2)");

//     const obj = await rgb.func(empty_context, { format: "object", content: {r:3, g:6, b:9} });
//     assertEquals(obj.output.content, "rgb(3,6,9)");
// });

// Deno.test("define function from input using arrow function", async () => {
//     const defined = await define_cmd.func(empty_context, javascript("multiply: (a: number, b: number) => a * b"));
//     assertEquals(defined.output.content, "defined multiply");

//     const commands = defined.commands;
//     const multiply = commands["multiply"];
//     assertEquals(multiply.meta.name, "multiply");
    
//     const json = await multiply.func(empty_context, { format: "JSON", content: '{"a":10, "b":2 }' });
//     assertEquals(json.output.content, 20);

//     const obj = await multiply.func(empty_context, { format: "object", content: {a:3, b:9} });
//     assertEquals(obj.output.content, 27);
// });

// Deno.test("define function from input using function declaration", async () => {
//     const f = `
//     function dup(times: number) {
//         let out = "";
//         for (let i = 0; i < times; i++) {
//             out += input;
//         }
//         return out;
//     }`;
//     const defined = await define_cmd.func(context_with_func(f), javascript(""));
//     const commands = defined.commands;
//     const dup = commands["dup"];
//     assertEquals(dup.meta.name, "dup");

//     const json = await dup.func(context_with_func("root"), { format: "JSON", content: '{"times":3}' });
//     assertEquals(json.output.content, "rootrootroot");

//     const obj = await dup.func(context_with_func("Run"), { format: "JSON", content: '{"times":4}' });
//     assertEquals(json.output.content, "RunRunRunRun");
// });