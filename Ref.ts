export class Hash {

    value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export interface Ref {
    result: string; // either literal, hash, or JSON with embedded hashes
    replacements: Map<Hash, string>; // Map<hash, subtree>
}

export interface HashLookup {
    (key: Hash): string;
}

