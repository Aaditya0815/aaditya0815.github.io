/* === PARTICLE CONSTELLATION — Canvas 2D === */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouse = {x: null, y: null};
  const PARTICLE_COUNT = 120;
  const CONNECT_DIST = 140;
  const ACCENT = {r:212,g:168,b:85};

  function resize(){
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor(){
      this.x = Math.random()*w;
      this.y = Math.random()*h;
      this.vx = (Math.random()-.5)*.35;
      this.vy = (Math.random()-.5)*.35;
      this.r = Math.random()*1.8+.5;
    }
    update(){
      this.x += this.vx;
      this.y += this.vy;
      if(this.x<0||this.x>w) this.vx*=-1;
      if(this.y<0||this.y>h) this.vy*=-1;
      if(mouse.x!==null){
        const dx=this.x-mouse.x, dy=this.y-mouse.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){
          const force=.015*(120-dist)/120;
          this.vx+=dx*force;
          this.vy+=dy*force;
        }
      }
      this.vx*=.99; this.vy*=.99;
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle=`rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.5)`;
      ctx.fill();
    }
  }

  for(let i=0;i<PARTICLE_COUNT;i++) particles.push(new Particle());

  canvas.addEventListener('mousemove', e=>{
    const rect=canvas.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;
    mouse.y=e.clientY-rect.top;
  });
  canvas.addEventListener('mouseleave', ()=>{mouse.x=null;mouse.y=null;});

  function animate(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<particles.length;i++){
      particles[i].update();
      particles[i].draw();
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x;
        const dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<CONNECT_DIST){
          const alpha=.12*(1-dist/CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle=`rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${alpha})`;
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* === TYPED TEXT === */
const phrases=['Robotics & AI Engineer','C++17 Systems Developer','Computer Vision · TensorRT','ROS2 · Jetson · ArduPilot','Building things that fly & think.'];
let phraseIdx=0, charIdx=0, deleting=false;
const typedEl=document.getElementById('typed-text');
function typeLoop(){
  const cur=phrases[phraseIdx];
  if(deleting){
    typedEl.textContent=cur.substring(0,charIdx--);
    if(charIdx<0){deleting=false;phraseIdx=(phraseIdx+1)%phrases.length;setTimeout(typeLoop,400);return;}
    setTimeout(typeLoop,35);
  } else {
    typedEl.textContent=cur.substring(0,charIdx++);
    if(charIdx>cur.length){deleting=true;setTimeout(typeLoop,2200);return;}
    setTimeout(typeLoop,60);
  }
}
setTimeout(typeLoop,800);

/* === SCROLL PROGRESS BAR === */
const progressBar=document.getElementById('scroll-progress');
window.addEventListener('scroll',()=>{
  const scrollTop=document.documentElement.scrollTop;
  const docHeight=document.documentElement.scrollHeight-document.documentElement.clientHeight;
  const pct=(scrollTop/docHeight)*100;
  if(progressBar) progressBar.style.width=pct+'%';
});

/* === NAVBAR === */
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>{
  navbar.style.background=window.scrollY>50?'rgba(10,13,18,0.95)':'rgba(10,13,18,0.75)';
});

/* === HAMBURGER === */
const hamburger=document.getElementById('hamburger');
const navLinks=document.querySelector('.nav-links');
hamburger.addEventListener('click',()=>navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l=>l.addEventListener('click',()=>navLinks.classList.remove('open')));

/* === SCROLL REVEAL WITH STAGGER === */
const revealObserver=new IntersectionObserver((entries)=>{
  entries.forEach((entry,i)=>{
    if(entry.isIntersecting){
      setTimeout(()=>entry.target.classList.add('visible'), i*80);
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:0.08, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.timeline-item,.flagship,.project-card,.achievement-card').forEach(el=>revealObserver.observe(el));

/* === COUNTER ANIMATION === */
function animateCounters(){
  document.querySelectorAll('[data-target]').forEach(el=>{
    const target=parseFloat(el.getAttribute('data-target'));
    const isFloat=String(target).includes('.');
    const duration=1200;
    const start=performance.now();
    function tick(now){
      const elapsed=now-start;
      const progress=Math.min(elapsed/duration,1);
      const eased=1-Math.pow(1-progress,3);
      const val=eased*target;
      el.textContent=isFloat?val.toFixed(2):Math.round(val);
      if(progress<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
const heroObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){animateCounters();heroObserver.unobserve(e.target);}});
},{threshold:0.5});
const telemetry=document.querySelector('.telemetry-strip');
if(telemetry) heroObserver.observe(telemetry);

/* === ACTIVE NAV HIGHLIGHT === */
const sections=document.querySelectorAll('section[id]');
const navItems=document.querySelectorAll('.nav-links a');
window.addEventListener('scroll',()=>{
  let current='';
  sections.forEach(s=>{if(window.scrollY>=s.offsetTop-100) current=s.getAttribute('id');});
  navItems.forEach(l=>{
    l.classList.remove('active');
    if(l.getAttribute('href')==='#'+current&&!l.classList.contains('nav-cta')) l.classList.add('active');
  });
});
