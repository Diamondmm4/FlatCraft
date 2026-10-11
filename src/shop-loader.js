await import('./shop.js?v=20261011-5');
const {installPlayerCosmetics}=await import('./player-cosmetics.js?v=20261011-3');

const attach=()=>{
 const renderer=window.FlatCraft?.renderer;
 if(!renderer||!window.FlatCraftCosmetics)return false;
 return installPlayerCosmetics(renderer);
};

if(!attach()){
 let tries=0;
 const timer=setInterval(()=>{
  tries++;
  if(attach()||tries>200)clearInterval(timer);
 },25);
}
