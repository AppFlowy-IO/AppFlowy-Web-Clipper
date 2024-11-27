import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		svgr({
			include: '**/*.svg',
			svgrOptions: { exportType: 'named', ref: true, svgo: false, titleProp: true },
		}),
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
			popup: './index.html', 
			background: 'src/components/background/background.ts',
			content: 'src/components/content/content.ts', 
		  },
		  output: {
			entryFileNames: '[name].js',
			manualChunks: undefined,
			// inlineDynamicImports: true, 
		  },
		},
	},
	// https://vite.dev/config/server-options#server-cors
	server: {
		watch: {
		  ignored: ['node_modules'],
		},
		cors: false,
	  },
})
