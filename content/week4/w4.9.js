defineExercise({
  id: 'w4.9',
  pw: true,
  kind: 'locator',
  route: '/dashboard',
  exports: ['locators'],
  title: 'Lọc và nối locator',
  desc: `<p>Trên bảng giá có 6 nút "Mua" giống hệt nhau. Để lấy đúng nút của một mã, cần lấy <strong>dòng</strong> trước rồi tìm nút <strong>bên trong</strong> dòng đó.</p>
<ul>
<li><code>buyButtons</code>: tất cả 6 nút "Mua".</li>
<li><code>sonyBuy</code>: nút "Mua" trong dòng Sony. Bắt buộc dùng <code>filter</code>.</li>
<li><code>keyenceWatch</code>: nút "Theo dõi" trong dòng Keyence. Bắt buộc dùng <code>filter</code>.</li>
<li><code>thirdRow</code>: dòng dữ liệu thứ 3 của bảng (SoftBank).</li>
</ul>`,
  hints: [
    'Locator nối được với nhau: <code>dong.getByRole(\'button\', ...)</code> chỉ tìm bên trong <code>dong</code>.',
    '<code>page.getByRole(\'row\').filter({ hasText: \'Sony\' })</code> giữ lại những dòng có chữ "Sony".',
    '<code>nth(i)</code> đếm từ 0. <code>getByRole(\'row\')</code> có cả dòng tiêu đề ở vị trí 0, nên dòng dữ liệu thứ 3 là <code>nth(3)</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  buyButtons: page.getByRole('button', { name: 'TODO' }),
  sonyBuy: page.getByText('TODO'),
  keyenceWatch: page.getByText('TODO'),
  thirdRow: page.getByText('TODO'),
});
`,
  tests: String.raw`
const rowByName = n => d => [...d.querySelectorAll('tbody tr')].filter(tr => tr.cells[1].textContent.includes(n));
check('buyButtons (6 nút)', () => H.locator('buyButtons', 'tbody button:not(.ghost)'));
check('sonyBuy', () => H.locator('sonyBuy', d => rowByName('Sony')(d).map(tr => tr.querySelector('button:not(.ghost)')), { kinds: ['filter'], kindLabel: '.filter(...)' }));
check('keyenceWatch', () => H.locator('keyenceWatch', d => rowByName('Keyence')(d).map(tr => tr.querySelector('button.ghost')), { kinds: ['filter'], kindLabel: '.filter(...)' }));
check('thirdRow', () => H.locator('thirdRow', d => [d.querySelectorAll('tbody tr')[2]]));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Nối locator</h3>
<p>Gọi <code>getBy...</code> trên một locator khác thì chỉ tìm <strong>bên trong</strong> phần tử đó. Đây là cách lấy một nút trong số nhiều nút giống hệt nhau:</p>
${ANAT(["page.getByRole('row')", "Bước 1: lấy tất cả các dòng của bảng."], "\n  ", [".filter({ hasText: 'Sony' })", "Bước 2: chỉ giữ dòng có chữ “Sony”. Còn lại đúng 1 dòng."], "\n  ", [".getByRole('button', { name: 'Mua' })", "Bước 3: tìm nút “Mua” <strong>bên trong</strong> dòng đó."])}
<p>Đọc như chỉ đường: “vào bảng, tìm dòng có chữ Sony, lấy nút Mua trong dòng ấy”. Xuống dòng trước mỗi dấu chấm cho dễ đọc.</p>
{{ex0}}
<h3>filter</h3>
<p><code>filter</code> không tìm sâu hơn mà <strong>lọc bớt</strong> tập phần tử hiện có:</p>
<ul>
<li><code>hasText</code>: giữ phần tử có chứa chữ.</li>
<li><code>hasNotText</code>: loại phần tử có chứa chữ.</li>
<li><code>has</code>: giữ phần tử có chứa một locator con, ví dụ dòng có nút "Hủy" đang bật.</li>
</ul>
<h3>nth, first, last</h3>
<p>Chọn theo vị trí, đếm từ 0. Dùng khi thứ tự thực sự có ý nghĩa (dòng đầu của bảng đã sắp xếp). Nếu không, thứ tự dễ đổi khi dữ liệu thay đổi, nên ưu tiên lọc theo nội dung.</p>
<p>Chú ý <code>getByRole('row')</code> tính cả dòng tiêu đề ở vị trí 0. Muốn chỉ lấy dòng dữ liệu thì lọc thêm <code>.filter({ has: page.getByRole('cell') })</code>: dòng tiêu đề chỉ có <code>columnheader</code>, không có <code>cell</code>.</p>`,
examples:[String.raw`test('nối và lọc locator', async ({ page }) => {
  await page.goto('/dashboard');
  const sonyRow = page.getByRole('row').filter({ hasText: 'Sony' });
  console.log(await sonyRow.textContent());
  await sonyRow.getByRole('button', { name: 'Theo dõi' }).click();
  await expect(sonyRow.getByRole('button', { name: 'Đang theo dõi' })).toBeVisible();

  const dataRows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  console.log('Số dòng dữ liệu:', await dataRows.count());
  console.log('Dòng đầu:', await dataRows.first().textContent());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mẫu quan trọng nhất của bài: <strong>lấy dòng theo nội dung, rồi tìm bên trong dòng</strong>. Dùng được cho mọi bảng dữ liệu.</li>
<li><code>exact: true</code> cho nút Mua để sau này nếu có nút "Mua ký quỹ" thì không bị lẫn.</li>
<li><code>getByRole('row')</code> có cả dòng tiêu đề ở vị trí 0, nên dòng dữ liệu thứ 3 là <code>nth(3)</code>. Muốn đếm từ dòng dữ liệu thì lọc trước: <code>page.getByRole('row').filter({ has: page.getByRole('cell') }).nth(2)</code>. Dòng tiêu đề chỉ có <code>columnheader</code>, không có <code>cell</code>, nên bị loại.</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  buyButtons: page.getByRole('button', { name: 'Mua', exact: true }),
  sonyBuy: page.getByRole('row').filter({ hasText: 'Sony' }).getByRole('button', { name: 'Mua' }),
  keyenceWatch: page.getByRole('row').filter({ hasText: 'Keyence' }).getByRole('button', { name: 'Theo dõi' }),
  thirdRow: page.getByRole('row').nth(3),
});`]},
});
