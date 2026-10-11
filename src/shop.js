const CATALOG={
 hair:[
  {id:'hair_short_crop',name:'Short Crop',price:0,color:'#4b3428',shape:'crop'},
  {id:'hair_side_sweep',name:'Side Sweep',price:0,color:'#6b452f',shape:'sweep'},
  {id:'hair_curly_top',name:'Curly Top',price:0,color:'#2f241f',shape:'curl'},
  {id:'hair_long_layers',name:'Long Layers',price:0,color:'#7a5638',shape:'long'},
  {id:'hair_buzz_cut',name:'Buzz Cut',price:0,color:'#3b3029',shape:'buzz'},
  {id:'hair_midnight_fade',name:'Midnight Fade',price:300,color:'#191a1d',shape:'fade'},
  {id:'hair_chestnut_wave',name:'Chestnut Wave',price:350,color:'#70442c',shape:'wave'},
  {id:'hair_sandy_shag',name:'Sandy Shag',price:400,color:'#b28a57',shape:'shag'},
  {id:'hair_ember_curls',name:'Ember Curls',price:450,color:'#8c432e',shape:'curl'},
  {id:'hair_silver_part',name:'Silver Part',price:500,color:'#a9a7a0',shape:'sweep'},
  {id:'hair_braided_crown',name:'Braided Crown',price:550,color:'#4c3126',shape:'braid'},
  {id:'hair_windswept',name:'Windswept',price:600,color:'#302820',shape:'wind'},
  {id:'hair_copper_layers',name:'Copper Layers',price:650,color:'#a85d37',shape:'long'},
  {id:'hair_frosted_crop',name:'Frosted Crop',price:700,color:'#d2c9b8',shape:'crop'},
  {id:'hair_trailblazer',name:'Trailblazer',price:800,color:'#23201d',shape:'trail'}
 ],
 skin:[
  {id:'skin_porcelain',name:'Porcelain',price:0,color:'#f4d7c4'},
  {id:'skin_fair',name:'Fair',price:0,color:'#eac3a6'},
  {id:'skin_light',name:'Light',price:0,color:'#dca985'},
  {id:'skin_medium',name:'Medium',price:0,color:'#c68a62'},
  {id:'skin_tan',name:'Tan',price:0,color:'#ac704c'},
  {id:'skin_brown',name:'Brown',price:0,color:'#875638'},
  {id:'skin_deep_brown',name:'Deep Brown',price:0,color:'#67412f'},
  {id:'skin_ebony',name:'Deep',price:0,color:'#472f27'}
 ],
 shirt:[
  {id:'shirt_white_tee',name:'White Tee',price:0,color:'#e9e6dc',accent:'#c9c6bd'},
  {id:'shirt_forest_tee',name:'Forest Tee',price:0,color:'#55715a',accent:'#3f5948'},
  {id:'shirt_denim_blue',name:'Denim Blue',price:0,color:'#58748a',accent:'#405d73'},
  {id:'shirt_brick_red',name:'Brick Red',price:0,color:'#985b50',accent:'#77443d'},
  {id:'shirt_charcoal',name:'Charcoal',price:0,color:'#4e5659',accent:'#363c3f'},
  {id:'shirt_sunrise',name:'Sunrise Crew',price:300,color:'#d49a62',accent:'#bc7d4a'},
  {id:'shirt_moss',name:'Moss Overshirt',price:350,color:'#7b8961',accent:'#5f6d49'},
  {id:'shirt_lakeside',name:'Lakeside Stripe',price:400,color:'#71969a',accent:'#d6d1b8'},
  {id:'shirt_canyon',name:'Canyon Flannel',price:450,color:'#9a604c',accent:'#413f39'},
  {id:'shirt_night',name:'Night Runner',price:500,color:'#303d4a',accent:'#89a9ae'},
  {id:'shirt_harvest',name:'Harvest Knit',price:550,color:'#b5854f',accent:'#6e553d'},
  {id:'shirt_ridge',name:'Ridge Jacket',price:600,color:'#5c6f69',accent:'#2f4542'},
  {id:'shirt_cloudline',name:'Cloudline',price:700,color:'#c5c6bd',accent:'#788a91'},
  {id:'shirt_founder',name:"Founder's Coat",price:800,color:'#263f3d',accent:'#d2ae6d'}
 ],
 pants:[
  {id:'pants_blue_jeans',name:'Blue Jeans',price:0,color:'#4c6577',accent:'#344957'},
  {id:'pants_khaki',name:'Khaki',price:0,color:'#9b8b6d',accent:'#75694f'},
  {id:'pants_black',name:'Black',price:0,color:'#303438',accent:'#1f2225'},
  {id:'pants_olive',name:'Olive',price:0,color:'#667057',accent:'#4a5340'},
  {id:'pants_stone',name:'Stone',price:0,color:'#7d817e',accent:'#626765'},
  {id:'pants_trail',name:'Trail Pants',price:300,color:'#6b6252',accent:'#423e36'},
  {id:'pants_river',name:'River Denim',price:350,color:'#3d6079',accent:'#29475c'},
  {id:'pants_cargo',name:'Field Cargo',price:400,color:'#6e7152',accent:'#4b4f38'},
  {id:'pants_slate',name:'Slate Chinos',price:450,color:'#59656b',accent:'#3e494f'},
  {id:'pants_dune',name:'Dune Utility',price:500,color:'#a17f58',accent:'#745c41'},
  {id:'pants_nightfall',name:'Nightfall',price:550,color:'#2f3542',accent:'#20252f'},
  {id:'pants_climber',name:'Climber',price:600,color:'#765c4e',accent:'#4e3b32'},
  {id:'pants_frost',name:'Frost Canvas',price:700,color:'#a9ada8',accent:'#717875'},
  {id:'pants_pathfinder',name:'Pathfinder',price:800,color:'#394f4c',accent:'#d0a866'}
 ]
};
const DEFAULT_EQUIPPED={hair:'hair_short_crop',skin:'skin_medium',shirt:'shirt_forest_tee',pants:'pants_blue_jeans'};
const FREE_IDS=Object.values(CATALOG).flat().filter(x=>x.price===0).map(x=>x.id);
const KEY='flatcraft-cosmetics-v1';
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');return {tokens:Number.isFinite(s.tokens)?s.tokens:2500,owned:[...new Set([...FREE_IDS,...(s.owned||[])])],equipped:{...DEFAULT_EQUIPPED,...(s.equipped||{})}};}catch{return {tokens:2500,owned:[...FREE_IDS],equipped:{...DEFAULT_EQUIPPED}};}}
let state=load(),category='hair',preview={...state.equipped};
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const all=()=>Object.values(CATALOG).flat();
const item=id=>all().find(x=>x.id===id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tokenIcon='<span class="flat-token" aria-hidden="true">F</span>';
function ensureOverlay(){if(document.getElementById('cosmetic-shop'))return;const wrap=document.createElement('div');wrap.id='cosmetic-shop';wrap.hidden=true;wrap.innerHTML='<div class="shop-shell" role="dialog" aria-modal="true" aria-labelledby="shop-title"></div>';document.body.append(wrap);}
function drawAvatar(){const s=item(preview.skin),h=item(preview.hair),t=item(preview.shirt),p=item(preview.pants);return `<div class="avatar-stage"><div class="avatar-shadow"></div><div class="avatar-pixel"><div class="px-hair hair-${h?.shape||'crop'}" style="--hair:${h?.color||'#4b3428'}"></div><div class="px-head" style="--skin:${s?.color||'#c68a62'}"><i></i><b></b></div><div class="px-body" style="--shirt:${t?.color||'#55715a'};--shirt2:${t?.accent||'#3f5948'}"></div><div class="px-arm left" style="--skin:${s?.color||'#c68a62'};--shirt:${t?.color||'#55715a'}"></div><div class="px-arm right" style="--skin:${s?.color||'#c68a62'};--shirt:${t?.color||'#55715a'}"></div><div class="px-leg left" style="--pants:${p?.color||'#4c6577'};--pants2:${p?.accent||'#344957'}"></div><div class="px-leg right" style="--pants:${p?.color||'#4c6577'};--pants2:${p?.accent||'#344957'}"></div></div><div class="preview-label">YOUR LOOK <strong>${esc(h?.name||'')} · ${esc(t?.name||'')}</strong></div></div>`;}
function card(x){const owned=state.owned.includes(x.id),equipped=state.equipped[category]===x.id,selected=preview[category]===x.id;let action='';if(equipped)action='<span class="owned-label equipped">Equipped</span>';else if(owned)action='<span class="owned-label">Owned</span>';else if(x.price===0)action='<span class="owned-label">Free</span>';else action=`<span class="price">${tokenIcon}${x.price}</span>`;const swatch=x.color?`style="--swatch:${x.color};--accent:${x.accent||x.color}"`:'';return `<button class="cosmetic-card${selected?' selected':''}${equipped?' equipped':''}" data-cosmetic-id="${x.id}" ${swatch}><span class="cosmetic-art cosmetic-${category}"><i></i><b></b></span><span class="cosmetic-meta"><strong>${esc(x.name)}</strong>${action}</span></button>`;}
function render(){ensureOverlay();const root=document.querySelector('#cosmetic-shop .shop-shell');const labels={hair:'Hair',skin:'Skin',shirt:'Shirts',pants:'Pants'};root.innerHTML=`<div class="shop-top"><div><div class="shop-kicker">FLATCRAFT WARDROBE</div><h2 id="shop-title">Make it yours.</h2><p>Cosmetics only. No gameplay advantages.</p></div><div class="shop-wallet"><small>FLAT TOKENS</small><strong>${tokenIcon}${state.tokens.toLocaleString()}</strong></div><button class="shop-close" data-shop-action="close" aria-label="Close cosmetics shop">×</button></div><div class="shop-content"><aside>${drawAvatar()}<div id="shop-actionbar" class="shop-actionbar preview-actionbar"></div><div class="shop-note"><span>LOCAL PREVIEW</span><p>Your ownership is saved on this browser for now. Account sync comes next.</p></div></aside><main><nav class="shop-tabs">${Object.keys(CATALOG).map(k=>`<button data-shop-category="${k}" class="${category===k?'active':''}">${labels[k]}</button>`).join('')}</nav><div class="shop-grid">${CATALOG[category].map(card).join('')}</div></main></div>`;updateAction();}
function updateAction(){const bar=document.getElementById('shop-actionbar');if(!bar)return;const x=item(preview[category]);if(!x){bar.innerHTML='';return;}const owned=state.owned.includes(x.id),equipped=state.equipped[category]===x.id;if(equipped){bar.innerHTML=`<div><small>CURRENTLY EQUIPPED</small><strong>${esc(x.name)}</strong></div><button disabled>Equipped</button>`;return;}if(owned||x.price===0){bar.innerHTML=`<div><small>${owned?'OWNED':'FREE ITEM'}</small><strong>${esc(x.name)}</strong></div><button data-shop-action="equip">Equip</button>`;return;}bar.innerHTML=`<div><small>UNLOCK COSMETIC</small><strong>${esc(x.name)} <span>${tokenIcon}${x.price}</span></strong></div><button data-shop-action="buy" ${state.tokens<x.price?'disabled':''}>${state.tokens<x.price?'Not enough tokens':'Unlock'}</button>`;}
function open(){ensureOverlay();preview={...state.equipped};document.getElementById('cosmetic-shop').hidden=false;document.body.classList.add('shop-open');render();}
function close(){const el=document.getElementById('cosmetic-shop');if(el)el.hidden=true;document.body.classList.remove('shop-open');}
function select(id){const x=item(id);if(!x)return;const cat=Object.keys(CATALOG).find(k=>CATALOG[k].some(v=>v.id===id));if(!cat)return;category=cat;preview[cat]=id;render();}
function buy(){const x=item(preview[category]);if(!x||state.owned.includes(x.id))return;if(x.price>state.tokens)return;state.tokens-=x.price;state.owned.push(x.id);state.equipped[category]=x.id;preview[category]=x.id;save();render();}
function equip(){const x=item(preview[category]);if(!x)return;if(x.price===0&&!state.owned.includes(x.id))state.owned.push(x.id);if(!state.owned.includes(x.id))return;state.equipped[category]=x.id;save();render();}
document.addEventListener('click',e=>{if(e.target.closest('[data-flatcraft-shop]')){open();return;}const cat=e.target.closest('[data-shop-category]');if(cat){category=cat.dataset.shopCategory;render();return;}const c=e.target.closest('[data-cosmetic-id]');if(c){select(c.dataset.cosmeticId);return;}const a=e.target.closest('[data-shop-action]')?.dataset.shopAction;if(a==='close')close();else if(a==='buy')buy();else if(a==='equip')equip();if(e.target.id==='cosmetic-shop')close();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('cosmetic-shop')?.hidden)close();});
ensureOverlay();
export const Cosmetics={catalog:CATALOG,get state(){return JSON.parse(JSON.stringify(state));},get equipped(){return {...state.equipped};},open,close,addTokens(amount){if(Number.isFinite(amount)){state.tokens=Math.max(0,Math.floor(state.tokens+amount));save();if(!document.getElementById('cosmetic-shop')?.hidden)render();}},resetPreview(){localStorage.removeItem(KEY);state=load();preview={...state.equipped};save();render();}};
window.FlatCraftCosmetics=Cosmetics;
