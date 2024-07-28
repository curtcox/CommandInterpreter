export function now_now(): PreciseTime {
    return { millis: Date.now(), micros: performance.now() };
}

// The exact time as far as we can determine it.
export interface PreciseTime {
    millis: number;
    micros: number;
}

// Rename to span?
export interface Duration {
    start: PreciseTime;
    end: PreciseTime;
}