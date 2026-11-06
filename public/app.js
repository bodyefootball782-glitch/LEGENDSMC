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
  $("#serverIp").textContent=`${siteConfig.server.host}:${siteConfig.server.port}`;
  document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>showOrder(b.dataset.buy)));
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadStatus(){
  try{const r=await fetch("/api/status");const s=await r.json();$("#statusDot").classList.toggle("offline",!s.online);$("#statusText").textContent=s.online?"SERVER ONLINE":"SERVER OFFLINE";$("#playerCount").textContent=`${s.playersOnline} / ${s.playersMax} PLAYERS`;$("#whitelistCount").textContent=`${s.whitelistCount} WHITELISTED`;}
  catch{$("#statusDot").classList.add("offline");$("#statusText").textContent="STATUS UNAVAILABLE";}
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
$("#copyIp").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(`${siteConfig.server.host}:${siteConfig.server.port}`);$("#copyIp span").textContent="✓ COPIED";}catch{$("#copyIp span").textContent="COPY FAILED";}});
$("#year").textContent=new Date().getFullYear();
loadConfig().then(loadStatus).catch(()=>{$("#statusText").textContent="CONFIG ERROR";});
setInterval(loadStatus,30000);