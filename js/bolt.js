(function(){
  /* Lightweight canvas-2D 3D bolt (replaces ~110 clip-path DOM layers + per-frame CSS filters). */
  const W=560,H=840,DW=280,DH=420,K=DW/W,T=34,P=1000,CW=420,CH=560,CX=CW/2,CY=CH/2;
  const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const SL=[
    {p:[[500,38],[28,408],[240,408],[292,342]], z:50,  a:135, c:['#ff6a74','#e11d2e','#9a0b16'], pos:[0,.48,1],
     wedge:[[170,408],[240,408],[292,342],[262,352]]},
    {p:[[330,340],[535,340],[345,495],[285,558],[45,558]], z:0, a:118, c:['#ff4a56','#d9142a','#8a0912'], pos:[0,.55,1],
     wedge:[[190,558],[285,558],[345,495],[316,503]]},
    {p:[[535,495],[345,495],[285,558],[105,820]], z:-50, a:140, c:['#ff7b84','#e11d2e','#930914'], pos:[0,.5,1],
     wedge:null}
  ];
  const BACK={a:135,c:['#d3182a','#7a0b14'],pos:[0,1]};
  const cv=document.getElementById('boltCv'),ctx=cv.getContext('2d');
  const ds=Math.min(2,Math.max(1.5,devicePixelRatio||1));
  cv.width=Math.round(CW*ds); cv.height=Math.round(CH*ds);

  // pre-compute geometry (centered px)
  const conv=a=>a.map(q=>[q[0]*K-DW/2,q[1]*K-DH/2]);
  SL.forEach(sl=>{
    sl.pts=conv(sl.p); sl.wpts=sl.wedge?conv(sl.wedge):null;
    sl.cols=sl.c.map(hex);
    let ar=0; const n=sl.pts.length;
    for(let i=0;i<n;i++){const a=sl.pts[i],b=sl.pts[(i+1)%n];ar+=a[0]*b[1]-b[0]*a[1]}
    sl.edges=sl.pts.map((a,i)=>{const b=sl.pts[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1];
      return {a,b,mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2,nx:ar>0?dy:-dy,ny:ar>0?-dx:dx}});
  });
  BACK.cols=BACK.c.map(hex);

  // rotation matrix  M = Rx*Ry*Rz  (same order/handedness as CSS rotateX rotateY rotateZ)
  const M=new Array(9);
  function setM(rx,ry,rz){
    const a=rx*Math.PI/180,b=ry*Math.PI/180,g=rz*Math.PI/180;
    const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cg=Math.cos(g),sg=Math.sin(g);
    M[0]=cb*cg;           M[1]=-cb*sg;          M[2]=sb;
    M[3]=ca*sg+sa*sb*cg;  M[4]=ca*cg-sa*sb*sg;  M[5]=-sa*cb;
    M[6]=sa*sg-ca*sb*cg;  M[7]=sa*cg+ca*sb*sg;  M[8]=ca*cb;
  }
  const A=[0,0,0],B=[0,0,0];
  function pr(x,y,z,o){
    const vx=M[0]*x+M[1]*y+M[2]*z, vy=M[3]*x+M[4]*y+M[5]*z, vz=M[6]*x+M[7]*y+M[8]*z;
    const s=P/Math.max(60,P-vz); o[0]=CX+vx*s; o[1]=CY+vy*s; o[2]=vz; return o;
  }
  const rgb=(c,f,a)=>{const r=Math.min(255,c[0]*f)|0,g=Math.min(255,c[1]*f)|0,b=Math.min(255,c[2]*f)|0;return a==null?'rgb('+r+','+g+','+b+')':'rgba('+r+','+g+','+b+','+a+')'};
  function cssGrad(a,z,cols,pos,f){
    const r=a*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),L=Math.abs(DW*dx)+Math.abs(DH*dy);
    pr(-dx*L/2,-dy*L/2,z,A); pr(dx*L/2,dy*L/2,z,B);
    const g=ctx.createLinearGradient(A[0],A[1],B[0],B[1]);
    for(let i=0;i<cols.length;i++) g.addColorStop(pos[i],rgb(cols[i],f));
    return g;
  }
  function path(pts,z){
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){pr(pts[i][0],pts[i][1],z,A); i?ctx.lineTo(A[0],A[1]):ctx.moveTo(A[0],A[1])}
    ctx.closePath();
  }
  function fillStroke(fill){ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=fill;ctx.lineWidth=.8;ctx.lineJoin='round';ctx.stroke()}

  function draw(rx,ry,rz){
    setM(rx,ry,rz);
    const camX=P*M[6],camY=P*M[7],camZ=P*M[8];     // camera position in object space
    const c=Math.cos(ry*Math.PI/180);
    const fb=.66+.50*Math.max(0,c), bb=.66+.50*Math.max(0,-c);
    ctx.setTransform(ds,0,0,ds,0,0); ctx.clearRect(0,0,CW,CH);
    // far slab first (slabs are separated by parallel planes, so distance along z gives the right order)
    const order=SL.slice().sort((a,b)=>Math.abs(camZ-b.z)-Math.abs(camZ-a.z));
    for(const sl of order){
      const zf=sl.z+T/2, zb=sl.z-T/2;
      // visible side walls, far -> near
      const vis=[];
      for(const e of sl.edges){
        if(e.nx*(camX-e.mx)+e.ny*(camY-e.my)>0){
          pr(e.mx,e.my,sl.z,A); vis.push([A[2],e]);
        }
      }
      vis.sort((a,b)=>a[0]-b[0]);
      for(const v of vis){
        const e=v[1];
        pr(e.a[0],e.a[1],zb,A); const ax=A[0],ay=A[1];
        ctx.beginPath(); ctx.moveTo(ax,ay);
        pr(e.b[0],e.b[1],zb,A); ctx.lineTo(A[0],A[1]);
        pr(e.b[0],e.b[1],zf,A); ctx.lineTo(A[0],A[1]);
        pr(e.a[0],e.a[1],zf,A); ctx.lineTo(A[0],A[1]);
        ctx.closePath();
        pr(e.mx,e.my,zb,A); pr(e.mx,e.my,zf,B);
        const g=ctx.createLinearGradient(A[0],A[1],B[0],B[1]);
        g.addColorStop(0,'hsl(355,82%,13%)'); g.addColorStop(1,'hsl(355,82%,33%)');
        fillStroke(g);
      }
      if(camZ>zf){                                   // front face + shading wedge
        path(sl.pts,zf); fillStroke(cssGrad(sl.a,zf,sl.cols,sl.pos,fb));
        if(sl.wpts){
          path(sl.wpts,zf+.6);
          const r=120*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),L=Math.abs(DW*dx)+Math.abs(DH*dy);
          pr(-dx*L/2,-dy*L/2,zf+.6,A); pr(dx*L/2,dy*L/2,zf+.6,B);
          const g=ctx.createLinearGradient(A[0],A[1],B[0],B[1]);
          g.addColorStop(0,rgb([30,0,4],fb,0)); g.addColorStop(1,rgb([30,0,4],fb,.72));
          ctx.fillStyle=g; ctx.fill();
        }
      }else if(camZ<zb){                             // back face
        path(sl.pts,zb); fillStroke(cssGrad(BACK.a,zb,BACK.cols,BACK.pos,bb));
      }
    }
  }

  const root=document.getElementById('bolt3d');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let vw=innerWidth,vh=innerHeight,docH=1;
  function measure(){vw=innerWidth;vh=innerHeight;docH=Math.max(1,document.documentElement.scrollHeight-vh)}
  addEventListener('resize',measure); addEventListener('load',measure); measure();
  if(window.ResizeObserver) new ResizeObserver(measure).observe(document.body);   // page height changes when search filters cards

  let mx=0,my=0;
  addEventListener('pointermove',e=>{mx=(e.clientX/vw-.5);my=(e.clientY/vh-.5)},{passive:true});

  const S={x:vw*.8,y:vh*.5,sc:.85,ry:-25,rx:12,rz:0};
  let lastY=scrollY,vel=0,idle=0,t0=performance.now();
  const lerp=(a,b,k)=>a+(b-a)*k;

  function frame(now){
    const dt=Math.min(.05,(now-t0)/1000); t0=now;
    const y=scrollY, p=Math.min(1,Math.max(0,y/docH));
    const dv=(y-lastY)/Math.max(dt,.001); lastY=y;
    vel=lerp(vel,Math.max(-3000,Math.min(3000,dv)),Math.min(1,dt*8));

    const hero=Math.min(1,y/520);
    const small=vw<700?.30:.46;
    const big=vw<700?.50:.85;
    const sc=lerp(big,small,hero*hero*(3-2*hero));

    const halfW=DW*sc/2, halfH=DH*sc/2;
    const amp=Math.max(0,vw/2-halfW-(vw<700?6:14));
    const th=p*Math.PI*4;
    const tx=vw/2+amp*Math.cos(th);
    const ty=vh*.5+Math.min(vh*.14,(vh/2-halfH-10))*Math.sin(th)+(reduce?0:Math.sin(now/900)*8);

    if(!reduce) idle+=dt*16;
    const tRy=(reduce?-20:p*1080+idle)+mx*22-25;
    const tRx=12+(reduce?0:-vel*.004)+my*-14;
    const tRz=reduce?0:Math.max(-14,Math.min(14,vel*.004));

    const k=reduce?1:Math.min(1,dt*6);
    S.x=lerp(S.x,tx,k); S.y=lerp(S.y,ty,k); S.sc=lerp(S.sc,sc,k);
    S.ry=lerp(S.ry,tRy,reduce?1:Math.min(1,dt*7)); S.rx=lerp(S.rx,tRx,k); S.rz=lerp(S.rz,tRz,k);

    root.style.transform='translate3d('+(S.x-DW/2).toFixed(1)+'px,'+(S.y-DH/2).toFixed(1)+'px,0) scale('+S.sc.toFixed(3)+')';
    draw(S.rx,S.ry,S.rz);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(t=>{t0=t;frame(t);root.classList.add('on')});
})();
