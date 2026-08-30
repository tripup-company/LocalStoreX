import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        minify: false,
        sourcemap: true,
        lib: {
            entry: './src/main.ts',
            name: 'LocalStoreX',
            fileName: (format) => `localstorex.${format}.js`
        }
    },
    // Tests are not part of the published surface, and emitting their declarations put a stray
    // .d.ts in dist/ that jest then collected as a test suite of its own.
    plugins: [dts({ exclude: ['src/**/__tests__/**'] })]
});
