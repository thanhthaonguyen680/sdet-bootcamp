defineExercise({
  id: 'w4.18',
  pw: true,
  title: 'Tổng hợp: luồng đặt lệnh từ đầu đến cuối',
  desc: `<p>Viết một test end-to-end <code>'mua cổ phiếu Toyota'</code> đi qua nhiều trang, đúng như người dùng thật:</p>
<ul>
<li>Đăng nhập, chờ tới trang Bảng giá.</li>
<li>Bấm nút "Mua" ở dòng Toyota. Trang Đặt lệnh mở ra với mã 7203 đã được chọn sẵn, hãy kiểm tra điều đó.</li>
<li>Điền khối lượng 100, tích đồng ý, bấm "Đặt lệnh", kiểm tra thông báo thành công.</li>
<li>Vào "Lệnh của tôi" qua menu, kiểm tra số lệnh là 4 và có dòng 7203 ở trạng thái "Chờ khớp".</li>
</ul>
<p>Dùng <code>test.step</code> để chia test thành các bước có tên. Mỗi bước sẽ hiện trong console.</p>`,
  hints: [
    'Nút Mua của Toyota: <code>page.getByRole(\'row\', { name: \'Toyota\' }).getByRole(\'button\', { name: \'Mua\' })</code>.',
    'Kiểm tra giá trị ô chọn: <code>await expect(page.getByLabel(\'Mã cổ phiếu\')).toHaveValue(\'7203\');</code>',
    'Dòng lệnh mới: <code>page.getByRole(\'row\').filter({ hasText: \'7203\' }).filter({ hasText: \'Chờ khớp\' })</code>. Số lệnh: <code>page.getByTestId(\'order-count\')</code>.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('mua cổ phiếu Toyota', async ({ page }) => {
  await test.step('Đăng nhập', async () => {

  });

  await test.step('Chọn mua Toyota từ bảng giá', async () => {

  });

  await test.step('Đặt lệnh', async () => {

  });

  await test.step('Kiểm tra trong Lệnh của tôi', async () => {

  });
});
`,
  tests: PWG + String.raw`
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Dùng test.step', () => expect(/test\.step\s*\(/.test(__code)).toBe(true));
check('Bấm nút Mua trên bảng giá', () => expect(__acts().some(a => a.type === 'click' && /Mua/.test(a.target)), 'Chưa thấy thao tác click nút Mua').toBe(true));
check('Kiểm tra mã được chọn sẵn bằng toHaveValue', () => expect(__okAssert(/^toHaveValue$/)).toBe(true));
check('Lệnh 7203 đã được tạo và test kết thúc ở trang Lệnh của tôi', () => { const t = __pw.tests[0] || {}; expect((t.state && t.state.orders || []).length, 'Số lệnh cuối cùng').toBe(4); expect(/\/orders$/.test(t.url || ''), 'Test chưa vào trang Lệnh của tôi').toBe(true); });
check('Test phát hiện được bug "lệnh không được lưu"', async () => { const r = await H.rerun('orders-not-saved'); expect(r.some(t => t.status === 'failed'), 'Lệnh không được lưu mà test vẫn pass').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Test end-to-end</h3>
<p>Test E2E đi qua một luồng nghiệp vụ hoàn chỉnh như người dùng thật, nối nhiều trang lại với nhau. Mỗi test E2E có giá trị cao nhưng chạy lâu và dễ vỡ hơn, nên chỉ dành cho các luồng quan trọng nhất (đăng nhập, đặt lệnh, thanh toán).</p>
<h3>test.step: chia test thành các bước</h3>
{{ex0}}
<p>Tên bước hiện trong báo cáo Playwright. Khi test fail, bạn biết ngay fail ở bước nào, giống cột "Bước thực hiện" trong test case thủ công.</p>
<h3>Kiểm tra ở mỗi mốc</h3>
<p>Đừng chỉ kiểm tra ở cuối. Kiểm tra sau mỗi bước quan trọng (đã vào trang, mã đã được chọn sẵn, thông báo thành công) giúp khi fail thì thông báo lỗi chỉ đúng chỗ hỏng.</p>`,
examples:[String.raw`test('các bước có tên', async ({ page }) => {
  await test.step('Mở bảng giá', async () => {
    await page.goto('/dashboard');
    await expect(page.getByRole('row', { name: 'Nintendo' })).toBeVisible();
  });
  await test.step('Bấm Mua Nintendo', async () => {
    await page.getByRole('row', { name: 'Nintendo' }).getByRole('button', { name: 'Mua' }).click();
    await expect(page).toHaveURL(/order\?code=7974/);
  });
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi bước kết thúc bằng một assertion xác nhận đã tới đúng trạng thái, rồi bước sau mới bắt đầu.</li>
<li>Vào trang "Lệnh của tôi" bằng menu thay vì <code>goto</code>, để kiểm tra luôn menu hoạt động như người dùng thật đi.</li>
<li>Dòng lệnh mới được xác định bằng hai điều kiện (mã 7203 và "Chờ khớp") vì lệnh DH-1001 cũng là mã 7203 nhưng đã khớp.</li>
<li>Khi bị bug "lệnh không được lưu", số lệnh vẫn là 3 và không có dòng mới, test fail ở bước cuối với thông báo rõ ràng.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('mua cổ phiếu Toyota', async ({ page }) => {
  await test.step('Đăng nhập', async () => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('thao@sandemo.test');
    await page.getByLabel('Mật khẩu').fill('Demo@123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  await test.step('Chọn mua Toyota từ bảng giá', async () => {
    await page.getByRole('row', { name: 'Toyota' }).getByRole('button', { name: 'Mua' }).click();
    await expect(page.getByLabel('Mã cổ phiếu')).toHaveValue('7203');
  });

  await test.step('Đặt lệnh', async () => {
    await page.getByLabel('Khối lượng').fill('100');
    await page.getByLabel('Tôi đồng ý').check();
    await page.getByRole('button', { name: 'Đặt lệnh' }).click();
    await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA 7203 x100');
  });

  await test.step('Kiểm tra trong Lệnh của tôi', async () => {
    await page.getByRole('link', { name: 'Lệnh của tôi' }).click();
    await expect(page.getByTestId('order-count')).toHaveText('4');
    const newRow = page.getByRole('row').filter({ hasText: '7203' }).filter({ hasText: 'Chờ khớp' });
    await expect(newRow).toBeVisible();
  });
});`]},
});
