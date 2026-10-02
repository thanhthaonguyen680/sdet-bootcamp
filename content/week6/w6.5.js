defineExercise({
  id: 'w6.5',
  pw: true,
  kind: 'locator',
  route: '/order',
  exports: ['locators'],
  title: 'Locator do AI bịa ra',
  desc: `<p>Bạn nhờ AI viết locator cho form <strong>Đặt lệnh</strong>. AI không nhìn thấy trang của bạn, nên nó đoán tên theo những trang "thường gặp". Kết quả: một số locator đúng, một số AI tự bịa.</p>
<p>Bấm <strong>Chạy</strong> để xem mỗi locator khớp bao nhiêu phần tử, hoặc thử từng cái trong ô <strong>Thử locator</strong> ở tab Trang web. Sửa những locator sai để mỗi locator khớp đúng 1 phần tử, chỉ dùng <code>getBy...</code>.</p>
<ul>
<li><code>symbolSelect</code>: ô chọn mã cổ phiếu.</li>
<li><code>qtyInput</code>, <code>priceInput</code>: ô khối lượng, ô giá đặt.</li>
<li><code>agreeCheckbox</code>: ô tích đồng ý điều khoản.</li>
<li><code>sellRadio</code>: nút chọn loại lệnh Bán.</li>
<li><code>submitButton</code>: nút gửi lệnh.</li>
</ul>
<p class="note">Đừng sửa những locator đã đúng. Một phần của kỹ năng là phân biệt AI sai ở đâu và đúng ở đâu.</p>`,
  hints: [
    'Locator khớp 0 phần tử là dấu hiệu AI bịa tên. So chữ trong locator với chữ thật trên trang: nhãn ô là "Khối lượng" chứ không phải "Số lượng".',
    'Ô giá không có placeholder, nhưng có nhãn "Giá đặt". Nút Bán có nhãn tiếng Việt "Bán", không phải "Sell".',
    '<code>page.getByLabel(\'Khối lượng\')</code>, <code>page.getByLabel(\'Giá đặt\')</code>, <code>page.getByRole(\'radio\', { name: \'Bán\' })</code>, <code>page.getByRole(\'button\', { name: \'Đặt lệnh\' })</code>.'],
  starter: LOC_HEAD + String.raw`// Locator do AI viết. Một số đúng, một số AI tự bịa.
const locators = (page: Page) => ({
  symbolSelect: page.getByRole('combobox', { name: 'Mã cổ phiếu' }),
  qtyInput: page.getByLabel('Số lượng'),
  priceInput: page.getByPlaceholder('Nhập giá'),
  agreeCheckbox: page.getByRole('checkbox', { name: 'đồng ý' }),
  sellRadio: page.getByRole('radio', { name: 'Sell' }),
  submitButton: page.getByRole('button', { name: 'Submit' }),
});
`,
  tests: String.raw`
const r = { kinds: ['role', 'label', 'placeholder', 'text', 'testid'], kindLabel: 'một cách getBy... (không dùng CSS)' };
check('symbolSelect: ô chọn mã cổ phiếu', () => H.locator('symbolSelect', '#symbol', r));
check('qtyInput: ô khối lượng', () => H.locator('qtyInput', '#qty', r));
check('priceInput: ô giá đặt', () => H.locator('priceInput', '#price', r));
check('agreeCheckbox: ô tích đồng ý', () => H.locator('agreeCheckbox', '#agree', r));
check('sellRadio: nút chọn Bán', () => H.locator('sellRadio', 'input[name="side"][value="sell"]', r));
check('submitButton: nút Đặt lệnh', () => H.locator('submitButton', '#order-form button[type=submit]', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>AI không nhìn thấy trang của bạn</h3>
<p>Khi bạn chỉ mô tả bằng lời, AI viết locator theo những trang nó "từng thấy": nút tên <code>Submit</code>, ô tên <code>Số lượng</code>, ô có placeholder <code>Nhập giá</code>. Locator đó đúng cú pháp, chạy không báo lỗi cú pháp, nhưng <strong>khớp 0 phần tử</strong>.</p>
<h3>Kiểm chứng từng locator</h3>
<ol>
<li>Chép locator vào ô <strong>Thử locator</strong> ở tab Trang web (trên máy thật: <code>npx playwright codegen</code> hoặc nút "Pick locator" trong VS Code).</li>
<li>Khớp 1: giữ nguyên. Khớp 0: AI bịa tên, so với chữ thật trên trang. Khớp nhiều: thêm <code>exact: true</code> hoặc tìm trong một vùng nhỏ hơn.</li>
<li>Không sửa những locator đã đúng, chỉ vì "AI viết thì chắc sai".</li>
</ol>
${ANAT("page.getByRole('radio', { name: ", ["'Sell'", "AI đoán theo trang tiếng Anh. Chữ thật trên trang là <strong>Bán</strong>."], " })  →  khớp 0 phần tử")}
<h3>Cho AI nhìn thấy trang</h3>
<p>Cách giảm locator bịa từ gốc: đưa cho AI thông tin thật của trang. Ví dụ dán đoạn HTML của form (chuột phải → Inspect → Copy element), hoặc dùng <strong>Playwright MCP</strong> để AI tự mở trang và đọc cây accessibility (bài 8). Khi đó AI viết locator theo đúng nhãn, đúng role của trang.</p>
<p class="note">Góc QA: locator khớp 0 phần tử là lỗi dễ thấy. Nguy hiểm hơn là locator khớp <em>nhầm</em> 1 phần tử khác. Luôn nhìn phần tử được khoanh trên trang, đừng chỉ nhìn con số.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>AI đúng ở đâu, sai ở đâu</h3>
${TRACE(['Locator', 'AI viết', 'Kết luận'], [['symbolSelect', "<code>getByRole('combobox', { name: 'Mã cổ phiếu' })</code>", 'Đúng, giữ nguyên'], ['qtyInput', "<code>getByLabel('Số lượng')</code>", 'Bịa: nhãn thật là "Khối lượng"'], ['priceInput', "<code>getByPlaceholder('Nhập giá')</code>", 'Bịa: ô không có placeholder, dùng nhãn "Giá đặt"'], ['agreeCheckbox', "<code>getByRole('checkbox', { name: 'đồng ý' })</code>", 'Đúng: tên chỉ cần chứa "đồng ý", không phân biệt hoa thường'], ['sellRadio', "<code>getByRole('radio', { name: 'Sell' })</code>", 'Bịa: trang tiếng Việt, tên là "Bán"'], ['submitButton', "<code>getByRole('button', { name: 'Submit' })</code>", 'Bịa: chữ trên nút là "Đặt lệnh"']])}`,
examples:[{ run:false, code: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  symbolSelect: page.getByRole('combobox', { name: 'Mã cổ phiếu' }),
  qtyInput: page.getByLabel('Khối lượng'),
  priceInput: page.getByLabel('Giá đặt'),
  agreeCheckbox: page.getByRole('checkbox', { name: 'đồng ý' }),
  sellRadio: page.getByRole('radio', { name: 'Bán' }),
  submitButton: page.getByRole('button', { name: 'Đặt lệnh' }),
});` }]},
});
