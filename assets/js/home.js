// Home page: the grain animations behind the five chapters (atom → Andromeda-style galaxy → droplet crown splash →
// double-slit interference → Feynman diagram), the comet that opens the page, the research-card glow, and the
// "Recent works" list (the two newest papers from _data/publications.yml).
// Visitors whose device asks for reduced motion get a still picture.
(() => {
  const TAU = Math.PI * 2, rnd = Math.random;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const hash = n => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };
  const cl = x => x < 0 ? 0 : x > 1 ? 1 : x, ss = x => { x = cl(x); return x * x * (3 - 2 * x); }, sstep = (a, b, x) => ss((x - a) / (b - a));
  const lerp2 = (a, b, u, o) => { o[0] = a[0] + (b[0] - a[0]) * u; o[1] = a[1] + (b[1] - a[1]) * u; };
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const bg = $('#bg'), fg = $('#fg'), bx = bg.getContext('2d'), fx = fg.getContext('2d');
  const phw = $('#phw'), t1 = $('#t1'), hd = $('#hd'), hn = $('#hn');
  const secs = $$('main .ch'), texts = secs.map(s => s.querySelector('.in, .t1'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- recent works: the two newest papers from _data/publications.yml ----------
  const PUBS = window.PUBS || [], ME = 'Arnab Bhowmik';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const initials = name => { const w = name.trim().split(/\s+/); return w.length < 2 ? name.trim() : w.slice(0, -1).map(x => x[0] + '.').join(' ') + ' ' + w[w.length - 1]; };
  const NEWTAB = '<span class="vh"> (opens in a new tab)</span>';
  const wl = $('#works-list');
  if (wl) wl.innerHTML = PUBS.slice(0, 2).map((p, i) => {
    const authors = String(p.authors || '').split(',').map(a => a.trim()).filter(Boolean)
      .map(a => a === ME ? '<strong>' + esc(initials(a)) + '</strong>' : esc(initials(a))).join(', ');
    const venue = String(p.reference || p.type || '').replace(/\s*\(\d{4}\)\s*$/, '');
    const links = (p.arxiv ? `<a href="https://arxiv.org/abs/${esc(p.arxiv)}" target="_blank" rel="noopener">ARXIV ↗${NEWTAB}</a>` : '')
                + (p.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI ↗${NEWTAB}</a>` : '');
    const id = 'abs-' + (i + 1), abs = String(p.abstract || '').trim();
    return `<li class="wk-row"><span class="wk-no">${String(i + 1).padStart(2, '0')}</span><div class="wk-main"><h3>${esc(p.title)}</h3>`
         + `<p class="wk-meta">${authors} · ${esc(venue)} · ${esc(p.year)}</p><p class="wk-links">${links}`
         + (abs ? `<button class="wk-abt" type="button" aria-expanded="false" aria-controls="${id}">ABSTRACT <span class="pm" aria-hidden="true">+</span></button>` : '')
         + `</p></div>` + (abs ? `<div class="wk-abs" id="${id}" hidden><p>${esc(abs)}</p></div>` : '') + `</li>`;
  }).join('');

  // ---------- colours: grains use the text colour, and 20 % of them the accent colour, of the current theme ----------
  const PAL = { dark: { ink: '255,227,179', acc: '255,103,102', comp: 'lighter', glow: 'ink' }, light: { ink: '41,39,40', acc: '67,68,43', comp: 'multiply', glow: 'acc' } };
  const ACC_SHARE = 0.2;
  let TH = PAL[(window.AB && AB.theme && AB.theme()) || 'dark'];
  document.addEventListener('ab:theme', e => { TH = PAL[e.detail] || PAL.dark; need = true; });

  // ---------- geometry ----------
  let W = 0, H = 0, U = 1, narrow = false, ACX = 0, ACY = 0, RPU = 0.4, ROU = 0.4, HW = 1, HH = 1, PCX = 0, PCY = 0, GX = 0, GY = 0, GMAJ = 1, need = true;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    for (const [c, x] of [[bg, bx], [fg, fx]]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    U = Math.min(W, H) * 0.42; narrow = W <= 760; need = true;
  }
  const CR = { off: 0, sc: 1, oy: 0.675 }, FR = { sx: 1, sy: 1 }, FY = { off: 0, sx: 1, sy: 1 };
  const rgEl = $('.rgrid');
  function geometry() {
    const r = phw.getBoundingClientRect(); PCX = r.left + r.width / 2; PCY = r.top + r.height / 2;
    ACX = (PCX - W / 2) / U; ACY = (PCY - H / 2) / U; RPU = (phw.offsetWidth / 2) / U;
    HW = W / 2 / U; HH = H / 2 / U;                                            // half screen width / height in drawing units
    ROU = Math.max(RPU, (narrow ? 0.95 : 0.58) * W / U / 2.3);                    // orbits sweep across the whole page
    GX = narrow ? 0 : (W * 0.58 - W / 2) / U; GY = (H * (narrow ? 0.6 : 0.52) - H / 2) / U;
    GMAJ = (narrow ? W * 0.8 : W * 0.62) / U / 1.25;                              // galaxy disc runs past the screen edges
    CR.off = narrow ? 0 : 0.3 * HW; CR.sc = narrow ? 1.05 : 1.5;                  // ripples spread to the edges
    { const inEl = rgEl.offsetParent, gb = inEl.offsetTop + rgEl.offsetTop + rgEl.offsetHeight;   // layout offsets (unaffected by scaling): the splash lands in the free space below the research cards
      CR.oy = (gb + Math.max(60, H - gb) * 0.5 - H / 2) / U; }
    FR.sx = HW / 1.2; FR.sy = HH / 0.8;                                           // fringes fill the screen
    FY.off = narrow ? 0 : 0.22 * HW; FY.sx = HW * 1.3 / 1.25; FY.sy = HH * 0.85 / 0.95;   // particle lines enter and leave at the screen edges
  }

  // ---------- grains ----------
  const N = Math.round(Math.min(12000, Math.max(2500, innerWidth * innerHeight / 100)));   // grain count follows screen size (denser, byotone-style field)
  const gs = Array.from({ length: N }, (_, i) => ({ i, r1: rnd(), r2: rnd(), r3: rnd(), r4: rnd(), r5: rnd(), r6: rnd(), g1: gauss(), g2: gauss(), d: rnd(), ph1: rnd() * TAU, ph2: rnd() * TAU, c: rnd() < ACC_SHARE ? 1 : 0 }));
  gs.forEach(g => { g.q = (g.r1 - 0.12) / 0.88; });   // chapters 3-5: the first 12 % of grains form the drifting dust field, the rest keep their roles

  // ---------- shapes: o = [x, y (units from screen centre), alpha, front(1)/back(0), colour(0 ink / 1 accent)] ----------
  function starsF(g, t, o) { const s = Math.sin(t * (0.6 + g.r3) + g.ph1), u = (g.r5 + t * 0.005 * (0.4 + g.r3)) % 1;   // slow drift across the whole page
    o[0] = (u * 2 - 1) * HW; o[1] = (g.r6 * 2 - 1) * HH; o[2] = (g.r4 < 0.75 ? 0.04 + 0.11 * s * s : 0.2 + 0.45 * s * s) * ss((0.5 - Math.abs(u - 0.5)) * 12); o[3] = 0; o[4] = g.c; }
  const dusty = f => (g, t, o) => g.r1 < 0.12 ? starsF(g, t, o) : f(g, t, o);
  const ORB = [
    { a: 1.45, e: 0.0,  inc: 0.35, w: 0.0, tau: 0.25, sig: 0.042, dw: 0.0,   dt: 0.03 },
    { a: 1.75, e: 0.45, inc: 1.2,  w: 0.8, tau: 0.55, sig: 0.024, dw: 0.035, dt: 0.02 },
    { a: 1.9,  e: 0.3,  inc: 1.05, w: 2.4, tau: -0.9, sig: 0.028, dw: -0.03, dt: -0.025 },
    { a: 2.3,  e: 0.08, inc: 1.35, w: 0.0, tau: 1.75, sig: 0.019, dw: 0.0,   dt: 0.018 } ];
  ORB.forEach((o, k) => { o.nm = 1.6 / Math.pow(o.a, 1.5); o.M0 = k * 1.9; o.b = o.a * Math.sqrt(1 - o.e * o.e); });
  const kepler = (M, e) => { let E = M; for (let k = 0; k < 5; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; };
  const PP = [0, 0, 0];
  function proj(o, E, t) {
    const w = o.w + o.dw * t, tau = o.tau + o.dt * t, xo = o.a * (Math.cos(E) - o.e), yo = o.b * Math.sin(E);
    const x1 = xo * Math.cos(w) - yo * Math.sin(w), y1 = xo * Math.sin(w) + yo * Math.cos(w), z = y1 * Math.sin(o.inc), y2 = y1 * Math.cos(o.inc);
    PP[0] = ACX + ROU * (x1 * Math.cos(tau) - y2 * Math.sin(tau)); PP[1] = ACY + ROU * (x1 * Math.sin(tau) + y2 * Math.cos(tau)); PP[2] = z;
  }
  function atomF(g, t, o) {
    if (g.r1 < 0.12) { starsF(g, t, o); return; }
    if (g.r1 < 0.36) {
      const q = t * (0.35 + 0.3 * g.r5) + g.r6 * 4, ep = Math.floor(q), fr = q - ep, base = g.i * 3.17 + ep * 11.3;
      const r = RPU * (1 + (-Math.log(1 - 0.97 * hash(base))) * 0.32), th = hash(base + 1.7) * TAU;
      o[0] = ACX + r * Math.cos(th); o[1] = ACY + r * Math.sin(th) * 0.92; o[2] = 0.3 * Math.min(1, fr * 4) * (fr > 0.75 ? (1 - fr) / 0.25 : 1); o[3] = 0; o[4] = g.c; return;
    }
    const k = Math.floor(g.r2 * 4), orb = ORB[k];
    if (g.r1 < 0.93) {
      const E = g.r3 * TAU, M = E - orb.e * Math.sin(E); proj(orb, E, t);
      let lag = (orb.nm * t + orb.M0 - M) % TAU; if (lag < 0) lag += TAU;
      const front = PP[2] > 0 ? 1 : 0;
      o[0] = PP[0] + g.g1 * orb.sig * ROU * 0.8; o[1] = PP[1] + g.g2 * orb.sig * ROU * 0.8; o[2] = (0.2 + 0.7 * Math.exp(-lag * 1.5)) * (front ? 1 : 0.55); o[3] = front; o[4] = g.c; return;
    }
    proj(orb, kepler(orb.nm * t + orb.M0, orb.e), t); const front = PP[2] > 0 ? 1 : 0;
    o[0] = PP[0] + g.g1 * 0.012; o[1] = PP[1] + g.g2 * 0.012; o[2] = front ? 1 : 0.5; o[3] = front; o[4] = g.c;
  }
  // Andromeda-style galaxy; grain roles match atomF so the orbits can unwind into the arms
  function andromedaF(g, t, o) {
    if (g.r1 < 0.12) { starsF(g, t, o); return; }
    let x, y, a, bulge = false;
    if (g.r1 < 0.36) { x = g.g1 * 0.07; y = g.g2 * 0.07; a = 0.9; bulge = true; }
    else if (g.r1 < 0.93 && g.r4 < 0.3) { let r = (-Math.log(1 - 0.95 * g.r3)) * 0.35; if (r > 1.3) r = 1.3; const th = g.r2 * TAU; x = r * Math.cos(th); y = r * Math.sin(th); a = 0.15 + 0.25 * Math.exp(-r * 2); }
    else { const arm = Math.floor(g.r2 * 4) % 2, r = 0.08 + 1.17 * g.r3, th = arm * Math.PI + 4.0 * Math.log(r / 0.08), s = 0.02 + 0.03 * r;
      x = r * Math.cos(th) + g.g1 * s; y = r * Math.sin(th) + g.g2 * s; if (g.r1 >= 0.93) a = 0.95; else a = 0.35 + 0.5 * Math.exp(-r * 1.6); }
    const rot = t * 0.04, cr = Math.cos(rot), sr = Math.sin(rot), xr = x * cr - y * sr, yr = x * sr + y * cr, rr = Math.hypot(xr, yr);
    if (!bulge && rr > 0.42 && rr < 0.62 && yr > 0.05) a *= 0.18;            // dark dust lane on the near side
    const yi = bulge ? yr * 0.7 : yr * 0.36, ct = Math.cos(-0.45), st = Math.sin(-0.45);
    o[0] = GX + (xr * ct - yi * st) * GMAJ; o[1] = GY + (xr * st + yi * ct) * GMAJ; o[2] = a * (0.78 + 0.22 * Math.sin(1.1 * t + g.ph2)); o[3] = 0; o[4] = g.c;
  }
  function crownF(g, t, o) {
    const T = 4.2, fi = 0.8, surf = 0.45, gr = 3.2, f = t % T; let x = 0, y = surf, a = 0;
    if (g.q < 0.08) { if (f < fi) { const q = f / fi; x = g.g1 * 0.03; y = -1.1 + (surf + 1.1) * q * q + g.g2 * 0.045; a = 0.95; } }
    else if (g.q < 0.36) { const s = f - fi; if (s > 0 && s < 1.1) { const ang = (g.r2 * 2 - 1) * 0.95, v = 1.1 + 0.8 * g.r3;
        x = Math.sin(ang) * v * 0.77 * s + Math.sign(ang) * 0.12; y = surf - Math.cos(ang) * v * s + 0.5 * gr * s * s; if (y <= surf) a = (1 - s / 1.1) * 0.9; else y = surf; } }
    else if (g.q < 0.5) { const s = f - fi - 0.35; if (s > 0 && s < 0.95) { const hj = 0.6 * Math.sin(Math.PI * s / 0.95); x = g.g1 * 0.018 * (1 - g.r3); y = surf - hj * g.r3; a = 0.85; } }
    else if (g.q < 0.55) { const s = f - fi - 0.82; if (s > 0) { const yy = surf - 0.6 + 0.5 * gr * s * s; if (yy < surf) { x = g.g1 * 0.025; y = yy + g.g2 * 0.025; a = 0.95; } } }
    else { const kk = Math.floor(g.r3 * 5); let s = f - fi; if (s < 0) s += T; const R = Math.max(0, s - kk * 0.3) * 0.55, th = g.r2 * TAU;
      x = R * Math.cos(th) * 1.2 + g.g1 * 0.006; y = surf + R * Math.sin(th) * 0.38 + g.g2 * 0.004; a = R > 0 ? Math.pow(Math.max(0, 1 - R / 2.2), 1.3) * (0.35 + 0.65 * g.r4) : 0; }
    o[0] = CR.off + x * CR.sc; o[1] = CR.oy + (y - surf) * CR.sc; o[2] = a; o[3] = 0; o[4] = g.c;
  }
  function fringeF(g, t, o) {
    const q = t * 0.3 + g.r6 * 4, ep = Math.floor(q), fr = q - ep, base = g.i * 1.731 + ep * 9.137; let x = 0, ok = false;
    for (let k = 0; k < 12; k++) { x = (hash(base + k * 3.11) * 2 - 1) * 1.35; const c = Math.cos(Math.PI * x / 0.17), I = c * c * Math.exp(-(x / 0.75) * (x / 0.75)); if (hash(base + k * 5.73 + 0.5) < I) { ok = true; break; } }
    o[0] = x * 1.1 * FR.sx; o[1] = (hash(base + 77.7) * 2 - 1) * 0.85 * FR.sy;
    o[2] = (ok ? 1 : 0.12) * Math.min(1, fr * 5) * (fr > 0.8 ? (1 - fr) / 0.2 : 1) * (0.55 + 0.45 * g.r4); o[3] = 0; o[4] = g.c;
  }
  const V5 = [[0, -0.3], [0, 0.3]], IN5 = [[-1.25, -0.75], [-1.25, 0.75]], OUT5 = [[1.25, -0.95], [1.25, 0.95]];
  function feynF(g, t, o) {
    const f = t % 4.4, tin = 1.3, tph = 0.5, tout = 1.3, ta = tin, tb = tin + tph, tc = tb + tout, r = g.q; let a = 0;
    if (r < 0.2) { const kk = r < 0.1 ? 0 : 1; lerp2(IN5[kk], V5[kk], cl(f / tin), o); o[0] += g.g1 * 0.013; o[1] += g.g2 * 0.013; a = f < ta ? 1 : Math.max(0, 1 - (f - ta) / 0.15); }
    else if (r < 0.36) { const kk = r < 0.28 ? 0 : 1; lerp2(V5[kk], OUT5[kk], cl((f - tb) / tout), o); o[0] += g.g1 * 0.013; o[1] += g.g2 * 0.013; a = f < tb ? 0 : f < tc ? 1 : Math.max(0, 1 - (f - tc) / 0.3); }
    else if (r < 0.56) { const u = g.r3, passed = f - (ta + tph * u); o[0] = 0.06 * Math.sin(u * TAU * 3.5 - f * 10); o[1] = V5[0][1] + (V5[1][1] - V5[0][1]) * u; a = passed < 0 ? 0 : Math.exp(-passed / 0.6) * (0.6 + 0.4 * g.r4); }
    else if (r < 0.9) { const j = Math.floor(g.r2 * 4), u = g.r3; let tp; if (j < 2) { lerp2(IN5[j], V5[j], u, o); tp = tin * u; } else { lerp2(V5[j - 2], OUT5[j - 2], u, o); tp = tb + tout * u; } const passed = f - tp; a = 0.1 + (passed < 0 ? 0 : 0.5 * Math.exp(-passed / 0.9)); o[0] += g.g1 * 0.03; o[1] += g.g2 * 0.03; }   // lines stay faintly visible as wide beams
    else { const top = g.r2 < 0.5, P = top ? V5[0] : V5[1], s = f - (top ? ta : tb), R = Math.max(0, s) * 0.28 * (0.5 + 0.5 * g.r3), th = g.r5 * TAU; o[0] = P[0] + R * Math.cos(th); o[1] = P[1] + R * Math.sin(th); a = s < 0 || s > 0.4 ? 0 : 1 - s / 0.4; }
    o[0] = FY.off + o[0] * FY.sx; o[1] = o[1] * FY.sy; o[2] = a; o[3] = 0; o[4] = g.c;
  }
  const CH = [
    { f: atomF,      name: 'ATOM · NUCLEUS' },
    { f: andromedaF, name: 'UNIVERSE · ANDROMEDA-STYLE GALAXY' },
    { f: dusty(crownF),  name: 'DROPLET · CROWN SPLASH & RIPPLES' },
    { f: dusty(fringeF), name: 'QUANTUM · DOUBLE-SLIT INTERFERENCE' },
    { f: dusty(feynF),   name: 'FEYNMAN DIAGRAM · e⁻e⁻ → e⁻e⁻' } ];

  function swirl(A, cA, B, cB, b, O) {
    const ax = A[0] - cA[0], ay = A[1] - cA[1], bx_ = B[0] - cB[0], by_ = B[1] - cB[1];
    const rA = Math.hypot(ax, ay), pA = Math.atan2(ay, ax), rB = Math.hypot(bx_, by_), pB = Math.atan2(by_, bx_);
    const dp = ((pB - pA) % TAU + TAU) % TAU, r = rA + (rB - rA) * b, p = pA + dp * b;
    O[0] = cA[0] + (cB[0] - cA[0]) * b + r * Math.cos(p); O[1] = cA[1] + (cB[1] - cA[1]) * b + r * Math.sin(p);
  }

  // ---------- drawing ----------
  const CAP = N * 2, X = new Float32Array(CAP), Y = new Float32Array(CAP), AL = new Float32Array(CAP), CVI = new Uint8Array(CAP), COL = new Uint8Array(CAP);
  let cnt = 0;
  const push = (x, y, a, cvi, co) => { if (a <= 0.01) return; X[cnt] = x; Y[cnt] = y; AL[cnt] = a; CVI[cnt] = cvi; COL[cnt] = co; cnt++; };
  const GMAX = 0.78;   // brightest grain stays a little dimmer than the words
  function render() {
    const size = narrow ? 1.25 : 1.4;
    for (const cvi of [0, 1]) {
      const x = cvi ? fx : bx; x.globalCompositeOperation = TH.comp;
      for (const co of [0, 1]) { x.fillStyle = 'rgb(' + (co ? TH.acc : TH.ink) + ')';
        for (let i = 0; i < cnt; i++) { if (CVI[i] !== cvi || COL[i] !== co) continue;
          const px = W / 2 + X[i] * U, py = H / 2 + Y[i] * U, aa = Math.min(GMAX, AL[i]); if (aa <= 0.01) continue;
          x.globalAlpha = aa; x.fillRect(px, py, size, size); } }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    }
  }
  function glowAt(ctx, px, py, r, a) {
    if (a <= 0.01) return; const gr = ctx.createRadialGradient(px, py, 0, px, py, r);
    const gc = TH[TH.glow]; gr.addColorStop(0, 'rgba(' + gc + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + gc + ',0)'); ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
  // ---------- page opening: a comet streaks across the starry sky and strikes the nucleus ----------
  const tail = Array.from({ length: innerWidth <= 760 ? 500 : 900 }, () => ({ k: Math.pow(rnd(), 1.4), l: gauss(), ph: rnd() * TAU, sp: 0.5 + rnd(), c: rnd() < ACC_SHARE ? 1 : 0 }));
  const T_ARRIVE = 2.3, T_START = 0.5;
  function cometPos(tau, out) {
    const P0 = [-0.08 * W, 0.1 * H], P1 = [W * 0.45, H * 0.02], P2 = [PCX, PCY], u = 1 - tau;
    out[0] = u * u * P0[0] + 2 * u * tau * P1[0] + tau * tau * P2[0]; out[1] = u * u * P0[1] + 2 * u * tau * P1[1] + tau * tau * P2[1];
  }
  const CP = [0, 0], CQ = [0, 0];
  function drawComet(ot, t) {
    if (ot < T_START || ot > T_ARRIVE + 0.9) return;
    const s = cl((ot - T_START) / (T_ARRIVE - T_START)), tau = Math.pow(ss(s), 1.25), fade = ot > T_ARRIVE ? 0 : 1;
    fx.globalCompositeOperation = TH.comp;
    if (fade > 0) {
      for (const co of [0, 1]) { fx.fillStyle = 'rgb(' + (co ? TH.acc : TH.ink) + ')';
        for (const g of tail) { if (g.c !== co) continue;
          const tk = tau - g.k * 0.24; if (tk <= 0) continue; cometPos(tk, CP); cometPos(Math.min(1, tk + 0.01), CQ);
          const dx = CQ[0] - CP[0], dy = CQ[1] - CP[1], L = Math.hypot(dx, dy) || 1, spread = 1.5 + 26 * g.k;
          const a = Math.pow(1 - g.k, 1.6) * 0.9 * (0.7 + 0.3 * Math.sin(3 * g.sp * t + g.ph));
          fx.globalAlpha = a; fx.fillRect(CP[0] - dy / L * g.l * spread, CP[1] + dx / L * g.l * spread + g.k * 6, 1.4, 1.4); } }
      cometPos(tau, CP); fx.globalAlpha = 1; fx.globalCompositeOperation = 'source-over';
      fx.fillStyle = 'rgb(' + TH.ink + ')'; fx.beginPath(); fx.arc(CP[0], CP[1], 2.6, 0, TAU); fx.fill();
    }
    const fl = ot - T_ARRIVE;                                              // impact flash at the nucleus
    if (fl > 0 && fl < 0.9) { const k = ss(fl / 0.9); fx.globalAlpha = 0.5 * (1 - k); fx.strokeStyle = 'rgb(' + TH.ink + ')'; fx.lineWidth = 1; fx.beginPath(); fx.arc(PCX, PCY, 20 + 150 * k, 0, TAU); fx.stroke(); }   // crisp ring, no glow
    fx.globalAlpha = 1; fx.globalCompositeOperation = 'source-over';
  }

  // ---------- page state ----------
  let t = 0, last = null, pS = 0, openT = reduce ? 10 : 0, paused = reduce;   // no pause button (user decision); visitors whose device asks for reduced motion get a still picture
  const SPEED = 0.8;   // background animations run 20 % slower than first designed (user request 2026-09-29)
  const A = [0, 0, 0, 0, 0], B = [0, 0, 0, 0, 0], S = [0, 0, 0, 0, 0], O = [0, 0];
  const fadeF = [1, 1, 1, 1, 1];
  // scroll position → chapter progress (0 … 4) from each chapter's real top, so a chapter taller than one screen (About) keeps its animation in step
  function chapterAt(y) {
    let i = 0; while (i < secs.length - 1 && y >= secs[i + 1].offsetTop) i++;
    const top = secs[i].offsetTop, next = i < secs.length - 1 ? secs[i + 1].offsetTop : top + H;
    return Math.min(secs.length - 1, i + Math.max(0, (y - top) / Math.max(1, next - top)));
  }
  function fadeText() {
    const mid = H / 2;
    secs.forEach((s, i) => { const r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid) / H; fadeF[i] = cl(1.35 - 1.7 * d); if (i) texts[i].style.opacity = fadeF[i].toFixed(3); });
  }
  function frame() {
    geometry(); fadeText();
    const sky = ss(openT / 0.8), qo = cl((openT - T_ARRIVE) / 2.5), pin = ss((openT - T_ARRIVE) / 0.9);
    phw.style.opacity = (pin * fadeF[0]).toFixed(3); phw.style.transform = 'scale(' + (0.85 + 0.15 * pin).toFixed(3) + ')';
    t1.style.opacity = (ss((openT - 3.0) / 1.0) * fadeF[0]).toFixed(3);
    bx.clearRect(0, 0, W, H); fx.clearRect(0, 0, W, H); cnt = 0;
    if (!Number.isFinite(pS)) pS = 0;
    const a = Math.max(0, Math.min(4, Math.floor(pS))), prog = Math.max(0, Math.min(1, pS - a));
    if (a === 0) {
      const pu = sstep(0.15, 0.85, prog);
      for (const g of gs) {
        atomF(g, t, A);
        if (g.r1 < 0.12) A[2] *= sky;
        else if (qo < 1) { starsF(g, t, S); S[2] *= sky; const b = ss(qo * 1.5 - g.d * 0.5);
          if (b <= 0) { A[0] = S[0]; A[1] = S[1]; A[2] = S[2]; A[3] = 0; A[4] = S[4]; }
          else { swirl(S, [0, 0], A, [ACX, ACY], b, O); A[0] = O[0]; A[1] = O[1]; A[2] = S[2] + (A[2] - S[2]) * b; if (b < 0.6) A[3] = 0; if (b < 0.5) A[4] = S[4]; } }
        if (pu > 0.001 && g.r1 >= 0.12) {
          andromedaF(g, t, B); const u = g.r1 < 0.36 ? 0.1 : g.r3, b = ss(pu * 1.6 - u * 0.6);
          swirl(A, [ACX, ACY], B, [GX, GY], b, O);
          push(O[0], O[1], A[2] + (B[2] - A[2]) * b, b > 0.5 ? 0 : A[3], A[4]);
        } else push(A[0], A[1], A[2], A[3], A[4]);
      }
      render();
    } else {
      // between chapters every grain flows from its place in one picture to its place in the next (staggered, with a little mid-flight drift)
      const b4 = Math.min(4, a + 1), Af = CH[a].f, Bf = CH[b4].f, moving = b4 !== a && prog > 0.001, x = moving ? sstep(0.1, 0.9, prog) : 0;
      for (const g of gs) {
        Af(g, t, A);
        if (!moving) { push(A[0], A[1], A[2], 0, A[4]); continue; }
        Bf(g, t, B); const b = ss(x * 1.6 - g.d * 0.6), w = Math.sin(Math.PI * b) * 0.16;
        push(A[0] + (B[0] - A[0]) * b + g.g1 * w, A[1] + (B[1] - A[1]) * b + g.g2 * w, A[2] + (B[2] - A[2]) * b, 0, A[4]);
      }
      render();
    }
    drawComet(openT, t);
    const past = pS > 0.7; hn.classList.toggle('on', past); hd.classList.toggle('solid', past);
  }

  // ---------- controls ----------
  // ABOUT / RESEARCH / CONTACT in the menu scroll smoothly to their chapter
  $$('[data-go]').forEach(a => a.addEventListener('click', e => {
    const el = document.getElementById(a.dataset.go); if (!el) return;
    e.preventDefault(); if (window.AB && AB.closeMenus) AB.closeMenus();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', '#' + a.dataset.go);
  }));
  $('#lg').addEventListener('click', () => { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); history.replaceState(null, '', location.pathname); });
  // research cards: the glow follows the cursor; its hue is anchored at each card's centre (blue, green, yellow, red) and blends in between
  const HUES = [[0.125, 215], [0.375, 130], [0.625, 52], [0.875, 0]];
  const hueAt = u => { u = cl(u); if (u <= HUES[0][0]) return HUES[0][1];
    for (let i = 1; i < HUES.length; i++) if (u <= HUES[i][0]) { const [a, ha] = HUES[i - 1], [b, hb] = HUES[i]; return ha + (hb - ha) * (u - a) / (b - a); }
    return HUES[HUES.length - 1][1]; };
  const rgrid = $('.rgrid'), rcs = $$('.rc');
  rcs.forEach((c, i) => {
    c.style.setProperty('--gh', hueAt((i + 0.5) / rcs.length).toFixed(0));
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), g = rgrid.getBoundingClientRect(), k = r.width / c.offsetWidth || 1;
      c.style.setProperty('--mx', ((e.clientX - r.left) / k).toFixed(0) + 'px'); c.style.setProperty('--my', ((e.clientY - r.top) / k).toFixed(0) + 'px');
      c.style.setProperty('--gh', hueAt((e.clientX - g.left + rgrid.scrollLeft * k) / (rgrid.scrollWidth * k)).toFixed(0));
    });
  });
  // recent works: ABSTRACT +/− opens the paper's abstract under its row
  $$('.wk-abt').forEach(b => b.addEventListener('click', () => {
    const o = b.getAttribute('aria-expanded') !== 'true', panel = document.getElementById(b.getAttribute('aria-controls'));
    b.setAttribute('aria-expanded', o); panel.hidden = !o; b.querySelector('.pm').textContent = o ? '−' : '+'; need = true;
  }));

  addEventListener('resize', size);
  function loop(ts) {
    if (last === null) last = ts; const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    const target = H > 0 ? chapterAt(scrollY) : pS, moving = Math.abs(target - pS) > 0.0005;   // clamp: overscroll bounce / zero-height window
    pS += (target - pS) * Math.min(1, dt * 4);   // grains glide after the scroll
    if (!paused && !document.hidden) { t += dt * SPEED; openT += dt; }
    if (W && (!paused || moving || need || openT < 5)) { frame(); need = false; }
    requestAnimationFrame(loop);
  }
  size();
  if (location.hash.length > 1 && document.getElementById(location.hash.slice(1))) { openT = 10; }   // arriving at #about etc. from another page: skip the opening
  requestAnimationFrame(loop);
})();
