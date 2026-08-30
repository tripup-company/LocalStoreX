import { IStorageDriver } from '../type/IStorageDriver';
import { MemoryStorageDriver } from './MemoryStorageDriver';

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
export function resolveStorageDriver(driver: StorageDriverInput = 'local'): IStorageDriver {
    if (typeof driver !== 'string') {
        return driver;
    }

    if (driver === 'memory') {
        return new MemoryStorageDriver();
    }

    const webStorage = probeWebStorage(driver === 'session' ? 'sessionStorage' : 'localStorage');
    return webStorage ?? new MemoryStorageDriver();
}

/**
 * Returns the named Web Storage area if it can actually be written to, otherwise null.
 *
 * @param {'localStorage' | 'sessionStorage'} area - The Web Storage area to probe.
 * @return {IStorageDriver | null} The working storage area, or null when it is unusable.
 */
function probeWebStorage(area: 'localStorage' | 'sessionStorage'): IStorageDriver | null {
    try {
        if (typeof globalThis === 'undefined') {
            return null;
        }

        const storage = (globalThis as { [key: string]: unknown })[area] as IStorageDriver | undefined;
        if (!storage) {
            return null;
        }

        const probeKey = `__localstorex_probe__${Math.random().toString(36).slice(2)}`;
        storage.setItem(probeKey, '1');
        storage.removeItem(probeKey);

        return storage;
    } catch {
        return null;
    }
}
