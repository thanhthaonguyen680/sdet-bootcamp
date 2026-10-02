/* Sự kiện bấm trong danh sách bài, đề bài và nút tuần. */

sideEl.addEventListener('click', e => { const b = e.target.closest('.nav-item'); if (b) select(b.dataset.id, true); });
stripEl.addEventListener('click', e => { const b = e.target.closest('.cell'); if (b) select(b.dataset.id, true); });
briefEl.addEventListener('click', e => {
  const fb = e.target.closest('[data-file]');
  if (fb && typeof FILE_SAMPLES !== 'undefined'){
    const s = FILE_SAMPLES[fb.dataset.file]; const v = document.getElementById('fview');
    if (s && v){ v.innerHTML = '<div class="fv-title">' + esc(s.title) + '</div><p>' + esc(s.desc) + '</p><pre><code>' + highlight(s.code) + '</code></pre>'; briefEl.querySelectorAll('[data-file]').forEach(b => b.classList.toggle('on', b === fb)); }
    return;
  }
  const v = e.target.closest('[data-view]');
  if (v){
    briefView = v.dataset.view; renderBrief();
    if (v.dataset.focus && window.matchMedia('(min-width: 760px)').matches) ta.focus();
    else if (v.dataset.focus) document.querySelector('.toolbar').scrollIntoView({ block: 'start', behavior: 'smooth' });
    return;
  }
  if (e.target.closest('[data-reveal]')){
    state.revealed[current.id] = true; saveState(); renderBrief(); return;
  }
  const r = e.target.closest('[data-run-ex]');
  if (r){
    const parts = r.dataset.runEx.split(':');
    const item = (parts[0] === 'sol' ? SOLUTIONS : LESSONS)[current.id].examples[+parts[1]];
    run(false, typeof item === 'string' ? item : item.code);
    if (!window.matchMedia('(min-width: 1100px)').matches) document.querySelector('.panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
$('#weeks').addEventListener('click', e => { const b = e.target.closest('button[data-week]'); if (b) switchWeek(+b.dataset.week); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if (!b || b.disabled) return;
  const ex = EX[+b.dataset.go]; if (ex) select(ex.id, true);
});
