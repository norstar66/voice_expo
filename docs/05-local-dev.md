# Local Development

## Prereqs
- Docker + Docker Compose v2
- Node (LTS)
- Git

## Start Dev Stack
1) Copy env
   `cp .env.example .env`

2) Start services
   `docker compose up -d`

3) Run migrations + seed
   `npm run db:migrate`
   `npm run db:seed`

4) Start API + Web
   `npm run dev`

## Reset Dev DB
This drops and recreates the dev database, applies migrations, seeds baseline data:
  `npm run db:reset`

## Toast Mock Testing
- Fixtures are stored in /fixtures/toast
- Integration tests should run against fixtures first:
  `npm run test:toast-fixtures`
