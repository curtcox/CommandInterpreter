import { Hash, hash } from "../Ref.ts";
import { seq } from "../command/CommandDefinition.ts";
import { serialize } from "./ObjCommand.ts";
import { HashLookup } from "../Lookup.ts";
  
export class Checkpointer {

    private values: Map<string, Hash>;
    private prior: Hash;
  
    constructor(prior: Hash) {
        this.values = new Map<string, Hash>();
        this.prior = prior;
    }
  
    async set(key: string, value: string): Promise<Hash> {
        const hashed = await hash(value);
        this.values.set(key, hashed);
        return hashed;
    }
  
    make(id: seq): Checkpoint {
        const mark = { values: new Map(this.values), prior: this.prior, id };
        this.values.clear();
        return mark;
    }
}

export interface Checkpoint {
    values : Map<string, Hash>;
    prior: Hash;
    id: seq;
}

export async function hash_of(checkpoint: Checkpoint): Promise<Hash> {
    const serialized = await serialize(checkpoint);
    const hashed = await hash(serialized);
    return hashed;
}

export async function checkpoint_from(hash: Hash, lookup: HashLookup): Promise<Checkpoint> {
    throw new Error("Not implemented");
}