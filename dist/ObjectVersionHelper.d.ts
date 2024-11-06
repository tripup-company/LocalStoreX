export default class ObjectVersionHelper {
    /**
     * Generates a version hash for the given data.
     *
     * @param {any} data - The data for which the version hash needs to be generated.
     * @param {boolean} [isDeep=false] - Flag indicating whether to sort keys deeply or not.
     * @return {string} The generated version hash.
     */
    static generateVersionHash(data: any, isDeep?: boolean): string;
    /**
     * Returns a sorted mapping of keys and their corresponding sub-keys for a given object or array.
     * If `isDeep` is true, the method recursively sorts the keys of nested objects.
     *
     * @param {any} obj - The input object or array whose keys need to be sorted.
     * @param {boolean} [isDeep=false] - Optional flag to indicate if the sorting should be performed recursively.
     * @return {any} A new object or array with sorted keys and their corresponding (sub-)keys.
     */
    private static getSortedKeys;
}
