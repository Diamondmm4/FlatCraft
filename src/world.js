import {B,BD,stack} from './data.js';
export function hashSeed(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function rng(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function noise(x,y,seed=1){let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,1442695041);n=Math.imul(n^n>>>13,1274126177);return ((n^n>>>16)>>>0)/4294967296;}
const lerp=(a,b,t)=>a+(b-a)*t;
function smooth(x,seed){const i=Math.floor(x),f=x-i;return lerp(noise(i,0,seed),noise(i+1,0,seed),f*f*(3-2*f));}
export class World{
 constructor(seed='FlatCraft',dim='overworld',generate=true){this.seed=hashSeed(seed);this.seedText=String(seed);this.dim=dim;this.w=dim==='overworld'?768:dim==='nether'?384:240;this.h=dim==='overworld'?192:160;this.tiles=new Uint8Array(this.w*this.h);this.back=new Uint8Array(this.tiles.length);this.height=new Uint16Array(this.w);this.sky=new Uint16Array(this.w);this.stations={};this.crops={};this.switches={};this.flow={};this.discovered=new Uint8Array(this.tiles.length);this.meta={eyes:0,dragonDead:false};this.spawns=[];this.dirty=0;this.activeFluid=new Set();if(generate){if(dim==='overworld')this.generateOverworld();else if(dim==='nether')this.generateNether();else this.generateEnd();this.rebuildSky();}}
 index(x,y){return y*this.w+x;}
 get(x,y){x=Math.floor(x);y=Math.floor(y);if(x<0||x>=this.w||y>=this.h)return B.bedrock;if(y<0)return 0;return this.tiles[this.index(x,y)];}
 solid(x,y){const id=this.get(x,y);if(id===B.obsidian&&(this.get(Math.floor(x)-1,Math.floor(y))===B.nether_portal||this.get(Math.floor(x)+1,Math.floor(y))===B.nether_portal))return false;return BD[id].solid;}
 set(x,y,id){x|=0;y|=0;if(x<0||x>=this.w||y<0||y>=this.h)return;this.tiles[this.index(x,y)]=typeof id==='string'?B[id]:id;this.dirty++;this.rebuildSky(x);}
 raw(x,y,id){if(x>=0&&x<this.w&&y>=0&&y<this.h)this.tiles[y*this.w+x]=typeof id==='string'?B[id]:id;}
 rebuildSky(only=null){for(let x=only??0;x<(only===null?this.w:only+1);x++){let y=0;while(y<this.h&&!BD[this.get(x,y)].opaque)y++;this.sky[x]=y;}}
 rect(x,y,w,h,id){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)this.raw(i,j,id);}
 biome(x){if(this.dim==='nether')return 'The Nether';if(this.dim==='end')return 'The End';x=(x+this.w)%this.w;if(x<190)return 'Sunlit Forest';if(x<310)return 'Amber Dunes';if(x<440)return 'Silver Taiga';if(x<590)return 'Wildflower Plains';return 'Oldgrowth Forest';}
 tree(x,y,spruce=false){const h=4+Math.floor(noise(x,y,this.seed)*3);const log=spruce?'spruce_log':'log',leaves=spruce?'spruce_leaves':'leaves';if(spruce){for(let j=0;j<h+2;j++){const r=Math.min(3,Math.floor(j/2)+1);for(let dx=-r;dx<=r;dx++)if(!this.get(x+dx,y-h-2+j))this.raw(x+dx,y-h-2+j,leaves);}}else{for(let dy=-2;dy<=1;dy++)for(let dx=-3;dx<=3;dx++)if(Math.abs(dx)+(dy===-2?2:0)<5&&!this.get(x+dx,y-h+dy))this.raw(x+dx,y-h+dy,leaves);}for(let j=1;j<=h;j++)this.raw(x,y-j,log);}
 generateOverworld(){
  const rand=rng(this.seed),spawnX=92;
  for(let x=0;x<this.w;x++){
   let h=Math.floor(50+(smooth(x/43,this.seed)-.5)*23+(smooth(x/11,this.seed+8)-.5)*5);
   if(Math.abs(x-spawnX)<10)h=51;
   this.height[x]=h;const biome=this.biome(x),sand=biome==='Amber Dunes',snow=biome==='Silver Taiga';
   for(let y=h;y<this.h;y++){let b=y===h?(sand?B.sand:snow?B.snow_grass:B.grass):y<h+5?(sand?B.sand:B.dirt):B.stone;
    if(y>this.h-3||y===this.h-3&&rand()<.5)b=B.bedrock;
    this.raw(x,y,b);this.back[y*this.w+x]=b===B.stone?B.stone:B.dirt;
   }
  }
  // Connected worm caves form traversable tunnels without erasing the surface.
  for(let n=0;n<132;n++){
   let x=rand()*this.w,y=66+rand()*(this.h-77),ang=rand()*Math.PI*2,r=1.3+rand()*2.1;
   for(let i=0;i<38+rand()*75;i++){x+=Math.cos(ang)*1.5;y+=Math.sin(ang)*1.1;ang+=(rand()-.5)*.9;y=Math.max((this.height[Math.floor(Math.max(0,Math.min(this.w-1,x)))]||50)+7,Math.min(this.h-7,y));
    for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++)for(let dx=-Math.ceil(r);dx<=Math.ceil(r);dx++)if(dx*dx+dy*dy<r*r)this.raw(Math.floor(x+dx),Math.floor(y+dy),0);
   }
  }
  // A gentle, visible cave entrance near the starting clearing.
  for(let i=0;i<48;i++){let x=spawnX+28+i*.7,y=(this.height[spawnX+28]||51)-2+i*.62;for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)this.raw(Math.floor(x+dx),Math.floor(y+dy),0);}
  const veins=[['coal_ore',620,8,5],['iron_ore',480,13,5],['gold_ore',170,38,4],['redstone_ore',190,56,4],['lapis_ore',110,40,4],['diamond_ore',115,76,4],['emerald_ore',60,57,2]];
  for(const [ore,n,minDepth,len] of veins)for(let k=0;k<n;k++){let x=3+Math.floor(rand()*(this.w-6)),y=this.height[x]+minDepth+Math.floor(rand()*(this.h-this.height[x]-minDepth-4));for(let j=0;j<len;j++){if(this.get(x,y)===B.stone)this.raw(x,y,ore);x+=Math.floor(rand()*3)-1;y+=Math.floor(rand()*3)-1;}}
  // Deep reservoirs make water, lava, and obsidian obtainable naturally.
  for(let n=0;n<32;n++){const x=8+Math.floor(rand()*(this.w-20)),y=126+Math.floor(rand()*50);for(let j=0;j<3;j++)for(let i=-4;i<=4;i++)if(this.get(x+i,y+j)!==B.bedrock){this.raw(x+i,y+j,j===2?B.obsidian:B.lava);}}
  for(const center of [157,477,648]){let waterY=this.height[center];for(let x=center-7;x<=center+7;x++){const edge=Math.abs(x-center)>5;for(let y=waterY-4;y<waterY+4;y++)this.raw(x,y,y<waterY?0:y<waterY+(edge?1:3)?B.water:B.sand);this.height[x]=waterY+3;}for(let i=0;i<3;i++)this.raw(center-8,waterY-i,'sugar_cane');for(let i=-4;i<=4;i++)this.raw(center+i,waterY+4,'clay');this.meta['cane'+center]={x:center-8,y:waterY-1};}
  for(let x=7;x<this.w-7;x++){
   const y=this.height[x],biome=this.biome(x);if(this.get(x,y)!==B.grass&&this.get(x,y)!==B.snow_grass&&this.get(x,y)!==B.sand)continue;
   if(biome==='Amber Dunes'){if(rand()<.045){for(let h=1;h<3+rand()*2;h++)this.raw(x,y-h,B.cactus);x+=3;}continue;}
   if(Math.abs(x-spawnX)<6)continue;
   if(rand()<(biome==='Wildflower Plains'?.028:.16)){this.tree(x,y,biome==='Silver Taiga');x+=5;}
   else if(rand()<.36)this.raw(x,y-1,rand()<.22?B.flower:B.grass_tuft);
  }
  // Nearby animals establish a dependable food and wool loop.
  for(const [dx,type] of [[-9,'sheep'],[-13,'sheep'],[16,'pig'],[20,'cow'],[35,'chicken']])this.spawns.push({type,x:spawnX+dx,y:this.height[spawnX+dx]-2});
  for(let n=0;n<52;n++){let x=10+Math.floor(rand()*(this.w-20));if(this.biome(x)!=='Amber Dunes')this.spawns.push({type:['sheep','cow','pig','chicken'][Math.floor(rand()*4)],x,y:this.height[x]-2});}
  // A village lies to the west, with functional workstations and modest supplies.
  for(const x of [24,37,50])this.hut(x,this.height[x]);
  this.spawns.push({type:'villager',x:36,y:this.height[36]-2});
  const sx=603,sy=119;this.rect(sx-2,sy-2,30,15,'stone_bricks');this.rect(sx,sy,26,11,0);
  this.rect(sx+1,sy+10,24,1,'stone_bricks');for(let i=0;i<12;i++)this.raw(sx+7+i,sy+9,'end_frame');
  this.raw(sx+2,sy+8,'torch');this.raw(sx+23,sy+8,'torch');this.raw(sx+3,sy+9,'chest');
  this.stations[`${sx+3},${sy+9}`]={type:'chest',slots:[stack('ender_pearl',2),stack('iron_ingot',5),stack('bread',4),...Array(24).fill(null)]};
  this.meta.stronghold={x:sx+13,y:sy+8};this.meta.spawn={x:spawnX+.5,y:49};
  // Coal is deliberately reachable with the first wooden pickaxe.
  for(let i=0;i<5;i++)this.raw(spawnX+32+i,this.height[spawnX+32+i]+4,'coal_ore');
 }
 hut(x,y){this.rect(x,y-5,9,6,0);this.rect(x,y,9,1,'planks');this.rect(x,y-5,9,1,'planks');this.rect(x,y-4,1,4,'planks');this.rect(x+8,y-4,1,4,'planks');for(let k=0;k<3;k++)this.rect(x-1+k,y-6-k,11-k*2,1,'planks');this.raw(x+8,y-1,'door');this.raw(x+8,y-2,0);this.raw(x+3,y-3,'glass');this.raw(x+4,y-3,'glass');this.raw(x+1,y-1,'bed');this.raw(x+3,y-1,'crafting_table');this.raw(x+5,y-1,'furnace');this.raw(x+6,y-2,'torch');this.raw(x+6,y-1,'chest');this.stations[`${x+6},${y-1}`]={type:'chest',slots:[stack('bread',2),stack('wheat_seeds',3),stack('apple',1),...Array(24).fill(null)]};}
 portalFrame(x,y){for(let dx=0;dx<4;dx++)for(let dy=0;dy<5;dy++)this.raw(x+dx,y+dy,dx===0||dx===3||dy===0||dy===4?'obsidian':'nether_portal');}
 generateNether(){const rand=rng(this.seed+177);for(let x=0;x<this.w;x++){
  const surface=104+Math.floor((smooth(x/24,this.seed)-.5)*13);this.height[x]=surface;
  for(let y=0;y<this.h;y++){this.back[y*this.w+x]=y>=surface?B.netherrack:0;let b=y<7||y>=surface?B.netherrack:0;if(y===0||y===this.h-1)b=B.bedrock;if(y>137&&y<this.h-1)b=B.lava;if(b===B.netherrack&&rand()<.05)b=B.quartz_ore;if(y>119&&b===B.netherrack&&rand()<.008)b=B.ancient_debris;this.raw(x,y,b);}
  if(x%23===0)for(let y=8;y<16;y++)this.raw(x,y,B.glowstone);
 }
 for(let i=0;i<28;i++){let x=rand()*this.w,y=20+rand()*65,r=3+rand()*8;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<r*r)this.raw(Math.floor(x+dx),Math.floor(y+dy),'netherrack');}
 this.rect(22,93,18,13,0);this.rect(21,106,20,2,'netherrack');this.portalFrame(27,101);this.meta.spawn={x:32,y:103};
 const fx=165,fy=99;this.rect(fx,fy,57,3,'nether_bricks');for(const x of [fx,fx+18,fx+36,fx+54])this.rect(x,fy-13,3,14,'nether_bricks');this.rect(fx,fy-14,57,2,'nether_bricks');
 for(let x=fx+4;x<fx+53;x+=5){this.raw(x,fy-1,'soul_sand');this.crops[`${x},${fy-2}`]={type:'nether_wart',age:7};this.raw(x,fy-2,'wheat_crop');}
 this.raw(fx+5,fy-3,'chest');this.stations[`${fx+5},${fy-3}`]={type:'chest',slots:[stack('nether_wart',5),stack('gold_ingot',5),stack('diamond',2),stack('netherite_upgrade_template',1),...Array(23).fill(null)]};
 for(const x of [fx+10,fx+29,fx+46])this.spawns.push({type:'blaze',x,y:fy-5});
 this.meta.fortress={x:fx+28,y:fy-5};
 }
 generateEnd(){const rand=rng(this.seed+77);this.height.fill(88);
 for(let x=14;x<this.w-14;x++){const edge=Math.min(x-14,this.w-15-x);for(let y=86;y<86+Math.min(22,edge*.75);y++)this.raw(x,y,'end_stone');}
 for(const x of [42,76,110,150,186]){const top=68+Math.floor(rand()*7);this.rect(x,top,3,86-top,'obsidian');this.spawns.push({type:'crystal',x:x+1.5,y:top-1.4});}
 this.rect(22,82,5,1,'obsidian');this.meta.spawn={x:24,y:79};this.spawns.push({type:'dragon',x:120,y:68});
 for(let i=0;i<8;i++)this.spawns.push({type:'enderman',x:30+rand()*180,y:84});
 }
 station(x,y){const k=`${x},${y}`,id=BD[this.get(x,y)].id;if(!this.stations[k])this.stations[k]={type:id,slots:Array(id==='chest'?27:id==='furnace'?3:5).fill(null),burn:0,progress:0};return this.stations[k];}
 markVisible(x,y,r=18){const ix=Math.floor(x),iy=Math.floor(y);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r&&ix+dx>=0&&ix+dx<this.w&&iy+dy>=0&&iy+dy<this.h)this.discovered[(iy+dy)*this.w+ix+dx]=1;}
 serialize(){return {seedText:this.seedText,dim:this.dim,w:this.w,h:this.h,tiles:pack(this.tiles),back:pack(this.back),height:[...this.height],discovered:pack(this.discovered),meta:this.meta,stations:this.stations,crops:this.crops,switches:this.switches,flow:this.flow,spawns:[]};}
 static deserialize(o){if(!o||!['overworld','nether','end'].includes(o.dim))throw Error('Invalid world');const w=new World(o.seedText,o.dim,false);if(o.w!==w.w||o.h!==w.h)throw Error('Invalid world dimensions');w.tiles=unpack(o.tiles,w.w*w.h);w.back=unpack(o.back,w.w*w.h);if(w.tiles.some(id=>!BD[id])||w.back.some(id=>!BD[id])||!Array.isArray(o.height)||o.height.length!==w.w)throw Error('Corrupt terrain');w.height=new Uint16Array(o.height);w.discovered=unpack(o.discovered,w.w*w.h);w.meta=o.meta;w.stations=o.stations||{};w.crops=o.crops||{};w.switches=o.switches||{};w.flow=o.flow||{};w.rebuildSky();return w;}
}
export function pack(arr){const out=[];let last=arr[0],n=0;for(const v of arr){if(v===last&&n<65535)n++;else{out.push(last,n);last=v;n=1;}}if(n)out.push(last,n);return out;}
export function unpack(a,len){if(!Array.isArray(a)||a.length>len*2||a.length%2)throw Error('Invalid world data');const out=new Uint8Array(len);let p=0;for(let i=0;i<a.length;i+=2){const val=a[i],n=a[i+1];if(!Number.isInteger(n)||n<1||p+n>len||!Number.isInteger(val)||val<0||val>255)throw Error('Corrupt world data');out.fill(val,p,p+n);p+=n;}if(p!==len)throw Error('Incomplete world data');return out;}
