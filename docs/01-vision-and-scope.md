# Chef Vic: Vision & Scope (Gen-1)

## Goal
Chef Vic is a local-first kitchen support system that helps a restaurant:
- Maintain inventory (items, units, vendors, par levels)
- Auto-generate prep lists and ordering lists
- Keep data locally owned and controlled
- Provide a device-agnostic web UI usable on Windows/macOS/Linux/iOS/Android

## Gen-1 Non-Goals
- No cloud dependency required to operate
- No LLM/AI features required for Gen-1
- No native mobile app required for Gen-1 (web-first)
- No deep POS vendor lock-in (Toast integration should be modular)

## Guiding Principles
- Local-first: the kitchen owns the data
- Simple deployment: one portable "Chef Vic Brain" device
- Repeatable environments: Docker Compose is the default
- Safe testing: mock Toast payloads + deterministic seed data (no production dumps in git)
