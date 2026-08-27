# Stubfolio - frontend

React 19 + TypeScript 6 + Vite single-page app for [Stubfolio](../README.md). Talks to the
Django REST API over `fetch`, using a token kept in `localStorage`.

## Stack

- **React 19** with **react-router 7**
- **TypeScript 6** - bundler module resolution, `noUnusedLocals` / `noUnusedParameters`
- **Vite** for dev server and build
- **Tailwind CSS 4** via `@tailwindcss/vite`, with design tokens in `src/index.css`
- **framer-motion** for interaction polish, **react-select** for the year/country filters

## Run it

```bash
cp .env.example .env      # VITE_API_URL defaults to http://localhost:8000
npm install
npm run dev               # http://localhost:5173 - open /signup
```

Requires **Node 20.19+ or 22.12+**. Make sure the [backend](../backend) is running first.

## Scripts

| Command           | Does                                       |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with HMR         |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally         |
| `npm run lint`    | ESLint                                     |

## Layout

```
src/
├── pages/
│   ├── LoginPage.tsx        # token auth → localStorage
│   ├── SignupPage.tsx
│   ├── AddConcertPage.tsx   # artist search → setlist browse → import
│   ├── MyCollectionPage.tsx # the collection grid + generate/remove
│   └── ConcertDetailPage.tsx  # placeholder
├── components/
│   └── Navbar.tsx
└── App.tsx                  # routes
```

## Deployment

Deployed on Vercel. `vercel.json` rewrites all paths to `index.html` so client-side routing
works on refresh. Set `VITE_API_URL` in the Vercel project to the deployed API URL.
