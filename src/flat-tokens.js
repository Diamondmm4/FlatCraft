const cosmetics=window.FlatCraftCosmetics;
if(!cosmetics)throw new Error('Flat Tokens requires the cosmetics system.');

const STYLE_ID='flatcraft-token-center-css';
if(!document.getElementById(STYLE_ID)){const l=document.createElement('link');l.id=STYLE_ID;l.rel='stylesheet';l.href='./token-center.css?v=20261011-1';document.head.append(l);}

const PERIOD=30*60;
const REWARD=100;
let rewards={...cosmetics.rewards};
let last=performance.now();
let lastSaved=0;
const tokenIcon='<span class="flat-token" aria-hidden="true">F</span>';
const fmt=s=>{s=Math.max(0,Math.ceil(s));const m=Math.floor(s/60),sec=s%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;};

function saveRewards(force=false){
 const now=performance.now();
 if(force||now-lastSaved>5000){lastSaved=now;cosmetics.setRewards(rewards);}
}

function ensureHeader(){
 const links=document.querySelector('.title-header .header-links');if(!links||links.querySelector('[data-flat-token-header]'))return;
 const get=document.createElement('button');get.type='button';get.className='title-token-getmore';get.dataset.flatcraftGetMore='';get.textContent='Get More';get.dataset.flatTokenHeader='1';
 const balance=document.createElement('span');balance.className='title-token-balance';balance.dataset.flatTokenHeader='1';balance.innerHTML=`${tokenIcon}<b data-flat-token-header-count>0</b>`;
 links.prepend(balance);links.prepend(get);
}

function ensureScreen(){
 if(document.getElementById('token-center'))return;
 const wrap=document.createElement('div');wrap.id='token-center';wrap.hidden=true;wrap.innerHTML=`<section class="token-center-shell" role="dialog" aria-modal="true" aria-labelledby="token-center-title"><button class="token-center-close" data-token-action="close" aria-label="Close Flat Tokens">×</button><div class="token-center-kicker">FLAT TOKENS</div><h2 id="token-center-title">Get More</h2><p class="token-center-sub">Play FlatCraft to earn free tokens, or check back later for purchase options.</p><div class="token-center-wallet">${tokenIcon}<span>You have <strong data-token-center-balance>0</strong> Flat Tokens</span></div><div class="token-reward-card"><div class="token-reward-top"><div><h3>Playtime Reward</h3><p>Every 30 minutes the game is open, 100 Flat Tokens become ready to claim.</p></div><div class="token-countdown" data-token-countdown>30:00</div></div><div class="token-progress"><i data-token-progress></i></div><div class="token-claim-row"><div class="token-ready">Ready to claim<strong data-token-ready>${tokenIcon}0</strong></div><button class="token-claim" data-token-action="claim" disabled>Keep playing</button></div></div><div class="token-buy-card"><h3>Buy Flat Tokens</h3><p>Purchase options will be added here later.</p><div class="token-coming-soon">COMING SOON</div></div></section>`;document.body.append(wrap);
}

function updateUI(){
 ensureHeader();ensureScreen();
 const tokens=cosmetics.tokens;
 document.querySelectorAll('[data-flat-token-header-count]').forEach(e=>e.textContent=tokens.toLocaleString());
 document.querySelectorAll('[data-token-center-balance]').forEach(e=>e.textContent=tokens.toLocaleString());
 const left=PERIOD-rewards.elapsed;
 document.querySelectorAll('[data-token-countdown]').forEach(e=>e.textContent=rewards.claimable>0?`${fmt(left)} to next`:fmt(left));
 document.querySelectorAll('[data-token-progress]').forEach(e=>e.style.width=`${Math.max(0,Math.min(100,rewards.elapsed/PERIOD*100))}%`);
 document.querySelectorAll('[data-token-ready]').forEach(e=>e.innerHTML=`${tokenIcon}${rewards.claimable.toLocaleString()}`);
 document.querySelectorAll('[data-token-action="claim"]').forEach(b=>{b.disabled=rewards.claimable<=0;b.textContent=rewards.claimable>0?`Claim ${rewards.claimable.toLocaleString()}`:'Keep playing';});
}

function tick(){
 const now=performance.now(),dt=Math.max(0,(now-last)/1000);last=now;rewards.elapsed+=dt;
 while(rewards.elapsed>=PERIOD){rewards.elapsed-=PERIOD;rewards.claimable+=REWARD;}
 saveRewards(false);updateUI();
}

function open(){
 window.FlatCraftCosmetics?.close?.();ensureScreen();document.getElementById('token-center').hidden=false;document.body.classList.add('shop-open');updateUI();
}
function close(){const el=document.getElementById('token-center');if(el)el.hidden=true;if(document.getElementById('cosmetic-shop')?.hidden!==false)document.body.classList.remove('shop-open');}
function claim(){if(rewards.claimable<=0)return;const amount=rewards.claimable;rewards.claimable=0;cosmetics.addTokens(amount);saveRewards(true);updateUI();}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-flatcraft-get-more]')){e.preventDefault();open();return;}
 const a=e.target.closest('[data-token-action]')?.dataset.tokenAction;if(a==='close')close();else if(a==='claim')claim();
 if(e.target.id==='token-center')close();
});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('token-center')?.hidden)close();});
window.addEventListener('flatcraft-tokens-changed',()=>{rewards={...cosmetics.rewards};updateUI();});
window.addEventListener('pagehide',()=>saveRewards(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();}saveRewards(true);});

ensureHeader();ensureScreen();updateUI();
setInterval(tick,250);
window.FlatCraftTokens={open,close,get rewards(){return {...rewards};}};
