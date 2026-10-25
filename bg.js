/* Katie Designs — animated brush-stroke background.
   Paints a stylized night landscape stroke by stroke (sky washes, gold moon,
   royal-blue mountains, water + reflections, gold highlights), holds it,
   fades, and repaints with a new variation. Static finished painting when
   prefers-reduced-motion is set. Pauses when the tab is hidden. */
(()=>{const c=document.getElementById("bg");if(!c)return;const x=c.getContext("2d");
const still=matchMedia("(prefers-reduced-motion: reduce)").matches;
const RATE=5, STEP=1/12; // strokes/second, segment size
let W,H,dpr,strokes=[],si=0,prog=0,state="paint",timer=0,raf=0,seed=1;
const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const R=(a,b)=>a+(b-a)*rnd();
const SKY=["#0b1a4a","#15296b","#1e3a8f","#2a4fb3","#3a62cc"];
const MTN=[["#0d1f5c","#4a6fd8"],["#071443","#3557c4"],["#030a26","#C9A227"]];
function bez(p,t){const u=1-t;return[u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1]];}
function S(p,w,col,a,n){return{p,w,col,a,n:n||14,j:Array.from({length:n||14},()=>[R(-.5,.5),R(.35,1),R(.6,1.4)])};}
function ridge(base,amp,ph,f){return xx=>base-amp*(.55*Math.sin(xx*f+ph)+.3*Math.sin(xx*f*2.3+ph*1.7)+.15*Math.sin(xx*f*5.1));}
function build(){strokes=[];
 // 1. sky washes, top to horizon
 for(let i=0;i<14;i++){const y=.02+i*.045+R(-.01,.01),col=SKY[Math.min(4,Math.floor(i/3))];const dir=i%2;
  const a=[dir?1.05:-.05,y+R(-.02,.02)],d=[dir?-.05:1.05,y+R(-.02,.02)];
  strokes.push(S([a,[R(.25,.4),y+R(-.05,.05)],[R(.6,.75),y+R(-.05,.05)],d],.075,col,.5,18));}
 // 2. moon: gold circular strokes
 const mx=R(.66,.8),my=R(.17,.26),mr=.055;
 for(let k=0;k<5;k++){const r=mr*(1-k*.17),o=R(0,6.28);for(let q=0;q<2;q++){const s=o+q*3.14,pt=t=>[mx+r*Math.cos(s+t)*H/W,my+r*Math.sin(s+t)];
  strokes.push(S([pt(0),pt(1.05),pt(2.1),pt(3.2)],.028,k<2?"#C9A227":"#f1cf5b",.55,12));}}
 // glow ring
 strokes.push(S([[mx-.12,my+.02],[mx-.05,my-.09],[mx+.06,my-.09],[mx+.13,my+.02]],.02,"#C9A227",.18,10));
 // 3. mountains: back -> front, ridge stroke then fill strokes beneath
 const ridges=[ridge(.5,.17,R(0,6),4.2),ridge(.6,.12,R(0,6),6),ridge(.69,.06,R(0,6),8.5)];
 ridges.forEach((rf,L)=>{for(let seg=0;seg<4;seg++){const x0=-.05+seg*.28,x1=x0+.32;
   const pts=[0,1/3,2/3,1].map(t=>{const xx=x0+(x1-x0)*t;return[xx,rf(xx)];});
   strokes.push(S(pts,.03,MTN[L][1],.85,14));}
  strokes.push({fill:rf,col:MTN[L][0],a:.92,bottom:.78});
  for(let f=1;f<=4;f++){const off=f*.04;const dir=f%2;
   const pts=[0,1/3,2/3,1].map(t=>{const xx=dir?1.05-1.1*t:-.05+1.1*t;return[xx,Math.min(.76,rf(xx)+off)];});
   strokes.push(S(pts,.05,MTN[L][0],.95,20));}
  // gold rim light on ridge (moon side)
  const gx=mx+R(-.2,.05);const g=[0,1/3,2/3,1].map(t=>{const xx=gx+t*.16;return[xx,rf(xx)-.004];});
  strokes.push(S(g,.008,"#f1cf5b",.45,6));});
 // 4. water: horizontal strokes below horizon
 for(let i=0;i<7;i++){const y=.74+i*.04,dir=i%2;
  strokes.push(S([[dir?1.05:-.05,y],[.35,y+R(-.01,.01)],[.65,y+R(-.01,.01)],[dir?-.05:1.05,y]],.05,i<3?"#0e2160":"#091848",.6,18));}
 // 5. moon reflection: short gold dabs
 for(let i=0;i<9;i++){const y=.76+i*.026,hw=R(.02,.06)*(1-i*.06);
  strokes.push(S([[mx-hw,y],[mx-hw/3,y-.004],[mx+hw/3,y+.004],[mx+hw,y]],.008,i%2?"#C9A227":"#f1cf5b",.5,7));}
 // 6. a few gold accent flicks (stars)
 for(let i=0;i<7;i++){const sx=R(.05,.95),sy=R(.04,.38);if(Math.abs(sx-mx)<.1)continue;
  strokes.push(S([[sx,sy],[sx+.006,sy-.004],[sx+.012,sy-.002],[sx+.018,sy+.003]],.006,"#f1cf5b",.6,5));}
}
function seg(s,t0,t1){if(s.fill){x.globalAlpha=s.a;x.fillStyle=s.col;x.beginPath();
  const xa=t0*1.1-.05,xb=t1*1.1-.05+.004;x.moveTo(xa*W,s.bottom*H);
  for(let k=0;k<=8;k++){const xx=xa+(xb-xa)*k/8;x.lineTo(xx*W,s.fill(xx)*H+Math.sin(xx*90)*2);}
  x.lineTo(xb*W,s.bottom*H);x.closePath();x.fill();x.globalAlpha=1;return;}const P=s.p.map(([a,b])=>[a*W,b*H]),A=bez(P,t0),B=bez(P,t1);
 const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
 const tm=(t0+t1)/2,taper=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(.02,tm))),.6),w=s.w*Math.min(W,H)*1.4*taper;
 x.strokeStyle=s.col;x.lineCap="round";
 for(const[o,al,lw]of s.j){x.globalAlpha=s.a*al*(.7+.3*taper);x.lineWidth=Math.max(.6,w/s.n*1.6*lw);
  x.beginPath();x.moveTo(A[0]+nx*o*w,A[1]+ny*o*w);x.lineTo(B[0]+nx*o*w,B[1]+ny*o*w);x.stroke();}
 x.globalAlpha=1;}
