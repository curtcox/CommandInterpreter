import { a, table, td, tr, h2, splat } from "./Html.ts";
import { asParts, follow } from "./Object.ts";

function objectable(obj: unknown): string {
  let rows = "";
  const parts = asParts(obj);
  for (const key in parts) {
    const part = parts[key];
    const name = part.key;
    rows = rows + tr(td(a(name + "/", name)), td(part.type), td(part.value), td(`${part.parts}`));
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

function name(chain: string[], missing: string): string {
  const last = chain.length > 0 ? chain.at(-1) : missing;
  return last || missing;
}

function summary(chain: string[], at: unknown) : string {
  const type = typeof at;
  const str = trimmed(Deno.inspect(at));
  return splat(h2(name(chain,'') + ':' + type),str);
}

function breadcrumbs(chain: string[]): string {
  let out = '';
  let path = '../';
  for (let index = chain.length - 1; index >= 0; index--) {
    const name = chain[index];
    out = a(path + name,name) + ' / ' + out;
    path = path + '../';
  }
  return out;
}

export function body(chain: string[], roots: unknown) {
  const at = follow(roots, chain);
  return splat(breadcrumbs(chain),summary(chain, at),objectable(at));
}