import { a, table, td, tr } from "https://esm.town/v/curtcox/Html";
import { asParts, follow } from "https://esm.town/v/curtcox/Object";

function objectable(obj: any): string {
  let rows = "";
  const parts = asParts(obj);
  for (const key in parts) {
    const part = parts[key];
    const name = part.key;
    rows = rows + tr(td(a(name + "/", name)), td(part.type), td(part.value), td(part.parts));
  }
  return table(rows);
}

function trimmed(input: string): string {
  const max = 512;
  if (input.length <= max) {
    return input;
  } else {
    const truncated = input.slice(0, max);
    const remaining = input.length - max;
    return `${truncated}... ${remaining} remaining not shown`;
  }
}

function summary(chain, at) {
  const name = chain.length > 0 ? chain.at(-1) : "Roots";
  const type = typeof at;
  const str = trimmed(Deno.inspect(at));
  return `${name} ${type} ${str} `;
}

function body(request: Request) {
  const roots = { Deno, request, globalThis };
  const chain = pathSegments(request);
  const at = follow(roots, chain);
  return summary(chain, at) + objectable(at);
}

function pathSegments(request: Request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  return pathSegments.filter(segment => segment.length > 0);
}

export const htmlExample = (req: Request) =>
  new Response(body(req), {
    headers: {
      "Content-Type": "text/html",
    },
  });