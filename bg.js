/* Katie Designs — animated "Starry Night" homage (procedural, drawn from scratch).
   Order: flow-field sky dabs -> central swirl -> stars -> crescent moon ->
   hills -> village -> cypress. Then hold (stars pulse), fade, repaint.
   Reduced motion: static finished painting. Paused when tab hidden.
   Preview: add ?bgt=<seconds> to the URL to jump ahead. */
(()=>{const c=document.getElementById("bg");if(!c)return;const x=c.getContext("2d");
const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
const RATE=150; // items (dabs) per second
let W,H,S,dpr,items=[],stars=[],i=0,acc=0,state="paint",timer=0,raf=0,seed=11,last=0;
const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;},R=(a,b)=>a+(b-a)*rnd(),pick=a=>a[Math.floor(rnd()*a.length)];
const SKY=["#1F3A93","#1a3287","#24479f","#2f5bb8","#173078","#2b6aa8","#3a78b5","#1d4f8f","#123063","#4a7cc4"];
const LIGHT=["#8fb3e0","#a9c8ea","#cfe0f2","#6f9bd6","#e8dc9a"];
const GOLD=["#C9A227","#f1cf5b","#f6e27a","#e8b923","#fff1a8"];
const HILL=["#0c1f5c","#12286e","#0a1a4a","#1a3a7a","#173070"];
const CYP=["#06100f","#0b1a17","#0a1530","#13261f","#0f1f3d","#1c3326"];
let V=[]; // vortices
function flow(px,py){let vx=1,vy=.45*Math.sin(px*7+py*4)+.25*Math.sin(py*13);
 for(const v of V){const dx=(px-v.x)*W/S,dy=(py-v.y)*H/S,d=Math.hypot(dx,dy)+1e-4,f=v.s*Math.exp(-d/v.r);vx+=-dy/d*f;vy+=dx/d*f;}
 return Math.atan2(vy,vx);}
const dab=(px,py,a,len,w,col,al,bend)=>items.push({t:"d",px,py,a,len,w,col,al,bend:bend??R(-.35,.35)});
function build(){items=[];stars=[];
 const mob=W<H;
 const SW={x:mob?.5:.47,y:.3};
 const starPos=mob?[[.1,.1],[.3,.06],[.55,.12],[.82,.32],[.2,.36],[.7,.48],[.92,.52],[.42,.5],[.12,.55],[.62,.07]]
  :[[.06,.12],[.2,.08],[.34,.2],[.58,.1],[.72,.24],[.9,.42],[.12,.36],[.66,.45],[.8,.08],[.42,.5]];
 V=[{x:SW.x-.06,y:SW.y,s:2.6,r:.07},{x:SW.x+.08,y:SW.y+.03,s:-2.2,r:.065}];
 starPos.forEach(([sx,sy])=>V.push({x:sx,y:sy,s:1.4,r:.03}));
 const horizon=.66, step=S/34;
 // 1. sky dabs following the flow field (scan in loose diagonal order)
 const sky=[];for(let yy=0;yy<horizon*H+step;yy+=step*.8)for(let xx=-step;xx<W+step;xx+=step){const px=(xx+R(-.4,.4)*step)/W,py=(yy+R(-.4,.4)*step)/H;
   const nearStar=starPos.some(([a,b])=>Math.hypot((px-a)*W,(py-b)*H)<S*.06);
   sky.push([px,py,nearStar?(rnd()<.5?pick(LIGHT):pick(SKY)):(rnd()<.12?pick(LIGHT):pick(SKY))]);}
 sky.sort((a,b)=>(a[1]+a[0]*.3)-(b[1]+b[0]*.3)+R(-.05,.05));
 for(const[px,py,col]of sky)dab(px,py,flow(px,py),step*R(1.1,1.7),step*R(.45,.6),col,.85);
 // 2. central double swirl
 [[SW.x-.06,SW.y,1],[SW.x+.08,SW.y+.03,-1]].forEach(([cx,cy,dir])=>{for(let r=.012;r<.1;r+=.009)for(let t=0;t<6.28;t+=.5/(r*30)){
   const px=cx+Math.cos(t)*r*S/W,py=cy+Math.sin(t)*r*S/H;dab(px,py,t+dir*1.57,S*.035,S*.012,rnd()<.6?pick(LIGHT):pick(SKY),.85,dir*.4);}});
 // 3. stars: glowing concentric swirling rings
 starPos.forEach(([sx,sy],k)=>{const big=k%3===0?1.4:1;stars.push({sx,sy,big});items.push({t:"g",sx,sy,r:S*.045*big});
   for(let ring=4;ring>=1;ring--){const r=ring*.011*big;for(let t=R(0,1);t<6.28;t+=.55/ring){const px=sx+Math.cos(t)*r*S/W,py=sy+Math.sin(t)*r*S/H;
     dab(px,py,t+1.57,S*.022*big,S*.009*big,ring<=2?pick(GOLD):(rnd()<.5?pick(GOLD):pick(LIGHT)),.9,.5);}}
   items.push({t:"c",sx,sy,r:S*.008*big});});
 // 4. crescent moon + halo
 const mx=mob?.8:.88,my=.13,mr=.05;items.push({t:"g",sx:mx,sy:my,r:S*.13});
 for(let ring=4;ring>=2;ring--)for(let t=0;t<6.28;t+=.32/ring*2){const r=mr*(1+ring*.28);dab(mx+Math.cos(t)*r*S/W,my+Math.sin(t)*r*S/H,t+1.57,S*.03,S*.011,ring%2?pick(GOLD):"#f6e27a",.75,.4);}
 for(let k=0;k<180;k++){const t=R(0,6.28),rr=Math.sqrt(rnd())*mr,px=Math.cos(t)*rr,py=Math.sin(t)*rr;if(Math.hypot(px+mr*.45,py-mr*.2)<mr*.85)continue;
   dab(mx+px*S/W,my+py*S/H,t+1.57,S*.02,S*.012,pick(GOLD),.95,.3);}
 // 5. rolling hills
 const ridge=xx=>horizon+.04*Math.sin(xx*5+1)+.025*Math.sin(xx*11+2);
 items.push({t:"p",pts:[[0,1]].concat(Array.from({length:41},(_,k)=>[k/40,ridge(k/40)])).concat([[1,1]]),col:"#0a1a4a",al:.95});
 for(let yy=0;yy<.36;yy+=.025)for(let xx=-.02;xx<1.02;xx+=step/W*1.1){const py=ridge(xx)+yy+R(-.01,.01);if(py>1)continue;
   const sl=Math.atan2(ridge(xx+.01)-ridge(xx),.01)*H/W;dab(xx,py,sl+R(-.2,.2),step*R(1.2,1.8),step*.5,yy<.03&&rnd()<.4?"#2f5bb8":pick(HILL),.8,R(-.3,.3));}
 // 6. village with church spire and gold windows
 const vy=mob?.86:.84;for(let k=0;k<(mob?9:16);k++){const hx=R(.3,.95),hw=R(.02,.04)*(mob?1.5:1),hh=R(.02,.035),by=vy+R(-.02,.05);
   items.push({t:"p",pts:[[hx,by],[hx,by-hh],[hx+hw/2,by-hh-hw*.6*W/H*.5],[hx+hw,by-hh],[hx+hw,by]],col:pick(["#0b1838","#101f48","#0d1a3f"]),al:1});
   if(rnd()<.8)items.push({t:"r",x:hx+hw*R(.2,.6),y:by-hh*R(.4,.7),w:S*.006,h:S*.007,col:pick(GOLD)});}
 const cx=mob?.58:.56;items.push({t:"p",pts:[[cx,vy+.04],[cx,vy-.03],[cx+.006,vy-.03],[cx+.012,vy-.17],[cx+.018,vy-.03],[cx+.024,vy-.03],[cx+.024,vy+.04]],col:"#091532",al:1});
 items.push({t:"r",x:cx+.009,y:vy-.01,w:S*.006,h:S*.008,col:"#f1cf5b"});
 // 7. cypress: dark flame drawn with upward curving strokes
 const kx=mob?.14:.13,top=.18,wid=y=>{const t=(y-top)/(1-top);return Math.max(0,.055*Math.sin(Math.min(1,t*1.15)*Math.PI*.55)*(1.1-t*.3))*(mob?1.6:1);};
 const outline=[];for(let k=0;k<=30;k++){const y=top+(1-top)*k/30;outline.push([kx-wid(y)+.008*Math.sin(y*30),y]);}
 for(let k=30;k>=0;k--){const y=top+(1-top)*k/30;outline.push([kx+wid(y)+.008*Math.sin(y*27+1),y]);}
 items.push({t:"p",pts:outline,col:"#071211",al:.95});
 for(let y=1.02;y>top;y-=.012)for(let k=0;k<4;k++){const w=wid(y),px=kx+R(-w,w)*.9;if(!w)continue;
   dab(px,y,-1.57+R(-.35,.35)+(px-kx)*6,S*R(.05,.08),S*.014,pick(CYP),.95,R(-.6,.6));}
}
function draw(it){x.globalAlpha=1;
 if(it.t==="d"){const cx=it.px*W,cy=it.py*H,ca=Math.cos(it.a),sa=Math.sin(it.a),h=it.len/2,nx=-sa,ny=ca,n=6;
   x.lineCap="round";for(let b=0;b<n;b++){const o=(b/(n-1)-.5)*it.w;x.strokeStyle=it.col;x.globalAlpha=it.al*(.55+.45*rnd());x.lineWidth=Math.max(1,it.w/n*1.9);
     const x0=cx-ca*h*(.8+.2*rnd())+nx*o,y0=cy-sa*h+ny*o,x2=cx+ca*h*(.8+.2*rnd())+nx*o*.6,y2=cy+sa*h+ny*o*.6;
     x.beginPath();x.moveTo(x0,y0);x.quadraticCurveTo(cx+nx*(o+it.bend*it.len*.5),cy+ny*(o+it.bend*it.len*.5),x2,y2);x.stroke();}}
 else if(it.t==="g"){const cx=it.sx*W,cy=it.sy*H,g=x.createRadialGradient(cx,cy,0,cx,cy,it.r);g.addColorStop(0,"rgba(255,235,150,.55)");g.addColorStop(.4,"rgba(241,207,91,.18)");g.addColorStop(1,"rgba(241,207,91,0)");x.fillStyle=g;x.fillRect(cx-it.r,cy-it.r,it.r*2,it.r*2);}
 else if(it.t==="c"){x.fillStyle="#fff6c8";x.beginPath();x.arc(it.sx*W,it.sy*H,it.r,0,7);x.fill();}
 else if(it.t==="p"){x.globalAlpha=it.al;x.fillStyle=it.col;x.beginPath();it.pts.forEach(([a,b],k)=>k?x.lineTo(a*W,b*H):x.moveTo(a*W,b*H));x.closePath();x.fill();}
 else if(it.t==="r"){x.fillStyle=it.col;x.fillRect(it.x*W,it.y*H,it.w,it.h);}
 x.globalAlpha=1;}
function start(){x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle="#030a1f";x.fillRect(0,0,W,H);build();i=0;acc=0;state="paint";timer=0;}
function size(){dpr=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;S=Math.min(W,H);c.width=W*dpr;c.height=H*dpr;c.style.width=W+"px";c.style.height=H+"px";start();if(still){while(i<items.length)draw(items[i++]);}}
function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min(.1,last?(now-last)/1000:0);last=now;
 if(state==="paint"){acc+=dt*RATE;while(acc>=1&&i<items.length){draw(items[i++]);acc--;}if(i>=items.length){state="hold";timer=0;}}
 else if(state==="hold"){timer+=dt;if(Math.floor(timer*4)!==Math.floor((timer-dt)*4)){const s=stars[Math.floor(rnd()*stars.length)];if(s)draw({t:"g",sx:s.sx,sy:s.sy,r:S*.03*s.big});} // gentle twinkle
   if(timer>12){state="fade";timer=0;}}
 else if(state==="fade"){x.globalAlpha=Math.min(1,dt*1.2);x.fillStyle="#030a1f";x.fillRect(0,0,W,H);x.globalAlpha=1;timer+=dt;if(timer>3){seed=Math.floor(R(1,1e6));start();}}}
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(size,200);});
size();
const ff=+new URLSearchParams(location.search).get("bgt");
if(ff&&!still){let n=Math.floor(ff*RATE);while(n-->0&&i<items.length)draw(items[i++]);}
if(!still){raf=requestAnimationFrame(frame);document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(frame);});}
})();
