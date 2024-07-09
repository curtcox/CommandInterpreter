import { Hash } from "../Ref.ts";

export interface Store {
    get: (key:string)               => string | undefined;
    set: (key:string, value:string) => Promise<string>;
    snapshot: ()                    => Promise<Hash>;
}