function paintAll(){for(const s of strokes)for(let k=0;k<30;k++)seg(s,k/30,(k+1)/30);}
function start(){x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);build();si=0;prog=0;state="paint";}
function size(){dpr=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;c.style.width=W+"px";c.style.height=H+"px";start();if(still)paintAll();}
let last=0;
function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min(.1,last?(now-last)/1000:0);last=now;
 if(state==="paint"){let budget=dt*RATE;while(budget>0){const s=strokes[si];if(!s){state="hold";timer=0;break;}
   const d=Math.min(budget,1-prog,STEP),n=prog+d;seg(s,prog,n);prog=n;budget-=d;if(prog>=1-1e-6){si++;prog=0;}}}
 else if(state==="hold"){timer+=dt;if(timer>12){state="fade";timer=0;}}
 else if(state==="fade"){x.globalAlpha=Math.min(1,dt*1.2);x.fillStyle="#030a1f";x.fillRect(0,0,W,H);x.globalAlpha=1;timer+=dt;if(timer>3){seed=Math.floor(R(1,1e6));start();}}}
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(size,200);});
seed=7;size();
const ff=+new URLSearchParams(location.search).get("bgt");
if(ff&&!still){let t=ff*RATE;while(t>0&&strokes[si]){const d=Math.min(t,1-prog,STEP);seg(strokes[si],prog,prog+d);prog+=d;t-=d;if(prog>=1-1e-6){si++;prog=0;}}}
if(!still){raf=requestAnimationFrame(frame);
 document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(frame);});}
})();
