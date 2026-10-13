import {B,stack} from './data.js';
import {World,rng} from './world.js';

if(!World.prototype.__undergroundProgressionInstalled){
  World.prototype.__undergroundProgressionInstalled=true;
  const originalGenerateOverworld=World.prototype.generateOverworld;

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function carve(world,x,y,w,h){
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
      if(world.get(xx,yy)!==B.bedrock)world.raw(xx,yy,B.air);
    }
  }

  function addChest(world,x,y,loot){
    world.raw(x,y,'chest');
    world.stations[`${x},${y}`]={type:'chest',slots:[...loot,...Array(Math.max(0,27-loot.length)).fill(null)]};
  }

  function addMineshaft(world,cx,cy,rand){
    const left=clamp(cx-24,8,world.w-56),right=clamp(cx+24,56,world.w-8);
    carve(world,left,cy-3,right-left+1,4);

    for(let x=left;x<=right;x++){
      if(world.get(x,cy)!==B.bedrock)world.raw(x,cy,'planks');
    }

    for(let x=left+2;x<right;x+=6){
      world.raw(x,cy-1,'fence');
      world.raw(x,cy-2,'fence');
      world.raw(x+1,cy-3,'planks');
      world.raw(x,cy-3,'planks');
      world.raw(x-1,cy-3,'planks');
      if(((x-left)/6|0)%2===0)world.raw(x+2,cy-2,'torch');
    }

    const branches=[left+10,cx,right-10];
    for(const bx of branches){
      const dir=rand()<.5?-1:1;
      const len=10+Math.floor(rand()*9);
      for(let i=0;i<len;i++){
        const x=bx+dir*i;
        const y=cy+Math.floor(i/6);
        carve(world,x,y-2,1,3);
        if(world.get(x,y+1)!==B.bedrock)world.raw(x,y+1,'planks');
      }
    }

    const chestX=rand()<.5?left+5:right-5;
    const loot=[
      stack('iron_ingot',2+Math.floor(rand()*4)),
      stack('coal',3+Math.floor(rand()*6)),
      stack('bread',1+Math.floor(rand()*3))
    ];
    if(rand()<.65)loot.push(stack('gold_ingot',1+Math.floor(rand()*3)));
    if(rand()<.35)loot.push(stack('redstone',2+Math.floor(rand()*5)));
    if(rand()<.16)loot.push(stack('diamond',1));
    addChest(world,chestX,cy-1,loot);
  }

  function addVeins(world,id,count,minY,maxY,maxLen,rand){
    for(let n=0;n<count;n++){
      let x=5+Math.floor(rand()*(world.w-10));
      let y=minY+Math.floor(rand()*Math.max(1,maxY-minY+1));
      const len=2+Math.floor(rand()*Math.max(1,maxLen-1));
      for(let i=0;i<len;i++){
        if(world.get(x,y)===B.stone)world.raw(x,y,id);
        x=clamp(x+(Math.floor(rand()*3)-1),2,world.w-3);
        y=clamp(y+(Math.floor(rand()*3)-1),minY,maxY);
      }
    }
  }

  World.prototype.generateOverworld=function(...args){
    originalGenerateOverworld.apply(this,args);
    const rand=rng((this.seed^0x4f1bbcdc)>>>0);

    // Minecraft-style underground progression: common ores higher up,
    // increasingly valuable ores deeper underground.
    addVeins(this,'coal_ore',150,68,120,7,rand);
    addVeins(this,'iron_ore',140,78,145,6,rand);
    addVeins(this,'lapis_ore',48,102,154,5,rand);
    addVeins(this,'gold_ore',62,118,172,5,rand);
    addVeins(this,'redstone_ore',72,132,181,5,rand);
    addVeins(this,'diamond_ore',38,148,184,4,rand);

    // Three abandoned mineshafts make cave exploration worth doing without
    // changing the normal crafting/tool progression.
    const zones=[[180,275],[325,455],[485,570]];
    for(const [a,b] of zones){
      const cx=a+Math.floor(rand()*(b-a));
      const surface=this.height[cx]||52;
      const cy=clamp(surface+42+Math.floor(rand()*42),94,154);
      addMineshaft(this,cx,cy,rand);
    }
  };
}
