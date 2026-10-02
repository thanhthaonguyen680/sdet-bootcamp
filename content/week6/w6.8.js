defineExercise({
  id: 'w6.8',
  title: 'Dùng AI thật trên máy của bạn',
  desc: `<p>Đọc bài giảng (hướng dẫn cài đặt và dùng thử từng công cụ), rồi trả lời 6 câu dưới đây bằng chữ cái <code>A</code>, <code>B</code>, <code>C</code> hoặc <code>D</code> trong object <code>answers</code>.</p>
<ol>
<li>Bạn muốn AI tự mở Sàn Demo, nhìn trang thật rồi viết test với locator có thật. Công cụ phù hợp nhất?<br>A. Chat AI trên web &nbsp; B. Playwright MCP &nbsp; C. Gợi ý code khi gõ trong VS Code &nbsp; D. Công cụ dịch</li>
<li>Trong Playwright Agents, agent nào lo việc sửa test đang fail?<br>A. planner &nbsp; B. generator &nbsp; C. healer &nbsp; D. reporter</li>
<li>Agent sửa một test fail bằng cách đổi <code>toHaveText('Đặt lệnh thành công: BÁN ...')</code> thành <code>toBeVisible()</code>. Bạn nên?<br>A. Chấp nhận vì test đã pass &nbsp; B. Kiểm tra lại: có thể ứng dụng có bug thật, assertion yếu đi để che bug &nbsp; C. Xóa test &nbsp; D. Tăng timeout</li>
<li>Được dán gì vào một công cụ AI công cộng mà công ty chưa duyệt?<br>A. Log có mật khẩu test &nbsp; B. Dữ liệu khách hàng thật &nbsp; C. Đoạn code mẫu đã bỏ thông tin nội bộ và dữ liệu nhạy cảm &nbsp; D. Tệp .env</li>
<li>Trước khi commit test do AI viết, việc nào quan trọng nhất?<br>A. Đọc hiểu từng dòng, chạy test, và thử làm sai dữ liệu hoặc cài bug để chắc test có thể fail &nbsp; B. Chỉ cần test pass &nbsp; C. Nhờ một AI khác xem &nbsp; D. Đổi tên biến cho đẹp</li>
<li>AI gợi ý <code>await page.locator('div &gt; div:nth-child(3) &gt; button').click()</code>. Bạn nên?<br>A. Giữ vì chạy được &nbsp; B. Thay bằng <code>getByRole</code> với tên nút người dùng nhìn thấy &nbsp; C. Thêm <code>waitForTimeout</code> &nbsp; D. Thêm <code>.first()</code></li>
</ol>`,
  hints: [
    'Câu 1 và 2 có trong phần "4 cách dùng AI" và "Playwright Agents" của bài giảng.',
    'Câu 3 và 5 cùng một ý: test pass chưa đủ, test phải có khả năng fail khi ứng dụng sai.',
    'Câu 4 và 6 ôn lại bài 1 và tuần 4: không đưa dữ liệu nhạy cảm cho AI; locator nên dựa vào thứ người dùng nhìn thấy.'],
  starter: String.raw`// Trả lời bằng "A", "B", "C" hoặc "D"
const answers = {
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
  q6: "",
};

console.log(answers);
`,
  tests: String.raw`
const __a = k => String((typeof answers === 'object' && answers && answers[k]) || '').trim().toUpperCase();
test('Câu 1', () => expect(__a('q1'), 'Chưa đúng. Công cụ nào cho AI điều khiển và nhìn thấy trình duyệt thật?').toBe('B'));
test('Câu 2', () => expect(__a('q2'), 'Chưa đúng. Xem lại vai trò của 3 agent: lập kế hoạch, viết test, sửa test').toBe('C'));
test('Câu 3', () => expect(__a('q3'), 'Chưa đúng. Test pass nhờ assertion yếu đi thì có thể đang che một bug thật').toBe('B'));
test('Câu 4', () => expect(__a('q4'), 'Chưa đúng. Chỉ đưa cho AI những gì bạn sẵn sàng công khai').toBe('C'));
test('Câu 5', () => expect(__a('q5'), 'Chưa đúng. Một test không bao giờ fail thì không bảo vệ được gì').toBe('A'));
test('Câu 6', () => expect(__a('q6'), 'Chưa đúng. Ôn lại thứ tự ưu tiên locator ở tuần 4').toBe('B'));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>4 cách dùng AI cho automation test</h3>
${TRACE(['Cách dùng', 'Công cụ ví dụ', 'Hợp với'], [['Chat hỏi đáp', 'ChatGPT, Claude, Gemini, Copilot Chat', 'Test case, giải thích lỗi, học khái niệm'], ['AI trong VS Code', 'GitHub Copilot, Claude Code, Cursor', 'Viết và sửa code ngay trong project'], ['AI điều khiển trình duyệt', 'Playwright MCP', 'AI tự mở trang, đọc trang thật, viết test với locator có thật'], ['Agent chuyên cho test', 'Playwright Agents: planner, generator, healer', 'Lập kế hoạch, sinh test, tự sửa test fail']])}
<p class="note">Trước khi cài, hỏi team công ty được phép dùng công cụ nào và với dữ liệu nào (bài 1). Các lệnh dưới đây đúng ở thời điểm viết bài; công cụ AI thay đổi nhanh, hãy xem tài liệu chính thức nếu lệnh không chạy.</p>
<h3>1. Chat AI: bắt đầu từ prompt mẫu</h3>
<p>Không cần cài gì. Mở công cụ chat công ty cho phép, dùng cấu trúc 5 phần của bài 2. Ba prompt nên thử với Sàn Demo:</p>
<ul>
<li><em>"Bạn là QA. Form Đặt lệnh có các quy tắc: ... Liệt kê test case dạng bảng, ưu tiên giá trị biên, không tự thêm quy tắc."</em></li>
<li><em>"Viết test Playwright TypeScript cho luồng: ... Chỉ dùng getByRole, getByLabel; không dùng CSS, không waitForTimeout; kiểm tra đúng nội dung thông báo."</em></li>
<li><em>"Test này fail với lỗi: ... Liệt kê các nguyên nhân có thể, xếp theo khả năng, và cách kiểm tra từng nguyên nhân."</em></li>
</ul>
<h3>2. AI trong VS Code</h3>
<ol>
<li>Cài extension <strong>GitHub Copilot</strong> (hoặc công cụ công ty cho phép), đăng nhập.</li>
<li>Mở project Playwright đã làm ở tuần 4. Gõ tên test, AI gợi ý phần thân; bấm Tab để nhận.</li>
<li>Mở khung chat, chọn tệp test và hỏi: <em>"Review test này theo checklist: await, locator, assertion"</em>.</li>
</ol>
<h3>3. Playwright MCP: cho AI nhìn thấy trang</h3>
<p>MCP là cách cấp "công cụ" cho AI. Playwright MCP cho AI mở trình duyệt, bấm, gõ và đọc cây accessibility của trang thật, nên AI viết locator theo nhãn và role có thật thay vì đoán.</p>
${ANAT(["claude mcp add playwright", "Đăng ký một máy chủ MCP tên <code>playwright</code> với công cụ AI (ví dụ này dùng Claude Code; VS Code và các công cụ khác có mục cấu hình MCP tương tự)."], " ", ["npx @playwright/mcp@latest", "Lệnh khởi động máy chủ Playwright MCP. Cần cài Node.js."])}
<p>Sau đó thử yêu cầu: <em>"Mở trang đặt lệnh, đặt một lệnh mua 100 cổ phiếu 7203, rồi viết test Playwright cho đúng luồng vừa làm."</em> Đọc kỹ test AI viết ra bằng checklist của tuần này.</p>
<h3>4. Playwright Agents</h3>
<p>Từ phiên bản 1.56, Playwright có sẵn bộ agent dùng cùng công cụ AI:</p>
<ul>
<li><strong>planner</strong>: khám phá ứng dụng và viết kế hoạch test (dạng Markdown).</li>
<li><strong>generator</strong>: biến kế hoạch thành tệp test Playwright.</li>
<li><strong>healer</strong>: chạy test, test nào fail thì tìm cách sửa.</li>
</ul>
<p>Cài vào project bằng lệnh <code>npx playwright init-agents --loop=vscode</code> (đổi <code>vscode</code> thành công cụ AI bạn dùng). Hãy đặc biệt cẩn thận với <strong>healer</strong>: "sửa cho pass" có thể là che một bug thật, đúng như các cách sửa sai ở bài 6.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Đáp án</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><strong>Câu 1 (B)</strong>: Playwright MCP cho AI mở và đọc trang thật, nên locator dựa trên nhãn, role có thật.</li>
<li><strong>Câu 2 (C)</strong>: planner lập kế hoạch, generator viết test, healer sửa test fail.</li>
<li><strong>Câu 3 (B)</strong>: test fail có thể vì ứng dụng sai. Làm yếu assertion để test pass là che bug.</li>
<li><strong>Câu 4 (C)</strong>: chỉ đưa những gì bạn sẵn sàng công khai.</li>
<li><strong>Câu 5 (A)</strong>: test phải fail được khi ứng dụng sai, và bạn phải hiểu từng dòng mình commit.</li>
<li><strong>Câu 6 (B)</strong>: locator theo cấu trúc HTML vỡ ngay khi dev thêm một thẻ div.</li>
</ul>`,
examples:[String.raw`const answers = {
  q1: "B",
  q2: "C",
  q3: "B",
  q4: "C",
  q5: "A",
  q6: "B",
};
console.log(answers);`]},
});
