import {Game} from './game.js';
import {World} from './world.js';
import {B,ITEMS} from './data.js';
import './passable-leaves.js?v=20261011-1';
import {Renderer} from './render.js';
import {UI} from './ui.js';
import './inventory-fixes.js?v=20261011-1';
import {Saves} from './storage.js';
import {AudioEngine} from './audio.js';
import {installPlayerCosmetics} from './player-cosmetics.js?v=20261011-4';
const canvas=document.getElementById('world'),renderer=new Renderer(canvas),audio=new AudioEngine(),saves=new Saves();
installPlayerCosmetics(renderer);
const input={left:false,right:false,up:false,down:false,jump:false,sprint:false,mine:false,use:false},keys=new Set();let ui,game,last=performance.now(),accumulator=0,demo,mouse={x:innerWidth*.6,y:innerHeight*.5},lastSpace=0;
function clearInput(){keys.clear();for(const k of Object.keys(input))if(typeof input[k]==='boolean')input[k]=false;document.querySelectorAll('[data-touch].active').forEach(e=>e.classList.remove('active'));}
function event(type,data){
 if(type==='sound'){audio.sound(data.name);return;}if(type==='clearInput'){clearInput();return;}if(!ui)return;
 if(type==='toast')ui.toast(data.text);if(type==='achievement')ui.achievement(data.title);if(type==='save')ui.save();if(type==='open')ui.inventory(data.type,data);if(type==='station')ui.refreshInventory();if(type==='inventory')ui.refreshInventory();if(type==='died')ui.death(data.cause);if(type==='victory')ui.victory();if(type==='shake')renderer.shake=data.amount;
 if(type==='started'){ui.started();renderer.snap(game);}if(type==='dimension'){renderer.snap(game);ui.toast(data.dim==='nether'?'The Nether · a world beneath the world':data.dim==='end'?'The End · the last frontier':'Home beneath an open sky');}
 if(type==='respawn'){renderer.snap(game);ui.toast('A fresh start. Your adventure continues.');}if(type==='title')clearInput();
}
game=new Game(event);ui=new UI(game,renderer,saves,audio);
function initDemo(){demo=new Game();demo.newWorld({name:'The quiet clearing',seed:'First Horizons',mode:'survival',difficulty:'peaceful'});demo.player.x=103;demo.player.y=demo.world.height[103]-1.78;demo.time=800;demo.elapsed=0;demo.world.hut(97,demo.world.height[97]);demo.player.x=107;demo.player.y=demo.world.height[97]-1.78;demo.inv[0]={id:'iron_pickaxe',n:1,dur:250};demo.entities=demo.entities.filter(e=>e.passive);demo.world.rebuildSky();demo.status='playing';for(let i=0;i<90;i++)demo.update(1/60,{});demo.status='paused';renderer.snap(demo);}
function resize(){renderer.resize(innerWidth,innerHeight,devicePixelRatio);renderer.lightKey='';}
window.addEventListener('resize',resize);resize();
function isTyping(){return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);}
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();if(game.status==='dead')return;if(ui.modal)ui.close();else if(game.status!=='title')ui.pause();clearInput();return;}
 if(isTyping())return;if(e.key==='Tab'&&ui.modal)return;
 if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key))e.preventDefault();
 const key=e.key.toLowerCase();if(e.repeat)return;audio.unlock();
 if(ui.modal){if(['e','tab'].includes(key)&&ui.modal==='inventory')ui.close();return;}
 if(game.status==='title')return;
 if(['e','tab'].includes(key)){ui.inventory();return;}if(key==='m'){ui.map();return;}if(key==='g'){ui.guideTab='begin';ui.guide();return;}if(key==='p'){ui.pause();return;}
 if(/^[1-9]$/.test(key)){game.selected=+key-1;return;}
 if(key==='q'){const s=game.selectedStack();if(s){game.drop({...s,n:1},game.player.x+game.player.facing*.8,game.player.y+.7);game.consumeSelected();}return;}
 if(key===' '&&game.mode==='creative'){const now=performance.now();if(now-lastSpace<300){game.player.flying=!game.player.flying;game.player.vy=0;ui.toast(game.player.flying?'Flight enabled':'Flight disabled');}lastSpace=now;}
 keys.add(key);syncKeys();
});
window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());syncKeys();});
function syncKeys(){input.left=keys.has('a')||keys.has('arrowleft');input.right=keys.has('d')||keys.has('arrowright');input.up=keys.has('w')||keys.has('arrowup');input.jump=keys.has(' ')||input.up;input.down=keys.has('s')||keys.has('arrowdown');input.sprint=keys.has('shift');input.use=keys.has('f');}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons){mouse={x:e.clientX,y:e.clientY};const p=renderer.worldPoint(mouse.x,mouse.y);input.aimX=p.x;input.aimY=p.y;}});
canvas.addEventListener('pointerdown',e=>{if(ui.modal||game.status!=='playing')return;audio.unlock();mouse={x:e.clientX,y:e.clientY};Object.assign(input,{aimX:renderer.worldPoint(mouse.x,mouse.y).x,aimY:renderer.worldPoint(mouse.x,mouse.y).y});if(e.pointerType==='touch'){ui.touch=true;document.body.classList.add('touch');return;}canvas.setPointerCapture(e.pointerId);if(e.button===0)input.mine=true;else if(e.button===2)input.use=true;e.preventDefault();});
canvas.addEventListener('pointerup',e=>{if(e.button===0)input.mine=false;else if(e.button===2)input.use=false;});canvas.addEventListener('pointercancel',clearInput);canvas.addEventListener('lostpointercapture',()=>{input.mine=false;input.use=keys.has('f');});
canvas.addEventListener('wheel',e=>{if(game.status==='playing'&&!ui.modal){e.preventDefault();game.selected=(game.selected+(e.deltaY>0?1:8))%9;}},{passive:false});
const touches=new Map();document.querySelectorAll('[data-touch]').forEach(button=>{
 button.addEventListener('pointerdown',e=>{e.preventDefault();audio.unlock();button.setPointerCapture(e.pointerId);touches.set(e.pointerId,button.dataset.touch);input[button.dataset.touch]=true;button.classList.add('active');if(input.aimX===undefined){input.aimX=game.player.x+game.player.facing*2;input.aimY=game.player.y+.8;}});
 const end=e=>{const key=touches.get(e.pointerId);touches.delete(e.pointerId);if(key&&!Array.from(touches.values()).includes(key))input[key]=false;button.classList.remove('active');};button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('lostpointercapture',end);
});
window.addEventListener('blur',()=>{clearInput();if(game.status==='playing')ui.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(game.status==='playing')ui.pause();if(game.id)ui.save();}});
window.addEventListener('pagehide',()=>{if(game.id)ui.save();});
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;accumulator+=dt;
 if(game.status==='title'){demo.elapsed+=dt;demo.time=800+Math.sin(demo.elapsed*.005)*16;for(const m of demo.entities)m.age+=dt;renderer.render(demo,dt,true);}
 else{
  if(!ui.touch&&!ui.modal){const a=renderer.worldPoint(mouse.x,mouse.y);input.aimX=a.x;input.aimY=a.y;}
  let steps=0;while(accumulator>=1/60&&steps<6){if(game.status==='playing')game.update(1/60,input);else if(ui.modal==='inventory')game.updateStations(1/60);accumulator-=1/60;steps++;}
  renderer.render(game,dt);ui.update(dt);
 }
 if(game.status==='title')accumulator=0;audio.update(dt);requestAnimationFrame(frame);
}
function fatal(err){console.error(err);const loading=document.getElementById('loading');loading.hidden=false;loading.innerHTML='<strong>FlatCraft could not start</strong><span>Please refresh the page. Your saved worlds are kept.</span>';}
try{initDemo();document.getElementById('loading').style.opacity='0';setTimeout(()=>document.getElementById('loading').hidden=true,650);requestAnimationFrame(frame);}catch(err){fatal(err);}
// A narrow inspection surface for reproducible local validation and save support.
window.FlatCraft={get version(){return '1.0.0';},get game(){return game;},get renderer(){return renderer;},exportWorld:()=>downloadCurrent(),get status(){return game.status;}};
function downloadCurrent(){if(game.id)ui.click({target:{closest:()=>({dataset:{action:'export'}})}});}
