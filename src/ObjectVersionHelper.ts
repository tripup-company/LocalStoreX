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
        const sortedData = this.getSortedKeys(data);
        return md5(JSON.stringify(sortedData)) as string;
    }

    /**
     * Recursively sorts the keys of an object or array.
     *
     * @param {any} obj - The object or array to be sorted.
     * @return {any} - The sorted object or array.
     */
    private getSortedKeys(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.getSortedKeys(item)).reduce((acc, val) => {
                if (typeof val === 'object' && !Array.isArray(val)) {
                    for (const key in val) {
                        acc[key] = acc[key] ? [...acc[key], ...val[key]] : val[key];
                    }
                }
                return acc;
            }, []);
        } else if (typeof obj === 'object' && obj !== null) {
            const result: any = {};
            const keys = Object.keys(obj).sort();

            keys.forEach((key: string) => {
                const value = obj[key];

                if (this.isDeep && typeof value === 'object' && value !== null) {
                    result[key] = this.getSortedKeys(value);
                } else {
                    result[key] = [];
                }
            });

            return result;
        }
        return [];
    }
}
