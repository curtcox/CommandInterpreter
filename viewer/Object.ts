const self = "this";

export function follow(obj: any, chain: (string | number)[]): any {
  let current = obj;

  for (const key of chain) {
    try {
      current = current[key];
    } catch (error) {
      current = error;
    }
  }

  return current;
}

function trimmed(input: string): string {
  const max = 500;
  if (input.length <= max) {
    return input;
  } else {
    const truncated = input.slice(0, max);
    const remaining = input.length - max;
    return `${truncated}... ${remaining} remaining not shown`;
  }
}

export interface ObjectPart {
  key: string;
  type: string;
  value: string;
  parts: number;
}

export function asParts(obj: any): ObjectPart[] {
  const objectParts: ObjectPart[] = [];
  const record = asMap(obj);
  for (const key in record) {
    const value = record[key];

    if (value[self] && typeof value[self].count === "number") {
      const { count, obj, type } = value[self];
      const stringValue = obj !== undefined ? String(obj) : "";

      objectParts.push({
        key,
        type,
        value: trimmed(stringValue),
        parts: count,
      });
    }
  }

  return objectParts;
}

export function asMap(obj: any, deep: number = 1): Record<string, any> {
  const objectMap: Record<string, any> = {};

  // Bind the object to globalThis
  const globalObj = globalThis.Object(obj);

  // Traverse the prototype chain
  let currentObj = globalObj;
  let count = 0;
  while (currentObj !== null) {
    // Get all own properties (including non-enumerable ones) of the current object
    const properties = Object.getOwnPropertyNames(currentObj);
    for (const property of properties) {
      count = count + 1;
      if (deep > 0) {
        try {
          const value = asMap(globalObj[property], deep - 1);
          objectMap[property] = value;
        } catch (error) {
          objectMap[property] = error;
        }
      }
    }

    // Move to the next object in the prototype chain
    currentObj = Object.getPrototypeOf(currentObj);
  }

  const type = typeof obj;
  objectMap[self] = { count, obj, type };

  return objectMap;
}