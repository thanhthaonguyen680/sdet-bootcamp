defineExercise({
  id: 'w6.6',
  pw: true,
  route: '/orders',
  title: 'Khi AI chẩn đoán sai lỗi',
  desc: `<p>Test hủy lệnh <strong>DH-1002</strong> bị fail. Bạn dán lỗi vào 2 công cụ AI và nhận được 2 cách sửa (ghi trong comment ở đầu code). Cả hai đều <strong>không</strong> sửa đúng nguyên nhân: một cách che lỗi, một cách bấm nhầm nút.</p>
<p>Hãy tự tìm nguyên nhân và sửa test cho đúng:</p>
<ul>
<li>Không chờ cứng, không tăng timeout, không dùng <code>.first()</code>, <code>.last()</code>, <code>.nth()</code>.</li>
<li>Bấm đúng nút Hủy của lệnh DH-1002.</li>
<li>Kiểm tra kết quả ở <strong>đúng dòng</strong> DH-1002, không kiểm tra chung chung cả trang.</li>
</ul>
<p class="note">Bộ chấm chạy lại test trên phiên bản có bug: ứng dụng báo "Đã hủy lệnh DH-1002" nhưng thực ra hủy một lệnh khác. Test của bạn phải fail ở phiên bản đó.</p>`,
  hints: [
    'Đọc kỹ dòng lỗi: "resolved to 3 elements". Trang có 3 nút Hủy giống hệt nhau, mỗi dòng một nút. Thời gian chờ không liên quan gì.',
    'Tìm dòng trước, rồi tìm nút trong dòng (bài 6 tuần 4): <code>page.getByRole(\'row\').filter({ hasText: \'DH-1002\' })</code>.',
    'Kiểm tra trạng thái trong dòng đó: <code>await expect(row).toContainText(\'Đã hủy\');</code> Chữ "Đã hủy" ở chỗ khác trên trang (thông báo, ô lọc, lệnh khác) không chứng minh được DH-1002 đã bị hủy.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// Test đang fail với lỗi:
//   strict mode violation: getByRole('button', { name: 'Hủy' }) resolved to 3 elements
//
// AI 1: "Trang tải chậm. Thêm await page.waitForTimeout(3000) trước khi bấm Hủy."
// AI 2: "Có nhiều nút Hủy. Thêm .first() để lấy nút đầu tiên."
// Cả hai đều chưa đúng. Hãy tự sửa.
test('hủy lệnh DH-1002', async ({ page }) => {
  await page.goto('/orders');
  await page.getByRole('button', { name: 'Hủy' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận hủy' }).click();
  await expect(page.getByText('Đã hủy')).toBeVisible();
});
`,
  tests: PWG + String.raw`
const __orders = () => (((__pw.tests[0] || {}).state) || { orders: [] }).orders;
const __st = id => (__orders().find(o => o.id === id) || {}).status;
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Không dùng cách sửa của AI 1: chờ cứng hay tăng timeout', () => expect(/waitForTimeout|setTimeout|timeout\s*:/.test(__code), 'Lỗi là locator khớp 3 phần tử, chờ lâu hơn không làm nó khớp 1').toBe(false));
check('Không dùng cách sửa của AI 2: .first(), .last(), .nth()', () => expect(/\.(first|last|nth)\(/.test(__code), 'Chọn theo vị trí sẽ bấm nhầm khi thứ tự lệnh thay đổi').toBe(false));
check('Tìm nút Hủy trong dòng của DH-1002', () => expect(/DH-1002/.test(__code) && /getByRole\(\s*['"]row['"]/.test(__code), 'Hãy tìm dòng DH-1002 bằng getByRole(\'row\') rồi tìm nút Hủy bên trong').toBe(true));
check('DH-1002 bị hủy, các lệnh khác giữ nguyên', () => { expect(__st('DH-1002'), 'Trạng thái DH-1002').toBe('Đã hủy'); expect(__st('DH-1003'), 'DH-1003 không được bị hủy').toBe('Chờ khớp'); expect(__st('DH-1001'), 'DH-1001 không được thay đổi').toBe('Đã khớp'); });
check('Phát hiện bug "hủy nhầm lệnh"', async () => { const r = await H.rerun('cancel-wrong-order'); expect(r.some(t => t.status === 'failed'), 'Ứng dụng hủy nhầm lệnh khác mà test vẫn pass. Hãy kiểm tra trạng thái trong đúng dòng DH-1002').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Câu trả lời của AI là giả thuyết, không phải kết luận</h3>
<p>Dán lỗi vào AI thường nhận được một cách sửa rất tự tin. Nhưng AI không chạy test của bạn, không thấy trang lúc lỗi xảy ra. Nó đưa ra cách sửa <strong>phổ biến nhất</strong> cho kiểu lỗi đó, mà cách phổ biến nhất thường là cách che lỗi.</p>
${TRACE(['Gợi ý thường gặp của AI', 'Vì sao nguy hiểm'], [['Thêm <code>waitForTimeout</code>, tăng timeout', 'Che lỗi thời gian, không sửa được lỗi locator; test chậm đi'], ['Thêm <code>.first()</code>, <code>.nth()</code>', 'Bấm theo vị trí, dữ liệu đổi thứ tự là bấm nhầm'], ['Bọc <code>try/catch</code> rồi bỏ qua lỗi', 'Test luôn pass, không phát hiện được gì'], ['Đổi <code>toHaveText</code> thành <code>toBeVisible</code>', 'Assertion yếu đi, bug thật lọt qua'], ['<code>test.skip</code> hoặc xóa test', 'Mất luôn phần kiểm tra']])}
<h3>Hỏi AI để debug cho đúng cách</h3>
<ul>
<li>Đưa đủ thông tin: <strong>thông báo lỗi đầy đủ</strong>, đoạn code test, và mô tả trang.</li>
<li>Hỏi <em>"các nguyên nhân có thể, xếp theo khả năng, và cách kiểm tra từng nguyên nhân"</em> thay vì <em>"sửa giúp tôi"</em>.</li>
<li>Tự kiểm tra giả thuyết: đọc kỹ dòng lỗi, mở trace hoặc trang, thử locator.</li>
</ul>
<p>Trong bài này, dòng lỗi đã nói rõ nguyên nhân: <code>resolved to 3 elements</code>. Đó là lỗi locator, không phải lỗi thời gian.</p>
<p class="note">Góc QA: kiểm tra kết quả ở đúng nơi. "Có chữ Đã hủy trên trang" khác với "dòng DH-1002 có trạng thái Đã hủy". Ứng dụng có thể hiện thông báo đúng nhưng sửa sai dữ liệu.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Nguyên nhân thật nằm ngay trong dòng lỗi: locator khớp 3 nút Hủy. Cách sửa là thu hẹp phạm vi: tìm dòng DH-1002 rồi tìm nút trong dòng.</li>
<li>Cách của AI 1 (chờ 3 giây) vẫn fail: sau 3 giây vẫn có 3 nút Hủy.</li>
<li>Cách của AI 2 (<code>.first()</code>) chọn nút Hủy của DH-1001. Lệnh này đã khớp nên nút bị khóa: test treo tới hết giờ. Nếu thứ tự khác, nó còn hủy nhầm lệnh khác mà vẫn pass.</li>
<li>Assertion kiểm tra trong đúng dòng DH-1002. Bug "hủy nhầm lệnh" vẫn hiện thông báo "Đã hủy lệnh DH-1002" nhưng dòng DH-1002 vẫn "Chờ khớp", nên test fail đúng như mong muốn.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('hủy lệnh DH-1002', async ({ page }) => {
  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: 'DH-1002' });
  await row.getByRole('button', { name: 'Hủy' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận hủy' }).click();
  await expect(row).toContainText('Đã hủy');
});` }]},
});
