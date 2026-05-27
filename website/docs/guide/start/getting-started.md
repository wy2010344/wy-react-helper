# Getting started

## Project structure

After creating a project with `create-rspress`, you will get the following project structure:

- `docs/` — The documentation source directory, configured via `root` in `rspress.config.ts`.
- `docs/_nav.json` — The navigation bar configuration.
- `docs/guide/_meta.json` — The sidebar configuration for the guide section.
- `docs/public/` — Static assets directory.
- `theme/` — Optional custom theme directory, generated when you choose the custom theme scaffold.
- `rspress.config.ts` — The Rspress configuration file.

## Development

Start the local development server:

```bash
npm run dev
```

:::tip

You can specify the port number or host with `--port` or `--host`, such as `rspress dev --port 8080 --host 0.0.0.0`.

:::

## Production build

Build the site for production:

```bash
npm run build
```

By default, Rspress will output to `doc_build` directory.

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Next steps

- Explore the `wy-react-helper` documentation from the sidebar to see library hooks, components and utilities.
- Start with the [基础包 Hooks](/guide/base/hooks) section for core React helper usage.
- Visit [Rspress documentation](https://rspress.rs/) for advanced site-building and MDX features.
