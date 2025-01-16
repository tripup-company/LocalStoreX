import { isIStorageItem } from './type/TypeGuards';
export default class LocalStoreX {
    /**
     * Constructor for initializing the object with a version helper and an optional default expiration time.
     * Also performs cleanup of expired items.
     *
     * @param {string} defaultVersion - Default version for managing stored objects.
     * @param {number} [defaultExpiration=null] - The default expiration time for items in seconds.
     *
     * @return {void}
     */
    constructor(defaultVersion = 'v1', defaultExpiration = null) {
        Object.defineProperty(this, "defaultVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultVersion
        });
        Object.defineProperty(this, "defaultExpiration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultExpiration
        });
    }
    /**
     * Returns a singleton instance of the LocalStoreX class.
     * If one does not already exist, it creates one with the provided configuration.
     *
     * @param {Object} [config] - Optional configuration object.
     * @param {string} [config.defaultVersion='v1'] - Specifies the default version for the instance.
     * @param {null} [config.defaultExpiration=null] - Specifies the default expiration for the instance.
     * @return {LocalStoreX} The singleton instance of the LocalStoreX class.
     */
    static getInstance(config) {
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
     * @param {string} [providedVersion] - Optional version information for the data.
     * @return {void}
     */
    setItem(key, data, expiration, providedVersion) {
        const version = providedVersion || this.defaultVersion;
        const existingItem = this.getExistingItem(key);
        const updatedItem = existingItem
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
    getItem(key, version) {
        const item = this.getExistingItem(key);
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
     * @return {void}
     */
    removeItem(key) {
        localStorage.removeItem(key);
    }
    /**
     * Clears all key-value pairs stored in the local storage.
     *
     * @return {void}
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
    getExistingItem(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item)
                return null;
            const parsedItem = JSON.parse(item);
            return isIStorageItem(parsedItem) ? parsedItem : null;
        }
        catch (error) {
            console.warn(`Error parsing JSON for key "${key}":`, error);
            return null;
        }
    }
    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time in seconds.
     * @param {string} [version] - The version of the new storage item.
     * @return {IStorageItem} The newly created storage item.
     */
    createNewItem(data, expiration, version) {
        return {
            version: version ?? this.defaultVersion,
            expiration: expiration ? Date.now() + expiration * 1000 : this.defaultExpiration,
            value: data,
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
    updateExistingItem(existingItem, data, version, expiration) {
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
    isExpired(expiration) {
        return expiration !== null && Date.now() > expiration;
    }
}
