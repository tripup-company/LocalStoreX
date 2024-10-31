export default interface IObjectVersionHelper {
    /**
     * Generates a version hash for the given data.
     *
     * @param {any} data - The input data for which to generate the version hash.
     * @return {string} A version hash string for the provided data.
     */
    generateVersionHash(data: any): string;
}
