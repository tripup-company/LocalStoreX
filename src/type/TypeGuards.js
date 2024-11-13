/**
 * Checks if the given object conforms to the IStorageItem interface.
 *
 * @param {any} obj - The object to be checked.
 * @return {boolean} - Returns true if the object is an IStorageItem, otherwise false.
 */
export function isIStorageItem(obj) {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.currentVersion === 'string' &&
        (typeof obj.expiration === 'number' || obj.expiration === null) &&
        typeof obj.values === 'object';
}
