# Repo Structure (Current + Split-ready)

## Current Layout
- bridge/      : Node.js + Express + Socket.IO backend
- station-ui/  : React + Vite frontend
- *.md         : product notes, hardware notes, requirements, TODOs
- StationItemMap.json : station/item routing config used by the system

This is a monorepo. It works well for Gen-1 because changes often span backend + frontend.

## Split-ready Rules (starting now)
1) Keep backend-only code inside `bridge/`
2) Keep frontend-only code inside `station-ui/`
3) Any shared “contracts” (types, schemas, event names, payloads) should move into:
   - a new folder: `shared/` (or `packages/shared/` later)
4) Toast integration should be isolated behind an adapter layer in `bridge/`:
   - `bridge/src/integrations/toast/*`
   - (later extractable to its own package/repo)

## Suggested Near-Term Additions
- docs/               : formal system documentation
- fixtures/toast/      : mock Toast payloads (JSON) for deterministic testing
- scripts/             : backup/restore/reset scripts
- docker-compose.yml   : dev/prod parity
- .env.example         : safe config template

## When to split repos later
Split only when we need independent releases or separate teams.
If we follow the split-ready rules above, extraction will be straightforward.

