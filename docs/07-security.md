# Security Model (Gen-1)

## Local-Only Default
- Services bind to LAN only (or firewall to local subnet)
- No inbound internet ports required

## Auth
- Role-based accounts:
  - owner
  - manager
  - staff
- Sessions stored securely (http-Only cookies if web-based auth)

## Secrets
- Toast tokens and credentials are stored in environment variables
- No secrets committed to git
- Use .env.example with placeholders

## Remote Support
Preferred:
- VPN (e.g. Tailscale) with allowlist
or
- authenticated tunnel endpoint (only if needed)

SSH:
- key-based only
- LAN-only by default
- no password auth
