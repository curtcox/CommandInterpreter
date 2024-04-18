import { parse } from "./deps.ts";
import evaluate from "./evaluate.ts";

const { args } = Deno;
const { expression } = parse(args);

if (!expression) {
  console.error("Please provide an expression to evaluate.");
  console.log("Usage: deno run --allow-all cli.ts --expression='1 + 2'");
  Deno.exit(1);
}

const result = evaluate(expression);
console.log(`Result: ${result}`);