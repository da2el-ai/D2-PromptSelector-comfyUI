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
        // web/locales/ 配下の翻訳 JSON は vite の出力物ではないため、
        // emptyOutDir でのクリーンアップ対象から外す（false）。
        // 既存の同名ビルド成果物は rollup が上書きする。
        emptyOutDir: false,
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
