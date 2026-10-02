defineExercise({
  id: 'w4.2',
  pw: true,
  kind: 'locator',
  route: '/order',
  exports: ['locators'],
  title: 'getByLabel cho form',
  desc: `<p>Trang <strong>Đặt lệnh</strong> có một form. Dùng <code>getByLabel</code> để lấy 4 phần tử theo nhãn hiển thị bên cạnh chúng:</p>
<ul>
<li><code>symbolSelect</code>: ô chọn "Mã cổ phiếu".</li>
<li><code>qtyInput</code>: ô "Khối lượng".</li>
<li><code>priceInput</code>: ô "Giá đặt".</li>
<li><code>agreeCheckbox</code>: ô tích "Tôi đồng ý với điều khoản giao dịch".</li>
</ul>`,
  hints: [
    '<code>getByLabel</code> tìm thẻ <code>&lt;label&gt;</code> có chữ phù hợp rồi trả về ô nhập được gắn với nhãn đó.',
    'Nhãn có thể gắn với ô nhập bằng <code>for="id"</code>, hoặc bọc ô nhập ở bên trong, như ô tích đồng ý.',
    '<code>page.getByLabel(\'Mã cổ phiếu\')</code>. Với nhãn dài, chỉ cần một đoạn đủ để phân biệt, ví dụ <code>\'Tôi đồng ý\'</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  symbolSelect: page.getByLabel('TODO'),
  qtyInput: page.getByLabel('TODO'),
  priceInput: page.getByLabel('TODO'),
  agreeCheckbox: page.getByLabel('TODO'),
});
`,
  tests: String.raw`
check('symbolSelect', () => H.locator('symbolSelect', '#symbol', { kinds: ['label'], kindLabel: 'getByLabel' }));
check('qtyInput', () => H.locator('qtyInput', '#qty', { kinds: ['label'], kindLabel: 'getByLabel' }));
check('priceInput', () => H.locator('priceInput', '#price', { kinds: ['label'], kindLabel: 'getByLabel' }));
check('agreeCheckbox', () => H.locator('agreeCheckbox', '#agree', { kinds: ['label'], kindLabel: 'getByLabel' }));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>getByLabel</h3>
<p>Mỗi ô nhập trong form tốt đều có nhãn (label) mô tả. <code>getByLabel</code> tìm nhãn có chữ phù hợp và trả về <strong>ô nhập gắn với nhãn đó</strong>, không phải bản thân nhãn.</p>
<p>Nhãn gắn với ô nhập theo hai cách, <code>getByLabel</code> hiểu cả hai:</p>
<pre>&lt;label for="qty"&gt;Khối lượng&lt;/label&gt;
&lt;input id="qty"&gt;

&lt;label&gt;&lt;input type="checkbox"&gt; Tôi đồng ý...&lt;/label&gt;</pre>
${ANAT(["page.getByLabel(", "Tìm ô nhập theo nhãn gắn với nó."], ["'Mã cổ phiếu'", "Chữ của nhãn, chép như trên màn hình."], ")", [".selectOption('6758')", "Thao tác trên <strong>ô nhập</strong> tìm được (không phải trên nhãn). Đây là danh sách chọn nên dùng <code>selectOption</code>. Ô nhập chữ thì dùng <code>.fill()</code>, ô tích thì <code>.check()</code>."])}
<h3>Cách lấy</h3>
<ol>
<li>Tìm chữ nằm ngay trên hoặc bên trái ô nhập. Với ô tích thì là chữ bên phải.</li>
<li>Thử <code>page.getByLabel('chữ đó')</code> trong ô Thử locator. Khớp 1 là xong.</li>
<li>Khớp 0 thì chữ đó chỉ là chữ trang trí, chưa được gắn làm nhãn. Chuột phải → Inspect để kiểm tra có thẻ <code>&lt;label&gt;</code> không; nếu không có, chuyển sang <code>getByPlaceholder</code> hoặc báo dev.</li>
</ol>
{{ex0}}
<p class="note">Góc QA: nếu một ô nhập không tìm được bằng <code>getByLabel</code>, rất có thể nó cũng khó dùng với người khiếm thị dùng trình đọc màn hình. Đây là một bug về accessibility đáng báo cho dev.</p>`,
examples:[String.raw`test('thử getByLabel', async ({ page }) => {
  await page.goto('/order');
  await page.getByLabel('Mã cổ phiếu').selectOption('6758');
  console.log('Giá tự điền:', await page.getByLabel('Giá đặt').inputValue());
  await page.getByLabel('Tôi đồng ý').check();
  console.log('Đã tích:', await page.getByLabel('Tôi đồng ý').isChecked());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Ba ô đầu gắn nhãn bằng <code>for</code>/<code>id</code>. Ô tích đồng ý nằm bên trong thẻ <code>label</code>. <code>getByLabel</code> xử lý cả hai kiểu.</li>
<li><code>getByLabel('Giá')</code> cũng chạy, vì chỉ có một nhãn chứa chữ "Giá". Nhưng viết đủ "Giá đặt" an toàn hơn nếu sau này form có thêm ô "Giá trần".</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  symbolSelect: page.getByLabel('Mã cổ phiếu'),
  qtyInput: page.getByLabel('Khối lượng'),
  priceInput: page.getByLabel('Giá đặt'),
  agreeCheckbox: page.getByLabel('Tôi đồng ý'),
});`]},
});
