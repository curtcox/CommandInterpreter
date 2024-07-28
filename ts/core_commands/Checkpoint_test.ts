import { assertEquals } from "https://deno.land/std@0.223.0/assert/mod.ts";
import { Hash, hash } from "../core/Ref.ts";
import { Checkpoint, Checkpointer } from "./Checkpoint.ts";
import { emptyHash } from "../command/Empty.ts";
import { hash_of, checkpoint_from } from "./Checkpoint.ts";
import { serialize } from "./ObjCommand.ts";
import { mapAsHashLookup } from "../core/Lookup.ts";

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

async function serialize_thru(checkpoint: Checkpoint, lookup: Map<Hash,string>) : Promise<Checkpoint> {
    const hash = await hash_of(checkpoint);
    const serialized_checkpoint = await serialize(checkpoint);
    lookup.set(hash,serialized_checkpoint);
    const restored = await checkpoint_from(hash,mapAsHashLookup(lookup));
    // console.log({checkpoint, serialized_checkpoint, restored});
    assertEquals(checkpoint.prior, restored.prior);
    assertEquals(checkpoint.values, restored.values);
    assertEquals(checkpoint.id, restored.id);
    return restored;
}

Deno.test("checkpoint hash can be used to restore empty checkpoint with 0 seq", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(0);
    const lookup =  new Map<Hash,string>();
    const restored = await serialize_thru(checkpoint, lookup);
    // console.log({checkpoint, restored});
});

Deno.test("checkpoint hash can be used to restore empty checkpoint with 42 seq", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(42);
    const lookup =  new Map<Hash,string>();
    const restored = await serialize_thru(checkpoint, lookup);
    // console.log({checkpoint, restored});
});

Deno.test("checkpoint hash can be used to restore empty checkpoint with 0 seq", async () => {
    const prior = emptyHash;
    const checkpointer = new Checkpointer(prior);
    const checkpoint = checkpointer.make(0);
    const lookup =  new Map<Hash,string>();
    const restored = await serialize_thru(checkpoint, lookup);
    // console.log({checkpoint, restored});
});

Deno.test("checkpoint hash can be used to restore checkpoint 1 value", async () => {
    const prior = emptyHash;
    const lookup =  new Map<Hash,string>();
    const checkpointer = new Checkpointer(prior);
    lookup.set(await checkpointer.set("one","gun"), "gun");
    const checkpoint = checkpointer.make(42);
    const restored = await serialize_thru(checkpoint, lookup);
    // console.log({checkpoint, restored});
});
