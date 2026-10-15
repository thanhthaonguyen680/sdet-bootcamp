defineExercise({
  id: 'w6.15',
  pw: true,
  route: '/dashboard',
  title: 'Kiểm chứng test AI viết',

  // AI ghi sẵn, chạy khi bấm nút "AI viết test" (xem js/mcp/ai-writer.js).
  // Test AI viết pass ngay, nhưng có 2 lỗi hay gặp: locator dòng chứa cả giá (code Playwright MCP sinh ra lúc bấm),
  // và câu kiểm tra chỉ xem chữ đã có sẵn trên trang.
  mcp: {
    tasks: [{
      match: [/theo doi/],
      plan: (prompt, p) => { const st = W6_STOCK(p, '6758'); return {
        name: 'theo dõi cổ phiếu ' + st.name,
        reply: 'Được. Mình mở Bảng giá, bấm Theo dõi ở dòng ' + st.name + ' rồi viết test.',
        steps: [
          { label: 'Mở trang Bảng giá', tool: 'browser_navigate', url: '/dashboard' },
          { label: 'Chờ bảng giá tải xong', tool: 'browser_wait_for', text: st.name },
          { label: 'Bấm Theo dõi ở dòng ' + st.name, tool: 'browser_click', element: 'nút Theo dõi ở dòng ' + st.name,
            target: "page.getByRole('row').filter({ hasText: '" + st.code + "' }).getByRole('button', { name: 'Theo dõi' })" },
          { label: 'Kiểm tra: dòng ' + st.name + ' có trên bảng', expect: "await expect(page.getByText('" + st.name + "')).toBeVisible();" },
        ],
        done: 'Xong! Nút đã chuyển thành "Đang theo dõi". Test chạy được ngay, bạn thử nhé.',
      }; },
    }],
    unknown: 'Bài này mình làm việc trên Bảng giá: theo dõi một mã cổ phiếu rồi viết test. Ví dụ: Theo dõi cổ phiếu Sony trên Bảng giá rồi viết test.',
  },

  desc: `<p>Ô soạn code có sẵn yêu cầu nhờ AI theo dõi cổ phiếu <strong>Sony</strong> trên Bảng giá rồi viết test. Bấm <strong>AI viết test</strong>, rồi <strong>Chạy</strong>: test pass. Nhưng bấm <strong>Kiểm tra bài</strong> sẽ thấy chưa đạt. Test AI viết có 2 vấn đề:</p>
<ol>
<li>Tìm dòng Sony bằng <strong>toàn bộ chữ của dòng</strong>, kể cả giá. Giá đổi liên tục, đổi là test vỡ.</li>
<li>Phần kiểm tra chỉ xem chữ "Sony Group" có hiện. Chữ đó có sẵn từ trước khi bấm, nên nút Theo dõi hỏng thì test vẫn pass.</li>
</ol>
<p>Hãy sửa test: tìm dòng Sony bằng chữ định danh ổn định, bấm "Theo dõi" trong dòng đó, rồi kiểm tra nút của dòng Sony đã chuyển sang "Đang theo dõi".</p>
<p class="note">Bộ chấm chạy lại test khi giá đã nhảy sang phiên khác: test phải vẫn pass. Rồi chạy trên phiên bản có bug "bấm Theo dõi không có tác dụng": test phải fail.</p>`,
  hints: [
    'Tìm dòng theo tên công ty hoặc mã, chữ này không đổi: <code>page.getByRole(\'row\').filter({ hasText: \'Sony\' })</code>. Lưu vào một biến để dùng lại ở bước kiểm tra.',
    'Bấm nút trong dòng đó: <code>sony.getByRole(\'button\', { name: \'Theo dõi\' })</code>. Sau khi bấm, chữ trên nút đổi thành "Đang theo dõi".',
    'Kiểm tra đúng kết quả của thao tác: <code>await expect(sony.getByRole(\'button\', { name: \'Đang theo dõi\' })).toBeVisible();</code> hoặc kiểm tra thuộc tính <code>aria-pressed</code> là <code>\'true\'</code>.'],
  starter: String.raw`// Bấm nút "AI viết test", Chạy thử, rồi Kiểm tra bài. Sau đó tự sửa test AI viết cho bền và kiểm tra đúng kết quả.
// AI: Theo dõi cổ phiếu Sony trên Bảng giá rồi viết test cho thao tác này
`,
  tests: PWG + AWAIT_LINT + String.raw`
const __sonyPressed = () => [...H.doc().querySelectorAll('tbody tr')].map(tr => ({ sony: tr.textContent.includes('Sony'), pressed: !!tr.querySelector('button[aria-pressed="true"]') }));
check('Có ít nhất một test và tất cả pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Đã theo dõi đúng dòng Sony', () => { const rows = __sonyPressed(); expect(rows.some(r => r.sony && r.pressed), 'Nút của dòng Sony chưa ở trạng thái đang theo dõi').toBe(true); expect(rows.some(r => !r.sony && r.pressed), 'Có dòng khác Sony cũng bị bấm Theo dõi').toBe(false); });
check('Không chờ cứng, đủ await', () => { expect(/waitForTimeout|setTimeout/.test(__src), 'Không cần chờ cứng: assertion của Playwright tự chờ').toBe(false); const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Không phụ thuộc vào giá: giá đổi thì test vẫn pass', async () => { const r = await H.rerun('price-tick'); expect(r.length > 0 && r.every(t => t.status === 'passed'), 'Giá trên bảng vừa nhảy sang phiên khác và test bị fail. Locator đang dựa vào giá hoặc chữ đầy đủ của dòng: hãy tìm dòng bằng tên công ty hoặc mã').toBe(true); });
check('Phát hiện bug "bấm Theo dõi không có tác dụng"', async () => { const r = await H.rerun('watch-broken'); expect(r.some(t => t.status === 'failed'), 'Nút Theo dõi không đổi trạng thái mà test vẫn pass. Hãy kiểm tra nút của dòng Sony đã chuyển sang Đang theo dõi').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Test pass chưa chắc là test tốt</h3>
<p>Test AI viết từ phiên MCP thường <strong>pass ngay lần đầu</strong>, vì nó chỉ lặp lại đúng những gì AI vừa làm thành công. Câu cần hỏi không phải "test có chạy không" mà là:</p>
<ul>
<li><strong>Ngày mai còn chạy không?</strong> Dữ liệu đổi (giá, ngày giờ, số lượng) thì locator còn đúng không?</li>
<li><strong>Ứng dụng sai thì test có fail không?</strong> Nếu thao tác không có tác dụng, phần kiểm tra có phát hiện ra không?</li>
</ul>
<h3>"Duy nhất lúc này" khác với "bền theo thời gian"</h3>
<p>Khi AI bấm một phần tử, Playwright MCP ghi lại locator <strong>khớp đúng 1 phần tử tại thời điểm đó</strong>. Bảng giá có 6 nút "Theo dõi" giống nhau, nên nó phải khoanh theo dòng, và tên của dòng là toàn bộ chữ trong dòng:</p>
${ANAT("page.getByRole('row', { name: '6758 Sony Group ", ['13,200 -120', 'Giá và mức thay đổi. Đổi theo từng giây, nên locator đúng lúc ghi lại nhưng vỡ ở lần chạy sau.'], " Mua Theo dõi' })\n  .getByRole('button', { name: 'Theo dõi' })")}
<p>Sửa bằng cách chọn <strong>chữ định danh ổn định</strong> của dòng (mã cổ phiếu, tên công ty), giống tuần 4:</p>
${ANAT("const sony = page.getByRole('row')", ['.filter({ hasText: \'Sony\' })', 'Giữ dòng có chữ "Sony". Tên công ty không đổi theo giá.'], ";\nawait sony.getByRole('button', { name: 'Theo dõi' }).click();")}
<h3>Kiểm tra điều thay đổi, không kiểm tra điều có sẵn</h3>
<p>AI hay thêm câu kiểm tra dựa trên những gì nó nhìn thấy, ví dụ chữ "Sony Group" có hiện. Chữ đó có từ trước khi bấm, nên câu kiểm tra luôn đúng. Hãy hỏi: <em>thao tác này thành công thì điều gì phải thay đổi?</em> Ở đây là nút của dòng Sony chuyển thành "Đang theo dõi".</p>
<h3>Checklist review test AI viết</h3>
${TRACE(['Dấu hiệu', 'Vì sao có hại', 'Sửa thành'], [['Locator chứa giá, ngày giờ, số đếm', 'Dữ liệu đổi là test vỡ', 'Lọc theo chữ ổn định: mã, tên'], ['Kiểm tra điều đã đúng từ trước thao tác', 'Thao tác hỏng test vẫn pass', 'Kiểm tra điều thao tác làm thay đổi'], ['<code>waitForTimeout(2000)</code>', 'Chậm, và vẫn fail khi máy chậm hơn', 'Bỏ đi: thao tác và assertion đã tự chờ'], ['Thiếu <code>await</code>', 'Test lúc pass lúc fail', 'Thêm <code>await</code>'], ['<code>locator(\'#id\')</code>, <code>.first()</code>', 'Dev đổi id, thêm dòng là test vỡ hoặc chọn nhầm', '<code>getByRole</code>, <code>getByLabel</code>, lọc theo chữ'], ['<code>expect(locator).toBeTruthy()</code>', 'Locator luôn là object nên luôn đúng', '<code>await expect(locator).toContainText(...)</code>']])}
<p class="note">Góc QA: cách nhanh nhất để biết test có giá trị không là <strong>cố tình làm sai</strong>: đổi dữ liệu mong đợi, hoặc thử trên bản có bug. Test phải fail. Bộ chấm của bài này làm đúng việc đó.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tìm dòng theo tên công ty, không theo giá, nên khi giá nhảy test vẫn pass.</li>
<li>Kiểm tra đúng kết quả của thao tác: nút của dòng Sony đã là "Đang theo dõi" và có <code>aria-pressed="true"</code>. Với bug "bấm không có tác dụng", nút vẫn là "Theo dõi" nên test fail đúng như mong muốn.</li>
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
