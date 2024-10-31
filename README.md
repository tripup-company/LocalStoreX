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

- **getInstance(): LocalStoreX**

  Returns the singleton instance of `LocalStoreX`.

- **setItem(key: string, value: any, expiration?: number, providedVersion?: string | IObjectVersionHelper): void**

  Stores an item in `localStorage`. The item is assigned a version. If an expiration time (in milliseconds) is provided, the item will be considered expired after the specified period.

- **getItem(key: string, providedVersion?: string | IObjectVersionHelper): any**

  Retrieves an item from `localStorage`. If the item is expired or its version is outdated, it returns `null`.

- **removeItem(key: string): void**

  Removes an item from `localStorage`.

- **clear(): void**

  Clears all items in `localStorage`.

- **removeVersionItem(key: string, version: string): void**

  Removes a specific version of an item by the given key from `localStorage`.

- **cleanupExpiredItems(): void**

  Removes expired items from `localStorage`. This method is called automatically when an instance of `LocalStoreX` is created.

### `ObjectVersionHelper`

A class that provides methods to generate and compare version hashes for objects. You can override this class if you need a different version hashing method.

#### Methods

- **generateVersionHash(data: any): string**

  Generates a version hash for the given data.

- **setDeepTraversal(isDeep: boolean): void**

  Sets the deep sorting flag for generating version hashes.

## Interface

### `IObjectVersionHelper`

An interface that defines the contract for version helper classes.

#### Methods

- **generateVersionHash(data: any): string**

## Custom Version Helper Usage Example

```typescript
import { LocalStoreX } from 'localstorex';
// No need to pass CustomVersionHelper anymore

const store = LocalStoreX.getInstance();

// Set an item with a 1-hour expiration
store.setItem('key', { some: 'data' }, 1);

// Get an item
const value = store.getItem('key');

// Remove an item
store.removeItem('key');

// Clear all items
store.clear();
```

## Using ObjectVersionHelper with Deep Traversal

```typescript
import ObjectVersionHelper from 'localstorex/ObjectVersionHelper';
import { LocalStoreX } from 'localstorex';

// Create an instance of ObjectVersionHelper and enable deep traversal
const versionHelper = new ObjectVersionHelper();
versionHelper.setDeepTraversal(true);

// Get an instance of LocalStoreX
const store = LocalStoreX.getInstance();

// Set an item with a custom version generated through deep traversal
store.setItem('keyDeep', { some: 'deep', nested: { data: 'value' } }, 1, versionHelper);

// Get the deep versioned item
const valueDeep = store.getItem('keyDeep', versionHelper);

// Remove the deep versioned item
store.removeVersionItem('keyDeep', versionHelper.generateVersionHash({ some: 'deep', nested: { data: 'value' } }));

// Clear all items
store.clear();
```
