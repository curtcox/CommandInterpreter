import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import evaluate from "./evaluate.ts";

Deno.test("evaluate valid expression", async () => {
  const result = await evaluate("","","eval 2 + 3 * 4",false);
  assertEquals(result.output.content, "14");
});

Deno.test("evaluate expression with variables", async () => {
  const result = await evaluate("","","eval x = 5; x * 2", false);
  assertEquals(result.output.content, "5");
});

Deno.test("evaluate invalid expression", async () => {
  try {
    await evaluate("","","eval 2 + 3 * 4 /",false);
    fail();
  } catch (error) {} // should throw an error
});