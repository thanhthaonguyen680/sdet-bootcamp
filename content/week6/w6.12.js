defineExercise({
  id: 'w6.12',
  pw: true,
  route: '/orders',
  title: 'Tự lái phiên MCP rồi viết test',

  // Bài này không có phiên AI ghi sẵn: người học tự gọi công cụ trong tab "Phiên MCP".
  mcp: {
    steps: [
      { say: 'Lần này bạn đóng vai AI. Gọi lần lượt các công cụ ở ô bên dưới, ví dụ:<br><code>browser_navigate /orders</code> → <code>browser_snapshot</code> → tìm ref của ô "Lọc theo trạng thái" → <code>browser_select_option &lt;ref&gt; Chờ khớp</code> → <code>browser_snapshot</code> để xem kết quả.<br>Mỗi thao tác được ghi vào <b>Bản nháp test</b> ở cuối khung.' },
    ],
  },

  desc: `<p>Trang <strong>Lệnh của tôi</strong> có ô "Lọc theo trạng thái". Hãy viết test <code>'lọc lệnh chờ khớp'</code> theo cách làm việc với MCP:</p>
<ol>
<li>Mở tab <strong>Phiên MCP</strong>, tự gọi công cụ để mở trang, chụp snapshot và chọn lọc <strong>Chờ khớp</strong>.</li>
<li>Mở <strong>Bản nháp test từ phiên này</strong>, bấm Sao chép rồi dán vào ô soạn code. Bản nháp đã có đủ thao tác với locator đúng.</li>
<li>Tự thêm phần <strong>kiểm tra</strong>: sau khi lọc chỉ còn các lệnh "Chờ khớp", không còn lệnh nào khác.</li>
</ol>
<p>Snapshot sau khi lọc cho biết trang lúc đó trông thế nào: có bao nhiêu dòng, mỗi dòng có chữ gì. Dùng nó để quyết định cần kiểm tra điều gì.</p>
<p class="note">Bộ chấm chạy lại test trên phiên bản có bug "ô lọc không có tác dụng" (vẫn hiện mọi lệnh). Test phải fail.</p>`,
  hints: [
    'Gõ <code>browser_navigate /orders</code> rồi <code>browser_snapshot</code>. Ô lọc có dòng <code>- combobox "Lọc theo trạng thái" [ref=eN]</code>. Bấm vào ref đó trong snapshot để điền sẵn, sửa thành <code>browser_select_option eN Chờ khớp</code>.',
    'Bản nháp chỉ có thao tác, chưa kiểm tra gì: test như vậy luôn pass, kể cả khi ô lọc hỏng. Snapshot sau khi lọc có 2 dòng dữ liệu, cả hai đều "Chờ khớp", và dòng chữ "2 lệnh".',
    'Dòng dữ liệu là dòng có ô <code>cell</code> (dòng tiêu đề chỉ có <code>columnheader</code>): <code>const rows = page.getByRole(\'row\').filter({ has: page.getByRole(\'cell\') });</code> rồi <code>await expect(rows).toHaveCount(2);</code> và <code>await expect(rows.filter({ hasNotText: \'Chờ khớp\' })).toHaveCount(0);</code>'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// 1. Mở tab "Phiên MCP", tự gọi công cụ để lọc lệnh "Chờ khớp".
// 2. Sao chép "Bản nháp test từ phiên này" và dán thay cho test dưới đây.
// 3. Thêm assertion: sau khi lọc chỉ còn lệnh "Chờ khớp".
test('lọc lệnh chờ khớp', async ({ page }) => {

});
`,
  tests: PWG + AWAIT_LINT + String.raw`
check('Có ít nhất một test và tất cả pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Test có chọn lọc trên ô "Lọc theo trạng thái"', () => expect(__acts().some(a => a.type === 'selectOption' && /Chờ khớp/.test(JSON.stringify(a.arg))), 'Chưa thấy thao tác selectOption chọn "Chờ khớp". Hãy dán bản nháp từ phiên MCP').toBe(true));
check('Chỉ dùng locator, không dùng ref hay CSS', () => { expect(/aria-ref/.test(__code), 'Còn aria-ref: ref chỉ tồn tại trong phiên MCP').toBe(false); expect(/\.locator\(/.test(__code), 'Còn page.locator(...): hãy dùng getBy...').toBe(false); });
check('Không chờ cứng, đủ await', () => { expect(/waitForTimeout|setTimeout/.test(__code), 'Không cần chờ cứng: assertion của Playwright tự chờ').toBe(false); const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Có kiểm tra kết quả sau khi lọc', () => expect(__okAssert(/^(toHaveCount|toHaveText|toContainText|toBeVisible|toBeHidden)$/), 'Bản nháp từ MCP chỉ có thao tác. Hãy thêm assertion kiểm tra danh sách sau khi lọc').toBe(true));
check('Phát hiện bug "ô lọc không có tác dụng"', async () => { const r = await H.rerun('filter-broken'); expect(r.some(t => t.status === 'failed'), 'Ô lọc hỏng (vẫn hiện mọi lệnh) mà test vẫn pass. Hãy kiểm tra số dòng hoặc chắc chắn không còn lệnh khác "Chờ khớp"').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Quy trình làm việc với Playwright MCP</h3>
${TRACE(['Bước', 'Ai làm', 'Kết quả'], [['1. Mô tả luồng cần test', 'Bạn', 'Prompt rõ ràng (bài 2)'], ['2. Mở trang, chụp snapshot, thao tác', 'AI qua MCP', 'Mỗi thao tác kèm code Playwright đã chạy, locator lấy từ trang thật'], ['3. Ghép code thành test', 'AI hoặc bạn', 'Bản nháp chỉ có thao tác'], ['4. Thêm kiểm tra, sửa locator dễ vỡ', 'Bạn', 'Test có giá trị: fail khi ứng dụng sai'], ['5. Chạy, thử cài bug hoặc làm sai dữ liệu', 'Bạn', 'Chắc chắn test bắt được lỗi']])}
<p>MCP làm rất tốt bước 2: không phải đoán locator, không phải mở DevTools. Nhưng nó <strong>không biết ứng dụng đúng là thế nào</strong>. Phần đó là bước 4, của bạn.</p>
<h3>Gọi công cụ trong tab Phiên MCP</h3>
${TRACE(['Gõ', 'Tương đương', 'Ghi vào bản nháp'], [['<code>browser_navigate /orders</code>', 'mở trang', "<code>await page.goto('/orders');</code>"], ['<code>browser_snapshot</code>', 'chụp cấu trúc trang', '(không ghi, chỉ để đọc)'], ['<code>browser_click e12</code>', 'bấm phần tử có ref e12', '<code>await …click();</code>'], ['<code>browser_type e8 nội dung</code>', 'gõ chữ vào ô', "<code>await …fill('nội dung');</code>"], ['<code>browser_select_option e20 Chờ khớp</code>', 'chọn trong danh sách', "<code>await …selectOption('Chờ khớp');</code>"], ['<code>browser_wait_for Sony Group</code>', 'chờ chữ xuất hiện', '<code>await …waitFor(…);</code>']])}
<p>Có thể bỏ chữ <code>browser_</code>: gõ <code>snapshot</code>, <code>click e12</code> cũng được. Bấm vào một ref trong snapshot để điền sẵn ref đó vào ô lệnh.</p>
<h3>Từ snapshot ra assertion</h3>
<p>Snapshot sau thao tác cho thấy trang lúc đó. Đọc nó để trả lời: <em>nếu thao tác đúng thì điều gì phải đúng?</em></p>
${ANAT(['- text: 2 lệnh', 'Số lệnh sau khi lọc. Snapshot gộp chữ lại thành một dòng; trong HTML con số nằm riêng ở <code>getByTestId(\'order-count\')</code>, nên kiểm tra bằng <code>toHaveText(\'2\')</code>. Hoặc đếm dòng.'], '\n', ['- row "DH-1002 6758 Bán 200 13,250 Chờ khớp Chi tiết Hủy"', 'Dòng dữ liệu: có chữ "Chờ khớp". Kiểm tra mọi dòng đều có chữ này, hoặc không dòng nào thiếu nó.'])}
<p class="note">Góc QA: bản nháp từ MCP pass ngay lần đầu, vì nó chỉ lặp lại đúng những gì vừa làm thành công. Một test không kiểm tra gì thì lúc nào cũng pass. Đó là lý do bộ chấm luôn chạy lại test trên bản có bug.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Hai dòng đầu là bản nháp từ phiên MCP: <code>goto</code> và <code>selectOption</code> với locator <code>getByRole('combobox', { name: 'Lọc theo trạng thái' })</code> mà MCP sinh ra. Locator này đã ổn (theo nhãn của ô), giữ nguyên.</li>
<li>Phần kiểm tra là phần MCP không tự làm được: còn đúng 2 dòng dữ liệu, và không dòng nào thiếu chữ "Chờ khớp".</li>
<li>Với bug "ô lọc không có tác dụng", bảng vẫn còn 3 dòng, có dòng "Đã khớp", nên test fail đúng như mong muốn.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('lọc lệnh chờ khớp', async ({ page }) => {
  await page.goto('/orders');
  await page.getByRole('combobox', { name: 'Lọc theo trạng thái' }).selectOption('Chờ khớp');

  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasNotText: 'Chờ khớp' })).toHaveCount(0);
});` }]},
});
