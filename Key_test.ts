import { Key, reasonNotValid } from "./Key.ts";
import { assertEquals, assert } from "https://deno.land/std@0.223.0/assert/mod.ts";

Deno.test("Short simple key names are OK", () => {
    const key = new Key("abc");
    assertEquals(key.value, "abc");
    assert(reasonNotValid("abc")===null);
});

Deno.test("Empty string is not a valid key", () => {
    assertEquals(reasonNotValid(''), 'Key must not be empty.');
});

Deno.test("Key must not contain spaces", () => {
    assertEquals(reasonNotValid('with spaces'), 'Key can only contain letters, numbers, and _-/.');
});

Deno.test("Keys can contain ...", () => {
    assertEquals(reasonNotValid("lower_case___abcdefghijklmnopqrstuvwxyz"), null);
    assertEquals(reasonNotValid("UPPER_CASE___ABCDEFGHIJKLMNOPQRSTUVWXYZ"), null);
    assertEquals(reasonNotValid("numbers______0123456789"), null);
    assertEquals(reasonNotValid("underscore_____________"), null);
    assertEquals(reasonNotValid("slash________//////////"), null);
    assertEquals(reasonNotValid("dash_________----------"), null);
    assertEquals(reasonNotValid("period_______.........."), null);
});

Deno.test("Keys must be 255 characters or less.", () => {
    assert(reasonNotValid("a".repeat(10))===null);
    assert(reasonNotValid("a".repeat(255))===null);
    assertEquals(reasonNotValid("a".repeat(256)), 'Key value must be less than 256 characters long, but got 256');
    assertEquals(reasonNotValid("a".repeat(257)), 'Key value must be less than 256 characters long, but got 257');
});

Deno.test("Words with upper and lower case are filename safe", () => {
    assertEquals(reasonNotValid("filename"), null);
    assertEquals(reasonNotValid("Fred"), null);
});

Deno.test("Keys can have letters", () => {
    assertEquals(reasonNotValid("abcdefghijklmnopqrstuvwxyz"), null);
    assertEquals(reasonNotValid("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), null);
});

Deno.test("Keys can have numbers", () => {
    assertEquals(reasonNotValid("01234567890"), null);
});

Deno.test("Keys cannot have spaces", () => {
    assertEquals(reasonNotValid("has space"), "Key can only contain letters, numbers, and _-/.");
});

Deno.test("Keys cannot have plus", () => {
    assertEquals(reasonNotValid("has+plus"), "Key can only contain letters, numbers, and _-/.");
});

Deno.test("Keys can have slashes", () => {
    assertEquals(reasonNotValid("has/slash"), null);
});

Deno.test("Keys can have uppercase letters", () => {
    assertEquals(reasonNotValid("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), null);
});

Deno.test("Keys can have lowercase letters", () => {
    assertEquals(reasonNotValid("abcdefghijklmnopqrstuvwxyz"), null);
});

Deno.test(". is not a valid key", () => {
    assertEquals(reasonNotValid("."), 'Key cannot be "." or ".."');
});

Deno.test(".. is not a valid key", () => {
    assertEquals(reasonNotValid(".."), 'Key cannot be "." or ".."');
});

Deno.test("Keys with a . are valid", () => {
    assertEquals(reasonNotValid("README.md"), null, "README.md should be safe");
    assertEquals(reasonNotValid("hello.txt"), null, "hello.txt should be safe");
});
