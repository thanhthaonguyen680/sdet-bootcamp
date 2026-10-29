/* Chọn một bài: nạp code, dựng giao diện, đặt lại trạng thái. */

function select(id, focusEditor){
  const ex = EX.find(e => e.id === id); if (!ex) return;
  flushSave();
  if (!ex.free){
    state.lastByWeek[ex.week] = id;
    if (ex.week !== state.week){ state.week = ex.week; buildNav(); }
  }
  current = ex; state.last = id; saveState();
  briefView = (LESSONS[ex.id] && statusOf(ex) === '') ? 'lesson' : 'task';
  if (ex.files) ta.value = projInit(ex); else { proj = null; ta.value = codeOf(ex); }
  editorReady = true;
  renderProjTree();
  ta.scrollTop = 0; ta.scrollLeft = 0; syncScroll();
  errLine = 0; lastLines = -1;
  renderHL(); renderGutter(); renderFileBar();
  renderBrief(); renderToolbar(); refreshStatus();
  document.querySelector('.main').classList.toggle('wide', !!(ex.pw || ex.ci || ex.app));
  applyBriefWidth();
  if (ex.ci) ciPaneSetup(ex);
  // Kiểm tra running cả lúc iframe nạp xong: nếu đã bấm Chạy hoặc AI viết test thì không reset trang giữa chừng.
  if ((ex.pw || ex.app) && !running){ App.init().then(() => { if (running || current !== ex) return; App.reset(); App.navigate(ex.route || '/login'); }); }
  clearConsole(true); resetTests(); resetReport();
  showTab('console', true);
  closeDrawer();
  resetArmed = false; resetBtn.textContent = 'Khôi phục code gốc'; resetBtn.classList.remove('warn');
  if (focusEditor && window.matchMedia('(min-width: 760px)').matches) ta.focus();
}
