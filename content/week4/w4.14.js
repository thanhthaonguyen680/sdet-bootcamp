defineExercise({
  id: 'w4.14',
  pw: true,
  title: 'Select, radio và checkbox',
  desc: `<p>Viết test <code>'đặt lệnh bán'</code> trên trang <code>/order</code>:</p>
<ul>
<li>Chọn mã <code>7203</code>.</li>
<li>Chọn loại lệnh <strong>Bán</strong>.</li>
<li>Điền khối lượng <code>200</code>.</li>
<li>Kiểm tra nút "Đặt lệnh" đang bị vô hiệu hóa, tích ô đồng ý, rồi kiểm tra nút đã bật.</li>
<li>Bấm "Đặt lệnh", kiểm tra thông báo chứa <code>"Đặt lệnh thành công: BÁN 7203 x200"</code>.</li>
</ul>`,
  hints: [
    'Ô chọn: <code>await page.getByLabel(\'Mã cổ phiếu\').selectOption(\'7203\');</code> Có thể truyền value hoặc chữ hiển thị của lựa chọn.',
    'Radio và checkbox dùng <code>check()</code>: <code>await page.getByLabel(\'Bán\').check();</code>',
    'Trạng thái nút: <code>toBeDisabled()</code>, <code>toBeEnabled()</code>. Thông báo có <code>role="status"</code>.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('đặt lệnh bán', async ({ page }) => {
  await page.goto('/order');

});
`,
  tests: PWG + String.raw`
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Dùng selectOption', () => expect(__acts().some(a => a.type === 'selectOption')).toBe(true));
check('Dùng check() cho radio và checkbox', () => expect(__acts().filter(a => a.type === 'check').length >= 2, 'Cần check() ít nhất 2 lần').toBe(true));
check('Kiểm tra nút bị vô hiệu hóa rồi được bật', () => { expect(__okAssert(/^toBeDisabled$/), 'Thiếu toBeDisabled()').toBe(true); expect(__okAssert(/^toBeEnabled$/), 'Thiếu toBeEnabled()').toBe(true); });
check('Lệnh bán 7203 x200 đã được tạo', () => expect((__pw.tests[0] && __pw.tests[0].state.orders || []).some(o => o.code === '7203' && o.side === 'sell' && o.qty === 200)).toBe(true));
check('Test phát hiện được bug "luôn đặt lệnh mua"', async () => { const r = await H.rerun('order-side-ignored'); expect(r.some(t => t.status === 'failed'), 'Ứng dụng đặt nhầm thành lệnh MUA mà test vẫn pass').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Ô chọn (select)</h3>
<p><code>selectOption</code> nhận giá trị (thuộc tính <code>value</code>) hoặc chữ hiển thị của lựa chọn, trả về mảng giá trị đã chọn.</p>
{{ex0}}
<h3>Radio và checkbox</h3>
<p>Dùng <code>check()</code> thay vì <code>click()</code>: nếu ô đã được chọn sẵn, <code>check()</code> không làm gì, còn <code>click()</code> sẽ bỏ chọn. Sau khi <code>check()</code>, Playwright còn tự kiểm tra ô đã thật sự được chọn.</p>
<h3>Nút bị vô hiệu hóa</h3>
<p>Nút "Đặt lệnh" chỉ bật khi đã tích ô đồng ý. Nếu click lúc nút còn tắt, Playwright sẽ chờ tới khi nút bật hoặc hết giờ, nên đây cũng là một cách phát hiện lỗi luồng thao tác.</p>`,
examples:[String.raw`test('select và radio', async ({ page }) => {
  await page.goto('/order');
  const values = await page.getByLabel('Mã cổ phiếu').selectOption('9984 - SoftBank Group');
  console.log('Đã chọn:', values);
  await expect(page.getByLabel('Giá đặt')).toHaveValue('8900');
  await page.getByRole('radio', { name: 'Bán' }).check();
  await expect(page.getByRole('radio', { name: 'Mua' })).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Đặt lệnh' })).toBeDisabled();
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Kiểm tra nút tắt trước, bật sau, là kiểm tra luôn quy tắc nghiệp vụ "phải đồng ý điều khoản mới được đặt lệnh".</li>
<li><code>toContainText</code> cho thông báo vì phần giá phía sau có thể đổi theo giá thị trường; phần quan trọng là loại lệnh, mã và khối lượng.</li>
<li>Khi trang bị bug "luôn đặt lệnh mua", thông báo hiện "MUA 7203" nên assertion fail đúng như mong đợi.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('đặt lệnh bán', async ({ page }) => {
  await page.goto('/order');
  await page.getByLabel('Mã cổ phiếu').selectOption('7203');
  await page.getByLabel('Bán').check();
  await page.getByLabel('Khối lượng').fill('200');

  const submit = page.getByRole('button', { name: 'Đặt lệnh' });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Tôi đồng ý').check();
  await expect(submit).toBeEnabled();

  await submit.click();
  await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: BÁN 7203 x200');
});`]},
});
