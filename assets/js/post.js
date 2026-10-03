// A blog post or note: draws the equations with KaTeX and turns footnotes into margin notes.
//   Equations: write $$ ... $$ in the text file (on its own line for a displayed equation, inside a sentence for an inline one).
//   Margin notes: write a footnote [^1] in the text file; on computers it appears beside the paragraph,
//   on phones the small number opens it under the paragraph.
(() => {
  const prose = document.getElementById('prose'); if (!prose) return;

  // ---------- equations ----------
  const opts = { throwOnError: false, delimiters: [
    { left: '$$', right: '$$', display: true }, { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false }, { left: '$', right: '$', display: false }] };
  function math() {
    if (!window.renderMathInElement) return false;
    // the site's Markdown converter writes inline equations as \( … \) and displayed ones as \[ … \] (or keeps $$ … $$); KaTeX draws them all
    renderMathInElement(prose, opts); return true;
  }

  // ---------- footnotes → margin notes ----------
  const refs = [...prose.querySelectorAll('sup a[href^="#fn"]')];
  let made = 0;
  refs.forEach((a, i) => {
    const li = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!li) return;
    const copy = li.cloneNode(true);
    copy.querySelectorAll('a[href^="#fnref"], a.reversefootnote, a.footnote-backref').forEach(x => x.remove());
    const html = [...copy.querySelectorAll('p')].map(p => p.innerHTML.trim()).join(' ') || copy.innerHTML.trim();
    const num = a.textContent.trim() || String(i + 1), id = 'sn' + (i + 1);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sn-ref'; btn.setAttribute('aria-controls', id); btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Margin note ' + num); btn.innerHTML = '<sup>' + num + '</sup>';
    const note = document.createElement('span');
    note.className = 'sn'; note.id = id; note.innerHTML = '<b>' + num + '</b>' + html;
    const sup = a.closest('sup'); sup.replaceWith(btn); btn.after(note); made++;
    btn.addEventListener('click', () => {
      if (getComputedStyle(note).float === 'none') { const o = !note.classList.contains('open'); note.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); }
      else { note.classList.add('flash'); setTimeout(() => note.classList.remove('flash'), 1200); }
    });
  });
  if (made && made === refs.length) prose.classList.add('has-sn');     // every footnote now sits in the margin: hide the list at the end

  // equations last, so the ones inside margin notes are drawn too
  if (!math()) addEventListener('load', math);
})();
