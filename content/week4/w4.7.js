defineExercise({
  id: 'w4.7',
  pw: true,
  kind: 'locator',
  route: '/dashboard',
  exports: ['locators'],
  title: 'CSS selector nâng cao',
  desc: `<p>Trên bảng giá, dùng CSS để lấy <strong>nhóm</strong> phần tử (mỗi locator khớp nhiều phần tử):</p>
<ul>
<li><code>rows</code>: tất cả 6 dòng dữ liệu (không tính dòng tiêu đề).</li>
<li><code>priceCells</code>: 6 ô ở cột "Giá" (cột thứ 3).</li>
<li><code>risingCells</code>: các ô "Thay đổi" đang tăng giá (có class <code>up</code>).</li>
<li><code>watchButtons</code>: 6 nút "Theo dõi". Id của chúng sinh ngẫu nhiên, nhưng luôn bắt đầu bằng <code>watch-</code>.</li>
</ul>`,
  hints: [
    'Dấu cách nghĩa là "nằm bên trong": <code>tbody tr</code> là các <code>tr</code> nằm trong <code>tbody</code>.',
    '<code>:nth-child(3)</code> chọn phần tử là con thứ 3 của cha nó. Ví dụ <code>tbody td:nth-child(3)</code>.',
    '<code>[id^="watch-"]</code> nghĩa là id <strong>bắt đầu bằng</strong> "watch-". Tương tự <code>*=</code> là chứa, <code>$=</code> là kết thúc bằng.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  rows: page.locator('TODO'),
  priceCells: page.locator('TODO'),
  risingCells: page.locator('TODO'),
  watchButtons: page.locator('TODO'),
});
`,
  tests: String.raw`
const r = { kinds: ['css'], kindLabel: 'page.locator() với CSS selector' };
check('rows (6 dòng)', () => H.locator('rows', 'tbody tr', r));
check('priceCells (6 ô)', () => H.locator('priceCells', 'tbody td:nth-child(3)', r));
check('risingCells', () => H.locator('risingCells', 'td.up', r));
check('watchButtons (6 nút)', () => H.locator('watchButtons', '[id^="watch-"]', r));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kết hợp selector</h3>
${TRACE(['Cú pháp', 'Ý nghĩa'], [['<code>tbody tr</code>', 'tr nằm bên trong tbody (ở bất kỳ cấp nào)'], ['<code>tr &gt; td</code>', 'td là con trực tiếp của tr'], ['<code>td:nth-child(3)</code>', 'td là con thứ 3 của cha'], ['<code>tr:first-child</code>, <code>:last-child</code>', 'con đầu, con cuối'], ['<code>[id^="watch-"]</code>', 'id bắt đầu bằng'], ['<code>[id*="atch"]</code>', 'id có chứa'], ['<code>button:not(.ghost)</code>', 'button không có class ghost']])}
{{ex0}}
<h3>Id sinh ngẫu nhiên</h3>
<p>Nhiều framework (React, Angular) tự sinh id như <code>watch-8f3a2</code>, mỗi lần tải trang một khác. Locator <code>#watch-8f3a2</code> hôm nay chạy, mai hỏng. Nếu buộc phải dùng id, hãy dùng phần cố định với <code>^=</code>.</p>`,
examples:[String.raw`test('CSS nâng cao', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('tbody tr')).toHaveCount(6);
  const prices = await page.locator('tbody td:nth-child(3)').allTextContents();
  console.log('Giá:', prices);
  console.log('Mã tăng giá:', await page.locator('tbody tr:has(td.up) td:first-child').allTextContents());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>tbody tr</code> loại được dòng tiêu đề vì dòng đó nằm trong <code>thead</code>.</li>
<li><code>:nth-child(3)</code> đếm từ 1 (khác với <code>nth()</code> của Playwright đếm từ 0).</li>
<li>Toyota, SoftBank và Keyence tăng giá nên <code>td.up</code> khớp 3 ô. Nintendo đứng giá, có class <code>flat</code>.</li>
<li><code>[id^="watch-"]</code> không phụ thuộc phần ngẫu nhiên phía sau.</li>
</ul>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  rows: page.locator('tbody tr'),
  priceCells: page.locator('tbody td:nth-child(3)'),
  risingCells: page.locator('td.up'),
  watchButtons: page.locator('[id^="watch-"]'),
});`]},
});
