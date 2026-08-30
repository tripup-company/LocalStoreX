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
            fileName: (format) => `localstorex.${format}.js`
        }
    },
    plugins: [dts()]
});
