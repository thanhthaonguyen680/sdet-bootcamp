defineExercise({
  id: 'w6.10',
  pw: true,
  kind: 'locator',
  route: '/order',
  exports: ['locators'],
  title: 'Đọc snapshot của Playwright MCP',

  // Phiên AI ghi sẵn, hiện ở tab "Phiên MCP" (xem js/mcp/pane.js)
  mcp: {
    prompt: 'Mở trang Đặt lệnh của Sàn Demo và cho mình biết form có những ô nào.',
    steps: [
      { say: 'Mình sẽ mở trang rồi chụp cấu trúc trang (snapshot) để đọc role và tên của từng phần tử.' },
      { tool: 'browser_navigate', url: '/order' },
      { tool: 'browser_snapshot' },
      { say: 'Form Đặt lệnh gồm: ô chọn mã cổ phiếu ({{ref:page.getByRole(\'combobox\', { name: \'Mã cổ phiếu\' })}}), hai nút chọn Mua và Bán, ô khối lượng ({{ref:page.getByRole(\'spinbutton\', { name: \'Khối lượng\' })}}), ô giá đặt, ô tích đồng ý điều khoản và nút Đặt lệnh. Nút Đặt lệnh đang <code>[disabled]</code>: phải tích đồng ý thì mới bấm được.' },
    ],
  },

  desc: `<p>Mở tab <strong>Phiên MCP</strong>: AI vừa mở trang Đặt lệnh và chụp <strong>snapshot</strong>, tức bản mô tả cấu trúc trang mà Playwright MCP gửi cho AI. Mỗi dòng có dạng:</p>
<pre>- button "Đặt lệnh" [disabled] [ref=e31]</pre>
<p>Dựa vào snapshot, viết locator <code>getByRole</code> cho 6 phần tử, trả về trong hàm <code>locators(page)</code>:</p>
<ul>
<li><code>symbolSelect</code>: ô chọn mã cổ phiếu.</li>
<li><code>sellRadio</code>: nút chọn loại lệnh Bán.</li>
<li><code>qtyInput</code>: ô khối lượng.</li>
<li><code>agreeCheckbox</code>: ô tích đồng ý điều khoản.</li>
<li><code>submitButton</code>: nút Đặt lệnh.</li>
<li><code>ordersLink</code>: liên kết "Lệnh của tôi" trên menu.</li>
</ul>
<p class="note">Chỉ dùng <code>getByRole</code>, và không dùng <code>ref</code>: ref là mã tạm của phiên MCP, test chạy ở chỗ khác sẽ không có (bài 9).</p>`,
  hints: [
    'Mỗi dòng snapshot cho đủ hai thứ getByRole cần: chữ ngay sau dấu gạch đầu dòng là <strong>role</strong>, chữ trong nháy kép là <strong>tên</strong>. Ví dụ <code>- link "Bảng giá"</code> thành <code>page.getByRole(\'link\', { name: \'Bảng giá\' })</code>.',
    'Đọc role trong snapshot, đừng đoán theo hình dáng: ô nhập số có role <code>spinbutton</code> chứ không phải <code>textbox</code>; ô chọn (select) là <code>combobox</code>.',
    'Tên dài như "Tôi đồng ý với điều khoản giao dịch" chỉ cần một phần: <code>{ name: \'Tôi đồng ý\' }</code>. Nút "Đặt lệnh" và liên kết "Đặt lệnh" trên menu khác role, nên <code>getByRole(\'button\', ...)</code> không bị nhầm.'],
  starter: LOC_HEAD + String.raw`// Mở tab "Phiên MCP" để xem snapshot trang Đặt lệnh mà AI vừa chụp.
// Mỗi dòng snapshot:   - <role> "<tên>" [ref=eN]
// Viết thành:          page.getByRole('<role>', { name: '<tên>' })     (không dùng ref)
const locators = (page: Page) => ({
  symbolSelect: page.getByRole('TODO', { name: 'TODO' }),
  sellRadio: page.getByRole('TODO', { name: 'TODO' }),
  qtyInput: page.getByRole('TODO', { name: 'TODO' }),
  agreeCheckbox: page.getByRole('TODO', { name: 'TODO' }),
  submitButton: page.getByRole('TODO', { name: 'TODO' }),
  ordersLink: page.getByRole('TODO', { name: 'TODO' }),
});
`,
  tests: String.raw`
const r = { kinds: ['role'], kindLabel: 'getByRole với role và tên đọc từ snapshot' };
check('Không dùng ref của phiên MCP', () => expect(/aria-ref|\[ref=|['"]e\d+['"]/.test(__code), 'Ref là mã tạm của phiên MCP, test chạy ở chỗ khác sẽ không có. Hãy dùng role và tên').toBe(false));
check('symbolSelect: ô chọn mã cổ phiếu', () => H.locator('symbolSelect', '#symbol', r));
check('sellRadio: nút chọn Bán', () => H.locator('sellRadio', 'input[name="side"][value="sell"]', r));
check('qtyInput: ô khối lượng', () => H.locator('qtyInput', '#qty', r));
check('agreeCheckbox: ô tích đồng ý', () => H.locator('agreeCheckbox', '#agree', r));
check('submitButton: nút Đặt lệnh', () => H.locator('submitButton', '#order-form button[type=submit]', r));
check('ordersLink: liên kết Lệnh của tôi', () => H.locator('ordersLink', 'nav a[href="/orders"]', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>MCP là gì</h3>
<p><strong>MCP</strong> (Model Context Protocol) là cách chuẩn để cấp "công cụ" cho AI. Bản thân AI chỉ đọc và viết chữ; khi có MCP, nó gọi được công cụ bên ngoài rồi đọc kết quả. <strong>Playwright MCP</strong> cung cấp các công cụ điều khiển trình duyệt:</p>
${TRACE(['Công cụ', 'Việc', 'Tương đương trong test'], [['<code>browser_navigate</code>', 'mở một địa chỉ', '<code>page.goto(...)</code>'], ['<code>browser_snapshot</code>', 'chụp cấu trúc trang để đọc', '(không có, đây là "mắt" của AI)'], ['<code>browser_click</code>', 'bấm vào phần tử theo ref', '<code>.click()</code>'], ['<code>browser_type</code>', 'gõ chữ vào ô', '<code>.fill(...)</code>'], ['<code>browser_select_option</code>', 'chọn trong danh sách', '<code>.selectOption(...)</code>'], ['<code>browser_wait_for</code>', 'chờ một đoạn chữ xuất hiện', '<code>.waitFor()</code>']])}
<p>Khác với bài 5 (AI đoán locator khi không nhìn thấy trang), ở đây AI <strong>đọc trang thật</strong> qua snapshot, nên role và tên đúng với trang.</p>
<h3>Đọc một dòng snapshot</h3>
<p>Snapshot không phải HTML. Nó là cây <strong>accessibility</strong>: mỗi phần tử được mô tả bằng role và tên, đúng thứ <code>getByRole</code> dùng để tìm.</p>
${ANAT(['- ', 'Gạch đầu dòng. Dòng thụt vào là phần tử con của dòng bên trên.'], ['button', '<strong>Role</strong>: phần tử là loại gì.'], ' ', ['"Đặt lệnh"', '<strong>Tên</strong> (accessible name): chữ người dùng nhìn thấy, hoặc nhãn của ô nhập.'], ' ', ['[disabled]', 'Trạng thái: <code>[checked]</code> đã tích, <code>[disabled]</code> đang khóa, <code>[pressed]</code> đang nhấn, <code>[level=1]</code> tiêu đề cấp 1.'], ' ', ['[ref=e31]', '<strong>Ref</strong>: mã tạm để AI bấm vào phần tử trong phiên này. Không đưa vào test.'])}
<p>Chuyển sang locator: lấy role và tên, bỏ ref.</p>
${ANAT(['page.getByRole(', 'Tìm theo role.'], ["'button'", 'Role lấy từ snapshot.'], ', { name: ', ["'Đặt lệnh'", 'Tên lấy từ snapshot.'], ' })')}
<h3>Role đúng thường khác với cách gọi thông thường</h3>
${TRACE(['Phần tử', 'Hay gọi là', 'Role trong snapshot'], [['<code>&lt;input type="number"&gt;</code>', 'ô nhập', '<code>spinbutton</code>'], ['<code>&lt;input type="search"&gt;</code>', 'ô tìm kiếm', '<code>searchbox</code>'], ['<code>&lt;select&gt;</code>', 'dropdown', '<code>combobox</code>'], ['<code>&lt;a href&gt;</code>', 'nút trên menu', '<code>link</code>'], ['<code>&lt;h1&gt;</code>', 'tiêu đề', '<code>heading [level=1]</code>']])}
<p>Đây là lý do nên đọc snapshot thay vì đoán: viết <code>getByRole('textbox', { name: 'Khối lượng' })</code> sẽ khớp 0 phần tử.</p>
<h3>Tự thử</h3>
<p>Trong tab <strong>Phiên MCP</strong>, gõ <code>browser_snapshot</code> rồi bấm Gọi. Rê chuột vào một ref trong snapshot: phần tử tương ứng sáng lên trên trang. Bấm vào ref để điền sẵn lệnh <code>browser_click</code>.</p>
<p class="note">Góc QA: snapshot cũng là cách nhanh để kiểm tra accessibility. Ô nào trong snapshot không có tên (chỉ có <code>- textbox</code>) thì người dùng trình đọc màn hình cũng không biết ô đó để làm gì.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Đối chiếu với snapshot</h3>
${TRACE(['Dòng trong snapshot', 'Locator'], [["<code>- combobox \"Mã cổ phiếu\"</code>", "<code>getByRole('combobox', { name: 'Mã cổ phiếu' })</code>"], ["<code>- radio \"Bán\"</code>", "<code>getByRole('radio', { name: 'Bán' })</code>"], ["<code>- spinbutton \"Khối lượng\"</code>", "<code>getByRole('spinbutton', { name: 'Khối lượng' })</code>"], ["<code>- checkbox \"Tôi đồng ý với điều khoản giao dịch\"</code>", "<code>getByRole('checkbox', { name: 'Tôi đồng ý' })</code>"], ["<code>- button \"Đặt lệnh\" [disabled]</code>", "<code>getByRole('button', { name: 'Đặt lệnh' })</code>"], ["<code>- link \"Lệnh của tôi\"</code>", "<code>getByRole('link', { name: 'Lệnh của tôi' })</code>"]])}
<p>Trạng thái như <code>[disabled]</code> không đưa vào locator: nút vẫn là nút đó dù đang khóa hay không. Muốn kiểm tra trạng thái thì dùng assertion, ví dụ <code>await expect(nút).toBeDisabled()</code>.</p>`,
examples:[{ run:false, code: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  symbolSelect: page.getByRole('combobox', { name: 'Mã cổ phiếu' }),
  sellRadio: page.getByRole('radio', { name: 'Bán' }),
  qtyInput: page.getByRole('spinbutton', { name: 'Khối lượng' }),
  agreeCheckbox: page.getByRole('checkbox', { name: 'Tôi đồng ý' }),
  submitButton: page.getByRole('button', { name: 'Đặt lệnh' }),
  ordersLink: page.getByRole('link', { name: 'Lệnh của tôi' }),
});` }]},
});
