/* Local-first world storage with optional Supabase cloud mirroring for signed-in accounts. */
const GUEST_OWNER='guest';
const ownerId=()=>window.FlatCraftAuth?.user?.id||GUEST_OWNER;
const cloudClient=()=>window.FlatCraftAuth?.supabase||null;
const cloudUser=()=>window.FlatCraftAuth?.user||null;
const CLOUD_TABLE='player_worlds';

export class Saves{
 constructor(){this.db=null;this.available=true;this.migratedOwners=new Set();this.syncing=null;}
 async open(){if(this.db)return this.db;return new Promise((resolve,reject)=>{if(!globalThis.indexedDB){this.available=false;reject(Error('This browser cannot store worlds. Use Export world before leaving.'));return;}const r=indexedDB.open('flatcraft-worlds',1);r.onupgradeneeded=()=>r.result.createObjectStore('worlds',{keyPath:'id'});r.onsuccess=()=>{this.db=r.result;resolve(this.db);};r.onerror=()=>{this.available=false;reject(r.error);};});}
 async transact(mode,fn){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('worlds',mode);const result=fn(tx.objectStore('worlds'));tx.oncomplete=()=>resolve(result?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save interrupted'));});}
 async migrateLegacy(){const owner=ownerId();if(owner===GUEST_OWNER||this.migratedOwners.has(owner))return;const db=await this.open();await new Promise((resolve,reject)=>{const tx=db.transaction('worlds','readwrite'),store=tx.objectStore('worlds'),req=store.getAll();req.onsuccess=()=>{for(const row of req.result||[])if(!row.owner){row.owner=owner;store.put(row);}};tx.oncomplete=()=>{this.migratedOwners.add(owner);resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save migration interrupted'));});}
 row(data,owner=ownerId()){return {id:data.id,name:data.name,seed:data.seed,mode:data.mode,day:data.day,played:data.played,dim:data.dim,saved:data.saved,owner,data};}
 async localRows(){await this.migrateLegacy();const owner=ownerId(),rows=await this.transact('readonly',s=>s.getAll());return rows.filter(r=>r.owner===owner);}
 async putLocal(data){return this.transact('readwrite',s=>s.put(this.row(data)));}
 async removeLocal(id){return this.transact('readwrite',s=>s.delete(id));}
 cloudEnabled(){return ownerId()!==GUEST_OWNER&&!!cloudClient()&&!!cloudUser();}
 cloudRecord(data){const user=cloudUser();return {user_id:user.id,world_id:data.id,name:data.name,seed:String(data.seed??''),mode:data.mode,day:data.day||1,played:data.played||0,dim:data.dim||'overworld',saved:Number(data.saved)||Date.now(),world_data:data,deleted:false,updated_at:new Date().toISOString()};}
 async pushCloud(data){if(!this.cloudEnabled())return false;try{const {error}=await cloudClient().from(CLOUD_TABLE).upsert(this.cloudRecord(data),{onConflict:'user_id,world_id'});if(error)throw error;return true;}catch(err){console.warn('FlatCraft cloud world save unavailable:',err?.message||err);return false;}}
 async markCloudDeleted(id){if(!this.cloudEnabled())return false;try{const user=cloudUser(),now=new Date().toISOString();const {error}=await cloudClient().from(CLOUD_TABLE).upsert({user_id:user.id,world_id:id,deleted:true,updated_at:now},{onConflict:'user_id,world_id'});if(error)throw error;return true;}catch(err){console.warn('FlatCraft cloud world delete unavailable:',err?.message||err);return false;}}
 async syncCloud(){
  if(!this.cloudEnabled())return false;
  if(this.syncing)return this.syncing;
  this.syncing=(async()=>{try{
   const user=cloudUser(),supabase=cloudClient();
   const {data:cloudRows,error}=await supabase.from(CLOUD_TABLE).select('world_id,name,seed,mode,day,played,dim,saved,world_data,deleted,updated_at').eq('user_id',user.id);
   if(error)throw error;
   const localRows=await this.localRows(),localById=new Map(localRows.map(r=>[r.id,r]));
   const cloudById=new Map((cloudRows||[]).map(r=>[r.world_id,r]));

   for(const c of cloudRows||[]){
    const local=localById.get(c.world_id);
    const cloudChanged=Date.parse(c.updated_at||0)||0;
    const localSaved=Number(local?.saved)||0;
    if(c.deleted){if(local&&cloudChanged>=localSaved)await this.removeLocal(c.world_id);continue;}
    if(!c.world_data)continue;
    if(!local||Number(c.saved||0)>localSaved){await this.transact('readwrite',s=>s.put(this.row(c.world_data,user.id)));}
    else if(localSaved>Number(c.saved||0)){await this.pushCloud(local.data);}
   }

   for(const local of localRows){if(!cloudById.has(local.id))await this.pushCloud(local.data);}
   return true;
  }catch(err){console.warn('FlatCraft cloud world sync unavailable:',err?.message||err);return false;}finally{this.syncing=null;}})();
  return this.syncing;
 }
 async save(data){await this.migrateLegacy();await this.putLocal(data);await this.pushCloud(data);return true;}
 async list(){await this.migrateLegacy();await this.syncCloud();const owner=ownerId(),rows=await this.transact('readonly',s=>s.getAll());return rows.filter(r=>r.owner===owner).sort((a,b)=>b.saved-a.saved).map(({data,owner,...summary})=>summary);}
 async get(id){await this.migrateLegacy();let r=await this.transact('readonly',s=>s.get(id));if(r?.owner===ownerId())return r.data;if(this.cloudEnabled()){await this.syncCloud();r=await this.transact('readonly',s=>s.get(id));if(r?.owner===ownerId())return r.data;}return null;}
 async delete(id){await this.migrateLegacy();const owner=ownerId(),r=await this.transact('readonly',s=>s.get(id));if(r?.owner===owner)await this.removeLocal(id);await this.markCloudDeleted(id);}
}
export function downloadWorld(data){const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`FlatCraft-${data.name.replace(/[^a-z0-9]/gi,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function importWorld(file){if(file.size>20*1024*1024)throw Error('This save is too large (maximum 20 MB).');let data;try{data=JSON.parse(await file.text());}catch{throw Error('That file is not a valid FlatCraft world.');}if(data?.version!==1||!data.worlds||typeof data.name!=='string')throw Error('That file is not a supported FlatCraft world.');return data;}
