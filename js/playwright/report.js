/* Tab "Báo cáo": báo cáo của lần chạy test Playwright gần nhất, giống HTML report của Playwright.
   Gồm số test pass/fail, thời gian, và với từng test: lỗi, các bước đã chạy, trang lúc test kết thúc. */

const REPORT = { recs: [], ms: 0, at: null, filter: 'all', open: new Set() };
const reportEl = document.getElementById('paneReport');

// Bản sao HTML của trang tại một thời điểm, kèm giá trị đang nhập trong các ô (value không nằm trong outerHTML).
function pwSnapshotHtml(doc){
  if (!doc || !doc.documentElement || !doc.body || !doc.body.childElementCount) return '';
  const clone = doc.documentElement.cloneNode(true);
  const from = doc.querySelectorAll('input, textarea, select'), to = clone.querySelectorAll('input, textarea, select');
  from.forEach((el, i) => {
    const c = to[i]; if (!c) return;
    if (el.tagName === 'SELECT') [...el.options].forEach((o, j) => c.options[j] && c.options[j].toggleAttribute('selected', o.selected));
    else if (el.type === 'checkbox' || el.type === 'radio') c.toggleAttribute('checked', el.checked);
    else if (el.tagName === 'TEXTAREA') c.textContent = el.value;
    else c.setAttribute('value', el.value);
  });
  clone.querySelectorAll('script').forEach(s => s.remove());
  clone.querySelectorAll('.__pw-hl, .__pw-find').forEach(e => e.classList.remove('__pw-hl', '__pw-find'));
  return '<!doctype html>' + clone.outerHTML;
}

const rpTime = ms => ms < 1000 ? ms + 'ms' : (ms / 1000).toFixed(1) + 's';
const RP_ICON = { passed: '✓', failed: '✘', skipped: '–' };

function renderReport(recs, ms){
  Object.assign(REPORT, { recs, ms, at: new Date(), filter: 'all' });
  REPORT.open = new Set(recs.map((r, i) => r.status === 'failed' ? i : -1).filter(i => i >= 0));   // test fail mở sẵn
  const failed = recs.filter(r => r.status === 'failed').length, passed = recs.filter(r => r.status === 'passed').length;
  const badge = document.getElementById('reportBadge');
  badge.hidden = false; badge.className = 'badge ' + (failed ? 'fail' : 'pass');
  badge.textContent = failed ? failed + ' fail' : passed + ' pass';
  drawReport();
}

function drawReport(){
  const r = REPORT.recs, count = s => r.filter(x => x.status === s).length;
  const filters = [['all', 'Tất cả', r.length], ['passed', 'Passed', count('passed')], ['failed', 'Failed', count('failed')], ['skipped', 'Skipped', count('skipped')]];
  const head = '<div class="rp-head"><div class="rp-filters">' +
    filters.map(([k, label, n]) => '<button type="button" class="rp-filter ' + k + '" data-filter="' + k + '" aria-pressed="' + (REPORT.filter === k) + '">' + label + ' <b>' + n + '</b></button>').join('') +
    '</div><div class="rp-meta">Chạy lúc ' + REPORT.at.toLocaleTimeString('vi-VN') + ' · Tổng thời gian ' + rpTime(REPORT.ms) + '</div></div>';
  const rows = r.map((t, i) => ({ t, i })).filter(({ t }) => REPORT.filter === 'all' || t.status === REPORT.filter);
  reportEl.innerHTML = head + (rows.length ? '<ul class="rp-list">' + rows.map(({ t, i }) => {
    const open = REPORT.open.has(i);
    return '<li class="rp-test ' + t.status + '"><button type="button" class="rp-row" data-i="' + i + '" aria-expanded="' + open + '">' +
      '<span class="rp-icon">' + RP_ICON[t.status] + '</span><span class="rp-name">' + esc(t.name) + '</span><span class="rp-ms">' + (t.status === 'skipped' ? 'bỏ qua' : rpTime(t.ms)) + '</span></button>' +
      (open ? rpDetail(t, i) : '') + '</li>';
  }).join('') + '</ul>' : '<p class="empty">Không có test nào ở mục này.</p>');
  reportEl.querySelectorAll('iframe.rp-shot').forEach(f => { f.srcdoc = REPORT.recs[+f.dataset.i].snapshot; });
}

function rpDetail(t, i){
  let h = '<div class="rp-detail">';
  if (t.error) h += '<div class="rp-lbl">Lỗi</div><pre class="rp-err">' + esc(t.error.__pw || t.error.__assert ? t.error.message : explain(t.error)) + '</pre>';
  const steps = t.steps || [];
  h += '<div class="rp-lbl">Các bước (' + steps.length + ')</div>' + (steps.length
    ? '<ol class="rp-steps">' + steps.map(s => '<li class="' + (s.ok ? 'ok' : 'bad') + '"><span class="rp-icon">' + (s.ok ? '✓' : '✘') + '</span><code>' + esc(s.desc || '') + '</code><span class="rp-ms">' + rpTime(s.ms || 0) + '</span></li>').join('') + '</ol>'
    : '<p class="rp-none">Test chưa chạy bước nào.</p>');
  if (t.snapshot) h += '<div class="rp-lbl">Trang lúc test kết thúc <span>' + esc(t.url || '') + '</span></div><iframe class="rp-shot" sandbox data-i="' + i + '" title="Trang lúc test ' + esc(t.name) + ' kết thúc"></iframe>';
  return h + '</div>';
}

// Khi chọn bài khác: tab Báo cáo chỉ có ở bài Playwright.
function resetReport(){
  REPORT.recs = [];
  document.getElementById('tabReport').hidden = !(current && current.pw);
  document.getElementById('reportBadge').hidden = true;
  reportEl.innerHTML = '<p class="empty">Bấm Chạy để chạy test. Báo cáo của lần chạy gần nhất hiện ở đây: test nào pass, test nào fail, từng bước đã chạy và trang lúc test kết thúc.</p>';
}

reportEl.addEventListener('click', e => {
  const f = e.target.closest('[data-filter]'), row = e.target.closest('.rp-row');
  if (f){ REPORT.filter = f.dataset.filter; drawReport(); }
  else if (row){ const i = +row.dataset.i; REPORT.open.has(i) ? REPORT.open.delete(i) : REPORT.open.add(i); drawReport(); }
});
