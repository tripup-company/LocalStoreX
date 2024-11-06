import LocalStoreX from '../LocalStoreX';
import md5 from 'md5';

describe('LocalStoreX', () => {
    // Store the original instance to be reset back after tests
    let originalInstance: LocalStoreX | undefined;

    beforeAll(() => {
        // We store the original instance before modifying it in tests
        originalInstance = (LocalStoreX as any).instance;
    });

    afterEach(() => {
        // Restore the original instance after each test
        (LocalStoreX as any).instance = originalInstance;
        localStorage.clear();
    });

    test('should be a singleton instance', () => {
        const instance1 = LocalStoreX.getInstance();
        const instance2 = LocalStoreX.getInstance();
        expect(instance1).toBe(instance2);
    });

    test('should set and get an item with version', () => {
        const key = 'testKey';
        const data = { foo: 'bar' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, 30, '1');
        const retrievedData = instance.getItem(key, '1');
        expect(retrievedData).toEqual(data);
    });

    test('should remove an item', () => {
        const key = 'testKey';
        const data = { foo: 'bar' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data);
        instance.removeItem(key);
        const retrievedData = instance.getItem(key);
        expect(retrievedData).toBeNull();
    });

    test('should clear all items', () => {
        const key1 = 'testKey1';
        const key2 = 'testKey2';
        const data1 = { foo: 'bar1' };
        const data2 = { foo: 'bar2' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key1, data1);
        instance.setItem(key2, data2);
        instance.clear();
        const retrievedData1 = instance.getItem(key1);
        const retrievedData2 = instance.getItem(key2);
        expect(retrievedData1).toBeNull();
        expect(retrievedData2).toBeNull();
    });

    test('should remove specific version of an item', () => {
        const key = 'testKey';
        const data1 = { foo: 'bar' };
        const data2 = { foo: 'baz' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data1, undefined, 'v1');
        instance.setItem(key, data2, undefined, 'v2');
        instance.removeVersionItem(key, 'v1');
        const retrievedData1 = instance.getItem(key, 'v1');
        const retrievedData2 = instance.getItem(key, 'v2');
        expect(retrievedData1).toBeNull();
        expect(retrievedData2).toEqual(data2);
    });

    test('should handle invalid JSON in localStorage', () => {
        const key = 'testKey';
        localStorage.setItem(key, 'invalidJSON');
        const instance = LocalStoreX.getInstance();
        const retrievedData = instance.getItem(key);
        expect(retrievedData).toBeNull();
    });

    test('should set and get an item using version hash', () => {
        const key = 'testKey';
        const data = { foo: 'bar', test: 'bar2' };
        const defaultVersion = md5(JSON.stringify({ foo: 'bar', test: 'bar2' })) as string;

        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, undefined, defaultVersion);
        const retrievedData = instance.getItem(key, defaultVersion);
        expect(retrievedData).toEqual(data);
    });
});
