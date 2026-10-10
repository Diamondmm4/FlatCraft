/* Browser-local world storage. Exported saves are portable between devices. */
export class Saves{
 constructor(){this.db=null;this.available=true;}
 async open(){if(this.db)return this.db;return new Promise((resolve,reject)=>{if(!globalThis.indexedDB){this.available=false;reject(Error('This browser cannot store worlds. Use Export world before leaving.'));return;}const r=indexedDB.open('flatcraft-worlds',1);r.onupgradeneeded=()=>r.result.createObjectStore('worlds',{keyPath:'id'});r.onsuccess=()=>{this.db=r.result;resolve(this.db);};r.onerror=()=>{this.available=false;reject(r.error);};});}
 async transact(mode,fn){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('worlds',mode);const result=fn(tx.objectStore('worlds'));tx.oncomplete=()=>resolve(result?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save interrupted'));});}
 async save(data){return this.transact('readwrite',s=>s.put({id:data.id,name:data.name,seed:data.seed,mode:data.mode,day:data.day,played:data.played,dim:data.dim,saved:data.saved,data}));}
 async list(){const rows=await this.transact('readonly',s=>s.getAll());return rows.sort((a,b)=>b.saved-a.saved).map(({data,...summary})=>summary);}
 async get(id){const r=await this.transact('readonly',s=>s.get(id));return r?.data;}
 async delete(id){return this.transact('readwrite',s=>s.delete(id));}
}
export function downloadWorld(data){const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`FlatCraft-${data.name.replace(/[^a-z0-9]/gi,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function importWorld(file){if(file.size>20*1024*1024)throw Error('This save is too large (maximum 20 MB).');let data;try{data=JSON.parse(await file.text());}catch{throw Error('That file is not a valid FlatCraft world.');}if(data?.version!==1||!data.worlds||typeof data.name!=='string')throw Error('That file is not a supported FlatCraft world.');return data;}
