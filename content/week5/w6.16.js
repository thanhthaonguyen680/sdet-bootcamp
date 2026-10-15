// Tệp rule mẫu đầy đủ: dùng trong bài giảng và lời giải.
const W6_RULES_SAMPLE = String.raw`# Rule cho AI viết test Playwright (project sandemo-e2e)

Luôn tuân thủ các rule dưới đây khi viết hoặc sửa test. Rule nào không làm được thì nói rõ, không tự ý bỏ qua.

## Chờ
- Không dùng page.waitForTimeout() hay chờ cứng. Thao tác và expect của Playwright đã tự chờ.
  Lý do: chờ cứng làm test chậm, và vẫn fail khi máy chậm hơn.

## Locator
- Dùng getByRole, getByLabel theo chữ người dùng nhìn thấy. Không dùng CSS, XPath, nth().
- Không dựa vào dữ liệu hay thay đổi như giá, giờ, số đếm. Tìm dòng theo mã cổ phiếu hoặc tên công ty: filter({ hasText: '7203' }).
  Lý do: giá đổi theo từng giây, locator chứa giá sẽ vỡ ở lần chạy sau.

## Assertion
- Mỗi test phải kiểm tra kết quả nghiệp vụ cụ thể bằng toHaveText hoặc toContainText (đúng mã, đúng khối lượng), không chỉ toBeVisible.
  Lý do: chỉ kiểm tra "có hiện" thì ứng dụng làm sai test vẫn pass.

## Dữ liệu và bí mật
- Không ghi mật khẩu, token vào code. Đọc từ biến môi trường: process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD.
  Lý do: code nằm trong repo, ai đọc được repo là đọc được mật khẩu.

## Test case
- Mỗi test case gồm: ID, tiền điều kiện, các bước, dữ liệu, kết quả mong đợi.
- Bao phủ trường hợp đúng, trường hợp sai và giá trị biên.
- Chỉ dùng quy tắc nghiệp vụ có trong yêu cầu, không tự thêm. Thiếu thông tin thì hỏi lại, không tự giả định.
`;

