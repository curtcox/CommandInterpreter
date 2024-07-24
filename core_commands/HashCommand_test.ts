import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { CommandContext } from "../command/CommandDefinition.ts";
import { hash_cmd } from "./HashCommand.ts";
import { emptyContextMeta, emptyHash } from "../command/Empty.ts";
import { invoke_with_input } from "../command/ToolsForCommandWriters.ts";
import { nop_cmd } from "./NopCommand.ts";
import { Hash, hash } from "../Ref.ts";
import { empty } from "../Ref.ts";

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
  assertEquals(actual, new Hash("z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg_SpIdNs6c5H0NE8XYXysP-DGNKHfuwvY7kxvUdBeoGlODJ6-SfaPg"));
});

Deno.test("Hash function returns hash of empty string when empty", async () => {
  const actual = await hash('');
  assertEquals(actual, new Hash("z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg_SpIdNs6c5H0NE8XYXysP-DGNKHfuwvY7kxvUdBeoGlODJ6-SfaPg"));
  assertEquals(actual, empty);
  assertEquals(emptyHash, empty);
});

async function hashIs(input: string, expected: string) {
  assertEquals((await hash(input)).value, new Hash(expected).value);
}
 
Deno.test("Hash values are unique", async () => {
  await hashIs("",  "z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg_SpIdNs6c5H0NE8XYXysP-DGNKHfuwvY7kxvUdBeoGlODJ6-SfaPg");
  await hashIs("0", "MbygIJTreBJqUXsgaojHPPqexvcExwMNGCEsrOgg8CXwC_DqaNvz86VDbKY7U797-ArY1d59g1nQt_7Z28OrmQ");
  await hashIs("1", "Tf9Oo0DwqCPxXT9PAati6uDl2lecy4Ufjbnf6ExYsrN7iZA6dA4e4XLaeTpuedVg5ff5vQWKEqKAQz7W-kZRCg");
  await hashIs("2", "QLJEESZB3XjdT5O2yRkN1G4AmRlNWkQle3761u-f9Gg9oe2gJERIyzQ6poj10-_XMU2v5YCsC8vxFa7Kno3BFA");
  await hashIs("3", "O6-_CIgqLRATMJOhuEM_UFY7k8FKzQW3kCjrHRJ5kCckFFCYBlGZRQFCOmbCdq4mxDtzm8ZcThaxDDr2wgKuuw");
  await hashIs("4", "oyHYtAXj7yYElZhHs20XHuvrxKiUHccKR4STWk_KXVgT3oTfoEnwZUmqYbIISMFjPOgbZ1KG6o-1PbJA2DHFaA");
  await hashIs("5", "Bt8FNxmBojfQ7RFHL658lMmsDv8dBUE1FnENF7EKT7b0UXvaSmlfAtCnPdTbVDtGU98o9dCdq4b5L_ubhtAeJQ");
  await hashIs("6", "PJrVUUenFE9gZzJ8O4LqcOfFQmrdnO6k0H3CkCI5v54Em4hiXrZdAUp3GPeTVGCMqwkheCxkPwIImD__o1guQA");
  await hashIs("7", "8FIQxbQmPw7Ew5lb2rRY2B05U_NUqRCVIPFZ2x6IALzUW5fFbc6QofwnqwPguKmvhnN0cCPEBimTdBFtb5ZpgQ");
  await hashIs("8", "vCO4sBdy0t1n77j-Gl5r0PRLl8NhAb5swJ8lO1PmjWeiLkZDBo39E0GYATTqV1cKz2XjBuTZbO9NVgOEiUyIpA");
  await hashIs("9", "DcUm2MT6BAhPSypkM_TNFGZLk9-fuKngC3e6iQuDcE0klEyTyqaStRCFu0dvgYUsJ-eTYA8TeuOSkBjNTI8aRQ");
});
