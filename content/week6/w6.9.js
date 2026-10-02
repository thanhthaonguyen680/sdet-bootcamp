defineExercise({
  id: 'w6.9',
  title: 'Tổng hợp: tự động review code AI',
  desc: `<p>Biến checklist review của tuần này thành code. Viết function <code>reviewTest(code)</code> nhận đoạn code Playwright (dạng chuỗi) và trả về mảng <strong>mã lỗi</strong> tìm thấy, theo đúng thứ tự trong bảng, mỗi mã một lần:</p>
<div class="tbl"><table><tr><th>Mã</th><th>Dấu hiệu</th></tr>
<tr><td><code>wait-cung</code></td><td>có <code>waitForTimeout</code></td></tr>
<tr><td><code>thieu-await</code></td><td>có dòng chứa <code>.click(</code>, <code>.fill(</code>, <code>.check(</code>, <code>.goto(</code> hoặc <code>.selectOption(</code> mà không có chữ <code>await</code></td></tr>
<tr><td><code>css-locator</code></td><td>có <code>page.locator(</code></td></tr>
<tr><td><code>chon-bua</code></td><td>có <code>.first()</code> hoặc <code>.nth(</code></td></tr>
<tr><td><code>assert-yeu</code></td><td>có <code>toBeTruthy()</code> hoặc <code>toBeDefined()</code></td></tr>
<tr><td><code>mat-khau</code></td><td>có dòng chứa <code>.fill('</code> hoặc <code>.fill("</code> và chứa chữ <code>password</code> hoặc <code>mật khẩu</code> (không phân biệt hoa thường)</td></tr>
</table></div>
<p>Bỏ qua các dòng comment (bắt đầu bằng <code>//</code> sau khi bỏ khoảng trắng đầu dòng). Code không có lỗi thì trả về <code>[]</code>.</p>`,
  hints: [
    'Tách thành mảng dòng và bỏ comment: <code>const lines = code.split("\\n").filter(l =&gt; !l.trim().startsWith("//"));</code> Sau đó mỗi mã lỗi là một câu <code>if</code> riêng, xét theo đúng thứ tự trong bảng.',
    'Hỏi "có dòng nào thỏa không" bằng <code>some</code> (tuần 3): <code>lines.some(l =&gt; l.includes("waitForTimeout"))</code>.',
    'thieu-await: <code>[".click(", ".fill(", ".check(", ".goto(", ".selectOption("].some(a =&gt; l.includes(a)) &amp;&amp; !l.includes("await")</code>. mat-khau: chuyển dòng về chữ thường bằng <code>toLowerCase()</code> trước khi tìm.'],
  starter: String.raw`function reviewTest(code) {
  const issues = [];

  return issues;
}

const aiCode = [
  "test('đăng nhập', async ({ page }) => {",
  "  await page.goto('/login');",
  "  await page.waitForTimeout(1000);",
  "  await page.getByLabel('Mật khẩu').fill('Demo@123');",
  "  page.getByRole('button', { name: 'Đăng nhập' }).click();",
  "  expect(page.locator('.welcome')).toBeTruthy();",
  "});",
].join("\n");

console.log(reviewTest(aiCode));
`,
  tests: String.raw`
const __j = (...l) => l.join('\n');
test('Code sạch → []', () => expect(reviewTest(__j("test('x', async ({ page }) => {", "  await page.goto('/order');", "  await page.getByLabel('Khối lượng').fill('100');", "  await expect(page.getByRole('status')).toContainText('BÁN');", "});"))).toEqual([]));
test('Code AI mẫu → đủ 5 lỗi, đúng thứ tự', () => expect(reviewTest(__j("test('đăng nhập', async ({ page }) => {", "  await page.goto('/login');", "  await page.waitForTimeout(1000);", "  await page.getByLabel('Mật khẩu').fill('Demo@123');", "  page.getByRole('button', { name: 'Đăng nhập' }).click();", "  expect(page.locator('.welcome')).toBeTruthy();", "});"))).toEqual(['wait-cung', 'thieu-await', 'css-locator', 'assert-yeu', 'mat-khau']));
test('Phát hiện .first() và .nth(', () => { expect(reviewTest("  await page.getByRole('button').first().click();")).toEqual(['chon-bua']); expect(reviewTest("  await page.getByRole('row').nth(2).click();")).toEqual(['chon-bua']); });
test('Mỗi mã chỉ xuất hiện một lần', () => expect(reviewTest(__j("  page.goto('/a');", "  page.getByLabel('x').fill('1');", "  page.getByText('y').click();"))).toEqual(['thieu-await']));
test('Bỏ qua dòng comment', () => expect(reviewTest(__j("  // await page.waitForTimeout(1000);", "  // page.locator('#a').click();", "  await page.getByText('a').click();"))).toEqual([]));
test('mat-khau không phân biệt hoa thường, cả nháy kép', () => { expect(reviewTest('  await page.getByLabel("Password").fill("Secret@1");')).toEqual(['mat-khau']); expect(reviewTest("  await page.getByLabel('Mật khẩu').fill(process.env.PASSWORD);")).toEqual([]); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Quy trình làm việc với AI</h3>
${TRACE(['Bước', 'Bạn làm', 'AI làm'], [['1. Hiểu yêu cầu', 'Đọc yêu cầu, hỏi BA chỗ chưa rõ', ''], ['2. Test case', 'Viết prompt có bối cảnh, kiểm chứng bằng phân vùng và biên', 'Liệt kê nháp'], ['3. Code test', 'Đưa locator thật hoặc dùng MCP, review từng dòng', 'Viết nháp'], ['4. Chạy và thử làm sai', 'Chạy, rồi cố tình làm sai dữ liệu để chắc test fail được', ''], ['5. Debug', 'Coi câu trả lời của AI là giả thuyết, tự kiểm tra', 'Gợi ý nguyên nhân'], ['6. Commit', 'Chỉ commit code bạn hiểu và giải thích được', '']])}
<h3>Checklist review code AI</h3>
<ul>
<li>Không có <code>waitForTimeout</code>.</li>
<li>Mọi thao tác và mọi <code>expect</code> trên locator đều có <code>await</code>.</li>
<li>Locator dùng <code>getBy...</code> theo chữ người dùng nhìn thấy, không dùng CSS, không chọn theo vị trí.</li>
<li>Assertion kiểm tra đúng nội dung, không dùng <code>toBeTruthy()</code> trên locator.</li>
<li>Không viết cứng mật khẩu, token; lấy từ <code>.env</code>.</li>
<li>Test fail khi ứng dụng sai.</li>
</ul>
<p>Năm mục đầu có thể kiểm tra tự động bằng cách đọc code, đúng như bài tập này. Trong project thật, việc đó do <strong>ESLint</strong> với plugin <code>eslint-plugin-playwright</code> đảm nhận, chạy trong CI ở tuần 5 để chặn code yếu trước khi merge. Mục cuối thì chỉ có bạn kiểm tra được.</p>
{{ex0}}`,
examples:[String.raw`const code = "await page.goto('/a');\n// page.waitForTimeout(1)\npage.getByText('x').click();";
const lines = code.split("\n").filter(l => !l.trim().startsWith("//"));
console.log(lines);
console.log("Có dòng thiếu await:", lines.some(l => l.includes(".click(") && !l.includes("await")));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Bỏ comment trước, nên các dòng bị comment không bị báo nhầm.</li>
<li>Mỗi mã lỗi là một câu <code>if</code> riêng, xét theo đúng thứ tự trong bảng, và <code>some</code> trả về <code>true/false</code> nên mỗi mã chỉ được thêm một lần.</li>
<li><code>mat-khau</code> chỉ báo khi <code>fill</code> nhận một chuỗi viết cứng. <code>fill(process.env.PASSWORD)</code> là cách đúng nên không bị báo.</li>
<li>Đây là phiên bản rất đơn giản của một linter. Trong project thật, dùng ESLint với <code>eslint-plugin-playwright</code>, nó hiểu cấu trúc code thay vì chỉ tìm chữ.</li>
</ul>`,
examples:[String.raw`function reviewTest(code) {
  const lines = code.split("\n").filter(l => !l.trim().startsWith("//"));
  const has = (text) => lines.some(l => l.includes(text));
  const actions = [".click(", ".fill(", ".check(", ".goto(", ".selectOption("];
  const issues = [];

  if (has("waitForTimeout")) issues.push("wait-cung");
  if (lines.some(l => actions.some(a => l.includes(a)) && !l.includes("await"))) issues.push("thieu-await");
  if (has("page.locator(")) issues.push("css-locator");
  if (has(".first()") || has(".nth(")) issues.push("chon-bua");
  if (has("toBeTruthy()") || has("toBeDefined()")) issues.push("assert-yeu");
  if (lines.some(l => {
    const low = l.toLowerCase();
    return (low.includes(".fill('") || low.includes('.fill("')) && (low.includes("password") || low.includes("mật khẩu"));
  })) issues.push("mat-khau");

  return issues;
}

const aiCode = [
  "test('đăng nhập', async ({ page }) => {",
  "  await page.goto('/login');",
  "  await page.waitForTimeout(1000);",
  "  await page.getByLabel('Mật khẩu').fill('Demo@123');",
  "  page.getByRole('button', { name: 'Đăng nhập' }).click();",
  "  expect(page.locator('.welcome')).toBeTruthy();",
  "});",
].join("\n");

console.log(reviewTest(aiCode));`]},
});
