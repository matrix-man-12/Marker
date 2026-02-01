import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative paths for Chrome extension
  build: {
    outDir: '../bookmarks-page', // Output directly to extension folder
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Keep consistent filenames for extension
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
