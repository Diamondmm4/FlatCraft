import {Game} from './game.js';

// Passive animals should hop simple one-block rises, but immediately turn away
// from anything they cannot clear. Keep this scoped to passive, non-flying mobs
// so hostile movement/combat physics remain unchanged.
const originalMove=Game.prototype.move;

function bodyClear(world,centerX,top,bottom,width){
 const left=Math.floor(centerX-width/2+.04);
 const right=Math.floor(centerX+width/2-.04);
 const firstY=Math.floor(top+.03);
 const lastY=Math.floor(bottom-.03);
 for(let y=firstY;y<=lastY;y++)for(let x=left;x<=right;x++){
  if(world.solid(x,y))return false;
 }
 return true;
}

function reverseAnimal(entity,dir){
 entity.vy=Math.max(0,entity.vy);
 entity.dir=-dir;
 entity.facing=-dir;
 entity.vx=-dir*Math.max(entity.speed*.9,.75);
 // Keep the new direction long enough that the animal cleanly leaves the wall
 // instead of immediately choosing the blocked direction again.
 entity.timer=2.5+Math.random()*2;
 entity._wallTurn=.45;
}

Game.prototype.move=function(entity,dt,isPlayer=false){
 if(!isPlayer&&entity?.passive&&!entity.flying&&entity.grounded){
  const world=this.world;
  const dir=Math.sign(entity.dir||entity.vx||entity.facing||1);
  const moving=dir!==0&&Math.abs(entity.vx)>.03;

  if(entity._wallTurn>0)entity._wallTurn=Math.max(0,entity._wallTurn-dt);

  if(moving){
   // Probe slightly before the leading edge reaches the obstacle so animals
   // decide what to do before visibly stalling against a wall.
   const nearX=entity.x+dir*(entity.w/2+.22);
   const farX=entity.x+dir*(entity.w/2+.48);
   const footRow=Math.floor(entity.y+entity.h-.12);
   const obstacle=world.solid(nearX,footRow)||world.solid(farX,footRow);

   if(obstacle){
    // A valid one-block step means the animal's whole body can fit exactly one
    // block higher, both during takeoff and a little forward over the ledge.
    // Any 2+ block wall automatically fails this test because the second block
    // occupies the elevated body space. Low ceilings/overhangs fail it too.
    const raisedTop=entity.y-1;
    const raisedBottom=entity.y+entity.h-1;
    const takeoffClear=bodyClear(world,entity.x,raisedTop,raisedBottom,entity.w);
    const landingX=entity.x+dir*Math.max(.42,entity.w*.55);
    const landingClear=bodyClear(world,landingX,raisedTop,raisedBottom,entity.w);
    const climbable=takeoffClear&&landingClear;

    if(climbable){
     entity.vy=Math.min(entity.vy,-8);
     entity.vx=dir*Math.max(Math.abs(entity.vx),entity.speed*.9);
    }else if(!entity._wallTurn){
     reverseAnimal(entity,dir);
    }
   }
  }
 }
 return originalMove.call(this,entity,dt,isPlayer);
};
