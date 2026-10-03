// Publications page: builds the year groups and papers from _data/publications.yml (put on the page as window.PUBS),
// numbers them from the newest (01) down, and runs the CITE panel with its Copy BibTeX button.
(() => {
  const PUBS = window.PUBS || [], ME = 'Arnab Bhowmik';
  const $ = s => document.querySelector(s);
  const NEWTAB = '<span class="vh"> (opens in a new tab)</span>';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pad = n => String(n).padStart(2, '0');

  $('#tally').textContent = `${PUBS.length} ${PUBS.length === 1 ? 'work' : 'works'} · Updated ${window.PUB_UPDATED || ''}`;
  if (!PUBS.length) { $('#groups').innerHTML = '<p class="empty">Papers will appear here.</p>'; return; }
  const years = [...new Set(PUBS.map(p => String(p.year)))];
  let n = 0;
  $('#groups').innerHTML = years.map(ys => {
    const papers = PUBS.filter(p => String(p.year) === ys).map(p => {
      n++; const id = 'cite' + n;
      const doi = p.doi ? 'https://doi.org/' + p.doi : '';
      const links = [];
      if (p.doi) links.push(['DOI', doi]);
      if (p.arxiv) links.push(['ARXIV', 'https://arxiv.org/abs/' + p.arxiv]);
      if (p.url) links.push(['LINK', p.url]);
      const authors = String(p.authors || '').split(',').map(a => a.trim()).filter(Boolean)
        .map(a => a === ME ? '<strong>' + esc(a) + '</strong>' : esc(a)).join(', ');
      const title = doi ? `<a href="${esc(doi)}" target="_blank" rel="noopener">${esc(p.title)}${NEWTAB}</a>` : esc(p.title);
      const abs = String(p.abstract || '').trim(), bib = String(p.bibtex || '').trim();
      return `<article class="paper">
        <div class="op"><div class="big"><span class="n">${pad(n)}</span><span class="bar" aria-hidden="true"></span><span class="lbl">${esc(p.type)}</span></div>
          <h3 class="t">${title}</h3><div class="rr" aria-hidden="true"></div><p class="au">${authors}</p></div>
        <div class="ab"><p class="rh"><span>Abstract</span><span>${esc(p.reference)}</span></p>${abs ? `<p class="abs">${esc(abs)}</p>` : ''}
          <p class="act">${links.map(l => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${l[0]} ↗${NEWTAB}</a>`).join('')}${bib ? `<button class="tg" type="button" aria-expanded="false" aria-controls="${id}">CITE <span class="pm" aria-hidden="true">+</span></button>` : ''}</p>
          ${bib ? `<div class="panel" id="${id}" hidden><pre>${esc(bib)}</pre><button class="copy" type="button">Copy BibTeX</button></div>` : ''}</div>
      </article>`;
    }).join('');
    return `<section class="yg" aria-label="${ys}"><h2 class="yr"><span class="vh">${ys}</span><span class="o" aria-hidden="true">${ys.slice(0, 2)}</span><span class="s" aria-hidden="true">${ys.slice(2)}</span></h2><div class="list">${papers}</div></section>`;
  }).join('');

  // ---------- CITE panel + copy ----------
  $('#groups').addEventListener('click', e => {
    const b = e.target.closest('.tg');
    if (b) { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); document.getElementById(b.getAttribute('aria-controls')).hidden = !o; b.querySelector('.pm').textContent = o ? '−' : '+'; return; }
    const c = e.target.closest('.copy');
    if (c) {
      const pre = c.parentElement.querySelector('pre'), done = m => { c.textContent = m; setTimeout(() => { c.textContent = 'Copy BibTeX'; }, 2000); };
      const sel = () => { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected: press Ctrl+C'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pre.textContent).then(() => done('Copied'), sel); else sel();
    }
  });
})();
