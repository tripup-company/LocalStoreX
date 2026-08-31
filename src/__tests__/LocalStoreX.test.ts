import LocalStoreX from '../LocalStoreX';
import { MemoryStorageDriver } from '../driver/MemoryStorageDriver';
import { SessionStoreX } from '../SessionStoreX';

const HOUR_IN_SECONDS = 60 * 60;

describe('LocalStoreX', () => {
    const created: LocalStoreX[] = [];

    /**
     * Builds a store and registers it for teardown, so no test inherits another test's instance
     * from the per-driver instance cache.
     */
    const createStore = (config?: Parameters<typeof LocalStoreX.getInstance>[0]) => {
        const store = LocalStoreX.getInstance(config);
        created.push(store);
        return store;
    };

    afterEach(() => {
        while (created.length) {
            created.pop()?.destroy();
        }
        localStorage.clear();
        sessionStorage.clear();
        jest.restoreAllMocks();
    });

    describe('instances', () => {
        test('returns the same instance for the same driver', () => {
            expect(createStore()).toBe(createStore());
        });

        test('returns separate instances for the local and session drivers', () => {
            const local = createStore({ driver: 'local' });
            const session = createStore({ driver: 'session' });

            expect(local).not.toBe(session);
        });

        test('writes to the storage area its driver names', () => {
            createStore({ driver: 'session' }).setItem('session-token', 'abc');

            expect(sessionStorage.getItem('session-token')).not.toBeNull();
            expect(localStorage.getItem('session-token')).toBeNull();
        });

        test('SessionStoreX is the session-bound spelling of LocalStoreX', () => {
            const session = createStore({ driver: 'session' });

            expect(SessionStoreX.getInstance()).toBe(session);
        });

        test('destroy frees the instance so the next call can reconfigure it', () => {
            const first = LocalStoreX.getInstance({ driver: 'memory' });
            first.destroy();
            const second = LocalStoreX.getInstance({ driver: 'memory' });
            created.push(second);

            expect(second).not.toBe(first);
        });
    });

    describe('reading and writing', () => {
        test.each([
            ['an object', { foo: 'bar' }],
            ['a string', 'some string'],
            ['an integer', 455445],
            ['a float', 10.258],
            ['a boolean', false],
            ['an array', [1, 2, 3]],
        ])('round-trips %s', (_label, data) => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', data, 30, 'v1');

            expect(store.getItem('testKey', 'v1')).toEqual(data);
        });

        test('returns null for a version that does not match', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' }, 30, 'v1');

            expect(store.getItem('testKey', 'v2')).toBeNull();
        });

        test('overwrites the value while keeping the key', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' }, 30, 'v1');
            store.setItem('testKey', { foo: 'baz' }, 30, 'v1');

            expect(store.getItem('testKey', 'v1')).toEqual({ foo: 'baz' });
        });

        test('removes a single item', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' });
            store.removeItem('testKey');

            expect(store.getItem('testKey')).toBeNull();
        });

        test('warns and returns null for a value that is not JSON', () => {
            const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            localStorage.setItem('testKey', 'invalidJSON');
            const store = createStore({ driver: 'local' });

            expect(store.getItem('testKey')).toBeNull();
            expect(consoleWarn).toHaveBeenCalledWith(
                'Error parsing JSON for key "testKey":',
                expect.any(SyntaxError),
            );
        });

        test('reading a key it does not own leaves that entry in place', () => {
            jest.spyOn(console, 'warn').mockImplementation(() => {});
            localStorage.setItem('host-page-cart', 'not ours');
            localStorage.setItem('host-page-json', '{"unrelated":true}');
            const store = createStore({ driver: 'local' });

            expect(store.getItem('host-page-cart')).toBeNull();
            expect(store.getItem('host-page-json')).toBeNull();

            expect(localStorage.getItem('host-page-cart')).toBe('not ours');
            expect(localStorage.getItem('host-page-json')).toBe('{"unrelated":true}');
        });
    });

    describe('expiration', () => {
        test('drops an item once its lifetime has passed', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' }, HOUR_IN_SECONDS, 'v1');
            expect(store.getItem('testKey', 'v1')).toEqual({ foo: 'bar' });

            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (HOUR_IN_SECONDS + 1) * 1000);

            expect(store.getItem('testKey', 'v1')).toBeNull();
        });

        test('treats defaultExpiration as a lifetime in seconds, not a timestamp', () => {
            const store = createStore({ driver: 'memory', defaultExpiration: HOUR_IN_SECONDS });
            store.setItem('testKey', { foo: 'bar' });

            expect(store.getItem('testKey')).toEqual({ foo: 'bar' });
        });

        test('keeps an item without an expiration indefinitely', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' });

            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 365 * 24 * 3600 * 1000);

            expect(store.getItem('testKey')).toEqual({ foo: 'bar' });
        });

        test('resets the expiration when an update supplies a new one', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey', { foo: 'bar' }, 60, 'v1');
            store.setItem('testKey', { foo: 'baz' }, 120, 'v1');

            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 90 * 1000);

            expect(store.getItem('testKey', 'v1')).toEqual({ foo: 'baz' });
        });
    });

    describe('sweeping', () => {
        test('removes expired entries nobody has read', () => {
            const store = createStore({ driver: 'session' });
            store.setItem('app:threads', ['a'], HOUR_IN_SECONDS);
            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (HOUR_IN_SECONDS + 1) * 1000);

            expect(store.sweepExpired()).toBe(1);
            // The point of the sweep: gone from the storage area itself, not merely unreadable.
            expect(sessionStorage.getItem('app:threads')).toBeNull();
        });

        test('keeps entries that have not expired', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('fresh', 'value', HOUR_IN_SECONDS);

            expect(store.sweepExpired()).toBe(0);
            expect(store.getItem('fresh')).toBe('value');
        });

        test('leaves entries written by other code alone', () => {
            sessionStorage.setItem('host-page-cart', 'not ours');
            sessionStorage.setItem('host-page-json', '{"unrelated":true}');
            const store = createStore({ driver: 'session' });
            store.setItem('app:threads', ['a'], HOUR_IN_SECONDS);
            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (HOUR_IN_SECONDS + 1) * 1000);

            store.sweepExpired();

            expect(sessionStorage.getItem('host-page-cart')).toBe('not ours');
            expect(sessionStorage.getItem('host-page-json')).toBe('{"unrelated":true}');
        });

        test('honours the configured sweep prefix', () => {
            const store = createStore({ driver: 'session', sweepPrefix: 'app:' });
            store.setItem('app:threads', ['a'], HOUR_IN_SECONDS);
            store.setItem('other:threads', ['b'], HOUR_IN_SECONDS);
            jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (HOUR_IN_SECONDS + 1) * 1000);

            expect(store.sweepExpired()).toBe(1);
            expect(sessionStorage.getItem('app:threads')).toBeNull();
            expect(sessionStorage.getItem('other:threads')).not.toBeNull();
        });

        test('sweeps on construction', () => {
            const driver = new MemoryStorageDriver();
            driver.setItem('stale', JSON.stringify({ version: 'v1', expiration: Date.now() - 1, value: 'x' }));

            createStore({ driver });

            expect(driver.getItem('stale')).toBeNull();
        });

        test('sweeps on the configured interval', () => {
            jest.useFakeTimers();
            try {
                const store = createStore({ driver: 'memory', sweepIntervalMs: 1000 });
                store.setItem('testKey', 'value', HOUR_IN_SECONDS);
                jest.spyOn(Date, 'now').mockReturnValue(Date.now() + (HOUR_IN_SECONDS + 1) * 1000);

                jest.advanceTimersByTime(1000);

                expect(store.keys()).not.toContain('testKey');
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('clearing', () => {
        test('clear with a prefix only removes matching keys', () => {
            sessionStorage.setItem('host-page-cart', 'not ours');
            const store = createStore({ driver: 'session' });
            store.setItem('app:threads', ['a']);
            store.setItem('app:active', 'a');
            store.setItem('other', 'keep');

            store.clear('app:');

            expect(store.getItem('app:threads')).toBeNull();
            expect(store.getItem('app:active')).toBeNull();
            expect(store.getItem('other')).toBe('keep');
            expect(sessionStorage.getItem('host-page-cart')).toBe('not ours');
        });

        test('clear without a prefix empties the storage area', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('testKey1', { foo: 'bar1' });
            store.setItem('testKey2', { foo: 'bar2' });

            store.clear();

            expect(store.keys()).toEqual([]);
        });

        test('removeItemsWithPrefix reports how many entries it removed', () => {
            const store = createStore({ driver: 'memory' });
            store.setItem('app:a', 1);
            store.setItem('app:b', 2);
            store.setItem('keep', 3);

            expect(store.removeItemsWithPrefix('app:')).toBe(2);
            expect(store.keys()).toEqual(['keep']);
        });
    });
});
