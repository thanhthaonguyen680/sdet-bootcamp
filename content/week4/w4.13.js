defineExercise({
  id: 'w4.13',
  pw: true,
  title: 'Assertion cho trường hợp lỗi',
  desc: `<p>Test thất bại quan trọng không kém test thành công. Viết <strong>2 test</strong>:</p>
<ul>
<li><code>'báo lỗi khi bỏ trống email'</code>: không điền gì, bấm Đăng nhập, kiểm tra thông báo lỗi là <code>"Vui lòng nhập email"</code>.</li>
<li><code>'báo lỗi khi sai mật khẩu'</code>: điền email đúng, mật khẩu sai, kiểm tra thông báo <code>"Email hoặc mật khẩu không đúng"</code> và URL vẫn ở <code>/login</code>.</li>
</ul>
<p class="note">Bộ chấm sẽ chạy lại trên phiên bản có bug: thông báo lỗi bị đổi thành một câu chung chung. Ít nhất một test của bạn phải fail.</p>`,
  hints: [
    'Thông báo lỗi có <code>role="alert"</code>: <code>page.getByRole(\'alert\')</code>.',
    '<code>toHaveText</code> so khớp toàn bộ chữ, <code>toContainText</code> chỉ cần chứa. Kiểm tra câu thông báo thì nên dùng <code>toHaveText</code>.',
    'URL vẫn ở trang đăng nhập: <code>await expect(page).toHaveURL(/login/);</code>'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('báo lỗi khi bỏ trống email', async ({ page }) => {

});

test('báo lỗi khi sai mật khẩu', async ({ page }) => {

});
`,
  tests: PWG + String.raw`
check('Có ít nhất 2 test', () => expect(__pw.tests.length >= 2, 'Mới có ' + __pw.tests.length + ' test').toBe(true));
check('Tất cả test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Mỗi test đều kiểm tra nội dung thông báo', () => expect(__pw.tests.filter(t => t.asserts.some(a => a.pass && /^(toHaveText|toContainText)$/.test(a.matcher))).length >= 2, 'Cần toHaveText hoặc toContainText trong cả 2 test').toBe(true));
check('Test phát hiện được bug "sai nội dung thông báo"', async () => { const r = await H.rerun('login-error-text'); expect(r.some(t => t.status === 'failed'), 'Thông báo lỗi đã bị đổi mà mọi test vẫn pass').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Các assertion hay dùng</h3>
${TRACE(['Assertion', 'Kiểm tra'], [['<code>toBeVisible()</code>, <code>toBeHidden()</code>', 'đang hiển thị / bị ẩn'], ['<code>toHaveText(\'...\')</code>', 'chữ khớp toàn bộ (đã chuẩn hóa khoảng trắng)'], ['<code>toContainText(\'...\')</code>', 'chữ có chứa'], ['<code>toHaveValue(\'...\')</code>', 'giá trị của ô nhập'], ['<code>toHaveCount(n)</code>', 'số phần tử khớp'], ['<code>toBeChecked()</code>', 'ô tích đang được chọn'], ['<code>toBeEnabled()</code>, <code>toBeDisabled()</code>', 'bật / tắt'], ['<code>toHaveURL()</code>, <code>toHaveTitle()</code>', 'URL, tiêu đề tab']])}
<h3>Phủ định với not</h3>
{{ex0}}
<h3>toHaveText hay toContainText</h3>
<p>Kiểm tra câu thông báo thì dùng <code>toHaveText</code> để bắt được cả lỗi thừa chữ. <code>toContainText</code> hợp với nội dung dài mà bạn chỉ quan tâm một phần.</p>
<p class="note">Góc QA: với test case trường hợp lỗi, hãy kiểm tra cả "điều không được xảy ra": sai mật khẩu thì URL phải vẫn ở trang đăng nhập, không được chuyển vào trong.</p>`,
examples:[String.raw`test('assertion và not', async ({ page }) => {
  await page.goto('/login');
  const alert = page.getByRole('alert');
  await expect(alert).toBeHidden();
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText('Vui lòng nhập email');
  await expect(alert).not.toHaveText('Email hoặc mật khẩu không đúng');
  await expect(page).not.toHaveURL(/dashboard/);
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Test thứ nhất không điền gì, bấm luôn: đây là trường hợp dễ bị bỏ sót nhất khi test thủ công.</li>
<li><code>toHaveText</code> bắt được bug đổi câu thông báo. Nếu chỉ dùng <code>toBeVisible</code>, khung lỗi vẫn hiện nên test không phát hiện ra.</li>
<li><code>toHaveURL(/login/)</code> ở test thứ hai kiểm tra "điều không được xảy ra".</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('báo lỗi khi bỏ trống email', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('alert')).toHaveText('Vui lòng nhập email');
});

test('báo lỗi khi sai mật khẩu', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('thao@sandemo.test');
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email hoặc mật khẩu không đúng');
  await expect(page).toHaveURL(/login/);
});`]},
});
