defineExercise({
  id: 'w6.4',
  pw: true,
  route: '/order',
  title: 'Sửa test do AI viết',
  desc: `<p>Bạn nhờ AI: <em>"Viết test Playwright đặt lệnh BÁN 100 cổ phiếu 7203 trên trang /order"</em>. Code AI trả về nằm sẵn trong editor. Bấm <strong>Chạy</strong>: test pass. Nhưng test này có ít nhất 5 vấn đề, và nếu ứng dụng có bug thì nó vẫn pass.</p>
<p>Hãy sửa lại sao cho:</p>
<ul>
<li>Không chờ cứng bằng <code>waitForTimeout</code>.</li>
<li>Chỉ dùng <code>getBy...</code>, không dùng <code>page.locator</code> với CSS.</li>
<li>Mọi thao tác và mọi <code>expect</code> trên locator đều có <code>await</code>.</li>
<li>Kiểm tra <strong>nội dung</strong> thông báo, không dùng <code>toBeTruthy()</code>.</li>
</ul>
<p class="note">Bộ chấm sẽ chạy lại test trên phiên bản có bug: chọn Bán nhưng ứng dụng vẫn đặt lệnh MUA. Test của bạn phải fail ở phiên bản đó.</p>`,
  hints: [
    'Đọc lại bài giảng: mỗi dòng của AI ứng với một lỗi trong bảng "5 lỗi AI hay mắc". Sửa từng dòng một, bấm Chạy sau mỗi lần sửa.',
    'Locator: <code>getByLabel(\'Mã cổ phiếu\')</code>, <code>getByLabel(\'Bán\')</code>, <code>getByLabel(\'Khối lượng\')</code>, <code>getByLabel(\'Tôi đồng ý\')</code>, <code>getByRole(\'button\', { name: \'Đặt lệnh\' })</code>, thông báo là <code>getByRole(\'status\')</code>.',
    '<code>await expect(page.getByRole(\'status\')).toContainText(\'BÁN 7203 x100\');</code> Với bug "luôn đặt lệnh mua", thông báo sẽ ghi MUA nên test fail đúng như mong muốn.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// Code do AI viết. Chạy thì pass, nhưng có ít nhất 5 vấn đề.
test('đặt lệnh bán 7203', async ({ page }) => {
  await page.goto('/order');
  await page.waitForTimeout(2000);
  await page.locator('#symbol').selectOption('7203');
  page.getByLabel('Bán').check();
  await page.locator('#qty').fill('100');
  await page.locator('#agree').check();
  await page.locator('.btn.primary').click();
  expect(page.locator('.toast')).toBeTruthy();
});
`,
  tests: PWG + AWAIT_LINT + String.raw`
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Không chờ cứng bằng waitForTimeout', () => expect(/waitForTimeout/.test(__code), 'Chờ cứng làm test chậm và vẫn có thể fail khi máy chậm. Assertion của Playwright đã tự chờ').toBe(false));
check('Chỉ dùng getBy..., không dùng CSS', () => expect(/\.locator\(/.test(__code), 'Vẫn còn page.locator(...). Locator theo id, class dễ vỡ khi dev đổi HTML').toBe(false));
check('Mọi thao tác và expect trên locator đều có await', () => { const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Kiểm tra nội dung thông báo, không dùng toBeTruthy', () => { expect(/toBeTruthy|toBeDefined/.test(__code), 'expect(locator).toBeTruthy() luôn đúng vì locator luôn là một object, nó không kiểm tra gì cả').toBe(false); expect(__okAssert(/^(toHaveText|toContainText)$/), 'Hãy kiểm tra chữ trong thông báo bằng toHaveText hoặc toContainText').toBe(true); });
check('Phát hiện bug "luôn đặt lệnh mua"', async () => { const r = await H.rerun('order-side-ignored'); expect(r.some(t => t.status === 'failed'), 'Ứng dụng đặt nhầm thành lệnh MUA mà test vẫn pass. Hãy kiểm tra chữ BÁN trong thông báo').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>5 lỗi AI hay mắc khi viết Playwright</h3>
<p>AI học từ rất nhiều code trên mạng, trong đó có cả code cũ và code viết ẩu. Vì vậy test do AI viết hay có những lỗi sau:</p>
${TRACE(['AI viết', 'Vì sao có hại', 'Sửa thành'], [['<code>waitForTimeout(2000)</code>', 'Chậm, và vẫn fail khi máy chậm hơn 2 giây', 'Bỏ đi: thao tác và assertion đã tự chờ'], ['<code>locator(\'#qty\')</code>, <code>\'.btn.primary\'</code>', 'Dev đổi id, class là test vỡ', '<code>getByLabel</code>, <code>getByRole</code>'], ['Thiếu <code>await</code> trước thao tác', 'Dòng sau chạy khi thao tác chưa xong, test lúc pass lúc fail', 'Thêm <code>await</code>'], ['<code>expect(locator).toBeTruthy()</code>', 'Locator luôn là object nên luôn đúng, không kiểm tra gì', '<code>await expect(locator).toContainText(...)</code>'], ['Chỉ kiểm tra "có hiện"', 'Hiện sai nội dung test vẫn pass', 'Kiểm tra đúng chữ, đúng giá trị']])}
<h3>Test pass chưa chắc là test tốt</h3>
<p>Test của AI trong bài này <strong>pass</strong>. Nhưng nếu ứng dụng có bug "chọn Bán mà vẫn đặt lệnh Mua", nó vẫn pass, vì nó không kiểm tra gì cả. Một test có giá trị phải <strong>fail khi ứng dụng sai</strong>. Cách nhanh để biết: tự làm sai dữ liệu mong đợi một chút rồi chạy, test phải fail.</p>
${ANAT(["await", "Chờ assertion có kết quả. Thiếu <code>await</code> thì test kết thúc trước khi kịp kiểm tra."], " ", ["expect(page.getByRole('status'))", "Thứ cần kiểm tra: khung thông báo."], ["\n  .toContainText('BÁN 7203 x100')", "Điều phải đúng: thông báo có đúng loại lệnh, mã và khối lượng. Bug đổi Bán thành Mua sẽ làm dòng này fail."], ";")}
<p class="note">Góc QA: khi review code AI, đọc từng dòng và tự hỏi "nếu dòng này sai thì test có phát hiện được không?". Bài 9 sẽ biến câu hỏi đó thành một công cụ review tự động.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Đối chiếu từng dòng</h3>
<ul>
<li><code>waitForTimeout(2000)</code>: bỏ hẳn. <code>selectOption</code> và các thao tác sau đã tự chờ phần tử sẵn sàng.</li>
<li>Bốn locator CSS đổi sang <code>getByLabel</code> và <code>getByRole</code> theo chữ trên trang.</li>
<li><code>page.getByLabel('Bán').check()</code> thiếu <code>await</code>: thêm vào.</li>
<li><code>expect(...).toBeTruthy()</code> thay bằng <code>await expect(...).toContainText('BÁN 7203 x100')</code>: kiểm tra đủ loại lệnh, mã và khối lượng.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('đặt lệnh bán 7203', async ({ page }) => {
  await page.goto('/order');
  await page.getByLabel('Mã cổ phiếu').selectOption('7203');
  await page.getByLabel('Bán').check();
  await page.getByLabel('Khối lượng').fill('100');
  await page.getByLabel('Tôi đồng ý').check();
  await page.getByRole('button', { name: 'Đặt lệnh' }).click();
  await expect(page.getByRole('status')).toContainText('BÁN 7203 x100');
});` }]},
});
