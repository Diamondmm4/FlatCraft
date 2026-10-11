/* Browser-local world storage. Exported saves are portable between devices. */
const GUEST_OWNER='guest';
const ownerId=()=>window.FlatCraftAuth?.user?.id||GUEST_OWNER;

export class Saves{
 constructor(){this.db=null;this.available=true;this.migratedOwners=new Set();}
 async open(){if(this.db)return this.db;return new Promise((resolve,reject)=>{if(!globalThis.indexedDB){this.available=false;reject(Error('This browser cannot store worlds. Use Export world before leaving.'));return;}const r=indexedDB.open('flatcraft-worlds',1);r.onupgradeneeded=()=>r.result.createObjectStore('worlds',{keyPath:'id'});r.onsuccess=()=>{this.db=r.result;resolve(this.db);};r.onerror=()=>{this.available=false;reject(r.error);};});}
 async transact(mode,fn){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('worlds',mode);const result=fn(tx.objectStore('worlds'));tx.oncomplete=()=>resolve(result?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save interrupted'));});}
 async migrateLegacy(){const owner=ownerId();if(owner===GUEST_OWNER||this.migratedOwners.has(owner))return;const db=await this.open();await new Promise((resolve,reject)=>{const tx=db.transaction('worlds','readwrite'),store=tx.objectStore('worlds'),req=store.getAll();req.onsuccess=()=>{for(const row of req.result||[])if(!row.owner){row.owner=owner;store.put(row);}};tx.oncomplete=()=>{this.migratedOwners.add(owner);resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save migration interrupted'));});}
 async save(data){await this.migrateLegacy();const owner=ownerId();return this.transact('readwrite',s=>s.put({id:data.id,name:data.name,seed:data.seed,mode:data.mode,day:data.day,played:data.played,dim:data.dim,saved:data.saved,owner,data}));}
 async list(){await this.migrateLegacy();const owner=ownerId(),rows=await this.transact('readonly',s=>s.getAll());return rows.filter(r=>r.owner===owner).sort((a,b)=>b.saved-a.saved).map(({data,owner,...summary})=>summary);}
 async get(id){await this.migrateLegacy();const owner=ownerId(),r=await this.transact('readonly',s=>s.get(id));return r?.owner===owner?r.data:null;}
 async delete(id){await this.migrateLegacy();const owner=ownerId(),r=await this.transact('readonly',s=>s.get(id));if(!r||r.owner!==owner)return;return this.transact('readwrite',s=>s.delete(id));}
}
export function downloadWorld(data){const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`FlatCraft-${data.name.replace(/[^a-z0-9]/gi,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function importWorld(file){if(file.size>20*1024*1024)throw Error('This save is too large (maximum 20 MB).');let data;try{data=JSON.parse(await file.text());}catch{throw Error('That file is not a valid FlatCraft world.');}if(data?.version!==1||!data.worlds||typeof data.name!=='string')throw Error('That file is not a supported FlatCraft world.');return data;}
