import { hash } from "./HashCommand.ts";

export interface Ref {
    result: string;
    replacements: Map<string, string>; // Map<hash, subtree>
}

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
    const replacements: Map<string, string> = new Map();
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
    const result = await hash(out);
    replacements.set(result, out);
    return { result, replacements };
}

export interface HashLookup {
    (key: string): string;
}

export function lookupJson(json: string, get: HashLookup): string {
    if (is_hash(json)) {
        json = get(json);
    }
    const o = JSON.parse(json);
    for (const key in o) {
        const value = o[key];
        if (typeof value === "string" && value.length === 88) {
            o[key] = JSON.parse(lookupJson(get(value), get));
        }
    }
    return stringify(o);
}

export function refToJson(ref: Ref): string {
    return lookupJson(ref.result, (key: string) => ref.replacements.get(key) || "");
}