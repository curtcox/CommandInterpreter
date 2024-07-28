import { Hash, reasonNotValid } from "./Ref.ts";
import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";

Deno.test("Short hash values are bad", () => {
    assertEquals(reasonNotValid("abc"),'Hash must be 86 characters long, but got 3');
});

Deno.test("Empty string is not a valid hash", () => {
    assertEquals(reasonNotValid(''), 'Hash must be 86 characters long, but got 0');
});

Deno.test("Hash must not contain spaces", () => {
    assertEquals(
        reasonNotValid('ooooooooo1ooooooooo2ooooooooo3ooooooooo ooooooooo5ooooooooo6ooooooooo7ooooooooo8oooooo'),
        'Hash can only contain letters, numbers, and dash(-) and underscore(_) characters.'
    );
});

Deno.test("Hash must contain 86 characters which can be ...", () => {
    assertEquals(reasonNotValid("ooooooooo1ooooooooo2ooooooooo3ooooooooo4ooooooooo5ooooooooo6ooooooooo7ooooooooo8oooooo"),null);
    assertEquals(reasonNotValid("123456789o123456789o123456789o123456789o123456789o123456789o123456789o123456789o123456"),null);
    assertEquals(reasonNotValid("lower_case_letters_________abcdefghijklmnopqrstuvwxyzooooooooooooooooooooooooooooooooo"),null);
    assertEquals(reasonNotValid("UPPER_CASE_LETTERS_________ABCDEFGHIJKLMNOPQRSTUVWXYZooooooooooooooooooooooooooooooooo"),null);
    assertEquals(reasonNotValid("numbers____________________0123456789ooooooooooooooooooooooooooooooooooooooooooooooooo"),null);
    assertEquals(reasonNotValid("dash_and_underscore________----------------___________________oooooooooooooooooooooooo"),null);
});

Deno.test("Hash must be 86 characters or less.", () => {
    assertEquals(reasonNotValid("a".repeat(86)),null);
    assertEquals(reasonNotValid("a".repeat(85)), 'Hash must be 86 characters long, but got 85');
    assertEquals(reasonNotValid("a".repeat(87)), 'Hash must be 86 characters long, but got 87');
});