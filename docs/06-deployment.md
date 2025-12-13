# Deployment (Portable Chef Vic Brain)

## Target
Portable Linux mini PC running Docker Compose.

## Install Steps (High Level)
- Install OS + updates
- Install Docker Engine + Compose v2
- Clone repo
- Configure .env for Victor's environment
- docker compose up -d
- Run migrations
- Verify /health endpoint
- Access UI at http://chefvic.local

## Backups
- Nightly DB backups are written to:
  /var/chefvic/backups (or mounted Vault share)
- Rotations:
  - 7 daily
  - 4 weekly
  - 12 monthly

## Restore Drill
We maintain a documented restore procedure and test it monthly.
