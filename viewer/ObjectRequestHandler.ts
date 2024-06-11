import { a, table, td, tr } from "./Html.ts";
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

function summary(chain: string[], at: unknown) : string {
  const name = chain.length > 0 ? chain.at(-1) : "Roots";
  const type = typeof at;
  const str = trimmed(Deno.inspect(at));
  return `${name} ${type} ${str} `;
}

export function body(chain: string[], roots: unknown) {
  const at = follow(roots, chain);
  return summary(chain, at) + objectable(at);
}