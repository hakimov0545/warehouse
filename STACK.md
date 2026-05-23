# Warehouse - Stack & FSD Architecture

## Stack

| Layer | Tool | Purpose |
| --- | --- | --- |
| Build | Vite 7 | Dev server and production bundle |
| UI | React 18 + Ant Design 5 + Tailwind CSS 3 | Component UI and utility styling |
| Type safety | TypeScript 6 | Type checking and typed shared contracts |
| Routing | React Router 6 | Client-side routing |
| Server state | TanStack Query 5 | API cache, loading, invalidation, refetch |
| Client state | Zustand 5 | Auth, theme, notifications, UI/domain state |
| Forms | React Hook Form 7 | Form state management |
| Validation | Zod 4 | Form schemas and runtime validation |
| HTTP | Axios 1 | API client and interceptors |
| i18n | i18next | UZ / RU / EN translations |
| Map | React Leaflet | Warehouse location picking |

## FSD Structure

```txt
src/
  app/                # app entry, providers, router
  pages/              # route-level screens
  widgets/            # layout-level composed UI
  features/           # user actions and reusable feature components
  entities/           # domain APIs and models/stores
  shared/             # api client, UI kit, hooks, lib, config, styles, types, utils
```

## Import Rules

- `@app/*` - application setup only.
- `@pages/*` - route screens.
- `@widgets/*` - composed layout widgets.
- `@features/*` - feature-level user interactions.
- `@entities/*` - domain APIs and models.
- `@shared/*` - reusable low-level code.

Prefer aliases over deep relative imports so files can move inside FSD layers without breaking callers.

## Migration Notes

The project now builds with the FSD layout while keeping existing `.jsx` screens working through `allowJs`. New or heavily edited screens should be written in `.tsx`, use TanStack Query for server state, React Hook Form + Zod for forms, Ant Design for complex controls, and Tailwind utility classes for layout-level styling.
