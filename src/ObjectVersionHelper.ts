import md5 from 'md5';
import IObjectVersionHelper from "./IObjectVersionHelper";

export default class ObjectVersionHelper implements IObjectVersionHelper {

    generateVersionHash(data: any, isDeep: boolean = false): string {
        const sortedData = this.sortObject(data, isDeep);
        return md5(JSON.stringify(sortedData)) as string;
    }

    private sortObject(obj: any, isDeep: boolean): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObject(item, isDeep));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.keys(obj).sort().reduce((sortedObj: any, key: string) => {
                sortedObj[key] = isDeep ? this.sortObject(obj[key], isDeep) : obj[key];
                return sortedObj;
            }, {});
        }
        return obj;
    }

    compareVersion(version1: string, version2: string): boolean {
        return version1 === version2;
    }
}
