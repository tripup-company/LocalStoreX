import md5 from 'md5';
import IObjectVersionHelper from "./type/IObjectVersionHelper";

export default class ObjectVersionHelper implements IObjectVersionHelper {
    /**
     * Indicates whether a certain operation should be performed in a deep or shallow manner.
     *
     * When set to `true`, the operation will be performed deeply, which typically means
     * that nested structures will also be traversed or processed.
     *
     * When set to `false`, the operation will be shallow, affecting only the top-level
     * elements.
     */
    private isDeep: boolean = false;

    /**
     * Sets the deep sorting flag.
     *
     * @param {boolean} isDeep - Indicates whether the sorting of the object should be deep.
     */
    setDeepTraversal(isDeep: boolean): void {
        this.isDeep = isDeep;
    }

    /**
     * Generates a version hash for the given data.
     *
     * @param {any} data - The data for which the version hash is to be created.
     * @return {string} A hash string representing the version of the data.
     */
    generateVersionHash(data: any): string {
        const sortedData = this.sortObject(data);
        return md5(JSON.stringify(sortedData)) as string;
    }

    /**
     * Recursively sorts the keys of an object or array.
     *
     * @param {any} obj - The object or array to be sorted.
     * @return {any} - The sorted object or array.
     */
    private sortObject(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObject(item));
        } else if (typeof obj === 'object' && obj !== null) {
            const sortedObj: any = {};
            Object.keys(obj).sort().forEach((key: string) => {
                sortedObj[key] = this.isDeep ? this.sortObject(obj[key]) : obj[key];
            });
            return sortedObj;
        }
        return obj;
    }
}
