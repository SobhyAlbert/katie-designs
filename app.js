const CATS=["all","portraits","landscapes","sketches","digital","painting"];
const COLORS={portraits:["#c9a38f","#6e4a3a"],landscapes:["#9cc3c9","#3c6e57"],sketches:["#e5e1da","#8a8378"],digital:["#b48ce6","#3a7bd5"],painting:["#f2c27b","#b5523b"]};
const $=s=>document.querySelector(s);
function ph(a){const[c1,c2]=COLORS[a.category]||["#ddd","#999"];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="280" cy="150" r="70" fill="#fff" opacity=".18"/><path d="M0 380 Q120 300 220 370 T400 340 V500 H0Z" fill="#000" opacity=".12"/><text x="200" y="250" text-anchor="middle" font-family="Georgia" font-size="26" fill="#fff">${a.title}</text><text x="200" y="285" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff" opacity=".85">PLACEHOLDER · ${a.category}</text></svg>`;
 return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);}
const src=a=>a.image||ph(a); const sold=ARTWORKS.filter(a=>a.image!==null), soon=ARTWORKS.filter(a=>a.image===null), money=n=>SITE.currency+n;
function render(cat){$("#grid").innerHTML=sold.filter(a=>cat==="all"||a.category===cat).map(a=>`
<article class="card"><button class="thumb" data-view="${a.id}" aria-label="Enlarge ${a.title}"><img loading="lazy" src="${src(a)}" alt="${a.title} — ${a.category} artwork${a.image?"":" (placeholder photo)"}"></button>
<div class="body"><span class="tag">${a.category}</span><h3>${a.title}</h3><p style="margin:0;color:#666">${a.desc||""}</p>
${a.price?`<button class="btn" data-buy="${a.id}">Buy digital copy · ${money(a.price)}</button>`:""}</div></article>`).join("");}
$("#filters").innerHTML=CATS.map(c=>`<button aria-pressed="${c==="all"}" data-cat="${c}">${c[0].toUpperCase()+c.slice(1)}</button>`).join("");
document.addEventListener("click",e=>{const t=e.target.closest("[data-cat],[data-view],[data-buy],[data-close]");if(!t)return;
 if(t.dataset.cat){document.querySelectorAll("[data-cat]").forEach(b=>b.setAttribute("aria-pressed",b===t));render(t.dataset.cat);}
 if(t.dataset.view){const a=ARTWORKS.find(x=>x.id==t.dataset.view);$("#lb-img").src=src(a);$("#lb-img").alt=a.title;$("#lb-cap").textContent=`${a.title} — ${a.desc||""}`;$("#lb").showModal();}
 if(t.dataset.buy){const a=ARTWORKS.find(x=>x.id==t.dataset.buy);$("#buy-t").textContent=a.title;$("#buy-cat").textContent=a.category;$("#buy-price").textContent=money(a.price);$("#buy-go").href=a.checkout;$("#buy").showModal();}
 if(t.dataset.close!==undefined)t.closest("dialog").close();});
document.querySelectorAll("dialog").forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close();}));
render("all");
$("#soon-grid").innerHTML=soon.map(a=>`<article class="card" aria-label="Upcoming artwork slot"><div class="frame">${a.title}</div></article>`).join("");
$("#mail").href="mailto:"+SITE.formEmail;$("#mail").textContent=SITE.formEmail;$("#ig").href=SITE.instagram;$("#yr").textContent=new Date().getFullYear();
// Commission form: FormSubmit (AJAX) with mailto fallback
const f=$("#cform");f.action="https://formsubmit.co/"+SITE.formEmail;$("#deadline").min=new Date().toISOString().slice(0,10);
function err(id,msg){$("#"+id+"-err").textContent=msg;const el=$("#"+id);el.setAttribute("aria-invalid",!!msg);if(msg)el.setAttribute("aria-describedby",id+"-err");return !msg;}
f.addEventListener("submit",async e=>{e.preventDefault();let ok=true;
 ok&=err("name",f.name.value.trim()?"":"Please enter your name.");
 ok&=err("email",/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value)?"":"Please enter a valid email.");
 ok&=err("type",f.artwork_type.value?"":"Please choose an artwork type.");
 ok&=err("desc",f.description.value.trim().length>=10?"":"Please describe your idea (at least 10 characters).");
 ok&=err("deadline",!f.deadline.value||f.deadline.value>=f.deadline.min?"":"Deadline must be in the future.");
 ok&=err("budget",!f.budget.value||+f.budget.value>=0?"":"Budget must be a positive number.");
 if(!ok){f.querySelector("[aria-invalid=true]").focus();return;}
 const data=Object.fromEntries(new FormData(f));const btn=f.querySelector("button");btn.disabled=true;btn.textContent="Sending…";
 try{const r=await fetch("https://formsubmit.co/ajax/"+SITE.formEmail,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)});if(!r.ok)throw 0;}
 catch(_){const body=["name","email","artwork_type","size","description","deadline","budget"].map(k=>`${k}: ${data[k]||""}`).join("\n");
  location.href=`mailto:${SITE.formEmail}?subject=${encodeURIComponent("Commission request")}&body=${encodeURIComponent(body)}`;}
 f.hidden=true;$("#thanks").hidden=false;$("#thanks").focus();});
