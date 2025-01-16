import LocalStoreX from '../LocalStoreX';
import md5 from 'md5';
describe('LocalStoreX', () => {
    // Store the original instance to be reset back after tests
    let originalInstance;
    beforeAll(() => {
        // We store the original instance before modifying it in tests
        originalInstance = LocalStoreX.instance;
    });
    afterEach(() => {
        // Restore the original instance after each test
        LocalStoreX.instance = originalInstance;
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
        instance.setItem(key, data, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(data);
    });
    test('should update an item with the same version', () => {
        const key = 'testKey';
        const initialData = { foo: 'bar' };
        const updatedData = { foo: 'baz' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, initialData, 30, 'v1');
        instance.setItem(key, updatedData, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(updatedData);
    });
    test('should handle expiration correctly', () => {
        const key = 'testKey';
        const data = { foo: 'bar' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, 0.0001, 'v1'); // Время истечения ~0.36 сек
        expect(instance.getItem(key, 'v1')).toEqual(data);
        // Ждём немного времени, чтобы время истекло
        return new Promise(resolve => setTimeout(() => {
            const expiredData = instance.getItem(key, 'v1');
            expect(expiredData).toBeNull(); // Данные должны быть удалены
            resolve(null);
        }, 500));
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
    test('should handle invalid JSON in localStorage', () => {
        const key = 'testKey';
        const invalidValue = 'invalidJSON';
        localStorage.setItem(key, invalidValue);
        const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const instance = LocalStoreX.getInstance();
        const retrievedData = instance.getItem(key);
        expect(consoleWarnMock).toHaveBeenCalledWith(`Error parsing JSON for key "${key}":`, expect.any(SyntaxError));
        expect(retrievedData).toBeNull();
        consoleWarnMock.mockRestore();
    });
    test('should set and get an item using version hash', () => {
        const key = 'testKey';
        const data = { foo: 'bar', test: 'bar2' };
        const defaultVersion = md5(JSON.stringify({ foo: 'bar', test: 'bar2' }));
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, undefined, defaultVersion);
        const retrievedData = instance.getItem(key, defaultVersion);
        expect(retrievedData).toEqual(data);
    });
    test('should correctly reset expiration when updating data', () => {
        const key = 'testKey';
        const initialData = { foo: 'bar' };
        const updatedData = { foo: 'baz' };
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, initialData, 60, 'v1'); // 60 seconds
        instance.setItem(key, updatedData, 120, 'v1'); // 120 seconds
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        const now = Date.now();
        expect(item.expiration).toBeGreaterThanOrEqual(now + 60 * 1000);
        expect(item.expiration).toBeLessThanOrEqual(now + 120 * 1000);
    });
});
