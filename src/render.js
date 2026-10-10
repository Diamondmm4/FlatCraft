import {B,BD,ITEMS,BLOCK_IDS} from './data.js';
import {noise} from './world.js';
import {makeArt} from './art.js';
import {clamp} from './game.js';
export const PALETTE={ink:'#152326',cream:'#f2ecd5',leaf:'#a9c789',gold:'#d9b981',slate:'#7c9296'};
const mix=(a,b,t)=>{const A=a.match(/\w\w/g).map(x=>parseInt(x,16)),B=b.match(/\w\w/g).map(x=>parseInt(x,16));return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
export class Renderer{
 constructor(canvas,makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;}){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.makeCanvas=makeCanvas;this.art=makeArt(makeCanvas);this.camera={x:75,y:38};this.width=1280;this.height=800;this.dpr=1;this.tile=36;this.zoom=1;this.shake=0;this.light=null;this.lightKey='';this.lightTimer=0;this.clouds=Array.from({length:16},(_,i)=>({x:noise(i,1)*1600,y:45+noise(i,2)*220,w:70+noise(i,3)*180}));this.reducedMotion=false;this.smoothCamera=true;this.quality='high';}
 resize(w,h,dpr=1){this.width=w;this.height=h;this.dpr=Math.min(2,dpr);this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);this.tile=(w<700?29:36)*this.zoom;this.ctx.imageSmoothingEnabled=false;}
 worldPoint(x,y){return {x:this.camera.x+x/this.tile,y:this.camera.y+y/this.tile};}
 screenPoint(x,y){return {x:(x-this.camera.x)*this.tile,y:(y-this.camera.y)*this.tile};}
 anchor(game){return game.world.dim==='end'?.73:game.world.dim==='overworld'&&game.player.y<(game.world.height[Math.floor(game.player.x)]||50)+2?.60:.50;}
 snap(game){this.tile=(this.width<700?29:36)*this.zoom*(game.world.dim==='end'?.78:1);this.camera.x=clamp(game.player.x-this.width/this.tile/2,0,game.world.w-this.width/this.tile);this.camera.y=game.player.y-this.height/this.tile*this.anchor(game);this.lightKey='';}
 render(game,dt=.016,menu=false){const c=this.ctx,W=this.width,H=this.height,w=game.world;if(!w)return;this.tile=(this.width<700?29:36)*this.zoom*(w.dim==='end'?.78:1);const s=this.tile,p=game.player;
  const targetX=clamp(p.x-W/s*(menu?.66:.5),0,w.w-W/s),targetY=p.y-H/s*(menu?.67:this.anchor(game));const lerp=this.smoothCamera&&!this.reducedMotion?1-Math.exp(-dt*6):1;this.camera.x+=(targetX-this.camera.x)*lerp;this.camera.y+=(targetY-this.camera.y)*lerp;this.camera.y=clamp(this.camera.y,-15,w.h-H/s+3);
  const cx=this.camera.x,cy=this.camera.y,day=game.time/1200;const sun=clamp(Math.sin((day-.2)*Math.PI*2)*1.25+.2,0,1);const dusk=clamp(1-Math.abs(day-.69)*13,0,1);const underground=clamp((p.y-(w.height[Math.floor(p.x)]||50)-1)/18,0,1);
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
  this.drawSky(game,sun,dusk,underground,menu);
  c.save();if(this.shake>.1&&!this.reducedMotion){c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);this.shake*=.85;}
  const x0=Math.max(0,Math.floor(cx)-1),x1=Math.min(w.w-1,Math.ceil(cx+W/s)+1),y0=Math.max(0,Math.floor(cy)-1),y1=Math.min(w.h-1,Math.ceil(cy+H/s)+1);
  this.lightTimer-=dt;const key=`${x0},${y0},${w.dirty},${Math.round(sun*8)},${w.dim}`;if(!this.light||this.lightTimer<=0&&(key!==this.lightKey||this.lightTimer<-.15)){this.calculateLight(game,x0-12,y0-12,x1+12,y1+12,sun);this.lightKey=key;this.lightTimer=.16;}
  // The cave wall remains behind excavated spaces, giving the world depth.
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const i=y*w.w+x,id=w.tiles[i],b=BD[id],sx=Math.round((x-cx)*s),sy=Math.round((y-cy)*s),size=Math.ceil(s)+1;
   if(w.back[i]&&!b.opaque){const depth=y-(w.height[x]||50);c.fillStyle=w.dim==='nether'?'#482c35':w.dim==='end'?'#403a51':depth>60?'#29313d':depth>10?'#354149':'#544e40';c.fillRect(sx,sy,size,size);if(noise(x,y,w.seed)>.75){c.fillStyle='rgba(0,0,0,.1)';c.fillRect(sx+3,sy+7,s*.6,2);}}
   if(!id)continue;
   if(id===B.water||id===B.lava){this.drawFluid(game,x,y,sx,sy,s,id);continue;}
   if(id===B.nether_portal||id===B.end_portal){this.drawPortal(game,x,y,sx,sy,s,id);continue;}
   if(id===B.wheat_crop){this.drawCrop(game,x,y,sx,sy,s);continue;}
   if(id===B.grass_tuft||id===B.flower||id===B.sugar_cane||id===B.oak_sapling){c.save();const sway=this.reducedMotion?0:Math.sin(game.elapsed*1.4+x*.8)*.025;c.translate(sx+s/2,sy+s);c.transform(1,0,sway,1,0,0);c.drawImage(this.art.block(BD[id].id),-s/2,-s,s,s);c.restore();continue;}
   c.drawImage(this.art.block(b.id,Math.floor(noise(x,y,w.seed)*3)),sx,sy,size,size);
   if(b.opaque){if(!BD[w.get(x,y-1)].opaque){c.fillStyle='rgba(255,241,191,.12)';c.fillRect(sx,sy,size,Math.max(1,s/16));}if(!BD[w.get(x+1,y)].opaque){c.fillStyle='rgba(0,0,0,.15)';c.fillRect(sx+s-s/12,sy,s/12,size);}if(BD[w.get(x,y-1)].opaque&&BD[w.get(x-1,y)].opaque){c.fillStyle='rgba(0,0,0,.09)';c.fillRect(sx,sy,size,2);}}
   if(id===B.torch)this.drawFlame(sx+s*.5,sy+s*.37,s*.13,game.elapsed+x);
   if(id===B.furnace&&w.stations[`${x},${y}`]?.burn>0)this.drawFlame(sx+s*.5,sy+s*.68,s*.15,game.elapsed);
   if(id===B.redstone_lamp&&this.powered(w,x,y)){c.fillStyle='rgba(255,207,119,.7)';c.fillRect(sx+s*.18,sy+s*.18,s*.65,s*.64);}
   if(id===B.lever&&w.switches[`${x},${y}`]){c.fillStyle='#df8979';c.fillRect(sx+s*.6,sy+s*.33,s*.15,s*.24);}
   if(id===B.end_frame&&w.meta.stronghold){const index=x-(w.meta.stronghold.x-6);if(index>=0&&index<(w.meta.eyes||0)){c.drawImage(this.art.item('ender_eye'),sx+s*.2,sy-s*.16,s*.6,s*.6);}}
  }
  for(const d of game.drops){const pt=this.screenPoint(d.x,d.y);if(pt.x< -40||pt.x>W+40)continue;c.save();const bob=this.reducedMotion?0:Math.sin(game.elapsed*3+d.x)*2;c.globalAlpha=.25;c.fillStyle='#090f16';c.beginPath();c.ellipse(pt.x,pt.y+s*.32,s*.23,s*.07,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.drawImage(this.art.item(d.s.id),pt.x-s*.24,pt.y-s*.13+bob,s*.48,s*.48);c.restore();}
  for(const e of game.entities)if(e.hp>0&&e.x>cx-9&&e.x<cx+W/s+9)this.drawMob(game,e);
  this.drawPlayer(game);
  this.drawProjectiles(game);
  // Individual tile light keeps caverns dark while torches form warm pools of light.
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const light=this.getLight(x,y),a=w.dim==='overworld'&&y<w.sky[x]&&w.get(x,y)===0?0:clamp(1-light,0,.965);if(a>.03){c.fillStyle=`rgba(${w.dim==='nether'?'25,10,24':'5,13,25'},${a})`;c.fillRect(Math.floor((x-cx)*s),Math.floor((y-cy)*s),Math.floor((x+1-cx)*s)-Math.floor((x-cx)*s),Math.floor((y+1-cy)*s)-Math.floor((y-cy)*s));}
  }
  if(this.quality==='high')this.drawGlows(game,x0,y0,x1,y1,sun);
  for(const particle of game.particles){const pt=this.screenPoint(particle.x,particle.y);c.globalAlpha=Math.min(1,particle.life*2);c.fillStyle=particle.color;c.fillRect(pt.x,pt.y,particle.size*s,particle.size*s);}c.globalAlpha=1;
  for(const text of game.texts){const pt=this.screenPoint(text.x,text.y);c.font='600 15px system-ui';c.textAlign='center';c.fillStyle=text.color;c.globalAlpha=Math.min(1,text.life*2);c.fillText(text.text,pt.x,pt.y);}c.globalAlpha=1;
  if(!menu)this.drawAim(game);
  c.restore();
  this.drawAtmosphere(game,sun,underground,menu);
  const vg=c.createRadialGradient(W/2,H*.45,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.65);vg.addColorStop(0,'rgba(7,15,22,0)');vg.addColorStop(1,menu?'rgba(7,15,22,.52)':'rgba(7,15,22,.22)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  if(p.hurt>0){c.fillStyle=`rgba(184,66,64,${p.hurt*.4})`;c.fillRect(0,0,W,H);}if(game.portalCharge){c.fillStyle=`rgba(105,70,145,${game.portalCharge*.25})`;c.fillRect(0,0,W,H);}
 }
 drawSky(g,sun,dusk,underground,menu){const c=this.ctx,W=this.width,H=this.height,w=g.world,cy=this.camera.y,s=this.tile;
  let top=mix('152337','6dafa8',sun),bottom=mix('39404f','d2d0a5',sun);if(dusk>0){top=mix(top.slice(1),'8c838e',dusk*.7);bottom=mix(bottom.slice(1),'dfa677',dusk*.9);}if(w.dim==='nether'){top='#291c2c';bottom='#985040';}if(w.dim==='end'){top='#181629';bottom='#514862';}if(underground>.4){top=mix(top.slice(1),'111e2b',underground);bottom=mix(bottom.slice(1),'2e3c3c',underground);}
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,top);sky.addColorStop(1,bottom);c.fillStyle=sky;c.fillRect(0,0,W,H);
  if(w.dim==='overworld'&&underground<.9){
   if(sun<.5){c.fillStyle='#f2ecd8';for(let i=0;i<85;i++){const x=(noise(i,1)*W+this.camera.x*.6)%W,y=noise(i,2)*H*.65;c.globalAlpha=(1-sun*2)*(.35+noise(i,3)*.65);c.fillRect(Math.round(x),Math.round(y),i%7===0?2:1,i%7===0?2:1);}c.globalAlpha=1;}
   const sx=W*.73,sy=H*.18+Math.sin(g.time/1200*Math.PI*2)*H*.07;c.globalAlpha=.8;c.fillStyle=sun>.3?'#f2ddaa':'#e4e7d2';c.beginPath();c.arc(sx,sy,sun>.3?32:23,0,Math.PI*2);c.fill();if(sun>.3){const halo=c.createRadialGradient(sx,sy,10,sx,sy,140);halo.addColorStop(0,'rgba(242,213,156,.3)');halo.addColorStop(1,'rgba(242,213,156,0)');c.fillStyle=halo;c.fillRect(sx-140,sy-140,280,280);}c.globalAlpha=1;
   for(const cloud of this.clouds){const x=((cloud.x-this.camera.x*3+g.elapsed*1.3)%(W+350)+W+350)%(W+350)-180,y=cloud.y*.7+Math.max(-40,(40-cy)*2);c.fillStyle=`rgba(236,233,208,${.09+sun*.15})`;c.fillRect(x,y,cloud.w,11);c.fillRect(x+cloud.w*.14,y-8,cloud.w*.64,14);c.fillRect(x+cloud.w*.3,y-14,cloud.w*.3,10);}
  }
  const horizon=(53-cy)*s;const base=clamp(horizon,H*.38,H*1.5);
  // Four independently moving mountain and woodland planes.
  const layers=w.dim==='overworld'?['#76948e','#5b817b','#456d67','#315a50']:w.dim==='nether'?['#744a49','#59343e','#422b35','#34212e']:['#524964','#413b54','#35314c','#26263f'];
  for(let layer=0;layer<4;layer++){
   const alpha=w.dim==='overworld'?1-sun*.25:1;let color=layers[layer];if(sun<.4&&w.dim==='overworld')color=mix(color.slice(1),'1a293b',.5-sun);c.fillStyle=color;c.globalAlpha=alpha;
   c.beginPath();c.moveTo(0,H);for(let xx=-20;xx<=W+20;xx+=12){const wx=(xx+this.camera.x*s*(.035+layer*.055))/s;const n=Math.sin(wx*.11+layer*3)*.45+Math.sin(wx*.25+layer*8)*.25+Math.sin(wx*.043+layer)*.4;const yy=base-(4-layer)*s*1.3-n*s*(4-layer)*1.4;c.lineTo(xx,yy);}c.lineTo(W,H);c.closePath();c.fill();
   if(layer>=2&&w.dim==='overworld')for(let i=-3;i<W/40+6;i++){const offset=this.camera.x*s*(.035+layer*.055),xx=i*43-offset%43,wx=(xx+offset)/s,n=Math.sin(wx*.11+layer*3)*.45+Math.sin(wx*.25+layer*8)*.25+Math.sin(wx*.043+layer)*.4,yy=base-(4-layer)*s*1.3-n*s*(4-layer)*1.4,treeH=25+noise(i+Math.floor(offset/43),layer)*52;c.fillRect(xx,yy-treeH*.7,4,treeH);c.beginPath();c.moveTo(xx+2,yy-treeH);c.lineTo(xx-15,yy-5);c.lineTo(xx+20,yy-5);c.closePath();c.fill();}
  }c.globalAlpha=1;
 }
 calculateLight(g,x0,y0,x1,y1,sun){const w=g.world;x0=Math.max(0,x0);y0=Math.max(0,y0);x1=Math.min(w.w-1,x1);y1=Math.min(w.h-1,y1);const width=x1-x0+1,height=y1-y0+1,arr=new Float32Array(width*height),queue=[];const set=(x,y,v)=>{if(x<x0||x>x1||y<y0||y>y1)return;const i=(y-y0)*width+x-x0;if(v>arr[i]+.01){arr[i]=v;queue.push(i);}};const ambient=w.dim==='nether'?.6:w.dim==='end'?.68:.3+sun*.7;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const id=w.get(x,y),b=BD[id];if(w.dim==='overworld'&&y<=w.sky[x])set(x,y,ambient);else if(w.dim!=='overworld'&&!b.opaque)set(x,y,ambient);if(b.light)set(x,y,1.08);if(id===B.furnace&&w.stations[`${x},${y}`]?.burn>0)set(x,y,1);if(id===B.redstone_lamp&&this.powered(w,x,y))set(x,y,1.1);}
  // A very small adaptation glow makes the avatar visible, without exposing deep ores.
  set(Math.floor(g.player.x),Math.floor(g.player.y+.6),g.selectedStack()?.id==='torch'?.93:.27);
  let q=0;while(q<queue.length&&q<width*height*15){const i=queue[q++],x=i%width+x0,y=Math.floor(i/width)+y0,val=arr[i];for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const tx=x+dx,ty=y+dy;if(tx<x0||tx>x1||ty<y0||ty>y1)continue;const b=BD[w.get(tx,ty)],v=val-(b.opaque?.29:.077);if(v>.03)set(tx,ty,v);}}
  this.light={x0,y0,width,height,arr};
 }
 getLight(x,y){const l=this.light;if(!l)return 1;const xx=x-l.x0,yy=y-l.y0;return xx>=0&&xx<l.width&&yy>=0&&yy<l.height?l.arr[yy*l.width+xx]:0;}
 powered(w,x,y){const q=[[x,y]],seen=new Set();let i=0;while(i<q.length&&i<70){const [tx,ty]=q[i++],k=`${tx},${ty}`;if(seen.has(k))continue;seen.add(k);if(w.get(tx,ty)===B.lever&&w.switches[k])return true;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const id=w.get(tx+dx,ty+dy);if(id===B.redstone_wire||id===B.lever)q.push([tx+dx,ty+dy]);}}return false;}
 drawGlows(g,x0,y0,x1,y1,sun){const c=this.ctx,s=this.tile;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const id=g.world.get(x,y);if(id!==B.torch&&id!==B.glowstone&&id!==B.lava&&!(id===B.furnace&&g.world.stations[`${x},${y}`]?.burn>0))continue;if(id===B.lava&&((x+y)%4||g.world.get(x,y-1)===B.lava))continue;const pt=this.screenPoint(x+.5,y+.4),r=s*(id===B.lava?2:2.7),gr=c.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,r);gr.addColorStop(0,'rgba(247,174,92,.15)');gr.addColorStop(1,'rgba(247,174,92,0)');c.fillStyle=gr;c.fillRect(pt.x-r,pt.y-r,r*2,r*2);}}
 drawFluid(g,x,y,px,py,s,id){const c=this.ctx,isWater=id===B.water,surface=g.world.get(x,y-1)!==id;const offset=surface?s*.15+Math.sin(g.elapsed*2+x*.8)*s*.025:0;c.fillStyle=isWater?'rgba(61,128,154,.75)':'#bc6143';c.fillRect(px,py+offset,s+1,s-offset+1);c.fillStyle=isWater?'rgba(145,210,207,.7)':'#efb263';if(surface)c.fillRect(px,py+offset,s+1,s*.08);c.fillStyle=isWater?'rgba(165,214,203,.19)':'rgba(255,198,110,.65)';if((x+y)%3===0)c.fillRect(px+s*.2,py+s*(.4+Math.sin(g.elapsed+x)*.09),s*.45,s*.04);}
 drawPortal(g,x,y,px,py,s,id){const c=this.ctx,end=id===B.end_portal;c.fillStyle=end?'#172e3a':'#744d91';c.fillRect(px,py,s+1,s+1);for(let i=0;i<4;i++){const a=Math.sin(g.elapsed*2+x+y+i)*.18+.2;c.fillStyle=`rgba(${end?'141,203,195':'213,165,231'},${a})`;c.fillRect(px+(Math.sin(g.elapsed+i+y)+1)*s*.25,py+i*s*.25,s*.35,s*.13);}}
 drawCrop(g,x,y,px,py,s){const c=this.ctx,crop=g.world.crops[`${x},${y}`]||{age:1},mature=crop.age>=7,h=s*(.25+crop.age*.085);for(let i=0;i<4;i++){const bx=px+s*(.15+i*.2);c.fillStyle=crop.type==='nether_wart'?'#a75d69':mature?'#c9b36a':'#829c56';c.fillRect(bx,py+s-h,s*.06,h);c.fillRect(bx-s*.08,py+s-h,s*.21,s*.17);if(mature)c.fillRect(bx-s*.07,py+s-h+s*.22,s*.2,s*.09);}}
 drawFlame(x,y,r,t){const c=this.ctx;c.fillStyle='#dc8a4d';c.fillRect(x-r*.8,y-r*(1.2+Math.sin(t*9)*.2),r*1.6,r*2.1);c.fillStyle='#f2d389';c.fillRect(x-r*.45,y-r,r*.9,r*1.5);c.fillStyle='#fff1c1';c.fillRect(x-r*.23,y-r*.15,r*.46,r*.7);}
 drawPlayer(g){const c=this.ctx,p=g.player,s=this.tile,pt=this.screenPoint(p.x,p.y),walk=p.grounded?Math.sin(p.walk*3.7)*.28:Math.sin(g.elapsed*2)*.07;c.save();c.translate(pt.x,pt.y);if(p.invuln>0&&Math.floor(g.elapsed*14)%2)c.globalAlpha=.6;const u=s/16;c.scale(p.facing*u,u);c.imageSmoothingEnabled=false;
  c.fillStyle='rgba(6,14,21,.25)';c.beginPath();c.ellipse(0,28,6,1.5,0,0,Math.PI*2);c.fill();
  // Canvas-native articulated character: traveler coat, satchel, hair, and boots.
  const armor=g.armor[1]?.id,coat=armor?armor.startsWith('diamond')?'#74bec0':armor.startsWith('iron')?'#b4c4c3':armor.startsWith('gold')?'#d6b267':'#645863':'#72a4a4';
  const leg=(x,a,back)=>{c.save();c.translate(x,17);c.rotate(a);c.fillStyle=back?'#394853':'#435663';c.fillRect(-2,0,4,10);c.fillStyle=g.armor[3]?'#98aaa9':'#53483f';c.fillRect(-2,8,5,3);c.restore();};leg(-2.5,walk,true);leg(2,-walk,false);
  c.fillStyle='#546b65';c.fillRect(-6,9,3,9);c.fillStyle='#a99268';c.fillRect(-6,10,2,6);c.fillStyle=coat;c.fillRect(-4,8,8,11);c.fillStyle='#adc6b2';c.fillRect(-3,8,6,2);c.fillStyle='#507a7e';c.fillRect(-4,16,8,3);c.fillStyle='#d0b884';c.fillRect(-4,18,8,1);c.fillStyle='#7d6951';c.fillRect(0,9,2,10);
  const swing=this.reducedMotion?0:g.mine?Math.sin(g.elapsed*17)*.7:g.attackTimer>.18?-1.2:walk*.5;
  c.save();c.translate(3,10);c.rotate(swing);c.fillStyle=coat;c.fillRect(-1,0,4,6);c.fillStyle='#deba92';c.fillRect(-1,5,4,4);const held=g.selectedStack();if(held){c.save();c.translate(3,7);c.rotate(-.5);c.drawImage(this.art.item(held.id),-3,-8,12,12);c.restore();}c.restore();
  c.fillStyle='#d8b28d';c.fillRect(-4,0,8,8);c.fillStyle='#f0cfaa';c.fillRect(0,2,4,5);c.fillStyle='#574f43';c.fillRect(-4,-1,8,3);c.fillRect(-5,1,2,4);c.fillStyle='#77664d';c.fillRect(-3,-2,6,2);c.fillStyle='#2a4142';c.fillRect(2,3,1.5,1.5);c.fillStyle='#ba8d70';c.fillRect(2,6,2,1);c.fillStyle='#d5ac6e';c.fillRect(-5,1,10,1);
  if(g.armor[0]){const id=g.armor[0].id;c.fillStyle=id.startsWith('diamond')?'#84cdcc':id.startsWith('gold')?'#e2c274':'#becdcb';c.fillRect(-5,-2,10,4);c.fillRect(-5,2,2,3);}
  if(p.blocking){c.fillStyle='#977757';c.fillRect(4,9,5,10);c.fillStyle='#bcc8bf';c.fillRect(5,9,1,10);}
  c.restore();
 }
 drawMob(g,e){const c=this.ctx,s=this.tile,pt=this.screenPoint(e.x,e.y);c.save();c.translate(pt.x,pt.y);if(e.baby>0)c.translate(0,e.h*s*.3);c.scale((e.facing||1)*s/16*(e.baby>0?.7:1),s/16*(e.baby>0?.7:1));if(e.invuln>0)c.globalAlpha=.65;const walk=Math.sin(e.age*8)*2;
  if(e.type==='dragon'){this.drawDragon(g,e);c.restore();return;}
  if(e.type==='crystal'){c.translate(0,Math.sin(e.age*2)*2);c.strokeStyle='#aa91be';c.lineWidth=1;c.strokeRect(-8,-3,16,20);c.save();c.translate(0,7);c.rotate(e.age*.8);c.fillStyle='#b88acc';c.fillRect(-5,-5,10,10);c.fillStyle='#f2c2df';c.fillRect(-2,-2,4,4);c.restore();c.fillStyle='#3a3b4f';c.fillRect(-8,18,16,3);c.restore();return;}
  if(['sheep','cow','pig'].includes(e.type)){
   const color=e.type==='sheep'?'#dedcc9':e.type==='cow'?'#736457':'#cf9987',height=e.h*16;c.fillStyle='#534d48';for(const x of [-6,5]){c.fillRect(x, height-6,3,7+walk*.4);c.fillRect(x+3,height-6,2,6-walk*.4);}c.fillStyle=color;c.fillRect(-9,2,17,height-6);c.fillRect(6,1,7,8);c.fillStyle=e.type==='sheep'?'#b4aaa0':e.type==='cow'?'#d2c2a5':'#e1b69d';c.fillRect(10,5,5,4);if(e.type==='cow'){c.fillRect(-5,3,5,6);c.fillRect(3,7,4,5);c.fillRect(7,-1,2,3);}if(e.type==='sheep'){c.fillStyle='#eee9d8';c.fillRect(-7,0,13,4);c.fillRect(-11,4,3,6);}c.fillStyle='#2d3537';c.fillRect(10,3,1.5,1.5);
  }else if(e.type==='chicken'){c.fillStyle='#c39a59';c.fillRect(-3,8,1,4);c.fillRect(2,8,1,4);c.fillStyle='#e8e2cf';c.fillRect(-5,2,9,7);c.fillRect(2,-1,5,6);c.fillStyle='#c66c5c';c.fillRect(3,-3,3,3);c.fillStyle='#d9b267';c.fillRect(7,2,3,2);c.fillStyle='#2a353a';c.fillRect(5,0,1,1);
  }else if(e.type==='spider'){c.strokeStyle='#4e4751';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo((i-2)*3,5);c.lineTo((i-2)*7,1+walk*.4);c.lineTo((i-2)*8,10);c.stroke();}c.fillStyle='#62515b';c.fillRect(-8,1,15,7);c.fillStyle='#d98578';c.fillRect(6,3,2,2);c.fillRect(6,6,2,2);
  }else if(e.type==='slime'){c.globalAlpha=.7;c.fillStyle='#92b777';c.fillRect(-8,Math.sin(e.age*3)*2,16,15);c.fillStyle='#b2d596';c.fillRect(-6,2,12,4);c.globalAlpha=1;c.fillStyle='#466b51';c.fillRect(-4,7,3,3);c.fillRect(3,7,3,3);c.fillRect(0,11,2,1);
  }else if(e.type==='ghast'){c.fillStyle='#dfd9ce';c.fillRect(-20,0,40,28);c.fillStyle='#b3b3b0';for(let i=0;i<6;i++)c.fillRect(-17+i*6,27,4,10+Math.sin(e.age*2+i)*5);c.fillStyle='#68575f';c.fillRect(-12,12,6,3);c.fillRect(6,12,6,3);c.fillRect(-3,21,6,4);
  }else if(e.type==='blaze'){for(let i=0;i<5;i++){const a=e.age*2+i*1.26;c.fillStyle=i%2?'#d4a457':'#f0c569';c.fillRect(Math.sin(a)*10,11+Math.cos(a)*6,3,9);}c.fillStyle='#d7a451';c.fillRect(-6,0,12,10);c.fillStyle='#574136';c.fillRect(-4,4,2,2);c.fillRect(2,4,2,2);c.fillStyle='#f2d48b';c.fillRect(-3,1,6,1);
  }else{
   const end=e.type==='enderman',h=e.h*16,legH=end?18:12,bodyY=8,bodyH=h-8-legH;let color=e.color;c.fillStyle=e.type==='skeleton'?'#bcbfb3':end?'#282c3b':e.type==='creeper'?'#6f8a58':'#40585b';c.fillRect(-4,h-legH,3,legH+walk*.25);c.fillRect(2,h-legH,3,legH-walk*.25);c.fillStyle=color;c.fillRect(-5,bodyY,10,bodyH);c.fillRect(-6,0,12,9);c.fillRect(-8,9,3,bodyH+5);c.fillRect(6,9,3,bodyH+5);c.fillStyle=end?'#cf9ce2':'#2e3838';c.fillRect(-4,3,3,2);c.fillRect(2,3,3,2);if(e.type==='creeper'){c.fillRect(-1,5,2,4);c.fillRect(-3,7,6,2);if(e.fuse){c.globalAlpha=e.fuse%0.3>.15?.65:0;c.fillStyle='#fff0c7';c.fillRect(-6,0,12,h);c.globalAlpha=1;}}else if(e.type==='skeleton'){c.fillStyle='#6f7772';for(let j=0;j<3;j++)c.fillRect(-4,11+j*3,8,1);c.fillStyle='#856d56';c.fillRect(9,8,1,12);}else if(e.type==='villager'){c.fillStyle='#845e52';c.fillRect(-5,17,10,9);c.fillStyle='#cdae88';c.fillRect(4,5,4,5);c.fillStyle='#b4a175';c.fillRect(-8,0,16,2);c.fillRect(-5,-3,10,3);}
  }
  c.restore();if(e.hp<e.maxHp&&!e.passive&&e.type!=='dragon'){const width=s*.8;c.fillStyle='rgba(14,23,29,.8)';c.fillRect(pt.x-width/2,pt.y-9,width,3);c.fillStyle='#d98c79';c.fillRect(pt.x-width/2,pt.y-9,width*e.hp/e.maxHp,3);}
 }
 drawDragon(g,e){const c=this.ctx;const flap=Math.sin(e.age*3)*.55;c.fillStyle='#5c526f';c.beginPath();c.moveTo(-10,14);c.lineTo(-41,5);c.lineTo(-72,17+Math.sin(e.age*2)*6);c.lineTo(-44,15);c.lineTo(-12,25);c.closePath();c.fill();for(const side of [-1,1]){c.save();c.translate(-3,7);c.rotate(flap*side*.6);c.fillStyle=side<0?'#534763':'#786383';c.beginPath();c.moveTo(0,10);c.lineTo(-35,-34);c.lineTo(2,-13);c.lineTo(26,-38);c.lineTo(20,8);c.lineTo(8,3);c.closePath();c.fill();c.strokeStyle='#383447';c.lineWidth=2;c.stroke();c.restore();}c.fillStyle='#423e54';c.fillRect(-20,6,44,19);c.fillRect(16,-2,20,17);c.fillRect(29,3,19,12);c.fillStyle='#aab1b3';c.fillRect(23,-8,3,8);c.fillRect(32,-6,3,6);c.fillStyle='#d9a5e8';c.fillRect(30,2,5,3);c.fillStyle='#6b617c';c.fillRect(-7,24,8,9);c.fillRect(17,24,7,8);c.fillStyle='#b2b0b3';c.fillRect(-8,32,12,2);c.fillRect(17,31,10,2);
  if(e.healing){c.save();c.resetTransform();c.setTransform(this.dpr,0,0,this.dpr,0,0);const a=this.screenPoint(e.x,e.y+1),b=this.screenPoint(e.healing.x,e.healing.y);c.strokeStyle='rgba(213,171,229,.45)';c.lineWidth=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore();}
 }
 drawProjectiles(g){const c=this.ctx,s=this.tile;for(const a of g.projectiles){const p=this.screenPoint(a.x,a.y);c.save();c.translate(p.x,p.y);if(a.type==='arrow'){c.rotate(Math.atan2(a.vy,a.vx));c.fillStyle='#bea983';c.fillRect(-s*.3,-1,s*.6,2);c.fillStyle='#d1d8cc';c.fillRect(s*.2,-2,s*.15,4);}else if(a.type==='tnt'){c.drawImage(this.art.item('tnt'),-s*.4,-s*.4,s*.8,s*.8);if(a.life%0.3>.15){c.globalAlpha=.6;c.fillStyle='#fff7d7';c.fillRect(-s*.4,-s*.4,s*.8,s*.8);}}else if(a.type==='pearl'||a.type==='eye'){c.drawImage(this.art.item(a.type==='eye'?'ender_eye':'ender_pearl'),-s*.2,-s*.2,s*.4,s*.4);}else{c.fillStyle=a.type==='dragonfire'?'#c79add':'#efbd72';c.beginPath();c.arc(0,0,s*.18,0,Math.PI*2);c.fill();c.fillStyle=a.type==='dragonfire'?'#74518e':'#cb8051';c.fillRect(-s*.28,-s*.12,s*.16,s*.2);}c.restore();}}
 drawAim(g){const c=this.ctx,s=this.tile,t=g.aim;if(!t)return;const x=Math.floor(t.x),y=Math.floor(t.y);if(!g.reachable(x+.5,y+.5))return;const pt=this.screenPoint(x,y);c.strokeStyle=g.mine?'#ecd8a7':'rgba(241,237,213,.65)';c.lineWidth=1.5;const pad=2,r=6;for(const [dx,dy,sx,sy] of [[0,0,1,1],[s,0,-1,1],[0,s,1,-1],[s,s,-1,-1]]){c.beginPath();c.moveTo(pt.x+dx+sx*(pad+r),pt.y+dy+sy*pad);c.lineTo(pt.x+dx+sx*pad,pt.y+dy+sy*pad);c.lineTo(pt.x+dx+sx*pad,pt.y+dy+sy*(pad+r));c.stroke();}if(g.mine){const progress=g.mine.progress;c.fillStyle='rgba(9,19,25,.6)';c.fillRect(pt.x,pt.y+s+4,s,3);c.fillStyle='#daba80';c.fillRect(pt.x,pt.y+s+4,s*progress,3);c.strokeStyle='rgba(20,26,26,.7)';c.beginPath();c.moveTo(pt.x+s*.48,pt.y+s*.4);c.lineTo(pt.x+s*.65,pt.y+s*.6);if(progress>.3){c.lineTo(pt.x+s*.35,pt.y+s*.65);c.lineTo(pt.x+s*.3,pt.y+s*.8);}if(progress>.6){c.moveTo(pt.x+s*.65,pt.y+s*.6);c.lineTo(pt.x+s*.8,pt.y+s*.2);}c.stroke();}}
 drawAtmosphere(g,sun,underground,menu){if(this.reducedMotion||this.quality==='low')return;const c=this.ctx,W=this.width,H=this.height;for(let i=0;i<24;i++){const x=(noise(i,4)*W+Math.sin(g.elapsed*.16+i)*28+W)%W,y=(noise(i,7)*H+g.elapsed*(g.dim==='nether'?-7:2)+H*30)%H;const isFirefly=g.dim==='overworld'&&sun<.3&&underground<.3;c.globalAlpha=isFirefly?.4+Math.sin(g.elapsed*2+i)*.3:.12;c.fillStyle=g.dim==='nether'?'#e5a778':isFirefly?'#cee39d':'#f0edcd';c.fillRect(x,y,isFirefly?3:2,isFirefly?3:2);}c.globalAlpha=1;}
 drawMap(g,canvas){const c=canvas.getContext('2d'),w=g.world,s=canvas.width/w.w;c.imageSmoothingEnabled=false;c.fillStyle='#101f29';c.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++){if(!w.discovered[y*w.w+x]&&g.mode!=='creative')continue;const id=w.get(x,y);c.fillStyle=id?BD[id].color:y<(w.height[x]||50)?'#547977':'#273940';c.fillRect(x*s,y*s,Math.ceil(s),Math.ceil(s));}c.fillStyle='#f6deb1';c.beginPath();c.arc(g.player.x*s,g.player.y*s,4,0,Math.PI*2);c.fill();if(g.deathPos?.dim===g.dim){c.fillStyle='#d78478';c.fillRect(g.deathPos.x*s-2,g.deathPos.y*s-2,5,5);}}
}
