defineExercise({
  id: 'w4.4',
  pw: true,
  kind: 'locator',
  route: '/dashboard',
  exports: ['locators'],
  title: 'getByRole với bảng và điều hướng',
  desc: `<p>Trang <strong>Bảng giá</strong> có menu, ô tìm kiếm và bảng. Dùng <code>getByRole</code> cho cả 5 phần tử:</p>
<ul>
<li><code>pageHeading</code>: tiêu đề trang cấp 1, dùng tùy chọn <code>level</code>.</li>
<li><code>navOrder</code>: liên kết "Đặt lệnh" trên menu.</li>
<li><code>searchBox</code>: ô tìm kiếm (vai trò <code>searchbox</code>).</li>
<li><code>changeHeader</code>: ô tiêu đề cột "Thay đổi".</li>
<li><code>toyotaRow</code>: cả dòng của Toyota trong bảng.</li>
</ul>`,
  hints: [
    '<code>page.getByRole(\'heading\', { level: 1 })</code> lấy thẻ <code>h1</code>.',
    'Ô tiêu đề cột có vai trò <code>columnheader</code>. Dòng có vai trò <code>row</code>, tên của dòng là toàn bộ chữ trong dòng.',
    '<code>page.getByRole(\'row\', { name: \'Toyota\' })</code>. Ô tìm kiếm có <code>aria-label="Tìm kiếm"</code> nên tên của nó là "Tìm kiếm".'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  pageHeading: page.getByRole('heading'),
  navOrder: page.getByRole('link', { name: 'TODO' }),
  searchBox: page.getByRole('searchbox'),
  changeHeader: page.getByRole('columnheader', { name: 'TODO' }),
  toyotaRow: page.getByRole('row', { name: 'TODO' }),
});
`,
  tests: String.raw`
const r = { kinds: ['role'], kindLabel: 'getByRole' };
check('pageHeading', () => H.locator('pageHeading', 'h1', r));
check('navOrder', () => H.locator('navOrder', 'nav a[href="/order"]', r));
check('searchBox', () => H.locator('searchBox', 'input[type=search]', r));
check('changeHeader', () => H.locator('changeHeader', d => [...d.querySelectorAll('th')].filter(th => th.textContent === 'Thay đổi'), r));
check('toyotaRow', () => H.locator('toyotaRow', d => [...d.querySelectorAll('tbody tr')].filter(tr => tr.cells[0].textContent === '7203'), r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tùy chọn của getByRole</h3>
<p>Mọi tùy chọn nằm chung trong <strong>một</strong> cặp ngoặc nhọn, cách nhau bằng dấu phẩy:</p>
${ANAT("page.getByRole('button', { ", ["name: 'Mua'", "Tên của nút."], ", ", ["exact: true", "Tên phải khớp chính xác. Không có dòng này thì “Mua” khớp cả nút “Mua ký quỹ” nếu trang có."], " })")}
{{ex0}}
<ul>
<li><code>name</code>: mặc định khớp một phần, không phân biệt hoa thường. Có thể dùng regex như <code>/toyota/i</code>.</li>
<li><code>exact: true</code>: tên phải khớp chính xác.</li>
<li><code>level</code>: cấp của tiêu đề (h1 là 1).</li>
<li><code>checked</code>, <code>pressed</code>, <code>disabled</code>: lọc theo trạng thái.</li>
</ul>
<h3>Bảng dữ liệu</h3>
<p>Dòng có vai trò <code>row</code>, ô tiêu đề là <code>columnheader</code>, ô thường là <code>cell</code>. Tên của một dòng là toàn bộ chữ trong dòng nối lại, nên tìm dòng theo một chữ bất kỳ trong dòng rất tiện.</p>
${ANAT("page.getByRole(", ["'row'", "Một dòng của bảng."], ", ", ["{ name: 'Sony' }", "Chữ có trong dòng: tên công ty, mã <code>'6758'</code>... Chọn chữ chỉ xuất hiện ở đúng dòng cần tìm."], ")")}
<h3>aria-label</h3>
<p>Ô tìm kiếm trên bảng giá không có nhãn hiển thị, nhưng có <code>aria-label="Tìm kiếm"</code>. Thuộc tính này cung cấp tên cho phần tử, nên <code>getByRole</code> và <code>getByLabel</code> đều dùng được.</p>`,
examples:[String.raw`test('tùy chọn của getByRole', async ({ page }) => {
  await page.goto('/dashboard');
  const row = page.getByRole('row', { name: 'Sony' });
  await expect(row).toBeVisible();          // tự chờ bảng tải xong
  console.log(await row.textContent());
  console.log('Tiêu đề cấp 1:', await page.getByRole('heading', { level: 1 }).textContent());
  console.log('Link Bảng giá:', await page.getByRole('link', { name: 'Bảng giá' }).count());
  console.log('Tìm kiếm:', await page.getByRole('searchbox', { name: 'Tìm kiếm' }).count());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Trang có tiêu đề "Bảng giá" và liên kết menu "Bảng giá"; <code>level: 1</code> hoặc vai trò <code>heading</code> chọn đúng tiêu đề.</li>
<li>Tên của dòng là mọi chữ trong dòng nối lại ("7203 Toyota Motor 2,850 +15 Mua Theo dõi"), nên chữ "Toyota" đủ để chọn đúng dòng.</li>
<li>Ô tìm kiếm có kiểu <code>search</code> nên vai trò là <code>searchbox</code>, tên lấy từ <code>aria-label</code>.</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  pageHeading: page.getByRole('heading', { level: 1 }),
  navOrder: page.getByRole('link', { name: 'Đặt lệnh' }),
  searchBox: page.getByRole('searchbox', { name: 'Tìm kiếm' }),
  changeHeader: page.getByRole('columnheader', { name: 'Thay đổi' }),
  toyotaRow: page.getByRole('row', { name: 'Toyota' }),
});`]},
});
