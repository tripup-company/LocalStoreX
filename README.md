# LocalStoreX

LocalStoreX is a TypeScript library that provides a wrapper around the `localStorage` API with additional functionalities, such as versioning for stored items and automatic cleanup of expired items.

## Installation

To install LocalStoreX, use [npm](https://www.npmjs.com/):

```bash
npm install localstorex
```

## Classes

### `LocalStoreX`

A singleton class that provides methods to interact with `localStorage`.

#### Methods

- **`getInstance(config?: {defaultVersion?: string, defaultExpiration?: number | null}): LocalStoreX`**

  Returns the singleton instance of `LocalStoreX`. You can provide an optional configuration object to set the default version and expiration time.

- **`setItem(key: string, value: any, expiration?: number, providedVersion?: string): void`**

  Stores an item in `localStorage`. The item is assigned a version. If an expiration time (in days) is provided, the item will be considered expired after the specified period. If no expiration time is provided, the item will be stored indefinitely. If no version is provided, the default version `'v1'` will be used.

- **`getItem(key: string, version?: string): any`**

  Retrieves an item from `localStorage`. If the item is expired or does not have the specified version, it returns `null`.

- **`removeItem(key: string): void`**

  Removes an item from `localStorage`.

- **`clear(): void`**

  Clears all items in `localStorage`.

- **`removeVersionItem(key: string, version: string): void`**

  Removes a specific version of an item by the given key from `localStorage`.

### `ObjectVersionHelper`

A class that provides methods to generate version hashes for objects based on their structure.

#### Methods

- **`generateVersionHash(data: any, isDeep: boolean = false): string`**

  Generates a version hash for the given data. This hash can be used as a version identifier for storing objects. The `isDeep` flag indicates whether to sort keys deeply for nested structures.

### Usage Example

Here's an example of how to use `ObjectVersionHelper` with `LocalStoreX` to generate version hashes based on object structure:

```typescript
import { LocalStoreX } from 'localstorex';
import { ObjectVersionHelper } from 'localstorex';

// Optionally, enable deep traversal for more detailed versioning
const versionHash = ObjectVersionHelper.generateVersionHash({ some: 'data', nested: { field: 'value' } }, true);

// Get an instance of LocalStoreX
const store = LocalStoreX.getInstance();

// Data to be stored
const data = { some: 'data', nested: { field: 'value' } };

// Store the item with the generated version hash
store.setItem('key', data, 1, versionHash);

// Retrieve the item
const retrievedData = store.getItem('key', versionHash);

// Remove the item for the specific version
store.removeVersionItem('key', versionHash);

// Clear all items
store.clear();
```

This example demonstrates setting an item in `localStorage` with a 1-day expiration time, retrieving it, removing it, and clearing all items from `localStorage`.

## Notes

- Expiration times are optional and specified in days. If not provided, items will be stored indefinitely.
- Items are versioned to allow storing multiple versions of the same item under the same key. If no version is provided, the default version `'v1'` will be used.
- Expired items are automatically cleaned up on access.
- `ObjectVersionHelper` can be used to generate consistent version hashes for objects based on their structure, making it easier to manage updates and changes.

By using `LocalStoreX` and `ObjectVersionHelper`, you can efficiently manage versioned and expirable data in the browser's `localStorage`.
