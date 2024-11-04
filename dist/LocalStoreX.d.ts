import { default as IObjectVersionHelper } from './type/IObjectVersionHelper';
export default class LocalStoreX {
    private objectVersionHelper;
    /**
     * LocalStoreX is an instance of a class designed to handle local storage operations.
     * It provides methods for storing, retrieving, and managing data in the browser's local storage.
     *
     * Common use cases include saving user preferences, caching data for offline use,
     * and persisting application state between sessions.
     */
    private static instance;
    /**
     * A default instance of ObjectVersionHelper which implements the IObjectVersionHelper interface.
     * This instance is commonly used to manage versioning of objects where version control is required.
     * It provides necessary methods to handle version-related operations seamlessly.
     */
    private static defaultVersionHelper;
    /**
     * Constructor for initializing the object with a version helper and performing cleanup of expired items.
     *
     * @param {IObjectVersionHelper} objectVersionHelper - An instance used to manage versioning of objects.
     *
     * @return {void}
     */
    private constructor();
    /**
     * Retrieves the singleton instance of the LocalStoreX class.
     * If no instance exists, a new one will be created.
     *
     * @return {LocalStoreX} The singleton instance of LocalStoreX.
     */
    static getInstance(): LocalStoreX;
    /**
     * Stores an item in the local storage with the specified key, data, and optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time for the data in milliseconds.
     * @param {string | IObjectVersionHelper} [providedVersion] - Optional version information for the data.
     * @return {void}
     */
    setItem(key: string, data: any, expiration?: number, providedVersion?: string | IObjectVersionHelper): void;
    /**
     * Retrieves an item from storage by its key and optional version.
     *
     * @param {string} key - The key of the item to retrieve.
     * @param {string} [version] - Optional version to retrieve a specific version of the item.
     * @return {*} The data stored under the given key and version, or null if the item does not exist or is expired.
     */
    getItem(key: string, version?: string): import('./type/IStorageItem').IStoredValue | null;
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
     * @param {string} version - The version of the new storage item.
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration
     *                                is set to the current time plus the specified hours.
     * @return {IStorageItem} The newly created storage item.
     */
    private createNewItem;
    /**
     * Updates the value associated with a specified version in a storage item.
     * If the version does not already exist, it will be added.
     *
     * @param {IStorageItem} item - The storage item to update or add a value to.
     * @param {string} version - The version identifier to update or add.
     * @param {any} data - The data to associate with the specified version.
     * @return {void}
     */
    private updateOrAddValue;
    /**
     * Updates the current version and expiration time of the given storage item.
     *
     * @param {IStorageItem} item - The storage item to update.
     * @param {string} version - The new version to set for the storage item.
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration time is updated.
     *
     * @return {void}
     */
    private updateCurrentVersion;
    /**
     * Retrieves the version string based on the provided value and optional version information.
     *
     * @param {any} value - The value to generate or retrieve the version for.
     * @param {string | IObjectVersionHelper} [providedVersion] - Optional version information provided either as a string or an instance of IObjectVersionHelper.
     * @return {string} The generated or provided version string.
     */
    private getVersion;
    /**
     * Checks whether the given expiration timestamp has passed.
     *
     * @param {number | null} expiration - The timestamp to check for expiration, or null to indicate no expiration.
     * @return {boolean} Returns true if the current time is greater than the expiration time, false otherwise.
     */
    private isExpired;
    /**
     * Cleans up expired items from localStorage. The method iterates over all keys in localStorage,
     * retrieves the associated item, and removes it if it has expired or if it contains invalid JSON.
     *
     * @return void
     */
    private cleanupExpiredItems;
}
