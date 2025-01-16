import LocalStoreX from '../LocalStoreX';

describe('LocalStoreX', () => {
    // Store the original instance to be reset back after tests
    let originalInstance: LocalStoreX | undefined;

    beforeAll(() => {
        // Save the original instance before modifying it in tests
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
        instance.setItem(key, data, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(data);
    });

    test('should set and get a string item with version', () => {
        const key = 'testKey';
        const data = 'some string';
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(data);
    });

    test('should set and get a number item with version', () => {
        const key = 'testKey';
        const data = 455445;
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(data);
    });

    test('should set and get a float item with version', () => {
        const key = 'testKey';
        const data = 10.258;
        const instance = LocalStoreX.getInstance();
        instance.setItem(key, data, 30, 'v1');
        const retrievedData = instance.getItem(key, 'v1');
        expect(retrievedData).toEqual(data);
    });

    test('should set and get empty expired item', (done) => {
        const key = 'testKey';
        const data = 10.258;
        const instance = LocalStoreX.getInstance();
        console.log(instance.getItem(key, 'v1'));
        instance.setItem(key, data, 2, 'v1');

        // Test that data exists before expiration
        setTimeout(() => {
            const retrievedData = instance.getItem(key, 'v1');
            console.log('retrieved: ', retrievedData);
            expect(retrievedData).toEqual(data);
        }, 1000);

        // Test after expiration
        setTimeout(() => {
            const retrievedData = instance.getItem(key, 'v1');
            console.log('retrieved: ', retrievedData);
            expect(retrievedData).toEqual(null);
            expect(localStorage.getItem(key)).toEqual(null);
            done();
        }, 3000);
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
        instance.setItem(key, data, 0.0001, 'v1'); // Expiration time ~0.36 sec
        expect(instance.getItem(key, 'v1')).toEqual(data);

        // Wait some time for expiration
        return new Promise((resolve) =>
            setTimeout(() => {
                const expiredData = instance.getItem(key, 'v1');
                expect(expiredData).toBeNull(); // Data should be removed
                resolve(null);
            }, 500)
        );
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
        const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const instance = LocalStoreX.getInstance();
        const retrievedData = instance.getItem(key);
        expect(consoleWarnMock).toHaveBeenCalledWith(
            `Error parsing JSON for key "${key}":`,
            expect.any(SyntaxError)
        );
        expect(retrievedData).toBeNull();
        consoleWarnMock.mockRestore();
    });

    test('should set and get an item using version hash', () => {
        const key = 'testKey';
        const data = { foo: 'bar', test: 'bar2' };
        const defaultVersion = 'v1';
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