export function check<T>(value: T) : T {
    if (!value) {
      throw new Error("Value is undefined");
    }
    return value;
}