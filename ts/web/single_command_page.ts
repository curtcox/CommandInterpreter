import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { register_routes } from './single_command_form.ts';
import evaluate from '../cli/evaluate.ts';

const app = new Hono()

async function run(command: string): Promise<string> {
  const result = await evaluate('string', '', command);
  const content = await result.output.content;
  return `${content}`;
}

register_routes(app, run);

Deno.serve(app.fetch);