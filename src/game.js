import {B,BD,BLOCKS,ITEMS,RECIPES,SMELTS,FUELS,BREWS,QUESTS,stack,VERSION} from './data.js';
import {World,rng,noise} from './world.js';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const overlaps=(a,b)=>a.x-a.w/2<b.x+b.w/2&&a.x+a.w/2>b.x-b.w/2&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const MOB={
 sheep:{hp:8,w:.95,h:.95,speed:1.5,color:'#eee8d6',passive:true,drops:[['wool',2],['raw_beef',1]]},
 cow:{hp:10,w:1.25,h:1.2,speed:1.3,color:'#a49a7d',passive:true,drops:[['raw_beef',2],['leather',1]]},
 pig:{hp:10,w:1.1,h:.8,speed:1.6,color:'#dca796',passive:true,drops:[['raw_porkchop',2]]},
 chicken:{hp:4,w:.5,h:.7,speed:1.8,color:'#ecebd7',passive:true,drops:[['raw_chicken',1],['feather',2]]},
 villager:{hp:20,w:.65,h:1.8,speed:1.1,color:'#b79068',passive:true,drops:[]},
 zombie:{hp:20,w:.65,h:1.8,speed:1.55,color:'#718969',damage:3,drops:[['rotten_flesh',1]]},
 skeleton:{hp:20,w:.6,h:1.8,speed:1.4,color:'#d7d9c9',damage:3,drops:[['bone',2],['arrow',2]]},
 creeper:{hp:20,w:.6,h:1.65,speed:1.6,color:'#8ca568',damage:12,drops:[['gunpowder',2]]},
 spider:{hp:16,w:1.2,h:.6,speed:2.7,color:'#61575d',damage:2,drops:[['string',2]]},
 enderman:{hp:40,w:.6,h:2.65,speed:4.5,color:'#393343',damage:5,drops:[['ender_pearl',1]]},
 slime:{hp:8,w:1,h:1,speed:2,color:'#98c17a',damage:2,drops:[['slimeball',2]]},
 blaze:{hp:20,w:.8,h:1.4,speed:1.3,color:'#e8b663',damage:5,flying:true,drops:[['blaze_rod',1]]},
 ghast:{hp:20,w:2.7,h:2.7,speed:1.1,color:'#eaded0',damage:6,flying:true,drops:[['ghast_tear',1],['gunpowder',2]]},
 crystal:{hp:6,w:.8,h:1.2,speed:0,color:'#cf94de',flying:true,drops:[]},
 dragon:{hp:200,w:6.5,h:2.8,speed:5,color:'#4b415d',flying:true,damage:8,drops:[]}
};
export class Game {
 constructor(onEvent=()=>{}){this.onEvent=onEvent;this.worlds={};this.entitiesByDim={};this.entities=[];this.projectiles=[];this.drops=[];this.particles=[];this.texts=[];this.time=360;this.day=1;this.elapsed=0;this.autosave=0;this.tick=0;this.status='title';this.selected=0;this.mine=null;this.attackTimer=0;this.useTimer=0;this.spawnTimer=5;this.seen={};this.achievements={};this.activeQuest=0;this.seed='';this.name='';this.mode='survival';this.difficulty='normal';this.keepInventory=false;this.lastJump=false;this.effects={};this.stats={mined:0,placed:0,kills:0,deaths:0};this.player=this.makePlayer();this.inv=Array(36).fill(null);this.armor=Array(4).fill(null);this.offhand=null;this.rng=rng(1);this.portalCooldown=0;this.portalCharge=0;this.charge=0;this.id='';this.deathPos=null;this.played=0;this.backpackVersion=0;}
 makePlayer(){return {x:92.5,y:49,w:.62,h:1.78,vx:0,vy:0,hp:20,food:20,saturation:5,exhaustion:0,xp:0,level:0,grounded:false,facing:1,walk:0,invuln:0,fallY:49,breath:20,regen:0,hurt:0,spawn:{dim:'overworld',x:92.5,y:49},coyote:0,jumpBuffer:0,flying:false};}
 emit(type,data={}){this.onEvent(type,data);}
 newWorld({name='A New Beginning',seed=String(Math.floor(Math.random()*99999999)),mode='survival',difficulty='normal',keepInventory=false}={}){
  this.seed=String(seed||Math.floor(Math.random()*99999999));this.name=name.trim().slice(0,42)||'A New Beginning';this.mode=mode;this.difficulty=difficulty;this.keepInventory=keepInventory;this.rng=rng(Date.now());this.id='fc-'+Date.now().toString(36);this.worlds={overworld:new World(this.seed)};this.world=this.worlds.overworld;this.dim='overworld';this.player=this.makePlayer();Object.assign(this.player,this.world.meta.spawn);this.player.spawn={dim:'overworld',...this.world.meta.spawn};this.inv=Array(36).fill(null);this.armor=Array(4).fill(null);this.offhand=null;this.entities=[];this.entitiesByDim={};this.spawnInitial();this.time=360;this.day=1;this.elapsed=0;this.played=0;this.seen={};this.achievements={};this.activeQuest=0;this.effects={};this.stats={mined:0,placed:0,kills:0,deaths:0};this.drops=[];this.projectiles=[];this.particles=[];this.texts=[];this.deathPos=null;this.portalCooldown=0;this.portalCharge=0;this.attackTimer=0;this.useTimer=0;this.charge=0;this.mine=null;this.selected=0;this.status='playing';if(mode==='creative'){for(const [id,n] of [['grass',64],['stone',64],['planks',64],['log',64],['glass',64],['torch',64],['diamond_pickaxe',1],['diamond_sword',1],['crafting_table',1]])this.add(id,n);this.player.flying=true;}
  this.emit('started');this.emit('save');
 }
 spawnInitial(){for(const s of this.world.spawns)if(this.difficulty!=='peaceful'||MOB[s.type]?.passive||['crystal','dragon'].includes(s.type))this.spawnMob(s.type,s.x,s.y);this.world.spawns=[];}
 spawnMob(type,x,y){const def=MOB[type];if(!def)return;const m={type,...def,x,y,vx:0,vy:0,maxHp:def.hp,grounded:false,facing:1,dir:0,timer:this.rng()*4,age:0,invuln:0,attack:0,angry:false,phase:0};this.entities.push(m);return m;}
 selectedStack(){return this.inv[this.selected];}
 count(id){return this.inv.reduce((n,s)=>n+(s?.id===id?s.n:0),0);}
 canAdd(id,n=1){const max=ITEMS[id]?.stack||64;return this.inv.reduce((room,s)=>room+(!s?max:s.id===id&&!s.dur?max-s.n:0),0)>=n;}
 add(id,n=1,extra={}){if(!ITEMS[id]||n<=0)return n;const max=ITEMS[id].stack;let remain=n;if(max>1)for(const s of this.inv)if(s?.id===id&&!s.dur&&!s.ench){const take=Math.min(max-s.n,remain);s.n+=take;remain-=take;if(remain===0)break;}
  for(let i=0;i<this.inv.length&&remain>0;i++)if(!this.inv[i]){const take=Math.min(max,remain);this.inv[i]=stack(id,take,extra);remain-=take;}
  const added=n-remain;if(added){this.seen[id]=(this.seen[id]||0)+added;this.backpackVersion++;this.checkQuest();}return remain;
 }
 give(s){const rem=this.add(s.id,s.n,s);if(rem)this.drop(stack(s.id,rem,s),this.player.x,this.player.y+.5);}
 remove(id,n=1){if(this.count(id)<n)return false;for(let i=0;i<this.inv.length&&n;i++){const s=this.inv[i];if(s?.id===id){const take=Math.min(n,s.n);s.n-=take;n-=take;if(s.n===0)this.inv[i]=null;}}this.backpackVersion++;return true;}
 consumeSelected(n=1){if(this.mode==='creative')return;const s=this.selectedStack();if(s){s.n-=n;if(s.n<=0)this.inv[this.selected]=null;this.backpackVersion++;}}
 damageTool(slot=this.selected,amount=1){if(this.mode==='creative')return;const s=this.inv[slot];if(!s?.dur)return;if(s.ench?.unbreaking&&this.rng()<.5)return;s.dur-=amount;if(s.dur<=0){this.emit('sound',{name:'break'});this.inv[slot]=null;this.toast('Your '+ITEMS[s.id].name.toLowerCase()+' broke.');}this.backpackVersion++;}
 drop(s,x,y){if(!s||!ITEMS[s.id])return;this.drops.push({s,x,y,vx:(this.rng()-.5)*2,vy:-2,age:0,w:.25,h:.25});}
 craft(recipe,times=1){if(typeof recipe==='string')recipe=RECIPES.find(r=>r.id===recipe);if(!recipe)return false;if(recipe.station&&!this.nearStation(recipe.station))return this.toast('Use a nearby '+ITEMS[recipe.station].name.toLowerCase()+'.');let made=0;for(let i=0;i<times;i++){if(!Object.entries(recipe.ingredients).every(([id,n])=>this.count(id)>=n)||!this.canAdd(recipe.out,recipe.n))break;for(const [id,n] of Object.entries(recipe.ingredients))this.remove(id,n);this.add(recipe.out,recipe.n);made++;}if(made){this.emit('sound',{name:'craft'});this.emit('inventory');return true;}return false;}
 nearStation(id){const p=this.player,w=this.world;if(!w)return false;for(let y=Math.floor(p.y)-4;y<=p.y+4;y++)for(let x=Math.floor(p.x)-4;x<=p.x+4;x++)if(w.get(x,y)===B[id])return true;return false;}
 checkQuest(){while(this.activeQuest<QUESTS.length){const q=QUESTS[this.activeQuest];if(q.item?(this.seen[q.item]||0)>=q.count:this.achievements[q.event]){this.achievements[q.id]=true;this.activeQuest++;this.emit('achievement',{title:q.title});}else break;}}
 toast(text){this.emit('toast',{text});return false;}
 particlesAt(x,y,color,n=10,speed=2){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(this.rng()-.5)*speed*2,vy:(this.rng()-.75)*speed,life:.35+this.rng()*.45,max:.8,color,size:.04+this.rng()*.1});if(this.particles.length>400)this.particles.splice(0,this.particles.length-400);}
 text(text,x,y,color='#fff2c7'){this.texts.push({text,x,y,life:1.5,color});}
 update(dt,input={}){
  if(this.status!=='playing')return;dt=Math.min(dt,.05);this.elapsed+=dt;this.played+=dt;this.tick++;this.time+=dt;if(this.time>=1200){this.time-=1200;this.day++;this.emit('day',{day:this.day});}
  this.autosave+=dt;if(this.autosave>25){this.autosave=0;this.emit('save');}
  this.attackTimer-=dt;this.useTimer-=dt;this.portalCooldown-=dt;
  for(const e in this.effects){this.effects[e]-=dt;if(this.effects[e]<=0)delete this.effects[e];}
  const p=this.player,w=this.world;p.invuln=Math.max(0,p.invuln-dt);p.hurt=Math.max(0,p.hurt-dt);p.coyote=p.grounded?.12:Math.max(0,p.coyote-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
  if(input.jump&&!this.lastJump)p.jumpBuffer=.14;this.lastJump=!!input.jump;
  const inWater=w.get(p.x,p.y+1)===B.water,inLava=w.get(p.x,p.y+1)===B.lava,onLadder=w.get(p.x,p.y+.9)===B.ladder;
  p.inWater=inWater;p.inLava=inLava;p.blocking=!!input.down&&!!this.offhand;
  const sprint=input.sprint&&p.food>6&&!p.blocking;let speed=(sprint?6:4.15)*(input.down?.4:1)*(inWater?.65:1);
  if(w.get(p.x,p.y+p.h+.15)===B.soul_sand)speed*=.5;
  const dir=(input.right?1:0)-(input.left?1:0);if(dir)p.facing=dir;p.vx+=(dir*speed-p.vx)*Math.min(1,dt*(p.grounded?17:9));
  if(this.mode==='creative'&&p.flying){p.vy=((input.down?1:0)-(input.jump||input.up?1:0))*6;if(input.sprint){p.vx*=1.3;p.vy*=1.3;}p.fallY=p.y;}
  else{
   p.vy+= (inWater?5:inLava?7:23)*dt;p.vy=Math.min(p.vy,inWater?3:inLava?2:26);
   if(onLadder){p.vy=input.jump||input.up?-3:input.down?3:0;p.fallY=p.y;}
   else if((inWater||inLava)&&input.jump){p.vy=-4.2;p.fallY=p.y;}
   else if(p.jumpBuffer>0&&p.coyote>0){p.vy=-8.7;p.grounded=false;p.coyote=0;p.jumpBuffer=0;this.emit('sound',{name:'jump'});}
  }
  if(input.down&&p.grounded&&!p.flying){const next=p.x+p.vx*dt+Math.sign(p.vx)*p.w*.5;if(!w.solid(next,p.y+p.h+.12))p.vx=0;}const wasGrounded=p.grounded;this.move(p,dt,true);
  if(p.grounded){if(!wasGrounded&&p.y-p.fallY>3.5&&!inWater&&!inLava&&this.mode!=='creative')this.hurt(Math.floor(p.y-p.fallY-3),'a fall');p.fallY=p.y;}else if(p.vy<0||inWater||inLava||onLadder)p.fallY=p.y;
  p.walk+=Math.abs(p.vx)*dt;if(p.grounded&&Math.abs(p.vx)>.7&&Math.floor(p.walk*2)!==Math.floor((p.walk-Math.abs(p.vx)*dt)*2))this.emit('sound',{name:'step'});
  if(this.mode!=='creative'){
   p.exhaustion+=Math.abs(p.vx)*dt*(sprint?.065:.014);if(p.exhaustion>=4){p.exhaustion-=4;if(p.saturation>0)p.saturation=Math.max(0,p.saturation-1);else p.food=Math.max(0,p.food-1);}
   p.regen+=dt;if(p.regen>4){p.regen=0;if(p.hp<20&&p.food>=18){p.hp=Math.min(20,p.hp+1);p.exhaustion+=3;}if(p.food===0&&p.hp>1)this.hurt(1,'hunger');if(this.difficulty==='peaceful'){p.food=20;p.hp=Math.min(20,p.hp+2);}}
   if(w.get(p.x,p.y+.2)===B.water){p.breath-=dt;if(p.breath<=0){p.breath=0;this.hurt(2,'drowning');}}else p.breath=Math.min(20,p.breath+dt*6);
   if(inLava&&!this.effects.fire_resistance)this.hurt(4,'lava');
   if([w.get(p.x-.4,p.y+1),w.get(p.x+.4,p.y+1)].includes(B.cactus))this.hurt(1,'a cactus');
  }
  if(p.y>w.h-2&&this.dim==='end')this.hurt(30,'the void',true);
  const target=input.aimX!==undefined?{x:input.aimX,y:input.aimY}:{x:p.x+p.facing*2,y:p.y+1};this.aim=target;
  if(input.mine)this.mineOrAttack(target,dt);else{this.mine=null;if(this.charge>0){this.shootArrow(target);this.charge=0;}}
  if(input.use&&this.useTimer<=0){this.use(target);this.useTimer=.28;}
  this.updateMobs(dt);this.updateDrops(dt);this.updateProjectiles(dt);this.updateStations(dt);
  if(this.tick%15===0)this.updateEnvironment();if(this.tick%40===0)w.markVisible(p.x,p.y,17);
  this.spawnTimer-=dt;if(this.spawnTimer<=0){this.spawnTimer=4;this.spawnAround();}
  const portal=[w.get(p.x,p.y),w.get(p.x,p.y+1)].find(id=>id===B.nether_portal||id===B.end_portal);
  if(portal&&this.portalCooldown<=0){this.portalCharge+=dt;if(this.portalCharge>1.1){if(portal===B.nether_portal)this.changeDimension(this.dim==='nether'?'overworld':'nether');else this.changeDimension(this.dim==='end'?'overworld':'end');}}else this.portalCharge=0;
  for(const s of this.particles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=7*dt;s.life-=dt;}this.particles=this.particles.filter(s=>s.life>0);
  for(const t of this.texts){t.y-=dt*.5;t.life-=dt;}this.texts=this.texts.filter(t=>t.life>0);
 }
 move(e,dt,isPlayer=false){const w=this.world;e.vx=clamp(e.vx||0,-30,30);e.vy=clamp(e.vy||0,-30,30);const steps=Math.max(1,Math.ceil(Math.max(Math.abs(e.vx*dt),Math.abs(e.vy*dt))/.35));e.grounded=false;
  for(let i=0;i<steps;i++){
   e.x+=e.vx*dt/steps;
   for(let y=Math.floor(e.y+.03);y<=Math.floor(e.y+e.h-.02);y++)for(let x=Math.floor(e.x-e.w/2+.01);x<=Math.floor(e.x+e.w/2-.01);x++)if(w.solid(x,y)){
    if(isPlayer&&e.vy>=0&&y===Math.floor(e.y+e.h-.02)&&y-(e.y+e.h)<.01&&y-(e.y+e.h)>-.55&&!w.solid(x,y-1)&&!w.solid(x,Math.floor(e.y-.5))){e.y=y-e.h-.01;continue;}
    if(e.vx>0)e.x=x-e.w/2-.001;else if(e.vx<0)e.x=x+1+e.w/2+.001;e.vx=0;
   }
   e.y+=e.vy*dt/steps;
   for(let y=Math.floor(e.y+.01);y<=Math.floor(e.y+e.h-.001);y++)for(let x=Math.floor(e.x-e.w/2+.02);x<=Math.floor(e.x+e.w/2-.02);x++)if(w.solid(x,y)){
    if(e.vy>0){e.y=y-e.h;e.grounded=true;}else if(e.vy<0)e.y=y+1+.001;e.vy=0;
   }
  }
  e.x=clamp(e.x,e.w/2+.05,w.w-e.w/2-.05);if(e.y< -8){e.y=-8;e.vy=0;}
 }
 reachable(x,y,r=5.2){return Math.hypot(x-this.player.x,y-(this.player.y+.75))<=r;}
 lineOfSight(x,y){const p=this.player,dx=x-p.x,dy=y-(p.y+.65),n=Math.ceil(Math.hypot(dx,dy)*4);for(let i=1;i<n-1;i++){const tx=Math.floor(p.x+dx*i/n),ty=Math.floor(p.y+.65+dy*i/n);if(tx===Math.floor(x)&&ty===Math.floor(y))continue;if(this.world.solid(tx,ty))return false;}return true;}
 mineOrAttack(t,dt){const held=this.selectedStack(),it=ITEMS[held?.id];if(it?.kind==='bow'){this.charge=Math.min(1,this.charge+dt);this.mine=null;return;}
  const target=this.entities.filter(e=>e.hp>0&&e.type!=='villager'&&Math.hypot(e.x-t.x,e.y+e.h*.5-t.y)<Math.max(1.1,e.w*.65)&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<(e.type==='dragon'?7:3.7)&&this.lineOfSight(e.x,e.y+e.h*.5)).sort((a,b)=>distance(a,t)-distance(b,t))[0];
  if(target){this.mine=null;if(this.attackTimer<=0){this.attackTimer=it?.kind==='axe'?.7:.42;let dmg=(it?.damage||1)+(held?.ench?.sharpness||0)*1.5+(this.effects.strength?3:0);if(this.player.vy>1)dmg*=1.5;this.hurtMob(target,dmg,this.player.facing);this.damageTool(this.selected,it?.kind==='sword'?1:2);this.emit('swing');this.player.exhaustion+=.1;}return;}
  const x=Math.floor(t.x),y=Math.floor(t.y),id=this.world.get(x,y),b=BD[id];if(!id||b.fluid||!this.reachable(x+.5,y+.5)||!this.lineOfSight(x+.5,y+.5)||b.hardness===Infinity){this.mine=null;return;}
  if(!this.mine||this.mine.x!==x||this.mine.y!==y)this.mine={x,y,id,progress:0,puff:0};
  const correct=!!it&&!!b.tool&&it.kind===b.tool;let speed=correct?it.speed:1;if(held?.ench?.efficiency&&correct)speed+=held.ench.efficiency*held.ench.efficiency+1;
  const harvest=!b.tier||(it?.kind==='pickaxe'&&it.tier>=b.tier);const seconds=this.mode==='creative'?.08:Math.max(.12,b.hardness*(harvest?1.5:5)/speed)*(this.player.inWater?3:1);
  this.mine.progress+=dt/seconds;this.mine.puff+=dt;if(this.mine.puff>.18){this.mine.puff=0;this.particlesAt(x+.5,y+.5,b.color,3,.9);this.emit('sound',{name:'mine'});this.emit('swing');}
  if(this.mine.progress>=1){this.breakBlock(x,y,harvest);if(this.mode!=='creative')this.damageTool();this.mine=null;this.player.exhaustion+=.025;}
 }
 breakBlock(x,y,harvest=true,explode=false){const w=this.world,id=w.get(x,y),b=BD[id];if(!id||b.hardness===Infinity)return;w.set(x,y,0);this.stats.mined++;this.particlesAt(x+.5,y+.5,b.color,12,2.5);this.emit('sound',{name:'breakBlock'});
  if(this.mode!=='creative'&&harvest&&!explode){let drops=b.drop?[[b.drop,1]]:[];
   if(id===B.leaves||id===B.spruce_leaves){drops=[];if(this.rng()<.18)drops.push(['oak_sapling',1]);if(this.rng()<.12)drops.push(['apple',1]);if(this.rng()<.2)drops.push(['stick',1]);}
   if(id===B.grass_tuft)drops=this.rng()<.5?[['wheat_seeds',1]]:[];
   if(id===B.gravel&&this.rng()<.12)drops=[['flint',1]];
   if(id===B.redstone_ore)drops=[['redstone',4]];if(id===B.lapis_ore)drops=[['lapis',5]];if(id===B.glowstone)drops=[['glowstone_dust',3]];if(id===B.clay)drops=[['clay_ball',4]];if(id===B.bookshelf)drops=[['book',3]];
   if(id===B.wheat_crop){const c=w.crops[`${x},${y}`];drops=c?.type==='nether_wart'?[['nether_wart',c.age>=7?3:1]]:c?.age>=7?[['wheat',1],['wheat_seeds',2+Math.floor(this.rng()*2)]]:[['wheat_seeds',1]];delete w.crops[`${x},${y}`];}
   for(const [d,n] of drops)this.drop(stack(d,n),x+.5,y+.4);
   if(b.id.endsWith('_ore'))this.addXp(id===B.diamond_ore?5:2);
  }
  const k=`${x},${y}`;if(w.stations[k]){for(const s of w.stations[k].slots)if(s)this.drop(s,x+.5,y+.5);delete w.stations[k];}if(id===B.lever)delete w.switches[k];
  if(id===B.obsidian)this.checkBrokenPortals(x,y);
 }
 use(t){const p=this.player,w=this.world,x=Math.floor(t.x),y=Math.floor(t.y),id=w.get(x,y),held=this.selectedStack(),it=ITEMS[held?.id],near=this.reachable(x+.5,y+.5)&&this.lineOfSight(x+.5,y+.5);
  if(near){
   const animal=this.entities.find(e=>['cow','sheep','chicken'].includes(e.type)&&Math.hypot(e.x-t.x,e.y+e.h*.5-t.y)<1.25);if(animal&&held?.id===(animal.type==='chicken'?'wheat_seeds':'wheat')&&!animal.baby&&!(animal.breedCooldown>0)){animal.love=60;this.consumeSelected();this.particlesAt(animal.x,animal.y,'#e2a39a',10,1.4);const mate=this.entities.find(e=>e!==animal&&e.type===animal.type&&e.love>0&&Math.abs(e.x-animal.x)<6&&!e.baby);if(mate){animal.love=mate.love=0;animal.breedCooldown=mate.breedCooldown=300;const young=this.spawnMob(animal.type,(animal.x+mate.x)/2,Math.min(animal.y,mate.y));young.baby=300;this.addXp(3);this.toast('A new '+animal.type+' joins the world.');}return;}const villager=this.entities.find(e=>e.type==='villager'&&Math.hypot(e.x-t.x,e.y+.8-t.y)<1.4);if(villager){this.emit('open',{type:'trade'});return;}
   if([B.crafting_table,B.chest,B.furnace,B.enchanting_table,B.brewing_stand,B.smithing_table].includes(id)){this.emit('open',{type:BD[id].id,x,y,station:w.station(x,y)});return;}
   if(id===B.door||id===B.door_open){w.set(x,y,id===B.door?B.door_open:B.door);this.emit('sound',{name:'place'});return;}
   if(id===B.bed){if(this.dim!=='overworld'){this.toast('Beds cannot be used safely in this dimension.');return;}p.spawn={dim:this.dim,x:x+.5,y:y-1};if(this.time>710||this.time<180){if(this.entities.some(e=>!e.passive&&Math.hypot(e.x-p.x,e.y-p.y)<8))return this.toast('Monsters are too close to sleep.');this.day++;this.time=230;p.hp=20;this.toast('Good morning. Day '+this.day+'.');this.emit('save');}else this.toast('Respawn point set. You can sleep at night.');return;}
   if(id===B.lever){const k=`${x},${y}`;w.switches[k]=!w.switches[k];w.dirty++;this.emit('sound',{name:'place'});return;}
   if(id===B.end_frame&&held?.id==='ender_eye'){if(w.meta.eyes>=12)return;this.consumeSelected();w.meta.eyes++;this.emit('sound',{name:'portal'});this.toast(`${w.meta.eyes} / 12 eyes placed`);if(w.meta.eyes>=12){const s=w.meta.stronghold;w.rect(s.x-1,s.y-3,3,3,'end_portal');w.dirty++;this.toast('The End portal is open.');}return;}
   if(it?.kind==='lighter'){if(this.lightPortal(x,y)){this.damageTool();return;}if(id===B.tnt){w.set(x,y,0);this.projectiles.push({type:'tnt',x:x+.5,y:y+.3,vx:0,vy:-2,life:3,damage:14,owner:'player'});this.damageTool();return;}}
   if(it?.kind==='hoe'&&[B.grass,B.dirt,B.snow_grass].includes(id)&&!w.solid(x,y-1)){w.set(x,y,'farmland');this.damageTool();this.emit('sound',{name:'place'});return;}
   if(held?.id==='wheat_seeds'&&id===B.farmland&&!w.get(x,y-1)){w.set(x,y-1,'wheat_crop');w.crops[`${x},${y-1}`]={age:0,type:'wheat',time:0};this.consumeSelected();return;}
   if(held?.id==='nether_wart'&&id===B.soul_sand&&!w.get(x,y-1)){w.set(x,y-1,'wheat_crop');w.crops[`${x},${y-1}`]={age:0,type:'nether_wart',time:0};this.consumeSelected();return;}
   if(held?.id==='bone_meal'&&id===B.wheat_crop){const c=w.crops[`${x},${y}`];if(c){c.age=Math.min(7,c.age+3);this.consumeSelected();this.particlesAt(x+.5,y+.5,'#b9e49a',12);return;}}
   if(held?.id==='bucket'&&[B.water,B.lava].includes(id)){w.set(x,y,0);this.consumeSelected();this.give(stack(id===B.water?'water_bucket':'lava_bucket'));return;}
   if(held?.id==='glass_bottle'&&id===B.water){this.consumeSelected();this.give(stack('water_bottle'));return;}
  }
  if(it?.food){if(p.food>=20&&held.id!=='golden_apple')return this.toast('You are not hungry.');p.food=Math.min(20,p.food+it.food);p.saturation=Math.min(p.food,p.saturation+it.saturation);if(held.id==='golden_apple'){p.hp=Math.min(20,p.hp+6);this.effects.regeneration=15;}this.consumeSelected();this.emit('sound',{name:'eat'});this.particlesAt(p.x,p.y+.5,'#e9bd7d',5);return;}
  if(it?.kind==='potion'&&held.id.endsWith('_potion')){const name=held.id;this.consumeSelected();this.give(stack('glass_bottle'));if(name==='healing_potion')p.hp=Math.min(20,p.hp+8);if(name==='strength_potion')this.effects.strength=180;if(name==='fire_resistance_potion')this.effects.fire_resistance=180;this.emit('sound',{name:'eat'});return;}
  if(it?.kind==='armor'){const slots=['helmet','chestplate','leggings','boots'],slot=slots.indexOf(it.slot),old=this.armor[slot];this.armor[slot]=held;this.inv[this.selected]=old;this.backpackVersion++;return;}
  if(held?.id==='shield'){const old=this.offhand;this.offhand=held;this.inv[this.selected]=old;this.backpackVersion++;return;}
  if(held?.id==='ender_eye'){if(this.dim!=='overworld')return this.toast('The eye responds only in the Overworld.');const sh=w.meta.stronghold,dx=sh.x-p.x,dy=sh.y-p.y,d=Math.hypot(dx,dy);this.projectiles.push({type:'eye',x:p.x,y:p.y,vx:dx/d*8,vy:dy/d*8,life:2.6,owner:'player'});if(this.rng()<.2)this.consumeSelected();this.toast(Math.abs(dx)>18?`The eye drifts ${dx>0?'east →':'west ←'}.`:'The eye sinks into the earth below.');return;}
  if(held?.id==='ender_pearl'){const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;this.projectiles.push({type:'pearl',x:p.x,y:p.y+.5,vx:dx/d*12,vy:dy/d*12,life:5,owner:'player'});this.consumeSelected();return;}
  if(held?.id==='compass'){const s=p.spawn;return this.toast(`Home: ${Math.round(s.x-p.x)} blocks ${s.x>p.x?'east':'west'}.`);}
  if(held?.id==='clock')return this.toast(`Day ${this.day} · ${this.time>710||this.time<180?'Night':'Daylight'}`);
  if(!held||!near)return;
  let place=it?.block;if(held.id==='redstone')place='redstone_wire';if(held.id==='water_bucket')place='water';if(held.id==='lava_bucket')place='lava';
  if(place){let px=x,py=y;if(id&&!BD[id].fluid&&!['grass_tuft','flower'].includes(BD[id].id)){const rx=t.x-x-.5,ry=t.y-y-.5;if(Math.abs(rx)>Math.abs(ry))px+=rx>0?1:-1;else py+=ry>0?1:-1;}
   if(!this.reachable(px+.5,py+.5)||py<1||py>=w.h-1)return;const existing=w.get(px,py);if(existing&&!BD[existing].fluid&&!['grass_tuft','flower'].includes(BD[existing].id))return;
   const box={x:px+.5,y:py,w:1,h:1};if(BLOCKS[place].solid&&(overlaps(p,box)||this.entities.some(e=>e.hp>0&&!e.flying&&overlaps(e,box))))return;
   if(![w.get(px-1,py),w.get(px+1,py),w.get(px,py-1),w.get(px,py+1)].some(v=>v&&!BD[v].fluid)&&this.mode!=='creative')return;
   w.set(px,py,place);this.consumeSelected();if(held.id.endsWith('_bucket'))this.give(stack('bucket'));if(place==='water'||place==='lava'){w.flow[`${px},${py}`]=8;w.activeFluid.add(`${px},${py}`);}this.stats.placed++;this.emit('sound',{name:'place'});return;
  }
 }
 lightPortal(x,y){const w=this.world;for(let sy=y-4;sy<=y;sy++)for(let sx=x-3;sx<=x;sx++){
  let ok=true;for(let dx=0;dx<4;dx++)for(let dy=0;dy<5;dy++){const corner=(dx===0||dx===3)&&(dy===0||dy===4);if(corner)continue;const edge=dx===0||dx===3||dy===0||dy===4;const id=w.get(sx+dx,sy+dy);if(edge?id!==B.obsidian:id!==0&&id!==B.nether_portal)ok=false;}
  if(ok){for(let dx=1;dx<=2;dx++)for(let dy=1;dy<=3;dy++)w.set(sx+dx,sy+dy,'nether_portal');this.emit('sound',{name:'portal'});this.toast('A doorway between worlds.');return true;}
 }return false;}
 checkBrokenPortals(x,y){const w=this.world;for(let dy=-4;dy<=4;dy++)for(let dx=-3;dx<=3;dx++)if(w.get(x+dx,y+dy)===B.nether_portal)w.set(x+dx,y+dy,0);}
 changeDimension(dim){const old=this.dim,p=this.player;this.entitiesByDim[old]=this.entities;this.world.meta.returnPos={x:p.x,y:p.y};this.world.meta.drops=this.drops;
  if(!this.worlds[dim])this.worlds[dim]=new World(this.seed,dim);this.world=this.worlds[dim];this.dim=dim;this.entities=this.entitiesByDim[dim]||[];this.spawnInitial();this.drops=this.world.meta.drops||[];const pos=this.world.meta.returnPos||this.world.meta.spawn;Object.assign(p,{...pos,vx:0,vy:0,fallY:pos.y});this.projectiles=[];this.mine=null;this.portalCooldown=6;this.portalCharge=0;this.achievements[dim]=true;this.checkQuest();this.emit('dimension',{dim});this.emit('save');}
 hurt(n,cause='a monster',absolute=false){const p=this.player;if(this.mode==='creative'||p.invuln>0||this.status!=='playing')return;const armor=this.armor.reduce((n,s)=>n+(ITEMS[s?.id]?.defense||0)+(s?.ench?.protection||0)*.75,0);if(!absolute)n*=1-Math.min(.8,armor*.04);if(p.blocking&&!absolute){n*=.25;if(this.offhand){this.offhand.dur--;if(this.offhand.dur<=0)this.offhand=null;}}if(this.effects.regeneration)n*=.7;p.hp=Math.max(0,p.hp-n);p.invuln=.7;p.hurt=.3;this.emit('sound',{name:'hurt'});this.emit('shake',{amount:4});this.particlesAt(p.x,p.y+.8,'#d17770',7);for(let i=0;i<4;i++)if(this.armor[i]){this.armor[i].dur--;if(this.armor[i].dur<=0)this.armor[i]=null;}
  if(p.hp<=0){this.stats.deaths++;this.status='dead';this.deathPos={dim:this.dim,x:p.x,y:p.y};if(!this.keepInventory){for(const s of [...this.inv,...this.armor,this.offhand])if(s)this.drop(s,p.x,p.y+.5);this.inv=Array(36).fill(null);this.armor=Array(4).fill(null);this.offhand=null;p.xp=0;p.level=0;}this.emit('died',{cause});this.emit('save');}}
 respawn(){const p=this.player,spawn=p.spawn;if(spawn.dim!==this.dim)this.changeDimension(spawn.dim);Object.assign(p,{x:spawn.x,y:spawn.y,hp:20,food:20,saturation:5,vx:0,vy:0,breath:20,invuln:3,fallY:spawn.y});for(let i=0;i<8&&this.world.solid(p.x,p.y+.5);i++)p.y--;this.status='playing';this.emit('respawn');this.emit('save');}
 hurtMob(e,n,dir=1,projectile=false){if(e.invuln>0||e.hp<=0)return;if(e.type==='dragon'&&e.phase===1&&projectile)return;e.hp-=n;e.invuln=.26;e.angry=true;e.vx=dir*4;if(!e.flying)e.vy=-3;this.text(Math.ceil(n).toString(),e.x,e.y,'#f4dcc5');this.particlesAt(e.x,e.y+e.h*.5,e.type==='crystal'?'#d895ec':e.color,8);this.emit('sound',{name:'hit'});if(e.hp<=0){this.stats.kills++;if(e.type==='crystal'){this.explode(e.x,e.y,2.5,false);this.toast('End crystal destroyed.');}else if(e.type==='dragon')this.win();else{for(const [id,n] of e.drops)this.drop(stack(id,n),e.x,e.y+.5);this.addXp(e.passive?2:5);}}}
 addXp(n){const p=this.player;p.xp+=n;while(p.xp>=this.nextLevel()){p.xp-=this.nextLevel();p.level++;this.emit('sound',{name:'xp'});}}
 nextLevel(){return 7+this.player.level*2;}
 shootArrow(t){if(!this.count('arrow')&&this.mode!=='creative'){this.toast('You need arrows.');return;}const p=this.player,c=Math.max(.15,this.charge),dx=t.x-p.x,dy=t.y-(p.y+.6),d=Math.hypot(dx,dy)||1;this.projectiles.push({type:'arrow',x:p.x,y:p.y+.6,vx:dx/d*(10+14*c),vy:dy/d*(10+14*c),life:4,damage:3+c*7,owner:'player'});if(this.mode!=='creative')this.remove('arrow');this.damageTool();this.attackTimer=.5;this.emit('sound',{name:'bow'});}
 updateMobs(dt){const p=this.player,w=this.world;for(const e of this.entities){if(e.hp<=0)continue;e.age+=dt;e.timer-=dt;if(e.baby>0)e.baby=Math.max(0,e.baby-dt);if(e.breedCooldown>0)e.breedCooldown-=dt;if(e.love>0)e.love-=dt;e.attack-=dt;e.invuln=Math.max(0,e.invuln-dt);const dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy);if(dist>70&&e.type!=='dragon')continue;if(e.type==='crystal')continue;
   if(e.type==='dragon'){this.updateDragon(e,dt);continue;}
   if(e.passive){if(e.timer<0){e.timer=2+this.rng()*4;e.dir=this.rng()<.3?0:this.rng()<.5?-1:1;}e.vx+=((e.dir||0)*e.speed-e.vx)*Math.min(1,dt*3);if(e.angry){e.vx=-Math.sign(dx)*e.speed*2;if(e.timer<1)e.angry=false;}}
   else if(e.type==='enderman'&&!e.angry){if(e.timer<0){e.timer=3+this.rng()*5;e.dir=this.rng()<.5?-1:1;}e.vx=(e.dir||0)*.7;}
   else if(dist<24){e.facing=dx>0?1:-1;
    if(e.type==='blaze'||e.type==='ghast'){e.vx=dist>8?Math.sign(dx)*e.speed:Math.sin(e.age)*.6;e.vy=clamp((p.y-3-e.y)*.8,-2,2)+Math.cos(e.age)*.7;if(e.attack<=0&&this.lineOfSight(e.x,e.y)){e.attack=e.type==='ghast'?4:2.4;const d=Math.max(1,dist);this.projectiles.push({type:'fireball',x:e.x,y:e.y+.5,vx:dx/d*7,vy:(dy+.5)/d*7,life:5,damage:e.damage,owner:'mob'});}}
    else{e.vx+=(Math.sign(dx)*e.speed-e.vx)*Math.min(1,dt*6);if(e.type==='skeleton'&&Math.abs(dx)<11){e.vx=Math.abs(dx)<5?-Math.sign(dx):0;if(e.attack<=0){e.attack=2.3;const d=Math.max(1,dist);this.projectiles.push({type:'arrow',x:e.x,y:e.y+.4,vx:dx/d*12,vy:(dy+.3)/d*12-1,life:3,damage:3,owner:'mob'});}}
     if(e.type==='creeper'){if(dist<2){e.fuse=(e.fuse||0)+dt;if(e.fuse>1.5){e.hp=0;this.explode(e.x,e.y+1,3,true);}}else e.fuse=Math.max(0,(e.fuse||0)-dt*2);}
     else if(dist<1.45&&e.attack<=0){this.hurt(e.damage,e.type==='zombie'?'a zombie':e.type==='enderman'?'an enderman':e.type);e.attack=1.1;p.vx+=Math.sign(dx)*3;}
    }
   }else e.vx*=.97;
   if(e.vx)e.facing=Math.sign(e.vx);
   if(!e.flying){e.vy=Math.min(22,e.vy+23*dt);if(e.grounded&&(w.solid(e.x+Math.sign(e.vx)*.8,e.y+e.h-.2)||e.type==='slime'&&e.timer<0)){e.vy=-8;e.timer=1.8;}if(e.type==='spider'&&w.solid(e.x+e.facing*.7,e.y+.2))e.vy=-3;if(w.get(e.x,e.y+.4)===B.water)e.vy=-3;this.move(e,dt);}else{e.x+=e.vx*dt;e.y+=e.vy*dt;}
   if(this.dim==='overworld'&&['zombie','skeleton'].includes(e.type)&&this.time>220&&this.time<700&&e.y<w.sky[Math.floor(e.x)]){e.sun=(e.sun||0)+dt;if(e.sun>1){e.sun=0;this.hurtMob(e,2,0);}}
  }this.entities=this.entities.filter(e=>e.hp>0);}
 updateDragon(e,dt){const p=this.player,phaseTime=e.age%32;e.phase=phaseTime>24?1:0;const tx=e.phase===1?122:120+Math.sin(e.age*.23)*77,ty=e.phase===1?80:69+Math.sin(e.age*.38)*5;e.vx=(tx-e.x)*.85;e.vy=(ty-e.y)*.85;e.x+=e.vx*dt;e.y+=e.vy*dt;e.facing=e.vx<0?-1:1;
  const crystal=this.entities.find(m=>m.type==='crystal'&&m.hp>0);e.healing=crystal?{x:crystal.x,y:crystal.y}:null;if(crystal)e.hp=Math.min(200,e.hp+dt*1.5);
  if(e.attack<=0){e.attack=e.phase?1.4:2.5;const dx=p.x-e.x,dy=p.y+.6-e.y,d=Math.hypot(dx,dy);this.projectiles.push({type:'dragonfire',x:e.x,y:e.y+.5,vx:dx/d*8,vy:dy/d*8,life:7,damage:5,owner:'mob'});}
  if(Math.hypot(p.x-e.x,p.y-e.y)<4)this.hurt(5,'the Ender Dragon');
 }
 spawnAround(){const p=this.player,w=this.world,night=this.time>735||this.time<150,hostiles=this.entities.filter(e=>!e.passive&&e.type!=='crystal'&&e.type!=='dragon').length;if(this.difficulty==='peaceful'||hostiles>=12||this.dim==='end')return;if(this.dim==='overworld'&&!night&&p.y<(w.height[Math.floor(p.x)]||50)+8)return;
  const x=Math.floor(clamp(p.x+(this.rng()<.5?-1:1)*(16+this.rng()*16),2,w.w-3));let y=Math.floor(p.y-7);for(;y<Math.min(w.h-4,p.y+12);y++)if(w.solid(x,y+2)&&!w.solid(x,y)&&!w.solid(x,y+1))break;if(y>=p.y+12||y>=w.h-4)return;const types=this.dim==='nether'?['blaze','blaze','ghast']:['zombie','zombie','skeleton','spider','creeper','enderman','enderman','slime'];this.spawnMob(types[Math.floor(this.rng()*types.length)],x+.5,y);}
 updateDrops(dt){const p=this.player;for(const d of this.drops){d.age+=dt;const dist=Math.hypot(d.x-p.x,d.y-p.y-.8);if(dist<2.3&&d.age>.45&&this.canAdd(d.s.id,d.s.n)){d.x+=(p.x-d.x)*dt*9;d.y+=(p.y+.9-d.y)*dt*9;if(dist<.6){this.add(d.s.id,d.s.n,d.s);d.dead=true;this.emit('sound',{name:'pickup'});}}else{d.vy=Math.min(12,d.vy+15*dt);d.vx*=.97;this.move(d,dt);}}this.drops=this.drops.filter(d=>!d.dead&&d.age<900);}
 updateProjectiles(dt){const w=this.world,p=this.player;for(const a of this.projectiles){a.life-=dt;const ox=a.x,oy=a.y;if(a.type==='arrow'||a.type==='pearl'||a.type==='tnt')a.vy+=12*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;
  if(a.type==='eye'){this.particlesAt(a.x,a.y,'#94d9ae',1,.4);continue;}
  if(a.type==='tnt'){if(w.solid(a.x,a.y+.3)){a.y=Math.floor(a.y)-.3;a.vy=0;a.vx=0;}if(a.life<=0)this.explode(a.x,a.y,4,true);continue;}
  let hitBlock=false;const steps=Math.ceil(Math.hypot(a.x-ox,a.y-oy)*4);for(let i=1;i<=steps;i++)if(w.solid(ox+(a.x-ox)*i/steps,oy+(a.y-oy)*i/steps)){hitBlock=true;break;}
  if(hitBlock){if(a.type==='pearl'){p.x=clamp(ox,.5,w.w-.5);p.y=oy-1;p.vx=p.vy=0;p.fallY=p.y;for(let i=0;i<5&&w.solid(p.x,p.y+1);i++)p.y--;this.hurt(5,'an ender pearl');}if(a.type==='fireball')this.explode(a.x,a.y,1.4,false);if(a.type==='dragonfire')this.particlesAt(a.x,a.y,'#b994d5',20,3);a.life=0;}
  if(a.owner==='player'){for(const e of this.entities)if(e.hp>0&&a.x>e.x-e.w/2-.2&&a.x<e.x+e.w/2+.2&&a.y>e.y-.2&&a.y<e.y+e.h+.2){this.hurtMob(e,a.damage||4,Math.sign(a.vx),true);a.life=0;break;}}
  else if(a.x>p.x-p.w/2-.1&&a.x<p.x+p.w/2+.1&&a.y>p.y&&a.y<p.y+p.h){this.hurt(a.damage||3,a.type==='dragonfire'?'dragon breath':'a projectile');a.life=0;}
 }this.projectiles=this.projectiles.filter(a=>a.life>0);}
 explode(x,y,r,terrain){this.emit('sound',{name:'explode'});this.emit('shake',{amount:9});this.particlesAt(x,y,'#e4b181',48,6);const p=this.player,d=Math.hypot(p.x-x,p.y-y);if(d<r+1)this.hurt((r+1-d)*4,'an explosion');for(const e of this.entities){const de=Math.hypot(e.x-x,e.y-y);if(de<r&&e.type!=='crystal')this.hurtMob(e,(r-de)*5,Math.sign(e.x-x));}if(terrain)for(let dy=-Math.ceil(r);dy<=r;dy++)for(let dx=-Math.ceil(r);dx<=r;dx++)if(dx*dx+dy*dy<r*r){const b=BD[this.world.get(Math.floor(x+dx),Math.floor(y+dy))];if(b.hardness<4&&!b.fluid)this.breakBlock(Math.floor(x+dx),Math.floor(y+dy),false,true);}}
 updateStations(dt){for(const s of Object.values(this.world.stations)){if(s.type!=='furnace')continue;const input=s.slots[0],fuel=s.slots[1],output=s.slots[2],result=SMELTS[input?.id],can=!!result&&(!output||(output.id===result&&output.n<64));if(s.burn>0)s.burn=Math.max(0,s.burn-dt);if(can&&s.burn<=0&&FUELS[fuel?.id]){s.burn=FUELS[fuel.id];s.maxBurn=s.burn;const lava=fuel.id==='lava_bucket';fuel.n--;if(fuel.n<=0)s.slots[1]=lava?stack('bucket'):null;}
  if(can&&s.burn>0){s.progress=(s.progress||0)+dt;if(s.progress>=10){s.progress-=10;input.n--;if(!input.n)s.slots[0]=null;if(output)output.n++;else s.slots[2]=stack(result);this.emit('station');}}else s.progress=Math.max(0,(s.progress||0)-dt*.8);
 }}
 updateEnvironment(){const w=this.world,p=this.player;
  for(const [key,c] of Object.entries(w.crops)){const [x,y]=key.split(',').map(Number);if(w.get(x,y)!==B.wheat_crop){delete w.crops[key];continue;}let hydrated=c.type==='nether_wart';if(!hydrated)for(let dx=-4;dx<=4;dx++)for(let dy=0;dy<=2;dy++)if(w.get(x+dx,y+dy)===B.water)hydrated=true;if(c.age<7&&(c.type==='nether_wart'||this.time>180&&this.time<740||w.get(x+1,y)===B.torch)){c.time=(c.time||0)+.25;if(c.time>(hydrated?22:70)){c.time=0;c.age++;}}}
  const px=Math.floor(p.x),py=Math.floor(p.y);for(let y=Math.min(w.h-2,py+15);y>=Math.max(1,py-16);y--)for(let x=Math.max(1,px-20);x<Math.min(w.w-1,px+20);x++){
   const id=w.get(x,y);if(id===B.sugar_cane&&!w.get(x,y-1)&&this.rng()<.003){let base=y;while(w.get(x,base+1)===B.sugar_cane)base++;if(base-y<2&&[w.get(x-1,base),w.get(x+1,base),w.get(x-1,base+1),w.get(x+1,base+1)].includes(B.water))w.set(x,y-1,'sugar_cane');}if(BD[id].falling&&!w.get(x,y+1)){w.set(x,y+1,id);w.set(x,y,0);}
   if(id===B.oak_sapling&&this.rng()<.0006&&[B.dirt,B.grass].includes(w.get(x,y+1))){w.set(x,y,0);w.tree(x,y+1);w.rebuildSky();w.dirty++;}
   if(id===B.lava&&[w.get(x-1,y),w.get(x+1,y),w.get(x,y-1),w.get(x,y+1)].includes(B.water)){w.set(x,y,'obsidian');delete w.flow[`${x},${y}`];}
  }
  let iterations=0;for(const key of [...w.activeFluid]){if(iterations++>100)break;const [x,y]=key.split(',').map(Number),id=w.get(x,y),level=w.flow[key]||0;if(!BD[id].fluid){w.activeFluid.delete(key);continue;}if(Math.abs(x-p.x)>30||Math.abs(y-p.y)>24)continue;const below=w.get(x,y+1);if(!below){w.set(x,y+1,id);w.flow[`${x},${y+1}`]=7;w.activeFluid.add(`${x},${y+1}`);}else if(!BD[below].fluid&&level>1){for(const dx of [-1,1])if(!w.get(x+dx,y)){w.set(x+dx,y,id);w.flow[`${x+dx},${y}`]=level-1;w.activeFluid.add(`${x+dx},${y}`);}}w.activeFluid.delete(key);}
 }
 brew(bottle,ingredient){const rules=BREWS[bottle],rule=(Array.isArray(rules)?rules:[rules]).find(r=>r?.ingredient===ingredient);if(!rule||!this.nearStation('brewing_stand')||!this.count(bottle)||!this.count(ingredient)||this.count('blaze_powder')<(ingredient==='blaze_powder'?2:1))return false;this.remove(bottle);this.remove(ingredient);this.remove('blaze_powder');this.add(rule.out);this.emit('sound',{name:'craft'});return true;}
 enchant(slot){const s=this.inv[slot],it=ITEMS[s?.id];if(!s||!it.durability||it.kind==='lighter'||s.ench||!this.nearStation('enchanting_table'))return false;let shelves=0;for(let y=Math.floor(this.player.y)-4;y<=this.player.y+4;y++)for(let x=Math.floor(this.player.x)-4;x<=this.player.x+4;x++)if(this.world.get(x,y)===B.bookshelf)shelves++;const lvl=shelves>=10?3:shelves>=4?2:1;if(this.player.level<lvl||this.count('lapis')<lvl)return this.toast(`You need ${lvl} experience levels and ${lvl} lapis.`);this.player.level-=lvl;this.remove('lapis',lvl);s.ench={[it.kind==='sword'||it.kind==='bow'?'sharpness':it.kind==='armor'?'protection':'efficiency']:lvl};this.emit('sound',{name:'xp'});this.backpackVersion++;return true;}
 trade(index){const offers=[{give:'wheat',n:20,get:'emerald',m:1},{give:'coal',n:15,get:'emerald',m:1},{give:'emerald',n:1,get:'bread',m:6},{give:'emerald',n:2,get:'melon_slice',m:4},{give:'emerald',n:5,get:'ender_pearl',m:1},{give:'emerald',n:6,get:'iron_pickaxe',m:1}];const o=offers[index];if(!o||this.count(o.give)<o.n||!this.canAdd(o.get,o.m))return false;this.remove(o.give,o.n);this.add(o.get,o.m);this.emit('sound',{name:'craft'});return true;}
 win(){this.achievements.dragon=true;this.world.meta.dragonDead=true;this.checkQuest();this.addXp(1200);this.drop(stack('dragon_egg'),122,80);this.world.rect(118,84,8,2,'bedrock');this.world.rect(120,81,4,3,'end_portal');this.world.dirty++;this.emit('victory');this.emit('save');}
 serialize(){this.entitiesByDim[this.dim]=this.entities;this.world.meta.drops=this.drops;return {version:VERSION,id:this.id,name:this.name,seed:this.seed,mode:this.mode,difficulty:this.difficulty,keepInventory:this.keepInventory,dim:this.dim,player:this.player,inv:this.inv,armor:this.armor,offhand:this.offhand,selected:this.selected,time:this.time,day:this.day,played:this.played,seen:this.seen,achievements:this.achievements,activeQuest:this.activeQuest,stats:this.stats,effects:this.effects,deathPos:this.deathPos,dead:this.status==='dead',worlds:Object.fromEntries(Object.entries(this.worlds).map(([k,v])=>[k,v.serialize()])),entities:this.entitiesByDim,saved:Date.now()};}
 load(data){if(!data||data.version!==VERSION||!Array.isArray(data.inv)||data.inv.length!==36)throw Error('This save file is not compatible.');const validStack=s=>!s||(typeof s.id==='string'&&ITEMS[s.id]&&Number.isInteger(s.n)&&s.n>0&&s.n<=ITEMS[s.id].stack&&(!s.dur||Number.isFinite(s.dur)&&s.dur>0));if(!data.inv.every(validStack)||!Array.isArray(data.armor)||data.armor.length!==4||!data.armor.every(validStack)||!validStack(data.offhand)||!data.worlds||Object.keys(data.worlds).length>3)throw Error('Invalid inventory or dimensions');const worlds=Object.fromEntries(Object.entries(data.worlds).map(([k,v])=>[k,World.deserialize(v)]));if(!worlds[data.dim]||!data.player||!Number.isFinite(data.player.x)||!Number.isFinite(data.player.y))throw Error('Invalid player data');for(const key of ['id','name','seed','mode','difficulty','keepInventory','dim','player','inv','armor','offhand','selected','time','day','played','seen','achievements','activeQuest','stats','effects','deathPos'])if(data[key]!==undefined)this[key]=data[key];this.worlds=worlds;this.world=worlds[this.dim];this.entitiesByDim=data.entities||{};for(const entities of Object.values(this.entitiesByDim))if(!Array.isArray(entities)||entities.length>500||entities.some(e=>!MOB[e.type]||!Number.isFinite(e.x)||!Number.isFinite(e.y)))throw Error('Invalid creature data');this.entities=this.entitiesByDim[this.dim]||[];this.drops=this.world.meta.drops||[];this.projectiles=[];this.particles=[];this.texts=[];this.status=data.dead?'dead':'playing';this.mine=null;this.portalCharge=0;this.portalCooldown=4;this.autosave=0;this.rng=rng(Date.now());this.emit('started');if(data.dead)this.emit('died',{cause:'your last adventure'});}
}
