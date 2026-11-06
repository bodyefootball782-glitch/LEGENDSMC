require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { statusBedrock, statusJava } = require("minecraft-server-util");
const config = require("./config.json");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(express.static("public"));
app.use("/api/", rateLimit({ windowMs: 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false }));

const clean = (v, max = 1000) => String(v ?? "").trim().slice(0, max);
const sendWebhook = async (url, title, fields) => {
  if (!url) throw new Error("Webhook is not configured on the server.");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "LEGENDS MC Website",
      embeds: [{ title, color: 0x55c9ff, fields: fields.map(([name, value]) => ({
        name: clean(name, 256), value: clean(value || "—", 1000), inline: false
      })), footer: { text: "LEGENDS MC • Website requests" }, timestamp: new Date().toISOString() }]
    })
  });
  if (!response.ok) throw new Error("Discord webhook request failed.");
};

app.get("/api/config", (_req, res) => {
  res.json({
    server: {
      name: config.server.name,
      discordInvite: config.server.discordInvite,
      tiktokUrl: config.server.tiktokUrl,
      whitelistCount: Number(config.server.whitelistCount || 0)
    },
    owners: config.owners,
    store: config.store
  });
});

app.get("/api/status", async (_req, res) => {
  try {
    const opts = { timeout: 5000 };
    const result = config.server.type === "java"
      ? await statusJava(config.server.host, Number(config.server.port), opts)
      : await statusBedrock(config.server.host, Number(config.server.port), opts);
    res.json({
      online: true,
      playersOnline: Number(result.players?.online || 0),
      playersMax: Number(result.players?.max || 0),
      whitelistCount: Number(config.server.whitelistCount || 0)
    });
  } catch {
    res.json({
      online: false, playersOnline: 0, playersMax: 0,
      whitelistCount: Number(config.server.whitelistCount || 0)
    });
  }
});

app.post("/api/application", async (req, res) => {
  const b = req.body || {};
  const required = ["category", "name", "age", "discordExperience", "minecraftExperience", "device", "phone", "city", "rules", "goal"];
  if (required.some(k => !clean(b[k], 3000)) || b.joinedDiscord !== true) {
    return res.status(400).json({ error: "Please complete all fields and confirm that you joined Discord." });
  }
  try {
    await sendWebhook(process.env.APPLICATION_WEBHOOK_URL, "📝 New server application", [
      ["Application type", b.category], ["Name", b.name], ["Age", b.age],
      ["Discord experience", b.discordExperience], ["Minecraft experience", b.minecraftExperience],
      ["Device", b.device], ["Phone", b.phone], ["Governorate", b.city],
      ["Will you respect the rules?", b.rules], ["Will you help make the server number one?", b.goal],
      ["Discord joined", "Confirmed"]
    ]);
    res.json({ ok: true });
  } catch (e) { res.status(503).json({ error: e.message }); }
});

app.post("/api/order", async (req, res) => {
  const b = req.body || {};
  const required = ["product", "name", "phone", "discordUser", "payment"];
  if (required.some(k => !clean(b[k], 1000)) || !["money", "points"].includes(b.payment)) {
    return res.status(400).json({ error: "Please complete all order fields." });
  }
  const item = config.store.find(x => x.id === b.product);
  if (!item) return res.status(400).json({ error: "Unknown store item." });
  try {
    await sendWebhook(process.env.STORE_WEBHOOK_URL, "🛒 New store order request", [
      ["Product", item.name], ["Customer name", b.name], ["WhatsApp phone", b.phone],
      ["Discord username", b.discordUser], ["Payment method", b.payment === "money" ? "Money" : "Points"],
      ["Listed price", b.payment === "money" ? item.moneyPrice : `${item.pointsPrice} points`]
    ]);
    res.json({ ok: true });
  } catch (e) { res.status(503).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`LEGENDS MC website running at http://localhost:${PORT}`));