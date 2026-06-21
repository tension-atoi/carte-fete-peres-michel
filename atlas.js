// GNOSIS Visualizer Atlas — shared engine library. Exposes window.Atlas.
window.Atlas=(function(){
const A={speed:1,bloom:8,seed:12345};
const CS={
  kata:(()=>{let s='';for(let i=0x30A0;i<0x30FF;i++)s+=String.fromCharCode(i);return s;})(),
  bits:'01', hex:'0123456789ABCDEF', shade:' .:-=+*#%@', blocks:'▁▂▃▄▅▆▇█',
  box:'│─┌┐└┘├┤┬┴┼╔╗╚╝║═╬░▒▓', dots:'·:∶⁞', greek:'αβγδλξπσφψΩ∴∵∮∫', runic:'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᛁᛃᛇᛈᛉᛊ'
};
const FONT={A:[2,5,7,5,5],B:[6,5,6,5,6],C:[3,4,4,4,3],D:[6,5,5,5,6],E:[7,4,6,4,7],F:[7,4,6,4,4],
G:[3,4,5,5,3],H:[5,5,7,5,5],I:[7,2,2,2,7],J:[1,1,1,5,2],K:[5,5,6,5,5],L:[4,4,4,4,7],M:[5,7,7,5,5],
N:[5,7,7,7,5],O:[2,5,5,5,2],P:[6,5,6,4,4],Q:[2,5,5,6,3],R:[6,5,6,5,5],S:[3,4,2,1,6],T:[7,2,2,2,2],
U:[5,5,5,5,7],V:[5,5,5,5,2],W:[5,5,7,7,5],X:[5,5,2,5,5],Y:[5,5,2,2,2],Z:[7,1,2,4,7],
'0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'3':[6,1,2,1,6],'4':[5,5,7,1,1],'5':[7,4,6,1,6],
'6':[3,4,6,5,2],'7':[7,1,2,2,2],'8':[2,5,2,5,2],'9':[2,5,3,1,6],' ':[0,0,0,0,0],'.':[0,0,0,0,2],
':':[0,2,0,2,0],'-':[0,0,7,0,0],'/':[1,1,2,4,4],'>':[4,2,1,2,4],'_':[0,0,0,0,7],'#':[5,7,5,7,5],'!':[2,2,2,0,2]};
function mb32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function parse(h){h=(''+h).replace('#','');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};}
function mixc(a,b,t){return {r:a.r+(b.r-a.r)*t,g:a.g+(b.g-a.g)*t,b:a.b+(b.b-a.b)*t};}
function rs(c,a){return `rgba(${c.r|0},${c.g|0},${c.b|0},${a})`;}
let store={};
function S(id,init){ if(!store[id]) store[id]=init(); return store[id]; }
function pixText(ctx,str,x,y,px,col){ str=(''+str).toUpperCase(); let cx=x;
  for(const ch of str){ const g=FONT[ch]||FONT[' ']; for(let r=0;r<5;r++)for(let c=0;c<3;c++){ if((g[r]>>(2-c))&1){ ctx.fillStyle=col; ctx.fillRect(cx+c*px,y+r*px,px-0.5,px-0.5);} } cx+=4*px; } return cx-x; }
function pixWidth(str,px){ return (''+str).length*4*px; }
function proj(v,rx,ry,rz,cx,cy,scale,dist){ let {x,y,z}=v;
  let c=Math.cos(rx),s=Math.sin(rx); let y1=y*c-z*s,z1=y*s+z*c; y=y1;z=z1;
  c=Math.cos(ry);s=Math.sin(ry); let x1=x*c+z*s; z1=z*c-x*s; x=x1;z=z1;
  c=Math.cos(rz);s=Math.sin(rz); x1=x*c-y*s; y1=x*s+y*c; x=x1;y=y1;
  const f=dist/(dist+z); return {x:cx+x*scale*f, y:cy+y*scale*f, z, f}; }
function meshCube(){const v=[];for(let i=0;i<8;i++)v.push({x:(i&1?1:-1),y:(i&2?1:-1),z:(i&4?1:-1)});
  const e=[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];return {v,e};}
function meshTetra(){const v=[{x:1,y:1,z:1},{x:-1,y:-1,z:1},{x:-1,y:1,z:-1},{x:1,y:-1,z:-1}];
  const e=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];return {v,e};}
function meshOcta(){const v=[{x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:-1,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1}];
  const e=[[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]];return {v,e};}
function meshTorus(R=1,r=0.4,N=14,M=8){const v=[],e=[];for(let i=0;i<N;i++)for(let j=0;j<M;j++){
  const u=i/N*Math.PI*2,vv=j/M*Math.PI*2; v.push({x:(R+r*Math.cos(vv))*Math.cos(u),y:(R+r*Math.cos(vv))*Math.sin(u),z:r*Math.sin(vv)});
  const a=i*M+j,b=((i+1)%N)*M+j,c2=i*M+(j+1)%M; e.push([a,b]);e.push([a,c2]); } return {v,e};}
function meshSphere(N=9,M=12){const v=[],e=[];for(let i=0;i<=N;i++)for(let j=0;j<M;j++){
  const th=i/N*Math.PI,ph=j/M*Math.PI*2; v.push({x:Math.sin(th)*Math.cos(ph),y:Math.cos(th),z:Math.sin(th)*Math.sin(ph)});
  const a=i*M+j; if(i<N){e.push([a,a+M]);} e.push([a,i*M+(j+1)%M]); } return {v,e};}
function meshHelix(N=40,turns=3){const v=[],e=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2*turns;
  v.push({x:Math.cos(a),y:i/N*2-1,z:Math.sin(a)}); if(i)e.push([i-1,i]);} return {v,e};}
function meshPyramid(){const v=[{x:0,y:-1,z:0},{x:-1,y:1,z:-1},{x:1,y:1,z:-1},{x:1,y:1,z:1},{x:-1,y:1,z:1}];
  const e=[[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1]];return {v,e};}
function meshStar(){const v=[],e=[];const o=[{x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:-1,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1}];
  for(const p of o){v.push(p);v.push({x:p.x*0.35+0.001,y:p.y*0.35+0.001,z:p.z*0.35});}
  for(let i=0;i<o.length;i++){e.push([i*2,i*2+1]);} return {v,e};}
function meshDoubleHelix(){const v=[],e=[];const N=24;for(let i=0;i<N;i++){const a=i/N*Math.PI*2*2.5;const yy=i/N*2-1;
  v.push({x:Math.cos(a)*0.7,y:yy,z:Math.sin(a)*0.7});v.push({x:Math.cos(a+Math.PI)*0.7,y:yy,z:Math.sin(a+Math.PI)*0.7});
  if(i){e.push([(i-1)*2,i*2]);e.push([(i-1)*2+1,i*2+1]);} if(i%2===0)e.push([i*2,i*2+1]);}return {v,e};}
function meshTunnel(){const v=[],e=[];const rings=8,seg=8;for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){const a=s/seg*Math.PI*2;
  v.push({x:Math.cos(a),y:Math.sin(a),z:r/rings*4-2});const idx=r*seg+s;e.push([idx,r*seg+(s+1)%seg]);if(r<rings-1)e.push([idx,(r+1)*seg+s]);}return {v,e};}
