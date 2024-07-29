import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { register_routes } from './single_command_form.ts';

const app = new Hono()

function run_pipeline(command: string): Promise<string> {
  const after = `>>>_${command}`;
  return Promise.resolve(after);
}

register_routes(app, run_pipeline);

Deno.serve(app.fetch);