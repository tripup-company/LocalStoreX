/**
 * Interface representing a storage item used for maintaining versioned data with an optional expiration mechanism.
 *
 * @interface IStorageItem
 *
 * @property {string} currentVersion - The current version identifier of the storage item.
 * @property {number | null} expiration - The Unix timestamp representing the expiration time of the storage item. If null, the item does not expire.
 * @property {StoredValue[]} values - An array of stored values within the storage item.
 */
export interface IStorageItem {
    currentVersion: string;
    expiration: number | null;
    values: StoredValue[];
}
/**
 * The StoredValue interface represents a generic structure for storing a version and associated data.
 *
 * @interface
 *
 * @property {string} version - A string representing the version of the stored value.
 * @property {any} data - A generic placeholder for the data associated with this stored value.
 */
export interface StoredValue {
    version: string;
    data: any;
}
