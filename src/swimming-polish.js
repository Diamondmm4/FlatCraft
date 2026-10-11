import {Game} from './game.js';
import {B} from './data.js';

// Smooth, continuous swimming controls without replacing FlatCraft's existing
// breath, drowning, collision, lava, or ladder logic.
const originalUpdate=Game.prototype.update;

Game.prototype.update=function(dt,input={}){
 const wasPlaying=this.status==='playing';
 const result=originalUpdate.call(this,dt,input);
 if(!wasPlaying||this.status!=='playing'||!this.world||!this.player)return result;

 const p=this.player,w=this.world;
 const bodyWater=w.get(p.x,p.y+Math.min(1,p.h*.58))===B.water;
 const feetWater=w.get(p.x,p.y+p.h-.12)===B.water;
 const headWater=w.get(p.x,p.y+.18)===B.water;
 const swimming=bodyWater||feetWater;
 if(!swimming||p.flying)return result;

 // Continuous vertical control. The base game already handles the initial
 // water physics; this gently steers velocity toward a swim target each tick.
 let targetVy=.28;
 if(input.jump||input.up)targetVy=-3.7;
 else if(input.down)targetVy=2.35;
 const blend=1-Math.exp(-11*Math.min(dt,.05));
 p.vy+=(targetVy-p.vy)*blend;
 p.vy=Math.max(-4.6,Math.min(2.8,p.vy));

 // Water should feel controlled rather than slippery, while still preserving
 // momentum and the base horizontal movement speed.
 if(!input.left&&!input.right)p.vx*=Math.pow(.84,Math.min(dt,.05)*60);

 // When the player's head reaches air while the lower body remains in water,
 // holding jump gives a little extra lift to clear the shoreline naturally.
 if((input.jump||input.up)&&!headWater&&feetWater)p.vy=Math.min(p.vy,-5.15);

 p.fallY=p.y;
 return result;
};
