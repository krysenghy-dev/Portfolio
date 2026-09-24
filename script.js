document.getElementById('year').textContent = new Date().getFullYear();

// respect reduced motion
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// mouse-following spotlight (desktop only)
const spotlight = document.getElementById('spotlight');
if (!reduceMotion && matchMedia('(hover:hover)').matches) {
  addEventListener('mousemove', (e) => {
    spotlight.style.setProperty('--mx', e.clientX + 'px');
    spotlight.style.setProperty('--my', e.clientY + 'px');
    spotlight.classList.add('active');
  }, {passive:true});
  addEventListener('mouseleave', () => spotlight.classList.remove('active'));
}

// floating particles
if (!reduceMotion) {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  function init(){
    resize();
    const count = Math.min(60, Math.floor((w*h)/28000));
    particles = Array.from({length:count}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.6+0.6,
      vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15,
      a: Math.random()*0.5+0.15
    }));
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(232,166,72,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  init();
  addEventListener('resize', init, {passive:true});
  requestAnimationFrame(tick);
}

// header scroll state
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20), {passive:true});

// mobile menu
const menuBtn = document.getElementById('menuBtn'), mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

// active nav link on scroll
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, {rootMargin:'-45% 0px -50% 0px'});
sections.forEach(s => navObserver.observe(s));

// scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// animated stat counters
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('b[data-count]').forEach(b => {
      const target = +b.dataset.count, dur = 900, start = performance.now();
      function tick(now){
        const p = Math.min((now-start)/dur, 1);
        b.textContent = Math.round(target * (1 - Math.pow(1-p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    statObserver.unobserve(e.target);
  });
}, {threshold:.4});
document.querySelectorAll('.stats').forEach(el => statObserver.observe(el));

// project filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
    });
  });
});

// contact form — Formspree
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formNote = document.getElementById('formNote');
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maenjrar'; // <-- replace YOUR_FORM_ID with your real Formspree form ID

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  formNote.style.color = 'var(--text-dim)';

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });
    if (res.ok) {
      form.reset();
      formNote.textContent = "Message sent — thanks! I'll get back to you soon.";
      formNote.style.color = 'var(--accent)';
    } else {
      throw new Error('Formspree error');
    }
  } catch (err) {
    formNote.textContent = "Something went wrong sending that. Please reach out via Telegram, Facebook, or GitHub above instead.";
    formNote.style.color = '#e07a5f';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});