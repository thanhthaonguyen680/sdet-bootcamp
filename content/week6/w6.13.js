defineExercise({
  id: 'w6.13',
  pw: true,
  route: '/login',
  title: 'Giao việc cho AI bằng một câu',

  // AI ghi sẵn ở tab "Giao việc cho AI" (xem js/mcp/pane.js)
  mcp: (() => {
    const login = [
      { label: 'Mở trang Đăng nhập', tool: 'browser_navigate', url: '/login' },
      { label: 'Điền email thao@sandemo.test', tool: 'browser_type', target: "page.getByLabel('Email')", text: 'thao@sandemo.test' },
      { label: 'Điền mật khẩu', tool: 'browser_type', target: "page.getByLabel('Mật khẩu')", text: 'Demo@123' },
      { label: 'Bấm Đăng nhập', tool: 'browser_click', target: "page.getByRole('button', { name: 'Đăng nhập' })" },
      { tool: 'browser_wait_for', text: 'Bảng giá' },
      { label: 'Kiểm tra: đã vào trang Bảng giá', expect: "await expect(page.getByRole('heading', { name: 'Bảng giá' })).toBeVisible();" },
    ];
    return {
      suggest: ['Đăng nhập bằng tài khoản thử, đặt lệnh mua 100 cổ phiếu Toyota, rồi viết test kiểm tra đặt lệnh thành công'],
      tasks: [{
        match: [/dat lenh|\bmua\b/],
        plan: (prompt, p) => {
          const st = W6_STOCK(p, '7203'), { qty, note } = W6_QTY(p), opt = st.code + ' - ' + st.name;
          return {
            name: 'đặt lệnh mua ' + st.name + ' thành công',
            reply: 'Được. Mình sẽ đăng nhập bằng tài khoản thử ghi trên trang, đặt lệnh mua ' + qty + ' cổ phiếu ' + esc(opt) + ', rồi viết test cho đúng luồng vừa làm.' + note,
            steps: [...login,
              { label: 'Mở trang Đặt lệnh', tool: 'browser_click', target: "page.getByRole('link', { name: 'Đặt lệnh' })" },
              { label: 'Chọn mã ' + opt, tool: 'browser_select_option', target: "page.getByRole('combobox', { name: 'Mã cổ phiếu' })", values: [opt] },
              { label: 'Nhập khối lượng ' + qty, tool: 'browser_type', target: "page.getByRole('spinbutton', { name: 'Khối lượng' })", text: String(qty) },
              { label: 'Tích ô đồng ý điều khoản', tool: 'browser_click', target: "page.getByRole('checkbox', { name: 'Tôi đồng ý' })" },
              { label: 'Bấm Đặt lệnh', tool: 'browser_click', target: "page.getByRole('button', { name: 'Đặt lệnh' })" },
              { tool: 'browser_wait_for', text: 'Đặt lệnh thành công' },
              { label: 'Kiểm tra: thông báo đặt lệnh thành công, đúng mã và khối lượng', expect: "await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA " + st.code + ' x' + qty + "');" },
            ],
            done: 'Xong! Lệnh đã đặt thành công. Test đi lại đúng luồng vừa làm và kiểm tra hai điều: đăng nhập xong thì vào được Bảng giá, và thông báo đặt lệnh có đúng mã, khối lượng. Bấm <b>Đưa vào ô soạn code</b> rồi <b>Chạy</b> để xem.',
          };
        },
      }, {
        match: [/dang nhap|login/],
        name: 'đăng nhập thành công',
        reply: 'Được. Mình sẽ đăng nhập bằng tài khoản thử ghi trên trang rồi viết test.',
        steps: login,
        done: 'Xong! Test đăng nhập và kiểm tra đã vào Bảng giá. Bài này cần thêm bước đặt lệnh: thử giao việc trọn luồng, ví dụ câu gợi ý ở trên.',
      }],
      unknown: 'Bài này mình làm được việc đăng nhập và đặt lệnh mua trên Sàn Demo. Hãy nói rõ mua mã nào, bao nhiêu cổ phiếu, rồi nhờ mình viết test. Hoặc bấm câu gợi ý ở trên.',
    };
  })(),

  desc: `<p>Ở tuần 4 bạn tự viết từng dòng test. Với <strong>Playwright MCP</strong>, bạn chỉ cần giao việc bằng một câu: AI tự mở trình duyệt, thao tác trên trang và viết test.</p>
<ol>
<li>Mở tab <strong>Giao việc cho AI</strong>. Gửi một câu nhờ AI đăng nhập, đặt lệnh mua cổ phiếu rồi viết test (có thể bấm câu gợi ý, hoặc tự viết: đổi mã, đổi khối lượng).</li>
<li>Xem AI làm từng bước trên trang web bên dưới khung chat.</li>
<li>Bấm <strong>Đưa vào ô soạn code</strong>, rồi <strong>Chạy</strong>: test phải pass.</li>
<li>Đọc test AI viết: dòng nào là thao tác, dòng nào là kiểm tra? Rồi bấm <strong>Kiểm tra bài</strong>.</li>
</ol>
<p class="note">Đây là AI mô phỏng, chỉ hiểu các việc trong bài. Bài 6 hướng dẫn dùng AI và Playwright MCP thật trên máy của bạn.</p>`,
  hints: [
    'Câu giao việc cần nói đủ: đăng nhập, đặt lệnh mua mã nào, bao nhiêu cổ phiếu, và nhờ viết test. Ví dụ: <em>"Đăng nhập rồi đặt lệnh mua 200 cổ phiếu Sony, viết test cho luồng này"</em>.',
    'Sau khi AI làm xong, khung chat có ô <strong>Test AI viết</strong> với nút <strong>Đưa vào ô soạn code</strong>. Bấm nút đó, rồi bấm Chạy ở ô soạn code.',
    'Dòng có <code>expect(...)</code> là kiểm tra; các dòng còn lại (<code>goto</code>, <code>fill</code>, <code>click</code>, <code>selectOption</code>) là thao tác, đúng như tuần 4.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// 1. Mở tab "Giao việc cho AI" và gửi một câu giao việc.
// 2. Bấm "Đưa vào ô soạn code": test AI viết sẽ thay cho đoạn dưới đây.
// 3. Bấm Chạy, rồi Kiểm tra bài.
test('đặt lệnh mua thành công', async ({ page }) => {

});
`,
  tests: PWG + AWAIT_LINT + String.raw`
check('Có ít nhất một test và tất cả pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Test có đăng nhập', () => expect(__acts().some(a => a.type === 'fill' && a.arg === 'thao@sandemo.test'), 'Chưa thấy bước điền email đăng nhập. Hãy giao việc cho AI rồi đưa test vào ô soạn code').toBe(true));
check('Test đặt lệnh thành công', () => expect(/Đặt lệnh thành công/.test(H.doc().body.textContent), 'Cuối test chưa thấy thông báo "Đặt lệnh thành công"').toBe(true));
check('Test có kiểm tra nội dung thông báo', () => expect(__okAssert(/^(toHaveText|toContainText)$/), 'Chưa có assertion kiểm tra chữ trên trang (toContainText hoặc toHaveText)').toBe(true));
check('Mọi thao tác và expect đều có await', () => { const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Playwright MCP là gì</h3>
<p>Bình thường AI chỉ đọc và viết chữ. Nó không nhìn thấy trang web của bạn, nên khi viết test nó phải <strong>đoán</strong> nút tên gì, ô nằm đâu. <strong>MCP</strong> (Model Context Protocol) là cách cấp thêm "công cụ" cho AI. <strong>Playwright MCP</strong> cấp cho AI một trình duyệt: AI tự mở trang, đọc trang, bấm và gõ như người dùng.</p>
<h3>Bạn giao việc, AI tự làm</h3>
${TRACE(['Bước', 'AI làm gì'], [['1. Nhìn trang', 'Đọc cấu trúc trang (gọi là <strong>snapshot</strong>): có nút nào, ô nào, tên là gì'], ['2. Thao tác', 'Bấm, gõ, chọn như người dùng thật, mỗi lần một bước, rồi nhìn lại trang'], ['3. Ghi lại', 'Mỗi thao tác được ghi thành một dòng code Playwright, locator lấy từ trang thật nên không phải đoán'], ['4. Viết test', 'Ghép các dòng đó thành test và thêm phần kiểm tra']])}
<p>Muốn biết AI đã làm gì, mở mục <strong>Xem AI làm gì bên trong</strong> dưới khung chat: từng lần gọi công cụ, code đã chạy và snapshot AI nhận được. Không bắt buộc phải đọc phần này.</p>
<h3>Đọc test AI viết</h3>
${ANAT(["await page.goto('/login');", 'Mở trang đầu tiên của luồng.'], '\n', ["await page.getByRole('textbox', { name: 'Email' }).fill('thao@sandemo.test');", '<strong>Thao tác</strong>. Locator theo role và tên, đúng kiểu đã học ở tuần 4.'], '\n', ["await expect(page.getByRole('heading', { name: 'Bảng giá' })).toBeVisible();", '<strong>Kiểm tra giữa chừng</strong>: đăng nhập thành công thì phải vào được Bảng giá.'], '\n', ["await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA 7203 x100');", '<strong>Kiểm tra cuối</strong>: thông báo có đúng mã và khối lượng. Đặt nhầm mã thì dòng này fail.'])}
<h3>Bạn vẫn là người chịu trách nhiệm</h3>
<ul>
<li>AI chỉ làm đúng điều bạn nói. Nói thiếu thì test thiếu (bài 3).</li>
<li>Test AI viết có thể pass hôm nay rồi vỡ ngày mai, hoặc pass cả khi ứng dụng sai (bài 4).</li>
<li>Mật khẩu đang nằm thẳng trong test. Với tài khoản thật, đưa vào biến môi trường hoặc secrets (tuần 5), và đừng đưa mật khẩu thật cho AI (bài 1).</li>
</ul>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Test AI viết khi giao việc bằng câu gợi ý:</p>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi dòng thao tác là code mà Playwright MCP ghi lại khi AI bấm hoặc gõ trên trang thật, nên locator đúng với trang.</li>
<li>Hai dòng <code>expect</code> là phần AI thêm vào để test có ý nghĩa: không có chúng, test chỉ bấm qua các bước và luôn pass.</li>
<li>Giao việc với mã hoặc khối lượng khác, AI viết test tương ứng: <code>MUA 6758 x200</code> cho 200 cổ phiếu Sony.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect } from '@playwright/test';

test('đặt lệnh mua Toyota Motor thành công', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('thao@sandemo.test');
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Demo@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Bảng giá' })).toBeVisible();
  await page.getByRole('link', { name: 'Đặt lệnh' }).click();
  await page.getByRole('combobox', { name: 'Mã cổ phiếu' }).selectOption('7203 - Toyota Motor');
  await page.getByRole('spinbutton', { name: 'Khối lượng' }).fill('100');
  await page.getByRole('checkbox', { name: 'Tôi đồng ý với điều khoản giao dịch' }).click();
  await page.getByRole('button', { name: 'Đặt lệnh' }).click();
  await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA 7203 x100');
});` }]},
});
