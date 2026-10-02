defineExercise({
  id: 'w4.5',
  pw: true,
  kind: 'locator',
  route: '/orders',
  exports: ['locators'],
  title: 'getByTestId',
  desc: `<p>Trang <strong>Lệnh của tôi</strong> có một số phần tử được lập trình viên gắn thuộc tính <code>data-testid</code> dành riêng cho test. Dùng <code>getByTestId</code> để lấy:</p>
<ul>
<li><code>orderCount</code>: con số đếm tổng số lệnh.</li>
<li><code>ordersTable</code>: bảng danh sách lệnh.</li>
<li><code>statusFilter</code>: ô chọn lọc theo trạng thái.</li>
</ul>
<p>Hãy dùng nút Chọn phần tử hoặc chuột phải → Inspect để tìm giá trị <code>data-testid</code>.</p>`,
  hints: [
    '<code>getByTestId</code> so khớp chính xác toàn bộ giá trị, không tìm theo một phần như <code>getByText</code>.',
    'Các giá trị cần tìm có dạng <code>order-...</code>, <code>orders-...</code>, <code>status-...</code>.',
    '<code>page.getByTestId(\'order-count\')</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  orderCount: page.getByTestId('TODO'),
  ordersTable: page.getByTestId('TODO'),
  statusFilter: page.getByTestId('TODO'),
});
`,
  tests: String.raw`
const r = { kinds: ['testid'], kindLabel: 'getByTestId' };
check('orderCount', () => H.locator('orderCount', '[data-testid="order-count"]', r));
check('ordersTable', () => H.locator('ordersTable', 'table', r));
check('statusFilter', () => H.locator('statusFilter', '#status-filter', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>data-testid: thỏa thuận giữa QA và dev</h3>
<p>Khi không có chữ hay vai trò nào ổn định (ví dụ một con số thay đổi liên tục), team có thể thống nhất gắn thuộc tính riêng cho test:</p>
<pre>&lt;span data-testid="order-count"&gt;3&lt;/span&gt;</pre>
${ANAT(["page.getByTestId(", "Tìm theo thuộc tính <code>data-testid</code> trong HTML."], ["'order-count'", "Giá trị của thuộc tính, chép đúng từng ký tự. Không viết phần <code>data-testid=</code>."], ")")}
<h3>Cách lấy</h3>
<p>Người dùng không nhìn thấy testid, nên phải chuột phải vào phần tử → Inspect, rồi tìm thuộc tính <code>data-testid</code> trong HTML. Không thấy thì phần tử đó không có testid: dùng cách khác, hoặc đề nghị dev thêm vào.</p>
{{ex0}}
<h3>Khi nào nên dùng</h3>
<ul>
<li>Nên: phần tử không có chữ cố định, hoặc chữ thay đổi theo ngôn ngữ (trang đa ngôn ngữ Nhật/Anh/Việt).</li>
<li>Không nên: dùng thay cho mọi thứ. Người dùng không nhìn thấy <code>data-testid</code>, nên test chỉ dùng testid có thể pass dù nút đã bị đổi chữ sai.</li>
</ul>
<p class="note">Góc QA: tên thuộc tính có thể cấu hình. Nhiều project dùng <code>data-test</code> hoặc <code>data-qa</code>, khai báo trong <code>playwright.config.ts</code> bằng <code>testIdAttribute</code>. Hãy hỏi team dev xem project đang quy ước thế nào.</p>`,
examples:[String.raw`test('đọc số lệnh bằng testid', async ({ page }) => {
  await page.goto('/orders');
  await expect(page.getByTestId('order-count')).toHaveText('3');
  await page.getByTestId('status-filter').selectOption('Chờ khớp');
  await expect(page.getByTestId('order-count')).toHaveText('2');
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<p><code>getByTestId</code> so khớp chính xác toàn bộ giá trị, không có chế độ khớp một phần. Viết <code>'order'</code> sẽ không tìm được gì.</p>
<p>So sánh: con số "3" không có chữ nào xung quanh để <code>getByText</code> bám vào, và nó đổi liên tục khi lọc. Đây đúng là tình huống <code>data-testid</code> phát huy tác dụng.</p>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  orderCount: page.getByTestId('order-count'),
  ordersTable: page.getByTestId('orders-table'),
  statusFilter: page.getByTestId('status-filter'),
});`]},
});
