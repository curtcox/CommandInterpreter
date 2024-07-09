import { jsonToRef, refToJson } from "./RefCommand.ts";
import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { Ref } from "../Ref.ts";

function assertValid(original: string, result: Ref) {
    const normal = JSON.stringify(JSON.parse(original));
    assertEquals(refToJson(result), normal);
}

Deno.test("Empty object", async () => {
    const input = "{}";
    const result = await jsonToRef(input);
    assertValid(input, result);
});

Deno.test("Simple object", async () => {
  const input = '{"name":"John","age":30}';
  const result = await jsonToRef(input);
  assertEquals(result.replacements.size, 0);
  assertValid(input, result);
});

Deno.test("Simple object -- when too large", async () => {
    const input = '{"name of the thing that you know":"John John the Baptist son","age at the time when he did that thing with the thing":30}';
    const result = await jsonToRef(input);
    assertEquals(result.replacements.size, 1);
    assertEquals(result.result, 'eB2Nk/hGO8cyCR2zYP6JchcoCJVsL5ReVF020WAB91SFWY4CksOYi1MYex9gEvrNjeg23jyOCOXajDEcLwancA==');
    assertValid(input, result);
});

Deno.test("Object with nested objects", async () => {
  const input = `{"name":"John","age":30,"address":{"street":"123 Main St","city":"New York"}}`;
  const result = await jsonToRef(input);
  assertEquals(result.replacements.size, 0);
  assertValid(input, result);
});

Deno.test("Object with nested objects -- when too large", async () => {
    const input = `{"name of the rose":"John, John Rose","age":300456,"address me by my name":{"street":"123 Main Street","city":"New York"}}`;
    const result = await jsonToRef(input);
    assertEquals(result.replacements.size, 1);
    assertEquals(result.result, 'lHk8dPk2I+HmeROdxMWaQlhW8Ug+E1ByCfN8a9QOtl96M0dU6WjBzgkbgwQD6dRkSXFGTAWmrrL+3df6B589/Q==');
    assertValid(input, result);
});

Deno.test("Object with arrays", async () => {
    const input = `{"name":"J","age":9,"eh":["take","off","your","shoes"]}`;
    const result = await jsonToRef(input);
    assertEquals(result.replacements.size, 0);
    assertEquals(result.result, input);
    assertValid(input, result);
  });

Deno.test("Object with arrays -- when too large", async () => {
  const input = `{"first name":"John","age":30,"hobbies and stuff":["reading the things that I read","traveling the places that I go"]}`;
  const result = await jsonToRef(input);
  assertEquals(result.replacements.size, 1);
  assertEquals(result.result, '33zu/lG6NKogHTf5MeVdfM+fsHEKEGHC1q98+VlsJjoYWro2OoX6iVudiwNaIf/SaFeq2AXYYWVY0AwwMK6rjw==');
  assertValid(input, result);
});

Deno.test("Complex object", async () => {
  const input = `{
    "name": "John",
    "age": 30,
    "married": false,
    "hobbies": ["reading", "traveling"],
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "education": [
      {
        "degree": "Bachelor's",
        "major": "Computer Science",
        "university": "ABC University",
        "notes": "That by their existence alone make this object larger than 88 characters -- and thus require hashing. This is a test of the hashing function."
      },
      {
        "degree": "Master's",
        "major": "Data Science",
        "university": "XYZ University"
      }
    ]
  }`;
  const result = await jsonToRef(input);
  assertEquals(result.replacements.size, 4);
  assertEquals(result.result, "2CZ5t2f+E7uAnIzm8DFRKYXYc4nDp605YqyOAwbHYvTFfE2wAWJSGnIXsB6q24sp5ESjyoBSFukFgUR2dbPapA==");
  assertValid(input, result);
});
