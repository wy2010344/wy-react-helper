import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
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
        "react-native-reanimated",
        "wy-helper",
        "wy-react-helper"
      ]
    }
  },
  plugins: [react(), dts()],
})
