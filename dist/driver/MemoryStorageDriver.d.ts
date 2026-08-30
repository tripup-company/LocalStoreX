import { IStorageDriver } from '../type/IStorageDriver';
/**
 * An in-process storage backend used wherever Web Storage is unavailable.
 *
 * Two situations reach it: server-side rendering, where there is no `window` at all, and browsers
 * that expose Web Storage but throw on access — Safari's private mode and profiles with site data
 * blocked. Falling back to memory keeps callers on the same API and lets the surrounding
 * application stay functional for the lifetime of the page instead of erroring on every write.
 *
 * Nothing here survives a reload, which is the point: a fallback that silently looked durable
 * would be worse than one that visibly is not.
 */
export declare class MemoryStorageDriver implements IStorageDriver {
    private readonly entries;
    /**
     * The number of entries currently held in memory.
     */
    get length(): number;
    /**
     * Returns the name of the nth key in insertion order, or null when out of range.
     *
     * @param {number} index - Zero-based index into the key list.
     * @return {string | null} The key at that position, or null.
     */
    key(index: number): string | null;
    /**
     * Reads the value stored under a key.
     *
     * @param {string} key - The key to read.
     * @return {string | null} The stored string, or null when the key is absent.
     */
    getItem(key: string): string | null;
    /**
     * Writes a value under a key.
     *
     * @param {string} key - The key to write.
     * @param {string} value - The value to store.
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
