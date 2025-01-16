import { IStorageItem } from './type/IStorageItem';
import { isIStorageItem } from './type/TypeGuards';

export default class LocalStoreX {
    /**
     * LocalStoreX is an instance of a class designed to handle local storage operations.
     * It provides methods for storing, retrieving, and managing data in the browser's local storage.
     *
     * Common use cases include saving user preferences, caching data for offline use,
     * and persisting application state between sessions.
     */
    private static instance: LocalStoreX;

    /**
     * Constructor for initializing the object with a version helper and an optional default expiration time.
     * Also performs cleanup of expired items.
     *
     * @param {string} defaultVersion - An instance used to manage versioning of objects.
     * @param {number} [defaultExpiration=null] - The default expiration time for items in seconds.
     *
     * @return {void}
     */
    private constructor(
        private defaultVersion: string  = 'v1',
        private defaultExpiration: number | null = null,
    ) {}

    /**
     * Returns a singleton instance of the LocalStoreX class.
     * If one does not already exist, it creates one with the provided configuration.
     *
     * @param {Object} [config] - Optional configuration object.
     * @param {string} [config.defaultVersion='v1'] - Specifies the default version for the instance.
     * @param {null} [config.defaultExpiration=null] - Specifies the default expiration for the instance.
     * @return {LocalStoreX} The singleton instance of the LocalStoreX class.
     */
    public static getInstance(config?: {defaultVersion: 'v1', defaultExpiration: null}): LocalStoreX {
        if (!LocalStoreX.instance) {
            const expiration = config?.defaultExpiration ?? null;
            const version = config?.defaultVersion ?? 'v1';

            LocalStoreX.instance = new LocalStoreX(version, expiration);
        }
        return LocalStoreX.instance;
    }

    /**
     * Stores an item in the local storage with the specified key, data, and optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time for the data in seconds.
     * @param {string | number} [providedVersion] - Optional version information for the data.*
     * @return {void}
     */
    setItem(key: string, data: any, expiration?: number, providedVersion?: string): void {
        const version = providedVersion || this.defaultVersion;
        const existingItem = this.getExistingItem(key);

        const updatedItem: IStorageItem = existingItem
            ? this.updateExistingItem(existingItem, data, version, expiration)
            : this.createNewItem(data, expiration, version);

        localStorage.setItem(key, JSON.stringify(updatedItem));
    }

    /**
     * Retrieves an item from storage by its key and optional version.
     *
     * @param {string} key - The key of the item to retrieve.
     * @param {string} [version] - Optional version to retrieve a specific version of the item.
     * @return {*} The data stored under the given key and version, or null if the item does not exist or is expired.
     */
    getItem(key: string, version?: string) {
        const item: IStorageItem | null = this.getExistingItem(key);
        if (!item || this.isExpired(item.expiration)) {
            localStorage.removeItem(key);
            return null;
        }

        const actualVersion = version || this.defaultVersion;
        if (item.version === actualVersion) {
            return item.value;
        }

        return null;
    }

    /**
     * Removes an item from the local storage based on the specified key.
     *
     * @param {string} key - The key of the item to be removed from local storage.
     * @return {void} No return value.
     */
    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    /**
     * Clears all key-value pairs stored in the local storage.
     *
     * @return {void} - No return value.
     */
    clear() {
        localStorage.clear();
    }

    /**
     * Retrieves an existing item from local storage.
     *
     * @param {string} key - The key under which the item is stored.
     * @return {IStorageItem | null} The parsed item if found, otherwise null.
     */
    private getExistingItem(key: string): IStorageItem | null {
        try {
            const item = localStorage.getItem(key);

            if (!item) return null;

            const parsedItem = JSON.parse(item);
            return isIStorageItem(parsedItem) ? parsedItem : null;
        } catch (error) {
            console.warn(`Error parsing JSON for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time in seconds. If provided, the expiration
     * @param {string} [version] - The version of the new storage item.
     * @return {IStorageItem} The newly created storage item.
     */
    private createNewItem(data: any, expiration?: number, version?: string): IStorageItem {
        return {
            version: version ?? this.defaultVersion,
            expiration: expiration ? Date.now() + expiration * 1000 : this.defaultExpiration,
            value: data
        };
    }

    /**
     * Updates an existing storage item with new data, version, and expiration time.
     *
     * @param {IStorageItem} existingItem - The existing item to update.
     * @param {any} data - The new data to store.
     * @param {string} version - The version to set for the item.
     * @param {number} [expiration] - Optional expiration time for the item in seconds.
     * @returns {IStorageItem} Returns the updated item.
     */
    private updateExistingItem(
        existingItem: IStorageItem,
        data: any,
        version: string,
        expiration?: number
    ): IStorageItem {
        return {
            ...existingItem,
            version,
            value: data,
            expiration: expiration ? Date.now() + expiration * 1000 : existingItem.expiration,
        };
    }

    /**
     * Checks whether the given expiration timestamp has passed.
     *
     * @param {number | null} expiration - The timestamp to check for expiration, or null to indicate no expiration.
     * @return {boolean} Returns true if the current time is greater than the expiration time, false otherwise.
     */
    private isExpired(expiration: number | null): boolean {
        return expiration !== null && Date.now() > expiration;
    }
}
