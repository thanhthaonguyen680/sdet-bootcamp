defineExercise({
  id: 'w6.2',
  title: 'Viết prompt có cấu trúc',
  desc: `<p>Một prompt tốt có 5 phần. Viết function <code>buildPrompt(p)</code> ghép object <code>{ role, context, task, constraints, format }</code> thành chuỗi theo đúng mẫu:</p>
<pre>Vai trò: ...
Bối cảnh: ...
Nhiệm vụ: ...
Ràng buộc:
- ...
- ...
Định dạng: ...</pre>
<p>Mỗi phần một dòng, nối bằng <code>"\\n"</code>. Nếu <code>constraints</code> là mảng rỗng thì bỏ cả mục "Ràng buộc".</p>
<p>Sau đó điền object <code>orderPrompt</code> để nhờ AI viết test case cho form <strong>Đặt lệnh</strong> của Sàn Demo. Bộ chấm kiểm tra prompt có đủ thông tin để AI không phải đoán:</p>
<ul>
<li>Vai trò là QA / kiểm thử viên.</li>
<li>Bối cảnh nêu đủ 2 quy tắc của form: khối lượng phải là <strong>bội số của 100</strong>, phải tích <strong>đồng ý</strong> điều khoản mới đặt được.</li>
<li>Nhiệm vụ là viết <strong>test case</strong>; ít nhất 2 ràng buộc, trong đó có nhắc <strong>giá trị biên</strong>; định dạng đầu ra là <strong>bảng</strong> hoặc <strong>JSON</strong>.</li>
</ul>`,
  hints: [
    'Tạo mảng <code>lines</code>, <code>push</code> từng dòng: <code>"Vai trò: " + p.role</code>... Cuối cùng <code>return lines.join("\\n");</code>',
    'Mục ràng buộc: <code>if (p.constraints.length &gt; 0) { lines.push("Ràng buộc:"); for (const c of p.constraints) lines.push("- " + c); }</code>',
    'Ví dụ ràng buộc tốt: "Ưu tiên giá trị biên và trường hợp sai", "Không tự thêm quy tắc không có trong bối cảnh", "Mỗi test case chỉ kiểm tra một điều".'],
  starter: String.raw`function buildPrompt(p) {

}

const orderPrompt = {
  role: "",
  context: "",
  task: "",
  constraints: [],
  format: "",
};

console.log(buildPrompt(orderPrompt));
`,
  tests: String.raw`
const __p = { role: 'Bạn là QA', context: 'Trang X', task: 'Viết test case', constraints: ['A', 'B'], format: 'Bảng' };
const __low = x => String(x || '').toLowerCase();
test('buildPrompt ghép đúng thứ tự và định dạng', () => expect(buildPrompt(__p)).toBe('Vai trò: Bạn là QA\nBối cảnh: Trang X\nNhiệm vụ: Viết test case\nRàng buộc:\n- A\n- B\nĐịnh dạng: Bảng'));
test('Không có ràng buộc thì bỏ cả mục Ràng buộc', () => expect(buildPrompt({ ...__p, constraints: [] })).toBe('Vai trò: Bạn là QA\nBối cảnh: Trang X\nNhiệm vụ: Viết test case\nĐịnh dạng: Bảng'));
test('orderPrompt: vai trò là QA / kiểm thử', () => expect(/qa|kiểm thử|tester/.test(__low(orderPrompt.role)), 'Hãy cho AI biết nó đóng vai QA').toBe(true));
test('orderPrompt: bối cảnh nêu đủ 2 quy tắc của form', () => { const c = __low(orderPrompt.context); expect(c.includes('bội số của 100'), 'Bối cảnh chưa nêu quy tắc "bội số của 100"').toBe(true); expect(c.includes('đồng ý'), 'Bối cảnh chưa nêu quy tắc phải tích đồng ý').toBe(true); });
test('orderPrompt: nhiệm vụ là viết test case', () => expect(__low(orderPrompt.task).includes('test case'), 'Nhiệm vụ chưa nói rõ cần test case').toBe(true));
test('orderPrompt: ít nhất 2 ràng buộc, có nhắc giá trị biên', () => { const cs = orderPrompt.constraints || []; expect(cs.length >= 2, 'Cần ít nhất 2 ràng buộc').toBe(true); expect(cs.some(c => __low(c).includes('biên')), 'Chưa có ràng buộc nào nhắc giá trị biên').toBe(true); });
test('orderPrompt: chỉ rõ định dạng đầu ra', () => expect(/bảng|json/.test(__low(orderPrompt.format)), 'Định dạng nên là bảng hoặc JSON để dễ đọc và dễ chuyển thành test').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Prompt mơ hồ thì AI phải đoán</h3>
<p>Prompt "viết test case cho form đặt lệnh" buộc AI tự đoán form có những ô gì, quy tắc là gì, bạn muốn bao nhiêu ca, trình bày thế nào. Đoán sai ở đâu thì kết quả sai ở đó. Prompt tốt trả lời trước những câu AI sẽ phải đoán.</p>
<h3>5 phần của một prompt tốt</h3>
${ANAT(["Vai trò: Bạn là QA có 5 năm kinh nghiệm test ứng dụng chứng khoán.", "<strong>Vai trò</strong>: AI trả lời theo góc nhìn và mức độ chi tiết của vai đó."], "\n", ["Bối cảnh: Form Đặt lệnh có ô Khối lượng (bội số của 100)...", "<strong>Bối cảnh</strong>: mọi quy tắc nghiệp vụ AI cần biết. Thiếu quy tắc nào, AI sẽ tự nghĩ ra quy tắc đó."], "\n", ["Nhiệm vụ: Viết test case cho ô Khối lượng.", "<strong>Nhiệm vụ</strong>: một việc cụ thể, có phạm vi rõ."], "\n", ["Ràng buộc:\n- Ưu tiên giá trị biên\n- Không tự thêm quy tắc", "<strong>Ràng buộc</strong>: điều phải làm và không được làm. Đây là chỗ bạn chặn trước các lỗi AI hay mắc."], "\n", ["Định dạng: Bảng gồm tên, dữ liệu, kết quả mong đợi.", "<strong>Định dạng</strong>: hình dạng câu trả lời, để dễ đọc và dễ chuyển thành code."])}
<h3>So sánh</h3>
${TRACE(['Prompt kém', 'Prompt tốt'], [['"Viết test cho trang đặt lệnh"', 'Nêu vai trò, quy tắc của form, phạm vi cần test'], ['Không nói dùng locator gì', '"Chỉ dùng getByRole, getByLabel; không dùng CSS, không waitForTimeout"'], ['Nhận về một đoạn văn dài', '"Trả về bảng" hoặc "trả về JSON theo mẫu {...}"'], ['Một câu hỏi lớn', 'Chia nhỏ: test case trước, rồi code cho từng ca']])}
<p>Thêm một ràng buộc rất hữu ích: <em>"Nếu thiếu thông tin thì hỏi lại, đừng tự giả định"</em>. AI sẽ liệt kê những gì nó chưa chắc thay vì âm thầm đoán.</p>
{{ex0}}`,
examples:[String.raw`const parts = ["Vai trò: QA", "Nhiệm vụ: viết test case"];
const extra = ["Ưu tiên giá trị biên", "Không tự thêm quy tắc"];
for (const e of extra) parts.push("- " + e);
console.log(parts.join("\n"));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Gom các dòng vào mảng rồi <code>join("\\n")</code> dễ đọc hơn nối chuỗi bằng <code>+</code>, và dễ bỏ qua một mục khi cần.</li>
<li>Bối cảnh nêu đủ quy tắc, nên AI không phải đoán. Ràng buộc "không tự thêm quy tắc" chặn trước đúng lỗi AI mắc ở bài 3.</li>
<li>Định dạng JSON theo mẫu giúp chép thẳng câu trả lời vào code test theo dữ liệu.</li>
</ul>`,
examples:[String.raw`function buildPrompt(p) {
  const lines = [];
  lines.push("Vai trò: " + p.role);
  lines.push("Bối cảnh: " + p.context);
  lines.push("Nhiệm vụ: " + p.task);
  if (p.constraints.length > 0) {
    lines.push("Ràng buộc:");
    for (const c of p.constraints) lines.push("- " + c);
  }
  lines.push("Định dạng: " + p.format);
  return lines.join("\n");
}

const orderPrompt = {
  role: "Bạn là QA có kinh nghiệm test ứng dụng giao dịch chứng khoán.",
  context: "Form Đặt lệnh có ô Mã cổ phiếu, Loại lệnh (Mua/Bán), Khối lượng, Giá đặt. Khối lượng phải lớn hơn 0 và là bội số của 100. Phải tích ô đồng ý điều khoản thì nút Đặt lệnh mới bấm được.",
  task: "Viết test case cho ô Khối lượng và ô đồng ý.",
  constraints: [
    "Ưu tiên giá trị biên và trường hợp sai",
    "Không tự thêm quy tắc không có trong bối cảnh",
    "Nếu thiếu thông tin thì hỏi lại, đừng tự giả định",
  ],
  format: "JSON dạng [{ name, qty, expected }] với expected là ok hoặc error",
};

console.log(buildPrompt(orderPrompt));`]},
});
