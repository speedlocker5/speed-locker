const $=s=>document.querySelector(s),app=$('#app'),E=API.esc;let msg='';
const fmt=t=>new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
function render(){const u=API.me();if(!u)return signin();if(u.role!=='admin')return denied(u);dash()}
function signin(){app.innerHTML=`<div class="box narrow"><span class="pill no">Admin only</span><h1>Admin sign in</h1><div class="f"><input id="e" type="email" placeholder="Admin email"><input id="p" type="password" placeholder="Password"></div>
<p class="err" id="m" role="alert">${E(msg)}</p><button class="btn" data-act="in">Sign in</button>
<p class="mut small">Prototype admin: admin@speedlocker.demo / admin123. In the live version, admin rights are stored on the server and enforced by the database, not by this screen.</p></div>`}
function denied(u){app.innerHTML=`<div class="box narrow"><span class="pill no">No admin access</span><h1>${E(u.name)} is not an admin</h1><p class="mut">This page is only for the store owners.</p><button class="btn" data-act="out">Sign out</button> <a class="btn ghost" href="account.html">My account</a></div>`}
function dash(){const{users,payments}=API.all(),name=Object.fromEntries(users.map(u=>[u.id,u])),mem=users.filter(u=>u.role==='user');
const pend=payments.filter(p=>p.status==='pending'),rev=payments.filter(p=>p.status==='approved').reduce((s,p)=>s+p.amount,0);
const live=mem.filter(u=>API.active(u)||u.access.styles.length).length;
const who=p=>E((name[p.uid]||{name:'?'}).name);
const acc=u=>API.active(u)?`<span class="pill ok">All · until ${fmt(u.access.until)}</span>`:u.access.styles.length?`<span class="pill ok">${u.access.styles.length} style(s)</span>`:'<span class="pill no">No access</span>';
app.innerHTML=`<div class="top"><div><h1>Admin dashboard</h1><p class="mut">Members, payments and access.</p></div><div><button class="btn ghost" data-act="reset">Reset demo data</button><button class="btn ghost" data-act="out">Sign out</button></div></div>
<p class="err" id="m" role="alert">${E(msg)}</p>
<div class="stats"><div><b>${mem.length}</b>Members</div><div><b>${live}</b>With access</div><div><b>${pend.length}</b>Pending payments</div><div><b>$${rev}</b>Approved revenue</div></div>
<h2>Pending payments</h2>${pend.length?`<div class="tblw"><table class="tbl"><tr><th>Date</th><th>Member</th><th>Plan</th><th>Amount</th><th>Method</th><th>Reference</th><th></th></tr>${pend.map(p=>`<tr><td>${fmt(p.created)}</td><td>${who(p)}</td><td>${E(API.PLANS[p.plan].name)}${p.styles.length?' · '+E(p.styles.join(', ')):''}</td><td>$${p.amount}</td><td>${E(p.method)}</td><td>${E(p.ref||'—')}</td><td><button class="btn mini" data-act="ok" data-id="${p.id}">Approve</button><button class="btn ghost mini" data-act="no" data-id="${p.id}">Reject</button></td></tr>`).join('')}</table></div>`:'<p class="mut">Nothing waiting.</p>'}
<h2>Members</h2><div class="tblw"><table class="tbl"><tr><th>Name</th><th>Email</th><th>Joined</th><th>Access</th><th></th></tr>${mem.map(u=>`<tr><td>${E(u.name)}</td><td>${E(u.email)}</td><td>${fmt(u.created)}</td><td>${acc(u)}</td><td><button class="btn mini" data-act="grant" data-id="${u.id}">Grant 30 days</button><button class="btn ghost mini" data-act="revoke" data-id="${u.id}">Revoke</button></td></tr>`).join('')}</table></div>
<h2>All payments</h2><div class="tblw"><table class="tbl"><tr><th>Date</th><th>Member</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th></tr>${payments.map(p=>`<tr><td>${fmt(p.created)}</td><td>${who(p)}</td><td>${E(API.PLANS[p.plan].name)}</td><td>$${p.amount}</td><td>${E(p.method)}</td><td>${E(p.status)}</td></tr>`).join('')}</table></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
try{msg='';
if(a==='in')API.login($('#e').value,$('#p').value);
else if(a==='out')API.logout();
else if(a==='ok')API.review(id,true);else if(a==='no')API.review(id,false);
else if(a==='grant')API.setAccess(id,true);else if(a==='revoke')API.setAccess(id,false);
else if(a==='reset'&&confirm('Reset all demo data in this browser?'))API.reset();
}catch(x){msg=x.message}render()});
render();
