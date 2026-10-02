defineExercise({
  id: 'w4.8',
  pw: true,
  kind: 'locator',
  route: '/orders',
  exports: ['locators'],
  title: 'XPath',
  desc: `<p>XPath hữu ích khi cần đi theo quan hệ giữa các phần tử mà CSS không làm được, ví dụ "tìm dòng có ô chứa chữ X". Dùng <code>page.locator('//...')</code> trên trang Lệnh của tôi:</p>
<ul>
<li><code>row1002</code>: dòng có số hiệu "DH-1002".</li>
<li><code>cancel1003</code>: nút "Hủy" trong dòng "DH-1003".</li>
<li><code>badges</code>: tất cả nhãn trạng thái (thẻ <code>span</code> có class chứa <code>badge</code>), khớp 3 phần tử.</li>
<li><code>typeHeader</code>: ô tiêu đề cột <strong>ngay sau</strong> cột "Mã".</li>
</ul>`,
  hints: [
    '<code>//tr[td[text()="DH-1002"]]</code>: một <code>tr</code> có con <code>td</code> với chữ đúng bằng "DH-1002".',
    'Đi tiếp xuống bên trong: <code>//tr[td[text()="DH-1003"]]//button[text()="Hủy"]</code>. Class nhiều giá trị dùng <code>contains(@class, "badge")</code>.',
    'Anh em đứng sau: <code>//th[text()="Mã"]/following-sibling::th[1]</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  row1002: page.locator('//TODO'),
  cancel1003: page.locator('//TODO'),
  badges: page.locator('//TODO'),
  typeHeader: page.locator('//TODO'),
});
`,
  tests: String.raw`
const r = { kinds: ['xpath'], kindLabel: 'XPath (chuỗi bắt đầu bằng //)' };
const rowOf = id => d => [...d.querySelectorAll('tbody tr')].filter(tr => tr.cells[0].textContent === id);
check('row1002', () => H.locator('row1002', rowOf('DH-1002'), r));
check('cancel1003', () => H.locator('cancel1003', d => rowOf('DH-1003')(d).map(tr => tr.querySelector('button.danger')), r));
check('badges (3 phần tử)', () => H.locator('badges', 'span.badge', r));
check('typeHeader', () => H.locator('typeHeader', d => [d.querySelectorAll('th')[2]], r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>XPath: đi theo quan hệ</h3>
<p>XPath là ngôn ngữ đường dẫn trong cây HTML. Nó làm được một việc CSS không làm được: <strong>tìm cha dựa vào con</strong>, ví dụ dòng có ô chứa chữ "DH-1002".</p>
${TRACE(['Cú pháp', 'Ý nghĩa'], [['<code>//td</code>', 'mọi td ở bất kỳ đâu'], ['<code>//td[text()="DH-1002"]</code>', 'td có chữ đúng bằng'], ['<code>//td[contains(text(), "DH")]</code>', 'td có chữ chứa'], ['<code>//tr[td[text()="DH-1002"]]</code>', 'tr có con td thỏa điều kiện'], ['<code>//span[contains(@class, "badge")]</code>', 'span có class chứa badge'], ['<code>//th[text()="Mã"]/following-sibling::th[1]</code>', 'th đứng ngay sau'], ['<code>/..</code>', 'đi lên cha']])}
{{ex0}}
<p class="note">Góc QA: nhiều project Selenium cũ dùng XPath rất nhiều. Trong Playwright, cùng việc "tìm nút trong dòng có chữ X" thường viết gọn và dễ đọc hơn bằng <code>filter</code> (bài 6). Hãy coi XPath là phương án cuối.</p>`,
examples:[String.raw`test('thử XPath', async ({ page }) => {
  await page.goto('/orders');
  const row = page.locator('//tr[td[text()="DH-1002"]]');
  console.log(await row.textContent());
  console.log('Số badge:', await page.locator('//span[contains(@class, "badge")]').count());
  console.log(await page.locator('//th[text()="Giá"]/preceding-sibling::th[1]').textContent());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Đọc từng biểu thức</h3>
<ul>
<li><code>//tr[td[text()="DH-1002"]]</code>: "một tr bất kỳ, có con td mà chữ đúng bằng DH-1002".</li>
<li><code>...//button[text()="Hủy"]</code>: đi tiếp xuống button "Hủy" nằm trong dòng đó.</li>
<li><code>contains(@class, "badge")</code>: cần thiết vì class thật là <code>"badge wait"</code>; viết <code>@class="badge"</code> sẽ không khớp.</li>
<li><code>following-sibling::th[1]</code>: anh em đứng sau, lấy cái đầu tiên.</li>
</ul>
<h3>Cùng việc đó bằng Playwright</h3>
{{ex1}}`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  row1002: page.locator('//tr[td[text()="DH-1002"]]'),
  cancel1003: page.locator('//tr[td[text()="DH-1003"]]//button[text()="Hủy"]'),
  badges: page.locator('//span[contains(@class, "badge")]'),
  typeHeader: page.locator('//th[text()="Mã"]/following-sibling::th[1]'),
});`,
String.raw`test('so sánh với filter', async ({ page }) => {
  await page.goto('/orders');
  const row = page.getByRole('row').filter({ hasText: 'DH-1003' });
  console.log(await row.getByRole('button', { name: 'Hủy' }).count());
});`]},
});
