/**
 * Interface representing a storage item used for maintaining versioned data with an optional expiration mechanism.
 *
 * @interface IStorageItem
 *
 * @property {string} version - The version identifier of the storage item.
 * @property {number | null} expiration - The Unix timestamp representing the expiration time of the storage item. If null, the item does not expire.
 * @property {Record<string, any>} values - An object where the key is the version and the value is the data for that version. */
export interface IStorageItem {
    version: string;
    expiration: number | null;
    value: Record<string, any>;
}
