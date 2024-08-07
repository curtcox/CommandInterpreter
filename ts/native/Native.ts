import { Hash } from "../core/Ref.ts";

export interface Store {
    get: (key:string)               => string | undefined;
    set: (key:string, value:string) => Promise<string>;
    snapshot: ()                    => Promise<Hash>; // or checkpoint?
}

export interface Env {
    get: (key:string) => string;
    set: (key:string, value:string) => void;
}

export interface Natives {
    env: Env;
    store: Store;
}