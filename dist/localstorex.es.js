var D = Object.defineProperty;
var N = (f, u, e) => u in f ? D(f, u, { enumerable: !0, configurable: !0, writable: !0, value: e }) : f[u] = e;
var S = (f, u, e) => N(f, typeof u != "symbol" ? u + "" : u, e);
function C(f) {
  return f && f.__esModule && Object.prototype.hasOwnProperty.call(f, "default") ? f.default : f;
}
var B = { exports: {} }, O = { exports: {} };
(function() {
  var f = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", u = {
    // Bit-wise rotation left
    rotl: function(e, a) {
      return e << a | e >>> 32 - a;
    },
    // Bit-wise rotation right
    rotr: function(e, a) {
      return e << 32 - a | e >>> a;
    },
    // Swap big-endian to little-endian and vice versa
    endian: function(e) {
      if (e.constructor == Number)
        return u.rotl(e, 8) & 16711935 | u.rotl(e, 24) & 4278255360;
      for (var a = 0; a < e.length; a++)
        e[a] = u.endian(e[a]);
      return e;
    },
    // Generate an array of any length of random bytes
    randomBytes: function(e) {
      for (var a = []; e > 0; e--)
        a.push(Math.floor(Math.random() * 256));
      return a;
    },
    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(e) {
      for (var a = [], c = 0, l = 0; c < e.length; c++, l += 8)
        a[l >>> 5] |= e[c] << 24 - l % 32;
      return a;
    },
    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(e) {
      for (var a = [], c = 0; c < e.length * 32; c += 8)
        a.push(e[c >>> 5] >>> 24 - c % 32 & 255);
      return a;
    },
    // Convert a byte array to a hex string
    bytesToHex: function(e) {
      for (var a = [], c = 0; c < e.length; c++)
        a.push((e[c] >>> 4).toString(16)), a.push((e[c] & 15).toString(16));
      return a.join("");
    },
    // Convert a hex string to a byte array
    hexToBytes: function(e) {
      for (var a = [], c = 0; c < e.length; c += 2)
        a.push(parseInt(e.substr(c, 2), 16));
      return a;
    },
    // Convert a byte array to a base-64 string
    bytesToBase64: function(e) {
      for (var a = [], c = 0; c < e.length; c += 3)
        for (var l = e[c] << 16 | e[c + 1] << 8 | e[c + 2], h = 0; h < 4; h++)
          c * 8 + h * 6 <= e.length * 8 ? a.push(f.charAt(l >>> 6 * (3 - h) & 63)) : a.push("=");
      return a.join("");
    },
    // Convert a base-64 string to a byte array
    base64ToBytes: function(e) {
      e = e.replace(/[^A-Z0-9+\/]/ig, "");
      for (var a = [], c = 0, l = 0; c < e.length; l = ++c % 4)
        l != 0 && a.push((f.indexOf(e.charAt(c - 1)) & Math.pow(2, -2 * l + 8) - 1) << l * 2 | f.indexOf(e.charAt(c)) >>> 6 - l * 2);
      return a;
    }
  };
  O.exports = u;
})();
var _ = O.exports, x = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(f) {
      return x.bin.stringToBytes(unescape(encodeURIComponent(f)));
    },
    // Convert a byte array to a string
    bytesToString: function(f) {
      return decodeURIComponent(escape(x.bin.bytesToString(f)));
    }
  },
  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(f) {
      for (var u = [], e = 0; e < f.length; e++)
        u.push(f.charCodeAt(e) & 255);
      return u;
    },
    // Convert a byte array to a string
    bytesToString: function(f) {
      for (var u = [], e = 0; e < f.length; e++)
        u.push(String.fromCharCode(f[e]));
      return u.join("");
    }
  }
}, m = x;
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var J = function(f) {
  return f != null && (T(f) || M(f) || !!f._isBuffer);
};
function T(f) {
  return !!f.constructor && typeof f.constructor.isBuffer == "function" && f.constructor.isBuffer(f);
}
function M(f) {
  return typeof f.readFloatLE == "function" && typeof f.slice == "function" && T(f.slice(0, 0));
}
(function() {
  var f = _, u = m.utf8, e = J, a = m.bin, c = function(l, h) {
    l.constructor == String ? h && h.encoding === "binary" ? l = a.stringToBytes(l) : l = u.stringToBytes(l) : e(l) ? l = Array.prototype.slice.call(l, 0) : !Array.isArray(l) && l.constructor !== Uint8Array && (l = l.toString());
    for (var i = f.bytesToWords(l), y = l.length * 8, n = 1732584193, t = -271733879, o = -1732584194, r = 271733878, s = 0; s < i.length; s++)
      i[s] = (i[s] << 8 | i[s] >>> 24) & 16711935 | (i[s] << 24 | i[s] >>> 8) & 4278255360;
    i[y >>> 5] |= 128 << y % 32, i[(y + 64 >>> 9 << 4) + 14] = y;
    for (var g = c._ff, p = c._gg, v = c._hh, d = c._ii, s = 0; s < i.length; s += 16) {
      var E = n, w = t, A = o, H = r;
      n = g(n, t, o, r, i[s + 0], 7, -680876936), r = g(r, n, t, o, i[s + 1], 12, -389564586), o = g(o, r, n, t, i[s + 2], 17, 606105819), t = g(t, o, r, n, i[s + 3], 22, -1044525330), n = g(n, t, o, r, i[s + 4], 7, -176418897), r = g(r, n, t, o, i[s + 5], 12, 1200080426), o = g(o, r, n, t, i[s + 6], 17, -1473231341), t = g(t, o, r, n, i[s + 7], 22, -45705983), n = g(n, t, o, r, i[s + 8], 7, 1770035416), r = g(r, n, t, o, i[s + 9], 12, -1958414417), o = g(o, r, n, t, i[s + 10], 17, -42063), t = g(t, o, r, n, i[s + 11], 22, -1990404162), n = g(n, t, o, r, i[s + 12], 7, 1804603682), r = g(r, n, t, o, i[s + 13], 12, -40341101), o = g(o, r, n, t, i[s + 14], 17, -1502002290), t = g(t, o, r, n, i[s + 15], 22, 1236535329), n = p(n, t, o, r, i[s + 1], 5, -165796510), r = p(r, n, t, o, i[s + 6], 9, -1069501632), o = p(o, r, n, t, i[s + 11], 14, 643717713), t = p(t, o, r, n, i[s + 0], 20, -373897302), n = p(n, t, o, r, i[s + 5], 5, -701558691), r = p(r, n, t, o, i[s + 10], 9, 38016083), o = p(o, r, n, t, i[s + 15], 14, -660478335), t = p(t, o, r, n, i[s + 4], 20, -405537848), n = p(n, t, o, r, i[s + 9], 5, 568446438), r = p(r, n, t, o, i[s + 14], 9, -1019803690), o = p(o, r, n, t, i[s + 3], 14, -187363961), t = p(t, o, r, n, i[s + 8], 20, 1163531501), n = p(n, t, o, r, i[s + 13], 5, -1444681467), r = p(r, n, t, o, i[s + 2], 9, -51403784), o = p(o, r, n, t, i[s + 7], 14, 1735328473), t = p(t, o, r, n, i[s + 12], 20, -1926607734), n = v(n, t, o, r, i[s + 5], 4, -378558), r = v(r, n, t, o, i[s + 8], 11, -2022574463), o = v(o, r, n, t, i[s + 11], 16, 1839030562), t = v(t, o, r, n, i[s + 14], 23, -35309556), n = v(n, t, o, r, i[s + 1], 4, -1530992060), r = v(r, n, t, o, i[s + 4], 11, 1272893353), o = v(o, r, n, t, i[s + 7], 16, -155497632), t = v(t, o, r, n, i[s + 10], 23, -1094730640), n = v(n, t, o, r, i[s + 13], 4, 681279174), r = v(r, n, t, o, i[s + 0], 11, -358537222), o = v(o, r, n, t, i[s + 3], 16, -722521979), t = v(t, o, r, n, i[s + 6], 23, 76029189), n = v(n, t, o, r, i[s + 9], 4, -640364487), r = v(r, n, t, o, i[s + 12], 11, -421815835), o = v(o, r, n, t, i[s + 15], 16, 530742520), t = v(t, o, r, n, i[s + 2], 23, -995338651), n = d(n, t, o, r, i[s + 0], 6, -198630844), r = d(r, n, t, o, i[s + 7], 10, 1126891415), o = d(o, r, n, t, i[s + 14], 15, -1416354905), t = d(t, o, r, n, i[s + 5], 21, -57434055), n = d(n, t, o, r, i[s + 12], 6, 1700485571), r = d(r, n, t, o, i[s + 3], 10, -1894986606), o = d(o, r, n, t, i[s + 10], 15, -1051523), t = d(t, o, r, n, i[s + 1], 21, -2054922799), n = d(n, t, o, r, i[s + 8], 6, 1873313359), r = d(r, n, t, o, i[s + 15], 10, -30611744), o = d(o, r, n, t, i[s + 6], 15, -1560198380), t = d(t, o, r, n, i[s + 13], 21, 1309151649), n = d(n, t, o, r, i[s + 4], 6, -145523070), r = d(r, n, t, o, i[s + 11], 10, -1120210379), o = d(o, r, n, t, i[s + 2], 15, 718787259), t = d(t, o, r, n, i[s + 9], 21, -343485551), n = n + E >>> 0, t = t + w >>> 0, o = o + A >>> 0, r = r + H >>> 0;
    }
    return f.endian([n, t, o, r]);
  };
  c._ff = function(l, h, i, y, n, t, o) {
    var r = l + (h & i | ~h & y) + (n >>> 0) + o;
    return (r << t | r >>> 32 - t) + h;
  }, c._gg = function(l, h, i, y, n, t, o) {
    var r = l + (h & y | i & ~y) + (n >>> 0) + o;
    return (r << t | r >>> 32 - t) + h;
  }, c._hh = function(l, h, i, y, n, t, o) {
    var r = l + (h ^ i ^ y) + (n >>> 0) + o;
    return (r << t | r >>> 32 - t) + h;
  }, c._ii = function(l, h, i, y, n, t, o) {
    var r = l + (i ^ (h | ~y)) + (n >>> 0) + o;
    return (r << t | r >>> 32 - t) + h;
  }, c._blocksize = 16, c._digestsize = 16, B.exports = function(l, h) {
    if (l == null)
      throw new Error("Illegal argument " + l);
    var i = f.wordsToBytes(c(l, h));
    return h && h.asBytes ? i : h && h.asString ? a.bytesToString(i) : f.bytesToHex(i);
  };
})();
var U = B.exports;
const $ = /* @__PURE__ */ C(U);
class F {
  constructor() {
    /**
     * Indicates whether a certain operation should be performed in a deep or shallow manner.
     *
     * When set to `true`, the operation will be performed deeply, which typically means
     * that nested structures will also be traversed or processed.
     *
     * When set to `false`, the operation will be shallow, affecting only the top-level
     * elements.
     */
    S(this, "isDeep", !1);
  }
  /**
   * Sets the deep sorting flag.
   *
   * @param {boolean} isDeep - Indicates whether the sorting of the object should be deep.
   */
  setDeepTraversal(u) {
    this.isDeep = u;
  }
  /**
   * Generates a version hash for the given data.
   *
   * @param {any} data - The data for which the version hash is to be created.
   * @return {string} A hash string representing the version of the data.
   */
  generateVersionHash(u) {
    const e = this.sortObject(u);
    return $(JSON.stringify(e));
  }
  /**
   * Recursively sorts the keys of an object or array.
   *
   * @param {any} obj - The object or array to be sorted.
   * @return {any} - The sorted object or array.
   */
  sortObject(u) {
    if (Array.isArray(u))
      return u.map((e) => this.sortObject(e));
    if (typeof u == "object" && u !== null) {
      const e = {};
      return Object.keys(u).sort().forEach((a) => {
        e[a] = this.isDeep ? this.sortObject(u[a]) : u[a];
      }), e;
    }
    return u;
  }
}
const I = class I {
  /**
   * Constructor for initializing the object with a version helper and performing cleanup of expired items.
   *
   * @param {IObjectVersionHelper} objectVersionHelper - An instance used to manage versioning of objects.
   *
   * @return {void}
   */
  constructor(u = I.defaultVersionHelper) {
    this.objectVersionHelper = u, this.cleanupExpiredItems();
  }
  /**
   * Retrieves the singleton instance of the LocalStoreX class.
   * If no instance exists, a new one will be created.
   *
   * @return {LocalStoreX} The singleton instance of LocalStoreX.
   */
  static getInstance() {
    return I.instance || (I.instance = new I()), I.instance;
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
  setItem(u, e, a, c) {
    const l = this.getVersion(e, c), h = this.getExistingItem(u) ?? this.createNewItem(l, a);
    this.updateOrAddValue(h, l, e), this.updateCurrentVersion(h, l, a), localStorage.setItem(u, JSON.stringify(h));
  }
  /**
   * Retrieves an item from storage by its key and optional version.
   *
   * @param {string} key - The key of the item to retrieve.
   * @param {string | IObjectVersionHelper} [providedVersion] - Optional version or version helper to retrieve a specific version of the item.
   * @return {*} The data stored under the given key and version, or null if the item does not exist or is expired.
   */
  getItem(u, e) {
    const a = this.getExistingItem(u);
    if (!a || this.isExpired(a.expiration))
      return localStorage.removeItem(u), null;
    const c = this.getVersion(a.values, e), l = this.findStoredValue(a.values, c);
    return l ? l.data : null;
  }
  /**
   * Removes an item from the local storage based on the specified key.
   *
   * @param {string} key - The key of the item to be removed from local storage.
   * @return {void} No return value.
   */
  removeItem(u) {
    localStorage.removeItem(u);
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
  removeVersionItem(u, e) {
    const a = this.getExistingItem(u);
    a && (a.values = a.values.filter((c) => c.version !== e), a.values.length === 0 ? this.removeItem(u) : (a.currentVersion = a.values[a.values.length - 1].version, localStorage.setItem(u, JSON.stringify(a))));
  }
  /**
   * Retrieves an existing item from local storage.
   *
   * @param {string} key - The key under which the item is stored.
   * @return {IStorageItem | null} The parsed item if found, otherwise null.
   */
  getExistingItem(u) {
    const e = localStorage.getItem(u);
    return e ? JSON.parse(e) : null;
  }
  /**
   * Creates a new storage item with the specified version and optional expiration time.
   *
   * @param {string} version - The current version of the item.
   * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration date will be set.
   * @return {IStorageItem} The newly created storage item.
   */
  createNewItem(u, e) {
    return {
      currentVersion: u,
      expiration: e ? Date.now() + e * 36e5 : null,
      values: []
    };
  }
  /**
   * Updates an existing value or adds a new value to the storage item.
   *
   * @param {IStorageItem} item - The storage item containing values.
   * @param {string} version - The version identifier for the value.
   * @param {any} data - The data to be associated with the specified version.
   * @return {void}
   */
  updateOrAddValue(u, e, a) {
    const c = u.values.find((l) => l.version === e);
    c ? c.data = a : u.values.push({ version: e, data: a });
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
  updateCurrentVersion(u, e, a) {
    u.currentVersion = e, u.expiration = a ? Date.now() + a * 36e5 : u.expiration;
  }
  /**
   * Retrieves the version string based on the provided value and optional version information.
   *
   * @param {any} value - The value to generate or retrieve the version for.
   * @param {string | IObjectVersionHelper} [providedVersion] - Optional version information provided either as a string or an instance of IObjectVersionHelper.
   * @return {string} The generated or provided version string.
   */
  getVersion(u, e) {
    return typeof e == "string" ? e : e instanceof F ? e.generateVersionHash(u) : this.objectVersionHelper.generateVersionHash(u);
  }
  /**
   * Checks whether the given expiration timestamp has passed.
   *
   * @param {number | null} expiration - The timestamp to check for expiration, or null to indicate no expiration.
   * @return {boolean} Returns true if the current time is greater than the expiration time, false otherwise.
   */
  isExpired(u) {
    return u !== null && Date.now() > u;
  }
  /**
   * Cleans up expired items from localStorage. The method iterates over all keys in localStorage,
   * retrieves the associated item, and removes it if it has expired or if it contains invalid JSON.
   *
   * @return void
   */
  cleanupExpiredItems() {
    for (let u = 0; u < localStorage.length; u++) {
      const e = localStorage.key(u);
      if (e) {
        const a = localStorage.getItem(e);
        if (a)
          try {
            const c = JSON.parse(a);
            this.isExpired(c.expiration) && localStorage.removeItem(e);
          } catch {
            console.warn(`Invalid JSON data for key "${e}": ${a}`), localStorage.removeItem(e);
          }
      }
    }
  }
  /**
   * Finds and returns the stored value that matches the specified version.
   *
   * @param {StoredValue[]} values - An array of stored values to search.
   * @param {string} version - The target version to find in the stored values.
   * @return {StoredValue | undefined} The stored value matching the specified version, or undefined if no match is found.
   */
  findStoredValue(u, e) {
    return u.find((a) => a.version === e);
  }
};
/**
 * LocalStoreX is an instance of a class designed to handle local storage operations.
 * It provides methods for storing, retrieving, and managing data in the browser's local storage.
 *
 * Common use cases include saving user preferences, caching data for offline use,
 * and persisting application state between sessions.
 */
S(I, "instance"), /**
 * A default instance of ObjectVersionHelper which implements the IObjectVersionHelper interface.
 * This instance is commonly used to manage versioning of objects where version control is required.
 * It provides necessary methods to handle version-related operations seamlessly.
 */
S(I, "defaultVersionHelper", new F());
let V = I;
export {
  V as LocalStoreX,
  F as ObjectVersionHelper
};
