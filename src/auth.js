import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL='https://hflmknkdkpnnqyguwatr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_DX3HuS3yLkR7G4A__9k7AQ_PHTs-w82';
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

let session=null;
let mode='signin';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const authRedirect=()=>location.origin+location.pathname;

function ensureOverlay(){
 if(document.getElementById('account-overlay'))return;
 document.body.insertAdjacentHTML('beforeend',`
  <div id="account-overlay" class="account-overlay" hidden>
   <section class="account-card" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <button class="account-close" type="button" data-auth-action="close" aria-label="Close">×</button>
    <div id="account-content"></div>
   </section>
  </div>`);
 const overlay=document.getElementById('account-overlay');
 overlay.addEventListener('click',e=>{
  if(e.target===overlay||e.target.closest('[data-auth-action="close"]'))close();
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close();});
 document.addEventListener('submit',submit);
 document.addEventListener('click',click);
}

function accountButton(){return document.querySelector('[data-flatcraft-account]');}
function updateButton(){
 const btn=accountButton();if(!btn)return;
 btn.textContent='Account';
 btn.classList.toggle('signed-in',!!session);
 btn.title=session?.user?.email?`Signed in as ${session.user.email}`:'Sign in or create an account';
}

function message(text,type='info'){
 const el=document.getElementById('auth-message');
 if(!el)return;el.textContent=text||'';el.dataset.type=type;
}

function formHtml(){
 const signingIn=mode==='signin';
 return `
  <div class="account-eyebrow">FLATCRAFT ACCOUNT</div>
  <h2 id="account-title">${signingIn?'Welcome back':'Create your account'}</h2>
  <p class="account-subtext">${signingIn?'Sign in to your FlatCraft account.':'Create an account now; cloud saves will be connected next.'}</p>
  <div class="account-tabs" role="tablist">
   <button type="button" data-auth-action="mode" data-mode="signin" class="${signingIn?'active':''}">Sign in</button>
   <button type="button" data-auth-action="mode" data-mode="signup" class="${!signingIn?'active':''}">Create account</button>
  </div>
  <form id="auth-form" autocomplete="on">
   <label><span>Email</span><input id="auth-email" type="email" autocomplete="email" required placeholder="you@example.com"></label>
   <label><span>Password</span><input id="auth-password" type="password" autocomplete="${signingIn?'current-password':'new-password'}" minlength="8" required placeholder="At least 8 characters"></label>
   <button class="account-primary" type="submit">${signingIn?'Sign in':'Create account'}</button>
  </form>
  <button class="account-secondary" type="button" data-auth-action="resend">Resend confirmation email</button>
  <div id="auth-message" class="account-message" aria-live="polite"></div>
  <div class="account-guest"><strong>Guest mode stays available.</strong><span>Your current browser worlds and cosmetics will not be deleted.</span></div>`;
}

function signedInHtml(){
 const email=esc(session?.user?.email||'');
 return `
  <div class="account-eyebrow">FLATCRAFT ACCOUNT</div>
  <h2 id="account-title">You’re signed in</h2>
  <p class="account-subtext">Your account is connected. Cloud syncing is the next step.</p>
  <div class="account-profile"><span>Email</span><strong>${email}</strong></div>
  <button class="account-secondary" type="button" data-auth-action="signout">Sign out</button>
  <div id="auth-message" class="account-message" aria-live="polite"></div>
  <div class="account-guest"><strong>Local saves are still safe.</strong><span>Signing out does not erase worlds stored in this browser.</span></div>`;
}

function render(){
 ensureOverlay();
 document.getElementById('account-content').innerHTML=session?signedInHtml():formHtml();
 setTimeout(()=>document.getElementById(session?'account-title':'auth-email')?.focus?.(),0);
}
function open(){ensureOverlay();render();document.getElementById('account-overlay').hidden=false;}
function close(){const o=document.getElementById('account-overlay');if(o)o.hidden=true;}

async function submit(e){
 if(e.target.id!=='auth-form')return;
 e.preventDefault();
 const email=document.getElementById('auth-email').value.trim();
 const password=document.getElementById('auth-password').value;
 const button=e.target.querySelector('button[type="submit"]');
 button.disabled=true;button.textContent=mode==='signin'?'Signing in…':'Creating account…';message('');
 try{
  if(mode==='signin'){
   const {error}=await supabase.auth.signInWithPassword({email,password});
   if(error)throw error;
  }else{
   const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:authRedirect()}});
   if(error)throw error;
   if(!data.session){message('Account created. Check your email to confirm it. If the link expired, use Resend confirmation email below.','success');return;}
  }
 }catch(err){message(err?.message||'Something went wrong. Please try again.','error');}
 finally{button.disabled=false;button.textContent=mode==='signin'?'Sign in':'Create account';}
}

async function resendConfirmation(button){
 const input=document.getElementById('auth-email');
 const email=input?.value.trim();
 if(!email){message('Enter the email address you used to create the account first.','error');input?.focus();return;}
 button.disabled=true;const old=button.textContent;button.textContent='Sending…';message('');
 try{
  const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:authRedirect()}});
  if(error)throw error;
  message('Confirmation email sent. Use the newest email and click its confirmation link.','success');
 }catch(err){message(err?.message||'Could not resend the confirmation email. Please try again.','error');}
 finally{button.disabled=false;button.textContent=old;}
}

async function click(e){
 const account=e.target.closest('[data-flatcraft-account]');
 if(account){open();return;}
 const el=e.target.closest('[data-auth-action]');if(!el)return;
 if(el.dataset.authAction==='mode'){
  mode=el.dataset.mode==='signup'?'signup':'signin';render();return;
 }
 if(el.dataset.authAction==='resend'){await resendConfirmation(el);return;}
 if(el.dataset.authAction==='signout'){
  el.disabled=true;const {error}=await supabase.auth.signOut();if(error){el.disabled=false;message(error.message,'error');}
 }
}

ensureOverlay();
const {data:{session:initialSession}}=await supabase.auth.getSession();
session=initialSession;
updateButton();
supabase.auth.onAuthStateChange((_event,nextSession)=>{
 session=nextSession;updateButton();
 const overlay=document.getElementById('account-overlay');
 if(overlay&&!overlay.hidden)render();
 window.dispatchEvent(new CustomEvent('flatcraft-auth-change',{detail:{session,user:session?.user||null}}));
});

window.FlatCraftAuth={
 supabase,
 get session(){return session;},
 get user(){return session?.user||null;},
 open,
 close
};
