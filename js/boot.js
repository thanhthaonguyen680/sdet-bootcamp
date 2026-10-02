/* =============================================================================
   Khởi động: nạp nội dung, dựng danh mục rồi dựng giao diện.
   ========================================================================== */

// Áp dụng giao diện sáng/tối ngay, không chờ nội dung tải xong (tránh nháy màu).
loadState();
applyTheme();

async function boot(){
  try {
    await loadContent();
    buildCatalog();
  } catch (e){
    sideEl.innerHTML = '<p class="empty">Không tải được nội dung khóa học: ' + esc(e.message) + '. Hãy tải lại trang.</p>';
    throw e;
  }
  const first = EX.find(e => !e.free);
  current = first;
  if (!state.week) state.week = first.week;
  buildWeekButtons();
  const lastEx = EX.find(e => e.id === state.last);
  if (lastEx && !lastEx.free) state.week = lastEx.week;
  buildNav();
  appPaneInit();
  select(lastEx ? state.last : first.id, false);
  if (!state.onboarded){
    if (Object.keys(state.status).length || Object.keys(state.codes).length){ state.onboarded = true; saveState(); }
    else setTimeout(startTour, 500);
  }
}

boot();
