const $=s=>document.querySelector(s),app=$('#app'),E=API.esc;
const fmt=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const want=new URLSearchParams(location.search).get('plan');let tab='in',msg='',co=null,asked=false;
function render(){const u=API.me();u?member(u):guest();if(u&&want&&!asked){asked=true;openCo(want)}}
function guest(){app.innerHTML=`<div class="box narrow"><span class="pill">Visitor</span><h1>${tab==='in'?'Sign in':'Create your account'}</h1>
<p class="mut">Anyone can browse the styles and prices. You need an account to buy, and downloads unlock only after your payment is approved.</p>
<div class="tabs"><button data-act="tab" data-v="in" class="${tab==='in'?'sel':''}">Sign in</button><button data-act="tab" data-v="up" class="${tab==='up'?'sel':''}">Create account</button></div>
<div class="f">${tab==='up'?'<input id="n" placeholder="Full name" autocomplete="name">':''}<input id="e" type="email" placeholder="Email" autocomplete="email"><input id="p" type="password" placeholder="Password (6+ characters)"></div>
<p class="err" id="m" role="alert">${E(msg)}</p><button class="btn" data-act="auth">${tab==='in'?'Sign in':'Create account'}</button>
<p class="mut small">Prototype: accounts live only in this browser. Demo member: omar@demo.com / demo123</p></div>`}
function member(u){const pays=API.myPayments(),pend=pays.filter(p=>p.status==='pending').length,act=API.active(u),any=act||u.access.styles.length;
const badge=act?`<span class="pill ok">Active until ${fmt(u.access.until)}</span>`:u.access.styles.length?`<span class="pill ok">${u.access.styles.length} style(s) unlocked</span>`:'<span class="pill no">No access yet</span>';
app.innerHTML=`<div class="top"><div><h1>Hi ${E(u.name.split(' ')[0])}</h1>${badge}</div><div><button class="btn" data-act="buy">${any?'Add more access':'Choose a plan'}</button><button class="btn ghost" data-act="out">Sign out</button></div></div>
${u.role==='admin'?'<p class="note"><a href="admin.html">Open the admin dashboard →</a></p>':''}
${pend?`<p class="note">⏳ ${pend} payment(s) waiting for admin approval. Your files unlock as soon as it is approved.</p>`:''}
${any?'':'<p class="note">🔒 You are signed in but have no access yet. Choose a plan to unlock downloads.</p>'}
<h2>Project files</h2><div class="files">${S.map((s,i)=>{const ok=API.can(u,s[0]);return`<div class="file ${ok?'':'lk'}"><b>${E(s[0])}</b><span class="mut small">${s[5]} templates</span>${ok?`<button class="btn" data-act="dl" data-i="${i}">Download</button>`:`<button class="btn ghost" data-act="buy" data-s="${E(s[0])}">🔒 Locked · unlock</button>`}</div>`}).join('')}</div>
<h2>Payment history</h2>${pays.length?`<div class="tblw"><table class="tbl"><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th></tr>${pays.map(p=>`<tr><td>${fmt(p.created)}</td><td>${E(API.PLANS[p.plan].name)}</td><td>$${p.amount}</td><td>${E(p.method)}</td><td>${E(p.status)}</td></tr>`).join('')}</table></div>`:'<p class="mut">No payments yet.</p>'}`}
function dl(i){const u=API.me(),s=S[i];if(!API.can(u,s[0]))return;
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s[0]+' (placeholder file)\nOn the live site this is a temporary link to a private file.\n'],{type:'text/plain'}));
a.download=s[0].replace(/\W+/g,'-')+'-demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function openCo(plan,style){co={plan:API.PLANS[plan]?plan:'monthly',method:'InstaPay',styles:[],ref:''};if(style){co.plan='single';co.styles=[style]}modal()}
function modal(){const r=$('#ref');if(r)co.ref=r.value;const o=$('#modal');o&&o.remove();const P=API.PLANS[co.plan];
const d=document.createElement('div');d.id='modal';d.className='modal';
d.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><p class="proto">PROTOTYPE · no real payment is made</p><h2>Get access</h2>
<div class="opts">${Object.entries(API.PLANS).map(([k,v])=>`<button data-act="plan" data-v="${k}" class="${co.plan===k?'sel':''}"><span>${v.name}</span><b>$${v.price}</b></button>`).join('')}</div>
${P.n?`<p class="small mut">Pick ${P.n} style${P.n>1?'s':''} (${co.styles.length}/${P.n})</p><div class="chk">${S.map(s=>`<label><input type="checkbox" data-act="st" value="${E(s[0])}" ${co.styles.includes(s[0])?'checked':''}>${E(s[0])}</label>`).join('')}</div>`:'<p class="small mut">Includes every style for 30 days.</p>'}
<p class="small mut">Payment method</p><div class="opts">${['InstaPay','Visa / Mastercard','PayPal','Payoneer'].map(m=>`<button data-act="mt" data-v="${m}" class="${co.method===m?'sel':''}">${m}</button>`).join('')}</div>
${co.method==='InstaPay'?`<div class="f"><p class="small mut" style="margin:0">Send the amount to <b>@your-instapay-address</b> (placeholder), then enter the reference.</p><input id="ref" placeholder="InstaPay reference number" value="${E(co.ref)}"></div>`:`<p class="note small">${E(co.method)} checkout is a placeholder until the payment account is approved. Submitting here only creates a demo request.</p>`}
<p class="err" id="m" role="alert"></p><div class="row"><button class="btn" data-act="pay">Submit · $${P.price}</button><button class="btn ghost" data-act="close">Cancel</button></div></div>`;
document.body.appendChild(d)}
function closeCo(){const o=$('#modal');o&&o.remove();co=null}
document.addEventListener('click',e=>{if(e.target.id==='modal')return closeCo();const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,v=b.dataset.v;
if(a==='tab'){tab=v;msg='';render()}
else if(a==='auth'){try{const em=$('#e').value,pw=$('#p').value;tab==='up'?API.signup($('#n').value,em,pw):API.login(em,pw);msg='';tab='in';render()}catch(x){msg=x.message;$('#m').textContent=msg}}
else if(a==='out'){API.logout();asked=true;tab='in';msg='';render()}
else if(a==='dl')dl(+b.dataset.i)
else if(a==='buy')openCo('monthly',b.dataset.s)
else if(a==='plan'){co.plan=v;co.styles=co.styles.slice(0,API.PLANS[v].n);modal()}
else if(a==='mt'){co.method=v;modal()}
else if(a==='st'){if(b.checked){if(co.styles.length>=API.PLANS[co.plan].n){b.checked=false;return}co.styles.push(b.value)}else co.styles=co.styles.filter(x=>x!==b.value);modal()}
else if(a==='pay'){try{const r=$('#ref');API.pay(co.plan,co.method,r?r.value:'',co.styles);closeCo();render()}catch(x){$('#modal #m').textContent=x.message}}
else if(a==='close')closeCo()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&co)closeCo()});
render();
