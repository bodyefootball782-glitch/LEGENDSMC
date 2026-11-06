const $ = (s) => document.querySelector(s);
let siteConfig = null;
const modal = $("#modal"), orderModal = $("#orderModal");
const openModal = (el) => { el.classList.add("open"); el.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden"; };
const closeModals = () => { document.querySelectorAll(".modal").forEach(m=>{m.classList.remove("open");m.setAttribute("aria-hidden","true")});document.body.style.overflow=""; };
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",closeModals));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModals()});
async function loadConfig(){
  const r=await fetch("/api/config"); siteConfig=await r.json();
  $("#navDiscord").href=siteConfig.server.discordInvite;$("#discordCard").href=siteConfig.server.discordInvite;$("#tiktokCard").href=siteConfig.server.tiktokUrl;
  $("#whitelistCount").textContent=`${siteConfig.server.whitelistCount} WHITELISTED`;
  $("#storeGrid").innerHTML=siteConfig.store.map((p,i)=>`<article class="store-card"><div class="store-icon">${["✦","⌂","◇","◈","♧"][i%5]}</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="price-line">MONEY: <b>${esc(p.moneyPrice)}</b><br>POINTS: <b>${Number(p.pointsPrice)||0}</b></div><button class="buy-btn" data-buy="${esc(p.id)}">BUY NOW ↗</button></article>`).join("");
  $("#ownersGrid").innerHTML=siteConfig.owners.map(o=>`<article class="owner-card"><img src="/${esc(o.image)}" alt="${esc(o.name)}" onerror="this.style.opacity='.15'"><h3>${esc(o.name)}</h3>${o.showMoreInfo&&o.website?`<a href="${esc(o.website)}" target="_blank" rel="noreferrer">MORE INFO ↗</a>`:""}</article>`).join("");
  const s = siteConfig.server;
  const portText = s.type === "java" ? s.javaPort : s.type === "bedrock" ? s.bedrockPort : `Java ${s.javaPort} / Bedrock ${s.bedrockPort}`;
  $("#serverIp").textContent = `${s.host}:${portText}`;
  document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>showOrder(b.dataset.buy)));
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadStatus(){
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    if (!r.ok) throw new Error("Status unavailable");
    const s = await r.json();
    const active = [s.java, s.bedrock].filter(x => x && x.online);
    const anyOnline = active.length > 0;
    $("#statusDot").classList.toggle("offline", !anyOnline);
    $("#statusText").textContent = anyOnline ? "SERVER ONLINE" : "SERVER OFFLINE";
    $("#javaCount").textContent = s.java?.online ? `JAVA: ${s.java.playersOnline}/${s.java.playersMax}` : "JAVA: OFFLINE";
    $("#bedrockCount").textContent = s.bedrock?.online ? `BEDROCK: ${s.bedrock.playersOnline}/${s.bedrock.playersMax}` : "BEDROCK: OFFLINE";
    $("#whitelistCount").textContent = `${s.whitelistCount} WHITELISTED`;
  } catch {
    $("#statusDot").classList.add("offline");
    $("#statusText").textContent = "STATUS UNAVAILABLE";
    $("#javaCount").textContent = "JAVA: --";
    $("#bedrockCount").textContent = "BEDROCK: --";
  }
}

document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{ $("#applicationCategory").value=b.dataset.category;$("#modalTitle").textContent=b.dataset.category.toUpperCase();$("#applicationMessage").textContent="";openModal(modal); }));
$("#applicationForm").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.currentTarget, data=Object.fromEntries(new FormData(f));data.joinedDiscord=f.joinedDiscord.checked;
  const msg=$("#applicationMessage"),btn=f.querySelector("button[type=submit]");btn.disabled=true;msg.textContent="SENDING...";
  try{const r=await fetch("/api/application",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(j.error||"Could not send.");msg.textContent="✓ Application sent successfully!";f.reset();}
  catch(err){msg.textContent=err.message;}finally{btn.disabled=false;}
});
function showOrder(id){const p=siteConfig.store.find(x=>x.id===id);if(!p)return;$("#orderProductId").value=id;$("#orderProduct").textContent=`${p.name} — Money: ${p.moneyPrice} | Points: ${p.pointsPrice}`;$("#orderMessage").textContent="";$("#paymentMethod").value="money";document.querySelectorAll("[data-payment]").forEach(b=>b.classList.toggle("selected",b.dataset.payment==="money"));openModal(orderModal);}
document.querySelectorAll("[data-payment]").forEach(b=>b.addEventListener("click",()=>{$("#paymentMethod").value=b.dataset.payment;document.querySelectorAll("[data-payment]").forEach(x=>x.classList.toggle("selected",x===b));}));
$("#orderForm").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget,btn=f.querySelector("button[type=submit]"),msg=$("#orderMessage");btn.disabled=true;msg.textContent="SENDING...";try{const r=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(f)))});const j=await r.json();if(!r.ok)throw Error(j.error||"Could not send.");msg.textContent="✓ Order request sent to the store team!";f.reset();}catch(err){msg.textContent=err.message;}finally{btn.disabled=false;}});
$("#copyIp").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(`${siteConfig.server.host} | Java: ${siteConfig.server.javaPort} | Bedrock: ${siteConfig.server.bedrockPort}`);$("#copyIp span").textContent="✓ COPIED";}catch{$("#copyIp span").textContent="COPY FAILED";}});
$("#year").textContent=new Date().getFullYear();
loadConfig().then(loadStatus).catch(()=>{$("#statusText").textContent="CONFIG ERROR";});
setInterval(loadStatus,30000);
// The visitor gesture unlocks music playback on mobile and desktop browsers.
const entryScreen = $("#entryScreen");
const siteMusic = $("#siteMusic");
const enterButton = $("#enterSite");
const musicToggle = $("#musicToggle");
let musicPlaying = false;
if (siteMusic) {
  siteMusic.volume = 0.38;
  siteMusic.muted = false;
  siteMusic.addEventListener("error", () => {
    const hint = $("#entryHint");
    if (hint && document.body.classList.contains("site-locked")) hint.textContent = "ADD YOUR MUSIC FILE: public/assets/music.mp3";
  });
}
enterButton?.addEventListener("click", async () => {
  enterButton.disabled = true;
  enterButton.querySelector("span").textContent = "…";
  try {
    await siteMusic.play();
    musicPlaying = true;
    musicToggle.hidden = false;
    musicToggle.innerHTML = "♫ <span>MUSIC ON</span>";
    musicToggle.setAttribute("aria-label", "Mute music");
  } catch {
    const hint = $("#entryHint");
    if (hint) hint.textContent = "SITE OPENED • ADD MUSIC FILE TO ENABLE SOUND";
    musicToggle.hidden = false;
    musicToggle.innerHTML = "♫ <span>MUSIC OFF</span>";
  }
  document.body.classList.remove("site-locked");
  entryScreen?.classList.add("leaving");
  window.setTimeout(() => entryScreen?.remove(), 900);
});
musicToggle?.addEventListener("click", async () => {
  if (!siteMusic) return;
  if (musicPlaying) {
    siteMusic.pause();
    musicPlaying = false;
    musicToggle.innerHTML = "♫ <span>MUSIC OFF</span>";
    musicToggle.setAttribute("aria-label", "Play music");
  } else {
    try {
      await siteMusic.play();
      musicPlaying = true;
      musicToggle.innerHTML = "♫ <span>MUSIC ON</span>";
      musicToggle.setAttribute("aria-label", "Mute music");
    } catch {
      musicToggle.innerHTML = "♫ <span>NO MUSIC FILE</span>";
    }
  }
});
