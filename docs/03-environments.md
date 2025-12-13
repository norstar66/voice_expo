# Environments & Data Strategy

## Environments
- dev: your laptop/workstation
- staging: optional pre-prod test environment (often same as prod but isolated)
- prod: Victor's live system

We do NOT "branch the database". We branch code.
Databases are managed by migrations + seed/fixtures.

## What goes in Git
- Database schema migrations
- Seed data generators (deterministic)
- Mock Toast payload fixtures (JSON)
- Integration adapters and contract tests

## What does NOT go in Git
- Production DB dumps
- Any PII (customer names, phone numbers, addresses, etc.)
- Live Toast tokens/credentials

## Test Data Workflow
- `seed` creates predictable baseline data
- `fixtures` provide realistic Toast payload examples
- Optional "sanitized snapshot" export tool for debugging (encrypted file, never committed)
