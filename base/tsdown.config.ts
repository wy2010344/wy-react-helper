import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'state-function': './src/state-function/index.ts',
  },
  platform: 'neutral',
  dts: true,
  external: ['react', 'wy-helper'],
  format: ['esm', 'cjs'],
});
