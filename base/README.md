# wy-react-helper

Base React helper utilities for wy framework.

## Features

- **ValueCenter** - State management with listeners
  - `useStoreTriggerRender` - Hook for triggering renders
- **createSharePortal** - Shared portal management
  - `usePortals` - Hook for managing portals
  - `Portal` - Portal component
  - `PortalCall` - Portal caller for components that can't be copied but need a key
  - `PortalFragment` - Wrapper for children in a fragment
- **createShareStore** - Shared store utilities
  - `defaultToString` - Default toString function
  - `jsonToString` - JSON toString function
- **useOnlyId** - Unique ID hook

## Installation

```bash
npm install wy-react-helper
# or
pnpm add wy-react-helper
```

## Usage

```tsx
import { useStoreTriggerRender, createSharePortal } from 'wy-react-helper';

// Use state management with listeners instead of createContext
const store = useStoreTriggerRender(initialValue);
```

## Development

See the [main README](../README.md) for development setup instructions.
