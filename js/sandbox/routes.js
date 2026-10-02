/* Sàn Demo: từng trang (đăng nhập, đăng ký, bảng giá, đặt lệnh, lệnh của tôi) và bug cài sẵn. */

const APP_ROUTES = {
  '/login': { title: 'Đăng nhập | Sàn Demo', render: (s, app) => `
<main class="auth">
  <div class="card">
    <h1>Đăng nhập</h1>
    <p class="muted">Chào mừng bạn quay lại Sàn Demo</p>
    ${app.query.registered ? '<p class="notice" role="status">Đăng ký thành công. Vui lòng đăng nhập.</p>' : ''}
    <form id="login-form" novalidate>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" placeholder="ban@congty.com" autocomplete="off">
      <label for="password">Mật khẩu</label>
      <input id="password" name="password" type="password" placeholder="Nhập mật khẩu">
      <label class="check"><input type="checkbox" id="remember"> Ghi nhớ đăng nhập</label>
      <p class="error" role="alert" data-testid="login-error" hidden></p>
      <button type="submit" class="btn primary" id="btn-${rid()}">Đăng nhập</button>
    </form>
    <div class="links"><a class="link" href="/forgot">Quên mật khẩu?</a><a class="link" href="/register">Tạo tài khoản mới</a></div>
  </div>
  <aside class="demo-note">Tài khoản thử: <code>thao@sandemo.test</code> / <code>Demo@123</code></aside>
</main>`,
    setup(doc, app){
      doc.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        const email = doc.getElementById('email').value.trim();
        const pw = doc.getElementById('password').value;
        const err = doc.querySelector('.error');
        let msg = '';
        if (!email) msg = 'Vui lòng nhập email';
        else if (!pw) msg = 'Vui lòng nhập mật khẩu';
        const acc = [{ email: 'thao@sandemo.test', password: 'Demo@123', name: 'Thao' }, ...app.state.users].find(u => u.email === email && u.password === pw);
        if (!msg && !acc) msg = app.bug('login-error-text') ? 'Đã có lỗi xảy ra' : 'Email hoặc mật khẩu không đúng';
        if (msg){ err.textContent = msg; err.hidden = false; return; }
        err.hidden = true;
        app.state.user = acc.name;
        const t = app.token;
        if (!app.bug('login-no-redirect')) setTimeout(() => { if (app.alive(t)) app.navigate('/dashboard'); }, 200);
      });
    } },
  '/register': { title: 'Đăng ký | Sàn Demo', render: () => `
<main class="auth">
  <div class="card">
    <h1>Đăng ký tài khoản</h1>
    <p class="muted">Tạo tài khoản để bắt đầu giao dịch trên Sàn Demo</p>
    <form id="register-form" novalidate>
      <label for="fullname">Họ và tên</label>
      <input id="fullname" name="fullname" type="text" autocomplete="off">
      <label for="reg-email">Email</label>
      <input id="reg-email" name="email" type="email" placeholder="ban@congty.com" autocomplete="off">
      <label for="reg-password">Mật khẩu</label>
      <input id="reg-password" name="password" type="password" placeholder="Ít nhất 8 ký tự">
      <label for="reg-confirm">Nhập lại mật khẩu</label>
      <input id="reg-confirm" name="confirm" type="password">
      <label class="check"><input type="checkbox" id="terms"> Tôi đồng ý với điều khoản sử dụng</label>
      <p class="error" role="alert" hidden></p>
      <button type="submit" class="btn primary">Đăng ký</button>
    </form>
    <a class="link" href="/login">Đã có tài khoản? Đăng nhập</a>
  </div>
</main>`,
    setup(doc, app){
      doc.getElementById('register-form').addEventListener('submit', e => {
        e.preventDefault();
        const v = id => doc.getElementById(id).value;
        const name = v('fullname').trim(), email = v('reg-email').trim(), pw = v('reg-password'), cf = v('reg-confirm');
        const err = doc.querySelector('.error');
        const taken = email === 'thao@sandemo.test' || app.state.users.some(u => u.email === email);
        let msg = '';
        if (!name) msg = 'Vui lòng nhập họ và tên';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = 'Email không hợp lệ';
        else if (taken) msg = 'Email đã được sử dụng';
        else if (pw.length < 8) msg = 'Mật khẩu phải có ít nhất 8 ký tự';
        else if (pw !== cf && !app.bug('register-confirm-ignored')) msg = 'Mật khẩu nhập lại không khớp';
        else if (!doc.getElementById('terms').checked) msg = 'Vui lòng đồng ý với điều khoản';
        if (msg){ err.textContent = msg; err.hidden = false; return; }
        err.hidden = true;
        app.state.users.push({ email, password: pw, name });
        const t = app.token;
        setTimeout(() => { if (app.alive(t)) app.navigate('/login?registered=1'); }, 150);
      });
    } },
  '/forgot': { title: 'Quên mật khẩu | Sàn Demo', render: () => `
<main class="auth"><div class="card">
  <h1>Quên mật khẩu</h1>
  <p class="muted">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
  <label for="forgot-email">Email</label>
  <input id="forgot-email" type="email">
  <button type="button" class="btn primary">Gửi hướng dẫn</button>
  <a class="link" href="/login">Quay lại đăng nhập</a>
</div></main>` },
  '/dashboard': { title: 'Bảng giá | Sàn Demo', render: s => topbar(s, '/dashboard') + `
<main class="page">
  <h1>Bảng giá</h1>
  <div class="bar"><input type="search" aria-label="Tìm kiếm" placeholder="Tìm mã cổ phiếu"></div>
  <p class="loading" role="status">Đang tải dữ liệu...</p>
  <div class="table-wrap"><table data-testid="price-table" hidden>
    <thead><tr><th>Mã</th><th>Tên công ty</th><th>Giá</th><th>Thay đổi</th><th>Thao tác</th></tr></thead>
    <tbody></tbody>
  </table></div>
  <p class="muted small" data-testid="last-updated" hidden></p>
</main>`,
    setup(doc, app, token){
      const delay = app.fast ? 60 : 600 + Math.round(Math.random() * 600);
      setTimeout(() => {
        if (!app.alive(token)) return;
        const tbody = doc.querySelector('tbody');
        tbody.innerHTML = STOCKS.map(st => {
          const cls = st.change > 0 ? 'up' : st.change < 0 ? 'down' : 'flat';
          return '<tr><td>' + st.code + '</td><td>' + st.name + '</td><td class="num">' + fmtN(st.price) + '</td><td class="num ' + cls + '">' +
            (st.change > 0 ? '+' : '') + st.change + '</td><td class="actions"><button type="button" class="btn sm">Mua</button> ' +
            '<button type="button" class="btn sm ghost" id="watch-' + rid() + '" aria-pressed="false">Theo dõi</button></td></tr>';
        }).join('');
        doc.querySelector('.loading').remove();
        doc.querySelector('table').hidden = false;
        const up = doc.querySelector('[data-testid="last-updated"]');
        up.textContent = 'Cập nhật lúc 10:45:12'; up.hidden = false;
      }, delay);
      doc.querySelector('input[type=search]').addEventListener('input', e => {
        if (app.bug('search-broken')) return;
        const q = e.target.value.trim().toLowerCase();
        doc.querySelectorAll('tbody tr').forEach(tr => { tr.hidden = q !== '' && !tr.textContent.toLowerCase().includes(q); });
      });
      doc.querySelector('table').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const code = b.closest('tr').cells[0].textContent;
        if (b.textContent === 'Mua'){
          // Bug cài sẵn: mở nhầm lệnh của mã ở dòng kế tiếp.
          const i = STOCKS.findIndex(x => x.code === code);
          app.navigate('/order?code=' + (app.bug('buy-wrong-stock') ? STOCKS[(i + 1) % STOCKS.length].code : code));
        }
        else { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Đang theo dõi' : 'Theo dõi'; }
      });
    } },
  '/order': { title: 'Đặt lệnh | Sàn Demo', render: s => topbar(s, '/order') + `
<main class="page narrow">
  <h1>Đặt lệnh</h1>
  <form id="order-form" novalidate>
    <label for="symbol">Mã cổ phiếu</label>
    <select id="symbol" name="symbol"><option value="">-- Chọn mã --</option>${STOCKS.map(o => '<option value="' + o.code + '">' + o.code + ' - ' + o.name + '</option>').join('')}</select>
    <fieldset><legend>Loại lệnh</legend>
      <label class="check"><input type="radio" name="side" value="buy" checked> Mua</label>
      <label class="check"><input type="radio" name="side" value="sell"> Bán</label>
    </fieldset>
    <label for="qty">Khối lượng</label>
    <input id="qty" name="qty" type="number" placeholder="Bội số của 100">
    <label for="price">Giá đặt</label>
    <input id="price" name="price" type="number">
    <label class="check"><input type="checkbox" id="agree"> Tôi đồng ý với điều khoản giao dịch</label>
    <p class="error" role="alert" hidden></p>
    <button type="submit" class="btn primary" disabled>Đặt lệnh</button>
  </form>
  <div class="toast" role="status" hidden></div>
</main>`,
    setup(doc, app){
      const sym = doc.getElementById('symbol'), price = doc.getElementById('price'), agree = doc.getElementById('agree');
      const btn = doc.querySelector('#order-form button[type=submit]'), err = doc.querySelector('.error'), toast = doc.querySelector('.toast');
      const setPrice = () => { const st = STOCKS.find(x => x.code === sym.value); price.value = st ? st.price : ''; };
      if (app.query.code){ sym.value = app.query.code; setPrice(); }
      sym.addEventListener('change', setPrice);
      agree.addEventListener('change', () => { btn.disabled = !agree.checked; });
      doc.getElementById('order-form').addEventListener('submit', e => {
        e.preventDefault();
        const qty = Number(doc.getElementById('qty').value), p = Number(price.value);
        let msg = '';
        if (!sym.value) msg = 'Vui lòng chọn mã cổ phiếu';
        else if (!qty || qty <= 0 || qty % 100 !== 0) msg = 'Khối lượng phải là bội số của 100';
        else if (!p || p <= 0) msg = 'Vui lòng nhập giá hợp lệ';
        if (msg){ err.textContent = msg; err.hidden = false; toast.hidden = true; return; }
        err.hidden = true;
        const side = app.bug('order-side-ignored') ? 'buy' : doc.querySelector('input[name=side]:checked').value;
        if (!app.bug('orders-not-saved')) app.state.orders.push({ id: 'DH-' + app.state.nextId++, code: sym.value, side, qty, price: p, status: 'Chờ khớp', time: '11:05' });
        toast.textContent = 'Đặt lệnh thành công: ' + (side === 'buy' ? 'MUA' : 'BÁN') + ' ' + sym.value + ' x' + qty + ' @ ' + fmtN(p);
        toast.hidden = false;
      });
    } },
  '/orders': { title: 'Lệnh của tôi | Sàn Demo', render: s => topbar(s, '/orders') + `
<main class="page">
  <h1>Lệnh của tôi</h1>
  <div class="bar">
    <label for="status-filter">Lọc theo trạng thái</label>
    <select id="status-filter" data-testid="status-filter"><option value="">Tất cả</option><option>Đã khớp</option><option>Chờ khớp</option><option>Đã hủy</option></select>
    <span class="muted"><span data-testid="order-count">${s.orders.length}</span> lệnh</span>
  </div>
  <div class="table-wrap"><table data-testid="orders-table">
    <thead><tr><th>Số hiệu</th><th>Mã</th><th>Loại</th><th>Khối lượng</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
    <tbody>${s.orders.map(orderRow).join('')}</tbody>
  </table></div>
  <div class="toast" role="status" hidden></div>
</main>`,
    setup(doc, app){
      const filter = doc.getElementById('status-filter');
      const draw = () => {
        const list = app.state.orders.filter(o => !filter.value || o.status === filter.value);
        doc.querySelector('tbody').innerHTML = list.length ? list.map(orderRow).join('') : '<tr class="empty-row"><td colspan="7">Không có lệnh nào</td></tr>';
        doc.querySelector('[data-testid="order-count"]').textContent = list.length;
      };
      filter.addEventListener('change', draw);
      const dialog = (title, bodyHtml, actions) => {
        const ov = doc.createElement('div'); ov.className = 'overlay';
        ov.innerHTML = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title"><div class="dlg-head"><h2 id="dlg-title">' + title +
          '</h2><button type="button" class="icon" aria-label="Đóng">×</button></div>' + bodyHtml + '<div class="dlg-actions">' + actions + '</div></div>';
        doc.body.appendChild(ov);
        ov.addEventListener('click', e => { const b = e.target.closest('button'); if (b && (b.getAttribute('aria-label') === 'Đóng' || b.dataset.close !== undefined)) ov.remove(); });
        return ov;
      };
      doc.querySelector('tbody').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const id = b.closest('tr').cells[0].textContent;
        const o = app.state.orders.find(x => x.id === id);
        if (b.textContent === 'Chi tiết'){
          dialog('Chi tiết lệnh ' + id, '<p>' + (o.side === 'buy' ? 'Mua' : 'Bán') + ' ' + o.code + ' x' + fmtN(o.qty) + ' @ ' + fmtN(o.price) + '<br>Đặt lúc ' + o.time + '</p>', '<button type="button" class="btn" data-close>Đóng</button>');
        } else {
          const ov = dialog('Xác nhận hủy lệnh', '<p>Bạn có chắc muốn hủy lệnh ' + id + '?</p>', '<button type="button" class="btn ghost" data-close>Quay lại</button><button type="button" class="btn danger" data-confirm>Xác nhận hủy</button>');
          ov.querySelector('[data-confirm]').addEventListener('click', () => {
            // Bug cài sẵn: hủy nhầm một lệnh chờ khớp khác, nhưng thông báo vẫn ghi đúng số hiệu.
            const target = app.bug('cancel-wrong-order') ? (app.state.orders.find(x => x.status === 'Chờ khớp' && x.id !== id) || o) : o;
            target.status = 'Đã hủy'; ov.remove(); draw();
            const t = doc.querySelector('.toast'); t.textContent = 'Đã hủy lệnh ' + id; t.hidden = false;
          });
        }
      });
    } },
  '/404': { title: 'Không tìm thấy | Sàn Demo', render: () => '<main class="auth"><div class="card"><h1>404</h1><p>Không tìm thấy trang.</p><a href="/login">Về trang đăng nhập</a></div></main>' },
};
