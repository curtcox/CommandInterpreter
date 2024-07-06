import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { hash, hash_cmd } from "./HashCommand.ts";
import { emptyContextMeta } from "../command/Empty.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { nop_cmd } from "./NopCommand.ts";
import { Hash } from "../Ref.ts";

Deno.test("Hash command returns hash of string when empty", async () => {
  const empty = {format: "string", content: ""};
  const context: CommandContext = {
    commands: new Map([
      ['hash', hash_cmd],
      ['log', nop_cmd]
    ]),
    meta: emptyContextMeta,
    input: empty,
  };
  const result = await invoke_with_input(context, "hash", empty, empty);
  const actual = await result.output.content;
  assertEquals(actual, new Hash("z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg=="));
});

Deno.test("Hash function returns hash of empty string when empty", async () => {
  const actual = await hash('');
  assertEquals(actual, new Hash("z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg=="));
});

async function hashIs(input: string, expected: string) {
  assertEquals(await hash(input), new Hash(expected), `hash for ${input}`);
}
 
Deno.test("Hash values are unique", () => {
  hashIs("0", "MbygIJTreBJqUXsgaojHPPqexvcExwMNGCEsrOgg8CXwC/DqaNvz86VDbKY7U797+ArY1d59g1nQt/7Z28OrmQ==");
  hashIs("1", "Tf9Oo0DwqCPxXT9PAati6uDl2lecy4Ufjbnf6ExYsrN7iZA6dA4e4XLaeTpuedVg5ff5vQWKEqKAQz7W+kZRCg==");
  hashIs("2", "QLJEESZB3XjdT5O2yRkN1G4AmRlNWkQle3761u+f9Gg9oe2gJERIyzQ6poj10+/XMU2v5YCsC8vxFa7Kno3BFA==");
  hashIs("3", "O6+/CIgqLRATMJOhuEM/UFY7k8FKzQW3kCjrHRJ5kCckFFCYBlGZRQFCOmbCdq4mxDtzm8ZcThaxDDr2wgKuuw==");
  hashIs("4", "oyHYtAXj7yYElZhHs20XHuvrxKiUHccKR4STWk/KXVgT3oTfoEnwZUmqYbIISMFjPOgbZ1KG6o+1PbJA2DHFaA==");
  hashIs("5", "Bt8FNxmBojfQ7RFHL658lMmsDv8dBUE1FnENF7EKT7b0UXvaSmlfAtCnPdTbVDtGU98o9dCdq4b5L/ubhtAeJQ==");
  hashIs("6", "PJrVUUenFE9gZzJ8O4LqcOfFQmrdnO6k0H3CkCI5v54Em4hiXrZdAUp3GPeTVGCMqwkheCxkPwIImD//o1guQA==");
  hashIs("7", "8FIQxbQmPw7Ew5lb2rRY2B05U/NUqRCVIPFZ2x6IALzUW5fFbc6QofwnqwPguKmvhnN0cCPEBimTdBFtb5ZpgQ==");
  hashIs("8", "vCO4sBdy0t1n77j+Gl5r0PRLl8NhAb5swJ8lO1PmjWeiLkZDBo39E0GYATTqV1cKz2XjBuTZbO9NVgOEiUyIpA==");
  hashIs("9", "DcUm2MT6BAhPSypkM/TNFGZLk9+fuKngC3e6iQuDcE0klEyTyqaStRCFu0dvgYUsJ+eTYA8TeuOSkBjNTI8aRQ==");
});
