// 404 page ("This page drifted out of orbit."): the Milky Way with a drifting shooting star, in the site's grain style.
(() => {
  const TAU = Math.PI * 2, rnd = Math.random;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAL = { dark: { ink: '255,227,179', acc: '255,103,102', comp: 'lighter', glow: 'ink' }, light: { ink: '41,39,40', acc: '67,68,43', comp: 'multiply', glow: 'acc' } };
  const ACC_SHARE = 0.2;
  let TH = PAL[(window.AB && AB.theme && AB.theme()) || 'dark'], W = 0, H = 0;
  document.addEventListener('ab:theme', e => { TH = PAL[e.detail] || PAL.dark; });
  const p404 = $('#p404'), c404 = $('#c404'), x404 = c404.getContext('2d'), trail = [];
  let mw = [];
  function size404() {
    const dpr = Math.min(devicePixelRatio || 1, 2); c404.width = Math.round(W * dpr); c404.height = Math.round(H * dpr); x404.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(9000, Math.max(3000, W * H / 100)));          // enough grains for the band to read at any screen size
    if (Math.abs(mw.length - n) > 500) mw = Array.from({ length: n }, () => ({ r1: rnd(), r2: rnd(), r3: rnd(), r4: rnd(), r5: rnd(), g1: gauss(), ph: rnd() * TAU, sp: 0.5 + rnd(), c: rnd() < ACC_SHARE ? 1 : 0 }));
  }
  function draw404(t) {
    const c = x404; c.clearRect(0, 0, W, H); c.globalCompositeOperation = TH.comp;
    const ang = -0.42 + 0.015 * Math.sin(t * 0.05), ca = Math.cos(ang), sa = Math.sin(ang), L = Math.hypot(W, H) / 2;
    for (const co of [0, 1]) { c.fillStyle = 'rgb(' + (co ? TH.acc : TH.ink) + ')';
      for (const g of mw) {
        if (g.r1 < 0.16) { if (g.c !== co) continue; const bright = g.r4 > 0.93; const s = Math.sin(t * (0.5 + g.r3) + g.ph);
          c.globalAlpha = (bright ? 0.35 + 0.55 * s * s : 0.06 + 0.16 * s * s) * 0.85; c.fillRect(g.r2 * W, g.r5 * H, bright ? 1.7 : 1.1, bright ? 1.7 : 1.1); continue; }
        if (g.c !== co) continue;
        const s = (g.r2 * 2 - 1) * 1.15, sig = 0.1 + 0.13 * Math.exp(-(s - 0.15) * (s - 0.15) / 0.12), n = g.g1 * sig;
        let a = (0.22 + 0.5 * Math.exp(-0.5 * (n / sig) * (n / sig))) * (0.75 + 0.35 * Math.exp(-(s - 0.15) * (s - 0.15) / 0.08));
        const lane = n - 0.035 * Math.sin(2.4 * s + 0.6), wd = 0.03 + 0.022 * Math.exp(-(s - 0.15) * (s - 0.15) / 0.1);
        if (Math.abs(lane) < wd && Math.abs(s) < 0.95) a *= 0.12;
        const x = s * L, y = n * L * 0.8; c.globalAlpha = Math.min(1, a * 1.05 * (0.72 + 0.28 * Math.sin(1.3 * g.sp * t + g.ph))); c.fillRect(W / 2 + x * ca - y * sa, H / 2 + 20 + x * sa + y * ca, 1.3, 1.3);
      } }
    const u = (t * 0.035) % 1.3 - 0.15, ex = W * u, ey = H * (0.3 + 0.1 * Math.sin(u * 5));
    trail.push([ex, ey]); if (trail.length > 50) trail.shift();
    c.fillStyle = 'rgb(' + TH[TH.glow] + ')'; trail.forEach(([x, y], i) => { c.globalAlpha = (i / trail.length) * 0.5; c.fillRect(x, y, 1.5, 1.5); });
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgb(' + TH[TH.glow] + ')'; c.beginPath(); c.arc(ex, ey, 2.4, 0, TAU); c.fill();
  }
  function resize() { W = innerWidth; H = innerHeight; size404(); }
  addEventListener('resize', resize); resize();
  let t = 0, last = null;
  function loop(ts) {
    if (last === null) last = ts; const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (!document.hidden) { t += dt * 0.8; draw404(t); }
    if (!reduce) requestAnimationFrame(loop);
  }
  if (reduce) { t = 20; draw404(t); } else requestAnimationFrame(loop);
})();
