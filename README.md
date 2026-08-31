# LocalStoreX

LocalStoreX is a TypeScript library that provides a wrapper around the `localStorage` API with additional functionalities, such as versioning for stored items and automatic cleanup of expired items.

## Installation

LocalStoreX is an internal package and is **not published to npm**. Install it
straight from this repository by adding it to your `package.json`:

```json
{
  "dependencies": {
    "localstorex": "https://github.com/tripup-company/LocalStoreX.git"
  }
}
```

To pin a specific release instead of tracking the default branch, append a tag
or commit-ish:

```json
"localstorex": "https://github.com/tripup-company/LocalStoreX.git#v1.0.2"
```

The build output under `dist/` is committed on purpose: an install from git
runs no build step, so the bundles and the type declarations have to be in the
repository. After changing anything under `src/`, run `yarn build` and commit
the regenerated `dist/` along with it.

The package provides an ES module build, a UMD build for `<script>` tags, and
TypeScript declarations for both.

## Classes

### `LocalStoreX`

A singleton class that provides methods to interact with `localStorage`.

#### Methods

- **`getInstance(config?: {defaultVersion: string, defaultExpiration: number | null}): LocalStoreX`**

  Returns the singleton instance of `LocalStoreX`. The configuration object is optional, but when you pass one both of its fields are required. It only takes effect on the first call, since later calls return the already-created instance.

- **`setItem(key: string, value: any, expiration?: number, providedVersion?: string): void`**

  Stores an item in `localStorage`. The item is assigned a version. If an expiration time (in seconds) is provided, the item will be considered expired after the specified period. If no expiration time is provided, the item will be stored indefinitely. If no version is provided, the default version `'v1'` will be used.

- **`getItem(key: string, version?: string): any`**

  Retrieves an item from `localStorage`. If the item is expired or does not have the specified version, it returns `null`.

- **`removeItem(key: string): void`**

  Removes an item from `localStorage`.

- **`clear(): void`**

  Clears all items in `localStorage`.

### Usage Example

```typescript
import { LocalStoreX } from 'localstorex';

// Get the singleton instance
const store = LocalStoreX.getInstance();

// Data to be stored
const data = { some: 'data', nested: { field: 'value' } };

// Store the item with a 1-day expiration under an explicit version
store.setItem('key', data, 86400, 'v2');

// Retrieve the item - returns null if it expired or the version does not match
const retrievedData = store.getItem('key', 'v2');

// Remove the item
store.removeItem('key');

// Clear all items
store.clear();
```

This example demonstrates setting an item in `localStorage` with a 1-day expiration time, retrieving it, removing it, and clearing all items from `localStorage`.

## Notes

- Expiration times are optional and specified in seconds. If not provided, items will be stored indefinitely.
- Items are versioned to allow storing multiple versions of the same item under the same key. If no version is provided, the default version `'v1'` will be used.
- Expired items are automatically cleaned up on access.

By using `LocalStoreX`, you can efficiently manage versioned and expirable data in the browser's `localStorage`.
