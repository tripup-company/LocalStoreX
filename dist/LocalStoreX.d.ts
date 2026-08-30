import { StorageDriverInput } from './driver/resolveStorageDriver';
/**
 * Configuration accepted by {@link LocalStoreX.getInstance}.
 */
export interface IStoreConfig {
    /**
     * Which storage backend to bind the instance to. Defaults to `'local'`, so existing callers
     * that pass no configuration keep talking to `localStorage`.
     */
    driver?: StorageDriverInput;
    /**
     * Default version stamped onto stored items when a call supplies none.
     */
    defaultVersion?: string;
    /**
     * Default lifetime in seconds for items stored without an explicit expiration.
     * `null` stores them indefinitely.
     */
    defaultExpiration?: number | null;
    /**
     * Whether to purge expired entries without waiting for someone to read them.
     * Enabled by default; see {@link LocalStoreX.sweepExpired} for why this matters.
     */
    autoSweep?: boolean;
    /**
     * Restricts every sweep to keys carrying this prefix. Set it whenever the store shares a
     * storage area with code you do not own — an embedded widget on a customer's page — so a
     * sweep can never touch entries that are not yours.
     */
    sweepPrefix?: string;
    /**
     * Additionally purge on a timer, in milliseconds. Off by default: the event-driven sweeps
     * cover the realistic cases, and a library that installs an interval nobody asked for is a
     * library that leaks one. Set it when a tab may sit in the foreground, untouched, for longer
     * than the data is allowed to live.
     */
    sweepIntervalMs?: number | null;
}
/**
 * LocalStoreX is a wrapper around the browser's Web Storage that adds versioning and expiration
 * to entries, and keeps expired entries from lingering.
 *
 * The backend is chosen per instance, so the same API serves `localStorage`, `sessionStorage`,
 * an in-memory fallback, or a backend of your own. {@link SessionStoreX} is the session-scoped
 * spelling of this class and shares its implementation.
 */
