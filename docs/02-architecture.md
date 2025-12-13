# Architecture

## Components
1. Chef Vic Brain (portable Linux mini PC)
   - Runs Docker Compose services:
     - API
     - Database
     - Web UI
     - (optional) Integration worker
2. Clients (any device)
   - Access via browser: http://chefvic.local
   - No local installs required on restaurant computers
3. Optional: Chef Vic Vault (storage)
   - Stores backups, snapshots, files/logs
   - Can be separate NAS/storage box or attached storage

## Network Model
- Chef Vic services are reachable on local LAN only
- Clients connect via Wi-Fi/Ethernet on-site
- Remote admin access is via secure method (VPN/tunnel), not open internet ports

## Why web-first?
- Works on old Windows devices without WSL
- Tablet/phone friendly
- Native apps can be layered later for barcode/voice/background features
