'use strict';
const $  = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => [...r.querySelectorAll(s)];

/* ── 1. Navbar ── */
(()=>{
  const nav = $('#navbar');
  const fn  = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', fn, {passive:true});
  fn();
})();

/* ── 2. Scroll reveal (.reveal) ── */
(()=>{
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, {threshold:.1, rootMargin:'0px 0px -36px 0px'});
  $$('.reveal').forEach(el => obs.observe(el));
})();

/* ── 3. Hero fade-ups (.fade-up) — fire on load ── */
(()=>{
  requestAnimationFrame(()=> setTimeout(()=> $$('.fade-up').forEach(el=>el.classList.add('go')), 60));
})();

/* ── 4. Slideshow ── */
(()=>{
  const slides  = $$('.slide');
  const dots    = $$('.dot');
  const bar     = $('#slideBar');
  const cur     = $('.sc-cur');
  const DUR     = 5000;
  if(!slides.length) return;

  let idx=0, busy=false, timer=null;
  const fmt = n => String(n+1).padStart(2,'0');

  function runBar(){
    if(!bar) return;
    bar.style.transition='none'; bar.style.width='0%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      bar.style.transition=`width ${DUR}ms linear`; bar.style.width='100%';
    }));
  }

  function go(next){
    if(busy||next===idx) return;
    busy=true;
    const prev=idx; idx=next;
    if(cur){ cur.style.opacity='0'; setTimeout(()=>{ cur.textContent=fmt(idx); cur.style.opacity='1'; },200); }
    dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
    slides[prev].classList.add('leaving');
    slides[prev].classList.remove('active');
    slides[idx].classList.add('entering');
    setTimeout(()=>{
      slides[prev].classList.remove('leaving');
      slides[idx].classList.remove('entering');
      slides[idx].classList.add('active');
      busy=false;
    }, 1000);
    runBar();
  }

  const next=()=>go((idx+1)%slides.length);
  const startAuto=()=>{ clearInterval(timer); timer=setInterval(next,DUR); };

  dots.forEach((d,i)=>d.addEventListener('click',()=>{ clearInterval(timer); go(i); startAuto(); }));

  const ss=$('.slideshow');
  if(ss){
    let tx=0;
    ss.addEventListener('touchstart',e=>{ tx=e.changedTouches[0].clientX; },{passive:true});
    ss.addEventListener('touchend',e=>{
      const dx=e.changedTouches[0].clientX-tx;
      if(Math.abs(dx)>48){ clearInterval(timer); go(dx<0?(idx+1)%slides.length:(idx-1+slides.length)%slides.length); startAuto(); }
    },{passive:true});
    ss.addEventListener('mouseenter',()=>clearInterval(timer));
    ss.addEventListener('mouseleave',startAuto);
  }

  slides[0].classList.add('active');
  if(cur) cur.textContent=fmt(0);
  runBar(); startAuto();
})();

/* ── 5. Parallax ── */
(()=>{
  const targets=$$('[data-parallax]');
  if(!targets.length) return;
  let tick=false;
  function apply(){
    const vh=innerHeight;
    targets.forEach(el=>{
      const r=el.getBoundingClientRect(), speed=parseFloat(el.dataset.parallax)||.1;
      if(r.bottom<-vh||r.top>vh*2) return;
      const offset=(r.top+r.height/2-vh/2)*speed*-1;
      const img=el.querySelector('img,.mf-img');
      if(img) img.style.transform=`translateY(${offset}px)`;
    });
  }
  addEventListener('scroll',()=>{ if(!tick){ requestAnimationFrame(()=>{ apply(); tick=false; }); tick=true; } },{passive:true});
  apply();
})();

/* ── 6. Smooth anchors ── */
(()=>{
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]'); if(!a) return;
    const t=$(a.getAttribute('href')); if(!t) return;
    e.preventDefault();
    const nh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||76;
    scrollTo({top:t.getBoundingClientRect().top+scrollY-nh, behavior:'smooth'});
  });
})();

/* ── 7. Card 3-D tilt ── */
(()=>{
  $$('.cg-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/r.width;
      const dy=(e.clientY-r.top-r.height/2)/r.height;
      card.style.transform=`perspective(800px) rotateX(${dy*-3}deg) rotateY(${dx*3}deg) translateZ(4px)`;
      card.style.transition='transform .1s linear';
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform=''; card.style.transition='transform .55s cubic-bezier(.16,1,.3,1)';
    });
  });
})();

/* ── 8. Footer wordmark ── */
(()=>{
  const wm=$('.ft-wm'); if(!wm) return;
  new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting) wm.classList.add('lit'); }); },{threshold:.3}).observe(wm);
})();

/* ── 9. Newsletter ── */
(()=>{
  const btn=$('.nl-btn'), inp=$('.nl-input'); if(!btn||!inp) return;
  btn.addEventListener('click',()=>{
    if(!inp.value.trim().includes('@')){ inp.style.borderColor='#7A1E2C'; inp.focus(); setTimeout(()=>inp.style.borderColor='',1400); return; }
    btn.textContent='✓'; btn.style.background='#2a6e3f';
    inp.value=''; inp.placeholder="You're on the list.";
    setTimeout(()=>{ btn.textContent='→'; btn.style.background=''; inp.placeholder='Your email'; },3200);
  });
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') btn.click(); });
})();

/* ── 10. Contact form ── */
(()=>{
  const form=$('.ct-form'), btn=form?form.querySelector('.f-submit'):null; if(!form||!btn) return;
  form.addEventListener('submit',e=>{
    e.preventDefault();
    btn.textContent='Sending…'; btn.style.opacity='.7';
    setTimeout(()=>{
      btn.textContent='Message Sent ✓'; btn.style.background='#2a6e3f'; btn.style.opacity='1';
      form.querySelectorAll('input,textarea,select').forEach(el=>el.value='');
      setTimeout(()=>{ btn.textContent='Send Message'; btn.style.background=''; },3500);
    },1200);
  });
})();

/* ── 11. Atelier steps stagger ── */
(()=>{
  const steps=$$('.step');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){ setTimeout(()=>{ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; },i*80); obs.unobserve(e.target); }
    });
  },{threshold:.2});
  steps.forEach(s=>{ s.style.cssText='opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)'; obs.observe(s); });
})();
