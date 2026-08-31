# LocalStoreX

LocalStoreX is a TypeScript library that wraps the browser's Web Storage and adds versioning and
expiration to stored entries — including the part Web Storage itself does not do: making an entry
actually disappear when its lifetime is up, rather than when someone next reads it.

The storage backend is chosen per instance, so the same API serves `localStorage`,
`sessionStorage`, an in-memory fallback, or a backend of your own.

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
"localstorex": "https://github.com/tripup-company/LocalStoreX.git#v2.0.0"
```

The build output under `dist/` is committed on purpose: an install from git
runs no build step, so the bundles and the type declarations have to be in the
repository. After changing anything under `src/`, run `yarn build` and commit
the regenerated `dist/` along with it.

The package provides an ES module build, a UMD build for `<script>` tags, and
TypeScript declarations for both.

## Quick start

```typescript
import { LocalStoreX, SessionStoreX } from 'localstorex';

// Persists across browser restarts.
const local = LocalStoreX.getInstance();

// Scoped to the tab, dropped when the browser closes.
const session = SessionStoreX.getInstance();

session.setItem('draft', { subject: 'Hello' }, 7 * 24 * 60 * 60); // seven days
session.getItem('draft'); // { subject: 'Hello' }
```

## Choosing a backend

`getInstance` caches one instance per backend, so a local-scoped and a session-scoped store can
exist side by side. The first call for a backend is the one whose configuration takes effect;
call `destroy()` to release it if you need to reconfigure.

```typescript
LocalStoreX.getInstance({ driver: 'local' });   // window.localStorage (default)
LocalStoreX.getInstance({ driver: 'session' }); // window.sessionStorage
LocalStoreX.getInstance({ driver: 'memory' });  // process memory
LocalStoreX.getInstance({ driver: myBackend }); // anything matching IStorageDriver
```

`SessionStoreX.getInstance(config)` is shorthand for `driver: 'session'`; it returns the same
`LocalStoreX` instance and shares its implementation.

Web Storage is probed rather than merely detected, because a browser can expose
`window.sessionStorage` and still throw on the first write — Safari's private mode being the
familiar case. When the probe fails, and during server-side rendering where there is no `window`
at all, the store transparently falls back to memory. Nothing throws; nothing survives a reload
either, which is the honest outcome.

## Expiration

Lifetimes are given in seconds. An entry stored without one never expires.

```typescript
store.setItem('key', data, 3600);          // expires in an hour
store.setItem('key', data);                // no expiry, unless defaultExpiration is set
LocalStoreX.getInstance({ defaultExpiration: 3600 }); // applies to writes without a lifetime
```

### Why entries are swept, not just checked on read

`getItem` drops an expired entry when it happens to be asked for. That is enough when the storage
area is itself short-lived, and not enough when an entry is meant to disappear on a deadline.

`sessionStorage` is the case that makes this concrete. It clears when the browser closes — but
browsers stay open for weeks, and a tab nobody has closed keeps its `sessionStorage` alive the
whole time. An entry given a seven-day lifetime therefore stays sitting in the storage area, fully
readable to anyone who opens devtools, long after those seven days, until something happens to
read that particular key.

Sweeping closes the gap. With `autoSweep` (on by default) the store purges expired entries:

- on construction, so a page load never starts from stale data;
- on `visibilitychange` and `focus`, which is precisely the moment a tab that has been in the
  background for days becomes visible again;
- on `pageshow`, covering restores from the back/forward cache.

For a tab that may sit in the foreground untouched for longer than the data is allowed to live,
add a timer:

```typescript
LocalStoreX.getInstance({ driver: 'session', sweepIntervalMs: 60_000 });
```

The timer is opt-in: a library that installs an interval nobody asked for is a library that
leaks one.

You can also sweep on demand — `store.sweepExpired()` returns how many entries it removed.

### Sharing a storage area you do not own

An embedded widget writes into its host page's storage area. Two things make that safe:

- **Neither sweeping nor reading touches foreign entries.** Only values that parse as this
  library's envelope are considered, so anything another script wrote is left alone (and does not
  produce console noise while being skipped during a sweep).
- **`sweepPrefix` narrows it further**, restricting every sweep to your own keys:

```typescript
LocalStoreX.getInstance({ driver: 'session', sweepPrefix: 'my-widget:' });
```

The same applies to clearing. `clear()` with no argument empties the **entire** storage area,
foreign entries included; pass a prefix unless your store owns the area outright:

```typescript
store.clear('my-widget:');              // only your keys
store.removeItemsWithPrefix('my-widget:'); // the same, and returns the count
```

## API

### `LocalStoreX.getInstance(config?): LocalStoreX`

Returns the store bound to the configured backend, creating it on first use.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `driver` | `'local' \| 'session' \| 'memory' \| IStorageDriver` | `'local'` | Which backend to bind to. |
| `defaultVersion` | `string` | `'v1'` | Version stamped onto items stored without one. |
| `defaultExpiration` | `number \| null` | `null` | Default lifetime in seconds for items stored without one. |
| `autoSweep` | `boolean` | `true` | Purge expired entries on load and on tab activation. |
| `sweepPrefix` | `string` | – | Restrict every sweep to keys carrying this prefix. |
| `sweepIntervalMs` | `number \| null` | `null` | Additionally purge on a timer. |

### Instance methods

- **`setItem(key, data, expiration?, version?): void`** — Stores an item. `expiration` is a
  lifetime in seconds; `version` defaults to `defaultVersion`. On a quota error the store sweeps
  once and retries, then gives up rather than throwing.
- **`getItem(key, version?): any`** — Returns the stored data, or `null` when the item is missing,
  expired, or carries a different version. An expired item is removed as a side effect; an entry
  that is not this library's is left where it is.
- **`removeItem(key): void`** — Removes one entry.
- **`removeItemsWithPrefix(prefix): number`** — Removes every entry whose key carries the prefix,
  and returns the count.
- **`clear(prefix?): void`** — With a prefix, as above. Without one, empties the entire storage
  area, including entries written by other code sharing it.
- **`sweepExpired(prefix?): number`** — Removes every expired entry the store owns without waiting
  for a read, and returns the count. Defaults to the configured `sweepPrefix`.
- **`keys(prefix?): string[]`** — The keys currently present in the storage area.
- **`destroy(): void`** — Stops the periodic sweep, unsubscribes from tab-activation events, and
  releases the cached instance so the next `getInstance` can apply a fresh configuration. Stored
  data is left alone.

### Types

`IStorageDriver` is the structural subset of the DOM `Storage` interface the library uses —
`length`, `key`, `getItem`, `setItem`, `removeItem` — so `window.localStorage` and
`window.sessionStorage` satisfy it as-is, and so does any backend of your own.
`MemoryStorageDriver` is the in-memory implementation used as the fallback and is exported for
tests.

## Migrating from 1.x

- `getInstance()` with no arguments still returns a `localStorage`-backed store, and
  `setItem` / `getItem` / `removeItem` are unchanged. Most callers need no changes.
- The instance is now cached **per backend** rather than globally. Code reaching into the private
  `LocalStoreX.instance` field — test setups, mostly — should use `destroy()` instead.
- `clear()` without an argument still empties the whole storage area. Prefer `clear(prefix)`.
- **Bug fix:** `defaultExpiration` was written into items as though it were an absolute timestamp,
  which made any non-null value an epoch time a few seconds after 1970 — expired on arrival. It is
  now treated as a lifetime in seconds, matching the documentation and the `setItem` argument.
## Development

```bash
yarn install
yarn test        # jest
yarn typecheck   # tsc --noEmit
yarn build       # typecheck, bundle, and emit the CommonJS declarations
```

`dist/` is committed so the package can be consumed directly as a git dependency. Rebuild it in
the same commit as any change under `src/`.
