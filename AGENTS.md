# Repository Guidelines

## Project Structure & Module Organization
- `bridge/` — Node/TypeScript backend with Alexa Skill handlers, mock ticket generator, Socket.IO hub, and inventory store. Entry: `src/server.ts`; env config in `src/config.ts`.
- `station-ui/` — Vite + React station dashboard. Tickets stream over WebSocket; components in `src/` (`App.tsx`, `PrepOrderView.tsx`). Static assets in `public/`.
- `StationItemMap.json` — menu-to-station map for the mock generator; keep station IDs in sync with menu changes.
- `voice-expo/` — demo scaffolding that mirrors bridge + UI; prioritize changes in `bridge/` and `station-ui/` first.
- Docs: `ProductRequirements.md`, `VictorsMenu.md`, `Hardware.md`, `TODO.md` (open tasks).

## Setup, Build, and Run
- Install deps once: `npm install` in `bridge/` and `station-ui/`.
- Bridge dev server: `npm run dev` (nodemon + ts-node, default 8080; set `PORT=8787` to match UI). Prod: `npm run build` then `npm start`.
- UI dev: `npm run dev` in `station-ui/` (Vite, port 5173). Build: `npm run build`; preview: `npm run preview`.
- Mock feed: POST `http://localhost:8787/mock/start` to stream tickets; `/mock/stop` to pause; `/mock/ticket` for one-off.
- Alexa webhook: POST Skill traffic to `http://<bridge-host>:<port>/alexa` (ask-sdk express adapter).

## Coding Style & Naming Conventions
- TypeScript: 2-space indent; prefer `const`; narrow types; keep shared contracts in `bridge/src/events` and `bridge/src/stations/types.ts`. Reuse station enums in UI over string literals.
- React: functional components, PascalCase files in `src/`; avoid new inline styles—prefer small CSS modules or utility classes in `index.css`.
- Environment: `.env` in `bridge` (`PORT`, `CORS_ORIGIN`); never commit secrets. Tighten CORS outside local dev.

## Testing Guidelines
- No formal suite yet. Add targeted tests with changes:
  - Bridge: Jest/Vitest under `bridge/src/**/__tests__/` for ticket store, inventory, Alexa handlers.
  - UI: Vitest + React Testing Library in `station-ui/src/__tests__/`.
- Keep mock generator deterministic in tests (seed or fixed timestamps).

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`). Scopes: `bridge`, `ui`, `alexa`, `mock`.
- PR checklist: what/why, screenshots or GIF for UI, sample Skill request/response for Alexa changes, test plan (`npm run build`, plus any added tests), note env/config changes (ports, `.env` keys, StationItemMap updates).

## Security & Configuration Tips
- Treat webhook endpoints as external-facing; validate incoming Alexa requests before production (signature verification still TBD). Avoid enabling mock routes outside dev.
- Log filtering: scrub customer identifiers before persisting; rotate logs if you enable file logging. Keep CORS restricted in staging/production.
