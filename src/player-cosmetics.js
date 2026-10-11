import {Renderer} from './render.js';

const DEFAULTS={
 hair:{color:'#4b3428',shape:'crop'},
 skin:{color:'#c68a62'},
 shirt:{color:'#55715a',accent:'#3f5948'},
 pants:{color:'#4c6577',accent:'#344957'}
};

function getLook(){
 const cosmetics=window.FlatCraftCosmetics;
 if(!cosmetics)return DEFAULTS;
 const equipped=cosmetics.equipped||{};
 const catalog=cosmetics.catalog||{};
 const find=(group,id)=>(catalog[group]||[]).find(x=>x.id===id);
 return {
  hair:find('hair',equipped.hair)||DEFAULTS.hair,
  skin:find('skin',equipped.skin)||DEFAULTS.skin,
  shirt:find('shirt',equipped.shirt)||DEFAULTS.shirt,
  pants:find('pants',equipped.pants)||DEFAULTS.pants
 };
}

function shade(hex,amount){
 const m=String(hex||'').match(/^#([0-9a-f]{6})$/i);if(!m)return hex;
 const n=parseInt(m[1],16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 const f=v=>Math.max(0,Math.min(255,Math.round(v+(amount<0?v:255-v)*Math.abs(amount))));
 return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

function drawHair(c,hair){
 const color=hair.color||DEFAULTS.hair.color,shape=hair.shape||'crop';
 c.fillStyle=color;
 if(shape==='buzz'||shape==='fade'){
  c.fillRect(-4,-1,8,2);if(shape==='fade')c.fillRect(-5,0,2,2);return;
 }
 if(shape==='long'){
  c.fillRect(-4,-2,8,3);c.fillRect(-5,0,2,7);c.fillRect(3,0,2,7);return;
 }
 if(shape==='braid'){
  c.fillRect(-4,-2,8,3);c.fillRect(-5,0,2,4);c.fillRect(3,0,2,4);c.fillRect(-5,4,1.5,5);c.fillRect(3.5,4,1.5,5);return;
 }
 if(shape==='sweep'||shape==='wave'){
  c.fillRect(-4,-2,8,3);c.fillRect(-5,0,3,3);c.fillRect(2,-1,3,5);if(shape==='wave')c.fillRect(3,3,2,2);return;
 }
 if(shape==='curl'){
  c.fillRect(-4,-2,8,3);for(const [x,y] of [[-5,0],[-3,-3],[0,-3],[3,-2],[4,0],[-5,2]])c.fillRect(x,y,3,3);return;
 }
 if(shape==='shag'){
  c.fillRect(-4,-2,8,3);c.fillRect(-5,0,10,2);c.fillRect(-5,2,2,3);c.fillRect(1,2,2,2);c.fillRect(3,2,2,3);return;
 }
 if(shape==='wind'||shape==='trail'){
  c.fillRect(-4,-2,8,3);c.fillRect(-5,0,3,3);c.fillRect(2,-1,6,2);if(shape==='trail')c.fillRect(4,1,2,6);return;
 }
 c.fillRect(-4,-2,8,3);c.fillRect(-5,0,2,3);
}

const proto=Renderer.prototype;
if(!proto.__cosmeticsDrawPlayerInstalled){
 proto.__cosmeticsDrawPlayerInstalled=true;
 proto.drawPlayer=function(g){
  const c=this.ctx,p=g.player,s=this.tile,pt=this.screenPoint(p.x,p.y),walk=p.grounded?Math.sin(p.walk*3.7)*.28:Math.sin(g.elapsed*2)*.07,look=getLook();
  const skin=look.skin.color||DEFAULTS.skin.color,shirt=look.shirt.color||DEFAULTS.shirt.color,shirt2=look.shirt.accent||shade(shirt,-.18),pants=look.pants.color||DEFAULTS.pants.color,pants2=look.pants.accent||shade(pants,-.18);
  c.save();c.translate(pt.x,pt.y);if(p.invuln>0&&Math.floor(g.elapsed*14)%2)c.globalAlpha=.6;const u=s/16;c.scale(p.facing*u,u);c.imageSmoothingEnabled=false;
  c.fillStyle='rgba(6,14,21,.25)';c.beginPath();c.ellipse(0,28,6,1.5,0,0,Math.PI*2);c.fill();
  const chestArmor=g.armor[1]?.id,coat=chestArmor?chestArmor.startsWith('diamond')?'#74bec0':chestArmor.startsWith('iron')?'#b4c4c3':chestArmor.startsWith('gold')?'#d6b267':'#645863':shirt;
  const leg=(x,a,back)=>{c.save();c.translate(x,17);c.rotate(a);c.fillStyle=back?shade(pants,-.18):pants;c.fillRect(-2,0,4,10);c.fillStyle=g.armor[3]?'#98aaa9':pants2;c.fillRect(-2,8,5,3);c.restore();};leg(-2.5,walk,true);leg(2,-walk,false);
  c.fillStyle=shirt2;c.fillRect(-6,9,3,9);c.fillStyle=skin;c.fillRect(-6,14,2,4);c.fillStyle=coat;c.fillRect(-4,8,8,11);c.fillStyle=chestArmor?'#adc6b2':shirt2;c.fillRect(-3,8,6,2);c.fillStyle=chestArmor?'#507a7e':pants2;c.fillRect(-4,16,8,3);c.fillStyle=chestArmor?'#d0b884':shade(pants2,.14);c.fillRect(-4,18,8,1);c.fillStyle=chestArmor?'#7d6951':shirt2;c.fillRect(0,9,2,10);
  const swing=this.reducedMotion?0:g.mine?Math.sin(g.elapsed*17)*.7:g.attackTimer>.18?-1.2:walk*.5;
  c.save();c.translate(3,10);c.rotate(swing);c.fillStyle=coat;c.fillRect(-1,0,4,6);c.fillStyle=skin;c.fillRect(-1,5,4,4);const held=g.selectedStack();if(held){c.save();c.translate(3,7);c.rotate(-.5);c.drawImage(this.art.item(held.id),-3,-8,12,12);c.restore();}c.restore();
  c.fillStyle=shade(skin,-.04);c.fillRect(-4,0,8,8);c.fillStyle=shade(skin,.10);c.fillRect(0,2,4,5);drawHair(c,look.hair);c.fillStyle='#243033';c.fillRect(2,3,1.5,1.5);c.fillStyle=shade(skin,-.12);c.fillRect(2,6,2,1);
  if(g.armor[0]){const id=g.armor[0].id;c.fillStyle=id.startsWith('diamond')?'#84cdcc':id.startsWith('gold')?'#e2c274':'#becdcb';c.fillRect(-5,-2,10,4);c.fillRect(-5,2,2,3);}
  if(p.blocking){c.fillStyle='#977757';c.fillRect(4,9,5,10);c.fillStyle='#bcc8bf';c.fillRect(5,9,1,10);}
  c.restore();
 };
}
