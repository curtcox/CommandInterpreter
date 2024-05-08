/**
 * Check that this thing is defined, because we really need it to be defined, OK? 
 */
export function check<T>(value: T) : T {
    if (!value) {
      throw new Error("Value is undefined");
    }
    return value;
}

export function isString(obj: unknown): string {
  if (typeof obj === 'string') {
    return obj;
  }
  throw new Error('Must be a string');
}