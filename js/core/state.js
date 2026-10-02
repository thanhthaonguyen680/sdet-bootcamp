/* Trạng thái người học, lưu trong localStorage. Khóa STORE_KEY giữ nguyên để không mất tiến độ đã có. */

const STORE_KEY = 'js-week1-practice-v1';
let state = { codes:{}, status:{}, last:null, theme:null, week:null, revealed:{}, lastByWeek:{} };
function loadState(){
  try{ const s = localStorage.getItem(STORE_KEY); if(s){ const p = JSON.parse(s); if(p && typeof p==='object') state = Object.assign(state, p); } }catch(e){}
  state.revealed = state.revealed || {}; state.lastByWeek = state.lastByWeek || {};
  // Dọn bản lưu rỗng do lỗi cũ: lần đầu mở trang, bài 1.1 bị lưu code rỗng thay cho code gốc.
  if (state.codes && state.codes['1.1'] === '') delete state.codes['1.1'];
}
function saveState(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){} }
