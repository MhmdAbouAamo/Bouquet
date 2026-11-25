// ASCII bouquet: draws flowers on a hidden canvas, then redraws them as colored text.
// Settings live in config.js (loaded before this file).
const W=600,H=760,CW=3,CH=5,COLS=W/CW,ROWS=H/CH,N=COLS*ROWS;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const DPR=Math.min(window.devicePixelRatio||1,2);
cv.width=W*DPR;cv.height=H*DPR;ctx.scale(DPR,DPR);
const tc=document.createElement('canvas');tc.width=W*DPR;tc.height=H*DPR;
const tx=tc.getContext('2d');tx.scale(DPR,DPR);
tx.font='bold 7px Menlo, Consolas, monospace';tx.textBaseline='top';
const SX=CW/tx.measureText('M').width;
const off=document.createElement('canvas');off.width=COLS;off.height=ROWS;
const o=off.getContext('2d',{willReadFrequently:true});
const RAMP='.,:;-~=+*cslixozXO#%@';
const PAL=[
 {c:'#e3262e',d:'#7a0d14',l:'#ff8a70'},
 {c:'#d946b8',d:'#6e1a5c',l:'#ffa8ea'},
 {c:'#f4ece0',d:'#9aa860',l:'#ffffff'},
 {c:'#f2c22e',d:'#a06a10',l:'#fff2a0'},
 {c:'#f39a6b',d:'#a4402a',l:'#ffd8b8'},
 {c:'#b8245a',d:'#4a0a22',l:'#f37aa6'}
];
const ROSE=[{c:'#c8102e',d:'#5e0614',l:'#ff5a6e'},{c:'#f4a6b8',d:'#b0506a',l:'#ffe0e8'},{c:'#f7b987',d:'#b9663a',l:'#ffe3c8'},{c:'#f6efe2',d:'#b8ab90',l:'#ffffff'}];
const TULIP=[{c:'#e8344a',d:'#8a1222',l:'#ff8592'},{c:'#f7d43c',d:'#b88a10',l:'#fff3a0'},{c:'#9b4dd6',d:'#4c1a78',l:'#d4a8ff'},{c:'#ff8fb2',d:'#b4456a',l:'#ffd0e0'},{c:'#ff7a2e',d:'#a83c08',l:'#ffc08a'}];
const DAISY=[{c:'#ffffff',d:'#bdbdbd',l:'#ffffff',k:'#f2c22e',kd:'#9a6a08'},{c:'#ff6f91',d:'#b0305a',l:'#ffc0d0',k:'#4a2a10',kd:'#1e1005'},{c:'#ffb02e',d:'#b86a08',l:'#ffe0a0',k:'#5a3a10',kd:'#241505'}];
const BASE={PAL,ROSE,TULIP,DAISY};
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toh=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
const mix=(h,w,t)=>{const a=hx(h),b=hx(w);return toh(a.map((v,i)=>v+(b[i]-v)*t));};
const hue=h=>{const [r,g,b]=hx(h).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(d<.08)return -1;let H=mx==r?((g-b)/d)%6:mx==g?(b-r)/d+2:(r-g)/d+4;return (H*60+360)%360;};
const THEMES={
 classic:p=>p,
 pastel:p=>({...p,c:mix(p.c,'#ffffff',.45),d:mix(p.d,'#ffffff',.35),l:mix(p.l,'#ffffff',.5)}),
 sunset:p=>p,
 moonlight:p=>({...p,c:mix(p.c,'#efe9df',.82),d:mix(p.d,'#7d8595',.7),l:'#ffffff'})
};
const HP=new URLSearchParams(location.hash.slice(1));
const giftMsg=(HP.get('m')||GIFT.msg).trim(),giftCap=(HP.get('c')||GIFT.caption||giftMsg).trim();
const gift=!!giftMsg;
let theme=HP.get('t')||GIFT.theme,msg=giftMsg,flashed=false,capTimer=0;
if(!THEMES[theme])theme='classic';
if(gift)document.body.classList.add('gift');
function pal(set){let a=BASE[set];if(theme=='sunset'){const w=a.filter(p=>{const h=hue(p.c);return h>=0&&(h<60||h>320)});if(w.length)a=w;}return a.map(THEMES[theme]);}
const pick=a=>a[Math.random()*a.length|0];
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>1-Math.pow(1-v,3);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let F=[],B=[],LV=[],GY=[],EU=[],PET=[],RIP=[],start=0;
const ptr={x:0,y:0,t:-1e9};
function make(){
 const lc=shuffle(pal('PAL')),RS=pal('ROSE'),TS=pal('TULIP'),DS=pal('DAISY');let li=0;PET=[];
 const types=shuffle(['lily','lily','lily','lily','rose','rose','rose','tulip','tulip','tulip','daisy','daisy','daisy']);
 const slots=[[300,330,92],[195,380,82],[405,370,82],[245,235,74],[365,225,76],[140,285,64],[465,280,64],[300,470,88],[185,505,70],[420,500,72],[300,155,58],[110,420,60],[490,420,60]];
 F=slots.map((s,i)=>{const type=types[i];return {type,x:s[0]+rnd(-12,12),y:s[1]+rnd(-12,12),L:s[2]*rnd(.9,1.1),rot:rnd(0,6.28),tilt:rnd(.6,1),
  p:type=='lily'?lc[li++%lc.length]:type=='rose'?pick(RS):type=='tulip'?pick(TS):pick(DS),
  ph:rnd(0,6.28),bx:300+rnd(-14,14),lean:rnd(-.2,.2)+(s[0]-300)/700,np:18+(Math.random()*7|0),
  bend:[0,1,2,3,4,5].map(()=>rnd(.2,.55)*(Math.random()<.5?-1:1)),wph:[0,1,2,3,4,5].map(()=>rnd(0,6.28))}});
 F.sort((a,b)=>a.y-b.y);
 F.forEach((f,i)=>f.delay=1+i*.18);
 B=[[225,110],[350,92],[165,170]].map(b=>({x:b[0]+rnd(-8,8),y:b[1]+rnd(-8,8),L:rnd(28,38),a:rnd(-.3,.3),p:pick(lc),ph:rnd(0,6.28),bx:300+rnd(-14,14)}));
 LV=[];for(let i=0;i<10;i++)LV.push({x:300+rnd(-20,20),y:640+rnd(-10,30),a:rnd(-1,1),len:rnd(130,230),w:rnd(14,22),bend:rnd(-1,1),ph:rnd(0,6.28)});
 GY=[[100,195],[500,190],[280,85],[420,120],[70,360],[530,350]].map(([x,y])=>{
  const tip={x:x+rnd(-10,10),y:y+rnd(-10,10)},subs=[0,1,2].map(()=>({x:tip.x+rnd(-35,35),y:tip.y+rnd(-30,15)})),fl=[];
  subs.forEach(sb=>{for(let k=0;k<9;k++)fl.push({x:sb.x+rnd(-16,16),y:sb.y+rnd(-14,14),sb,r:rnd(2.5,4)})});
  return {tip,subs,fl,bx:300+rnd(-14,14),ph:rnd(0,6.28)}});
 EU=[[90,500],[510,500],[150,130],[455,90]].map(([x,y])=>({x:x+rnd(-10,10),y:y+rnd(-10,10),bx:300+rnd(-14,14),ph:rnd(0,6.28),n:7+(Math.random()*3|0)}));
 start=performance.now();
}
function poly(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);}
function stem(c,x0,y0,x1,y1,x2,y2,g){
 if(g<=0)return;
 const ax=x0+(x1-x0)*g,ay=y0+(y1-y0)*g,bx=x1+(x2-x1)*g,by=y1+(y2-y1)*g;
 c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(ax,ay,ax+(bx-ax)*g,ay+(by-ay)*g);c.stroke();
}
function leaf(c,l,g,t){
 if(g<=0)return;
 c.save();c.translate(l.x,l.y);c.rotate(l.a+Math.sin(t*.8+l.ph)*.03);
 const len=l.len*g,gr=c.createLinearGradient(0,0,0,-len);
 gr.addColorStop(0,'#1d5e22');gr.addColorStop(.6,'#3fa03a');gr.addColorStop(1,'#8fdc5a');
 c.fillStyle=gr;c.beginPath();c.moveTo(0,0);
 c.bezierCurveTo(l.w,-len*.3,l.w*.6,-len*.75,l.bend*len*.1,-len);
 c.bezierCurveTo(-l.w*.4,-len*.75,-l.w*.8,-len*.3,0,0);c.fill();
 c.strokeStyle='#8fdc5a';c.globalAlpha=.4;c.lineWidth=1.5;
 c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(l.w*.1,-len*.5,l.bend*len*.1,-len);c.stroke();
 c.globalAlpha=1;c.restore();
}
const LT=(()=>{const v=[-.45,-.55,.7],m=Math.hypot(...v);return v.map(x=>x/m)})();
function lit(nx,ny){const m=Math.hypot(nx,ny,1);return .42+.85*Math.max(0,(nx*LT[0]+ny*LT[1]+LT[2])/m);}
const shade=b=>b<1?`rgba(0,0,0,${(1-b)*.85})`:`rgba(255,255,255,${Math.min(.5,(b-1)*.9)})`;
function shadeFill(c,pts,b){
 c.fillStyle=shade(b);
 poly(c,pts);c.fill();
}
function geom(len,wid,bend,rec,ph){
 const n=28,u0=.6,Lp=[],Rp=[],C=[];
 for(let i=0;i<=n;i++){
  const u=i/n,k=Math.max(0,u-u0);
  const y=-len*(u-k*rec*.55);
  const x=len*(bend*u*u*.08+k*k*rec*bend*.7);
  let hw=wid*Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.9)*(1-.45*u);
  hw*=1+.12*Math.sin(u*26+ph)*Math.min(1,u*2);
  C.push([x,y]);Lp.push([x-hw,y]);Rp.push([x+hw,y]);
 }
 return {Lp,Rp,C,n,i0:Math.round(u0*n)};
}
function silhouette(c,a,len,wid,bend,rec,ph,ox,oy){
 const {Lp,Rp}=geom(len,wid,bend,rec,ph);
 c.save();c.translate(ox,oy);c.rotate(a);poly(c,Lp.concat(Rp.slice().reverse()));c.fill();c.restore();
}
function petal(c,a,len,wid,p,front,bend,rec,ph,wa){
 c.save();c.rotate(a);
 const {Lp,Rp,C,n,i0}=geom(len,wid,bend,rec,ph);
 const g=c.createLinearGradient(0,0,0,Math.min(-1,C[n][1]));
 g.addColorStop(0,p.d);g.addColorStop(.25,p.c);g.addColorStop(.75,p.c);g.addColorStop(1,front?p.l:p.c);
 c.fillStyle=g;poly(c,Lp.concat(Rp.slice().reverse()));c.fill();
 const d=[Math.sin(wa),-Math.cos(wa)],q=[Math.cos(wa),Math.sin(wa)];
 const sc=Math.sin(.6),ss=Math.sin(.5),st=Math.sin(.9*rec);
 for(const sg of [-1,1]){
  const side=sg<0?Lp:Rp;
  shadeFill(c,side.slice(0,i0+1).concat(C.slice(0,i0+1).reverse()),lit(-d[0]*sc-sg*q[0]*ss,-d[1]*sc-sg*q[1]*ss));
  if(rec>.05)shadeFill(c,side.slice(i0).concat(C.slice(i0).reverse()),lit(d[0]*st-sg*q[0]*ss,d[1]*st-sg*q[1]*ss));
 }
 if(rec>.05){
  c.globalAlpha=.5*rec;c.strokeStyle=p.d;c.lineWidth=2.5;
  c.beginPath();c.moveTo(Lp[i0][0],Lp[i0][1]);c.quadraticCurveTo(C[i0][0],C[i0][1]-4,Rp[i0][0],Rp[i0][1]);c.stroke();
  c.globalAlpha=.6*rec;c.lineWidth=4;poly(c,(bend>0?Rp:Lp).slice(i0-2));c.stroke();
 }
 c.globalAlpha=.55;c.strokeStyle=p.l;c.lineWidth=Math.max(1.5,len*.03);
 poly(c,C.slice(2,i0+2));c.stroke();
 c.globalAlpha=1;c.fillStyle=p.d;
 for(let j=0;j<5;j++){const i=3+j*1.6|0,o2=(j%2?1:-1)*(Rp[i][0]-C[i][0])*.4;c.beginPath();c.arc(C[i][0]+o2,C[i][1],2,0,7);c.fill();}
 c.restore();
}
function lily(c,f,t){
 if(t<f.delay-.4)return;
 const s=ease(clamp((t-f.delay)/1.8)),vis=clamp((t-f.delay+.4)/.4),rec=clamp((s-.35)/.65);
 if(vis<.05)return;
 const r=f.rot+Math.sin(t*.7+f.ph)*.05;
 c.save();c.translate(f.cx,f.cy);c.rotate(r);c.scale(vis,vis*f.tilt);
 const loc=(dx,dy)=>[(dx*Math.cos(r)+dy*Math.sin(r))/vis,(-dx*Math.sin(r)+dy*Math.cos(r))/(vis*f.tilt)];
 const L=f.L*(.45+.85*s),w=f.L*.17*(.45+.55*s);
 const P=[0,1,2,3,4,5].map(k=>{const front=k%2==1;return {k,a:k*Math.PI/3*s,len:front?L*.88:L,w:front?w*.92:w,front};});
 let [ox,oy]=loc(8,10);c.fillStyle='rgba(0,0,0,.4)';
 for(const q of P)silhouette(c,q.a,q.len,q.w,f.bend[q.k]*s,rec,f.wph[q.k],ox,oy);
 for(const q of P)if(!q.front)petal(c,q.a,q.len,q.w,f.p,false,f.bend[q.k]*s,rec,f.wph[q.k],r+q.a);
 [ox,oy]=loc(3,4);c.fillStyle='rgba(0,0,0,.35)';
 for(const q of P)if(q.front)silhouette(c,q.a,q.len,q.w,f.bend[q.k]*s,rec,f.wph[q.k],ox,oy);
 for(const q of P)if(q.front)petal(c,q.a,q.len,q.w,f.p,true,f.bend[q.k]*s,rec,f.wph[q.k],r+q.a);
 if(s>.4){
  c.globalAlpha=Math.min(1,(s-.4)/.4);c.strokeStyle='#cfe08a';c.lineWidth=2.5;c.fillStyle='#6b2e12';
  for(let k=0;k<6;k++){const a=k*Math.PI/3+.5,rr=L*.45,x=Math.sin(a)*rr,y=-Math.cos(a)*rr;
   c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(x*.5+y*.1,y*.5-x*.1,x,y);c.stroke();
   c.beginPath();c.ellipse(x,y,6,2.5,a,0,7);c.fill();}
  c.fillStyle='#8fb04a';c.beginPath();c.arc(0,0,4,0,7);c.fill();
  c.globalAlpha=1;
 }
 c.restore();
}
function bud(c,b,t){
 const s=ease(clamp((t-1)/.8));if(s<=0)return;
 c.save();c.translate(b.cx,b.cy);c.rotate(b.a+Math.sin(t*.9+b.ph)*.05);c.scale(s,s);
 const g=c.createLinearGradient(0,0,0,-b.L);
 g.addColorStop(0,'#3f8f3a');g.addColorStop(.45,b.p.d);g.addColorStop(1,b.p.c);
 c.fillStyle=g;c.beginPath();c.moveTo(0,0);
 c.bezierCurveTo(b.L*.28,-b.L*.2,b.L*.22,-b.L*.8,0,-b.L);
 c.bezierCurveTo(-b.L*.22,-b.L*.8,-b.L*.28,-b.L*.2,0,0);c.fill();c.restore();
}
function rose(c,f,t){
 if(t<f.delay-.4)return;
 const s=ease(clamp((t-f.delay)/1.8)),vis=clamp((t-f.delay+.4)/.4);if(vis<.05)return;
 const p=f.p,R=f.L*.52*(.55+.45*s),sy=vis*(.7+.3*f.tilt),sw=Math.sin(t*.7+f.ph)*.05;
 c.save();c.translate(f.cx,f.cy);c.scale(vis,sy);
 c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.arc(8/vis,10/sy,R*1.1,0,7);c.fill();
 for(let k=0;k<5;k++){const a=f.rot+k*1.2566+sw,x=Math.cos(a)*R*.35,y=Math.sin(a)*R*.35;
  c.fillStyle=p.d;c.beginPath();c.ellipse(x,y,R*.72,R*.6,a,0,7);c.fill();
  c.fillStyle=p.c;c.beginPath();c.ellipse(x*.9,y*.9,R*.66,R*.54,a,0,7);c.fill();
  c.fillStyle=shade(lit(Math.cos(a)*.6,Math.sin(a)*.6));c.fill();}
 c.fillStyle=p.c;c.beginPath();c.arc(0,0,R*.82,0,7);c.fill();c.fillStyle=shade(.75);c.fill();
 const n=14;
 for(let i=0;i<n;i++){
  const u=i/n,rr=R*.82*(1-u*.85),a0=f.rot+i*2.4+sw,sp=2.4-u*.6,m=a0+sp/2,cx=Math.cos(m)*rr*.22,cy=Math.sin(m)*rr*.22;
  c.beginPath();c.arc(0,0,rr,a0,a0+sp);c.arc(-cx,-cy,rr*.82,a0+sp,a0,true);c.closePath();
  c.fillStyle=p.c;c.fill();c.fillStyle=shade(lit(Math.cos(m)*.5,Math.sin(m)*.5)*(1-u*.35));c.fill();
  c.globalAlpha=.55;c.strokeStyle=p.l;c.lineWidth=1.5;c.beginPath();c.arc(0,0,rr,a0,a0+sp);c.stroke();c.globalAlpha=1;
 }
 c.fillStyle=p.d;c.beginPath();c.arc(0,0,R*.1,0,7);c.fill();
 c.restore();
}
function tulip(c,f,t){
 if(t<f.delay-.4)return;
 const s=ease(clamp((t-f.delay)/1.8)),vis=clamp((t-f.delay+.4)/.4);if(vis<.05)return;
 const p=f.p,h=f.L*.88*(.55+.45*s),w=h*.42,op=.06+.22*s;
 c.save();c.translate(f.cx,f.cy);c.rotate(f.lean+Math.sin(t*.9+f.ph)*.05);c.scale(vis,vis);
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(8,-h*.45+10,w*1.15,h*.55,0,0,7);c.fill();
 const tp=(x,a,ww,hh,b)=>{c.save();c.translate(x,0);c.rotate(a);
  const g=c.createLinearGradient(-ww,0,ww,0);g.addColorStop(0,p.l);g.addColorStop(.45,p.c);g.addColorStop(1,p.d);
  c.beginPath();c.moveTo(0,0);c.bezierCurveTo(ww,-hh*.1,ww*.9,-hh*.85,0,-hh);c.bezierCurveTo(-ww*.9,-hh*.85,-ww,-hh*.1,0,0);
  c.fillStyle=g;c.fill();c.fillStyle=shade(b);c.fill();
  c.globalAlpha=.3;c.strokeStyle=p.d;c.lineWidth=2;c.beginPath();c.moveTo(0,-hh*.1);c.quadraticCurveTo(ww*.1,-hh*.5,0,-hh*.9);c.stroke();c.globalAlpha=1;
  c.restore();};
 tp(0,0,w*.9,h,.78);
 tp(-w*.38,-op,w*.85,h*.95,lit(-.5,-.2));
 tp(w*.38,op,w*.85,h*.95,lit(.5,-.2));
 tp(0,0,w*.72,h*.86,1);
 c.restore();
}
function daisy(c,f,t){
 if(t<f.delay-.4)return;
 const s=ease(clamp((t-f.delay)/1.8)),vis=clamp((t-f.delay+.4)/.4);if(vis<.05)return;
 const p=f.p,R=f.L*.68*(.3+.7*s),r=f.rot+Math.sin(t*.7+f.ph)*.05,n=f.np;
 c.save();c.translate(f.cx,f.cy);c.rotate(r);c.scale(vis,vis*f.tilt);
 const [ox,oy]=[(8*Math.cos(r)+10*Math.sin(r))/vis,(-8*Math.sin(r)+10*Math.cos(r))/(vis*f.tilt)];
 c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.arc(ox,oy,R*.95,0,7);c.fill();
 for(const layer of [0,1])for(let k=0;k<n;k++){
  const a=(k+layer*.5)*6.2832/n,wa=a+r,d=[Math.sin(wa),-Math.cos(wa)],len=R*(layer?.92:1);
  c.save();c.rotate(a);
  c.beginPath();c.ellipse(0,-len*.55,R*.085,len*.45,0,0,7);
  c.fillStyle=layer?p.c:p.d;c.fill();c.fillStyle=shade(lit(-d[0]*.45,-d[1]*.45));c.fill();
  c.globalAlpha=.3;c.strokeStyle=p.d;c.lineWidth=1;c.beginPath();c.moveTo(0,-len*.2);c.lineTo(0,-len*.9);c.stroke();c.globalAlpha=1;
  c.restore();
 }
 const K=R*.26;
 c.fillStyle=p.kd;c.beginPath();c.arc(0,0,K,0,7);c.fill();
 c.fillStyle=p.k;c.beginPath();c.arc(-K*.12,-K*.12,K*.85,0,7);c.fill();
 for(let k=0;k<34;k++){const rr=Math.sqrt(k/34)*K*.85,a=k*2.4;c.fillStyle=k%2?p.kd:p.l;c.beginPath();c.arc(Math.cos(a)*rr,Math.sin(a)*rr,1.4,0,7);c.fill();}
 c.restore();
}
function gyp(c,gp,t){
 const g=ease(clamp((t-.6)/1.4));if(g<=0)return;
 const sw=Math.sin(t*1.1+gp.ph)*3,x2=gp.tip.x+sw,y2=gp.tip.y;
 c.strokeStyle='#6f9c5c';c.lineWidth=1.8;
 stem(c,gp.bx,720,gp.bx+(x2-gp.bx)*.3,720-(720-y2)*.5,x2,y2,g);
 if(g<.7)return;const h=clamp((g-.7)/.3);
 c.lineWidth=1.2;
 for(const sb of gp.subs){c.beginPath();c.moveTo(x2,y2);c.lineTo(x2+(sb.x+sw-x2)*h,y2+(sb.y-y2)*h);c.stroke();}
 for(const fl of gp.fl){const sx=x2+(fl.sb.x+sw-x2)*h,sy=y2+(fl.sb.y-y2)*h,x=sx+(fl.x-fl.sb.x)*h,y=sy+(fl.y-fl.sb.y)*h;
  c.beginPath();c.moveTo(sx,sy);c.lineTo(x,y);c.stroke();
  c.fillStyle='#b9b9ae';c.beginPath();c.arc(x+1,y+1,fl.r*h,0,7);c.fill();
  c.fillStyle='#ffffff';c.beginPath();c.arc(x-.5,y-.5,fl.r*h*.85,0,7);c.fill();}
}
function euc(c,e,t){
 const g=ease(clamp((t-.4)/1.4));if(g<=0)return;
 const sw=Math.sin(t*.8+e.ph)*3,x2=e.x+sw,y2=e.y,x0=e.bx,y0=720,x1=x0+(x2-x0)*.25,y1=720-(720-y2)*.55;
 c.strokeStyle='#5d7f6f';c.lineWidth=2.5;stem(c,x0,y0,x1,y1,x2,y2,g);
 for(let j=1;j<=e.n;j++){const u=.35+.65*j/e.n;if(u>g)break;
  const q=(1-u)*(1-u),w=2*(1-u)*u,v=u*u,x=q*x0+w*x1+v*x2,y=q*y0+w*y1+v*y2;
  const dx=2*(1-u)*(x1-x0)+2*u*(x2-x1),dy=2*(1-u)*(y1-y0)+2*u*(y2-y1),m=Math.hypot(dx,dy)||1;
  const sd=j%2?1:-1,r=10-u*3,lx=x-dy/m*sd*r,ly=y+dx/m*sd*r;
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(lx+3,ly+4,r,r*.8,0,0,7);c.fill();
  c.fillStyle='#6f9a8a';c.beginPath();c.ellipse(lx,ly,r,r*.8,0,0,7);c.fill();
  c.fillStyle='#a8c8bb';c.beginPath();c.ellipse(lx-r*.25,ly-r*.25,r*.55,r*.45,0,0,7);c.fill();
 }
}
const DRAW={lily,rose,tulip,daisy};
function scene(c,t){
 const g=ease(clamp(t/1)),all=F.concat(B);
 const on=performance.now()-ptr.t<1500;
 for(const f of all){
  let px=0,py=0;
  if(on){const dx=f.x-ptr.x,dy=f.y-ptr.y,dd=Math.hypot(dx,dy)||1,fz=40*Math.exp(-dd*dd/(2*110*110));px=dx/dd*fz;py=dy/dd*fz;}
  f.ox=(f.ox||0)+(px-(f.ox||0))*.12;f.oy=(f.oy||0)+(py-(f.oy||0))*.12;
  f.cx=f.x+Math.sin(t*.9+f.ph)*4+f.ox;f.cy=f.y+f.oy;
 }
 c.lineCap='round';
 for(const e of EU)euc(c,e,t);
 c.strokeStyle='#3f9a3c';c.lineWidth=6;
 for(const f of all)stem(c,f.bx,720,f.bx+(f.cx-f.bx)*.2,720-(720-f.cy)*.5,f.cx,f.cy,g);
 for(const l of LV)leaf(c,l,g,t);
 for(const gp of GY)gyp(c,gp,t);
 for(const b of B)bud(c,b,t);
 for(const f of F)DRAW[f.type](c,f,t);
 for(const q of PET){c.save();c.translate(q.x,q.y);c.rotate(q.r);c.scale(1,Math.abs(Math.cos(q.r*1.3))*.7+.3);
  c.fillStyle=q.p.c;c.beginPath();c.ellipse(0,0,q.s*.45,q.s,0,0,7);c.fill();
  c.fillStyle=shade(lit(Math.sin(q.r)*.6,-Math.cos(q.r)*.6));c.fill();c.restore();}
}
function stepPetals(t){
 const last=F.length?F[F.length-1].delay+2:99;
 if(t>last&&PET.length<14&&Math.random()<.03){const f=pick(F);PET.push({x:f.cx+rnd(-20,20),y:f.cy+rnd(-10,10),vx:rnd(-.4,.4),vy:0,r:rnd(0,6.28),sp:rnd(-.08,.08),s:rnd(6,10),p:f.p,ph:rnd(0,6.28),age:0});}
 for(const q of PET){q.age+=.033;q.vy=Math.min(q.vy+.05,1.7);q.x+=q.vx+Math.sin(q.age*2+q.ph)*.9;q.y+=q.vy;q.r+=q.sp;}
 PET=PET.filter(q=>q.y<770);
}
const noise=new Float32Array(N).map(Math.random),rv=new Float32Array(N).map(Math.random);
let last=0;
function render(now){
 requestAnimationFrame(render);
 if(now-last<33)return;last=now;
 const t=(now-start)/1000;
 o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,COLS,ROWS);
 stepPetals(t);
 o.setTransform(1/CW,0,0,1/CH,0,0);scene(o,t);
 o.globalCompositeOperation='source-atop';
 for(const r of RIP){const a=Math.max(0,(now-r.t)/1000),al=.65*(1-a/1.4);if(al<=0)continue;o.strokeStyle=`rgba(255,255,255,${al})`;o.lineWidth=28;o.beginPath();o.arc(r.x,r.y,a*340,0,7);o.stroke();}
 o.globalCompositeOperation='source-over';
 RIP=RIP.filter(r=>now-r.t<1400);
 const d=o.getImageData(0,0,COLS,ROWS).data;
 for(let k=0;k<N*.03;k++)noise[Math.random()*N|0]=Math.random();
 tx.globalCompositeOperation='source-over';tx.clearRect(0,0,W,H);
 tx.fillStyle='#fff';tx.save();tx.scale(SX,1);
 const M=msg?msg+' ':'';let mi=0;const SP=[];
 const lastD=F.length?F[F.length-1].delay+1.8:5;
 const rf=gift?clamp((t-1.6)/(lastD-1.6))*.75+(flashed?.25:0):1;
 if(gift&&!flashed&&t>lastD+.5){flashed=true;RIP.push({x:300,y:360,t:performance.now()});typeCaption();}
 for(let y=0;y<ROWS;y++){
  let row='';
  for(let x=0;x<COLS;x++){
   const i=y*COLS+x,j=i*4;
   if(d[j+3]<40){row+=' ';continue;}
   const lum=(.3*d[j]+.59*d[j+1]+.11*d[j+2])/255;
   if(M&&lum>.5&&!(d[j+1]>d[j]+20&&d[j+1]>d[j+2]+20)){const ch=M[mi++%M.length];if(rv[i]<rf){if(ch.charCodeAt(0)>126){row+=' ';SP.push(x,y);}else row+=ch;continue;}}
   row+=RAMP[Math.min(RAMP.length-1,Math.max(0,(.25+lum*.55+noise[i]*.3)*RAMP.length|0))];
  }
  tx.fillText(row,0,y*CH);
 }
 tx.restore();
 for(let k=0;k<SP.length;k+=2)tx.fillText('\u2665',SP[k]*CW,SP[k+1]*CH);
 tx.globalCompositeOperation='source-in';tx.imageSmoothingEnabled=false;tx.drawImage(off,0,0,W,H);
 ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=.2;ctx.imageSmoothingEnabled=true;ctx.drawImage(off,0,0,W,H);ctx.globalAlpha=1;ctx.drawImage(tc,0,0,W,H);
}
const $=id=>document.getElementById(id);
function typeCaption(){
 clearInterval(capTimer);const cap=$('cap');let k=0;
 capTimer=setInterval(()=>{k++;cap.innerHTML='';cap.append(document.createTextNode(giftCap.slice(0,k)));const cu=document.createElement('span');cu.className='cur';cap.append(cu);
  if(k>=giftCap.length){clearInterval(capTimer);$('again').style.opacity=1;}},90);
}
$('again').onclick=()=>{flashed=false;$('cap').innerHTML='';$('again').style.opacity=0;make();};
const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];};
cv.addEventListener('pointermove',e=>{[ptr.x,ptr.y]=pos(e);ptr.t=performance.now();});
cv.addEventListener('pointerdown',e=>{[ptr.x,ptr.y]=pos(e);ptr.t=performance.now();RIP.push({x:ptr.x,y:ptr.y,t:ptr.t});});
if($('theme')){$('theme').value=theme;}
if($('theme'))$('theme').onchange=e=>{theme=e.target.value;make();};
if($('msg'))$('msg').oninput=e=>{msg=e.target.value.trim();};
if($('bloom'))$('bloom').onclick=make;
if($('save'))$('save').onclick=()=>{const a=document.createElement('a');a.download='bouquet.png';a.href=cv.toDataURL('image/png');a.click();};
make();requestAnimationFrame(render);
