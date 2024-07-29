import { parseArgs } from "https://deno.land/std/cli/parse_args.ts";
import { readAll } from "https://deno.land/std@0.180.0/streams/read_all.ts";
import evaluate from "./evaluate.ts";
import { log } from "../core/Logger.ts";
import { memory, filesystem } from "../native/Stores.ts";

const { args } = Deno;
const { commands, verbose, format } = parseArgs(args);

const _memory_store = memory();
const file_store = filesystem('store','json');
const store = file_store;

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
const input_format = format || "string";

const result = await evaluate(store, input_format, input, commands);
if (verbose) {
  log({commands, verbose, result});
} else {
  log(result.output.content);
}
