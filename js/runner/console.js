/* Console, tab kết quả và các hàm cập nhật vùng kết quả. */

function logLine(kind, text){
  const empty = consoleEl.querySelector('.empty'); if (empty) empty.remove();
  const d = document.createElement('div'); d.className = 'line ' + kind; d.textContent = text;
  consoleEl.appendChild(d); consoleEl.scrollTop = consoleEl.scrollHeight;
}
function clearConsole(withHint){
  consoleEl.innerHTML = withHint ? '<p class="empty">Bấm Chạy (Ctrl + Enter) để xem kết quả ở đây.</p>' : '';
}
function resetTests(){
  badgeEl.hidden = true;
  testsEl.innerHTML = current.tests
    ? '<p class="empty">Bấm Kiểm tra bài (Ctrl + Shift + Enter) để chấm code của bạn.</p>'
    : current.manual ? '<p class="empty">Bài này không chấm tự động. Khi hiểu hết, bấm Đánh dấu đã xong.</p>'
    : '<p class="empty">Sân chơi tự do không có phần chấm bài.</p>';
}
// keepCollapsed: chuyển tab nhưng không mở khung đang thu gọn (dùng khi chọn bài khác).
function showTab(which, keepCollapsed){
  if (!keepCollapsed && typeof revealPanel === 'function') revealPanel();
  const tabs = { console: ['#tabConsole', consoleEl], tests: ['#tabTests', testsEl], report: ['#tabReport', $('#paneReport')] };
  if (!tabs[which] || $(tabs[which][0]).hidden) which = 'console';
  for (const [k, [tab, pane]] of Object.entries(tabs)){ $(tab).setAttribute('aria-selected', k === which); pane.hidden = k !== which; }
}
