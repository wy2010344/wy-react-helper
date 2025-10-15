# wy-react-helper

React helper utilities for wy framework.

## Packages

- **wy-react-helper** - Base React hooks and utilities
- **wy-react-dom-helper** - DOM-specific React utilities
- **wy-react-native** - React Native utilities

## Development

This project is part of a pseudo monorepo setup. To contribute:

1. Clone the pseudo monorepo:

   ```bash
   git clone https://github.com/wy2010344/es-pseudo-monorepo.git
   cd es-pseudo-monorepo
   ```

2. Clone this project into the packages directory:

   ```bash
   cd packages
   git clone https://github.com/wy2010344/wy-react-helper.git
   cd wy-react-helper
   ```

3. Install dependencies from the monorepo root:

   ```bash
   cd ../..
   pnpm install
   ```

4. Build and test:
   ```bash
   cd packages/wy-react-helper
   pnpm run build
   pnpm run lint:check
   pnpm run type-check
   ```

## Publishing

From the monorepo root:

```bash
pnpm changeset
pnpm version-packages
pnpm release
```
