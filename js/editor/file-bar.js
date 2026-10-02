/* Thanh tệp của bài có nhiều tệp trong cùng một ô soạn. */

function renderFileBar(){
  const bar = document.getElementById('fileBar');
  if (!bar) return;
  const marks = [];
  if (current && current.pw) ta.value.split('\n').forEach((l, i) => { const m = l.match(/^\s*\/\/\s*@file:\s*(\S+)/); if (m) marks.push({ line: i + 1, file: m[1] }); });
  if (proj){ const h = '<span class="fb-label">Đang mở:</span><span class="fb-path">' + esc(proj.active) + '</span>'; if (bar.innerHTML !== h) bar.innerHTML = h; bar.hidden = false; return; }
  if (marks.length < 2){ bar.hidden = true; bar.innerHTML = ''; return; }
  const html = '<span class="fb-label">Tệp:</span>' + marks.map(m => '<button type="button" data-line="' + m.line + '" title="Dòng ' + m.line + '">' + esc(m.file) + '</button>').join('');
  if (bar.innerHTML !== html) bar.innerHTML = html;
  bar.hidden = false;
}
function jumpToLine(n){
  const lines = ta.value.split('\n');
  let pos = 0; for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
  ta.focus(); ta.setSelectionRange(pos, pos);
  const lh = parseFloat(getComputedStyle(ta).lineHeight) || 22;
  ta.scrollTop = Math.max(0, (n - 1) * lh - 6);
  syncScroll();
}
document.getElementById('fileBar').addEventListener('click', e => { const b = e.target.closest('[data-line]'); if (b) jumpToLine(+b.dataset.line); });
