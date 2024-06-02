import { assertEquals, assert, fail } from "https://deno.land/std/assert/mod.ts";
import evaluate from "./evaluate.ts";
import { get } from "./core_commands/StoreCommand.ts";
import { are_equal } from "./Objects.ts";
import { CommandData, CommandError } from "./command/CommandDefinition.ts";
import { assertInstanceOf } from "https://deno.land/std@0.223.0/assert/assert_instance_of.ts";

Deno.test("evaluate valid expression", async () => {
  const result = await evaluate("","","eval 2 + 3 * 4");
  assertEquals(result.output.content, "14");
});

Deno.test("evaluate expression with variables", async () => {
  const result = await evaluate("","","eval x = 5; x * 2");
  assertEquals(result.output.content, "5");
});

Deno.test("evaluate expression with variables", async () => {
  const result = await evaluate("string","Hello","nop with options that are lost like tears in rain");
  assertEquals(result.output, { format: "string", content: "Hello" });
});

Deno.test("evaluate invalid expression", async () => {
  try {
    await evaluate("","","eval 2 + 3 * 4 /");
    fail();
  } catch (_error) {
   // should throw an error
  }
});

Deno.test("error is written to store", async () => {
  try {
    await evaluate("","","eval 2 + 3 * 4 /");
    fail();
  } catch (error) {
    assertInstanceOf(error,CommandError);
    assertEquals(error.message, "Unexpected token '}'");
    const context = error.context;
    const logged = await get(context, "log/0");
    const data = logged as CommandData;
    console.log({data});
    assertEquals(data.format, "CommandError");
    assertInstanceOf(data.content,CommandError);
    const ce = data.content as CommandError;
    console.log({error,ce});
    assert(are_equal(error, ce));
   // should throw an error
  }
});