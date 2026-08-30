/**
 * The storage backend a store instance reads from and writes to.
 *
 * This is the structural subset of the DOM `Storage` interface that the library actually uses,
 * so `window.localStorage` and `window.sessionStorage` satisfy it as-is. Declaring it separately
 * rather than depending on `Storage` keeps custom backends — an in-memory fallback, a test double,
 * a bridge to another window — first-class citizens instead of special cases.
 *
 * @interface IStorageDriver
 */
export interface IStorageDriver {
    /**
     * The number of entries currently held by the backend.
     */
    readonly length: number;
    /**
     * Returns the name of the nth key, or null when the index is out of range.
     *
     * @param {number} index - Zero-based index into the backend's key list.
     * @return {string | null} The key at that position, or null.
     */
    key(index: number): string | null;
    /**
     * Reads the raw serialized value stored under a key.
     *
     * @param {string} key - The key to read.
     * @return {string | null} The stored string, or null when the key is absent.
     */
    getItem(key: string): string | null;
    /**
     * Writes a raw serialized value under a key.
     *
     * @param {string} key - The key to write.
     * @param {string} value - The serialized value.
     * @return {void}
     */
    setItem(key: string, value: string): void;
    /**
     * Deletes the entry stored under a key.
     *
     * @param {string} key - The key to delete.
     * @return {void}
     */
    removeItem(key: string): void;
}
