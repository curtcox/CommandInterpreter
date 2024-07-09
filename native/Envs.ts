import { Env } from "./Native.ts";

const env:Map<string,string> = new Map();

export const DenoEnv: Env = {
    get: (key:string) => env.get(key) || Deno.env.get(key) || `Missing environment variable: ${key}`,
    set: (key:string, value:string) => env.set(key,value)
}