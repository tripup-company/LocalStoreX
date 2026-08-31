var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class MemoryStorageDriver {
  constructor() {
    __publicField(this, "entries", /* @__PURE__ */ new Map());
  }
  /**
   * The number of entries currently held in memory.
   */
  get length() {
    return this.entries.size;
  }
  /**
   * Returns the name of the nth key in insertion order, or null when out of range.
   *
   * @param {number} index - Zero-based index into the key list.
   * @return {string | null} The key at that position, or null.
   */
  key(index) {
    if (index < 0 || index >= this.entries.size) {
      return null;
    }
    return Array.from(this.entries.keys())[index] ?? null;
  }
  /**
   * Reads the value stored under a key.
   *
   * @param {string} key - The key to read.
   * @return {string | null} The stored string, or null when the key is absent.
   */
  getItem(key) {
    return this.entries.has(key) ? this.entries.get(key) : null;
  }
  /**
   * Writes a value under a key.
   *
   * @param {string} key - The key to write.
   * @param {string} value - The value to store.
   * @return {void}
   */
  setItem(key, value) {
    this.entries.set(key, value);
  }
  /**
   * Deletes the entry stored under a key.
   *
   * @param {string} key - The key to delete.
   * @return {void}
   */
  removeItem(key) {
    this.entries.delete(key);
  }
}
function resolveStorageDriver(driver = "local") {
  if (typeof driver !== "string") {
    return driver;
  }
  if (driver === "memory") {
    return new MemoryStorageDriver();
  }
  const webStorage = probeWebStorage(driver === "session" ? "sessionStorage" : "localStorage");
  return webStorage ?? new MemoryStorageDriver();
}
function probeWebStorage(area) {
  try {
    if (typeof globalThis === "undefined") {
      return null;
    }
    const storage = globalThis[area];
    if (!storage) {
      return null;
    }
    const probeKey = `__localstorex_probe__${Math.random().toString(36).slice(2)}`;
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}
function isIStorageItem(obj) {
  return obj && typeof obj === "object" && typeof obj.version === "string" && (typeof obj.expiration === "number" || obj.expiration === null) && obj.value !== void 0;
}
const _LocalStoreX = class _LocalStoreX {
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
  constructor(driver, defaultVersion = "v1", defaultExpiration = null, autoSweep = true, sweepPrefix, sweepIntervalMs = null) {
    __publicField(this, "defaultVersion");
    __publicField(this, "defaultExpiration");
    __publicField(this, "autoSweep");
    __publicField(this, "sweepPrefix");
    __publicField(this, "driver");
    __publicField(this, "sweepTimer", null);
    __publicField(this, "handleSweepEvent", () => {
      this.sweepExpired();
    });
    this.defaultVersion = defaultVersion;
    this.defaultExpiration = defaultExpiration;
    this.autoSweep = autoSweep;
    this.sweepPrefix = sweepPrefix;
    this.driver = driver;
    if (this.autoSweep) {
      this.sweepExpired();
      this.listenForSweepTriggers();
    }
    if (sweepIntervalMs && sweepIntervalMs > 0) {
      this.sweepTimer = setInterval(this.handleSweepEvent, sweepIntervalMs);
    }
  }
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
  static getInstance(config) {
    const driverInput = (config == null ? void 0 : config.driver) ?? "local";
    const existing = _LocalStoreX.instances.get(driverInput);
    if (existing) {
      return existing;
    }
    const instance = new _LocalStoreX(
      resolveStorageDriver(driverInput),
      (config == null ? void 0 : config.defaultVersion) ?? "v1",
      (config == null ? void 0 : config.defaultExpiration) ?? null,
      (config == null ? void 0 : config.autoSweep) ?? true,
      config == null ? void 0 : config.sweepPrefix,
      (config == null ? void 0 : config.sweepIntervalMs) ?? null
    );
    _LocalStoreX.instances.set(driverInput, instance);
    return instance;
  }
  /**
   * Stores an item under the specified key, with an optional version and expiration.
   *
   * @param {string} key - The key under which the data will be stored.
   * @param {any} data - The data to be stored.
   * @param {number} [expiration] - Optional lifetime for the data in seconds.
   * @param {string} [providedVersion] - Optional version information for the data.
   * @return {void}
   */
  setItem(key, data, expiration, providedVersion) {
    const version = providedVersion || this.defaultVersion;
    const existingItem = this.getExistingItem(key);
    const updatedItem = existingItem ? this.updateExistingItem(existingItem, data, version, expiration) : this.createNewItem(data, expiration, version);
    try {
      this.driver.setItem(key, JSON.stringify(updatedItem));
    } catch (error) {
      console.warn(`Error writing key "${key}" to storage:`, error);
      this.sweepExpired();
      try {
        this.driver.setItem(key, JSON.stringify(updatedItem));
      } catch {
      }
    }
  }
  /**
   * Retrieves an item by key, optionally requiring a specific version.
   *
   * @param {string} key - The key of the item to retrieve.
   * @param {string} [version] - Optional version the stored item has to carry.
   * @return {*} The stored data, or null when the item is missing, expired or another version.
   */
  getItem(key, version) {
    const item = this.getExistingItem(key);
    if (!item) {
      return null;
    }
    if (this.isExpired(item.expiration)) {
      this.driver.removeItem(key);
      return null;
    }
    const actualVersion = version || this.defaultVersion;
    if (item.version === actualVersion) {
      return item.value;
    }
    return null;
  }
  /**
   * Removes an item from storage.
   *
   * @param {string} key - The key of the item to be removed.
   * @return {void}
   */
  removeItem(key) {
    this.driver.removeItem(key);
  }
  /**
   * Removes every entry whose key carries the given prefix.
   *
   * Unlike {@link LocalStoreX.clear} this leaves the rest of the storage area untouched, which
   * is the only safe way to clean up when the page also belongs to somebody else.
   *
   * @param {string} prefix - The key prefix to remove.
   * @return {number} How many entries were removed.
   */
  removeItemsWithPrefix(prefix) {
    const keys = this.collectKeys(prefix);
    for (const key of keys) {
      this.driver.removeItem(key);
    }
    return keys.length;
  }
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
  clear(prefix) {
    if (prefix !== void 0) {
      this.removeItemsWithPrefix(prefix);
      return;
    }
    for (const key of this.collectKeys()) {
      this.driver.removeItem(key);
    }
  }
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
  sweepExpired(prefix = this.sweepPrefix ?? "") {
    let removed = 0;
    for (const key of this.collectKeys(prefix)) {
      const item = this.getExistingItem(key, true);
      if (item && this.isExpired(item.expiration)) {
        this.driver.removeItem(key);
        removed += 1;
      }
    }
    return removed;
  }
  /**
   * Returns the keys currently present in the storage area.
   *
   * @param {string} [prefix] - Optional key prefix to filter by.
   * @return {string[]} The matching keys.
   */
  keys(prefix) {
    return this.collectKeys(prefix);
  }
  /**
   * Detaches the store: stops the periodic sweep, unsubscribes from tab-activation events and
   * forgets the cached instance so the next `getInstance` can apply a fresh configuration.
   *
   * Stored data is left alone.
   *
   * @return {void}
   */
  destroy() {
    if (this.sweepTimer !== null) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    if (typeof document !== "undefined" && typeof document.removeEventListener === "function") {
      document.removeEventListener("visibilitychange", this.handleSweepEvent);
    }
    if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
      window.removeEventListener("focus", this.handleSweepEvent);
      window.removeEventListener("pageshow", this.handleSweepEvent);
    }
    for (const [driverInput, instance] of _LocalStoreX.instances) {
      if (instance === this) {
        _LocalStoreX.instances.delete(driverInput);
      }
    }
  }
  /**
   * Subscribes to the moments a stale entry could become visible again.
   *
   * Returning to a tab that has been in the background for days is exactly when an expired
   * entry would otherwise still be sitting there, so that is where the sweep belongs. `pageshow`
   * covers the same page being restored from the back/forward cache.
   *
   * @return {void}
   */
  listenForSweepTriggers() {
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", this.handleSweepEvent);
    }
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("focus", this.handleSweepEvent);
      window.addEventListener("pageshow", this.handleSweepEvent);
    }
  }
  /**
   * Collects the keys held by the backend, optionally filtered by prefix.
   *
   * The list is materialised before anything is removed: deleting while walking the backend by
   * index shifts the remaining entries down and would skip every second match.
   *
   * @param {string} [prefix] - Optional key prefix to filter by.
   * @return {string[]} The matching keys.
   */
  collectKeys(prefix) {
    const keys = [];
    try {
      for (let index = 0; index < this.driver.length; index += 1) {
        const key = this.driver.key(index);
        if (key === null) {
          continue;
        }
        if (prefix && !key.startsWith(prefix)) {
          continue;
        }
        keys.push(key);
      }
    } catch (error) {
      console.warn("Error enumerating storage keys:", error);
    }
    return keys;
  }
  /**
   * Reads and validates the item stored under a key.
   *
   * @param {string} key - The key under which the item is stored.
   * @param {boolean} [quiet=false] - Suppress the warning when the value cannot be parsed.
   * @return {IStorageItem | null} The parsed item, or null when absent, unparseable or foreign.
   */
  getExistingItem(key, quiet = false) {
    try {
      const item = this.driver.getItem(key);
      if (!item) return null;
      const parsedItem = JSON.parse(item);
      return isIStorageItem(parsedItem) ? parsedItem : null;
    } catch (error) {
      if (!quiet) {
        console.warn(`Error parsing JSON for key "${key}":`, error);
      }
      return null;
    }
  }
  /**
   * Creates a new storage item with the given version and optional expiration time.
   *
   * @param {any} data - The data to be stored.
   * @param {number} [expiration] - Optional lifetime in seconds.
   * @param {string} [version] - The version of the new storage item.
   * @return {IStorageItem} The newly created storage item.
   */
  createNewItem(data, expiration, version) {
    return {
      version: version ?? this.defaultVersion,
      expiration: this.resolveExpiration(expiration),
      value: data
    };
  }
  /**
   * Updates an existing storage item with new data, version, and expiration time.
   *
   * @param {IStorageItem} existingItem - The existing item to update.
   * @param {any} data - The new data to store.
   * @param {string} version - The version to set for the item.
   * @param {number} [expiration] - Optional lifetime for the item in seconds.
   * @return {IStorageItem} The updated item.
   */
  updateExistingItem(existingItem, data, version, expiration) {
    return {
      ...existingItem,
      version,
      value: data,
      expiration: expiration ? Date.now() + expiration * 1e3 : existingItem.expiration
    };
  }
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
  resolveExpiration(expiration) {
    const lifetimeInSeconds = expiration ?? this.defaultExpiration;
    if (lifetimeInSeconds === null || lifetimeInSeconds === void 0) {
      return null;
    }
    return Date.now() + lifetimeInSeconds * 1e3;
  }
  /**
   * Checks whether the given expiration timestamp has passed.
   *
   * @param {number | null} expiration - The timestamp to check, or null for no expiration.
   * @return {boolean} True when the item has expired.
   */
  isExpired(expiration) {
    return expiration !== null && Date.now() > expiration;
  }
};
/**
 * One instance per backend. The original single-instance design could only ever describe
 * `localStorage`; keying by backend is what lets a local-scoped and a session-scoped store
 * exist side by side, which is the whole point of the driver.
 */
__publicField(_LocalStoreX, "instances", /* @__PURE__ */ new Map());
let LocalStoreX = _LocalStoreX;
const SessionStoreX = {
  /**
   * Returns the session-scoped store, creating it on first use.
   *
   * @param {ISessionStoreConfig} [config] - Optional configuration.
   * @return {LocalStoreX} The instance bound to `sessionStorage`.
   */
  getInstance(config) {
    return LocalStoreX.getInstance({ ...config, driver: "session" });
  }
};
export {
  LocalStoreX,
  MemoryStorageDriver,
  SessionStoreX,
  isIStorageItem,
  resolveStorageDriver
};
//# sourceMappingURL=localstorex.es.js.map
