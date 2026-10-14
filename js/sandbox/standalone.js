/* Sàn Demo chạy độc lập (sandemo.html), dùng chung các trang với bản trong khóa học (js/sandbox/routes.js).

   Dùng để thực hành với Playwright hoặc Playwright MCP thật trên máy, vì bản trong khóa học nằm trong
   khung iframe của trang học nên công cụ bên ngoài không điều khiển được.

   - Địa chỉ dạng sandemo.html#/login, #/dashboard, #/order?code=7203 (chạy được trên web tĩnh như GitHub Pages).
   - Trạng thái (đăng nhập, lệnh đã đặt) giữ trong sessionStorage: tải lại trang vẫn còn, đóng tab là mất.
   - ?reset          bắt đầu lại từ dữ liệu gốc
   - ?bug=a,b        bật bug cài sẵn để thử test có bắt được không, ví dụ ?bug=orders-not-saved */
(() => {
  const KEY = 'sandemo-standalone';
  const params = new URLSearchParams(location.search);
  if (params.has('reset')){
    sessionStorage.removeItem(KEY);
    // Gỡ ?reset khỏi địa chỉ để lần tải lại sau không xóa dữ liệu nữa.
    params.delete('reset');
    history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
  }
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e){ return null; } })();

  const style = document.createElement('style');
  style.textContent = APP_CSS;
  document.head.appendChild(style);

  const app = {
    state: saved || freshAppState(),
    bugs: new Set((params.get('bug') || '').split(',').map(s => s.trim()).filter(Boolean)),
    path: '', query: {}, token: 0, fast: false,
    bug(n){ return this.bugs.has(n); },
    alive(t){ return t === this.token; },
    navigate(url){
      let u = String(url || '/'); if (!u.startsWith('/')) u = '/' + u;
      if (location.hash === '#' + u) render(); else location.hash = u;
    },
  };
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(app.state)); } catch (e){} };

  function render(){
    const u = location.hash.slice(1) || '/login', qi = u.indexOf('?');
    let p = qi >= 0 ? u.slice(0, qi) : u;
    if (p === '/' || p === '') p = '/login';
    const route = APP_ROUTES[p] || APP_ROUTES['/404'];
    app.path = p; app.query = Object.fromEntries(new URLSearchParams(qi >= 0 ? u.slice(qi + 1) : ''));
    app.token++;
    document.title = route.title;
    document.body.innerHTML = route.render(app.state, app);
    window.scrollTo(0, 0);
    if (route.setup) route.setup(document, app, app.token);
    save();
  }

  // Liên kết trong trang dùng đường dẫn như /dashboard: đổi sang dạng #/dashboard.
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="/"]');
    if (a && !e.defaultPrevented){ e.preventDefault(); app.navigate(a.getAttribute('href')); }
    setTimeout(save, 0);
  });
  document.addEventListener('submit', e => { e.preventDefault(); setTimeout(save, 0); });
  window.addEventListener('pagehide', save);
  window.addEventListener('hashchange', render);
  render();
})();
