import { Hash } from "./Ref.ts";
import { Key } from "./Key.ts";

/**
 * A content addressable store of strings.
 */
export interface HashLookup {
    (key: Hash): string | undefined;
}

/**
 * A key addressable store of strings.
 */
export interface KeyLookup {
    (key: Key): string | undefined;
}

export function mapAsHashLookup(map: Map<Hash, string>): HashLookup {
    return (key: Hash) => map.get(key);
}

export function mapAsKeyLookup(map: Map<Key, string>): KeyLookup {
    return (key: Key) => map.get(key);
}