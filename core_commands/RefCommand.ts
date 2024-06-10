import { hash } from "./HashCommand.ts";
import { use_replacement } from "../Strings.ts";


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

export function refToJson(ref: Ref): string {
    const replacements = ref.replacements;

    function resolveHashes(str: string): string {
        let resolved = str;
        for (const [hash, subtree] of replacements.entries()) {
            resolved = use_replacement(resolved, {key: `"${hash}"`, value: subtree});
            resolved = use_replacement(resolved, {key: hash, value: subtree});
        }
        return resolved;
    }

    let json = ref.result;

    // Continuously replace hashes with subtrees until no hashes are left
    let previous;
    do {
        previous = json;
        json = resolveHashes(json);
    } while (json !== previous);

    return json;
}