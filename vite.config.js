import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    base: process.env.GITHUB_PAGES === 'true' ? process.env.GITHUB_PAGES_BASE_PATH || '/' : '/',
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
            generatedRouteTree: './src/routes/routeTree.gen.ts',
            routeFileIgnorePattern: 'routeTree\\.gen\\.(ts|tsx)$',
        }),
        react(),
        tailwindcss(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            injectRegister: 'auto',
            registerType: 'prompt',
            manifest: false,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
    },
});
