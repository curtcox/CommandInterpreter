import { assertEquals, fail } from "https://deno.land/std/testing/asserts.ts";
import evaluate from "./evaluate.ts";

Deno.test("evaluate valid expression", () => {
  const expression = "2 + 3 * 4";
  const expectedResult = 14;
  const result = evaluate(expression);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate expression with variables", () => {
  const expression = "const x = 5; x * 2";
  const expectedResult = 10;
  const result = evaluate(expression);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate invalid expression", () => {
  const expression = "2 + 3 * 4 /";
  try {
    evaluate(expression);
    fail();
  } catch (error) {
  }
});