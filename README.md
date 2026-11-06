# LEGENDS MC — Vercel-ready website

Responsive Minecraft Java + Bedrock server website with an animated entry screen, click-to-start background music, muted video background, community links, store, applications, owners, and live server status checks.

## Add your media
- Background video: `public/assets/background.mp4`
- Background music: `public/assets/music.mp3` (create this file; MP3 is recommended)
- Owner photos: `public/assets/owner1.png` through `owner4.png`

The entry button is the required user gesture that allows browsers and phones to start music. The video is always muted; only `music.mp3` plays audio. Visitors can mute/unmute using the floating music control.

## Configure the server
Edit `config.json`:
- `type`: `both`, `java`, or `bedrock`
- `host`: server address only (no protocol)
- `javaPort`: Java query port (commonly 25565)
- `bedrockPort`: Bedrock UDP port (commonly 19132)
- `whitelistCount`: manually editable count
- Discord/TikTok links, owners, and store prices

Java and Bedrock are checked independently. Cross-play requires the Minecraft server itself to be configured for it (for example, Geyser for Bedrock access to a Java server); the website cannot enable cross-play by itself.

## Deploy on Vercel
1. Upload the contents of this folder to your GitHub repository (the `api/` folder (including `[...path].js`) and `vercel.json` must be at the repository root).
2. Import or reconnect that repository in Vercel.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `APPLICATION_WEBHOOK_URL`
   - `STORE_WEBHOOK_URL`
4. Add the real Discord webhook URLs only in Vercel Environment Variables. Never commit them to GitHub or send them in chat.
5. Redeploy after adding environment variables.

## Local run
- Node.js 18+
- `npm install`
- Copy `.env.example` to `.env` and fill the two webhook values locally.
- `npm start`

## Notes
- The site does not process payments; store submissions are requests sent to staff.
- The public status endpoint may report offline if the Minecraft host blocks status pings or the address/ports are not final.
- Use a reasonably compressed H.264 MP4 video for smooth mobile loading. Keep a sensible video size and provide a poster image if available.
