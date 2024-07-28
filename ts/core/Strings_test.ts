import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { before } from "./Strings.ts";
import { after } from "./Strings.ts";
import { use_replacements } from "./Strings.ts";
import { head } from "./Strings.ts";
import { tail } from "./Strings.ts";
import { words } from "./Strings.ts";
import { mapToString } from "./Strings.ts";
import { stringToMap } from "./Strings.ts";

Deno.test("Head returns the first word in a string", () => {
    assertEquals(head("first"), "first");
    assertEquals(head("head tail"), "head");
    assertEquals(head("1 2 3 4"), "1");
});

Deno.test("Tail returns all after the first word in a string", () => {
    assertEquals(tail("first"), "");
    assertEquals(tail("head tail"), "tail");
    assertEquals(tail("1 2 3 4"), "2 3 4");
});

Deno.test("Before returns the part of a string before a divider", () => {
    assertEquals(before('=',"f=ma"), "f");
    assertEquals(before('=',"there is no divider"), "there is no divider");
});

Deno.test("After returns the part of a string after a divider", () => {
    assertEquals(after('=',"f=ma"), "ma");
    assertEquals(after('=',"there is no divider"), "");
});

Deno.test("Replace all replaces every instance of the keys in the template with values", () => {
    assertEquals(use_replacements("the same",new Map()) , "the same");
    assertEquals(use_replacements("a rose by any other name",new Map([["rose","gun"]])) , "a gun by any other name");
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

Deno.test("empty map round trip", () => {
    const map = new Map<string, string>();
    const str = mapToString(map);
    assertEquals(str, "");

    const recoveredMap = stringToMap(str);
    assertEquals(recoveredMap, map);
});

Deno.test("1 pair map round trip", () => {
    const map = new Map([["City", "State"]]);
    const str = mapToString(map);

    const recoveredMap = stringToMap(str);
    assertEquals(recoveredMap, map);
});

Deno.test("3 pair map round trip", () => {
    const map = new Map([
        ["name", "Alice"],
        ["age", "30"],
        ["city", "New York"],
      ]);
    const str = mapToString(map);

    const recoveredMap = stringToMap(str);
    assertEquals(recoveredMap, map);
});

Deno.test("4 pair map round trip", () => {
    const map = new Map([
        ["1st", "Who"],
        ["2nd", "What"],
        ["3rd", "I don't know"],
        ["4th", "I don't care"],
      ]);
    const str = mapToString(map);

    const recoveredMap = stringToMap(str);
    assertEquals(recoveredMap, map);
});
