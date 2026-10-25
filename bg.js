// Futuristic constellation background (blue + gold particles). Respects reduced motion.
(()=>{const c=document.getElementById("bg");if(!c)return;const x=c.getContext("2d");let w,h,p=[];
const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
function size(){w=c.width=innerWidth;h=c.height=innerHeight;const n=Math.min(90,Math.floor(w*h/16000));
p=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,g:Math.random()<.35}));}
function draw(){x.clearRect(0,0,w,h);for(const a of p){a.x=(a.x+a.vx+w)%w;a.y=(a.y+a.vy+h)%h;x.fillStyle=a.g?"rgba(241,207,91,.85)":"rgba(90,130,255,.85)";x.beginPath();x.arc(a.x,a.y,1.6,0,7);x.fill();}
for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){const d=Math.hypot(p[i].x-p[j].x,p[i].y-p[j].y);if(d<120){x.strokeStyle=`rgba(80,120,240,${.25*(1-d/120)})`;x.beginPath();x.moveTo(p[i].x,p[i].y);x.lineTo(p[j].x,p[j].y);x.stroke();}}
if(!still)requestAnimationFrame(draw);}
addEventListener("resize",size);size();draw();})();
