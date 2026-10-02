/* Nút Chạy, Kiểm tra bài, Sao chép, Khôi phục và các tab kết quả. */

runBtn.addEventListener('click', () => run(false));
checkBtn.addEventListener('click', () => run(true));
markBtn.addEventListener('click', () => {
  setStatus(current.id, state.status[current.id] === 'pass' ? null : 'pass');
  renderToolbar();
  if (state.status[current.id] === 'pass') toast('Đã đánh dấu xong bài ' + current.num);
});
let resetArmed = false, resetTimer = null;
resetBtn.addEventListener('click', () => {
  if (!resetArmed){
    resetArmed = true; resetBtn.textContent = 'Bấm lần nữa để khôi phục'; resetBtn.classList.add('warn');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { resetArmed = false; resetBtn.textContent = 'Khôi phục code gốc'; resetBtn.classList.remove('warn'); }, 3000);
    return;
  }
  resetArmed = false; clearTimeout(resetTimer); resetBtn.textContent = 'Khôi phục code gốc'; resetBtn.classList.remove('warn');
  if (current.files){ proj.files = JSON.parse(current.starter); ta.value = proj.files[proj.active]; renderProjTree(); } else ta.value = current.starter;
  delete state.codes[current.id]; delete state.status[current.id];
  lastLines = -1; onEdit(); flushSave(); renderToolbar(); resetTests(); clearConsole(true);
  toast('Đã khôi phục code gốc');
});
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(ta.value); toast('Đã sao chép code'); }
  catch (e){ ta.focus(); ta.select(); try { document.execCommand('copy'); toast('Đã sao chép code'); } catch (_){ toast('Không sao chép được, hãy dùng Ctrl + C'); } }
});
$('#clearBtn').addEventListener('click', () => clearConsole(true));
$('#tabConsole').addEventListener('click', () => showTab('console'));
$('#tabTests').addEventListener('click', () => showTab('tests'));
