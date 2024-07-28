import { equal } from "https://deno.land/x/equal/mod.ts";

export function are_equal(a: unknown, b: unknown): boolean {
  return equal(a, b);
}