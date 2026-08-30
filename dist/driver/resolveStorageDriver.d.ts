import { IStorageDriver } from '../type/IStorageDriver';
/**
 * The built-in storage backends, addressable by name.
 *
 * - `local`   — `window.localStorage`, survives the browser being closed.
 * - `session` — `window.sessionStorage`, scoped to the tab and dropped when the browser closes.
 * - `memory`  — process memory, dropped on reload.
 */
export type StorageDriverName = 'local' | 'session' | 'memory';
/**
 * A backend selector: either one of the built-in names or a backend supplied by the caller.
 */
export type StorageDriverInput = StorageDriverName | IStorageDriver;
/**
 * Resolves a backend selector into a usable storage backend.
 *
 * Web Storage is probed rather than merely detected. A browser can expose `window.sessionStorage`
 * and still throw the moment it is written to — Safari's private mode is the familiar case — so
 * presence alone is not evidence that it works. When the probe fails, the caller silently gets
 * memory storage instead of an exception on the first write.
 *
 * @param {StorageDriverInput} [driver='local'] - The backend name, or a backend to use directly.
 * @return {IStorageDriver} A backend that is safe to read from and write to.
 */
export declare function resolveStorageDriver(driver?: StorageDriverInput): IStorageDriver;
