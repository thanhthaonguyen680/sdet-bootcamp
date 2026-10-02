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
function showTab(which){
  const isC = which === 'console';
  $('#tabConsole').setAttribute('aria-selected', isC); $('#tabTests').setAttribute('aria-selected', !isC);
  consoleEl.hidden = !isC; testsEl.hidden = isC;
}
