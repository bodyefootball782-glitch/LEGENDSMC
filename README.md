# LEGENDS MC Website

Responsive Minecraft server website with:
- Video hero background
- Live server online/offline and player count
- Configurable whitelist count
- TikTok and Discord links
- Application forms sent to a Discord webhook
- Store order forms with Money / Points payment choice
- Four owner cards

## Requirements
- Node.js 18+
- A reachable Minecraft server address
- Two Discord webhook URLs (one for applications, one for store requests)

## Setup
1. Install Node.js 18 or newer.
2. Extract this folder and open a terminal inside it.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put the two Discord webhook URLs in `.env`.
6. Edit `config.json` (see below).
7. Put your background video at `public/assets/background.mp4`.
8. Add owner photos at `public/assets/owner1.png` through `owner4.png`.
9. Run `npm start` and open `http://localhost:3000`.

## Server settings
In `config.json`:
- `type`: use `bedrock` or `java`
- `host`: server address without `https://`
- `port`: Bedrock commonly uses 19132; Java commonly uses 25565
- `whitelistCount`: manually set this number; it is displayed on the site
- Set Discord and TikTok links.
- Set owner names and the first two owners' website links.
- Set each store item's `moneyPrice` and `pointsPrice`.

The live status/player count is queried from the Minecraft server every 30 seconds. If the server blocks status/ping queries or the host/port is incorrect, the site will show OFFLINE. The whitelist count is intentionally manually configurable in `config.json`, as requested.

## Security
- Keep `.env` private. Never put Discord webhook URLs in frontend files.
- Use HTTPS in production.
- Do not collect passwords or payment-card details through these forms.
- Store requests are requests for staff review; they do not charge money automatically.
- Only request information needed to process applications/orders. Consider whether a phone number is necessary before publishing the form.
