import {Game} from './game.js';
import {B,BD} from './data.js';

// Wake nearby natural fluids whenever terrain changes. FlatCraft's base fluid
// simulation already spreads active water/lava, but generated lakes were never
// marked active after a neighboring block was mined.
const originalBreakBlock=Game.prototype.breakBlock;

function wakeFluid(world,x,y){
 const id=world.get(x,y);
 if(id!==B.water&&id!==B.lava)return;
 const key=`${x},${y}`;
 // Generated fluid has no flow level. Treat it as a source so opening terrain
 // beside a lake/reservoir behaves like a real source rather than a weak remnant.
 if(!world.flow[key])world.flow[key]=8;
 world.activeFluid.add(key);
}

function wakeAround(world,x,y){
 wakeFluid(world,x-1,y);
 wakeFluid(world,x+1,y);
 wakeFluid(world,x,y-1);
 wakeFluid(world,x,y+1);
}

Game.prototype.breakBlock=function(x,y,...args){
 const world=this.world;
 const result=originalBreakBlock.call(this,x,y,...args);
 if(world&&!world.get(x,y))wakeAround(world,x,y);
 return result;
};

// Also wake source fluid around newly opened air cells caused by falling blocks
// or other terrain changes during environment updates. This is intentionally
// lightweight and only scans near the player, matching the base environment sim.
const originalUpdateEnvironment=Game.prototype.updateEnvironment;
Game.prototype.updateEnvironment=function(...args){
 const world=this.world,p=this.player;
 if(world&&p){
  const px=Math.floor(p.x),py=Math.floor(p.y);
  for(let y=Math.max(1,py-12);y<=Math.min(world.h-2,py+12);y++){
   for(let x=Math.max(1,px-16);x<=Math.min(world.w-2,px+16);x++){
    if(world.get(x,y))continue;
    if([world.get(x-1,y),world.get(x+1,y),world.get(x,y-1)].some(id=>id===B.water||id===B.lava))wakeAround(world,x,y);
   }
  }
 }
 return originalUpdateEnvironment.apply(this,args);
};
