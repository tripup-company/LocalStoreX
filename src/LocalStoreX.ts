import ObjectVersionHelper from './ObjectVersionHelper';
import IObjectVersionHelper from './IObjectVersionHelper';

export default class LocalStoreX {
    private static instance: LocalStoreX;

    private constructor(private objectVersionHelper: IObjectVersionHelper = new ObjectVersionHelper()) {
        this.cleanupExpiredItems();
    }

    public static getInstance(): LocalStoreX {
        if (!LocalStoreX.instance) {
            LocalStoreX.instance = new LocalStoreX();
        }
        return LocalStoreX.instance;
    }

    setItem(key: string, value: any, expiration: number, versionIsDeep: boolean = false) {
        const version = this.objectVersionHelper.generateVersionHash(value, versionIsDeep);
        const item = {
            value,
            expiration: expiration ? new Date().getTime() + expiration * 3600000 : null, // 3600000 ms in 1 hour
            version
        };

        localStorage.setItem(key, JSON.stringify(item));
    }

    getItem(key: string, versionIsDeep: boolean = false) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }

        const item = JSON.parse(itemStr);
        const currentVersion = this.objectVersionHelper.generateVersionHash(item.value, versionIsDeep);

        // Check if the item has expired
        if (item.expiration && new Date().getTime() > item.expiration) {
            localStorage.removeItem(key);
            return null;
        }

        // Check if the item version is outdated
        if (!this.objectVersionHelper.compareVersion(item.version, currentVersion)) {
            return null;
        }

        return item.value;
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }

    private cleanupExpiredItems() {
        const now = new Date().getTime();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const itemStr = localStorage.getItem(key);
                if (itemStr) {
                    let item;
                    try {
                        item = JSON.parse(itemStr);
                    } catch (e) {
                        console.warn(`Invalid JSON data for key "${key}": ${itemStr}`);
                        localStorage.removeItem(key);
                        continue;
                    }

                    // Check if the item has expired
                    if (item.expiration && now > item.expiration) {
                        localStorage.removeItem(key);
                    }
                }
            }
        }
    }
}
