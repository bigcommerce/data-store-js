import { isPlainObject } from 'lodash';

export default function deepFreeze<T>(object: T[]): ReadonlyArray<T>;
export default function deepFreeze<T extends object>(object: T): Readonly<T>;
export default function deepFreeze<T>(object: T): T;
export default function deepFreeze<T>(object: T[] | T): ReadonlyArray<T> | Readonly<T> | T {
    try {
        if (Object.isFrozen(object) || (!Array.isArray(object) && !isPlainObject(object))) {
            return object;
        }

        if (Array.isArray(object)) {
            return Object.freeze(object.map(value => deepFreeze(value)));
        }

        return Object.freeze(Object.getOwnPropertyNames(object).reduce((result, key) => {
            result[key as keyof T] = deepFreeze(object[key as keyof T]);

            return result;
        }, {} as T));
    } catch (error) {
        // Browsers that only support ES5 will throw `TypeError` when checking
        // if a primitive value is frozen or trying to freeze a primitive value.
        if (error instanceof TypeError) {
            return object;
        }

        throw error;
    }
}
