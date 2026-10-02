defineExercise({
  id: 'w4.15',
  pw: true,
  title: 'Chờ dữ liệu và tìm kiếm',
  desc: `<p>Bảng giá mất khoảng 0,6 đến 1,2 giây để tải, mỗi lần một khác. Viết test <code>'tìm kiếm mã cổ phiếu'</code>:</p>
<ul>
<li>Mở <code>/dashboard</code>, kiểm tra bảng có đủ 6 dòng dữ liệu.</li>
<li>Gõ <code>Sony</code> vào ô tìm kiếm.</li>
<li>Kiểm tra chỉ còn 1 dòng hiển thị, và dòng đó chứa giá <code>13,200</code>.</li>
</ul>
<p><strong>Không</strong> dùng <code>page.waitForTimeout</code>.</p>`,
  hints: [
    '<code>expect(...).toHaveCount(6)</code> tự chờ và thử lại cho tới khi đúng hoặc hết giờ, nên không cần chờ cố định.',
    'Dòng bị lọc bỏ vẫn có trong HTML nhưng bị ẩn. <code>page.getByRole(\'row\')</code> tự bỏ qua dòng ẩn, nhưng có tính dòng tiêu đề. Lọc thêm <code>.filter({ has: page.getByRole(\'cell\') })</code> để chỉ giữ dòng dữ liệu.',
    '<code>const rows = page.getByRole(\'row\').filter({ has: page.getByRole(\'cell\') });</code> rồi <code>await expect(rows).toHaveCount(1);</code>'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('tìm kiếm mã cổ phiếu', async ({ page }) => {
  await page.goto('/dashboard');

});
`,
  tests: PWG + String.raw`
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Không dùng waitForTimeout', () => expect(/waitForTimeout/.test(__code), 'Hãy để assertion tự chờ thay vì chờ cố định').toBe(false));
check('Dùng toHaveCount', () => expect(__okAssert(/^toHaveCount$/)).toBe(true));
check('Có gõ vào ô tìm kiếm', () => expect(__acts().some(a => a.type === 'fill' && /sony/i.test(String(a.arg)))).toBe(true));
check('Test phát hiện được bug "tìm kiếm không lọc"', async () => { const r = await H.rerun('search-broken'); expect(r.some(t => t.status === 'failed'), 'Ô tìm kiếm hỏng mà test vẫn pass').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Đừng chờ bằng thời gian cố định</h3>
{{ex0}}
<p>Chờ 1 giây thì lúc mạng chậm vẫn chưa đủ, lúc mạng nhanh lại phí thời gian. Nhân lên hàng trăm test, bộ test vừa chậm vừa flaky.</p>
<h3>Hãy chờ đúng điều kiện</h3>
<p>Assertion của Playwright tự thử lại cho tới khi đúng. Muốn chờ bảng tải xong, chỉ cần kiểm tra điều bạn mong đợi:</p>
{{ex1}}
<h3>Chỉ đếm dòng dữ liệu đang hiển thị</h3>
<p>Khi tìm kiếm, các dòng không khớp bị ẩn chứ không bị xóa khỏi HTML. <code>getByRole</code> tự bỏ qua phần tử bị ẩn, nên chỉ đếm những gì người dùng nhìn thấy.</p>
${ANAT(["page.getByRole('row')", "Mọi dòng đang hiển thị, <strong>kể cả</strong> dòng tiêu đề."], "\n  ", [".filter({ has: page.getByRole('cell') })", "Chỉ giữ dòng có chứa ô dữ liệu (<code>cell</code>). Dòng tiêu đề chỉ có <code>columnheader</code> nên bị loại."])}`,
examples:[String.raw`test('cách chờ không nên dùng', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForTimeout(500);   // chờ cứng 0,5 giây: có lúc chưa đủ
  console.log('Số dòng:', await page.getByRole('row').count());
});`,
String.raw`test('chờ đúng điều kiện', async ({ page }) => {
  await page.goto('/dashboard');
  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(6);        // tự chờ bảng tải xong
  await page.getByPlaceholder('Tìm mã cổ phiếu').fill('toy');
  console.log('Dòng đang hiển thị:', await rows.count());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Dòng <code>toHaveCount(6)</code> đầu tiên vừa kiểm tra dữ liệu vừa là "điểm chờ": bảng tải lâu hay nhanh test đều chạy đúng.</li>
<li><code>getByRole('row')</code> tự bỏ qua dòng bị ẩn nhưng tính cả dòng tiêu đề. <code>filter({ has: page.getByRole('cell') })</code> loại dòng tiêu đề (chỉ có <code>columnheader</code>), nên con số đúng bằng số dòng dữ liệu người dùng nhìn thấy.</li>
<li>Khi tìm kiếm bị hỏng, vẫn còn 6 dòng hiển thị nên <code>toHaveCount(1)</code> fail.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('tìm kiếm mã cổ phiếu', async ({ page }) => {
  await page.goto('/dashboard');
  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(6);

  await page.getByPlaceholder('Tìm mã cổ phiếu').fill('Sony');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('13,200');
});`]},
});
