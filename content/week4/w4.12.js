defineExercise({
  id: 'w4.12',
  pw: true,
  title: 'Điền form và bấm nút: đăng nhập',
  desc: `<p>Viết test <code>'đăng nhập thành công'</code>:</p>
<ul>
<li>Mở <code>/login</code>, điền email <code>thao@sandemo.test</code> và mật khẩu <code>Demo@123</code>.</li>
<li>Bấm nút "Đăng nhập".</li>
<li>Kiểm tra URL chuyển sang <code>/dashboard</code>.</li>
<li>Kiểm tra dòng chào "Xin chào, Thao" hiển thị.</li>
</ul>
<p class="note">Bộ chấm sẽ chạy lại test của bạn trên một phiên bản trang <strong>có bug</strong> (đăng nhập xong không chuyển trang). Test tốt phải phát hiện ra bug đó, tức là phải fail.</p>`,
  hints: [
    '<code>await page.getByLabel(\'Email\').fill(\'thao@sandemo.test\');</code>',
    '<code>await page.getByRole(\'button\', { name: \'Đăng nhập\' }).click();</code>',
    '<code>await expect(page).toHaveURL(/dashboard/);</code> Playwright tự chờ tới khi URL đổi, không cần thêm lệnh chờ.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('đăng nhập thành công', async ({ page }) => {
  await page.goto('/login');

});
`,
  tests: PWG + String.raw`
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Có điền email và mật khẩu (fill)', () => expect(__acts().filter(a => a.type === 'fill').length >= 2, 'Cần 2 lệnh fill').toBe(true));
check('Có bấm nút (click)', () => expect(__acts().some(a => a.type === 'click')).toBe(true));
check('Kiểm tra URL bằng toHaveURL', () => expect(__okAssert(/^toHaveURL$/), 'Chưa có expect(page).toHaveURL(...) nào pass').toBe(true));
check('Kiểm tra dòng chào hiển thị', () => expect(__okAssert(/^(toBeVisible|toHaveText|toContainText)$/), 'Cần kiểm tra "Xin chào, Thao" bằng toBeVisible hoặc toContainText').toBe(true));
check('Test phát hiện được bug "không chuyển trang"', async () => { const r = await H.rerun('login-no-redirect'); expect(r.some(t => t.status === 'failed'), 'Trang bị bug mà test vẫn pass, nghĩa là test chưa kiểm tra đủ').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Các thao tác cơ bản</h3>
${TRACE(['Lệnh', 'Dùng cho'], [['<code>fill(\'chữ\')</code>', 'xóa nội dung cũ và điền chữ mới vào ô nhập'], ['<code>click()</code>', 'bấm nút, liên kết, bất kỳ phần tử nào'], ['<code>press(\'Enter\')</code>', 'nhấn phím'], ['<code>check()</code>, <code>uncheck()</code>', 'ô tích, radio'], ['<code>selectOption(\'giá trị\')</code>', 'ô chọn &lt;select&gt;']])}
<p>Trước mỗi thao tác, Playwright tự chờ phần tử <strong>hiển thị</strong>, <strong>bật</strong> (không disabled) và <strong>đứng yên</strong>. Không cần viết lệnh chờ riêng như <code>WebDriverWait</code> của Selenium.</p>
{{ex0}}
<h3>Kiểm tra URL</h3>
<p><code>toHaveURL</code> nhận chuỗi (khớp toàn bộ) hoặc regex (khớp một phần). Regex như <code>/dashboard/</code> thường tiện hơn vì không phụ thuộc tên miền.</p>
<p class="note">Góc QA: một test tốt không chỉ chạy qua các bước mà còn phải <strong>kiểm tra kết quả</strong>. Bộ chấm sẽ cố tình cài bug vào trang rồi chạy lại test của bạn. Nếu test vẫn xanh thì nó chưa bảo vệ được gì. Kỹ thuật cài bug để kiểm tra chất lượng test gọi là mutation testing.</p>`,
examples:[String.raw`test('điền form', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('thao@sandemo.test');
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  console.log('Thông báo:', await page.getByRole('alert').textContent());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Sau khi bấm, trang cần khoảng 0,2 giây để chuyển. <code>toHaveURL</code> tự chờ nên không cần <code>waitForTimeout</code>.</li>
<li>Kiểm tra cả URL lẫn nội dung trang: URL đúng nhưng trang trắng vẫn là bug.</li>
<li>Khi trang bị cài bug "không chuyển trang", <code>toHaveURL</code> chờ hết 5 giây rồi fail. Test đã làm đúng nhiệm vụ.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('đăng nhập thành công', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('thao@sandemo.test');
  await page.getByLabel('Mật khẩu').fill('Demo@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Xin chào, Thao')).toBeVisible();
});`]},
});
