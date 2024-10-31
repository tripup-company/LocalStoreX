export default interface IObjectVersionHelper {
    generateVersionHash(data: any, isDeep: boolean): string;
    compareVersion(version1: string, version2: string): boolean;
}
