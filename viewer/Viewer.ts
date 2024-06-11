import { Hono, Context, HonoRequest } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { body } from './ObjectRequestHandler.ts';

const app = new Hono()
const debug = true


function trap(c: Context, f: (c: Context) => unknown) : unknown {
  try {
    return f(c);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
}

const handle = <T>(f: (c: Context) => Promise<T> ) => (c: Context) => trap(c, () => {
    console.log('Handling request');
    // console.log({c});
    const result = f(c);
    return Promise.resolve(result).then((response) => {
      if (typeof response === 'string') {
        return c.html(response);
      } else {
        return c.json(response);
      }
    }).catch((err) => {
      console.error('Error:', err);
      if (debug) {
        return c.text(err.stack, 500)
      } else {
        return c.text('Internal Server Error', 500)
      }
    });
});

function pathSegments(request: HonoRequest) : string[] {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  return pathSegments.filter(segment => segment.length > 0);
}

const get = <T>(path:string, f: (c: Context) => Promise<T> ) => app.get(path, handle(f));

get('*',async (c: Context)  => body(pathSegments(c.req),{Deno, globalThis}));

Deno.serve(app.fetch)
