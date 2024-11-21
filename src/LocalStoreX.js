import { isIStorageItem } from './type/TypeGuards';
export default class LocalStoreX {
    /**
     * Constructor for initializing the object with a version helper and an optional default expiration time.
     * Also performs cleanup of expired items.
     *
     * @param {string} defaultVersion - An instance used to manage versioning of objects.
     * @param {number} [defaultExpiration=null] - The default expiration time for items in hours.
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
     * @param {number} [expiration] - Optional expiration time for the data in milliseconds.
     * @param {string | number} [providedVersion] - Optional version information for the data.* @return {void}
     */
    setItem(key, data, expiration, providedVersion) {
        const item = this.getExistingItem(key) ?? this.createNewItem(expiration, providedVersion);
        this.updateOrAddValue(item, data, expiration, providedVersion);
        localStorage.setItem(key, JSON.stringify(item));
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
        const currentValue = item.values[version ?? this.defaultVersion];
        return currentValue ? currentValue : null;
    }
    /**
     * Removes an item from the local storage based on the specified key.
     *
     * @param {string} key - The key of the item to be removed from local storage.
     * @return {void} No return value.
     */
    removeItem(key) {
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
     * Removes a specific version entry associated with the given key from storage.
     *
     * @param {string} key - The key associated with the item in storage.
     * @param {string} version - The version of the item to be removed.
     * @return {void}
     */
    removeVersionItem(key, version) {
        const item = this.getExistingItem(key);
        if (!item)
            return;
        delete item.values[version];
        if (Object.keys(item.values).length === 0) {
            localStorage.removeItem(key);
        }
        else {
            item.currentVersion = Object.keys(item.values)[Object.keys(item.values).length - 1];
            localStorage.setItem(key, JSON.stringify(item));
        }
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
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration
     * @param {string} [version] - The version of the new storage item.
     *                                is set to the current time plus the specified hours.
     * @return {IStorageItem} The newly created storage item.
     */
    createNewItem(expiration, version) {
        return {
            currentVersion: version ?? this.defaultVersion,
            expiration: expiration ? Date.now() + expiration * 3600000 : this.defaultExpiration,
            values: {}
        };
    }
    /**
     * Updates the specified storage item with a new version and optional expiration. If the item does not
     * exist, it is added with the provided data.
     *
     * @param {IStorageItem} item - The storage item to be updated or added.
     * @param {string} version - The version identifier for the new data.
     * @param {any} data - The data to be stored in the specified version.
     * @param {number} [expiration] - Optional expiration time in hours. If not provided, the existing expiration remains.
     *
     * @return {void}
     */
    updateOrAddValue(item, data, expiration, version) {
        item.currentVersion = version ?? item.currentVersion;
        item.expiration = expiration ? Date.now() + expiration * 3600000 : item.expiration;
        item.values[version ?? item.currentVersion] = data;
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
