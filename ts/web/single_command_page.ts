import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts';
import { register_routes } from './single_command_form.ts';
import { memory, filesystem } from "../native/Stores.ts";
import evaluate from '../cli/evaluate.ts';

const app = new Hono();

const _memory_store = memory();
const file_store = filesystem('store','json');
const store = file_store;

async function evaluateCommand(command: string): Promise<string> {
  const result = await evaluate(store, 'string', '', command);
  const content = await result.output.content;
  return `${content}`;
}

function formatError(error: unknown): string {
  let errorMessage: string;
  if (error instanceof Error) {
    errorMessage = `Error: ${error.name} - ${error.message}`;
    if (error.stack) {
      errorMessage += `\nStack trace: ${error.stack}`;
    }
  } else {
    errorMessage = `An unexpected error occurred: ${String(error)}`;
  }
  return `Exception occurred during evaluation:\n${errorMessage}`;
}

async function run(command: string): Promise<string> {
  try {
    return await evaluateCommand(command);
  } catch (error) {
    return formatError(error);
  }
}

register_routes(app, run);

Deno.serve(app.fetch);