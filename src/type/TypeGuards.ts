import { IStorageItem } from './IStorageItem';

/**
 * Checks if the given object conforms to the IStorageItem interface.
 *
 * @param {any} obj - The object to be checked.
 * @return {boolean} - Returns true if the object is an IStorageItem, otherwise false.
 */
export function isIStorageItem(obj: any): obj is IStorageItem {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.version === 'string' &&
        (typeof obj.expiration === 'number' || obj.expiration === null) &&
        obj.value !== undefined
    );
}