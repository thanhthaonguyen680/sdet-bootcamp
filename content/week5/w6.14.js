defineExercise({
  id: 'w6.14',
  pw: true,
  route: '/orders',
  title: 'Prompt rõ thì kết quả tốt',

  // AI ghi sẵn, chạy khi bấm nút "AI viết test" (xem js/mcp/ai-writer.js).
  // Câu giao việc càng rõ, AI viết test càng có giá trị: mơ hồ → chỉ kiểm tra trang hiện; có thao tác → kiểm tra có dòng hiện; có kết quả mong đợi → kiểm tra đủ.
  mcp: (() => {
    const STATUS = [[/cho khop/, 'Chờ khớp'], [/da khop/, 'Đã khớp'], [/da huy/, 'Đã hủy']];
    const statusIn = p => (STATUS.find(([re]) => re.test(p)) || [])[1];
    const open = { label: 'Mở trang Lệnh của tôi', tool: 'browser_navigate', url: '/orders' };
    const filter = st => ({ label: 'Chọn lọc trạng thái ' + st, tool: 'browser_select_option', target: "page.getByRole('combobox', { name: 'Lọc theo trạng thái' })", values: [st] });
    const count = st => freshAppState().orders.filter(o => o.status === st).length;
    const onlyStatus = st => count(st) === 0
      ? { label: 'Kiểm tra: bảng báo không có lệnh nào', expect: "await expect(page.getByText('Không có lệnh nào')).toBeVisible();" }
      : { label: 'Kiểm tra: bảng còn đúng ' + count(st) + ' lệnh, đều là ' + st,
          expect: "const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });\nawait expect(rows).toHaveCount(" + count(st) + ");\nawait expect(rows.filter({ hasNotText: '" + st + "' })).toHaveCount(0);" };
    return {
      tasks: [{
        // Có thao tác lọc và nói rõ sau khi lọc điều gì phải đúng
        match: [/\bloc\b|filter/, /cho khop|da khop|da huy/, /chi con|chi hien|chi gom|chi co|tat ca|toan bo|\bdeu\b|khong con|khong co|khong hien|khong lan|so lenh|so dong|so luong|\bdem\b|bao nhieu|\d+ (lenh|dong)/],
        plan: (prompt, p) => { const st = statusIn(p); return {
          name: 'lọc lệnh ' + st,
          reply: 'Rõ rồi: lọc trạng thái ' + st + ', sau đó kiểm tra bảng chỉ còn lệnh ' + st + '.',
          steps: [open, filter(st), onlyStatus(st)],
          done: count(st) ? 'Xong! Test lọc ' + st + ' rồi kiểm tra số dòng và chắc chắn không còn dòng nào khác ' + st + '.' : 'Xong! Hiện chưa có lệnh ' + st + ' nào, nên test kiểm tra bảng báo không có lệnh nào.',
        }; },
      }, {
        // Có thao tác nhưng không nói kết quả mong đợi: AI tự chọn một kiểm tra dễ nhất
        match: [/\bloc\b|filter/, /cho khop|da khop|da huy/],
        plan: (prompt, p) => { const st = statusIn(p); return {
          name: 'lọc lệnh ' + st,
          reply: 'Được. Mình sẽ lọc trạng thái ' + st + ' trên trang Lệnh của tôi rồi viết test.',
          steps: [open, filter(st), count(st) === 0 ? onlyStatus(st)
            : { label: 'Kiểm tra: có lệnh ' + st + ' trên bảng', expect: "await expect(page.getByRole('row').filter({ hasText: '" + st + "' }).first()).toBeVisible();" }],
          done: 'Xong! Test lọc ' + st + ' và kiểm tra có lệnh ' + st + ' hiện trên bảng.',
        }; },
      }, {
        // Mơ hồ: chỉ nói trang nào
        match: [/lenh|order|trang/],
        name: 'trang Lệnh của tôi',
        reply: 'Được. Mình sẽ mở trang Lệnh của tôi và viết test cho trang này.',
        steps: [open,
          { label: 'Kiểm tra: trang có tiêu đề Lệnh của tôi', expect: "await expect(page.getByRole('heading', { name: 'Lệnh của tôi' })).toBeVisible();" },
          { label: 'Kiểm tra: có bảng lệnh', expect: "await expect(page.getByRole('table')).toBeVisible();" }],
        done: 'Xong! Test mở trang Lệnh của tôi và kiểm tra trang hiện đúng tiêu đề và bảng lệnh.',
      }],
      unknown: 'Bài này mình làm việc trên trang Lệnh của tôi. Hãy nói rõ muốn test thao tác gì ở đó.',
    };
  })(),

  desc: `<p>AI chỉ làm đúng điều bạn nói. Bài này cho thấy yêu cầu mơ hồ và yêu cầu rõ ràng cho ra test khác nhau thế nào.</p>
<ol>
<li>Ô soạn code đang có yêu cầu <code>// AI: Viết test cho trang Lệnh của tôi</code>. Bấm <strong>AI viết test</strong>, rồi <strong>Kiểm tra bài</strong>: test pass, nhưng bài chưa đạt.</li>
<li>Viết lại dòng <code>// AI:</code> cho rõ. Việc cần test: lọc trạng thái <strong>Chờ khớp</strong>, sau đó bảng <strong>chỉ còn</strong> các lệnh Chờ khớp.</li>
<li>Bấm AI viết test lại (AI viết lại test theo yêu cầu mới), rồi Kiểm tra bài.</li>
</ol>
<p class="note">Bộ chấm chạy lại test trên phiên bản có bug "ô lọc không có tác dụng" (vẫn hiện mọi lệnh). Test phải fail.</p>`,
  hints: [
    'Yêu cầu tốt có 3 phần: <strong>ở đâu</strong> (trang Lệnh của tôi), <strong>làm gì</strong> (lọc trạng thái Chờ khớp), <strong>sau đó điều gì phải đúng</strong> (chỉ còn lệnh Chờ khớp).',
    'Nếu chỉ nói "lọc Chờ khớp", AI chỉ kiểm tra có lệnh Chờ khớp hiện ra. Khi ô lọc hỏng, lệnh Chờ khớp vẫn hiện (lẫn với lệnh khác), nên test vẫn pass.',
    'Ví dụ: <code>// AI: Vào trang Lệnh của tôi, lọc trạng thái Chờ khớp, kiểm tra bảng chỉ còn lệnh Chờ khớp.</code> Bạn cũng có thể tự sửa test, thêm <code>toHaveCount</code> như tuần 4.'],
  starter: String.raw`// Giao việc cho AI: viết yêu cầu sau "AI:", rồi bấm nút "AI viết test".
// Kiểm tra bài chưa đạt thì viết lại yêu cầu cho rõ hơn và bấm AI viết test lại.
// AI: Viết test cho trang Lệnh của tôi
`,
  tests: PWG + AWAIT_LINT + String.raw`
check('Có ít nhất một test và tất cả pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Test có lọc trạng thái "Chờ khớp"', () => expect(__acts().some(a => a.type === 'selectOption' && /Chờ khớp/.test(JSON.stringify(a.arg))), 'Test chưa lọc trạng thái Chờ khớp. Câu giao việc cần nói rõ thao tác cần test').toBe(true));
check('Không chờ cứng, đủ await', () => { expect(/waitForTimeout|setTimeout/.test(__src), 'Không cần chờ cứng: assertion của Playwright tự chờ').toBe(false); const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Có kiểm tra kết quả', () => expect(__okAssert(/^(toHaveCount|toHaveText|toContainText|toBeVisible|toBeHidden)$/), 'Test chưa kiểm tra gì').toBe(true));
check('Phát hiện bug "ô lọc không có tác dụng"', async () => { const r = await H.rerun('filter-broken'); expect(r.some(t => t.status === 'failed'), 'Ô lọc hỏng (vẫn hiện mọi lệnh) mà test vẫn pass. Câu giao việc chưa nói sau khi lọc điều gì phải đúng, nên AI chỉ kiểm tra những gì dễ thấy').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>AI không đọc được suy nghĩ của bạn</h3>
<p>Câu "viết test cho trang Lệnh của tôi" buộc AI tự đoán: test thao tác nào, kiểm tra điều gì. AI thường chọn cách dễ nhất: mở trang và kiểm tra trang có hiện. Test đó pass, nhưng gần như không bắt được bug nào.</p>
<h3>Ba phần của một câu giao việc tốt</h3>
${ANAT(['Vào trang Lệnh của tôi,', '<strong>Ở đâu</strong>: trang hoặc điểm bắt đầu.'], ' ', ['lọc trạng thái Chờ khớp,', '<strong>Làm gì</strong>: thao tác cần test, đủ cụ thể (lọc theo giá trị nào).'], ' ', ['kiểm tra bảng chỉ còn lệnh Chờ khớp.', '<strong>Sau đó điều gì phải đúng</strong>: kết quả mong đợi. Phần này hay bị quên nhất, và là phần quyết định test có bắt được bug hay không.'])}
<h3>So sánh</h3>
${TRACE(['Câu giao việc', 'AI kiểm tra', 'Bắt được bug ô lọc hỏng?'], [['"Viết test cho trang Lệnh của tôi"', 'Trang có tiêu đề và bảng', 'Không'], ['"Lọc trạng thái Chờ khớp rồi viết test"', 'Có lệnh Chờ khớp hiện ra', 'Không: lệnh Chờ khớp vẫn hiện, chỉ là lẫn với lệnh khác'], ['"... kiểm tra bảng chỉ còn lệnh Chờ khớp"', 'Đúng số dòng, không còn dòng khác', 'Có']])}
<h3>Thêm yêu cầu về cách viết</h3>
<p>Với AI thật, bạn có thể thêm yêu cầu về cách viết test, ví dụ: <em>"Chỉ dùng getByRole, getByLabel; không dùng waitForTimeout; nếu chưa rõ cần kiểm tra gì thì hỏi lại mình"</em>. Câu cuối rất hữu ích: AI sẽ hỏi lại thay vì tự đoán.</p>
<p class="note">Góc QA: "sau đó điều gì phải đúng" chính là cột <em>Expected result</em> trong test case. Viết được test case tốt thì cũng viết được câu giao việc tốt.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Yêu cầu: <code>// AI: Vào trang Lệnh của tôi, lọc trạng thái Chờ khớp, kiểm tra bảng chỉ còn lệnh Chờ khớp.</code> Test AI viết:</p>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Câu giao việc nói đủ ba phần, nên AI biết phải kiểm tra gì sau khi lọc.</li>
<li><code>rows</code> là các dòng dữ liệu (dòng có ô <code>cell</code>; dòng tiêu đề chỉ có <code>columnheader</code>). Kiểm tra còn đúng 2 dòng, và không dòng nào thiếu chữ "Chờ khớp".</li>
<li>Với bug ô lọc hỏng, bảng vẫn còn 3 dòng, có dòng "Đã khớp", nên test fail đúng như mong muốn.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('lọc lệnh Chờ khớp', async ({ page }) => {
  await page.goto('/orders');
  await page.getByRole('combobox', { name: 'Lọc theo trạng thái' }).selectOption('Chờ khớp');
  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(2);
  await expect(rows.filter({ hasNotText: 'Chờ khớp' })).toHaveCount(0);
});` }]},
});
