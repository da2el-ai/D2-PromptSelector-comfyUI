import { resolve } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

export default defineConfig({
    plugins: [svelte({ preprocess: preprocess() })],
    build: {
        sourcemap: true,
        minify: false,
        outDir: resolve(__dirname, '../web'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                d2_prompt_selector: resolve(__dirname, 'src/index.ts'),
                style: resolve(__dirname, 'src/css/style.scss'),
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
