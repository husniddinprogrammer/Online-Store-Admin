# Store Admin SPA

React + Vite admin dashboard with React Router, React Query, Zustand, Axios, Tailwind CSS, Helmet, and i18next.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
```

The dev server runs on `http://localhost:3000`.

## Structure

```text
src/
  assets/
    messages/
    styles/
  components/
  hooks/
  i18n/
  layouts/
  pages/
    auth/
    dashboard/
  router/
  services/
  store/
  types/
  utils/
```

## Notes

- All app code now lives under `src/`.
- Route pages are lazy-loaded through React Router.
- Shared HTTP logic is centralized in `src/services/api.ts`.
- The app is a browser-routed SPA, so production hosting should rewrite unknown routes to `index.html`.
