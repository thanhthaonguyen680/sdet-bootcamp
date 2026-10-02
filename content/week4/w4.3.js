defineExercise({
  id: 'w4.3',
  pw: true,
  kind: 'locator',
  route: '/login',
  exports: ['locators'],
  title: 'getByRole: cách được khuyên dùng nhất',
  desc: `<p>Trên trang đăng nhập, dùng <code>getByRole</code> kèm <code>name</code> cho cả 5 phần tử:</p>
<ul>
<li><code>heading</code>: tiêu đề "Đăng nhập".</li>
<li><code>loginButton</code>: nút "Đăng nhập".</li>
<li><code>emailBox</code>: ô Email.</li>
<li><code>rememberCheckbox</code>: ô tích "Ghi nhớ đăng nhập".</li>
<li><code>forgotLink</code>: liên kết "Quên mật khẩu?".</li>
</ul>
<p class="note">Để ý: tiêu đề và nút cùng có chữ "Đăng nhập". <code>getByText</code> sẽ khớp cả hai, còn <code>getByRole</code> phân biệt được nhờ vai trò.</p>`,
  hints: [
    'Vai trò cần dùng: <code>heading</code>, <code>button</code>, <code>textbox</code>, <code>checkbox</code>, <code>link</code>.',
    'Tên (name) của ô nhập lấy từ nhãn của nó; tên của nút, liên kết, tiêu đề lấy từ chữ bên trong.',
    '<code>page.getByRole(\'button\', { name: \'Đăng nhập\' })</code>. Dùng nút Chọn phần tử để xem Playwright gợi ý vai trò và tên.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  heading: page.getByRole('heading', { name: 'TODO' }),
  loginButton: page.getByRole('button', { name: 'TODO' }),
  emailBox: page.getByRole('textbox', { name: 'TODO' }),
  rememberCheckbox: page.getByRole('checkbox', { name: 'TODO' }),
  forgotLink: page.getByRole('link', { name: 'TODO' }),
});
`,
  tests: String.raw`
const r = { kinds: ['role'], kindLabel: 'getByRole' };
check('heading', () => H.locator('heading', 'h1', r));
check('loginButton', () => H.locator('loginButton', '#login-form button[type=submit]', r));
check('emailBox', () => H.locator('emailBox', '#email', r));
check('rememberCheckbox', () => H.locator('rememberCheckbox', '#remember', r));
check('forgotLink', () => H.locator('forgotLink', 'a[href="/forgot"]', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vai trò (role) là gì</h3>
<p>Mỗi phần tử có một vai trò theo chuẩn accessibility: thẻ <code>button</code> có vai trò <code>button</code>, <code>a href</code> là <code>link</code>, <code>h1</code> đến <code>h6</code> là <code>heading</code>, ô nhập chữ là <code>textbox</code>, ô tích là <code>checkbox</code>... Đây là cách trình đọc màn hình "nhìn" trang web.</p>
<p>Kèm theo vai trò là <strong>tên</strong> (accessible name): với nút, liên kết, tiêu đề thì là chữ bên trong; với ô nhập thì là nhãn của nó.</p>
${ANAT(["page.getByRole(", "Tìm theo vai trò."], ["'button'", "<strong>Vai trò</strong>: phần tử là loại gì. Luôn là từ tiếng Anh viết thường, tra ở bảng cuối bài."], ", { ", ["name", "Từ khóa cố định, luôn viết đúng là <code>name</code>."], ": ", ["'Đăng nhập'", "<strong>Tên</strong>: chữ người dùng nhìn thấy trên nút. Với ô nhập là chữ của nhãn."], " })")}
<p>Đọc cả dòng: “tìm <strong>nút</strong> có tên <strong>Đăng nhập</strong>”. Chỉ cần trả lời hai câu hỏi: nó là cái gì, và trên nó ghi chữ gì.</p>
<h3>Cách lấy role và name</h3>
<ol>
<li><strong>Role</strong>: bấm để gửi hoặc thực hiện việc gì → <code>button</code>; bấm để sang trang khác → <code>link</code>; chữ to làm tiêu đề → <code>heading</code>; ô gõ chữ → <code>textbox</code>. Xem thêm bảng cuối bài.</li>
<li><strong>Name</strong>: chữ trên nút, liên kết, tiêu đề; nhãn của ô nhập.</li>
<li>Thử trong ô Thử locator. Không chắc role là gì thì dùng <em>Chọn phần tử</em>, gợi ý đầu tiên thường là <code>getByRole</code> với đúng role và name.</li>
</ol>
<p class="note">Trên trang thật: chuột phải → Inspect → mở tab <strong>Accessibility</strong> trong DevTools của Chrome, mục <em>Computed Properties</em> ghi sẵn <strong>Role</strong> và <strong>Name</strong> của phần tử đang chọn.</p>
{{ex0}}
<h3>Vì sao getByRole được ưu tiên</h3>
<ul>
<li>Phân biệt được những thứ có cùng chữ: tiêu đề "Đăng nhập" và nút "Đăng nhập".</li>
<li>Gần với cách người dùng thật nhận biết: "cái nút tên là Đăng nhập", không phải "thẻ button có class btn-primary".</li>
<li>Bền vững: dev đổi class, đổi cấu trúc HTML thì locator vẫn chạy, miễn là nút vẫn tên như vậy.</li>
</ul>
<h3>Một số vai trò hay gặp</h3>
${TRACE(['HTML', 'Vai trò'], [['&lt;button&gt;, &lt;input type="submit"&gt;', 'button'], ['&lt;a href&gt;', 'link'], ['&lt;h1&gt;...&lt;h6&gt;', 'heading'], ['&lt;input type="text|email|password"&gt;', 'textbox'], ['&lt;input type="checkbox"&gt;', 'checkbox'], ['&lt;input type="radio"&gt;', 'radio'], ['&lt;select&gt;', 'combobox'], ['&lt;tr&gt;, &lt;th&gt;, &lt;td&gt;', 'row, columnheader, cell']])}`,
examples:[String.raw`test('getByRole phân biệt tiêu đề và nút', async ({ page }) => {
  await page.goto('/login');
  console.log('getByText:', await page.getByText('Đăng nhập', { exact: true }).count());
  console.log('heading:', await page.getByRole('heading', { name: 'Đăng nhập' }).count());
  console.log('button:', await page.getByRole('button', { name: 'Đăng nhập' }).count());
  await page.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }).check();
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tiêu đề và nút cùng chữ "Đăng nhập" nhưng khác vai trò, nên mỗi locator khớp đúng một phần tử.</li>
<li>Tên của ô Email là chữ trong nhãn của nó. Ô mật khẩu có tên "Mật khẩu" nên không bị lẫn.</li>
<li>Nút đăng nhập có id sinh ngẫu nhiên (<code>btn-xxxxx</code>). Dùng <code>getByRole</code> không phụ thuộc vào id đó.</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  heading: page.getByRole('heading', { name: 'Đăng nhập' }),
  loginButton: page.getByRole('button', { name: 'Đăng nhập' }),
  emailBox: page.getByRole('textbox', { name: 'Email' }),
  rememberCheckbox: page.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' }),
  forgotLink: page.getByRole('link', { name: 'Quên mật khẩu?' }),
});`]},
});
