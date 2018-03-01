export default function deepFreeze<T>(object: T[]): ReadonlyArray<T>;
export default function deepFreeze<T extends object>(object: T): Readonly<T>;
export default function deepFreeze<T>(object: T): T;
