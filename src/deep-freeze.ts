import { isPlainObject } from 'lodash';
import * as shallowEqual from 'shallowequal';

export interface DeepFreezeOptions<T> {
    previousValue?: T;
    equalityCheck?(valueA: any, valueB: any): boolean;
}

export default function deepFreeze<T>(object: T[], options?: DeepFreezeOptions<T>): ReadonlyArray<T>;
export default function deepFreeze<T extends object>(object: T, options?: DeepFreezeOptions<T>): Readonly<T>;
export default function deepFreeze<T>(object: T, options?: DeepFreezeOptions<T>): T;
export default function deepFreeze<T>(
    object: T[] | T,
    options?: DeepFreezeOptions<T>
): ReadonlyArray<T> | Readonly<T> | T {
    try {
        const { equalityCheck = shallowEqual, previousValue = null } = options || {};

        if (equalityCheck(object, previousValue) && Object.isFrozen(previousValue)) {
            return previousValue as T;
        }

        if (Object.isFrozen(object) || (!Array.isArray(object) && !isPlainObject(object))) {
            return object;
        }

        if (Array.isArray(object)) {
            return Object.freeze(object.map((value, index) =>
                deepFreeze(value, {
                    equalityCheck,
                    previousValue: Array.isArray(previousValue) ? previousValue[index] : undefined,
                })
            ));
        }

        return Object.freeze(Object.getOwnPropertyNames(object).reduce((result, key) => {
            result[key as keyof T] = deepFreeze(object[key as keyof T], {
                equalityCheck,
                previousValue: previousValue && previousValue.hasOwnProperty(key) ?
                    (previousValue as any)[key] :
                    undefined,
            });

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
