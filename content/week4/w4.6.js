defineExercise({
  id: 'w4.6',
  pw: true,
  kind: 'locator',
  route: '/order',
  exports: ['locators'],
  title: 'CSS selector cơ bản',
  desc: `<p>Dùng <code>page.locator('css')</code> trên trang Đặt lệnh:</p>
<ul>
<li><code>orderForm</code>: thẻ <code>form</code> theo <strong>id</strong>.</li>
<li><code>sideRadios</code>: <strong>cả hai</strong> nút radio Mua/Bán, theo thuộc tính <code>name</code> (locator này khớp 2 phần tử là đúng).</li>
<li><code>submitButton</code>: nút gửi form, theo thuộc tính <code>type</code>.</li>
<li><code>toast</code>: khung thông báo, theo <strong>class</strong>.</li>
</ul>`,
  hints: [
    'Theo id: <code>#ten-id</code>. Theo class: <code>.ten-class</code>. Theo thuộc tính: <code>[ten="gia-tri"]</code>.',
    'Có thể ghép thẻ với thuộc tính: <code>input[name="side"]</code>, <code>button[type="submit"]</code>.',
    'Mở Inspect để đọc id của form và class của khung thông báo (khung này đang bị ẩn nhưng vẫn có trong HTML).'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  orderForm: page.locator('TODO'),
  sideRadios: page.locator('TODO'),
  submitButton: page.locator('TODO'),
  toast: page.locator('TODO'),
});
`,
  tests: String.raw`
const r = { kinds: ['css'], kindLabel: 'page.locator() với CSS selector' };
check('orderForm', () => H.locator('orderForm', '#order-form', r));
check('sideRadios (2 phần tử)', () => H.locator('sideRadios', 'input[name="side"]', r));
check('submitButton', () => H.locator('submitButton', '#order-form button[type=submit]', r));
check('toast', () => H.locator('toast', '.toast', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>CSS selector: dùng khi các cách trên không đủ</h3>
<p>Nếu bạn đã quen Selenium thì CSS không mới. Trong Playwright, viết trong <code>page.locator('...')</code>.</p>
${TRACE(['Cú pháp', 'Ý nghĩa'], [['<code>button</code>', 'theo tên thẻ'], ['<code>#order-form</code>', 'theo id'], ['<code>.toast</code>', 'theo class'], ['<code>[name="side"]</code>', 'theo thuộc tính'], ['<code>input[type="number"]</code>', 'thẻ kèm thuộc tính'], ['<code>.btn.primary</code>', 'có đồng thời hai class']])}
{{ex0}}
<p>Nhược điểm: CSS gắn chặt với cách dev viết HTML. Đổi tên class là test hỏng dù trang vẫn chạy đúng. Vì vậy Playwright xếp CSS gần cuối danh sách ưu tiên.</p>`,
examples:[String.raw`test('CSS selector cơ bản', async ({ page }) => {
  await page.goto('/order');
  console.log('radio:', await page.locator('input[name="side"]').count());
  console.log('form:', await page.locator('#order-form').count());
  console.log('nút primary:', await page.locator('.btn.primary').count());
  await expect(page.locator('.toast')).toBeHidden();
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>input[name="side"]</code> khớp cả hai radio vì chúng cùng nhóm. Muốn lấy riêng nút Bán: <code>input[name="side"][value="sell"]</code>.</li>
<li><code>button[type="submit"]</code> chỉ có một trên trang này. Để an toàn khi trang có nhiều form, ghép thêm form cha: <code>#order-form button[type="submit"]</code>.</li>
<li><code>.toast</code> vẫn tìm được dù đang bị ẩn. Locator tìm theo HTML; chuyện hiển thị hay không do assertion kiểm tra.</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  orderForm: page.locator('#order-form'),
  sideRadios: page.locator('input[name="side"]'),
  submitButton: page.locator('#order-form button[type="submit"]'),
  toast: page.locator('.toast'),
});`]},
});
