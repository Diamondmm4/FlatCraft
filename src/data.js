/* FlatCraft's data-driven blocks, items, recipes and survival progression. */
export const VERSION = 1;
export const TILE = 16;
export const BLOCKS = {};
export const ITEMS = {};
export const BLOCK_IDS = ['air'];
const title = id => id.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
function block(id, color, opts={}) {
  const b = {id,name:title(id),num:BLOCK_IDS.length,color,solid:true,opaque:true,hardness:1,tool:null,tier:0,drop:id,...opts};
  BLOCKS[id]=b; BLOCK_IDS.push(id); ITEMS[id]={id,name:b.name,color,stack:64,block:id,...opts.item}; return b;
}
BLOCKS.air={id:'air',num:0,solid:false,opaque:false,hardness:0,color:'#000000'};
block('grass','#719a4e',{hardness:.6,tool:'shovel',drop:'dirt'});
block('dirt','#8f6241',{hardness:.5,tool:'shovel'});
block('stone','#79818b',{hardness:1.5,tool:'pickaxe',tier:1,drop:'cobblestone'});
block('cobblestone','#79818b',{hardness:2,tool:'pickaxe',tier:1});
block('log','#76513b',{hardness:2,tool:'axe',solid:false,opaque:false});
block('leaves','#548654',{hardness:.2,opaque:false,drop:null});
block('planks','#b89158',{hardness:2,tool:'axe'});
block('bedrock','#303541',{hardness:Infinity});
block('sand','#dac28a',{hardness:.5,tool:'shovel',falling:true});
block('gravel','#a09991',{hardness:.6,tool:'shovel',falling:true});
for(const [id,color,tier,drop] of [['coal','#333846',1,'coal'],['iron','#d9b395',2,'raw_iron'],['gold','#efc05d',3,'raw_gold'],['diamond','#70ded7',3,'diamond'],['redstone','#e4696e',3,'redstone'],['lapis','#567bbf',2,'lapis'],['emerald','#64b984',3,'emerald']]) block(id+'_ore',color,{hardness:3,tool:'pickaxe',tier,drop});
block('obsidian','#493b67',{hardness:50,tool:'pickaxe',tier:4});
block('water','#5298b5',{solid:false,opaque:false,hardness:Infinity,fluid:true,drop:null});
block('lava','#f1a149',{solid:false,opaque:false,hardness:Infinity,fluid:true,light:13,drop:null});
block('glass','#b0d5d6',{hardness:.3,opaque:false,drop:null});
block('crafting_table','#b58e58',{hardness:2.5,tool:'axe',station:true});
block('furnace','#7c8691',{hardness:3.5,tool:'pickaxe',tier:1,station:true});
block('chest','#b3854b',{hardness:2.5,tool:'axe',station:true});
block('torch','#ebb971',{hardness:0,solid:false,opaque:false,light:13});
block('ladder','#ac844d',{hardness:.4,tool:'axe',solid:false,opaque:false});
block('door','#b18d61',{hardness:3,tool:'axe',opaque:false});
block('door_open','#b18d61',{hardness:3,tool:'axe',solid:false,opaque:false,drop:'door'});
block('bed','#cb6f5c',{hardness:.2,tool:'axe',solid:false,opaque:false});
block('farmland','#765137',{hardness:.6,tool:'shovel',drop:'dirt'});
block('wheat_crop','#c7b360',{hardness:0,solid:false,opaque:false,drop:'wheat_seeds'});
block('flower','#ebaf89',{hardness:0,solid:false,opaque:false});
block('grass_tuft','#7d9f53',{hardness:0,solid:false,opaque:false,drop:null});
block('snow','#e3eced',{hardness:.2,tool:'shovel'});
block('snow_grass','#d0e5dc',{hardness:.6,tool:'shovel',drop:'dirt'});
block('spruce_log','#674d3d',{hardness:2,tool:'axe',solid:false,opaque:false,drop:'log'});
block('spruce_leaves','#3e7364',{hardness:.2,opaque:false,drop:null});
block('cactus','#7d9b5c',{hardness:.4});
block('bricks','#ae7160',{hardness:2,tool:'pickaxe',tier:1});
block('stone_bricks','#8b9295',{hardness:1.5,tool:'pickaxe',tier:1});
block('nether_bricks','#5a343f',{hardness:2,tool:'pickaxe',tier:1});
block('netherrack','#8c4c4a',{hardness:.4,tool:'pickaxe',tier:1});
block('soul_sand','#715748',{hardness:.5,tool:'shovel'});
block('glowstone','#efbd76',{hardness:.3,light:14,drop:'glowstone_dust'});
block('quartz_ore','#efe3d8',{hardness:3,tool:'pickaxe',tier:1,drop:'quartz'});
block('end_stone','#cbc990',{hardness:3,tool:'pickaxe',tier:1});
block('end_frame','#7ba28f',{hardness:Infinity});
block('end_portal','#304258',{solid:false,opaque:false,hardness:Infinity,light:9});
block('nether_portal','#a077cf',{solid:false,opaque:false,hardness:Infinity,light:11});
block('bookshelf','#b5925b',{hardness:1.5,tool:'axe',drop:'book'});
block('enchanting_table','#966187',{hardness:5,tool:'pickaxe',tier:1,station:true});
block('brewing_stand','#d0a251',{hardness:.5,tool:'pickaxe',tier:1,solid:false,opaque:false,station:true});
for(const [id,color] of [['iron','#dbe1e1'],['gold','#f5ce68'],['diamond','#6cd5cb']]) block(id+'_block',color,{hardness:5,tool:'pickaxe',tier:id==='iron'?2:3});
block('tnt','#c36755',{hardness:0});
block('redstone_lamp','#ad7848',{hardness:.3});
block('redstone_wire','#aa4b4c',{solid:false,opaque:false,hardness:0,drop:'redstone'});
block('lever','#a8a6a1',{solid:false,opaque:false,hardness:.5});
block('stone_slab','#9da2a4',{hardness:2,tool:'pickaxe',tier:1});
block('oak_sapling','#8caa64',{solid:false,opaque:false,hardness:0});
block('fence','#b89158',{hardness:2,tool:'axe',opaque:false});
block('sugar_cane','#9eae61',{solid:false,opaque:false,hardness:0});
block('clay','#94a9ac',{hardness:.6,tool:'shovel',drop:'clay_ball'});
block('smithing_table','#5b5353',{hardness:2.5,tool:'axe',station:true});
block('ancient_debris','#93716a',{hardness:30,tool:'pickaxe',tier:4});
export const B=Object.fromEntries(BLOCK_IDS.map((id,i)=>[id,i]));
export const BD=BLOCK_IDS.map(id=>BLOCKS[id]);
function item(id,opts={}) {ITEMS[id]={id,name:title(id),color:'#c5d4d2',stack:64,...ITEMS[id],...opts};}
for(const id of ['stick','coal','charcoal','raw_iron','iron_ingot','raw_gold','gold_ingot','diamond','redstone','lapis','emerald','quartz','flint','wheat_seeds','wheat','feather','leather','wool','string','bone','bone_meal','gunpowder','blaze_rod','blaze_powder','ender_eye','arrow','sugar_cane','paper','book','nether_wart','slimeball','magma_cream','glowstone_dust','ghast_tear','gold_nugget','iron_nugget','netherite_scrap','netherite_ingot','brick','clay_ball','netherite_upgrade_template','melon_slice','glistering_melon']) item(id);
item('ender_pearl',{stack:16});
item('flint_and_steel',{stack:1,durability:64,kind:'lighter'});
item('bucket',{stack:16,kind:'bucket'});item('water_bucket',{stack:1,kind:'bucket'});item('lava_bucket',{stack:1,kind:'bucket'});
item('bow',{stack:1,durability:384,kind:'bow',damage:7});
item('shield',{stack:1,durability:336,kind:'shield'});
item('compass',{stack:1}); item('clock',{stack:1}); item('dragon_egg',{stack:1});
for(const [id,food,saturation] of [['apple',4,2.4],['bread',5,6],['raw_beef',3,1.8],['steak',8,12.8],['raw_porkchop',3,1.8],['cooked_porkchop',8,12.8],['raw_chicken',2,1.2],['cooked_chicken',6,7.2],['rotten_flesh',4,.8],['golden_apple',4,9.6]]) item(id,{food,saturation,kind:'food'});
const materials=[['wood',1,2,59,2],['stone',2,4,131,3],['iron',3,6,250,4],['gold',1,12,32,2],['diamond',4,8,1561,5],['netherite',5,9,2031,6]];
for(const [mat,tier,speed,durability,damage] of materials) for(const kind of ['pickaxe','axe','shovel','hoe','sword']) item(`${mat}_${kind}`,{stack:1,kind,tier,speed,durability,damage:damage+(kind==='sword'?2:kind==='axe'?1:0)});
for(const [mat,defense,dur] of [['leather',[1,3,2,1],55],['gold',[2,5,3,1],77],['iron',[2,6,5,2],165],['diamond',[3,8,6,3],363],['netherite',[3,8,6,3],407]]) ['helmet','chestplate','leggings','boots'].forEach((slot,i)=>item(`${mat}_${slot}`,{stack:1,kind:'armor',slot,defense:defense[i],durability:Math.round(dur*[1,1.45,1.36,1.18][i])}));
for(const id of ['glass_bottle','water_bottle','awkward_potion','healing_potion','strength_potion','fire_resistance_potion']) item(id,{stack:id==='glass_bottle'?64:1,kind:'potion'});
export const RECIPES=[];
function recipe(out,n,pattern,keys,opts={}) {
 const ingredients={}; for(const row of pattern) for(const c of row) if(c!==' '){const id=keys[c];ingredients[id]=(ingredients[id]||0)+1;}
 RECIPES.push({id:out+'_'+RECIPES.length,out,n,pattern,keys,ingredients,station:pattern.length>2||pattern.some(r=>r.length>2)?'crafting_table':null,...opts});
}
recipe('planks',4,['L'],{L:'log'});recipe('planks',4,['L'],{L:'spruce_log'});
recipe('stick',4,['P','P'],{P:'planks'});
recipe('crafting_table',1,['PP','PP'],{P:'planks'});
recipe('furnace',1,['CCC','C C','CCC'],{C:'cobblestone'});
recipe('chest',1,['PPP','P P','PPP'],{P:'planks'});
recipe('torch',4,['C','S'],{C:'coal',S:'stick'});recipe('torch',4,['C','S'],{C:'charcoal',S:'stick'});
for(const [mat,ing] of [['wood','planks'],['stone','cobblestone'],['iron','iron_ingot'],['gold','gold_ingot'],['diamond','diamond']]){
 const k={M:ing,S:'stick'};
 recipe(mat+'_pickaxe',1,['MMM',' S ',' S '],k);
 recipe(mat+'_axe',1,['MM','MS',' S'],k);
 recipe(mat+'_shovel',1,['M','S','S'],k);
 recipe(mat+'_hoe',1,['MM',' S',' S'],k);
 recipe(mat+'_sword',1,['M','M','S'],k);
}
for(const [mat,ing] of [['leather','leather'],['iron','iron_ingot'],['gold','gold_ingot'],['diamond','diamond']]){
 recipe(mat+'_helmet',1,['MMM','M M'],{M:ing});
 recipe(mat+'_chestplate',1,['M M','MMM','MMM'],{M:ing});
 recipe(mat+'_leggings',1,['MMM','M M','M M'],{M:ing});
 recipe(mat+'_boots',1,['M M','M M'],{M:ing});
}
recipe('bed',1,['WWW','PPP'],{W:'wool',P:'planks'});
recipe('door',3,['PP','PP','PP'],{P:'planks'});
recipe('ladder',3,['S S','SSS','S S'],{S:'stick'});
recipe('fence',3,['PSP','PSP'],{P:'planks',S:'stick'});
recipe('stone_slab',6,['SSS'],{S:'stone'});
recipe('stone_bricks',4,['SS','SS'],{S:'stone'});
recipe('bricks',1,['BB','BB'],{B:'brick'});
recipe('bread',1,['WWW'],{W:'wheat'});
recipe('wool',1,['SS','SS'],{S:'string'});
recipe('bucket',1,['I I',' I '],{I:'iron_ingot'});
recipe('flint_and_steel',1,['I ',' F'],{I:'iron_ingot',F:'flint'},{shapeless:true});
recipe('bow',1,[' SR','S R',' SR'],{S:'stick',R:'string'});
recipe('arrow',4,['F','S','H'],{F:'flint',S:'stick',H:'feather'});
recipe('shield',1,['PIP','PPP',' P '],{P:'planks',I:'iron_ingot'});
recipe('bone_meal',3,['B'],{B:'bone'});
recipe('paper',3,['SSS'],{S:'sugar_cane'});
recipe('book',1,['PP','PL'],{P:'paper',L:'leather'},{shapeless:true});
recipe('bookshelf',1,['PPP','BBB','PPP'],{P:'planks',B:'book'});
recipe('enchanting_table',1,[' B ','DOD','OOO'],{B:'book',D:'diamond',O:'obsidian'});
recipe('brewing_stand',1,[' B ','CCC'],{B:'blaze_rod',C:'cobblestone'});
recipe('smithing_table',1,['II','PP','PP'],{I:'iron_ingot',P:'planks'});
recipe('glistering_melon',1,['GGG','GMG','GGG'],{G:'gold_nugget',M:'melon_slice'});
recipe('netherite_upgrade_template',2,['DTD','DND','DDD'],{D:'diamond',T:'netherite_upgrade_template',N:'netherrack'});
recipe('glass_bottle',3,['G G',' G '],{G:'glass'});
recipe('blaze_powder',2,['B'],{B:'blaze_rod'});
recipe('ender_eye',1,['PB'],{P:'ender_pearl',B:'blaze_powder'},{shapeless:true});
recipe('magma_cream',1,['SB'],{S:'slimeball',B:'blaze_powder'},{shapeless:true});
recipe('golden_apple',1,['GGG','GAG','GGG'],{G:'gold_ingot',A:'apple'});
recipe('glowstone',1,['DD','DD'],{D:'glowstone_dust'});
recipe('tnt',1,['GSG','SGS','GSG'],{G:'gunpowder',S:'sand'});
recipe('redstone_lamp',1,[' R ','RGR',' R '],{R:'redstone',G:'glowstone'});
recipe('lever',1,['S','C'],{S:'stick',C:'cobblestone'});
recipe('compass',1,[' I ','IRI',' I '],{I:'iron_ingot',R:'redstone'});
recipe('clock',1,[' G ','GRG',' G '],{G:'gold_ingot',R:'redstone'});
for(const mat of ['iron','gold','diamond']) {const id=mat==='diamond'?mat:mat+'_ingot';recipe(mat+'_block',1,['MMM','MMM','MMM'],{M:id});recipe(id,9,['B'],{B:mat+'_block'});}
recipe('gold_ingot',1,['NNN','NNN','NNN'],{N:'gold_nugget'});recipe('gold_nugget',9,['I'],{I:'gold_ingot'});
recipe('netherite_ingot',1,['SSS','SGG','GG '],{S:'netherite_scrap',G:'gold_ingot'},{shapeless:true});
// Recipes below use the late-game upgrade station in this side-view adaptation.
for(const type of ['pickaxe','axe','shovel','hoe','sword','helmet','chestplate','leggings','boots']) recipe('netherite_'+type,1,['TDI'],{T:'netherite_upgrade_template',D:'diamond_'+type,I:'netherite_ingot'},{station:'smithing_table',shapeless:true});
export const SMELTS={clay_ball:'brick',raw_iron:'iron_ingot',iron_ore:'iron_ingot',raw_gold:'gold_ingot',gold_ore:'gold_ingot',sand:'glass',cobblestone:'stone',log:'charcoal',spruce_log:'charcoal',raw_beef:'steak',raw_porkchop:'cooked_porkchop',raw_chicken:'cooked_chicken',ancient_debris:'netherite_scrap'};
export const FUELS={coal:80,charcoal:80,planks:15,log:15,spruce_log:15,stick:5,wood_pickaxe:10,wood_axe:10,wood_sword:10,lava_bucket:1000};
export const BREWS={water_bottle:{ingredient:'nether_wart',out:'awkward_potion'},awkward_potion:[{ingredient:'glistering_melon',out:'healing_potion'},{ingredient:'blaze_powder',out:'strength_potion'},{ingredient:'magma_cream',out:'fire_resistance_potion'}]};
export const QUESTS=[
 {id:'wood',title:'A world of possibility',text:'Hold the mouse on a tree trunk to gather 4 logs.',item:'log',count:4},
 {id:'table',title:'Your first workshop',text:'Open your pack with E. Craft planks, then a crafting table.',item:'crafting_table',count:1},
 {id:'pick',title:'The stone age',text:'Place your table. Use it to craft a wooden pickaxe.',item:'wood_pickaxe',count:1},
 {id:'furnace',title:'A little warmth',text:'Mine stone with a pickaxe. Craft a furnace from 8 cobblestone.',item:'furnace',count:1},
 {id:'iron',title:'Into the earth',text:'Craft a stone pickaxe. Mine iron and smelt it with fuel.',item:'iron_ingot',count:3},
 {id:'diamond',title:'Something precious',text:'Take an iron pickaxe deep underground to find diamonds.',item:'diamond',count:3},
 {id:'portal',title:'Through the fire',text:'Build a 4×5 obsidian frame. Light its 2×3 opening with flint and steel.',event:'nether'},
 {id:'eyes',title:'Eyes on the horizon',text:'Find blazes in the Nether and endermen at night. Craft 12 eyes of ender.',item:'ender_eye',count:12},
 {id:'end',title:'The last frontier',text:'Use an eye to find the stronghold. Fill its frame with 12 eyes.',event:'end'},
 {id:'dragon',title:'Free the sky',text:'Destroy the healing crystals, then defeat the Ender Dragon.',event:'dragon'}
];
export function matchRecipe(grid,size=3,station=null){
 const cells=[]; for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(grid[y*size+x]) cells.push({x,y,id:grid[y*size+x].id});
 if(!cells.length)return null;
 const minX=Math.min(...cells.map(c=>c.x)),minY=Math.min(...cells.map(c=>c.y)),maxX=Math.max(...cells.map(c=>c.x)),maxY=Math.max(...cells.map(c=>c.y));
 for(const r of RECIPES){
  if(r.station&&r.station!==station)continue;
  if(r.shapeless){const counts={};cells.forEach(c=>counts[c.id]=(counts[c.id]||0)+1);if(JSON.stringify(Object.entries(counts).sort())===JSON.stringify(Object.entries(r.ingredients).sort())) return r;continue;}
  if(r.pattern.length!==maxY-minY+1||Math.max(...r.pattern.map(s=>s.length))!==maxX-minX+1)continue;
  for(const mirror of [false,true]){let ok=true;
   for(let y=0;y<r.pattern.length;y++) for(let x=0;x<=maxX-minX;x++) {const rx=mirror?maxX-minX-x:x;const expected=r.keys[r.pattern[y][rx]]||null;const got=grid[(y+minY)*size+x+minX]?.id||null;if(expected!==got)ok=false;}
   if(ok)return r;
  }
 }
 return null;
}
export function stack(id,n=1,extra={}){return {...(ITEMS[id]?.durability?{dur:ITEMS[id].durability}:{}),...extra,id,n};}
