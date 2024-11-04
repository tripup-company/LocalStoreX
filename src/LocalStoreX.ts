import ObjectVersionHelper from './ObjectVersionHelper';
import IObjectVersionHelper from './type/IObjectVersionHelper';
import { IStorageItem } from './type/IStorageItem';
import { isIStorageItem } from './type/typeGuards';

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
     * A default instance of ObjectVersionHelper which implements the IObjectVersionHelper interface.
     * This instance is commonly used to manage versioning of objects where version control is required.
     * It provides necessary methods to handle version-related operations seamlessly.
     */
    private static defaultVersionHelper: IObjectVersionHelper = new ObjectVersionHelper();

    /**
     * Constructor for initializing the object with a version helper and performing cleanup of expired items.
     *
     * @param {IObjectVersionHelper} objectVersionHelper - An instance used to manage versioning of objects.
     *
     * @return {void}
     */
    private constructor(private objectVersionHelper: IObjectVersionHelper = LocalStoreX.defaultVersionHelper) {
        this.cleanupExpiredItems();
    }

    /**
     * Retrieves the singleton instance of the LocalStoreX class.
     * If no instance exists, a new one will be created.
     *
     * @return {LocalStoreX} The singleton instance of LocalStoreX.
     */
    public static getInstance(): LocalStoreX {
        if (!LocalStoreX.instance) {
            LocalStoreX.instance = new LocalStoreX();
        }
        return LocalStoreX.instance;
    }

    /**
     * Stores an item in the local storage with the specified key, data, and optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time for the data in milliseconds.
     * @param {string | IObjectVersionHelper} [providedVersion] - Optional version information for the data.
     * @return {void}
     */
    setItem(key: string, data: any, expiration?: number, providedVersion?: string | IObjectVersionHelper) {
        const version = this.getVersion(data, providedVersion);
        const item: IStorageItem = this.getExistingItem(key) ?? this.createNewItem(version, expiration);

        this.updateOrAddValue(item, version, data);
        this.updateCurrentVersion(item, version, expiration);

        localStorage.setItem(key, JSON.stringify(item));
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

        const currentValue = item.values[version ?? item.currentVersion];
        return currentValue ? currentValue : null;
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
     * Removes a specific version entry associated with the given key from storage.
     *
     * @param {string} key - The key associated with the item in storage.
     * @param {string} version - The version of the item to be removed.
     * @return {void}
     */
    removeVersionItem(key: string, version: string) {
        const item: IStorageItem | null = this.getExistingItem(key);
        if (!item) return;

        delete item.values[version];

        if (Object.keys(item.values).length === 0) {
            localStorage.removeItem(key);
        } else {
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
    private getExistingItem(key: string): IStorageItem | null {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);

            if (isIStorageItem(item)) {
                return item;
            } else {
                console.warn(`Invalid structure for key "${key}":`, item);
                return null;
            }
        } catch (e) {
            console.warn(`Error parsing JSON for key "${key}":`, e);
            return null;
        }
    }

    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {string} version - The version of the new storage item.
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration
     *                                is set to the current time plus the specified hours.
     * @return {IStorageItem} The newly created storage item.
     */
    private createNewItem(version: string, expiration?: number): IStorageItem {
        return {
            currentVersion: version,
            expiration: expiration ? Date.now() + expiration * 3600000 : null,
            values: {}
        };
    }

    /**
     * Updates the value associated with a specified version in a storage item.
     * If the version does not already exist, it will be added.
     *
     * @param {IStorageItem} item - The storage item to update or add a value to.
     * @param {string} version - The version identifier to update or add.
     * @param {any} data - The data to associate with the specified version.
     * @return {void}
     */
    private updateOrAddValue(item: IStorageItem, version: string, data: any) {
        item.values[version] = data;
    }

    /**
     * Updates the current version and expiration time of the given storage item.
     *
     * @param {IStorageItem} item - The storage item to update.
     * @param {string} version - The new version to set for the storage item.
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration time is updated.
     *
     * @return {void}
     */
    private updateCurrentVersion(item: IStorageItem, version: string, expiration?: number) {
        item.currentVersion = version;
        item.expiration = expiration ? Date.now() + expiration * 3600000 : item.expiration;
    }

    /**
     * Retrieves the version string based on the provided value and optional version information.
     *
     * @param {any} value - The value to generate or retrieve the version for.
     * @param {string | IObjectVersionHelper} [providedVersion] - Optional version information provided either as a string or an instance of IObjectVersionHelper.
     * @return {string} The generated or provided version string.
     */
    private getVersion(value: any, providedVersion?: string | IObjectVersionHelper): string {
        if (typeof providedVersion === 'string') {
            return providedVersion;
        } else if (providedVersion instanceof ObjectVersionHelper) {
            return providedVersion.generateVersionHash(value);
        } else {
            return this.objectVersionHelper.generateVersionHash(value);
        }
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

    /**
     * Cleans up expired items from localStorage. The method iterates over all keys in localStorage,
     * retrieves the associated item, and removes it if it has expired or if it contains invalid JSON.
     *
     * @return void
     */
    private cleanupExpiredItems() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const itemStr = localStorage.getItem(key);
                if (itemStr) {
                    try {
                        const item: IStorageItem = JSON.parse(itemStr);
                        if (this.isExpired(item.expiration)) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        console.warn(`Invalid JSON data for key "${key}": ${itemStr}`);
                        localStorage.removeItem(key);
                    }
                }
            }
        }
    }
}
