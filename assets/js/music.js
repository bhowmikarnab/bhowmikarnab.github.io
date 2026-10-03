// Background music: the speaker button in the header turns a very soft loop on and off.
// Music: "Indian Music" by MusicForPeople (Pixabay, track 491998), 0:36.67 → 1:00.67 = 24 s (8 bars at 80 BPM).
// assets/audio/bg-loop.mp3 already holds the finished loop: the 1.5 s crossfade is baked in, and 0.5 s of the loop's own end / start
// is added before / after it, so a browser's MP3 decoder delay (Chrome 27 ms, Windows 15 ms) can never cause a gap or a click.
// Browsers only allow sound after the visitor clicks or presses a key, so music never starts by itself on a first visit.
// If a visitor turned it on, the choice is remembered: on the next page it fades back in at their first click or key press.
(() => {
  const SRC = document.querySelector('script[src*="music.js"]').src.replace(/js\/music\.js.*$/, 'audio/bg-loop.mp3');
  const LOOP = { start: 0.5272, end: 24.5272 };   // 0.5 s padding + Chrome's 27.2 ms decoder delay; exactly 24 s long
  const TARGET_DB = -36;                            // very soft: average loudness after the volume change (user: "a little softer" than -32)
  const FADE_IN = 3, FADE_OUT = 1.2;
  const ICON = (window.AB && AB.ICON) || {};
  const btns = [...document.querySelectorAll('.snd')];
  let want = false, ctx = null, buf = null, gainTo = 1, cur = null, loading = null;
  try { want = localStorage.getItem('ab-sound') === 'on'; } catch (e) {}

  function icons() {
    btns.forEach(b => { b.innerHTML = want ? ICON.on : ICON.off; b.setAttribute('aria-label', want ? 'Turn background music off' : 'Turn background music on'); b.setAttribute('aria-pressed', want); });
  }
  function save() { try { localStorage.setItem('ab-sound', want ? 'on' : 'off'); } catch (e) {} }
  async function load() {
    if (buf) return buf;
    if (!loading) loading = (async () => {
      const data = await (await fetch(SRC)).arrayBuffer();
      const b = await ctx.decodeAudioData(data);
      let sum = 0, n = 0;                                // measure the loop's loudness so the volume lands on TARGET_DB
      const s0 = Math.round(LOOP.start * b.sampleRate), s1 = Math.round(LOOP.end * b.sampleRate);
      for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = s0; i < s1; i += 4) { sum += d[i] * d[i]; n++; } }
      gainTo = Math.pow(10, (TARGET_DB - 10 * Math.log10(sum / n)) / 20);
      buf = b; return b;
    })();
    return loading;
  }
  async function start() {
    if (cur) return;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      await load();
      if (!want || cur) return;
      const g = ctx.createGain(), s = ctx.createBufferSource(), t0 = ctx.currentTime + .05;
      s.buffer = buf; s.loop = true; s.loopStart = LOOP.start; s.loopEnd = LOOP.end;
      s.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gainTo, t0 + FADE_IN);
      s.start(t0, LOOP.start);
      cur = { stop(t) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + FADE_OUT); s.stop(t + FADE_OUT + .1); } };
    } catch (e) { want = false; icons(); save(); if (window.AB && AB.toast) AB.toast('The music could not be played on this device'); }
  }
  function stop() { if (cur && ctx) { cur.stop(ctx.currentTime); cur = null; } }

  btns.forEach(b => b.addEventListener('click', () => { want = !want; icons(); save(); if (want) start(); else stop(); }));
  // music was on on the previous page: fade it back in at the first click or key press (but not the click that turns it off)
  if (want) {
    const kick = e => {
      if (e.target && e.target.closest && e.target.closest('.snd')) return;
      ['pointerdown', 'keydown'].forEach(t => removeEventListener(t, kick, true));
      if (want) start();
    };
    ['pointerdown', 'keydown'].forEach(t => addEventListener(t, kick, true));
  }
  // be polite: pause while the tab is hidden, carry on when the visitor comes back
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (want) ctx.resume(); });
  icons();
})();
