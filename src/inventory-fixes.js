import {UI} from './ui.js';

// Fix shift-clicking ingredients out of the 2x2/3x3 crafting grid.
// The old fallback treated craft-grid indexes like inventory indexes, which
// copied the same stack into inventory without clearing the crafting slot.
const originalQuickTransfer=UI.prototype.quickTransfer;
UI.prototype.quickTransfer=function(zone,i,s){
 if(zone==='craft'){
  const rem=this.g.add(s.id,s.n,s);
  if(rem)s.n=rem;
  else this.setZone(zone,i,null);
  this.g.backpackVersion++;
  return;
 }
 originalQuickTransfer.call(this,zone,i,s);
 this.g.backpackVersion++;
};

// Inventory rearrangements are real world-state changes. Save as soon as the
// inventory closes so hotbar/backpack moves cannot be lost before autosave.
const originalClose=UI.prototype.close;
UI.prototype.close=function(){
 const wasInventory=this.modal==='inventory';
 originalClose.call(this);
 if(wasInventory&&this.g?.id)this.save();
};
