/**
 * A string that holds a key value.
 * Keys are limited to legal filename path values so that they can be easily used
 * with a store that uses a filesystem.
 */
export class Key {

    value: string;

    constructor(value: string) {
        const problem = reasonNotValid(value);
        if (problem) {
            throw new Error(problem);
        }
        this.value = value;
    }
}

const is_safe = (input: string): boolean => (input==='.' || input==='..') ? false : /^[a-zA-Z0-9/_.-]*$/.test(input);

export function reasonNotValid(value: string): string | null {
    const max = 256;
    if (value.length === 0)  return `Key must not be empty.`;
    if (value.length >= max) return `Key value must be less than ${max} characters long, but got ${value.length}`;
    if (value==='.' || value==='..') return 'Key cannot be "." or ".."';
    if (!is_safe(value))     return 'Key can only contain letters, numbers, and _-/.';
    return null;
}