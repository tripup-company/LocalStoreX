import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: './src/main.ts',
            name: 'LocalStoreX',
            fileName: (format) => `LocalStoreX.${format}.js`
        }
    },
    plugins: [dts()]
});
