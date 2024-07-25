import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { Context as HonoContext } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { button, body, form, textarea, p, a, hidden } from './viewer/Html.ts';

const app = new Hono()

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
  console.log({result});
  return Promise.resolve(result).then((response) => {
    console.log({response});
    if (typeof response === 'string') {
      return c.html(response);
    } else {
      // return c.json(response);
      return response;
    }
  });
});

async function handle_do(hc: HonoContext) {
  console.log('do_pipeline');
  const body = await hc.req.parseBody();
  const command = body['command'] as string || '';
  const context = body['c'] as string || '';
  const after = run_pipeline(command, context);
  const target = `/?c=${after}`;
  console.log({command,context,after, target});
  return hc.redirect(target);
}

function run_pipeline(command: string, context: string): string {
  const after = `after_running_${command}_on_${context}`;
  return after;
}

const get  = <T>(path:string, f: (c: HonoContext) => Promise<T> ) => app.get(path, handle(f));
const post = <T>(path:string, f: (c: HonoContext) => Promise<T> ) => app.post(path, handle(f));

function command(c: HonoContext) : string {
  return c.req.query('q') || '';
}

get('/log/:id/*', async (hc: HonoContext) => body('log'));
get('/store/*',   async (hc: HonoContext) => body('store'));
get('/command/*', async (hc: HonoContext) => body('command'));

post('/do', async (c: HonoContext) => await handle_do(c));

function input_for_command(hc: HonoContext) {
  return 'input for command';
}

function command_prompt(hc: HonoContext) {
  return body(
    p(a("https://github.com/curtcox/CommandInterpreter/","Command Interpreter")),
    input_for_command(hc),
    form(
      textarea('command',command(hc)),
      p(""),
      a("","context")," ", button("do")," ",button("explain"),
      hidden('c',hc.req.query('c') || 'c')
    )
  );
}

get('/:id?', async (hc: HonoContext) => command_prompt(hc));
 
Deno.serve(app.fetch);