export default class LocalStoreX {
    private defaultVersion;
    private defaultExpiration;
    private autoSweep;
    private sweepPrefix?;
    /**
     * One instance per backend. The original single-instance design could only ever describe
     * `localStorage`; keying by backend is what lets a local-scoped and a session-scoped store
     * exist side by side, which is the whole point of the driver.
     */
    private static instances;
    private readonly driver;
    private sweepTimer;
    private readonly handleSweepEvent;
    /**
     * Binds a store to a backend and performs the initial cleanup of expired items.
     *
     * @param {IStorageDriver} driver - The resolved storage backend.
     * @param {string} defaultVersion - Default version for stored items.
     * @param {number | null} defaultExpiration - Default lifetime in seconds, or null for none.
     * @param {boolean} autoSweep - Whether to purge expired entries on load and on tab activation.
     * @param {string | undefined} sweepPrefix - Restricts sweeps to keys with this prefix.
     * @param {number | null} sweepIntervalMs - Additional periodic sweep interval, or null.
     */
    private constructor();
    /**
     * Returns the store bound to the configured backend, creating it on first use.
     *
     * Calls that name the same backend share one instance, so the configuration of the first
     * call is the one that takes effect. Call {@link LocalStoreX.destroy} first if an instance
     * needs to be rebuilt with different settings.
     *
     * @param {IStoreConfig} [config] - Optional configuration.
     * @return {LocalStoreX} The instance for the requested backend.
     */
    static getInstance(config?: IStoreConfig): LocalStoreX;
    /**
     * Stores an item under the specified key, with an optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional lifetime for the data in seconds.
     * @param {string} [providedVersion] - Optional version information for the data.
     * @return {void}
     */
    setItem(key: string, data: any, expiration?: number, providedVersion?: string): void;
    /**
     * Retrieves an item by key, optionally requiring a specific version.
     *
     * @param {string} key - The key of the item to retrieve.
     * @param {string} [version] - Optional version the stored item has to carry.
     * @return {*} The stored data, or null when the item is missing, expired or another version.
     */
    getItem(key: string, version?: string): Record<string, any> | null;
    /**
     * Removes an item from storage.
     *
     * @param {string} key - The key of the item to be removed.
     * @return {void}
     */
    removeItem(key: string): void;
    /**
     * Removes every entry whose key carries the given prefix.
     *
     * Unlike {@link LocalStoreX.clear} this leaves the rest of the storage area untouched, which
     * is the only safe way to clean up when the page also belongs to somebody else.
     *
     * @param {string} prefix - The key prefix to remove.
     * @return {number} How many entries were removed.
     */
    removeItemsWithPrefix(prefix: string): number;
    /**
     * Clears stored entries.
     *
     * With a prefix this is {@link LocalStoreX.removeItemsWithPrefix}. Without one it empties the
     * entire storage area, including entries written by other code sharing it — pass a prefix
     * unless the store owns the area outright.
     *
     * @param {string} [prefix] - Optional key prefix to limit what is cleared.
     * @return {void}
     */
    clear(prefix?: string): void;
    /**
     * Removes every expired entry the store owns, without waiting for a read.
     *
     * `getItem` drops an expired entry when it happens to be asked for, which is enough when the
     * storage area itself is short-lived. It is not enough when the entry is meant to disappear
     * on a deadline: a tab left open keeps its `sessionStorage` alive indefinitely, so an entry
     * that expired days ago stays readable to anyone who opens devtools until something reads it.
     * Sweeping closes that gap, and with `autoSweep` it runs on load and whenever the tab is
     * brought back to the foreground.
     *
     * Entries that are not written by this library are never touched, so sweeping a shared
     * storage area is safe.
     *
     * @param {string} [prefix] - Optional key prefix; defaults to the configured `sweepPrefix`.
     * @return {number} How many expired entries were removed.
     */
    sweepExpired(prefix?: string): number;
    /**
     * Returns the keys currently present in the storage area.
     *
     * @param {string} [prefix] - Optional key prefix to filter by.
     * @return {string[]} The matching keys.
     */
    keys(prefix?: string): string[];
    /**
     * Detaches the store: stops the periodic sweep, unsubscribes from tab-activation events and
     * forgets the cached instance so the next `getInstance` can apply a fresh configuration.
     *
     * Stored data is left alone.
     *
     * @return {void}
     */
    destroy(): void;
    /**
     * Subscribes to the moments a stale entry could become visible again.
     *
     * Returning to a tab that has been in the background for days is exactly when an expired
     * entry would otherwise still be sitting there, so that is where the sweep belongs. `pageshow`
     * covers the same page being restored from the back/forward cache.
     *
     * @return {void}
     */
    private listenForSweepTriggers;
    /**
     * Collects the keys held by the backend, optionally filtered by prefix.
     *
     * The list is materialised before anything is removed: deleting while walking the backend by
     * index shifts the remaining entries down and would skip every second match.
     *
     * @param {string} [prefix] - Optional key prefix to filter by.
     * @return {string[]} The matching keys.
     */
    private collectKeys;
    /**
     * Reads and validates the item stored under a key.
     *
     * @param {string} key - The key under which the item is stored.
     * @param {boolean} [quiet=false] - Suppress the warning when the value cannot be parsed.
     * @return {IStorageItem | null} The parsed item, or null when absent, unparseable or foreign.
     */
    private getExistingItem;
    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional lifetime in seconds.
     * @param {string} [version] - The version of the new storage item.
     * @return {IStorageItem} The newly created storage item.
     */
    private createNewItem;
    /**
     * Updates an existing storage item with new data, version, and expiration time.
     *
     * @param {IStorageItem} existingItem - The existing item to update.
     * @param {any} data - The new data to store.
     * @param {string} version - The version to set for the item.
     * @param {number} [expiration] - Optional lifetime for the item in seconds.
     * @return {IStorageItem} The updated item.
     */
    private updateExistingItem;
    /**
     * Turns a lifetime in seconds into an absolute expiry timestamp.
     *
     * Both the explicit argument and the configured default are lifetimes, not timestamps. The
     * default used to be written into the item as-is, which made any non-null `defaultExpiration`
     * an epoch value a few seconds after 1970 — that is, expired on arrival.
     *
     * @param {number} [expiration] - Optional lifetime in seconds.
     * @return {number | null} The absolute expiry timestamp, or null when the item never expires.
     */
    private resolveExpiration;
    /**
     * Checks whether the given expiration timestamp has passed.
     *
     * @param {number | null} expiration - The timestamp to check, or null for no expiration.
     * @return {boolean} True when the item has expired.
     */
    private isExpired;
}
