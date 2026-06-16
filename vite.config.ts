import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-crossorigin',
      transformIndexHtml: {
        enforce: 'post',
        transform(html: string) {
          return html.replace(/\s+crossorigin(="[^"]*")?/g, '');
        },
      },
    },
  ],
  root: '.',
  base: process.env.VERCEL ? '/' : './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    cssCodeSplit: false,
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
