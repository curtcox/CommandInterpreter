import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import evaluate from "./evaluate.ts";

Deno.test("evaluate valid expression", async () => {
  const expression = "eval 2 + 3 * 4";
  const expectedResult = "14";
  const result = await evaluate(expression,false);
  assertEquals(result.output.content, expectedResult);
});

Deno.test("evaluate expression with variables", async () => {
  const expression = "eval x = 5; x * 2";
  const expectedResult = "5";
  const result = await evaluate(expression, false);
  assertEquals(result.output.content, expectedResult);
});

Deno.test("evaluate invalid expression", async () => {
  const expression = "eval 2 + 3 * 4 /";
  try {
    await evaluate(expression,false);
    fail();
  } catch (error) {
  }
});