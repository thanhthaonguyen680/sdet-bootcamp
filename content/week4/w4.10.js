defineExercise({
  id: 'w4.10',
  pw: true,
  kind: 'locator',
  route: '/orders',
  exports: ['locators'],
  title: 'Strict mode và locator bền vững',
  desc: `<p>Bài khó nhất của phần locator. Trên trang Lệnh của tôi, mỗi dòng có nút "Chi tiết" và "Hủy" giống nhau, và <strong>id của nút Chi tiết thay đổi mỗi lần tải trang</strong>. Bộ chấm sẽ tải lại trang trước khi kiểm tra, nên locator dựa vào id sẽ trượt.</p>
<ul>
<li><code>cancel1002</code>: nút "Hủy" của lệnh DH-1002.</li>
<li><code>detail9984</code>: nút "Chi tiết" của lệnh mã 9984.</li>
<li><code>status1003</code>: nhãn trạng thái của lệnh DH-1003.</li>
<li><code>cancelButtons</code>: cả 3 nút "Hủy" (kể cả nút đang bị vô hiệu hóa).</li>
</ul>
<p>Thử trong ô Thử locator: <code>page.getByRole('button', { name: 'Hủy' })</code> khớp 3 phần tử. Nếu gọi <code>.click()</code> trên locator này, Playwright sẽ báo lỗi strict mode.</p>`,
  hints: [
    'Hãy tìm dòng bằng chữ ổn định (số hiệu lệnh, mã cổ phiếu), không dựa vào id hay thứ tự dòng.',
    '<code>page.getByRole(\'row\').filter({ hasText: \'DH-1002\' }).getByRole(\'button\', { name: \'Hủy\' })</code>.',
    'Nhãn trạng thái không có role riêng. Tìm dòng trước, rồi tìm theo chữ trạng thái bên trong dòng: <code>.getByText(\'Chờ khớp\')</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  cancel1002: page.getByText('TODO'),
  detail9984: page.getByText('TODO'),
  status1003: page.getByText('TODO'),
  cancelButtons: page.getByText('TODO'),
});
`,
  tests: String.raw`
const rowOf = f => d => [...d.querySelectorAll('tbody tr')].filter(f);
check('cancel1002', () => H.locator('cancel1002', d => rowOf(tr => tr.cells[0].textContent === 'DH-1002')(d).map(tr => tr.querySelector('button.danger'))));
check('detail9984 (vẫn đúng sau khi tải lại trang)', () => H.locator('detail9984', d => rowOf(tr => tr.cells[1].textContent === '9984')(d).map(tr => tr.querySelector('button:not(.danger)'))));
check('status1003', () => H.locator('status1003', d => rowOf(tr => tr.cells[0].textContent === 'DH-1003')(d).map(tr => tr.querySelector('.badge'))));
check('cancelButtons (3 nút)', () => H.locator('cancelButtons', 'button.danger'));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Strict mode</h3>
<p>Khi bạn click, fill hay kiểm tra một phần tử, Playwright yêu cầu locator khớp <strong>đúng một</strong> phần tử. Khớp nhiều hơn sẽ báo lỗi ngay thay vì đoán bừa.</p>
{{ex0}}
<p>Selenium <code>findElement</code> lặng lẽ lấy phần tử đầu tiên, nên test có thể click nhầm mà không ai biết. Strict mode của Playwright buộc bạn viết locator rõ ràng.</p>
<h3>Khớp nhiều phần tử thì sửa thế nào</h3>
<ol>
<li>Các phần tử chỉ giống <strong>một phần</strong> tên (“Mua” và “Mua ký quỹ”): thêm <code>exact: true</code>.</li>
<li>Các phần tử <strong>giống hệt</strong> nhau, mỗi dòng một nút “Hủy”: tìm dòng theo dữ liệu định danh rồi tìm nút trong dòng, như bài 6: <code>page.getByRole('row').filter({ hasText: 'DH-1002' }).getByRole('button', { name: 'Hủy' })</code>.</li>
<li>Tránh thêm <code>.first()</code> hay <code>.nth()</code> chỉ để hết lỗi: khi dữ liệu đổi thứ tự, test sẽ bấm nhầm mà vẫn chạy.</li>
</ol>
<h3>Thế nào là locator bền vững</h3>
${TRACE(['Nên dựa vào', 'Tránh dựa vào'], [['Chữ người dùng nhìn thấy', 'Id, class sinh tự động'], ['Vai trò và tên', 'Thứ tự dòng, vị trí trên trang'], ['Dữ liệu định danh (số hiệu lệnh, mã)', 'Cấu trúc lồng nhau dài: div &gt; div &gt; div'], ['data-testid đã thống nhất', 'XPath tuyệt đối /html/body/div[2]/...']])}
<p class="note">Góc QA: phần lớn test "flaky" ngoài lỗi thời gian là do locator yếu. Viết locator tốt từ đầu tiết kiệm rất nhiều thời gian bảo trì về sau.</p>`,
examples:[String.raw`test('lỗi strict mode', async ({ page }) => {
  await page.goto('/orders');
  const all = page.getByRole('button', { name: 'Hủy' });
  console.log('Số nút Hủy:', await all.count());
  await all.click();   // lỗi: khớp 3 phần tử
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi locator neo vào dữ liệu định danh (số hiệu lệnh, mã cổ phiếu), thứ không đổi khi tải lại trang hay khi thêm lệnh mới.</li>
<li><code>detail9984</code>: nếu dùng <code>#detail-xxxxx</code>, bộ chấm tải lại trang, id đổi, locator khớp 0 phần tử.</li>
<li><code>status1003</code>: nhãn trạng thái không phải nút hay liên kết nên không có role riêng. Tìm dòng trước rồi tìm theo chữ trong dòng. Khi viết test, kiểm tra trạng thái thường gọn hơn: <code>await expect(row).toContainText('Chờ khớp')</code>.</li>
<li><code>cancelButtons</code> khớp 3 là đúng yêu cầu. Chỉ khi thao tác (click) mới cần đúng 1; đếm hay <code>toHaveCount</code> thì nhiều phần tử không sao.</li>
</ul>
<h3>Gom lại thành hàm dùng chung</h3>
{{ex1}}`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  cancel1002: page.getByRole('row').filter({ hasText: 'DH-1002' }).getByRole('button', { name: 'Hủy' }),
  detail9984: page.getByRole('row').filter({ hasText: '9984' }).getByRole('button', { name: 'Chi tiết' }),
  status1003: page.getByRole('row').filter({ hasText: 'DH-1003' }).getByText('Chờ khớp'),
  cancelButtons: page.getByRole('button', { name: 'Hủy' }),
});`,
String.raw`const orderRow = (page: Page, id: string) => page.getByRole('row').filter({ hasText: id });

test('hủy lệnh DH-1002', async ({ page }) => {
  await page.goto('/orders');
  await orderRow(page, 'DH-1002').getByRole('button', { name: 'Hủy' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận hủy' }).click();
  await expect(orderRow(page, 'DH-1002')).toContainText('Đã hủy');
});`]},
});
