/* Katie Designs — paints Van Gogh's "The Starry Night" (public domain, images/starry-night.jpg)
   once with brush strokes (coarse -> fine; colours sampled from the image, directions from
   image gradients), cross-fades to the real image, then STOPS for good and leaves a static
   CSS background. Shown once per browser (localStorage); later visits / pages / reduced
   motion / resize show the static image immediately. Preview: ?bgt=<seconds>. */
(()=>{const c=document.getElementById("bg");if(!c)return;
const IMG="images/starry-night.jpg?v=6",KEY="kd-painted-v6";
const q=new URLSearchParams(location.search),ff=q.has("bgt")?+q.get("bgt"):null;
const still=matchMedia("(prefers-reduced-motion: reduce)").matches,replay=q.has("replay");
let seen=false;try{localStorage.removeItem("kdStarryPainted");seen=!replay&&sessionStorage.getItem(KEY)==="1";}catch(e){}
function showStatic(){let d=document.getElementById("bgstatic");if(!d){d=document.createElement("div");d.id="bgstatic";d.setAttribute("aria-hidden","true");c.after(d);}
 d.style.backgroundImage=`url(${IMG})`;c.remove();}
if(ff===null&&seen){showStatic();return;}
const x=c.getContext("2d");let W,H,S,dpr,raf=0,strokes=[],k=0,t=0,last=0,done=false,img,src,data,sw,sh;
const PAINT=still?7:9,FADE=1.6; // seconds
let rs=7;const rnd=()=>{rs=(rs*16807)%2147483647;return(rs-1)/2147483646;};
function cover(){const mob=W<H,s=Math.max(W/img.width,H/img.height),dw=img.width*s,dh=img.height*s;
 const fx=mob?.22:.5,fy=.5;return[(W-dw)*fx,(H-dh)*fy,dw,dh];}
function setup(){dpr=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;S=Math.min(W,H);
 c.width=W*dpr;c.height=H*dpr;c.style.width=W+"px";c.style.height=H+"px";x.setTransform(dpr,0,0,dpr,0,0);
 x.fillStyle="#030a1f";x.fillRect(0,0,W,H);
 // offscreen sample canvas at half viewport resolution
 sw=Math.ceil(W/2);sh=Math.ceil(H/2);src=document.createElement("canvas");src.width=sw;src.height=sh;
 const sx=src.getContext("2d",{willReadFrequently:true}),[ox,oy,dw,dh]=cover();sx.drawImage(img,ox/2,oy/2,dw/2,dh/2);
 data=sx.getImageData(0,0,sw,sh).data;
 // stroke list, coarse -> fine, capped count
 const area=W*H,passes=[[S/6,Math.min(500,area/2000)],[S/15,Math.min(1400,area/700)],[S/36,Math.min(2600,area/350)]];
 strokes=[];for(const[size,n]of passes){const p=[];for(let i=0;i<n;i++)p.push([rnd()*W,rnd()*H,size*(.7+.6*rnd())]);p.sort((a,b)=>a[1]-b[1]+(rnd()-.5)*H*.4);strokes.push(...p);}
 k=0;t=0;}
const lum=(i)=>data[i]*.3+data[i+1]*.59+data[i+2]*.11;
function px(X,Y){X=Math.max(1,Math.min(sw-2,X|0));Y=Math.max(1,Math.min(sh-2,Y|0));return(Y*sw+X)*4;}
function stroke([X,Y,size]){const sX=X/2,sY=Y/2,i=px(sX,sY);
 // Sobel-ish gradient over a neighbourhood scaled to stroke size
 const r=Math.max(1,size/6);const gx=lum(px(sX+r,sY))-lum(px(sX-r,sY)),gy=lum(px(sX,sY+r))-lum(px(sX,sY-r));
 const a=Math.atan2(gy,gx)+Math.PI/2+(rnd()-.5)*.3; // follow edges
 const col=`rgb(${data[i]},${data[i+1]},${data[i+2]})`,len=size,w=size*.38,ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca,n=5,bend=(rnd()-.5)*.5;
 x.strokeStyle=col;x.lineCap="round";
 for(let b=0;b<n;b++){const o=(b/(n-1)-.5)*w,taper=1-Math.abs(o)/w;x.globalAlpha=.55+.4*rnd();x.lineWidth=Math.max(1,w/n*2*(.6+.4*taper));
  const h=len/2*(.75+.25*taper);x.beginPath();x.moveTo(X-ca*h+nx*o,Y-sa*h+ny*o);
  x.quadraticCurveTo(X+nx*(o+bend*len*.4),Y+ny*(o+bend*len*.4),X+ca*h+nx*o*.5,Y+sa*h+ny*o*.5);x.stroke();}
 x.globalAlpha=1;}
function step(dt){t+=dt;const target=Math.min(strokes.length,Math.floor(strokes.length*Math.min(1,t/PAINT)));
 while(k<target)stroke(strokes[k++]);
 if(t>PAINT){const f=Math.min(1,(t-PAINT)/FADE),[ox,oy,dw,dh]=cover();x.globalAlpha=Math.min(1,f*.35+.02);x.drawImage(img,ox,oy,dw,dh);x.globalAlpha=1;
  if(f>=1)finish();}}
function finish(){if(done)return;done=true;cancelAnimationFrame(raf);
 if(ff===null){try{sessionStorage.setItem(KEY,"1");}catch(e){}}
 removeEventListener("resize",onResize);document.removeEventListener("visibilitychange",onVis);
 data=null;strokes=null;if(src){src.width=src.height=0;src=null;}showStatic();}
function frame(now){if(done)return;raf=requestAnimationFrame(frame);const dt=Math.min(.1,last?(now-last)/1000:0);last=now;step(dt);}
function onVis(){cancelAnimationFrame(raf);last=0;if(!document.hidden&&!done)raf=requestAnimationFrame(frame);}
let w0=innerWidth;function onResize(){if(Math.abs(innerWidth-w0)>120)finish();} // ignore mobile URL-bar height changes; big width change -> static image
img=new Image();img.decoding="async";img.onerror=showStatic;
img.onload=()=>{setup();
 if(ff!==null){if(ff>=PAINT+FADE){finish();return;}let s=0;while(s<ff){step(.05);s+=.05;}if(!done&&ff<0.01)return;return;} // preview: freeze at that moment
 addEventListener("resize",onResize);document.addEventListener("visibilitychange",onVis);raf=requestAnimationFrame(frame);};
img.src=IMG;})();
