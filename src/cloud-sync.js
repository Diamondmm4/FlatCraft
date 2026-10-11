const COSMETICS_KEY='flatcraft-cosmetics-v1';
const SETTINGS_KEY='flatcraft-settings';
const SCOPE_KEY='flatcraft-profile-scope';
const CACHE_PREFIX='flatcraft-profile-cache:';
const auth=window.FlatCraftAuth;
const user=auth?.user||null;
const scope=user?.id||'guest';
const supabase=auth?.supabase;
let applying=false;
let syncTimer=null;
let cloudReady=false;

const parse=value=>{try{return value?JSON.parse(value):null;}catch{return null;}};
const readProfile=()=>({
 cosmetics:parse(localStorage.getItem(COSMETICS_KEY)),
 settings:parse(localStorage.getItem(SETTINGS_KEY))
});
const cacheKey=id=>CACHE_PREFIX+id;
const writeCache=(id,profile)=>localStorage.setItem(cacheKey(id),JSON.stringify(profile));
const readCache=id=>parse(localStorage.getItem(cacheKey(id)));

function restoreScope(){
 const previous=localStorage.getItem(SCOPE_KEY);
 if(previous&&previous!==scope){
  writeCache(previous,readProfile());
  const saved=readCache(scope);
  applying=true;
  try{
   if(saved?.cosmetics)localStorage.setItem(COSMETICS_KEY,JSON.stringify(saved.cosmetics));else localStorage.removeItem(COSMETICS_KEY);
   if(saved?.settings)localStorage.setItem(SETTINGS_KEY,JSON.stringify(saved.settings));else localStorage.removeItem(SETTINGS_KEY);
  }finally{applying=false;}
 }
 localStorage.setItem(SCOPE_KEY,scope);
 writeCache(scope,readProfile());
}

async function pushCloud(){
 if(!user||!supabase||!cloudReady)return;
 const profile=readProfile();
 const {error}=await supabase.from('player_profiles').upsert({
  user_id:user.id,
  cosmetics:profile.cosmetics,
  settings:profile.settings,
  updated_at:new Date().toISOString()
 },{onConflict:'user_id'});
 if(error)console.warn('FlatCraft cloud save failed:',error.message);
}

function scheduleCloud(){
 writeCache(scope,readProfile());
 if(!user||!cloudReady)return;
 clearTimeout(syncTimer);
 syncTimer=setTimeout(pushCloud,450);
}

function watchLocalProfile(){
 if(window.__flatcraftProfileStorageWatch)return;
 window.__flatcraftProfileStorageWatch=true;
 const nativeSet=Storage.prototype.setItem;
 const nativeRemove=Storage.prototype.removeItem;
 Storage.prototype.setItem=function(key,value){
  nativeSet.call(this,key,value);
  if(this===localStorage&&!applying&&(key===COSMETICS_KEY||key===SETTINGS_KEY))scheduleCloud();
 };
 Storage.prototype.removeItem=function(key){
  nativeRemove.call(this,key);
  if(this===localStorage&&!applying&&(key===COSMETICS_KEY||key===SETTINGS_KEY))scheduleCloud();
 };
}

async function hydrateFromCloud(){
 if(!user||!supabase)return {status:'guest'};
 const local=readProfile();
 const {data,error}=await supabase.from('player_profiles').select('cosmetics,settings,updated_at').eq('user_id',user.id).maybeSingle();
 if(error){
  console.warn('FlatCraft cloud profile is not ready:',error.message);
  return {status:'unavailable',error};
 }
 applying=true;
 try{
  if(data){
   if(data.cosmetics)localStorage.setItem(COSMETICS_KEY,JSON.stringify(data.cosmetics));
   else if(local.cosmetics)localStorage.setItem(COSMETICS_KEY,JSON.stringify(local.cosmetics));
   if(data.settings)localStorage.setItem(SETTINGS_KEY,JSON.stringify(data.settings));
   else if(local.settings)localStorage.setItem(SETTINGS_KEY,JSON.stringify(local.settings));
  }
 }finally{applying=false;}
 writeCache(scope,readProfile());
 cloudReady=true;
 if(!data)await pushCloud();
 else if((!data.cosmetics&&local.cosmetics)||(!data.settings&&local.settings))await pushCloud();
 return {status:'ready'};
}

restoreScope();
watchLocalProfile();
const result=await hydrateFromCloud();

window.FlatCraftCloud={
 get ready(){return cloudReady;},
 get status(){return result.status;},
 get scope(){return scope;},
 syncNow:pushCloud
};
