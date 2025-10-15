import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  platform: 'neutral',
  dts: true,
  external: [
    'react',
    'react-dom',
    'wy-helper',
    'wy-dom-helper',
    'wy-react-helper',
  ],
  format: ['esm', 'cjs'],
});
