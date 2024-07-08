/**
 * A string that holds a hash value.
 */
export class Hash {

    value: string;

    constructor(value: string) {
        if (value.length !== 88) {
            throw new Error(`Hash value must be 88 characters long, but got ${value.length}`);
        }
        this.value = value;
    }
}

export interface Ref {
    result: string; // either literal, hash, or JSON with embedded hashes
    replacements: Map<Hash, string>; // Map<hash, subtree>
}

export interface HashLookup {
    (key: Hash): string | undefined;
}

