import { parseArgs } from "./deps.ts";
import evaluate from "./evaluate.ts";
import { log } from "./Logger.ts";

const { args } = Deno;
const { commands, verbose } = parseArgs(args);

if (!commands) {
  console.error("Please provide commands to run.");
  log("Usage: deno run --allow-all main.ts --commands='eval 1 + 2'");
  Deno.exit(1);
}

const result = await evaluate(commands, verbose);
if (verbose) {
  log({commands, verbose, result});
} else {
  log(result.output.content);
}
