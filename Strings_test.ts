import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { before } from "./Strings.ts";
import { after } from "./Strings.ts";
import { replace_all } from "./Strings.ts";
import { head } from "./Strings.ts";
import { tail } from "./Strings.ts";

Deno.test("Head returns the first word in a string", () => {
    assertEquals(head("first"), "first");
    assertEquals(head("1 2 3 4"), "1");
});

Deno.test("Tail returns all after the first word in a string", () => {
    assertEquals(tail("first"), "first");
    assertEquals(tail("1 2 3 4"), "2 3 4");
});

Deno.test("Before returns the part of a string before a divider", () => {
    assertEquals(before('=',"f=ma"), "f");
});

Deno.test("After returns the part of a string after a divider", () => {
    assertEquals(after('=',"f=ma"), "ma");
});

Deno.test("Replace all replaces every instance of the keys in the template with values", () => {
    assertEquals(replace_all("the same",{}) , "the same");
    assertEquals(replace_all("a rose by any other name",{"rose":"gun"}) , "a gun by any other name");
});
