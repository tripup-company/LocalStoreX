import ObjectVersionHelper from '../ObjectVersionHelper';
describe('ObjectVersionHelper', () => {
    it('should generate consistent version hash for simple object', () => {
        const data = { b: 2, a: 1 };
        const hash1 = ObjectVersionHelper.generateVersionHash(data);
        const hash2 = ObjectVersionHelper.generateVersionHash(data);
        expect(hash1).toBe(hash2);
    });
    it('should generate consistent version hash for different objects with same key structure', () => {
        const data1 = { b: 2, a: 1 };
        const data2 = { b: 3, a: 14 };
        const hash1 = ObjectVersionHelper.generateVersionHash(data1);
        const hash2 = ObjectVersionHelper.generateVersionHash(data2);
        expect(hash1).toBe(hash2);
    });
    it('should generate different version hashes for different objects', () => {
        const data1 = { a: 1, b: 2 };
        const data2 = { a: 2, z: 1 };
        const hash1 = ObjectVersionHelper.generateVersionHash(data1);
        const hash2 = ObjectVersionHelper.generateVersionHash(data2);
        expect(hash1).not.toBe(hash2);
    });
    it('should handle deep structures when deep traversal is set', () => {
        const data = { a: { b: 2, c: 1 } };
        const hash1 = ObjectVersionHelper.generateVersionHash(data, true);
        const hash2 = ObjectVersionHelper.generateVersionHash(data, true);
        expect(hash1).toBe(hash2);
    });
    it('should generate different hashes for deep and shallow settings', () => {
        const data = { a: { c: 2, b: 1 } };
        const shallowHash = ObjectVersionHelper.generateVersionHash(data, false);
        const deepHash = ObjectVersionHelper.generateVersionHash(data, true);
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
            const sortedKeys = ObjectVersionHelper["getSortedKeys"](value);
            expect(sortedKeys).toEqual([]);
        }
    });
});
