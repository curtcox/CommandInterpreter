import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { before } from "./Strings.ts";
import { after } from "./Strings.ts";
import { replace_all } from "./Strings.ts";
import { head } from "./Strings.ts";
import { tail } from "./Strings.ts";
import { words } from "./Strings.ts";

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

Deno.test("Words splits the given string into words using whitespace", () => {
    assertEquals(words('='), ["="]);
    assertEquals(words('When'), ["When"]);
    assertEquals(words('When in the course of human events'), ["When", "in", "the", "course", "of", "human", "events"]);
    assertEquals(words('Multiple  spaces'), ["Multiple", "spaces"]);
    assertEquals(words(' ignore leading spaces'), ["ignore", "leading", "spaces"]);
    assertEquals(words('ignore trailing spaces '), ["ignore", "trailing", "spaces"]);
    assertEquals(words(' ignore  multiple  spaces '), ["ignore", "multiple", "spaces"]);
    assertEquals(words('ignore leading and trailing spaces '), ["ignore", "leading", "and", "trailing", "spaces"]);
});
