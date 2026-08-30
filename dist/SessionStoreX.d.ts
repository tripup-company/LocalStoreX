import { default as LocalStoreX, IStoreConfig } from './LocalStoreX';
/**
 * Configuration for {@link SessionStoreX}: everything {@link LocalStoreX} accepts except the
 * backend, which is fixed to `sessionStorage`.
 */
export type ISessionStoreConfig = Omit<IStoreConfig, 'driver'>;
/**
 * The session-scoped store: {@link LocalStoreX} bound to `window.sessionStorage`.
 *
 * The two differ only in where the data lands, so this is a binding rather than a second
 * implementation — versioning, expiry and sweeping behave identically and are fixed in one place.
 *
 * `sessionStorage` already drops everything when the browser closes. What it does not do is
 * enforce a deadline while the browser stays open, and browsers stay open for weeks. An entry
 * given a lifetime here disappears at that lifetime whether or not the tab is ever closed —
 * see {@link LocalStoreX.sweepExpired}.
 */
export declare const SessionStoreX: {
    /**
     * Returns the session-scoped store, creating it on first use.
     *
     * @param {ISessionStoreConfig} [config] - Optional configuration.
     * @return {LocalStoreX} The instance bound to `sessionStorage`.
     */
    getInstance(config?: ISessionStoreConfig): LocalStoreX;
};
/**
 * The type of a session-scoped store, for annotating variables and parameters.
 */
export type SessionStoreX = LocalStoreX;
