defineExercise({
  id: 'w6.11',
  pw: true,
  route: '/dashboard',
  title: 'Biến phiên MCP thành test bền',

  // Phiên AI ghi sẵn, hiện ở tab "Phiên MCP" (xem js/mcp/pane.js)
  mcp: {
    prompt: 'Theo dõi cổ phiếu Sony trên Bảng giá giúp mình, rồi viết test cho thao tác này.',
    steps: [
      { say: 'Mình mở Bảng giá, chờ bảng tải xong rồi chụp snapshot để tìm đúng nút.' },
      { tool: 'browser_navigate', url: '/dashboard' },
      { tool: 'browser_wait_for', text: 'Sony Group' },
      { tool: 'browser_snapshot' },
      { say: 'Có 6 nút "Theo dõi" giống hệt nhau. Nút của dòng Sony là {{ref:page.getByRole(\'row\').filter({ hasText: \'Sony\' }).getByRole(\'button\', { name: \'Theo dõi\' })}}.' },
      { tool: 'browser_click', element: 'nút Theo dõi ở dòng Sony', target: "page.getByRole('row').filter({ hasText: 'Sony' }).getByRole('button', { name: 'Theo dõi' })" },
      { say: 'Đã bấm, nút chuyển thành "Đang theo dõi". Mình đã viết test từ phiên này, bạn xem trong ô soạn code nhé.' },
    ],
  },

  desc: `<p>Mở tab <strong>Phiên MCP</strong> để xem AI làm việc: nó mở Bảng giá, chụp snapshot, bấm nút "Theo dõi" của Sony qua ref, rồi viết lại thành test (đang nằm trong ô soạn code).</p>
<p>Bấm <strong>Chạy</strong>: test không chạy được. Test AI viết còn 3 vấn đề:</p>
<ol>
<li>Dùng <code>aria-ref=...</code>: ref chỉ tồn tại trong phiên MCP, test chạy trên trình duyệt mới thì không có.</li>
<li>Tìm dòng bằng <strong>toàn bộ chữ của dòng</strong>, kể cả giá. Giá cổ phiếu đổi liên tục, đổi là test vỡ.</li>
<li>Chỉ kiểm tra dòng "có hiện", chưa chắc kiểm tra được nút đã thật sự chuyển trạng thái.</li>
</ol>
<p>Hãy viết lại test <code>'theo dõi cổ phiếu Sony'</code> sao cho: tìm dòng Sony bằng chữ định danh ổn định, bấm "Theo dõi" trong dòng đó, rồi kiểm tra nút của dòng Sony đã ở trạng thái đang theo dõi.</p>
<p class="note">Bộ chấm chạy lại test khi giá đã nhảy sang phiên khác: test phải vẫn pass. Rồi chạy trên phiên bản có bug "bấm Theo dõi không có tác dụng": test phải fail.</p>`,
  hints: [
    'Tìm dòng theo tên công ty, chữ này không đổi: <code>page.getByRole(\'row\').filter({ hasText: \'Sony\' })</code>. Lưu vào một biến để dùng lại ở bước kiểm tra.',
    'Bấm nút trong dòng đó: <code>dong.getByRole(\'button\', { name: \'Theo dõi\' })</code>. Sau khi bấm, chữ trên nút đổi thành "Đang theo dõi" và snapshot hiện thêm <code>[pressed]</code>.',
    '<code>[pressed]</code> trong snapshot ứng với thuộc tính <code>aria-pressed="true"</code>: <code>await expect(dong.getByRole(\'button\', { name: \'Đang theo dõi\' })).toHaveAttribute(\'aria-pressed\', \'true\');</code>'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// Test do AI viết từ phiên MCP (xem tab Phiên MCP). Bấm Chạy: test không chạy được.
test('theo dõi cổ phiếu Sony', async ({ page }) => {
  await page.goto('/dashboard');
  await page.locator('aria-ref=e35').click();
  await expect(page.getByRole('row', { name: '6758 Sony Group 13,200 -120 Mua Đang theo dõi' })).toBeVisible();
});
`,
  tests: PWG + AWAIT_LINT + String.raw`
const __sonyPressed = () => [...H.doc().querySelectorAll('tbody tr')].map(tr => ({ sony: tr.textContent.includes('Sony'), pressed: !!tr.querySelector('button[aria-pressed="true"]') }));
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Không dùng ref của phiên MCP', () => expect(/aria-ref/.test(__code), 'Ref chỉ tồn tại trong phiên MCP vừa chụp snapshot. Hãy dùng locator theo role, tên và chữ trên trang').toBe(false));
check('Đã theo dõi đúng dòng Sony', () => { const rows = __sonyPressed(); expect(rows.some(r => r.sony && r.pressed), 'Nút của dòng Sony chưa ở trạng thái đang theo dõi').toBe(true); expect(rows.some(r => !r.sony && r.pressed), 'Có dòng khác Sony cũng bị bấm Theo dõi').toBe(false); });
check('Mọi thao tác và expect trên locator đều có await', () => { const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Không phụ thuộc vào giá: giá đổi thì test vẫn pass', async () => { const r = await H.rerun('price-tick'); expect(r.length > 0 && r.every(t => t.status === 'passed'), 'Giá trên bảng vừa nhảy sang phiên khác và test bị fail. Locator đang dựa vào giá hoặc chữ đầy đủ của dòng: hãy tìm dòng bằng tên công ty hoặc mã').toBe(true); });
check('Phát hiện bug "bấm Theo dõi không có tác dụng"', async () => { const r = await H.rerun('watch-broken'); expect(r.some(t => t.status === 'failed'), 'Nút Theo dõi không đổi trạng thái mà test vẫn pass. Hãy kiểm tra nút đã chuyển sang Đang theo dõi').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Ref sống bao lâu</h3>
<p>Mỗi lần AI chụp snapshot, Playwright MCP gắn cho từng phần tử một mã <code>ref</code> để AI bấm vào. Ref <strong>không nằm trong trang web</strong>; nó chỉ là sổ ghi chép của phiên MCP đang mở.</p>
${TRACE(['Tình huống', 'Ref cũ còn dùng được?'], [['Chụp snapshot lần nữa, trang không đổi', 'Còn: phần tử giữ nguyên ref'], ['Điều hướng hoặc tải lại trang', 'Không: phần tử là phần tử mới, nhận ref mới'], ['Một phần trang được vẽ lại (bảng vừa tải xong)', 'Không, với các phần tử bị vẽ lại'], ['Chạy test (mở trình duyệt mới)', 'Không: chưa có snapshot nào nên không có ref nào']])}
<p>Vì vậy test <strong>không bao giờ</strong> dùng ref. Thử ngay: trong tab Phiên MCP, gõ <code>browser_snapshot</code> hai lần (ref giữ nguyên), rồi <code>browser_navigate /dashboard</code> và chụp lại (ref đổi). Bấm Chạy với <code>page.locator('aria-ref=...')</code> để xem lỗi.</p>
<h3>"Duy nhất lúc này" khác với "bền theo thời gian"</h3>
<p>Khi AI bấm qua ref, Playwright MCP ghi lại một locator tương đương. Locator đó được chọn sao cho <strong>khớp đúng 1 phần tử tại thời điểm bấm</strong>. Bảng giá có 6 nút "Theo dõi" giống nhau, nên nó phải khoanh theo dòng, và tên của dòng là toàn bộ chữ trong dòng:</p>
${ANAT("page.getByRole('row', { name: '6758 Sony Group ", ['13,200 -120', 'Giá và mức thay đổi. Đổi theo từng giây, nên locator đúng lúc ghi lại nhưng vỡ ở lần chạy sau.'], " Mua Theo dõi' })\n  .getByRole('button', { name: 'Theo dõi' })")}
<p>Sửa bằng cách chọn <strong>chữ định danh ổn định</strong> của dòng (mã cổ phiếu, tên công ty), giống cách làm ở tuần 4:</p>
${ANAT("const sony = page.getByRole('row')", ['.filter({ hasText: \'Sony\' })', 'Giữ dòng có chữ "Sony". Tên công ty không đổi theo giá.'], ";\nawait sony.getByRole('button', { name: 'Theo dõi' }).click();")}
<h3>Kiểm tra đúng điều quan trọng</h3>
<p>Phiên MCP ghi lại <strong>thao tác</strong>, không ghi lại <strong>kỳ vọng</strong>. Câu kiểm tra do AI tự thêm thường dựa trên những gì nó vừa nhìn thấy, nên hay kiểm tra thừa (cả dòng, kể cả giá) hoặc kiểm tra thiếu. Hãy tự hỏi: <em>thao tác này thành công thì điều gì phải thay đổi?</em> Ở đây là nút của dòng Sony chuyển sang trạng thái đang nhấn: snapshot ghi <code>[pressed]</code>, trong HTML là <code>aria-pressed="true"</code>.</p>
<p class="note">Góc QA: dùng MCP để khám phá trang và lấy locator thì rất nhanh. Nhưng trước khi đưa vào bộ test, mỗi locator cần qua câu hỏi "nếu dữ liệu đổi thì nó còn đúng không?".</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Bỏ <code>aria-ref</code>, thay bằng locator đọc được: dòng có chữ "Sony", nút "Theo dõi" bên trong dòng đó.</li>
<li>Tìm dòng theo tên công ty, không theo giá, nên khi giá nhảy test vẫn pass.</li>
<li>Kiểm tra đúng kết quả của thao tác: nút của dòng Sony có <code>aria-pressed="true"</code>. Với bug "bấm không có tác dụng", nút vẫn là "Theo dõi" nên test fail đúng như mong muốn.</li>
<li>Biến <code>sony</code> được khai báo một lần và dùng cho cả thao tác lẫn kiểm tra: đọc test là biết đang kiểm tra dòng nào.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('theo dõi cổ phiếu Sony', async ({ page }) => {
  await page.goto('/dashboard');
  const sony = page.getByRole('row').filter({ hasText: 'Sony' });
  await sony.getByRole('button', { name: 'Theo dõi' }).click();
  await expect(sony.getByRole('button', { name: 'Đang theo dõi' })).toHaveAttribute('aria-pressed', 'true');
});` }]},
});
