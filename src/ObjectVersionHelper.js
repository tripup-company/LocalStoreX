import md5 from 'md5';
export default class ObjectVersionHelper {
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
            return obj.map(item => this.getSortedKeys(item, isDeep)).reduce((acc, val) => {
                if (typeof val === 'object' && !Array.isArray(val)) {
                    for (const key in val) {
                        acc[key] = acc[key] ? [...acc[key], ...val[key]] : val[key];
                    }
                }
                return acc;
            }, []);
        }
        else if (typeof obj === 'object' && obj !== null) {
            const result = {};
            const keys = Object.keys(obj).sort();
            keys.forEach((key) => {
                const value = obj[key];
                if (isDeep && typeof value === 'object' && value !== null) {
                    result[key] = this.getSortedKeys(value, isDeep);
                }
                else {
                    result[key] = [];
                }
            });
            return result;
        }
        return [];
    }
}
