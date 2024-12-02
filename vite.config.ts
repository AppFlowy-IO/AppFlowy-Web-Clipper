import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import hotReloadExtension from 'hot-reload-extension-vite';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
    }),
    // hotReloadExtension({
    //   log: true,
    //   backgroundPath: 'public/background.ts',
    // })
  ],
  resolve: {
    alias: [
      { find: 'src/', replacement: `${__dirname}/src/` },
      { find: '@/', replacement: `${__dirname}/src/` },
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: 'public/background.ts',
        content: 'public/content.ts',
        popup: './index.html',
      },
      output: {
        entryFileNames: '[name].js',
        manualChunks: undefined,
      },
    },
  },
});