function eGlyph(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{
  const fs = cfg.font==='pixel'? 0 : (small?10:12);
  const cw = cfg.font==='pixel'? (small?5:7) : (fs*0.62), ch = cfg.font==='pixel'? (small?9:12): (fs+2);
  const cols=Math.max(1,Math.floor(w/(cfg.font==='pixel'?cw*4:cw))), rows=Math.max(1,Math.floor(h/ch));
  if(cfg.font!=='pixel') ctx.font=`${fs}px ${cfg.face||"'Courier New',monospace"}`;
  ctx.textBaseline='top';
  const set=CS[cfg.set]||CS.kata;
  const st=S(id,()=>({cols:[],lines:[]}));
  if(cfg.motion==='rain'){
    if(st.cols.length!==cols){st.cols=[];for(let i=0;i<cols;i++)st.cols.push({y:g()*rows,sp:2+g()*6});}
    for(let i=0;i<cols;i++){const c=st.cols[i];c.y+=c.sp*(deltaTime/1000)*A.speed; if(c.y>rows+6)c.y=-g()*rows;
      for(let k=0;k<7;k++){const ry=Math.floor(c.y)-k; if(ry<0||ry>rows)continue;
        const cch=set[Math.floor(noise(i*2.1,ry*0.3,t*0.4)*set.length)%set.length];
        const col=k===0?`rgba(${Math.min(255,P.ph.r+90)},255,${Math.min(255,P.ph.b+120)},.95)`:rs(P.ph,Math.max(0,.7-k*.11));
        if(cfg.font==='pixel')pixText(ctx,cch.match(/[A-Z0-9]/i)?cch:'#',x+i*cw*4,y+ry*ch,cw>4?2:1,col);
        else{ctx.fillStyle=col;ctx.fillText(cch,x+i*cw,y+ry*ch);} } }
  } else if(cfg.motion==='wave'){
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const v=noise(c*0.25,r*0.25,t*0.5*A.speed); const cch=set[Math.floor(v*set.length)%set.length];
      ctx.fillStyle=rs(mixc(P.ph,P.sg,v*0.5),0.25+v*0.6); ctx.fillText(cch,x+c*cw,y+r*ch); }
  } else if(cfg.motion==='scroll'){
    const sc=(t*1.5*A.speed)%1; const off=Math.floor(t*1.5*A.speed);
    for(let r=-1;r<rows;r++){const gg=mb32((A.seed+id*131+ (off+r)*977)>>>0); let line='';
      const len=Math.floor(cols); for(let c=0;c<len;c++) line+=set[Math.floor(gg()*set.length)];
      const yy=y+(r+1-sc)*ch; ctx.fillStyle=rs(P.ph,0.4+0.4*(r/rows));
      if(cfg.font==='pixel')pixText(ctx,(cfg.set==='hex'?line.slice(0,Math.floor(w/(cw*4))):'GNU IN '+off),x+2,yy,cw>4?2:1,rs(P.ph,0.6)); else ctx.fillText(line,x+2,yy); }
  } else if(cfg.motion==='banner'){
    const msg=cfg.msg||'GNU IN GNOSIS 0.14.2 '; const px=small?2:3; const tw=pixWidth(msg,px);
    const ox=(x - (t*40*A.speed)%(tw)); const cy=y+h/2-2.5*px;
    for(let k=-1;k<Math.ceil(w/tw)+1;k++) pixText(ctx,msg,ox+k*tw,cy,px,rs(P.ph,0.9));
  } else if(cfg.motion==='ui'){
    ctx.fillStyle=rs(P.ph,0.6); for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      let chr=' '; if(r===0||r===rows-1)chr='═'; if(c===0||c===cols-1)chr='║';
      if(r===0&&c===0)chr='╔'; if(r===0&&c===cols-1)chr='╗'; if(r===rows-1&&c===0)chr='╚'; if(r===rows-1&&c===cols-1)chr='╝';
      const blink=(Math.floor(t*2+c+r)%9===0)?0.9:0.45;
      if(chr!==' '){ctx.fillStyle=rs(P.ph,blink);ctx.fillText(chr,x+c*cw,y+r*ch);} }
    ctx.fillStyle=rs(P.sg,0.9); ctx.fillText('> '+set[Math.floor(t*3)%set.length]+(Math.floor(t*2)%2?'_':' '),x+cw*2,y+ch*Math.floor(rows/2));
  } else if(cfg.motion==='spinners'){
    const SP=['⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏','◐◓◑◒','▖▘▝▗','◴◷◶◵','⣾⣽⣻⢿⡿⣟⣯⣷','|/-\\','⠁⠂⠄⡀⢀⠠⠐⠈'];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const sp=SP[(r*cols+c)%SP.length];
      ctx.fillStyle=rs(P.ph,0.8);ctx.fillText(sp[Math.floor(t*8+r+c)%sp.length],x+c*cw,y+r*ch);}
  }
};}
function eBraille(field){ return (ctx,x,y,w,h,t,P,g,id,small)=>{
  const cw=small?5:6, chh=small?9:11, cols=Math.floor(w/cw), rows=Math.floor(h/chh);
  ctx.font=`${small?10:13}px 'Courier New',monospace`; ctx.textBaseline='top';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ let mask=0; const map=[0x1,0x2,0x4,0x40,0x8,0x10,0x20,0x80];
    for(let dy=0;dy<4;dy++)for(let dx=0;dx<2;dx++){ const fx=(c*2+dx)/(cols*2), fy=(r*4+dy)/(rows*4);
      if(field(fx,fy,t*A.speed)>0.5) mask|=map[dx*4+dy]; }
    if(mask){ const v=field((c+.5)/cols,(r+.5)/rows,t*A.speed);
      ctx.fillStyle=rs(mixc(P.ph,P.sg,Math.max(0,v-0.5)),0.85);
      ctx.fillText(String.fromCharCode(0x2800+mask),x+c*cw,y+r*chh); } }
};}
function eAscii(field){ return (ctx,x,y,w,h,t,P,g,id,small)=>{
  const cw=small?6:7, chh=small?9:11, cols=Math.floor(w/cw), rows=Math.floor(h/chh);
  ctx.font=`${small?11:13}px 'Courier New',monospace`; ctx.textBaseline='top'; const ramp=CS.shade;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const v=Math.max(0,Math.min(0.999,field((c+.5)/cols,(r+.5)/rows,t*A.speed,cols,rows)));
    const ch=ramp[Math.floor(v*ramp.length)]; if(ch===' ')continue;
    ctx.fillStyle=rs(mixc(P.ph,P.sg,v*0.4),0.35+v*0.6); ctx.fillText(ch,x+c*cw,y+r*chh); }
};}
function eCurve(eq,opt){ opt=opt||{}; return (ctx,x,y,w,h,t,P,g,id,small)=>{
  const cx=x+w/2,cy=y+h/2,R=Math.min(w,h)*0.42, N=opt.n||(opt.dots?420:600), tt=t*A.speed;
  if(opt.dots){ for(let i=0;i<N;i++){const p=eq(i,tt,N); const px=cx+p.x*R,py=cy+p.y*R;
      ctx.fillStyle=rs(mixc(P.ph,P.sg,i/N),0.8); ctx.beginPath();ctx.arc(px,py,small?1:1.6,0,6.283);ctx.fill(); } return; }
  if(A.bloom>0){ctx.shadowColor=rs(P.ph,0.7);ctx.shadowBlur=A.bloom*0.6;}
  ctx.lineWidth=small?1:1.4; ctx.beginPath();
  for(let i=0;i<=N;i++){const p=eq(i/N*Math.PI*2*(opt.loops||1),tt,i/N); const px=cx+p.x*R,py=cy+p.y*R; i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.strokeStyle=rs(P.ph,0.85); ctx.stroke(); ctx.shadowBlur=0;
};}
function eWire(meshFn,opt){ opt=opt||{}; let M=null; return (ctx,x,y,w,h,t,P,g,id,small)=>{
  if(!M)M=meshFn(); const cx=x+w/2,cy=y+h/2,sc=Math.min(w,h)*(opt.scale||0.32),tt=t*A.speed;
  const rx=tt*0.6+(opt.rx||0), ry=tt*0.8, rz=opt.rz?tt*0.3:0;
  const pts=M.v.map(v=>proj(v,rx,ry,rz,cx,cy,sc,opt.dist||3.2));
  if(A.bloom>0){ctx.shadowColor=rs(P.ph,0.6);ctx.shadowBlur=A.bloom*0.5;} ctx.lineWidth=small?0.8:1.2;
  for(const e of M.e){const a=pts[e[0]],b=pts[e[1]]; const dep=(a.z+b.z)/2;
    ctx.strokeStyle=rs(mixc(P.ph,P.sg,0.5-dep*0.2),Math.max(0.15,0.75-dep*0.18));
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  ctx.shadowBlur=0; if(opt.verts) for(const p of pts){ctx.fillStyle=rs(P.sg,0.8);ctx.beginPath();ctx.arc(p.x,p.y,1.4,0,6.283);ctx.fill();}
};}
function eTesseract(){ const V=[]; for(let i=0;i<16;i++)V.push([(i&1?1:-1),(i&2?1:-1),(i&4?1:-1),(i&8?1:-1)]);
  const E=[]; for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){let d=0;for(let k=0;k<4;k++)if(V[i][k]!==V[j][k])d++;if(d===1)E.push([i,j]);}
  return (ctx,x,y,w,h,t,P,g,id,small)=>{ const cx=x+w/2,cy=y+h/2,sc=Math.min(w,h)*0.30,tt=t*A.speed;
    const a=tt*0.5,b=tt*0.3; const pts=V.map(p=>{ let [X,Y,Z,Wd]=p;
      let c=Math.cos(a),s=Math.sin(a); let x1=X*c-Wd*s,w1=X*s+Wd*c; X=x1;Wd=w1;
      c=Math.cos(b);s=Math.sin(b); let y1=Y*c-Z*s,z1=Y*s+Z*c; Y=y1;Z=z1;
      const k=2/(2.6-Wd); return proj({x:X*k,y:Y*k,z:Z*k},tt*0.4,tt*0.6,0,cx,cy,sc,3.4); });
    if(A.bloom>0){ctx.shadowColor=rs(P.sg,0.6);ctx.shadowBlur=A.bloom*0.5;} ctx.lineWidth=small?0.7:1;
    for(const e of E){const Aa=pts[e[0]],Bb=pts[e[1]]; ctx.strokeStyle=rs(mixc(P.ph,P.sg,0.5),0.5);ctx.beginPath();ctx.moveTo(Aa.x,Aa.y);ctx.lineTo(Bb.x,Bb.y);ctx.stroke();}
    ctx.shadowBlur=0; };}
function ePlasma(fn){ return (ctx,x,y,w,h,t,P,g,id,small)=>{
  const bs=small?9:7, cols=Math.ceil(w/bs), rows=Math.ceil(h/bs), tt=t*A.speed;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const v=fn((c+.5)/cols,(r+.5)/rows,tt);
    const cc=mixc(mixc(P.wp,P.ph,Math.max(0,v)),P.sg,Math.max(0,v-0.6)*1.5);
    ctx.fillStyle=`rgb(${cc.r|0},${cc.g|0},${cc.b|0})`; ctx.fillRect(x+c*bs,y+r*bs,bs+0.5,bs+0.5); }
};}
function eField(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed;
  const vec=cfg.vec||((fx,fy)=>noise(fx*3,fy*3,tt*0.3)*Math.PI*4);
  if(cfg.mode==='arrows'){ const step=small?16:20;
    for(let yy=step/2;yy<h;yy+=step)for(let xx=step/2;xx<w;xx+=step){ const a=vec(xx/w,yy/h,tt);
      ctx.strokeStyle=rs(mixc(P.ph,P.sg,(Math.sin(a)+1)/2),0.6); ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x+xx,y+yy);ctx.lineTo(x+xx+Math.cos(a)*step*0.4,y+yy+Math.sin(a)*step*0.4);ctx.stroke(); } return; }
  if(cfg.mode==='stream'){ const seeds=small?16:30;
    for(let s2=0;s2<seeds;s2++){ let px=g()*w,py=g()*h; ctx.beginPath();ctx.moveTo(x+px,y+py);
      for(let k=0;k<26;k++){const a=vec(px/w,py/h,tt);px+=Math.cos(a)*4;py+=Math.sin(a)*4;if(px<0||px>w||py<0||py>h)break;ctx.lineTo(x+px,y+py);}
      ctx.strokeStyle=rs(P.ph,0.4);ctx.lineWidth=1;ctx.stroke(); } return; }
  if(cfg.mode==='dipole'){ const p1={x:w*0.35,y:h*0.5},p2={x:w*0.65,y:h*0.5}; const sw=Math.sin(tt)*0.3;
    for(let s2=0;s2<(small?14:24);s2++){ const a0=s2/(small?14:24)*Math.PI*2; let px=p1.x+Math.cos(a0)*6,py=p1.y+Math.sin(a0)*6;
      ctx.beginPath();ctx.moveTo(x+px,y+py);
      for(let k=0;k<60;k++){ let dx1=px-p1.x,dy1=py-p1.y,d1=Math.hypot(dx1,dy1)+1; let dx2=px-p2.x,dy2=py-p2.y,d2=Math.hypot(dx2,dy2)+1;
        let fx=dx1/(d1*d1*d1)-dx2/(d2*d2*d2)*(1+sw), fy=dy1/(d1*d1*d1)-dy2/(d2*d2*d2)*(1+sw); const m=Math.hypot(fx,fy)+1e-6;
        px+=fx/m*4;py+=fy/m*4; if(px<0||px>w||py<0||py>h||d2<8)break; ctx.lineTo(x+px,y+py); }
      ctx.strokeStyle=rs(P.ph,0.45);ctx.lineWidth=1;ctx.stroke(); }
    ctx.fillStyle=rs(P.sg,0.9);ctx.beginPath();ctx.arc(x+p1.x,y+p1.y,3,0,6.283);ctx.fill();
    ctx.fillStyle=rs(P.ph,0.9);ctx.beginPath();ctx.arc(x+p2.x,y+p2.y,3,0,6.283);ctx.fill(); return; }
  const st=S(id,()=>{const a=[];const n=small?90:200;for(let i=0;i<n;i++)a.push({x:g(),y:g(),px:0,py:0});return a;});
  for(const p of st){ p.px=p.x;p.py=p.y; const a=vec(p.x,p.y,tt); p.x+=Math.cos(a)*0.004*(0.5+A.speed);p.y+=Math.sin(a)*0.004*(0.5+A.speed);
    if(p.x<0||p.x>1||p.y<0||p.y>1){p.x=g();p.y=g();p.px=p.x;p.py=p.y;}
    const v=(Math.sin(a)+1)/2; ctx.strokeStyle=rs(mixc(P.ph,P.sg,v),cfg.curl?0.5:0.7);ctx.lineWidth=cfg.curl?1.4:1;
    ctx.beginPath();ctx.moveTo(x+p.px*w,y+p.py*h);ctx.lineTo(x+p.x*w,y+p.y*h);ctx.stroke(); }
};}
function eTiling(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed;
  if(cfg.mode==='truchet'){ const s=small?22:30,cols=Math.ceil(w/s),rows=Math.ceil(h/s);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const gg=mb32((A.seed+id+r*97+c*131)>>>0); const flip=(gg()+0.2*Math.sin(tt+r+c))>0.5;
      const cx=x+c*s,cy=y+r*s; ctx.strokeStyle=rs(P.ph,0.6);ctx.lineWidth=1.4; ctx.beginPath();
      if(flip){ctx.arc(cx,cy,s/2,0,Math.PI/2);ctx.moveTo(cx+s,cy+s);ctx.arc(cx+s,cy+s,s/2,Math.PI,Math.PI*1.5);}
      else{ctx.arc(cx+s,cy,s/2,Math.PI/2,Math.PI);ctx.moveTo(cx,cy+s);ctx.arc(cx,cy+s,s/2,Math.PI*1.5,Math.PI*2);} ctx.stroke(); } return; }
  if(cfg.mode==='hex'){ const s=small?12:16,wsp=s*1.5,hsp=s*1.732; const cols=Math.ceil(w/wsp)+1,rows=Math.ceil(h/hsp)+1;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const cx=x+c*wsp,cy=y+r*hsp+(c%2?hsp/2:0); const v=noise(c*0.3,r*0.3,tt*0.4);
      ctx.fillStyle=rs(mixc(P.wp,P.ph,0.2+v*0.7),0.9); ctx.beginPath();
      for(let k=0;k<6;k++){const a=k*Math.PI/3;const px=cx+Math.cos(a)*s*0.55,py=cy+Math.sin(a)*s*0.55;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill(); } return; }
  if(cfg.mode==='triwave'||cfg.mode==='ripple'){ const s=small?16:22,cols=Math.ceil(w/s),rows=Math.ceil(h/s);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ const d=Math.hypot(c-cols/2,r-rows/2);
      const v=cfg.mode==='ripple'?0.5+0.5*Math.sin(d*0.9-tt*3):0.5+0.5*Math.sin(c*0.5+r*0.3+tt*2);
      ctx.fillStyle=rs(mixc(P.wp,P.ph,v),0.9); const cx=x+c*s,cy=y+r*s;
      if(cfg.mode==='triwave'){ctx.beginPath();ctx.moveTo(cx,cy+s);ctx.lineTo(cx+s/2,cy+s-v*s);ctx.lineTo(cx+s,cy+s);ctx.closePath();ctx.fill();}
      else ctx.fillRect(cx+1,cy+1,s-2,s-2); } return; }
  if(cfg.mode==='terrain'){ const cols=small?20:30; const cs=w/cols; ctx.strokeStyle=rs(P.ph,0.5);ctx.lineWidth=1;
    for(let r=0;r<cols*0.7;r++){ ctx.beginPath(); for(let c=0;c<=cols;c++){ const hh=noise(c*0.25,r*0.25,tt*0.3)*h*0.3;
      const px=x+c*cs - r*cs*0.15, py=y+r*(h/(cols*0.7))*0.8 + h*0.15 - hh; c?ctx.lineTo(px,py):ctx.moveTo(px,py);} ctx.stroke(); } return; }
  if(cfg.mode==='treemap'){ const st=S(id,()=>{const a=[];function sub(x0,y0,w0,h0,d){ if(d<=0||w0<14||h0<14){a.push({x:x0,y:y0,w:w0,h:h0,p:g()});return;}
      if(w0>h0){const r=0.3+g()*0.4;sub(x0,y0,w0*r,h0,d-1);sub(x0+w0*r,y0,w0*(1-r),h0,d-1);}else{const r=0.3+g()*0.4;sub(x0,y0,w0,h0*r,d-1);sub(x0,y0+h0*r,w0,h0*(1-r),d-1);} }
      sub(0,0,w,h,5);return a;});
    for(const c of st){ const v=0.3+0.5*(0.5+0.5*Math.sin(tt+c.p*10)); ctx.fillStyle=rs(mixc(P.wp,P.ph,v*c.p+0.1),0.9);
      ctx.fillRect(x+c.x+1,y+c.y+1,c.w-2,c.h-2); ctx.strokeStyle=rs(P.ph,0.4);ctx.strokeRect(x+c.x+1,y+c.y+1,c.w-2,c.h-2);} return; }
  if(cfg.mode==='matrix'){ const n=small?10:14,cs=Math.min(w,h)/n,ox=x+(w-cs*n)/2,oy=y+(h-cs*n)/2;
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){ const v=0.5+0.5*Math.sin(r*c*0.3+tt*2+noise(r,c)*6); ctx.fillStyle=rs(mixc(P.wp,P.ph,v),0.9);
      ctx.fillRect(ox+c*cs+1,oy+r*cs+1,cs-2,cs-2); } return; }
  if(cfg.mode==='maze'){ const st=S(id,()=>{const cs=small?16:22;const cols=Math.max(3,Math.floor(w/cs)),rows=Math.max(3,Math.floor(h/cs));const cells=[];for(let i=0;i<cols*rows;i++)cells.push({v:false,wr:true,wd:true});cells[0].v=true;return {cols,rows,cells,stack:[0]};});
    const cols=st.cols,rows=st.rows,cellW=w/cols,cellH=h/rows;
    for(let it=0;it<2;it++){ if(!st.stack.length)continue; const cur=st.stack[st.stack.length-1];const cc=cur%cols,cr=Math.floor(cur/cols);
      const nb=[]; if(cc<cols-1&&!st.cells[cur+1].v)nb.push([cur+1,'r']); if(cr<rows-1&&!st.cells[cur+cols].v)nb.push([cur+cols,'d']);
      if(cc>0&&!st.cells[cur-1].v)nb.push([cur-1,'lr']); if(cr>0&&!st.cells[cur-cols].v)nb.push([cur-cols,'ud']);
      if(nb.length){const[nn,dir]=nb[Math.floor(g()*nb.length)]; if(dir==='r')st.cells[cur].wr=false;if(dir==='d')st.cells[cur].wd=false;if(dir==='lr')st.cells[nn].wr=false;if(dir==='ud')st.cells[nn].wd=false; st.cells[nn].v=true;st.stack.push(nn);} else st.stack.pop(); }
    ctx.strokeStyle=rs(P.ph,0.6);ctx.lineWidth=1; for(let i=0;i<st.cells.length;i++){const c2=i%cols,r2=Math.floor(i/cols);const px=x+c2*cellW,py=y+r2*cellH;
      if(st.cells[i].wr){ctx.beginPath();ctx.moveTo(px+cellW,py);ctx.lineTo(px+cellW,py+cellH);ctx.stroke();}
      if(st.cells[i].wd){ctx.beginPath();ctx.moveTo(px,py+cellH);ctx.lineTo(px+cellW,py+cellH);ctx.stroke();} }
    if(st.stack.length){const cur=st.stack[st.stack.length-1];ctx.fillStyle=rs(P.sg,0.8);ctx.fillRect(x+(cur%cols)*cellW+2,y+Math.floor(cur/cols)*cellH+2,cellW-4,cellH-4);} return; }
};}
function eVoronoi(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed;
  const st=S(id,()=>{const a=[];const n=small?7:12;for(let i=0;i<n;i++)a.push({x:g(),y:g(),vx:(g()-0.5)*0.1,vy:(g()-0.5)*0.1,h:g()});return a;});
  for(const s of st){s.x+=s.vx*0.003*A.speed;s.y+=s.vy*0.003*A.speed;if(s.x<0||s.x>1)s.vx*=-1;if(s.y<0||s.y>1)s.vy*=-1;}
  const step=small?7:5;
  if(cfg.mode!=='delaunay'){ for(let yy=0;yy<h;yy+=step)for(let xx=0;xx<w;xx+=step){ let m=9,m2=9,bi=0;
    for(let i=0;i<st.length;i++){const d=Math.hypot(xx/w-st[i].x,yy/h-st[i].y);if(d<m){m2=m;m=d;bi=i;}else if(d<m2)m2=d;}
    let cc; if(cfg.mode==='worley')cc=mixc(P.wp,P.ph,Math.min(1,m*4)); else cc=mixc(mixc(P.wp,P.ph,0.25+st[bi].h*0.6),P.sg,(m2-m)<0.012?0.8:0);
    ctx.fillStyle=`rgb(${cc.r|0},${cc.g|0},${cc.b|0})`;ctx.fillRect(x+xx,y+yy,step+0.5,step+0.5); } }
  else { ctx.strokeStyle=rs(P.ph,0.5);ctx.lineWidth=1; for(let i=0;i<st.length;i++)for(let j=i+1;j<st.length;j++){ const d=Math.hypot(st[i].x-st[j].x,st[i].y-st[j].y); if(d<0.4){ctx.beginPath();ctx.moveTo(x+st[i].x*w,y+st[i].y*h);ctx.lineTo(x+st[j].x*w,y+st[j].y*h);ctx.stroke();}}
    for(const s of st){ctx.fillStyle=rs(P.sg,0.85);ctx.beginPath();ctx.arc(x+s.x*w,y+s.y*h,2.5,0,6.283);ctx.fill();} }
};}
function eParticles(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed, dt=Math.min(deltaTime,40)/1000*A.speed; const m=cfg.mode;
  if(m==='boids'){ const st=S(id,()=>{const a=[];for(let i=0;i<(small?18:34);i++)a.push({x:g(),y:g(),a:g()*6.28});return a;});
    for(const b of st){ let ax=0,ay=0,n=0; for(const o of st){const d=Math.hypot(o.x-b.x,o.y-b.y);if(d<0.18&&d>0){ax+=Math.cos(o.a);ay+=Math.sin(o.a);n++; if(d<0.05){ax-=(o.x-b.x)*4;ay-=(o.y-b.y)*4;}}}
      if(n){const ta=Math.atan2(ay,ax);let da=ta-b.a;while(da>Math.PI)da-=6.28;while(da<-Math.PI)da+=6.28;b.a+=da*0.1;}
      b.x+=Math.cos(b.a)*0.004;b.y+=Math.sin(b.a)*0.004;b.x=(b.x+1)%1;b.y=(b.y+1)%1;
      ctx.fillStyle=rs(P.ph,0.85);ctx.save();ctx.translate(x+b.x*w,y+b.y*h);ctx.rotate(b.a);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-3,2);ctx.lineTo(-3,-2);ctx.closePath();ctx.fill();ctx.restore(); } return; }
  if(m==='gravity'||m==='nbody'){ const st=S(id,()=>{const a=[];const n=m==='nbody'?(small?5:8):(small?20:40);for(let i=0;i<n;i++)a.push({x:(g()-0.5),y:(g()-0.5),vx:(g()-0.5)*0.3,vy:(g()-0.5)*0.3,mass:m==='nbody'?0.5+g():0.2});return a;});
    if(m==='gravity'){ for(const p of st){const d=Math.hypot(p.x,p.y)+0.05;const f=-0.04/(d*d);p.vx+=p.x/d*f;p.vy+=p.y/d*f;p.x+=p.vx*dt;p.y+=p.vy*dt;
      ctx.fillStyle=rs(mixc(P.ph,P.sg,Math.min(1,Math.hypot(p.vx,p.vy))),0.8);ctx.beginPath();ctx.arc(x+w/2+p.x*w*0.45,y+h/2+p.y*h*0.45,1.6,0,6.283);ctx.fill();}
      ctx.fillStyle=rs(P.sg,0.9);ctx.beginPath();ctx.arc(x+w/2,y+h/2,4,0,6.283);ctx.fill(); }
    else { for(let i=0;i<st.length;i++){const p=st[i];for(let j=0;j<st.length;j++){if(i===j)continue;const o=st[j];let dx=o.x-p.x,dy=o.y-p.y;const d=Math.hypot(dx,dy)+0.08;const f=0.01*o.mass/(d*d);p.vx+=dx/d*f*dt*60;p.vy+=dy/d*f*dt*60;}}
      for(const p of st){p.x+=p.vx*dt;p.y+=p.vy*dt;if(Math.abs(p.x)>0.5)p.vx*=-0.9;if(Math.abs(p.y)>0.5)p.vy*=-0.9;p.x=Math.max(-0.5,Math.min(0.5,p.x));p.y=Math.max(-0.5,Math.min(0.5,p.y));
        ctx.fillStyle=rs(P.ph,0.85);ctx.beginPath();ctx.arc(x+w/2+p.x*w,y+h/2+p.y*h,2+p.mass*2,0,6.283);ctx.fill();} } return; }
  if(m==='dla'){ const st=S(id,()=>({pts:[{x:0.5,y:0.5}],walker:null})); if(!st.walker){const a=g()*6.28;st.walker={x:0.5+Math.cos(a)*0.45,y:0.5+Math.sin(a)*0.45};}
    for(let it=0;it<40;it++){ const wk=st.walker; wk.x+=(g()-0.5)*0.02;wk.y+=(g()-0.5)*0.02; let stick=false;
      for(const p of st.pts){if(Math.hypot(p.x-wk.x,p.y-wk.y)<0.018){stick=true;break;}}
      if(stick){st.pts.push({x:wk.x,y:wk.y});const a=g()*6.28;st.walker={x:0.5+Math.cos(a)*0.45,y:0.5+Math.sin(a)*0.45};} }
    for(let i=0;i<st.pts.length;i++){const p=st.pts[i];ctx.fillStyle=rs(mixc(P.sg,P.ph,i/st.pts.length),0.85);ctx.beginPath();ctx.arc(x+p.x*w,y+p.y*h,2,0,6.283);ctx.fill();} return; }
  if(m==='fireflies'){ const st=S(id,()=>{const a=[];for(let i=0;i<(small?16:30);i++)a.push({x:g(),y:g(),p:g()*6.28});return a;});
    for(const f of st){f.x+=Math.cos(tt*0.5+f.p)*0.0015;f.y+=Math.sin(tt*0.4+f.p*1.3)*0.0015;f.x=(f.x+1)%1;f.y=(f.y+1)%1;const gl=0.5+0.5*Math.sin(tt*2+f.p);
      if(A.bloom>0){ctx.shadowColor=rs(P.ph,0.9);ctx.shadowBlur=A.bloom;}ctx.fillStyle=rs(P.ph,0.4+gl*0.5);ctx.beginPath();ctx.arc(x+f.x*w,y+f.y*h,1.5+gl*2,0,6.283);ctx.fill();ctx.shadowBlur=0;} return; }
  if(m==='starfield'){ const st=S(id,()=>{const a=[];for(let i=0;i<(small?60:140);i++)a.push({x:g()*2-1,y:g()*2-1,z:g()});return a;});
    for(const s of st){s.z-=0.006*A.speed;if(s.z<=0.02){s.x=g()*2-1;s.y=g()*2-1;s.z=1;}const px=x+w/2+s.x/s.z*w*0.3,py=y+h/2+s.y/s.z*h*0.3;
      if(px>=x&&px<=x+w&&py>=y&&py<=y+h){ctx.fillStyle=rs(P.ph,Math.min(1,(1-s.z)));ctx.fillRect(px,py,(1-s.z)*2.5,(1-s.z)*2.5);}} return; }
  if(m==='spring'||m==='cloth'){ const st=S(id,()=>{const NN=small?7:9;const a=[];for(let r=0;r<NN;r++){a.push([]);for(let c=0;c<NN;c++)a[r].push({x:c/(NN-1),y:r/(NN-1),ox:c/(NN-1),oy:r/(NN-1),vx:0,vy:0});}return a;}); const N=st.length;
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){const p=st[r][c];const tx=p.ox+Math.sin(tt+r*0.6+c*0.4)*0.04,ty=p.oy+Math.cos(tt*1.1+c*0.5)*0.04;
      p.vx+=(tx-p.x)*0.1;p.vy+=(ty-p.y)*0.1;p.vx*=0.9;p.vy*=0.9;p.x+=p.vx;p.y+=p.vy;}
    ctx.strokeStyle=rs(P.ph,0.5);ctx.lineWidth=1; for(let r=0;r<N;r++)for(let c=0;c<N;c++){const p=st[r][c];
      if(c<N-1){const q=st[r][c+1];ctx.beginPath();ctx.moveTo(x+p.x*w,y+p.y*h);ctx.lineTo(x+q.x*w,y+q.y*h);ctx.stroke();}
      if(r<N-1){const q=st[r+1][c];ctx.beginPath();ctx.moveTo(x+p.x*w,y+p.y*h);ctx.lineTo(x+q.x*w,y+q.y*h);ctx.stroke();}} return; }
  if(m==='pendwave'){ const n=small?12:20; for(let i=0;i<n;i++){const len=0.3+i/n*0.6;const per=2+i*0.06;const a=Math.sin(tt/per*2)*0.9;
    const ox=x+w*(i+0.5)/n, oy=y+8; const px=ox+Math.sin(a)*h*len*0.5, py=oy+Math.cos(a)*h*len*0.5;
    ctx.strokeStyle=rs(P.ph,0.3);ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(px,py);ctx.stroke();
    if(A.bloom>0){ctx.shadowColor=rs(P.sg,0.8);ctx.shadowBlur=A.bloom*0.7;}ctx.fillStyle=rs(mixc(P.ph,P.sg,i/n),0.95);ctx.beginPath();ctx.arc(px,py,small?2.5:4,0,6.283);ctx.fill();ctx.shadowBlur=0;} return; }
  if(m==='double'){ const st=S(id,()=>({a1:Math.PI/2+g(),a2:Math.PI/2,p1:0,p2:0,trail:[]}));
    const g0=1.2; for(let it=0;it<3;it++){ const {a1,a2,p1,p2}=st; const m1=1,m2=1,l1=0.25,l2=0.25;
      const num1=-g0*(2*m1+m2)*Math.sin(a1)-m2*g0*Math.sin(a1-2*a2)-2*Math.sin(a1-a2)*m2*(p2*p2*l2+p1*p1*l1*Math.cos(a1-a2));
      const den1=l1*(2*m1+m2-m2*Math.cos(2*a1-2*a2)); const a1a=num1/den1;
      const num2=2*Math.sin(a1-a2)*(p1*p1*l1*(m1+m2)+g0*(m1+m2)*Math.cos(a1)+p2*p2*l2*m2*Math.cos(a1-a2));
      const den2=l2*(2*m1+m2-m2*Math.cos(2*a1-2*a2)); const a2a=num2/den2;
      st.p1+=a1a*0.018*A.speed;st.p2+=a2a*0.018*A.speed;st.a1+=st.p1*0.018*A.speed;st.a2+=st.p2*0.018*A.speed; }
    const ox=x+w/2,oy=y+h*0.4;const x1=ox+Math.sin(st.a1)*h*0.25,y1=oy+Math.cos(st.a1)*h*0.25;const x2=x1+Math.sin(st.a2)*h*0.25,y2=y1+Math.cos(st.a2)*h*0.25;
    st.trail.push({x:x2,y:y2});if(st.trail.length>40)st.trail.shift();
    ctx.strokeStyle=rs(P.sg,0.3);ctx.beginPath();st.trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.strokeStyle=rs(P.ph,0.8);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.fillStyle=rs(P.sg,0.9);ctx.beginPath();ctx.arc(x2,y2,3,0,6.283);ctx.fill(); return; }
};}
function eChart(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed,m=cfg.mode;
  const st=S(id,()=>({hist:[],bars:Array.from({length:6},()=>g()),v:g(),seedoff:g()*100}));
  if(m==='candle'){ const N=small?14:22; if(st.hist.length===0){let p=0.5;for(let i=0;i<N;i++){const o=p;p+=(g()-0.5)*0.12;st.hist.push({o,c:p,hi:Math.max(o,p)+g()*0.05,lo:Math.min(o,p)-g()*0.05});}}
    if(Math.floor(tt*2)!==st.last){st.last=Math.floor(tt*2);const o=st.hist[st.hist.length-1].c;let p=o+(g()-0.5)*0.12;p=Math.max(0.1,Math.min(0.9,p));st.hist.push({o,c:p,hi:Math.max(o,p)+g()*0.05,lo:Math.min(o,p)-g()*0.05});st.hist.shift();}
    const cw=w/N; for(let i=0;i<st.hist.length;i++){const c=st.hist[i];const up=c.c>=c.o;const col=up?P.ph:P.sg;ctx.strokeStyle=rs(col,0.8);ctx.fillStyle=rs(col,0.6);
      const cx=x+i*cw+cw/2;ctx.beginPath();ctx.moveTo(cx,y+(1-c.hi)*h);ctx.lineTo(cx,y+(1-c.lo)*h);ctx.stroke();
      ctx.fillRect(x+i*cw+2,y+(1-Math.max(c.o,c.c))*h,cw-4,Math.abs(c.c-c.o)*h+1);} return; }
  if(m==='line'||m==='area'){ st.hist.push(0.5+0.4*Math.sin(tt*1.5+st.seedoff)*noise(id,tt*0.5)); if(st.hist.length>w/3)st.hist.shift();
    ctx.beginPath();for(let i=0;i<st.hist.length;i++){const px=x+i/(w/3)*w,py=y+(1-st.hist[i])*h;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
    if(m==='area'){ctx.lineTo(x+st.hist.length/(w/3)*w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fillStyle=rs(P.ph,0.25);ctx.fill();}
    ctx.strokeStyle=rs(P.ph,0.85);ctx.lineWidth=1.5;ctx.stroke(); return; }
  if(m==='bars'){ for(let i=0;i<st.bars.length;i++)st.bars[i]+=(noise(i,tt*0.6)-0.5)*0.04;st.bars=st.bars.map(v=>Math.max(0.05,Math.min(1,v)));
    const sorted=[...st.bars.keys()].sort((a,b)=>st.bars[b]-st.bars[a]); const bh=h/st.bars.length;
    sorted.forEach((bi,rank)=>{const v=st.bars[bi];ctx.fillStyle=rs(mixc(P.ph,P.sg,rank/st.bars.length),0.8);ctx.fillRect(x,y+rank*bh+2,v*w*0.9,bh-4);
      ctx.fillStyle=rs(P.wp,0.9);ctx.font='9px monospace';ctx.textBaseline='middle';ctx.fillText('P'+bi,x+4,y+rank*bh+bh/2);}); return; }
  if(m==='scatter'||m==='bubble'){ if(!st.pts){st.pts=[];for(let i=0;i<(small?20:40);i++)st.pts.push({x:g(),y:g(),r:g(),p:g()*6.28});}
    for(const p of st.pts){const px=x+(p.x+Math.sin(tt*0.3+p.p)*0.04)*w,py=y+(p.y+Math.cos(tt*0.3+p.p)*0.04)*h;
      ctx.fillStyle=rs(mixc(P.ph,P.sg,p.r),m==='bubble'?0.4:0.8);ctx.beginPath();ctx.arc(px,py,m==='bubble'?2+p.r*8:2,0,6.283);ctx.fill();} return; }
  if(m==='heatmap'){ const cols=small?16:26,rows=small?10:14,cw=w/cols,ch=h/rows;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=noise(c*0.4,r*0.4,tt*0.5);ctx.fillStyle=rs(mixc(mixc(P.wp,P.ph,v),P.sg,Math.max(0,v-0.7)*3),0.95);ctx.fillRect(x+c*cw,y+r*ch,cw+0.5,ch+0.5);} return; }
  if(m==='polar'){ const cx=x+w/2,cy=y+h/2,R=Math.min(w,h)*0.42,bars=small?24:40;
    for(let i=0;i<bars;i++){const a=i/bars*6.283;const v=0.3+0.6*(0.5+0.5*Math.sin(tt*3+i*0.5+noise(i,tt)*4));
      ctx.strokeStyle=rs(mixc(P.ph,P.sg,v),0.8);ctx.lineWidth=small?2:3;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*R*0.3,cy+Math.sin(a)*R*0.3);ctx.lineTo(cx+Math.cos(a)*R*(0.3+v*0.7),cy+Math.sin(a)*R*(0.3+v*0.7));ctx.stroke();} return; }
  if(m==='clock'){ const n=small?4:9,cols=Math.ceil(Math.sqrt(n)),cs=Math.min(w/cols,h/Math.ceil(n/cols));
    for(let i=0;i<n;i++){const cx=x+(i%cols)*cs+cs/2,cy=y+Math.floor(i/cols)*cs+cs/2,R=cs*0.38;
      ctx.strokeStyle=rs(P.ph,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.stroke();
      const spd=1+i*0.4; for(const arr of [[0.5,2],[0.8,1]]){const a=tt*spd*(arr[1]===2?0.3:1)-Math.PI/2;ctx.strokeStyle=rs(P.sg,0.8);ctx.lineWidth=arr[1];ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*R*arr[0],cy+Math.sin(a)*R*arr[0]);ctx.stroke();}} return; }
  if(m==='gauges'){ const n=small?3:6,cols=Math.ceil(Math.sqrt(n)),cs=Math.min(w/cols,h/Math.ceil(n/cols));
    for(let i=0;i<n;i++){const cx=x+(i%cols)*cs+cs/2,cy=y+Math.floor(i/cols)*cs+cs/2,R=cs*0.34;const v=0.5+0.5*Math.sin(tt*0.8+i);
      ctx.lineWidth=Math.max(2,R*0.2);ctx.lineCap='round';ctx.strokeStyle=rs(P.ph,0.15);ctx.beginPath();ctx.arc(cx,cy,R,0.75*Math.PI,2.25*Math.PI);ctx.stroke();
      ctx.strokeStyle=rs(P.sg,0.9);ctx.beginPath();ctx.arc(cx,cy,R,0.75*Math.PI,0.75*Math.PI+1.5*Math.PI*v);ctx.stroke();} return; }
};}
function eGraph(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed,m=cfg.mode;
  if(m==='force'){ const st=S(id,()=>{const n=small?9:16,nd=[];for(let i=0;i<n;i++)nd.push({x:g(),y:g(),vx:0,vy:0});const ed=[];for(let i=0;i<n;i++){const k=1+Math.floor(g()*2);for(let j=0;j<k;j++)ed.push([i,Math.floor(g()*n)]);}return {nd,ed};});
    for(let i=0;i<st.nd.length;i++){const a=st.nd[i];for(let j=0;j<st.nd.length;j++){if(i===j)continue;const b=st.nd[j];let dx=a.x-b.x,dy=a.y-b.y;const d=Math.hypot(dx,dy)+0.01;const f=0.0006/(d*d);a.vx+=dx/d*f;a.vy+=dy/d*f;}}
    for(const e of st.ed){const a=st.nd[e[0]],b=st.nd[e[1]];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)+0.01;const f=(d-0.25)*0.01;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
    for(const nd of st.nd){nd.vx+=(0.5-nd.x)*0.002;nd.vy+=(0.5-nd.y)*0.002;nd.x+=nd.vx;nd.y+=nd.vy;nd.vx*=0.85;nd.vy*=0.85;}
    ctx.strokeStyle=rs(P.ph,0.4);ctx.lineWidth=1;for(const e of st.ed){const a=st.nd[e[0]],b=st.nd[e[1]];ctx.beginPath();ctx.moveTo(x+a.x*w,y+a.y*h);ctx.lineTo(x+b.x*w,y+b.y*h);ctx.stroke();}
    for(const nd of st.nd){if(A.bloom>0){ctx.shadowColor=rs(P.ph,0.8);ctx.shadowBlur=A.bloom*0.6;}ctx.fillStyle=rs(P.sg,0.9);ctx.beginPath();ctx.arc(x+nd.x*w,y+nd.y*h,3,0,6.283);ctx.fill();ctx.shadowBlur=0;} return; }
  if(m==='chord'){ const cx=x+w/2,cy=y+h/2,R=Math.min(w,h)*0.42,n=small?8:14;
    for(let i=0;i<n;i++){const a=i/n*6.283;ctx.fillStyle=rs(P.ph,0.8);ctx.beginPath();ctx.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,2.5,0,6.283);ctx.fill();}
    for(let i=0;i<n;i++){const a1=i/n*6.283;const j=(i+2+Math.floor(2*Math.sin(tt*0.3+i)))%n;const a2=j/n*6.283;
      const x1=cx+Math.cos(a1)*R,y1=cy+Math.sin(a1)*R,x2=cx+Math.cos(a2)*R,y2=cy+Math.sin(a2)*R;
      ctx.strokeStyle=rs(mixc(P.ph,P.sg,i/n),0.4+0.3*Math.sin(tt+i));ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);ctx.stroke();} return; }
  if(m==='radialtree'){ const cx=x+w/2,cy=y+h/2; function branch(a,r,depth,spread){ if(depth<=0)return;const x1=cx+Math.cos(a)*r,y1=cy+Math.sin(a)*r;const r2=r+Math.min(w,h)*0.13;
      for(let k=-1;k<=1;k+=2){const a2=a+k*spread+Math.sin(tt*0.5+depth)*0.05;const x2=cx+Math.cos(a2)*r2,y2=cy+Math.sin(a2)*r2;
        ctx.strokeStyle=rs(P.ph,0.3+depth*0.12);ctx.lineWidth=depth*0.4;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.fillStyle=rs(P.sg,0.6);ctx.beginPath();ctx.arc(x2,y2,1.5,0,6.283);ctx.fill();branch(a2,r2,depth-1,spread*0.7);} }
    for(let i=0;i<5;i++)branch(i/5*6.283+tt*0.1,Math.min(w,h)*0.08,3,0.5); return; }
  if(m==='circuit'){ const grid=small?5:8,cs=Math.min(w,h)/grid; const ox=x+(w-cs*grid)/2,oy=y+(h-cs*grid)/2;
    ctx.strokeStyle=rs(P.ph,0.35);ctx.lineWidth=1; const gg=mb32((A.seed+id)>>>0);
    for(let r=0;r<grid;r++)for(let c=0;c<grid;c++){const px=ox+c*cs+cs/2,py=oy+r*cs+cs/2;
      if(c<grid-1&&gg()>0.4){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+cs,py);ctx.stroke();}
      if(r<grid-1&&gg()>0.4){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+cs);ctx.stroke();}
      ctx.fillStyle=rs(P.ph,0.5);ctx.fillRect(px-1.5,py-1.5,3,3); }
    for(let k=0;k<(small?3:6);k++){const idx=Math.floor((tt*1.5+k*3))% (grid*grid);const r=Math.floor(idx/grid),c=idx%grid;
      if(A.bloom>0){ctx.shadowColor=rs(P.sg,1);ctx.shadowBlur=A.bloom;}ctx.fillStyle=rs(P.sg,0.95);ctx.beginPath();ctx.arc(ox+c*cs+cs/2,oy+r*cs+cs/2,3,0,6.283);ctx.fill();ctx.shadowBlur=0;} return; }
  if(m==='constellation'){ const st=S(id,()=>{const a=[];for(let i=0;i<(small?14:26);i++)a.push({x:g(),y:g(),vx:(g()-0.5)*0.05,vy:(g()-0.5)*0.05});return a;});
    for(const s of st){s.x=(s.x+s.vx*0.002+1)%1;s.y=(s.y+s.vy*0.002+1)%1;}
    for(let i=0;i<st.length;i++)for(let j=i+1;j<st.length;j++){const d=Math.hypot(st[i].x-st[j].x,st[i].y-st[j].y);if(d<0.22){ctx.strokeStyle=rs(P.ph,(0.22-d)/0.22*0.5);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+st[i].x*w,y+st[i].y*h);ctx.lineTo(x+st[j].x*w,y+st[j].y*h);ctx.stroke();}}
    for(const s of st){ctx.fillStyle=rs(P.sg,0.85);ctx.beginPath();ctx.arc(x+s.x*w,y+s.y*h,1.5,0,6.283);ctx.fill();} return; }
};}
function eFractal(cfg){ return (ctx,x,y,w,h,t,P,g,id,small)=>{ const tt=t*A.speed,m=cfg.mode;
  if(m==='tree'){ const sway=Math.sin(tt*0.8)*0.18; function br(px,py,a,len,d){ if(d<=0||len<3)return; const x2=px+Math.cos(a)*len,y2=py+Math.sin(a)*len;
      ctx.strokeStyle=rs(mixc(P.ph,P.sg,1-d/9),0.6);ctx.lineWidth=d*0.4;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x2,y2);ctx.stroke();
      br(x2,y2,a-0.45+sway*0.5,len*0.72,d-1);br(x2,y2,a+0.45+sway*0.5,len*0.72,d-1); }
    br(x+w/2,y+h,-Math.PI/2+sway,h*0.26,small?7:9); return; }
  if(m==='lsystem'){ const st=S(id,()=>{let s='F';const rules={F:'FF+[+F-F-F]-[-F+F+F]'};for(let i=0;i<2;i++){let n='';for(const c of s)n+=rules[c]||c;s=n;}return s;});
    let px=x+w/2,py=y+h,a=-Math.PI/2,len=small?4:6;const stack=[];const sway=Math.sin(tt*0.7)*0.06;
    ctx.strokeStyle=rs(P.ph,0.6);ctx.lineWidth=1;ctx.beginPath();
    for(const c of st){ if(c==='F'){const x2=px+Math.cos(a)*len,y2=py+Math.sin(a)*len;ctx.moveTo(px,py);ctx.lineTo(x2,y2);px=x2;py=y2;}
      else if(c==='+')a+=0.4+sway;else if(c==='-')a-=0.4+sway;else if(c==='[')stack.push([px,py,a]);else if(c===']'){const s2=stack.pop();px=s2[0];py=s2[1];a=s2[2];} }
    ctx.stroke(); return; }
  if(m==='sierpinski'){ const st=S(id,()=>({pts:[],x:0.5,y:0.5})); const AA=[[0.5,0.05],[0.05,0.95],[0.95,0.95]];
    for(let it=0;it<60;it++){const v=AA[Math.floor(g()*3)];st.x=(st.x+v[0])/2;st.y=(st.y+v[1])/2;st.pts.push([st.x,st.y]);if(st.pts.length>1400)st.pts.shift();}
    for(let i=0;i<st.pts.length;i++){ctx.fillStyle=rs(mixc(P.ph,P.sg,i/st.pts.length),0.7);ctx.fillRect(x+st.pts[i][0]*w,y+st.pts[i][1]*h,1.4,1.4);} return; }
  if(m==='julia'){ const bs=small?5:4,cols=Math.ceil(w/bs),rows=Math.ceil(h/bs);const cre=0.7885*Math.cos(tt*0.3),cim=0.7885*Math.sin(tt*0.3);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let zx=(c/cols-0.5)*3,zy=(r/rows-0.5)*3;let i=0;const max=small?16:24;
      while(i<max&&zx*zx+zy*zy<4){const xt=zx*zx-zy*zy+cre;zy=2*zx*zy+cim;zx=xt;i++;}
      if(i<max){const v=i/max;const cc=mixc(mixc(P.wp,P.ph,v),P.sg,Math.max(0,v-0.6));ctx.fillStyle=`rgb(${cc.r|0},${cc.g|0},${cc.b|0})`;ctx.fillRect(x+c*bs,y+r*bs,bs+0.5,bs+0.5);}} return; }
};}
function build(){ return [
 {n:'MATRIX RAIN',c:'text',f:eGlyph({set:'kata',motion:'rain'})},
 {n:'BITSTREAM',c:'text',f:eGlyph({set:'bits',motion:'rain'})},
 {n:'HEX CASCADE',c:'text',f:eGlyph({set:'hex',motion:'rain'})},
 {n:'PIXEL BANNER',c:'text',f:eGlyph({font:'pixel',motion:'banner',msg:'GNU IN GNOSIS 0.14.2 '})},
 {n:'PIXEL BOOTLOG',c:'text',f:eGlyph({font:'pixel',set:'hex',motion:'scroll'})},
 {n:'GREEK WAVE',c:'text',f:eGlyph({set:'greek',motion:'wave'})},
 {n:'RUNIC WAVE',c:'text',f:eGlyph({set:'runic',motion:'wave'})},
 {n:'BOX-DRAW TTY',c:'text',f:eGlyph({set:'kata',motion:'ui'})},
 {n:'SPINNER ZOO',c:'text',f:eGlyph({motion:'spinners'})},
 {n:'KATAKANA WAVE',c:'text',f:eGlyph({set:'kata',motion:'wave'})},
 {n:'BLOCK SCROLL',c:'text',f:eGlyph({set:'blocks',motion:'scroll'})},
 {n:'HEX SCROLL',c:'text',f:eGlyph({set:'hex',motion:'scroll'})},
 {n:'BRAILLE NOISE',c:'braille',f:eBraille((x,y,t)=>noise(x*4,y*4,t*0.4))},
 {n:'BRAILLE PLASMA',c:'braille',f:eBraille((x,y,t)=>0.5+0.5*Math.sin(x*10+t)+0.25*Math.sin(y*12-t))},
 {n:'BRAILLE RINGS',c:'braille',f:eBraille((x,y,t)=>0.5+0.5*Math.sin(Math.hypot(x-0.5,y-0.5)*30-t*3))},
 {n:'BRAILLE TUNNEL',c:'braille',f:eBraille((x,y,t)=>{const r=Math.hypot(x-0.5,y-0.5)+0.05;return 0.5+0.5*Math.sin(1/r*3+Math.atan2(y-0.5,x-0.5)*3-t*3);})},
 {n:'BRAILLE ORBIT',c:'braille',f:eBraille((x,y,t)=>{const ox=0.5+Math.cos(t)*0.3,oy=0.5+Math.sin(t*1.3)*0.3;return 1-Math.min(1,Math.hypot(x-ox,y-oy)*6);})},
 {n:'ASCII DONUT',c:'ascii',f:eAscii((x,y,t)=>{const u=x-0.5,v=y-0.5,r=Math.hypot(u,v);return Math.exp(-((r-0.32)*(r-0.32))/0.012)*(0.5+0.5*Math.sin(Math.atan2(v,u)*2-t*2+r*8));})},
 {n:'ASCII SPHERE',c:'ascii',f:eAscii((x,y,t)=>{const u=(x-0.5)*2.2,v=(y-0.5)*2.2,r=Math.hypot(u,v);if(r>1)return 0;const nz=Math.sqrt(1-r*r);const lx=Math.cos(t),lz=Math.sin(t);return Math.max(0,u*lx+nz*lz);})},
 {n:'ASCII TUNNEL',c:'ascii',f:eAscii((x,y,t)=>{const u=x-0.5,v=y-0.5,r=Math.hypot(u,v)+0.05;return 0.5+0.5*Math.sin(1/r*4+Math.atan2(v,u)*3-t*3);})},
 {n:'ASCII METABALLS',c:'ascii',f:eAscii((x,y,t)=>{let s=0;for(let i=0;i<3;i++){const bx=0.5+Math.cos(t+i*2)*0.3,by=0.5+Math.sin(t*1.2+i*2)*0.3;s+=0.04/((x-bx)*(x-bx)+(y-by)*(y-by)+0.01);}return s*0.15;})},
 {n:'ASCII PLASMA',c:'ascii',f:eAscii((x,y,t)=>0.5+0.25*(Math.sin(x*8+t)+Math.sin(y*8+t*1.1)+Math.sin((x+y)*6+t*0.7)+Math.sin(Math.hypot(x-0.5,y-0.5)*12-t)))},
 {n:'ASCII RIPPLE',c:'ascii',f:eAscii((x,y,t)=>0.5+0.5*Math.sin(Math.hypot(x-0.5,y-0.5)*26-t*4))},
 {n:'ASCII BLOBS',c:'ascii',f:eAscii((x,y,t)=>0.5+0.5*Math.sin(x*7+Math.sin(y*5+t)*2+t))},
 {n:'LISSAJOUS',c:'curve',f:eCurve((th,tt)=>({x:Math.sin(3*th+tt*0.6),y:Math.sin(2*th)}),{loops:1})},
 {n:'ROSE CURVE',c:'curve',f:eCurve((th,tt)=>{const r=Math.cos(5*th),a=th+tt*0.2;return {x:r*Math.cos(a),y:r*Math.sin(a)};},{loops:1})},
 {n:'SPIROGRAPH',c:'curve',f:eCurve((th,tt)=>{const R=1,r=0.32+0.08*Math.sin(tt*0.2),d=0.7,k=(R-r)/r;return {x:((R-r)*Math.cos(th)+d*Math.cos(k*th))*0.5,y:((R-r)*Math.sin(th)-d*Math.sin(k*th))*0.5};},{loops:8})},
 {n:'EPITROCHOID',c:'curve',f:eCurve((th,tt)=>{const R=0.6,r=0.2,d=0.5+0.1*Math.sin(tt*0.3),k=(R+r)/r;return {x:((R+r)*Math.cos(th)-d*Math.cos(k*th))*0.6,y:((R+r)*Math.sin(th)-d*Math.sin(k*th))*0.6};},{loops:6})},
 {n:'HARMONOGRAPH',c:'curve',f:eCurve((th,tt)=>{const p=th*6;return {x:(Math.sin(p*0.99+tt)*Math.exp(-0.004*p)+0.5*Math.sin(p*2.01))*0.6,y:(Math.sin(p*1.01)*Math.exp(-0.004*p)+0.5*Math.cos(p*2.99+tt))*0.6};},{loops:14})},
 {n:'BUTTERFLY',c:'curve',f:eCurve((th,tt)=>{const r=Math.exp(Math.sin(th))-2*Math.cos(4*th)+Math.pow(Math.sin((2*th-Math.PI)/24),5);return {x:Math.sin(th+tt*0.1)*r*0.26,y:Math.cos(th)*r*0.26};},{loops:12})},
 {n:'LEMNISCATE',c:'curve',f:eCurve((th,tt)=>{const c=Math.cos(2*th),r=Math.sqrt(Math.max(0,c)),a=th+tt*0.2;return {x:r*Math.cos(a),y:r*Math.sin(a)};},{loops:1})},
 {n:'PHYLLOTAXIS',c:'curve',f:eCurve((i,tt,N)=>{const a=i*2.39996+tt*0.2,r=Math.sqrt(i/420);return {x:r*Math.cos(a),y:r*Math.sin(a)};},{dots:true,n:420})},
 {n:'MAURER ROSE',c:'curve',f:eCurve((th,tt)=>{const r=Math.cos(7*(th*4+tt*0.2));return {x:r*Math.cos(th*4),y:r*Math.sin(th*4)};},{loops:1,n:720})},
 {n:'HYPOCYCLOID',c:'curve',f:eCurve((th,tt)=>{const k=4+Math.floor(1.5+1.4*Math.sin(tt*0.2));return {x:((k-1)*Math.cos(th)+Math.cos((k-1)*th))/k,y:((k-1)*Math.sin(th)-Math.sin((k-1)*th))/k};},{loops:1})},
 {n:'HEART FIELD',c:'curve',f:eCurve((th,tt)=>{const s=1+0.05*Math.sin(tt*3);return {x:16*Math.pow(Math.sin(th),3)/17*s,y:-(13*Math.cos(th)-5*Math.cos(2*th)-2*Math.cos(3*th)-Math.cos(4*th))/17*s};},{loops:1})},
 {n:'GEAR CURVE',c:'curve',f:eCurve((th,tt)=>{const r=0.7+0.12*Math.tanh(Math.sin(12*th)*3),a=th+tt*0.3;return {x:r*Math.cos(a),y:r*Math.sin(a)};},{loops:1,n:400})},
 {n:'WIRE CUBE',c:'wire3d',f:eWire(meshCube,{rz:1,verts:1})},
 {n:'TETRAHEDRON',c:'wire3d',f:eWire(meshTetra,{verts:1})},
 {n:'OCTAHEDRON',c:'wire3d',f:eWire(meshOcta,{verts:1})},
 {n:'WIRE TORUS',c:'wire3d',f:eWire(meshTorus,{scale:0.4})},
 {n:'LATLONG SPHERE',c:'wire3d',f:eWire(meshSphere,{scale:0.42})},
 {n:'HELIX COIL',c:'wire3d',f:eWire(meshHelix,{scale:0.5})},
 {n:'PYRAMID',c:'wire3d',f:eWire(meshPyramid,{verts:1})},
 {n:'STAR BURST',c:'wire3d',f:eWire(meshStar,{rz:1,verts:1,scale:0.4})},
 {n:'TESSERACT',c:'wire3d',f:eTesseract()},
 {n:'DOUBLE HELIX',c:'wire3d',f:eWire(meshDoubleHelix,{scale:0.45})},
 {n:'RING TUNNEL',c:'wire3d',f:eWire(meshTunnel,{scale:0.4,dist:4})},
 {n:'SPHERE NODES',c:'wire3d',f:eWire(meshSphere,{scale:0.42,verts:1})},
 {n:'FLOW FIELD',c:'field',f:eField({mode:'flow'})},
 {n:'VECTOR ARROWS',c:'field',f:eField({mode:'arrows'})},
 {n:'STREAMLINES',c:'field',f:eField({mode:'stream'})},
 {n:'CURL SMOKE',c:'field',f:eField({mode:'flow',curl:true,vec:(x,y,t)=>noise(x*2,y*2,t*0.3)*Math.PI*6})},
 {n:'MAGNETIC DIPOLE',c:'field',f:eField({mode:'dipole'})},
 {n:'CONTOUR DRIFT',c:'field',f:eField({mode:'stream',vec:(x,y,t)=>noise(x*5,y*5,t*0.2)*Math.PI*4})},
 {n:'PLASMA',c:'plasma',f:ePlasma((x,y,t)=>0.5+0.25*(Math.sin(x*6+t)+Math.sin(y*6+t*1.1)+Math.sin((x+y)*5+t*0.7)))},
 {n:'INTERFERENCE',c:'plasma',f:ePlasma((x,y,t)=>0.5+0.5*Math.sin(Math.hypot(x-0.3,y-0.5)*20-t*2)*Math.sin(Math.hypot(x-0.7,y-0.5)*20-t*2))},
 {n:'MOIRE',c:'plasma',f:ePlasma((x,y,t)=>0.5+0.5*Math.sign(Math.sin(x*40+Math.sin(t)*4))*Math.sign(Math.sin(y*40-Math.cos(t)*4))*0.6+0.2)},
 {n:'AURORA BANDS',c:'plasma',f:ePlasma((x,y,t)=>Math.max(0,1-Math.abs(y-0.5-0.2*Math.sin(x*5+t)-0.1*Math.sin(x*13-t*2))*4))},
 {n:'RIPPLES',c:'plasma',f:ePlasma((x,y,t)=>0.5+0.5*Math.sin(Math.hypot(x-0.5,y-0.5)*22-t*3))},
 {n:'CHECKER WARP',c:'plasma',f:ePlasma((x,y,t)=>{const u=x+0.1*Math.sin(y*8+t),v=y+0.1*Math.cos(x*8+t);return (Math.floor(u*8)+Math.floor(v*8))%2?0.8:0.15;})},
 {n:'TRUCHET',c:'tiling',f:eTiling({mode:'truchet'})},
 {n:'HEX HEATMAP',c:'tiling',f:eTiling({mode:'hex'})},
 {n:'TRIANGLE WAVE',c:'tiling',f:eTiling({mode:'triwave'})},
 {n:'SQUARE RIPPLE',c:'tiling',f:eTiling({mode:'ripple'})},
 {n:'TERRAIN LINES',c:'tiling',f:eTiling({mode:'terrain'})},
 {n:'TREEMAP',c:'tiling',f:eTiling({mode:'treemap'})},
 {n:'ADJACENCY',c:'tiling',f:eTiling({mode:'matrix'})},
 {n:'MAZE GROWTH',c:'tiling',f:eTiling({mode:'maze'})},
 {n:'VORONOI CELLS',c:'voronoi',f:eVoronoi({mode:'cells'})},
 {n:'DELAUNAY MESH',c:'voronoi',f:eVoronoi({mode:'delaunay'})},
 {n:'WORLEY NOISE',c:'voronoi',f:eVoronoi({mode:'worley'})},
 {n:'BOIDS FLOCK',c:'particles',f:eParticles({mode:'boids'})},
 {n:'GRAVITY ORBITS',c:'particles',f:eParticles({mode:'gravity'})},
 {n:'DLA AGGREGATE',c:'particles',f:eParticles({mode:'dla'})},
 {n:'FIREFLIES',c:'particles',f:eParticles({mode:'fireflies'})},
 {n:'STARFIELD WARP',c:'particles',f:eParticles({mode:'starfield'})},
 {n:'SPRING LATTICE',c:'particles',f:eParticles({mode:'spring'})},
 {n:'PENDULUM WAVE',c:'particles',f:eParticles({mode:'pendwave'})},
 {n:'N-BODY',c:'particles',f:eParticles({mode:'nbody'})},
 {n:'CLOTH WAVE',c:'particles',f:eParticles({mode:'cloth'})},
 {n:'DOUBLE PENDULUM',c:'particles',f:eParticles({mode:'double'})},
 {n:'CANDLESTICKS',c:'chart',f:eChart({mode:'candle'})},
 {n:'LINE STREAM',c:'chart',f:eChart({mode:'line'})},
 {n:'AREA STREAM',c:'chart',f:eChart({mode:'area'})},
 {n:'BARS RACE',c:'chart',f:eChart({mode:'bars'})},
 {n:'SCATTER DRIFT',c:'chart',f:eChart({mode:'scatter'})},
 {n:'BUBBLE DRIFT',c:'chart',f:eChart({mode:'bubble'})},
 {n:'HEATMAP SCROLL',c:'chart',f:eChart({mode:'heatmap'})},
 {n:'POLAR SPECTRUM',c:'chart',f:eChart({mode:'polar'})},
 {n:'CLOCK FACES',c:'chart',f:eChart({mode:'clock'})},
 {n:'RADIAL GAUGES',c:'chart',f:eChart({mode:'gauges'})},
 {n:'FORCE GRAPH',c:'graph',f:eGraph({mode:'force'})},
 {n:'CHORD DIAGRAM',c:'graph',f:eGraph({mode:'chord'})},
 {n:'RADIAL TREE',c:'graph',f:eGraph({mode:'radialtree'})},
 {n:'CIRCUIT TRACES',c:'graph',f:eGraph({mode:'circuit'})},
 {n:'CONSTELLATION',c:'graph',f:eGraph({mode:'constellation'})},
 {n:'FRACTAL TREE',c:'fractal',f:eFractal({mode:'tree'})},
 {n:'L-SYSTEM PLANT',c:'fractal',f:eFractal({mode:'lsystem'})},
 {n:'SIERPINSKI',c:'fractal',f:eFractal({mode:'sierpinski'})},
 {n:'JULIA SET',c:'fractal',f:eFractal({mode:'julia'})},
]; }
return { build, set:function(s,b,seed){A.speed=s;A.bloom=b;if(seed!==undefined)A.seed=seed;}, reset:function(){store={};} };
})();
