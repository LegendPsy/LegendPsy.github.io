/* Основной сайт: общее поведение для всех страниц. */
(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
window.SITE = { RM, FINE };

/* ---------- память ---------- */
const store = {
  get(k, d){ try { const v = localStorage.getItem('ad.' + k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem('ad.' + k, JSON.stringify(v)); } catch(e){} }
};
window.SITE.store = store;

/* ---------- меню ---------- */
const mb = document.querySelector('.menu-btn');
if (mb){
  mb.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    mb.setAttribute('aria-expanded', open);
  });
  $$('.menu a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open'); mb.setAttribute('aria-expanded', false);
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('menu-open'); });
}

/* ---------- раскрывашки ---------- */
$$('.acc__btn').forEach(b => {
  b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', () => {
    const it = b.closest('.acc__item');
    const open = it.classList.toggle('open');
    b.setAttribute('aria-expanded', open);
  });
});

/* ---------- кнопки: один отклик для всех ---------- */
const TAP = '.pill, .menu-btn, .acc__btn, .phrase, .toc a, .viewer .x, .viewer .nav';
function tap(p){
  if (p.dataset.tap) return; p.dataset.tap = 1; p.classList.add('tap');
  const down = e => {
    p.classList.add('is-press');
    if (RM) return;
    const r = p.getBoundingClientRect();
    const x = (e.clientX ?? r.left + r.width / 2) - r.left, y = (e.clientY ?? r.top + r.height / 2) - r.top;
    const s = Math.max(r.width, r.height) * 2.2;
    const d = document.createElement('span');
    d.className = 'ripple';
    d.style.cssText = `width:${s}px;height:${s}px;left:${x - s / 2}px;top:${y - s / 2}px`;
    p.appendChild(d); setTimeout(() => d.remove(), 650);
    if (navigator.vibrate && e.pointerType === 'touch') try { navigator.vibrate(8); } catch(_){}
  };
  const up = () => setTimeout(() => p.classList.remove('is-press'), 90);
  p.addEventListener('pointerdown', down);
  p.addEventListener('pointerup', up); p.addEventListener('pointerleave', up); p.addEventListener('pointercancel', up);
}
$$(TAP).forEach(tap);
window.SITE.tap = tap;

/* ---------- появление при прокрутке ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
$$('.rise').forEach(el => io.observe(el));

/* ---------- линии «от руки» ---------- */
function rnd(seed){ let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const shapes = {
  loop(r){ // двойная петля-лассо вокруг фото
    let d = '', pts = [];
    for (let t = 0; t <= 1.92; t += .04){
      const a = t * Math.PI * 2 - .6, k = 1 + (r() - .5) * .05 + t * .035;
      pts.push([50 + Math.cos(a) * 46 * k, 50 + Math.sin(a) * 44 * k]);
    }
    return smooth(pts);
  },
  hex(r){ // шестиугольник ACT, обведённый дважды
    const pts = [];
    for (let lap = 0; lap < 2; lap++) for (let i = 0; i <= 6; i++){
      if (lap === 1 && i === 0) continue;
      const a = Math.PI / 3 * i - Math.PI / 2 + lap * .05, k = 1 + (r() - .5) * .06 + lap * .04;
      pts.push([50 + Math.cos(a) * 47 * k, 50 + Math.sin(a) * 47 * k]);
    }
    return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  },
  star(r){ // звезда-вспышка, как у образца
    const pts = [], n = 8;
    for (let i = 0; i <= n * 2; i++){
      const a = Math.PI / n * i - Math.PI / 2, rr = (i % 2 ? 30 : 50) * (1 + (r() - .5) * .1);
      pts.push([50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr]);
    }
    return smooth(pts, .35);
  },
  wave(r){ // дыхание: волна
    const pts = [];
    for (let x = 0; x <= 100; x += 5) pts.push([x, 50 + Math.sin(x / 100 * Math.PI * 3) * 26 * (1 + (r() - .5) * .2)]);
    return smooth(pts);
  },
  flower(r){ // цветок-петли
    const pts = [];
    for (let t = 0; t <= 1.001; t += .01){
      const a = t * Math.PI * 2, rr = 22 + 26 * Math.abs(Math.sin(a * 2.5)) * (1 + (r() - .5) * .04);
      pts.push([50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr]);
    }
    return smooth(pts);
  }
};
function smooth(p, ten = .5){
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++){
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) * ten / 3, p1[1] + (p2[1] - p0[1]) * ten / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * ten / 3, p2[1] - (p3[1] - p1[1]) * ten / 3];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const draws = [];
$$('[data-draw]').forEach((el, i) => {
  const kind = el.dataset.draw, seed = +el.dataset.seed || (i + 3);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'draw'); svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', shapes[kind](rnd(seed))); path.setAttribute('pathLength', '1');
  path.style.strokeDasharray = '1 1';
  path.style.strokeDashoffset = RM ? '0' : '1';
  svg.appendChild(path);
  if (el.dataset.drawClass) svg.classList.add(...el.dataset.drawClass.split(' '));
  el.appendChild(svg);
  draws.push({ el, path, p: RM ? 1 : 0 });
});

/* ---------- фото: замечают палец и курсор ---------- */
const photos = $$('.photo img');
let mx = 0, my = 0;
if (FINE && !RM) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

/* ---------- часы, которые растут сами ----------
   data-grow="база,дата,дней на 1 час": от даты письма прибавляем по часу */
const grown = v => { const [b, d, per] = v.split(','); return +b + Math.max(0, Math.floor((Date.now() - new Date(d + 'T00:00:00')) / 864e5 / +per)); };
const hoursWord = n => { const a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? 'час' : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? 'часа' : 'часов'; };
$$('[data-grow]').forEach(el => { const n = grown(el.dataset.grow); if (el.hasAttribute('data-count')) el.dataset.count = n; el.textContent = n.toLocaleString('ru-RU'); });
$$('[data-unit]').forEach(el => { el.textContent = hoursWord(grown(el.dataset.unit)); });

/* ---------- счётчики ---------- */
const counters = $$('[data-count]');
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = RM ? 1 : 1400;
  const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
    el.textContent = v.toLocaleString('ru-RU'); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}), { threshold: .6 });
counters.forEach(c => cio.observe(c));

/* ---------- один цикл кадров на всё ---------- */
let vh = innerHeight; addEventListener('resize', () => vh = innerHeight);
function frame(){
  if (!document.hidden){
    for (const d of draws){
      const r = d.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const target = RM ? 1 : Math.max(0, Math.min(1, (vh - r.top) / (vh * .75 + r.height * .35)));
      d.p += (Math.max(d.p, target) - d.p) * .07; // рисуется и не стирается обратно
      d.path.style.strokeDashoffset = (1 - d.p).toFixed(4);
    }
    if (!RM) for (const im of photos){
      const r = im.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const c = (r.top + r.height / 2) / vh - .5;
      im.style.transform = `translate3d(${(mx * -10).toFixed(1)}px, ${(c * -18 + my * -8).toFixed(1)}px, 0)`;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
