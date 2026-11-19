const g=document.getElementById('grid'),q=document.getElementById('q'),sug=document.getElementById('sug'),ch=document.getElementById('chips'),none=document.getElementById('none');
g.innerHTML=S.map((s,i)=>FEAT.includes(s[0])?'':`<div class="card" data-i="${i}"><div class="thumb${VM[s[0]]?(VM[s[0]]>3?' v vw':' v'):''}" style="--c1:${s[2]};--c2:${s[3]}">${VM[s[0]]?`<video data-v="${VM[s[0]]}" muted loop autoplay playsinline></video>`:s[1]}</div><h3>${s[0]}</h3><p>${s[6]}</p><div class="meta"><span>${s[5]} templates</span><a class="btn" style="padding:7px 14px;font-size:13px" href="#pricing">Explore</a></div></div>`).join('');
ch.innerHTML=S.slice(0,6).concat(S.slice(8,12),S.slice(13)).map(s=>`<span class="chip" data-n="${s[0]}">${s[0]}</span>`).join('');
const FI=FEAT.map(n=>S.findIndex(s=>s[0]===n));let sel=0;
const seg=document.getElementById('seg'),five=document.getElementById('five'),panel=document.getElementById('panel');
seg.innerHTML=FI.map((i,k)=>`<button data-k="${k}">${S[i][0]}</button>`).join('');
five.innerHTML=FI.map((i,k)=>`<div class="fc" data-k="${k}"><video data-v="${VM[S[i][0]]}" muted loop autoplay playsinline></video><div class="cap"><b>${S[i][0]}</b><span>${S[i][5]} templates</span></div></div>`).join('');
function pickK(k){sel=k;document.querySelectorAll('#seg button,.fc').forEach(e=>e.classList.toggle('on',+e.dataset.k===k));const s=S[FI[k]];panel.innerHTML=`<div><h3>${s[0]}</h3><p>${s[6]}</p></div><div class="pst"><div><b>${s[5]}</b><span>templates</span></div><div><b>AE · PR · DR</b><span>software</span></div></div><a class="btn" href="#pricing">Explore ${s[0]}</a>`}
seg.onclick=five.onclick=e=>{const t=e.target.closest('[data-k]');if(t)pickK(+t.dataset.k)};
pickK(0);
function vurl(i){return VD[i]}
const vids=[...document.querySelectorAll('video[data-v]')];
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){if(!v.getAttribute('src'))v.src=vurl(v.dataset.v-1);v.play().catch(()=>{})}else v.pause()}),{rootMargin:'120px'});
vids.forEach(v=>{v.muted=true;v.preload='metadata';vio.observe(v)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)vids.forEach(v=>v.pause());else vids.forEach(v=>{vio.unobserve(v);vio.observe(v)})});
function match(s,t){const x=(s[0]+' '+s[4]).toLowerCase();return !t||x.includes(t)||t.split(' ').some(w=>w.length>2&&x.includes(w))}
function run(t){t=t.trim().toLowerCase();let n=0;
document.querySelectorAll('#grid .card').forEach(c=>{const ok=match(S[c.dataset.i],t);c.style.display=ok?'':'none';if(ok)n++});
let first=-1,vis=0;FI.forEach((i,k)=>{const ok=match(S[i],t);document.querySelectorAll(`[data-k="${k}"]`).forEach(e=>e.style.display=ok?'':'none');if(ok){vis++;if(first<0)first=k}});
if(first>=0&&document.querySelector(`#seg [data-k="${sel}"]`).style.display==='none')pickK(first);
document.getElementById('showcase').style.display=vis?'':'none';document.getElementById('more').style.display=n?'':'none';
none.style.display=(n+vis)?'none':'block';
document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.dataset.n.toLowerCase()===t))}
function sugg(){const t=q.value.trim().toLowerCase();if(!t){sug.style.display='none';return}
const m=S.filter(s=>(s[0]+' '+s[4]).toLowerCase().includes(t)).slice(0,5);
sug.innerHTML=m.map(s=>`<div data-n="${s[0]}">${s[0]}</div>`).join('');sug.style.display=m.length?'block':'none'}
q.addEventListener('input',()=>{run(q.value);sugg()});
q.addEventListener('keydown',e=>{if(e.key==='Enter'){sug.style.display='none';document.getElementById('styles').scrollIntoView()}});
function pick(n){q.value=n;run(n);sug.style.display='none';document.getElementById('styles').scrollIntoView()}
sug.addEventListener('click',e=>{if(e.target.dataset.n)pick(e.target.dataset.n)});
ch.addEventListener('click',e=>{const n=e.target.dataset.n;if(!n)return;if(q.value===n){q.value='';run('')}else pick(n)});
document.addEventListener('click',e=>{if(!e.target.closest('.search'))sug.style.display='none'});
const rg=document.getElementById('rg'),bb=document.getElementById('bb'),bar=document.getElementById('bar');
rg.addEventListener('input',()=>{bb.style.clipPath=`inset(0 0 0 ${rg.value}%)`;bar.style.left=rg.value+'%'});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
