import { IStorageItem } from './IStorageItem';

/**
 * Checks if the given object is a stored value.
 *
 * @param {any} obj - The object to be checked.
 * @return {boolean} - Returns true if the object is a stored value, otherwise false.
 */
export function isStoredValue(obj: any): obj is Record<string, any> {
    return obj && typeof obj === 'object';
}

/**
 * Checks if the given object conforms to the IStorageItem interface.
 *
 * @param {any} obj - The object to be checked.
 * @return {boolean} - Returns true if the object is an IStorageItem, otherwise false.
 */
export function isIStorageItem(obj: any): obj is IStorageItem {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.currentVersion === 'string' &&
        (typeof obj.expiration === 'number' || obj.expiration === null) &&
        typeof obj.values === 'object' &&
        Object.values(obj.values).every(isStoredValue);
}
