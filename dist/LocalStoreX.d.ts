export default class LocalStoreX {
    private defaultVersion;
    private defaultExpiration;
    /**
     * LocalStoreX is an instance of a class designed to handle local storage operations.
     * It provides methods for storing, retrieving, and managing data in the browser's local storage.
     *
     * Common use cases include saving user preferences, caching data for offline use,
     * and persisting application state between sessions.
     */
    private static instance;
    /**
     * Constructor for initializing the object with a version helper and an optional default expiration time.
     * Also performs cleanup of expired items.
     *
     * @param {string} defaultVersion - An instance used to manage versioning of objects.
     * @param {number} [defaultExpiration=null] - The default expiration time for items in hours.
     *
     * @return {void}
     */
    private constructor();
    /**
     * Returns a singleton instance of the LocalStoreX class.
     * If one does not already exist, it creates one with the provided configuration.
     *
     * @param {Object} [config] - Optional configuration object.
     * @param {string} [config.defaultVersion='v1'] - Specifies the default version for the instance.
     * @param {null} [config.defaultExpiration=null] - Specifies the default expiration for the instance.
     * @return {LocalStoreX} The singleton instance of the LocalStoreX class.
     */
    static getInstance(config?: {
        defaultVersion: 'v1';
        defaultExpiration: null;
    }): LocalStoreX;
    /**
     * Stores an item in the local storage with the specified key, data, and optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time for the data in milliseconds.
     * @param {string | number} [providedVersion] - Optional version information for the data.* @return {void}
     */
    setItem(key: string, data: any, expiration?: number, providedVersion?: string): void;
    /**
     * Retrieves an item from storage by its key and optional version.
     *
     * @param {string} key - The key of the item to retrieve.
     * @param {string} [version] - Optional version to retrieve a specific version of the item.
     * @return {*} The data stored under the given key and version, or null if the item does not exist or is expired.
     */
    getItem(key: string, version?: string): any;
    /**
     * Removes an item from the local storage based on the specified key.
     *
     * @param {string} key - The key of the item to be removed from local storage.
     * @return {void} No return value.
     */
    removeItem(key: string): void;
    /**
     * Clears all key-value pairs stored in the local storage.
     *
     * @return {void} - No return value.
     */
    clear(): void;
    /**
     * Removes a specific version entry associated with the given key from storage.
     *
     * @param {string} key - The key associated with the item in storage.
     * @param {string} version - The version of the item to be removed.
     * @return {void}
     */
    removeVersionItem(key: string, version: string): void;
    /**
     * Retrieves an existing item from local storage.
     *
     * @param {string} key - The key under which the item is stored.
     * @return {IStorageItem | null} The parsed item if found, otherwise null.
     */
    private getExistingItem;
    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration
     * @param {string} [version] - The version of the new storage item.
     *                                is set to the current time plus the specified hours.
     * @return {IStorageItem} The newly created storage item.
     */
    private createNewItem;
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
    private updateOrAddValue;
    /**
     * Checks whether the given expiration timestamp has passed.
     *
     * @param {number | null} expiration - The timestamp to check for expiration, or null to indicate no expiration.
     * @return {boolean} Returns true if the current time is greater than the expiration time, false otherwise.
     */
    private isExpired;
}
