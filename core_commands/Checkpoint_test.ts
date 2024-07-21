import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { hash } from "../Ref.ts";
import { Checkpointer } from "./Checkpoint.ts";
import { emptyHash } from "../command/Empty.ts";
import { hash_of } from "./Checkpoint.ts";

// Can restore:
// - seq 0 with no values
// - seq 1 with no values
// - seq 0 with 1 value
// - seq 1 with 1 value
// - value from prior
// - value from 2 priors back
// checkpoint can be used to restore values
// checkpoint hash can be used to restore checkpoint

Deno.test("Can create checkpointer with empty prior hash", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(0);
    assertEquals(checkpoint.prior, prior);
    assertEquals(checkpoint.values.size, 0);
    assertEquals(checkpoint.id, 0);
});

Deno.test("Empty checkpoint uses given id", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(42);
    assertEquals(checkpoint.prior, prior);
    assertEquals(checkpoint.values.size, 0);
    assertEquals(checkpoint.id, 42);
});

Deno.test("checkpoint hash can be used to restore empty checkpoint", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(0);
    const hash = await hash_of(checkpoint);
    const restored = await checkpoint_from(hash,lookup);
    assertEquals(checkpoint.prior, prior);
    assertEquals(checkpoint.values.size, 0);
    assertEquals(checkpoint.id, 42);
});
