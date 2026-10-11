import {Game} from './game.js';

// Passive animals should hop simple one-block rises, but should not repeatedly
// jump into walls they cannot clear. Keep this behavior scoped to passive mobs
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

Game.prototype.move=function(entity,dt,isPlayer=false){
 if(!isPlayer&&entity?.passive&&!entity.flying&&entity.grounded){
  const world=this.world;
  const dir=Math.sign(entity.dir||entity.vx||entity.facing||1);
  const moving=dir!==0&&Math.abs(entity.vx)>.05;

  if(entity._wallTurn>0)entity._wallTurn=Math.max(0,entity._wallTurn-dt);

  if(moving){
   // Look just beyond the animal's leading edge at roughly ankle/foot height.
   const aheadX=entity.x+dir*(entity.w/2+.18);
   const footRow=Math.floor(entity.y+entity.h-.14);
   const obstacle=world.solid(aheadX,footRow);

   if(obstacle){
    // Standing on top of this obstacle raises the animal by exactly one block.
    const targetBottom=footRow-.01;
    const targetTop=targetBottom-entity.h;
    const targetCenterX=entity.x+dir*Math.max(.3,entity.w*.45);
    const landingSpaceClear=bodyClear(world,targetCenterX,targetTop,targetBottom,entity.w);

    // Also check the upward part of the jump at the animal's current position.
    // This catches a low roof/overhang even when the ledge itself is only 1 high.
    const upwardSpaceClear=bodyClear(world,entity.x,entity.y-1,entity.y+entity.h-1,entity.w);
    const climbable=landingSpaceClear&&upwardSpaceClear;

    if(climbable){
     // Preserve the normal walking direction and give a controlled hop. The
     // base mob code may already have started a jump; Math.min avoids stacking
     // extra impulses while guaranteeing enough lift for a one-block rise.
     entity.vy=Math.min(entity.vy,-8);
     entity.vx=dir*Math.max(Math.abs(entity.vx),entity.speed*.85);
    }else if(!entity._wallTurn){
     // Two-block walls and low-ceiling ledges are impossible: cancel any jump
     // that the generic mob logic just requested and naturally walk away.
     entity.vy=Math.max(0,entity.vy);
     entity.dir=-dir;
     entity.facing=-dir;
     entity.vx=-dir*Math.max(entity.speed*.75,.65);
     entity.timer=2+Math.random()*2;
     entity._wallTurn=.75;
    }
   }
  }
 }
 return originalMove.call(this,entity,dt,isPlayer);
};
