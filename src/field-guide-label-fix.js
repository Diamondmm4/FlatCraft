import {UI} from './ui.js';

// Keep the controls guide device-neutral: this advice is for anyone using
// a trackpad/no mouse, not specifically MacBook users.
const originalGuide=UI.prototype.guide;
UI.prototype.guide=function(...args){
 const result=originalGuide.apply(this,args);
 const modal=document.getElementById('modal');
 if(this.guideTab==='controls'&&modal){
  for(const heading of modal.querySelectorAll('h3')){
   if(heading.textContent.trim()==='A MacBook tip')heading.textContent='No Mouse Tip';
  }
 }
 return result;
};
