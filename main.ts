import { parseArgs, readAll } from "./deps.ts";
import evaluate from "./evaluate.ts";
import { log } from "./Logger.ts";

const { args } = Deno;
const { commands, verbose, format } = parseArgs(args);

if (!commands) {
  console.error("Please provide commands to run.");
  log("Usage: deno run --allow-all main.ts --commands='eval 1 + 2'");
  Deno.exit(1);
}

const read_input = async () => {
  if (!Deno.stdin.isTerminal()) {
    const decoder = new TextDecoder();
    const stdin = await readAll(Deno.stdin);
    return decoder.decode(stdin);
  }
  return "";
};

const input = await read_input();
const input_format = format || "text";

const result = await evaluate(input_format, input, commands);
if (verbose) {
  log({commands, verbose, result});
} else {
  log(result.output.content);
}
