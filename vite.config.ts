import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    root: 'src',
    plugins: [],
    build: {
        sourcemap: true,
        minify: false,
        outDir: resolve(__dirname, 'web'),
        // 存在しないときはフォルダを作成する
        emptyOutDir: true,
        rollupOptions: {
            input: {
                d2_prompt_selector: resolve(__dirname, 'src/js/index.ts'),
                style: resolve(__dirname, 'src/css/style.scss'),
                // options: resolve(__dirname, 'src/options.html'),
                // popup: resolve(__dirname, 'src/popup.html'),
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
