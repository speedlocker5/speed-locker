(function(){
  const el=document.getElementById('intro'),go=document.getElementById('inGo'),im=document.getElementById('inLogo'),lg=document.querySelector('nav .logo img'),b=document.getElementById('bolt3d');
  if(lg)im.src=lg.src;else im.remove();
  let done=false;
  function enter(){
    if(done)return;done=true;
    el.classList.add('out');
    if(b){b.classList.remove('on');setTimeout(()=>b.classList.add('on'),300)}
    document.documentElement.classList.remove('lock');scrollTo(0,0);
    setTimeout(()=>el.remove(),1000);
  }
  go.addEventListener('click',enter);
  el.addEventListener('click',enter);
  addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')enter()});
})();
