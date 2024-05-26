import { assertEquals, assert, fail } from "https://deno.land/std/assert/mod.ts";
import evaluate from "./evaluate.ts";
import { get } from "./core_commands/StoreCommand.ts";
import { are_equal } from "./Objects.ts";

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
    const context = error.context;
    const logged = await get(context, "log/0");
    assert(are_equal(error, logged));
   // should throw an error
  }
});