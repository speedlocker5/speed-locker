/* PROTOTYPE BACKEND. Everything is stored in this browser's localStorage, so it is NOT secure
   and is NOT shared between devices. The UI only talks to this object, so the live version
   can replace these functions with Supabase (auth + database + private storage) calls. */
const API=(()=>{
const K='sl_proto_db_v1',day=864e5,now=()=>Date.now(),err=m=>{throw new Error(m)};
const PLANS={single:{name:'Single template',price:19,n:1},monthly:{name:'Monthly membership',price:29,n:0},bundle:{name:'Style bundle',price:79,n:5}};
const none=()=>({all:false,until:0,styles:[]});
const seed=()=>({session:null,users:[
 {id:'u1',name:'Admin',email:'admin@speedlocker.demo',pass:'admin123',role:'admin',created:now()-30*day,access:none()},
 {id:'u2',name:'Omar (demo)',email:'omar@demo.com',pass:'demo123',role:'user',created:now()-9*day,access:{all:true,until:now()+21*day,styles:[]}},
 {id:'u3',name:'Salma (demo)',email:'salma@demo.com',pass:'demo123',role:'user',created:now()-3*day,access:none()}],
 payments:[{id:'p1',uid:'u2',plan:'monthly',amount:29,method:'InstaPay',ref:'IP-48210',styles:[],status:'approved',created:now()-9*day},
 {id:'p2',uid:'u3',plan:'single',amount:19,method:'InstaPay',ref:'IP-50377',styles:['Tech'],status:'pending',created:now()-3600e3}]});
let db=null;try{db=JSON.parse(localStorage.getItem(K))}catch(e){}
if(!db)db=seed();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const me=()=>db.users.find(u=>u.id===db.session)||null;
const need=r=>{const u=me();if(!u||(r&&u.role!==r))err('Not allowed');return u};
const active=u=>!!u&&u.access.all&&u.access.until>now();
const can=(u,s)=>!!u&&(active(u)||u.access.styles.includes(s));
return{PLANS,esc,me,active,can,
signup(name,email,pass){name=name.trim();email=email.trim().toLowerCase();
 if(!name||!/^\S+@\S+\.\S+$/.test(email))err('Enter your name and a valid email.');
 if(pass.length<6)err('Password must be at least 6 characters.');
 if(db.users.some(u=>u.email===email))err('This email already has an account.');
 const u={id:'u'+now(),name,email,pass,role:'user',created:now(),access:none()};db.users.push(u);db.session=u.id;save()},
login(email,pass){const u=db.users.find(u=>u.email===email.trim().toLowerCase()&&u.pass===pass);
 if(!u)err('Wrong email or password.');db.session=u.id;save()},
logout(){db.session=null;save()},
myPayments(){const u=need();return db.payments.filter(p=>p.uid===u.id).sort((a,b)=>b.created-a.created)},
pay(plan,method,ref,styles){const u=need(),P=PLANS[plan];if(!P)err('Choose a plan.');
 if(styles.length!==P.n)err('Pick exactly '+P.n+' style'+(P.n>1?'s':'')+'.');
 if(method==='InstaPay'&&!ref.trim())err('Enter the InstaPay reference number.');
 db.payments.push({id:'p'+now(),uid:u.id,plan,amount:P.price,method,ref:ref.trim(),styles,status:'pending',created:now()});save()},
all(){need('admin');return{users:db.users.map(u=>({...u,pass:undefined})),payments:db.payments.slice().sort((a,b)=>b.created-a.created)}},
review(id,ok){need('admin');const p=db.payments.find(p=>p.id===id);if(!p||p.status!=='pending')err('Already reviewed.');
 p.status=ok?'approved':'rejected';
 if(ok){const u=db.users.find(u=>u.id===p.uid);
  if(p.plan==='monthly'){u.access.all=true;u.access.until=Math.max(now(),u.access.until)+30*day}
  else u.access.styles=[...new Set([...u.access.styles,...p.styles])]}save()},
setAccess(uid,on){need('admin');const u=db.users.find(u=>u.id===uid);if(!u)return;
 if(on){u.access.all=true;u.access.until=now()+30*day}else u.access=none();save()},
reset(){need('admin');db=seed();db.session='u1';save()}};
})();
