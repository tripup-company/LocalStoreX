import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        minify: false,
        sourcemap: true,
        // Pinned to what Vite 5's default 'modules' target resolved to, so the
        // Vite 7 upgrade does not change the emitted bundle. Vite 7's new
        // default ('baseline-widely-available') would drop the esbuild Safari 14
        // workaround and emit native optional chaining instead.
        target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
        lib: {
            entry: './src/main.ts',
            name: 'LocalStoreX',
            // The UMD build must not use the `.js` extension: this package is
            // `"type": "module"`, so Node would load a `.js` file as ESM and the
            // `require` condition in `exports` would break. `.cjs` is unambiguous.
            fileName: (format) =>
                format === 'umd' ? 'localstorex.umd.cjs' : `localstorex.${format}.js`
        }
    },
    plugins: [
        dts({
            // The tests are part of the tsconfig `include`, but their `.d.ts`
            // files have no business in `dist/`, which is committed and consumed
            // straight from git.
            exclude: ['src/__tests__/**'],
            // Roll every declaration into a single self-contained `main.d.ts`.
            // Emitting one file per source leaves extensionless relative
            // specifiers (`from './LocalStoreX'`) in the output, which is a
            // hard error (TS2834) for consumers on `moduleResolution: node16`
            // or `nodenext`. A rolled-up file has no relative imports at all.
            rollupTypes: true
        })
    ]
});
