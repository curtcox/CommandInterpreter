import { Ref } from "../core/Ref.ts";
import { Hash, hash } from "../core/Ref.ts";
import { HashLookup } from "../core/Lookup.ts";
const cutoff = 88;

function size(value: unknown): number {
    if (typeof value === "string") {
        return value.length;
    }
    return JSON.stringify(value).length;
}

const is_hash                = (value: string):  boolean => size(value) == cutoff;
const big_enough_to_hash     = (value: unknown): boolean => size(value) > cutoff;
const small_enough_to_return = (value: unknown): boolean => size(value) <= cutoff;
const stringify              = (value: unknown): string => JSON.stringify(value);

export async function jsonToRef(json: string): Promise<Ref> {
    const replacements: Map<Hash, string> = new Map();
    if (small_enough_to_return(json)) {
        return {result: json, replacements};
    }
    const o = JSON.parse(json);
    for (const key in o) {
        const value = o[key];
        if (big_enough_to_hash(value)) {
            const ref = await jsonToRef(stringify(value));
            o[key] = await ref.result;
            for (const [hash, subtree] of (await ref).replacements.entries()) {
                replacements.set(hash, subtree);
            }
        }
    }
    const out = stringify(o);
    const hashed = await hash(out);
    replacements.set(hashed, out);
    const result = hashed.value;
    return { result, replacements };
}

export function lookupJson(json: string | undefined, get: HashLookup): string | undefined {
    // console.log({lookupJson, json});
    // console.log('json:', json);
    if (!json) {
        return undefined;
    }
    if (is_hash(json)) {
        json = get(new Hash(json));
        if (!json) {
            return undefined;
        }
    }
    const o = JSON.parse(json);
    for (const key in o) {
        const value = o[key];
        if (typeof value === "string" && value.length === 88) {
            const content = get(new Hash(value));
            // console.log({message:'key found in looking up', key, value, content});
            const jsonValue = lookupJson(content, get);
            if (jsonValue) {
                o[key] = JSON.parse(jsonValue);
            }
        }
    }
    return stringify(o);
}

export function refToJson(ref: Ref): string | undefined {
    return lookupJson(ref.result, (key: Hash) => ref.replacements.get(key) || "");
}