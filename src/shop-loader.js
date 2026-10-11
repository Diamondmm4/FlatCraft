const response=await fetch(new URL('./shop.js',import.meta.url));
let source=await response.text();
source=source.replace("name:'Founder's Coat'","name:'Founder’s Coat'");
const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
try{await import(url);}finally{URL.revokeObjectURL(url);}
