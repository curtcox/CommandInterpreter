import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { Context as HonoContext } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { button, body, form, textarea, p } from '../web/Html.ts';

function trap(c: HonoContext, f: (c: HonoContext) => unknown) : unknown {
  try {
    return f(c);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
}

const handle = <T>(f: (c: HonoContext) => Promise<T> ) => (c: HonoContext) => trap(c, async () => {
  const result = await f(c);
  return Promise.resolve(result).then((response) => {
    console.log({response});
    if (typeof response === 'string') {
      return c.html(response);
    } else {
      return response;
    }
  });
});

function command(c: HonoContext) : string {
  return c.req.query('q') || '';
}

function command_prompt(hc: HonoContext) {
  return form(
    textarea('command',command(hc)),
    p(""),
    button("do")
  );
}

async function command_result(hc: HonoContext, processor: Processor) {
  const body = await hc.req.parseBody();
  const command = body['command'] as string || '';
  const after = processor(command);
  return after
}

const get  = <T>(app: Hono, path:string, f: (c: HonoContext) => Promise<T> ) => app.get(path, handle(f));
const post = <T>(app: Hono, path:string, f: (c: HonoContext) => Promise<T> ) => app.post(path, handle(f));

export interface Processor {
  (command: string): Promise<string>;
}

export function register_routes(app: Hono, processor: Processor) {
  post(app, '/do', async (hc: HonoContext) => await body(command_prompt(hc), await command_result(hc, processor)));
   get(app, '/',   async (hc: HonoContext) => await body(command_prompt(hc)));
}