const STYLE_ID='flatcraft-cosmetics-expansion-css';
if(!document.getElementById(STYLE_ID)){const l=document.createElement('link');l.id=STYLE_ID;l.rel='stylesheet';l.href='./cosmetics-expansion.css?v=20261011-1';document.head.append(l);}

const CATALOG={
 head:[
  {id:'hair_short_crop',slot:'hair',kind:'hair',name:'Short Crop',price:0,color:'#4b3428',shape:'crop'},
  {id:'hair_side_sweep',slot:'hair',kind:'hair',name:'Side Sweep',price:0,color:'#6b452f',shape:'sweep'},
  {id:'hair_curly_top',slot:'hair',kind:'hair',name:'Curly Top',price:0,color:'#2f241f',shape:'curl'},
  {id:'hair_long_layers',slot:'hair',kind:'hair',name:'Long Layers',price:0,color:'#7a5638',shape:'long'},
  {id:'hair_buzz_cut',slot:'hair',kind:'hair',name:'Buzz Cut',price:0,color:'#3b3029',shape:'buzz'},
  {id:'hair_soft_bob',slot:'hair',kind:'hair',name:'Soft Bob',price:0,color:'#5c3d31',shape:'bob'},
  {id:'hair_high_ponytail',slot:'hair',kind:'hair',name:'High Ponytail',price:0,color:'#3c2b25',shape:'ponytail'},
  {id:'hair_midnight_fade',slot:'hair',kind:'hair',name:'Midnight Fade',price:300,color:'#191a1d',shape:'fade'},
  {id:'hair_chestnut_wave',slot:'hair',kind:'hair',name:'Chestnut Wave',price:350,color:'#70442c',shape:'wave'},
  {id:'hair_sandy_shag',slot:'hair',kind:'hair',name:'Sandy Shag',price:400,color:'#b28a57',shape:'shag'},
  {id:'hair_ember_curls',slot:'hair',kind:'hair',name:'Ember Curls',price:450,color:'#8c432e',shape:'curl'},
  {id:'hair_silver_part',slot:'hair',kind:'hair',name:'Silver Part',price:500,color:'#a9a7a0',shape:'sweep'},
  {id:'hair_braided_crown',slot:'hair',kind:'hair',name:'Braided Crown',price:550,color:'#4c3126',shape:'braid'},
  {id:'hair_low_ponytail',slot:'hair',kind:'hair',name:'Low Ponytail',price:550,color:'#644431',shape:'lowpony'},
  {id:'hair_twin_braids',slot:'hair',kind:'hair',name:'Twin Braids',price:600,color:'#4a3025',shape:'twinbraid'},
  {id:'hair_windswept',slot:'hair',kind:'hair',name:'Windswept',price:600,color:'#302820',shape:'wind'},
  {id:'hair_copper_layers',slot:'hair',kind:'hair',name:'Copper Layers',price:650,color:'#a85d37',shape:'longwave'},
  {id:'hair_side_braid',slot:'hair',kind:'hair',name:'Side Braid',price:650,color:'#6e4630',shape:'sidebraid'},
  {id:'hair_top_bun',slot:'hair',kind:'hair',name:'Top Bun',price:700,color:'#3f2a21',shape:'bun'},
  {id:'hair_frosted_crop',slot:'hair',kind:'hair',name:'Frosted Crop',price:700,color:'#d2c9b8',shape:'crop'},
  {id:'hair_long_curls',slot:'hair',kind:'hair',name:'Long Curls',price:750,color:'#8a5c3c',shape:'longcurl'},
  {id:'hair_trailblazer',slot:'hair',kind:'hair',name:'Trailblazer',price:800,color:'#23201d',shape:'trail'},
  {id:'gear_none',slot:'headgear',kind:'headgear',name:'No Headgear',price:0,gear:'none',color:'#73817b'},
  {id:'gear_classic_cap',slot:'headgear',kind:'headgear',name:'Classic Cap',price:0,gear:'cap',color:'#55715a'},
  {id:'gear_headband',slot:'headgear',kind:'headgear',name:'Trail Headband',price:0,gear:'headband',color:'#a36f53'},
  {id:'gear_beanie',slot:'headgear',kind:'headgear',name:'Cozy Beanie',price:300,gear:'beanie',color:'#596b73'},
  {id:'gear_bucket_hat',slot:'headgear',kind:'headgear',name:'Bucket Hat',price:350,gear:'bucket',color:'#8a8066'},
  {id:'gear_red_cap',slot:'headgear',kind:'headgear',name:'Red Cap',price:400,gear:'cap',color:'#9b554e'},
  {id:'gear_bandana',slot:'headgear',kind:'headgear',name:'Bandana',price:450,gear:'bandana',color:'#6b536f'},
  {id:'gear_winter_scarf',slot:'headgear',kind:'headgear',name:'Winter Scarf',price:500,gear:'scarf',color:'#7f5960'},
  {id:'gear_cowboy_hat',slot:'headgear',kind:'headgear',name:'Frontier Hat',price:600,gear:'cowboy',color:'#75563d'},
  {id:'gear_explorer_cap',slot:'headgear',kind:'headgear',name:'Explorer Cap',price:650,gear:'explorer',color:'#667057'},
  {id:'gear_flower_crown',slot:'headgear',kind:'headgear',name:'Flower Crown',price:700,gear:'flowers',color:'#c88c8f'},
  {id:'gear_founder_crown',slot:'headgear',kind:'headgear',name:"Founder's Crown",price:800,gear:'crown',color:'#d9b981'}
 ],
 skin:[
  {id:'skin_porcelain',slot:'skin',name:'Porcelain',price:0,color:'#f4d7c4'},
  {id:'skin_fair',slot:'skin',name:'Fair',price:0,color:'#eac3a6'},
  {id:'skin_light',slot:'skin',name:'Light',price:0,color:'#dca985'},
  {id:'skin_medium',slot:'skin',name:'Medium',price:0,color:'#c68a62'},
  {id:'skin_tan',slot:'skin',name:'Tan',price:0,color:'#ac704c'},
  {id:'skin_brown',slot:'skin',name:'Brown',price:0,color:'#875638'},
  {id:'skin_deep_brown',slot:'skin',name:'Deep Brown',price:0,color:'#67412f'},
  {id:'skin_ebony',slot:'skin',name:'Deep',price:0,color:'#472f27'}
 ],
 shirt:[
  {id:'shirt_white_tee',slot:'shirt',name:'White Tee',price:0,color:'#e9e6dc',accent:'#c9c6bd'},
  {id:'shirt_forest_tee',slot:'shirt',name:'Forest Tee',price:0,color:'#55715a',accent:'#3f5948'},
  {id:'shirt_denim_blue',slot:'shirt',name:'Denim Blue',price:0,color:'#58748a',accent:'#405d73'},
  {id:'shirt_brick_red',slot:'shirt',name:'Brick Red',price:0,color:'#985b50',accent:'#77443d'},
  {id:'shirt_charcoal',slot:'shirt',name:'Charcoal',price:0,color:'#4e5659',accent:'#363c3f'},
  {id:'shirt_sunrise',slot:'shirt',name:'Sunrise Crew',price:300,color:'#d49a62',accent:'#bc7d4a'},
  {id:'shirt_moss',slot:'shirt',name:'Moss Overshirt',price:350,color:'#7b8961',accent:'#5f6d49'},
  {id:'shirt_lakeside',slot:'shirt',name:'Lakeside Stripe',price:400,color:'#71969a',accent:'#d6d1b8'},
  {id:'shirt_canyon',slot:'shirt',name:'Canyon Flannel',price:450,color:'#9a604c',accent:'#413f39'},
  {id:'shirt_night',slot:'shirt',name:'Night Runner',price:500,color:'#303d4a',accent:'#89a9ae'},
  {id:'shirt_harvest',slot:'shirt',name:'Harvest Knit',price:550,color:'#b5854f',accent:'#6e553d'},
  {id:'shirt_ridge',slot:'shirt',name:'Ridge Jacket',price:600,color:'#5c6f69',accent:'#2f4542'},
  {id:'shirt_cloudline',slot:'shirt',name:'Cloudline',price:700,color:'#c5c6bd',accent:'#788a91'},
  {id:'shirt_founder',slot:'shirt',name:"Founder's Coat",price:800,color:'#263f3d',accent:'#d2ae6d'}
 ],
 pants:[
  {id:'pants_blue_jeans',slot:'pants',name:'Blue Jeans',price:0,color:'#4c6577',accent:'#344957'},
  {id:'pants_khaki',slot:'pants',name:'Khaki',price:0,color:'#9b8b6d',accent:'#75694f'},
  {id:'pants_black',slot:'pants',name:'Black',price:0,color:'#303438',accent:'#1f2225'},
  {id:'pants_olive',slot:'pants',name:'Olive',price:0,color:'#667057',accent:'#4a5340'},
  {id:'pants_stone',slot:'pants',name:'Stone',price:0,color:'#7d817e',accent:'#626765'},
  {id:'pants_trail',slot:'pants',name:'Trail Pants',price:300,color:'#6b6252',accent:'#423e36'},
  {id:'pants_river',slot:'pants',name:'River Denim',price:350,color:'#3d6079',accent:'#29475c'},
  {id:'pants_cargo',slot:'pants',name:'Field Cargo',price:400,color:'#6e7152',accent:'#4b4f38'},
  {id:'pants_slate',slot:'pants',name:'Slate Chinos',price:450,color:'#59656b',accent:'#3e494f'},
  {id:'pants_dune',slot:'pants',name:'Dune Utility',price:500,color:'#a17f58',accent:'#745c41'},
  {id:'pants_nightfall',slot:'pants',name:'Nightfall',price:550,color:'#2f3542',accent:'#20252f'},
  {id:'pants_climber',slot:'pants',name:'Climber',price:600,color:'#765c4e',accent:'#4e3b32'},
  {id:'pants_frost',slot:'pants',name:'Frost Canvas',price:700,color:'#a9ada8',accent:'#717875'},
  {id:'pants_pathfinder',slot:'pants',name:'Pathfinder',price:800,color:'#394f4c',accent:'#d0a866'}
 ]
};
const ECONOMY_VERSION=2;
const DEFAULT_EQUIPPED={hair:'hair_short_crop',headgear:'gear_none',skin:'skin_medium',shirt:'shirt_forest_tee',pants:'pants_blue_jeans'};
const FREE_IDS=Object.values(CATALOG).flat().filter(x=>x.price===0).map(x=>x.id);
const KEY='flatcraft-cosmetics-v1';
const normalRewards=r=>({elapsed:Math.max(0,Math.min(1799.999,Number(r?.elapsed)||0)),claimable:Math.max(0,Math.floor(Number(r?.claimable)||0))});
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}'),legacy=s.equipped||{};return {economyVersion:ECONOMY_VERSION,tokens:s.economyVersion===ECONOMY_VERSION&&Number.isFinite(s.tokens)?Math.max(0,Math.floor(s.tokens)):0,owned:[...new Set([...FREE_IDS,...(s.owned||[])])],equipped:{...DEFAULT_EQUIPPED,...legacy,hair:legacy.hair||DEFAULT_EQUIPPED.hair,headgear:legacy.headgear||DEFAULT_EQUIPPED.headgear},rewards:normalRewards(s.rewards)};}catch{return {economyVersion:ECONOMY_VERSION,tokens:0,owned:[...FREE_IDS],equipped:{...DEFAULT_EQUIPPED},rewards:normalRewards()};}}
let state=load(),category='head',preview={...state.equipped},selectedId=state.equipped.hair;
const save=()=>{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('flatcraft-tokens-changed',{detail:{tokens:state.tokens,rewards:{...state.rewards}}}));};
save();
const all=()=>Object.values(CATALOG).flat();
const item=id=>all().find(x=>x.id===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const tokenIcon='<span class="flat-token" aria-hidden="true">F</span>';
function ensureOverlay(){if(document.getElementById('cosmetic-shop'))return;const wrap=document.createElement('div');wrap.id='cosmetic-shop';wrap.hidden=true;wrap.innerHTML='<div class="shop-shell" role="dialog" aria-modal="true" aria-labelledby="shop-title"></div>';document.body.append(wrap);}
function drawAvatar(){const s=item(preview.skin),h=item(preview.hair),g=item(preview.headgear),t=item(preview.shirt),p=item(preview.pants);return `<div class="avatar-stage"><div class="avatar-shadow"></div><div class="avatar-pixel"><div class="px-hair hair-${h?.shape||'crop'}" style="--hair:${h?.color||'#4b3428'}"></div>${g&&g.gear!=='none'?`<div class="px-headgear gear-${g.gear}" style="--gear:${g.color||'#73817b'}"></div>`:''}<div class="px-head" style="--skin:${s?.color||'#c68a62'}"><i></i><b></b></div><div class="px-body" style="--shirt:${t?.color||'#55715a'};--shirt2:${t?.accent||'#3f5948'}"></div><div class="px-arm left" style="--skin:${s?.color||'#c68a62'};--shirt:${t?.color||'#55715a'}"></div><div class="px-arm right" style="--skin:${s?.color||'#c68a62'};--shirt:${t?.color||'#55715a'}"></div><div class="px-leg left" style="--pants:${p?.color||'#4c6577'};--pants2:${p?.accent||'#344957'}"></div><div class="px-leg right" style="--pants:${p?.color||'#4c6577'};--pants2:${p?.accent||'#344957'}"></div></div><div class="preview-label">YOUR LOOK <strong>${esc(h?.name||'')} · ${esc(g?.name&&g.gear!=='none'?g.name:t?.name||'')}</strong></div></div>`;}
function card(x){const owned=state.owned.includes(x.id),equipped=state.equipped[x.slot]===x.id,selected=selectedId===x.id;let action='';if(equipped)action='<span class="owned-label equipped">Equipped</span>';else if(owned)action='<span class="owned-label">Owned</span>';else if(x.price===0)action='<span class="owned-label">Free</span>';else action=`<span class="price">${tokenIcon}${x.price}</span>`;const swatch=x.color?`style="--swatch:${x.color};--accent:${x.accent||x.color}"`:'';const art=x.slot==='headgear'?'headgear':x.slot;return `<button class="cosmetic-card${selected?' selected':''}${equipped?' equipped':''}" data-cosmetic-id="${x.id}" ${swatch}><span class="cosmetic-art cosmetic-${art} gear-${x.gear||''} hair-${x.shape||''}"><i></i><b></b></span><span class="cosmetic-meta"><strong>${esc(x.name)}</strong>${action}</span></button>`;}
function render(){ensureOverlay();const root=document.querySelector('#cosmetic-shop .shop-shell');const labels={head:'Head',skin:'Skin',shirt:'Shirts',pants:'Pants'};root.innerHTML=`<div class="shop-top"><div><div class="shop-kicker">FLATCRAFT WARDROBE</div><h2 id="shop-title">Make it yours.</h2><p>Cosmetics only. No gameplay advantages.</p></div><div class="shop-wallet"><button class="shop-wallet-getmore" data-flatcraft-get-more>Get More</button><small>FLAT TOKENS</small><strong>${tokenIcon}<span data-flat-token-count>${state.tokens.toLocaleString()}</span></strong></div><button class="shop-close" data-shop-action="close" aria-label="Close cosmetics shop">×</button></div><div class="shop-content"><aside>${drawAvatar()}<div id="shop-actionbar" class="shop-actionbar preview-actionbar"></div><div class="shop-note"><span>ACCOUNT READY</span><p>Your cosmetics, token balance, and playtime rewards sync with your account when signed in.</p></div></aside><main><nav class="shop-tabs">${Object.keys(CATALOG).map(k=>`<button data-shop-category="${k}" class="${category===k?'active':''}">${labels[k]}</button>`).join('')}</nav>${category==='head'?'<div class="head-shop-hint">Hair and headgear are separate slots, so you can combine them.</div>':''}<div class="shop-grid">${CATALOG[category].map(card).join('')}</div></main></div>`;updateAction();}
function currentSelection(){return item(selectedId);}
function updateAction(){const bar=document.getElementById('shop-actionbar');if(!bar)return;const x=currentSelection();if(!x){bar.innerHTML='';return;}const owned=state.owned.includes(x.id),equipped=state.equipped[x.slot]===x.id;if(equipped){bar.innerHTML=`<div><small>CURRENTLY EQUIPPED</small><strong>${esc(x.name)}</strong></div><button disabled>Equipped</button>`;return;}if(owned||x.price===0){bar.innerHTML=`<div><small>${owned?'OWNED':'FREE ITEM'}</small><strong>${esc(x.name)}</strong></div><button data-shop-action="equip">Equip</button>`;return;}bar.innerHTML=`<div><small>UNLOCK COSMETIC</small><strong>${esc(x.name)} <span>${tokenIcon}${x.price}</span></strong></div><button data-shop-action="buy" ${state.tokens<x.price?'disabled':''}>${state.tokens<x.price?'Not enough tokens':'Unlock'}</button>`;}
function open(){ensureOverlay();preview={...state.equipped};selectedId=category==='head'?state.equipped.hair:state.equipped[category];document.getElementById('cosmetic-shop').hidden=false;document.body.classList.add('shop-open');render();}
function close(){const el=document.getElementById('cosmetic-shop');if(el)el.hidden=true;document.body.classList.remove('shop-open');}
function select(id){const x=item(id);if(!x)return;const cat=Object.keys(CATALOG).find(k=>CATALOG[k].some(v=>v.id===id));if(!cat)return;category=cat;selectedId=id;preview[x.slot]=id;render();}
function buy(){const x=currentSelection();if(!x||state.owned.includes(x.id)||x.price>state.tokens)return;state.tokens-=x.price;state.owned.push(x.id);state.equipped[x.slot]=x.id;preview[x.slot]=x.id;save();render();}
function equip(){const x=currentSelection();if(!x)return;if(x.price===0&&!state.owned.includes(x.id))state.owned.push(x.id);if(!state.owned.includes(x.id))return;state.equipped[x.slot]=x.id;preview[x.slot]=x.id;save();render();}
document.addEventListener('click',e=>{if(e.target.closest('[data-flatcraft-shop]')){open();return;}const cat=e.target.closest('[data-shop-category]');if(cat){category=cat.dataset.shopCategory;selectedId=category==='head'?preview.hair:preview[category];render();return;}const c=e.target.closest('[data-cosmetic-id]');if(c){select(c.dataset.cosmeticId);return;}const a=e.target.closest('[data-shop-action]')?.dataset.shopAction;if(a==='close')close();else if(a==='buy')buy();else if(a==='equip')equip();if(e.target.id==='cosmetic-shop')close();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('cosmetic-shop')?.hidden)close();});
ensureOverlay();
export const Cosmetics={catalog:CATALOG,get state(){return JSON.parse(JSON.stringify(state));},get equipped(){return {...state.equipped};},get tokens(){return state.tokens;},get rewards(){return {...state.rewards};},open,close,addTokens(amount){if(Number.isFinite(amount)){state.tokens=Math.max(0,Math.floor(state.tokens+amount));save();if(!document.getElementById('cosmetic-shop')?.hidden)render();}},setRewards(rewards){state.rewards=normalRewards(rewards);save();},resetPreview(){localStorage.removeItem(KEY);state=load();preview={...state.equipped};selectedId=state.equipped.hair;save();render();}};
window.FlatCraftCosmetics=Cosmetics;
