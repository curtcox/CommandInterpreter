/**
 * A string that holds a particular type of hash value.
 * This class is a type-safe wrapper for a string with certain constraints.
 * - Must be 86 characters long. (Base64 encoding of 64 bytes of SHA-512 hash minus 2 padding characters)
 * - Only valid filename characters are allowed.
 * 
 * Hashes are used as keys in a content-addressable store.
 * Making their values legal filenames allows that store to be implemented
 * as a directory of files, with the hashes as the filenames.
 */
export class Hash {

    value: string;

    constructor(value: string) {
        const problem = reasonNotValid(value);
        if (problem) {
            throw new Error(problem);
        }
        this.value = value;
    }
}

const is_safe = (input: string): boolean => (input==='.' || input==='..') ? false : /^[a-zA-Z0-9/_-]*$/.test(input);
const make_safe = (input: string): string => input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function reasonNotValid(value: string): string | null {
    if (value.length !== 86) return `Hash must be 86 characters long, but got ${value.length}`;
    if (!is_safe(value))     return 'Hash can only contain letters, numbers, and dash(-) and underscore(_) characters.';
    return null;
}

export const empty = new Hash("z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg_SpIdNs6c5H0NE8XYXysP-DGNKHfuwvY7kxvUdBeoGlODJ6-SfaPg");

export async function hash(value: string): Promise<Hash> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hash = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hash));
    const base64Hash = btoa(String.fromCharCode.apply(null, hashArray));
    // const unpadded = base64Hash.replace(/=+$/, '');
    return new Hash(make_safe(base64Hash));
}
  
export interface Ref {
    result: string; // either literal, hash, or JSON with embedded hashes
    replacements: Map<Hash, string>; // Map<hash, subtree>
}

