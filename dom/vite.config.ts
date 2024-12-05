import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      formats: ["es", "cjs"]
    },
    minify: false,
    rollupOptions: {
      external: [
        "wy-helper",
        "wy-dom-helper",
        "wy-react-helper",
        "react",
        "react-dom",
        "react/jsx-runtime"
      ]
    }
  },
  plugins: [react(), dts()],
})
