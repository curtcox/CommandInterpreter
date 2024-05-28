import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import { eval_cmd } from "./EvalCommand.ts";
import { emptyContext } from "../command/Empty.ts";

Deno.test("evaluate valid numeric expression", async () => {
  const expression = "2 + 3 * 4";
  const expectedResult = "14";
  const result = await eval_cmd.func(emptyContext, expression);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate valid string expression", async () => {
  const expression = "'Hello, ' + 'world!'";
  const expectedResult = 'Hello, world!';
  const result = await eval_cmd.func(emptyContext, expression);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate numeric expression with variables", async () => {
  const expression = "x = 5; x * 2";
  const expectedResult = "5";
  const result = await eval_cmd.func(emptyContext, expression);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate invalid expression", async () => {
  const expression = "2 + 3 * 4 /";
  try {
    await eval_cmd.func(emptyContext, expression); // should throw an error
    fail();
  } catch (error) {
    assertEquals(error.message, "Unexpected token '}'");
  }
});