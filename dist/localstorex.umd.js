(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.LocalStoreX = {}));
})(this, function(exports2) {
  "use strict";
  function isIStorageItem(obj) {
    return obj && typeof obj === "object" && typeof obj.currentVersion === "string" && (typeof obj.expiration === "number" || obj.expiration === null) && typeof obj.values === "object";
  }
  class LocalStoreX {
    /**
     * Constructor for initializing the object with a version helper and an optional default expiration time.
     * Also performs cleanup of expired items.
     *
     * @param {string} defaultVersion - An instance used to manage versioning of objects.
     * @param {number} [defaultExpiration=null] - The default expiration time for items in hours.
     *
     * @return {void}
     */
    constructor(defaultVersion = "v1", defaultExpiration = null) {
      Object.defineProperty(this, "defaultVersion", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: defaultVersion
      });
      Object.defineProperty(this, "defaultExpiration", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: defaultExpiration
      });
    }
    /**
     * Returns a singleton instance of the LocalStoreX class.
     * If one does not already exist, it creates one with the provided configuration.
     *
     * @param {Object} [config] - Optional configuration object.
     * @param {string} [config.defaultVersion='v1'] - Specifies the default version for the instance.
     * @param {null} [config.defaultExpiration=null] - Specifies the default expiration for the instance.
     * @return {LocalStoreX} The singleton instance of the LocalStoreX class.
     */
    static getInstance(config) {
      if (!LocalStoreX.instance) {
        const expiration = (config == null ? void 0 : config.defaultExpiration) ?? null;
        const version = (config == null ? void 0 : config.defaultVersion) ?? "v1";
        LocalStoreX.instance = new LocalStoreX(version, expiration);
      }
      return LocalStoreX.instance;
    }
    /**
     * Stores an item in the local storage with the specified key, data, and optional version and expiration.
     *
     * @param {string} key - The key under which the data will be stored.
     * @param {any} data - The data to be stored.
     * @param {number} [expiration] - Optional expiration time for the data in milliseconds.
     * @param {string | number} [providedVersion] - Optional version information for the data.* @return {void}
     */
    setItem(key, data, expiration, providedVersion) {
      const item = this.getExistingItem(key) ?? this.createNewItem(expiration, providedVersion);
      this.updateOrAddValue(item, data, expiration, providedVersion);
      localStorage.setItem(key, JSON.stringify(item));
    }
    /**
     * Retrieves an item from storage by its key and optional version.
     *
     * @param {string} key - The key of the item to retrieve.
     * @param {string} [version] - Optional version to retrieve a specific version of the item.
     * @return {*} The data stored under the given key and version, or null if the item does not exist or is expired.
     */
    getItem(key, version) {
      const item = this.getExistingItem(key);
      if (!item || this.isExpired(item.expiration)) {
        localStorage.removeItem(key);
        return null;
      }
      const currentValue = item.values[version ?? this.defaultVersion];
      return currentValue ? currentValue : null;
    }
    /**
     * Removes an item from the local storage based on the specified key.
     *
     * @param {string} key - The key of the item to be removed from local storage.
     * @return {void} No return value.
     */
    removeItem(key) {
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
    removeVersionItem(key, version) {
      const item = this.getExistingItem(key);
      if (!item)
        return;
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
    getExistingItem(key) {
      try {
        const item = localStorage.getItem(key);
        if (!item)
          return null;
        const parsedItem = JSON.parse(item);
        return isIStorageItem(parsedItem) ? parsedItem : null;
      } catch (error) {
        console.warn(`Error parsing JSON for key "${key}":`, error);
        return null;
      }
    }
    /**
     * Creates a new storage item with the given version and optional expiration time.
     *
     * @param {number} [expiration] - Optional expiration time in hours. If provided, the expiration
     * @param {string} [version] - The version of the new storage item.
     *                                is set to the current time plus the specified hours.
     * @return {IStorageItem} The newly created storage item.
     */
    createNewItem(expiration, version) {
      return {
        currentVersion: version ?? this.defaultVersion,
        expiration: expiration ? Date.now() + expiration * 36e5 : this.defaultExpiration,
        values: {}
      };
    }
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
    updateOrAddValue(item, data, expiration, version) {
      item.currentVersion = version ?? item.currentVersion;
      item.expiration = expiration ? Date.now() + expiration * 36e5 : item.expiration;
      item.values[version ?? item.currentVersion] = data;
    }
    /**
     * Checks whether the given expiration timestamp has passed.
     *
     * @param {number | null} expiration - The timestamp to check for expiration, or null to indicate no expiration.
     * @return {boolean} Returns true if the current time is greater than the expiration time, false otherwise.
     */
    isExpired(expiration) {
      return expiration !== null && Date.now() > expiration;
    }
  }
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var md5$1 = { exports: {} };
  var crypt = { exports: {} };
  (function() {
    var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", crypt$1 = {
      // Bit-wise rotation left
      rotl: function(n, b) {
        return n << b | n >>> 32 - b;
      },
      // Bit-wise rotation right
      rotr: function(n, b) {
        return n << 32 - b | n >>> b;
      },
      // Swap big-endian to little-endian and vice versa
      endian: function(n) {
        if (n.constructor == Number) {
          return crypt$1.rotl(n, 8) & 16711935 | crypt$1.rotl(n, 24) & 4278255360;
        }
        for (var i = 0; i < n.length; i++)
          n[i] = crypt$1.endian(n[i]);
        return n;
      },
      // Generate an array of any length of random bytes
      randomBytes: function(n) {
        for (var bytes = []; n > 0; n--)
          bytes.push(Math.floor(Math.random() * 256));
        return bytes;
      },
      // Convert a byte array to big-endian 32-bit words
      bytesToWords: function(bytes) {
        for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
          words[b >>> 5] |= bytes[i] << 24 - b % 32;
        return words;
      },
      // Convert big-endian 32-bit words to a byte array
      wordsToBytes: function(words) {
        for (var bytes = [], b = 0; b < words.length * 32; b += 8)
          bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255);
        return bytes;
      },
      // Convert a byte array to a hex string
      bytesToHex: function(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 15).toString(16));
        }
        return hex.join("");
      },
      // Convert a hex string to a byte array
      hexToBytes: function(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      },
      // Convert a byte array to a base-64 string
      bytesToBase64: function(bytes) {
        for (var base64 = [], i = 0; i < bytes.length; i += 3) {
          var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
          for (var j = 0; j < 4; j++)
            if (i * 8 + j * 6 <= bytes.length * 8)
              base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 63));
            else
              base64.push("=");
        }
        return base64.join("");
      },
      // Convert a base-64 string to a byte array
      base64ToBytes: function(base64) {
        base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");
        for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
          if (imod4 == 0) continue;
          bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
        }
        return bytes;
      }
    };
    crypt.exports = crypt$1;
  })();
  var cryptExports = crypt.exports;
  var charenc = {
    // UTF-8 encoding
    utf8: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
      },
      // Convert a byte array to a string
      bytesToString: function(bytes) {
        return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
      }
    },
    // Binary encoding
    bin: {
      // Convert a string to a byte array
      stringToBytes: function(str) {
        for (var bytes = [], i = 0; i < str.length; i++)
          bytes.push(str.charCodeAt(i) & 255);
        return bytes;
      },
      // Convert a byte array to a string
      bytesToString: function(bytes) {
        for (var str = [], i = 0; i < bytes.length; i++)
          str.push(String.fromCharCode(bytes[i]));
        return str.join("");
      }
    }
  };
  var charenc_1 = charenc;
  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */
  var isBuffer_1 = function(obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
  };
  function isBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
  }
  (function() {
    var crypt2 = cryptExports, utf8 = charenc_1.utf8, isBuffer2 = isBuffer_1, bin = charenc_1.bin, md52 = function(message, options) {
      if (message.constructor == String)
        if (options && options.encoding === "binary")
          message = bin.stringToBytes(message);
        else
          message = utf8.stringToBytes(message);
      else if (isBuffer2(message))
        message = Array.prototype.slice.call(message, 0);
      else if (!Array.isArray(message) && message.constructor !== Uint8Array)
        message = message.toString();
      var m = crypt2.bytesToWords(message), l = message.length * 8, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (var i = 0; i < m.length; i++) {
        m[i] = (m[i] << 8 | m[i] >>> 24) & 16711935 | (m[i] << 24 | m[i] >>> 8) & 4278255360;
      }
      m[l >>> 5] |= 128 << l % 32;
      m[(l + 64 >>> 9 << 4) + 14] = l;
      var FF = md52._ff, GG = md52._gg, HH = md52._hh, II = md52._ii;
      for (var i = 0; i < m.length; i += 16) {
        var aa = a, bb = b, cc = c, dd = d;
        a = FF(a, b, c, d, m[i + 0], 7, -680876936);
        d = FF(d, a, b, c, m[i + 1], 12, -389564586);
        c = FF(c, d, a, b, m[i + 2], 17, 606105819);
        b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
        a = FF(a, b, c, d, m[i + 4], 7, -176418897);
        d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
        c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
        b = FF(b, c, d, a, m[i + 7], 22, -45705983);
        a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
        d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
        c = FF(c, d, a, b, m[i + 10], 17, -42063);
        b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
        a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
        d = FF(d, a, b, c, m[i + 13], 12, -40341101);
        c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
        b = FF(b, c, d, a, m[i + 15], 22, 1236535329);
        a = GG(a, b, c, d, m[i + 1], 5, -165796510);
        d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
        c = GG(c, d, a, b, m[i + 11], 14, 643717713);
        b = GG(b, c, d, a, m[i + 0], 20, -373897302);
        a = GG(a, b, c, d, m[i + 5], 5, -701558691);
        d = GG(d, a, b, c, m[i + 10], 9, 38016083);
        c = GG(c, d, a, b, m[i + 15], 14, -660478335);
        b = GG(b, c, d, a, m[i + 4], 20, -405537848);
        a = GG(a, b, c, d, m[i + 9], 5, 568446438);
        d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
        c = GG(c, d, a, b, m[i + 3], 14, -187363961);
        b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
        a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
        d = GG(d, a, b, c, m[i + 2], 9, -51403784);
        c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
        b = GG(b, c, d, a, m[i + 12], 20, -1926607734);
        a = HH(a, b, c, d, m[i + 5], 4, -378558);
        d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
        c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
        b = HH(b, c, d, a, m[i + 14], 23, -35309556);
        a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
        d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
        c = HH(c, d, a, b, m[i + 7], 16, -155497632);
        b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
        a = HH(a, b, c, d, m[i + 13], 4, 681279174);
        d = HH(d, a, b, c, m[i + 0], 11, -358537222);
        c = HH(c, d, a, b, m[i + 3], 16, -722521979);
        b = HH(b, c, d, a, m[i + 6], 23, 76029189);
        a = HH(a, b, c, d, m[i + 9], 4, -640364487);
        d = HH(d, a, b, c, m[i + 12], 11, -421815835);
        c = HH(c, d, a, b, m[i + 15], 16, 530742520);
        b = HH(b, c, d, a, m[i + 2], 23, -995338651);
        a = II(a, b, c, d, m[i + 0], 6, -198630844);
        d = II(d, a, b, c, m[i + 7], 10, 1126891415);
        c = II(c, d, a, b, m[i + 14], 15, -1416354905);
        b = II(b, c, d, a, m[i + 5], 21, -57434055);
        a = II(a, b, c, d, m[i + 12], 6, 1700485571);
        d = II(d, a, b, c, m[i + 3], 10, -1894986606);
        c = II(c, d, a, b, m[i + 10], 15, -1051523);
        b = II(b, c, d, a, m[i + 1], 21, -2054922799);
        a = II(a, b, c, d, m[i + 8], 6, 1873313359);
        d = II(d, a, b, c, m[i + 15], 10, -30611744);
        c = II(c, d, a, b, m[i + 6], 15, -1560198380);
        b = II(b, c, d, a, m[i + 13], 21, 1309151649);
        a = II(a, b, c, d, m[i + 4], 6, -145523070);
        d = II(d, a, b, c, m[i + 11], 10, -1120210379);
        c = II(c, d, a, b, m[i + 2], 15, 718787259);
        b = II(b, c, d, a, m[i + 9], 21, -343485551);
        a = a + aa >>> 0;
        b = b + bb >>> 0;
        c = c + cc >>> 0;
        d = d + dd >>> 0;
      }
      return crypt2.endian([a, b, c, d]);
    };
    md52._ff = function(a, b, c, d, x, s, t) {
      var n = a + (b & c | ~b & d) + (x >>> 0) + t;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._gg = function(a, b, c, d, x, s, t) {
      var n = a + (b & d | c & ~d) + (x >>> 0) + t;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._hh = function(a, b, c, d, x, s, t) {
      var n = a + (b ^ c ^ d) + (x >>> 0) + t;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._ii = function(a, b, c, d, x, s, t) {
      var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
      return (n << s | n >>> 32 - s) + b;
    };
    md52._blocksize = 16;
    md52._digestsize = 16;
    md5$1.exports = function(message, options) {
      if (message === void 0 || message === null)
        throw new Error("Illegal argument " + message);
      var digestbytes = crypt2.wordsToBytes(md52(message, options));
      return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt2.bytesToHex(digestbytes);
    };
  })();
  var md5Exports = md5$1.exports;
  const md5 = /* @__PURE__ */ getDefaultExportFromCjs(md5Exports);
  class ObjectVersionHelper {
    /**
     * Generates a version hash for the given data.
     *
     * @param {any} data - The data for which the version hash needs to be generated.
     * @param {boolean} [isDeep=false] - Flag indicating whether to sort keys deeply or not.
     * @return {string} The generated version hash.
     */
    static generateVersionHash(data, isDeep = false) {
      const sortedData = this.getSortedKeys(data, isDeep);
      return md5(JSON.stringify(sortedData));
    }
    /**
     * Returns a sorted mapping of keys and their corresponding sub-keys for a given object or array.
     * If `isDeep` is true, the method recursively sorts the keys of nested objects.
     *
     * @param {any} obj - The input object or array whose keys need to be sorted.
     * @param {boolean} [isDeep=false] - Optional flag to indicate if the sorting should be performed recursively.
     * @return {any} A new object or array with sorted keys and their corresponding (sub-)keys.
     */
    static getSortedKeys(obj, isDeep = false) {
      if (Array.isArray(obj)) {
        return obj.map((item) => this.getSortedKeys(item, isDeep)).reduce((acc, val) => {
          if (typeof val === "object" && !Array.isArray(val)) {
            for (const key in val) {
              acc[key] = acc[key] ? [...acc[key], ...val[key]] : val[key];
            }
          }
          return acc;
        }, []);
      } else if (typeof obj === "object" && obj !== null) {
        const result = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
          const value = obj[key];
          if (isDeep && typeof value === "object" && value !== null) {
            result[key] = this.getSortedKeys(value, isDeep);
          } else {
            result[key] = [];
          }
        });
        return result;
      }
      return [];
    }
  }
  exports2.LocalStoreX = LocalStoreX;
  exports2.ObjectVersionHelper = ObjectVersionHelper;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=localstorex.umd.js.map
