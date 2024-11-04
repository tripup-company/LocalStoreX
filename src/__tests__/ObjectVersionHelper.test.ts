import ObjectVersionHelper from '../ObjectVersionHelper';

describe('ObjectVersionHelper', () => {
    let versionHelper: ObjectVersionHelper;

    beforeEach(() => {
        versionHelper = new ObjectVersionHelper();
    });

    it('should generate consistent version hash for simple object', () => {
        const data = { b: 2, a: 1 };
        const hash1 = versionHelper.generateVersionHash(data);
        const hash2 = versionHelper.generateVersionHash(data);

        expect(hash1).toBe(hash2);
    });

    it('should generate different version hashes for different objects', () => {
        const data1 = { a: 1, b: 2 };
        const data2 = { a: 2, z: 1 };
        const hash1 = versionHelper.generateVersionHash(data1);
        const hash2 = versionHelper.generateVersionHash(data2);

        expect(hash1).not.toBe(hash2);
    });

    it('should handle deep structures when deep traversal is set', () => {
        const data = { a: { b: 2, c: 1 } };
        versionHelper.setDeepTraversal(true);

        const hash1 = versionHelper.generateVersionHash(data);
        const hash2 = versionHelper.generateVersionHash(data);

        expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for deep and shallow settings', () => {
        const data = { a: { c: 2, b: 1 } };

        versionHelper.setDeepTraversal(false);
        const shallowHash = versionHelper.generateVersionHash(data);

        versionHelper.setDeepTraversal(true);
        const deepHash = versionHelper.generateVersionHash(data);

        expect(shallowHash).not.toBe(deepHash);
    });

    it('should return empty array for non-object types', () => {
        const nonObjectValues = [
            null,
            undefined,
            42,
            "string",
            true,
            Symbol("symbol"),
        ];

        for (const value of nonObjectValues) {
            const sortedKeys = versionHelper["getSortedKeys"](value);
            expect(sortedKeys).toEqual([]);
        }
    });
});
