(function(){
const red=matchMedia('(prefers-reduced-motion:reduce)').matches,pg=document.getElementById('prog'),nv=document.querySelector('nav');
function sc(){const h=document.documentElement.scrollHeight-innerHeight;pg.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';nv.classList.toggle('sm',scrollY>40)}
addEventListener('scroll',sc,{passive:true});sc();
document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.card,.step,.panel,.hero');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
const half=S.map(s=>'<span>'+s[0]+'</span><i></i>').join('');document.getElementById('mq').innerHTML=half+half;
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const el=e.target,end=+el.dataset.count,suf=el.dataset.s||'',t0=performance.now();
(function f(t){const k=red?1:Math.min(1,(t-t0)/1400),v=Math.round(end*(1-Math.pow(1-k,3)));el.textContent=v.toLocaleString('en-US')+suf;if(k<1)requestAnimationFrame(f)})(t0)}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));
})();
