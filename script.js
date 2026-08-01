/* === CUSTOM CURSOR === */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let followerX = mouseX;
let followerY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

// Smooth follower logic
gsap.ticker.add(() => {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
});

// Hover states for cursor
document.querySelectorAll('.hover-target').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
});

/* === THREE.JS POINT CLOUD === */
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050608, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Particle System
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3500;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

const colorBase = new THREE.Color('#d4a855');
const colorAlt = new THREE.Color('#ffffff');

for(let i = 0; i < particlesCount * 3; i+=3) {
  // Sphere distribution
  const r = 400 * Math.cbrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  
  posArray[i] = r * Math.sin(phi) * Math.cos(theta);
  posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
  posArray[i+2] = r * Math.cos(phi);

  const mixedColor = Math.random() > 0.8 ? colorAlt : colorBase;
  colorsArray[i] = mixedColor.r;
  colorsArray[i+1] = mixedColor.g;
  colorsArray[i+2] = mixedColor.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

// Custom Shader Material for glowing dots
const particlesMaterial = new THREE.PointsMaterial({
  size: 2.5,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction for 3D scene
let targetX = 0;
let targetY = 0;
window.addEventListener('mousemove', (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  
  // Slowly rotate the entire cloud
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

  // Camera parallax based on mouse
  camera.position.x += (targetX * 50 - camera.position.x) * 0.05;
  camera.position.y += (-targetY * 50 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();


/* === GSAP ANIMATIONS === */
gsap.registerPlugin(ScrollTrigger);

// Utility to split text into spans
function splitText(selector, type = 'chars') {
  document.querySelectorAll(selector).forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    const arr = type === 'words' ? text.split(' ') : text.split('');
    arr.forEach((char, i) => {
      if(char === ' ' && type === 'chars') {
        el.appendChild(document.createTextNode(' '));
        return;
      }
      const span = document.createElement('span');
      span.innerHTML = char;
      el.appendChild(span);
      if (type === 'words' && i < arr.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  });
}

// Split texts
splitText('.split-text', 'chars');
splitText('.split-word', 'words');

// Hero Reveal
const tl = gsap.timeline();
tl.fromTo('.hero-eyebrow span', {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.5})
  .fromTo('.hero-title span', {y: 100, opacity: 0}, {y: 0, opacity: 1, duration: 1, stagger: 0.04, ease: 'expo.out'}, "-=0.6")
  .fromTo('.hero-stats span', {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: 'power3.out'}, "-=0.8")
  .fromTo('.scroll-prompt', {opacity: 0}, {opacity: 1, duration: 1}, "-=0.5");

// Mission Text Scroll Reveal
gsap.fromTo('.mission .massive-text span', 
  { y: 150, opacity: 0 },
  {
    y: 0, opacity: 1, stagger: 0.05, duration: 1, ease: 'expo.out',
    scrollTrigger: {
      trigger: '.mission',
      start: 'top 60%',
    }
  }
);
gsap.fromTo('.mission-sub span', 
  { y: 20, opacity: 0 },
  {
    y: 0, opacity: 1, stagger: 0.01, duration: 0.5, ease: 'power2.out',
    scrollTrigger: { trigger: '.mission', start: 'top 40%' }
  }
);

// Horizontal Scroll for Experience
const expTrack = document.querySelector('.exp-track');
const expPanels = gsap.utils.toArray('.exp-panel');

gsap.to(expTrack, {
  x: () => -(expTrack.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".exp-sticky-container",
    pin: true,
    scrub: 0.5,
    start: "top top",
    end: () => "+=" + (expTrack.scrollWidth - window.innerWidth)
  }
});

// Projects Parallax
gsap.utils.toArray('.proj-card').forEach(card => {
  gsap.fromTo(card,
    { y: 100, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%' }
    }
  );
});

// Three.js Camera Scroll Effect
gsap.to(camera.position, {
  z: 100,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 1
  }
});
