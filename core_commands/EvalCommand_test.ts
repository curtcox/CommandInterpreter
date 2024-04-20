import { assertEquals, fail } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../CommandDefinition.ts";
import { eval_cmd } from "./EvalCommand.ts";
import { help } from "./CoreCommands.ts";

const emptyInput = {
  format: "",
  content: "",
};

const emptyContext: CommandContext = {
  commands: {},
  help: help,
  previous: "",
  input: emptyInput,
};

Deno.test("evaluate valid expression", async () => {
  const expression = "2 + 3 * 4";
  const expectedResult = "14";
  const result = await eval_cmd.func(expression, emptyContext);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate expression with variables", async () => {
  const expression = "x = 5; x * 2";
  const expectedResult = "5";
  const result = await eval_cmd.func(expression, emptyContext);
  assertEquals(result, expectedResult);
});

Deno.test("evaluate invalid expression", async () => {
  const expression = "2 + 3 * 4 /";
  try {
    await eval_cmd.func(expression, emptyContext); // should throw an error
    fail();
  } catch (error) {
  }
});