defineExercise({
  id: 'w6.16',
  pw: true,
  route: '/login',
  title: 'Đặt rule cho AI: nói một lần, AI nhớ mãi',
  projectName: 'sandemo-e2e',
  files: {
    'AGENTS.md': String.raw`# Rule cho AI viết test Playwright (project sandemo-e2e)

Luôn tuân thủ các rule dưới đây khi viết hoặc sửa test.

## Chờ
- Không dùng page.waitForTimeout() hay chờ cứng. Thao tác và expect của Playwright đã tự chờ.
  Lý do: chờ cứng làm test chậm, và vẫn fail khi máy chậm hơn.

## Locator
- TODO: viết rule về cách chọn locator (gợi ý: dữ liệu nào trên Bảng giá hay thay đổi?)

## Assertion
- TODO: viết rule về cách viết phần kiểm tra

## Dữ liệu và bí mật
- TODO: viết rule về mật khẩu, tài khoản đăng nhập
`,
    'tests/mua.spec.ts': String.raw`// Giao việc cho AI: bấm nút "AI viết test". AI đọc AGENTS.md trước rồi mới viết test.
// Kiểm tra bài chưa đạt thì sửa rule trong AGENTS.md (không sửa yêu cầu), rồi bấm AI viết test lại.
// AI: Mua 100 cổ phiếu Toyota từ Bảng giá rồi viết test
`,
    '.env': String.raw`# Tài khoản test. Trên CI, các giá trị này nằm trong secrets (tuần 6).
TEST_USER_EMAIL=thao@sandemo.test
TEST_USER_PASSWORD=Demo@123
`,
  },
  open: 'tests/mua.spec.ts',

  // AI ghi sẵn, chạy khi bấm nút "AI viết test" (xem js/mcp/ai-writer.js): đọc AGENTS.md trước, rồi viết test theo những rule nó tìm thấy (W6_RULES).
  mcp: {
    file: 'tests/mua.spec.ts',
    rules: 'AGENTS.md',
    tasks: [{
      match: [/\bmua\b|dat lenh/],
      plan: (prompt, p, rulesText) => {
        const r = W6_RULES(rulesText), st = W6_STOCK(p, '7203'), { qty, note } = W6_QTY(p);
        const found = W6_RULE_GROUPS.filter(g => r[g.key]).map(g => g.name);
        const env = name => "process.env." + name + "!";
        return {
          name: 'mua ' + st.name + ' từ Bảng giá',
          reply: (found.length ? 'Mình đã đọc AGENTS.md, có rule về: <b>' + found.join(', ') + '</b>. Mình sẽ làm theo các rule này.' : 'Mình đã đọc AGENTS.md nhưng chưa thấy rule nào, nên sẽ viết theo cách quen thuộc.') +
            ' Việc cần làm: đăng nhập, bấm Mua ở dòng ' + esc(st.name) + ' trên Bảng giá, đặt ' + qty + ' cổ phiếu rồi viết test.' + note,
          steps: [
            { label: 'Mở trang Đăng nhập', tool: 'browser_navigate', url: '/login' },
            { label: 'Điền email' + (r.secret ? ' (đọc từ biến môi trường)' : ''), tool: 'browser_type', target: "page.getByLabel('Email')", text: 'thao@sandemo.test',
              rewrite: r.secret ? c => c.replace("'thao@sandemo.test'", env('TEST_USER_EMAIL')) : null },
            { label: 'Điền mật khẩu' + (r.secret ? ' (đọc từ biến môi trường)' : ''), tool: 'browser_type', target: "page.getByLabel('Mật khẩu')", text: 'Demo@123',
              rewrite: r.secret ? c => c.replace("'Demo@123'", env('TEST_USER_PASSWORD')) : null },
            { label: 'Bấm Đăng nhập', tool: 'browser_click', target: "page.getByRole('button', { name: 'Đăng nhập' })" },
            r.wait ? { tool: 'browser_wait_for', text: st.name }
                   : { label: 'Chờ 2 giây cho Bảng giá tải xong', code: 'await page.waitForTimeout(2000);' },
            { label: 'Bấm Mua ở dòng ' + st.name + (r.locator ? ' (tìm dòng theo mã)' : ''), tool: 'browser_click', element: 'nút Mua ở dòng ' + st.name,
              target: "page.getByRole('row').filter({ hasText: '" + st.code + "' }).getByRole('button', { name: 'Mua' })",
              rewrite: r.locator ? () => "await page.getByRole('row').filter({ hasText: '" + st.code + "' }).getByRole('button', { name: 'Mua' }).click();" : null },
            { label: 'Nhập khối lượng ' + qty, tool: 'browser_type', target: "page.getByRole('spinbutton', { name: 'Khối lượng' })", text: String(qty) },
            { label: 'Tích ô đồng ý điều khoản', tool: 'browser_click', target: "page.getByRole('checkbox', { name: 'Tôi đồng ý' })" },
            { label: 'Bấm Đặt lệnh', tool: 'browser_click', target: "page.getByRole('button', { name: 'Đặt lệnh' })" },
            { tool: 'browser_wait_for', text: 'Đặt lệnh thành công' },
            r.assert
              ? { label: 'Kiểm tra: thông báo đúng mã và khối lượng', expect: "await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA " + st.code + ' x' + qty + "');" }
              : { label: 'Kiểm tra: có thông báo hiện ra', expect: "await expect(page.getByRole('status')).toBeVisible();" },
          ],
          done: found.length === W6_RULE_GROUPS.length
            ? 'Xong! Test đã theo đủ ' + found.length + ' nhóm rule trong AGENTS.md.'
            : 'Xong! Test chạy được. Mình đã theo ' + found.length + '/' + W6_RULE_GROUPS.length + ' nhóm rule có trong AGENTS.md; những chỗ khác mình viết theo cách quen thuộc.',
        };
      },
    }],
    unknown: 'Bài này mình làm việc mua cổ phiếu từ Bảng giá. Ví dụ: Mua 100 cổ phiếu Toyota từ Bảng giá rồi viết test.',
  },

  desc: `<p>Ở bài 2 đến 4, muốn AI viết test tốt thì phải nhắc đúng từng lỗi trong yêu cầu. Bài này dùng <strong>rule</strong>: viết các nguyên tắc một lần vào tệp <code>AGENTS.md</code> của project, AI tự đọc trước mỗi lần làm việc.</p>
<ol>
<li>Mở tệp <code>tests/mua.spec.ts</code> (đang mở sẵn) và bấm <strong>AI viết test</strong>. <code>AGENTS.md</code> mới có rule về Chờ, nên test AI viết còn nhiều lỗi. Bấm Kiểm tra bài để xem.</li>
<li>Mở <code>AGENTS.md</code> ở cây thư mục bên trái ô soạn code, viết thêm rule cho 3 nhóm còn TODO: <strong>Locator</strong>, <strong>Assertion</strong>, <strong>Dữ liệu và bí mật</strong>.</li>
<li>Quay lại <code>tests/mua.spec.ts</code>, <strong>giữ nguyên yêu cầu</strong>, bấm AI viết test lại rồi Kiểm tra bài.</li>
</ol>
<p class="note">Bộ chấm chạy lại test khi giá đã đổi (phải vẫn pass) và trên bản có bug "bấm Mua mở nhầm mã cổ phiếu" (phải fail). Tệp <code>.env</code> có sẵn tài khoản test, đọc bằng <code>process.env</code>.</p>`,
  hints: [
    'Mỗi rule là một gạch đầu dòng, nói rõ <strong>làm gì</strong> và <strong>tránh gì</strong>, như rule mẫu ở mục Chờ. Rule chung chung như "viết locator tốt" thì AI không biết làm theo thế nào.',
    'Locator: nói rõ không dựa vào giá hay dữ liệu thay đổi, tìm dòng theo mã. Assertion: kiểm tra nội dung cụ thể bằng <code>toContainText</code>, không chỉ <code>toBeVisible</code>. Bí mật: không ghi mật khẩu vào code, đọc từ <code>process.env</code>.',
    'Câu trả lời đầu tiên của AI ở tab Console cho biết nó nhận ra những nhóm rule nào. Nhóm nào chưa được nhận ra thì viết lại rule đó cụ thể hơn. Rule mẫu đầy đủ có trong bài giảng.'],
  tests: PWG + AWAIT_LINT + String.raw`
const F = __pw.files, __spec = (F['tests/mua.spec.ts'] || '').split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
check('AGENTS.md có rule cho cả 4 nhóm', () => { const r = W6_RULES(F['AGENTS.md'] || ''); const miss = W6_RULE_GROUPS.filter(g => !r[g.key]).map(g => g.name); expect(miss.length === 0, 'Chưa có rule (hoặc rule chưa đủ cụ thể) cho: ' + miss.join(', ') + '. Viết rule trong tệp AGENTS.md').toBe(true); });
check('Có ít nhất một test và tất cả pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Test có đặt lệnh mua', () => expect(/Đặt lệnh thành công/.test(H.doc().body.textContent), 'Cuối test chưa thấy thông báo "Đặt lệnh thành công". Hãy bấm AI viết test ở tệp tests/mua.spec.ts').toBe(true));
check('Không chờ cứng, đủ await', () => { expect(/waitForTimeout|setTimeout/.test(__spec), 'Còn chờ cứng (waitForTimeout)').toBe(false); const bad = __noAwait(__spec); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Không ghi mật khẩu vào code', () => { expect(/Demo@123/.test(__spec), 'Mật khẩu đang nằm trong tệp test. Cần rule về bí mật: đọc từ process.env').toBe(false); expect(/process\.env\.TEST_USER_PASSWORD/.test(__spec), 'Hãy đọc mật khẩu từ process.env.TEST_USER_PASSWORD').toBe(true); });
check('Không phụ thuộc vào giá: giá đổi thì test vẫn pass', async () => { const r = await H.rerun('price-tick'); expect(r.length > 0 && r.every(t => t.status === 'passed'), 'Giá vừa đổi và test bị fail: locator đang dựa vào giá. Cần rule về locator').toBe(true); });
check('Phát hiện bug "bấm Mua mở nhầm mã cổ phiếu"', async () => { const r = await H.rerun('buy-wrong-stock'); expect(r.some(t => t.status === 'failed'), 'Đặt nhầm mã mà test vẫn pass: phần kiểm tra chỉ xem thông báo có hiện. Cần rule về assertion').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Rule là gì</h3>
<p><strong>Rule</strong> là một tệp văn bản nằm trong project, ghi các nguyên tắc mà AI phải tuân thủ. Công cụ AI tự đọc tệp này <strong>trước mọi yêu cầu</strong>, nên bạn không phải nhắc lại trong từng câu giao việc.</p>
${TRACE(['Công cụ', 'Tệp rule'], [['Chuẩn dùng chung, nhiều công cụ đọc được', '<code>AGENTS.md</code> ở thư mục gốc project'], ['Claude Code', '<code>CLAUDE.md</code>'], ['GitHub Copilot', '<code>.github/copilot-instructions.md</code>'], ['Cursor', 'thư mục <code>.cursor/rules/</code>']])}
<p>Tên tệp mỗi công cụ một khác, nội dung thì giống nhau: Markdown, mỗi rule một gạch đầu dòng.</p>
<h3>Tại sao cần rule</h3>
<ul>
<li><strong>AI không nhớ gì giữa các lần chat.</strong> Hôm qua bạn đã dặn "đừng dùng waitForTimeout", hôm nay mở phiên mới AI lại viết như cũ.</li>
<li><strong>Mỗi người prompt một kiểu.</strong> Cả team cùng nhờ AI viết test, không có rule thì mỗi tệp test một phong cách, review rất mệt.</li>
<li><strong>Lỗi ở bài 2 đến 4 cứ lặp lại:</strong> locator dựa vào giá, chỉ kiểm tra "có hiện", mật khẩu trong code. Mỗi lỗi bạn đã sửa một lần nên thành một rule để không phải sửa lần nữa.</li>
<li><strong>Rule là coding standard của team, viết cho AI đọc.</strong> Người mới vào team đọc cũng hiểu team viết test thế nào.</li>
</ul>
<h3>Viết rule thế nào để AI làm theo</h3>
<ul>
<li><strong>Cụ thể, kiểm chứng được</strong>: "Dùng getByRole, getByLabel. Không dùng CSS, XPath", thay vì "viết locator tốt", "code sạch".</li>
<li><strong>Kèm lý do</strong>: "vì giá đổi theo từng giây". Có lý do, AI tự áp dụng được cho trường hợp tương tự mà rule không nhắc tới.</li>
<li><strong>Có ví dụ đúng</strong>: <code>filter({ hasText: '7203' })</code>, thay vì để AI tự đoán "ổn định" nghĩa là gì.</li>
<li><strong>Ngắn gọn, chia theo nhóm</strong>. Rule dài vài trang thì rule quan trọng bị lẫn, AI dễ bỏ sót.</li>
<li><strong>Thêm rule mỗi khi review thấy một lỗi lặp lại</strong>, đừng viết một lần rồi để đó mãi.</li>
</ul>
<h3>Rule mẫu cho team QA</h3>
<p>Có thể chép tệp dưới đây vào project thật rồi chỉnh theo team. Nhóm <strong>Test case</strong> dùng khi nhờ AI liệt kê test case (bài 8): đó là chỗ AI hay tự bịa thêm quy tắc nghiệp vụ.</p>
<pre>${esc(W6_RULES_SAMPLE)}</pre>
<p class="note">Góc QA: rule giúp AI làm đúng <strong>thường xuyên hơn</strong>, không phải luôn luôn. Vẫn phải review test AI viết (bài 4). Khác biệt là danh sách lỗi cần soi sẽ ngắn đi nhiều.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Viết đủ rule trong <code>AGENTS.md</code> (như rule mẫu trong bài giảng), giữ nguyên yêu cầu <code>// AI: Mua 100 cổ phiếu Toyota từ Bảng giá rồi viết test</code>, AI viết test như dưới đây (hai tệp nằm chung một khối):</p>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Câu giao việc không đổi, chỉ có rule thay đổi. Mỗi nhóm rule sửa đúng một loại lỗi: rule Locator bỏ giá khỏi locator, rule Assertion đổi <code>toBeVisible</code> thành kiểm tra đúng mã và khối lượng, rule Bí mật chuyển mật khẩu sang <code>process.env</code>.</li>
<li>Rule viết một lần dùng cho mọi lần giao việc sau, và cho cả team.</li>
</ul>`,
examples:[{ run:false, code:'// @file: AGENTS.md\n' + W6_RULES_SAMPLE + '\n// @file: tests/mua.spec.ts\n' + String.raw`// AI: Mua 100 cổ phiếu Toyota từ Bảng giá rồi viết test

import { test, expect } from '@playwright/test';

test('mua Toyota Motor từ Bảng giá', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.TEST_USER_EMAIL!);
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.getByRole('row').filter({ hasText: '7203' }).getByRole('button', { name: 'Mua' }).click();
  await page.getByRole('spinbutton', { name: 'Khối lượng' }).fill('100');
  await page.getByRole('checkbox', { name: 'Tôi đồng ý với điều khoản giao dịch' }).click();
  await page.getByRole('button', { name: 'Đặt lệnh' }).click();
  await expect(page.getByRole('status')).toContainText('Đặt lệnh thành công: MUA 7203 x100');
});` }]},
});
