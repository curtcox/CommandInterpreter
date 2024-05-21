import { equal } from "./deps.ts";

export function are_equal(a: unknown, b: unknown): boolean {
  return equal(a, b);
}