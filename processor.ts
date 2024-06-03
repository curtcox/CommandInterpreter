import { Hono, Context } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { button, body, form, textarea, p, a } from './viewer/Html.ts';

const app = new Hono()

function trap(c: Context, f: (c: Context) => unknown) : unknown {
  try {
    return f(c);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
}

const handle = <T>(f: (c: Context) => Promise<T> ) => (c: Context) => trap(c, () => {
  const result = f(c);
  return Promise.resolve(result).then((response) => {
    if (typeof response === 'string') {
      return c.html(response);
    } else {
      return c.json(response);
    }
  });
});

const get = <T>(path:string, f: (c: Context) => Promise<T> ) => app.get(path, handle(f));

function command(c: Context) : string {
  return c.req.query('q') || '';
}

get('/', async (c: Context) => body(
  p(a("https://github.com/curtcox/CommandInterpreter/","Command Interpreter")),
  form(textarea('command',command(c)),
  p(""),
  a("","context")," ", button("run")," ",button("explain"))));

Deno.serve(app.fetch)
