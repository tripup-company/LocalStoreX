import LocalStoreX from '../LocalStoreX';
import ObjectVersionHelper from '../ObjectVersionHelper';
import md5 from 'md5';

jest.mock('../ObjectVersionHelper');

describe('LocalStoreX', () => {
    // Store the original instance to be reset back after tests
    let originalInstance: LocalStoreX | undefined;

    beforeAll(() => {
        // we store the original instance before modifying it in tests
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
        const data1 = { foo: 'bar' };
        const data2 = { foo: 'baz' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data1, undefined, 'v1');
        instance.setItem(key, data2, undefined, 'v2');
        const retrievedData1 = instance.getItem(key, 'v1');
        const retrievedData2 = instance.getItem(key, 'v2');
        expect(retrievedData1).toEqual(data1);
        expect(retrievedData2).toEqual(data2);
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

    test('should clean up expired items', () => {
        const key = 'testKey';
        const data = { foo: 'bar' };
        const expiration = -1; // Already expired
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, expiration);
        (instance as any).cleanupExpiredItems(); // Directly calling private method
        const retrievedData = instance.getItem(key);
        expect(retrievedData).toBeNull();
    });

    test('should handle invalid JSON in localStorage', () => {
        const key = 'testKey';
        localStorage.setItem(key, 'invalidJSON');
        const instance = LocalStoreX.getInstance();
        try {
            instance.getItem(key);
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
        }
    });

    test('should set and get an item using version hash from ObjectVersionHelper', () => {
        const key = 'testKey';
        const data = { foo: 'bar', test: 'bar2' };
        const defaultVersion = md5(JSON.stringify([ 'foo', 'test' ])) as string;

        // Mocking ObjectVersionHelper to return a version hash
        (ObjectVersionHelper.prototype.generateVersionHash as jest.Mock).mockReturnValue(defaultVersion);

        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data);
        const retrievedData = instance.getItem(key);
        expect(retrievedData).toEqual(data);
    });
});
