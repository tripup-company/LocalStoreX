// The `require` condition in `exports` resolves to `dist/localstorex.umd.cjs`,
// but `dist/main.d.ts` is read as ESM because the package is `"type": "module"`.
// TypeScript then rejects the CommonJS import path with TS1479. Shipping the
// same rolled-up declarations under a `.d.cts` extension gives that path types
// it can actually load.
import { copyFileSync, existsSync } from 'node:fs';

const source = 'dist/main.d.ts';
const target = 'dist/main.d.cts';

if (!existsSync(source)) {
    console.error(`emit-cjs-types: ${source} is missing - did the dts build run?`);
    process.exit(1);
}

copyFileSync(source, target);
console.log(`emit-cjs-types: wrote ${target}`);
