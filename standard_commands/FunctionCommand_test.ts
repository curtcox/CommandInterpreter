// The tests below were in for DefineCommand.
// However, a more targeted future command for defining commands directly from functions
// is probably a better idea.

// import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.223.0/assert/mod.ts";
// import { CommandContext, CommandData, CommandDefinition } from "../command/CommandDefinition.ts";
// import { define_cmd } from "./DefineCommand.ts";
// import { nop_cmd } from "./NopCommand.ts";
// import { fail } from "https://deno.land/std@0.223.0/assert/fail.ts";

// const empty_commands: Record<string, CommandDefinition> = {};
// const empty_data: CommandData = {
//   format: "text",
//   content: ""
// }
// const no_previous = {command: nop_cmd, options: empty_data};

// const empty_context: CommandContext = {
//   commands: empty_commands,
//   previous: no_previous,
//   input: {
//     format: "text",
//     content: "prefix"
//   }
// }

// const input = (data: CommandData) => ({
//   commands: empty_commands,
//   previous: no_previous,
//   input: data
// })

// const javascript = (content: string) => ({
//   format: "application/javascript",
//   content: content
// });

// const typescript = (content: string) => ({
//   format: "application/typescript",
//   content: content
// });

// const url = (content: string) => ({
//   format: "URL",
//   content: content
// });

// Deno.test("define function from options using javascript arrow function", async () => {
//     const defined = await define_cmd.func(empty_context, javascript("add: (x, y) => x + y"));
//     const definition = defined.output.content;
//     console.log({definition});
//     assertStringIncludes(definition,"add:");
//     assertStringIncludes(definition,"[Function: add]");

//     const commands = defined.commands;
//     const add = commands["add"];
//     assertEquals(add.meta.name, "add");

//     const json = await add.func(empty_context, { format: "JSON", content: '{"x":10, "y":2}' });
//     assertEquals(json.output.content, 12);

//     const obj = await add.func(empty_context, { format: "object", content: {x:10, y:2} });
//     assertEquals(obj.output.content, 12);
// });

// Deno.test("define function from options using typescript arrow function", async () => {
//   const defined = await define_cmd.func(empty_context, typescript("add: (x: number, y: number) => x + y"));
//   assertEquals(defined.output.content, "defined add");

//   const commands = defined.commands;
//   const add = commands["add"];
//   assertEquals(add.meta.name, "add");

//   const json = await add.func(empty_context, { format: "JSON", content: '{"x":10, "y":2}' });
//   assertEquals(json.output.content, 12);

//   const obj = await add.func(empty_context, { format: "object", content: {x:10, y:2} });
//   assertEquals(obj.output.content, 12);
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