defineExercise({
  id: '2.2',
  title: 'Viết lại bằng switch',
  desc: `<p>Viết function <code>classifyStatusSwitch(code)</code> cho kết quả giống bài 2.1 nhưng dùng <code>switch</code>.</p>`,
  hint: `Tính nhóm trước: <code>Math.floor(code / 100)</code> cho ra 2, 3, 4, 5. Sau đó <code>switch</code> theo giá trị này. Nhớ <code>return</code> hoặc <code>break</code> ở mỗi <code>case</code>.`,
  starter: String.raw`function classifyStatusSwitch(code) {
  // Dùng switch
}

console.log(classifyStatusSwitch(302)); // Redirect
`,
  tests: String.raw`
test('Có dùng switch', () => expect(/\bswitch\s*\(/.test(__source), 'Chưa thấy switch trong code').toBe(true));
test('204 → "Success"', () => expect(classifyStatusSwitch(204)).toBe("Success"));
test('302 → "Redirect"', () => expect(classifyStatusSwitch(302)).toBe("Redirect"));
test('401 → "Client Error"', () => expect(classifyStatusSwitch(401)).toBe("Client Error"));
test('500 → "Server Error"', () => expect(classifyStatusSwitch(500)).toBe("Server Error"));
test('100 và 700 → "Unknown"', () => { expect(classifyStatusSwitch(100)).toBe("Unknown"); expect(classifyStatusSwitch(700)).toBe("Unknown"); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Cú pháp switch</h3>
<p><code>switch</code> so sánh một giá trị với nhiều <code>case</code> bằng phép <code>===</code>. Hợp khi có nhiều nhánh dựa trên cùng một giá trị.</p>
${ANAT(['switch (side)', 'Giá trị đem đi so, ở đây là biến <code>side</code>.'], ' {\n  ', ['case "buy":', 'Nếu <code>side === "buy"</code> thì bắt đầu chạy từ dòng này. Chú ý dấu hai chấm ở cuối.'], '\n    console.log("Lệnh mua");\n    ', ['break;', 'Thoát khỏi <code>switch</code>. Thiếu dòng này thì chạy tiếp xuống case bên dưới.'], '\n  ', ['default:', 'Không <code>case</code> nào khớp thì chạy ở đây, giống <code>else</code>.'], '\n    console.log("Không hợp lệ");\n}')}
{{ex0}}
<h3>Đừng quên break</h3>
<p>Thiếu <code>break</code> thì code sẽ "rơi" xuống chạy tiếp case bên dưới:</p>
{{ex1}}
<h3>Gộp case và return trong function</h3>
<p>Trong function, dùng <code>return</code> thay cho <code>break</code>. Nhiều case chung một kết quả thì xếp chồng lên nhau:</p>
{{ex2}}
<p><code>switch</code> không so sánh được khoảng (như 200–299), nên cần đổi về một giá trị cụ thể trước. <code>Math.floor</code> làm tròn xuống, rất hữu ích ở đây.</p>
{{ex3}}`,
examples:[String.raw`const side = "sell";
switch (side) {
  case "buy":
    console.log("Lệnh mua");
    break;
  case "sell":
    console.log("Lệnh bán");
    break;
  default:
    console.log("Không hợp lệ");
}`,
String.raw`const level = 1;
switch (level) {
  case 1:
    console.log("Case 1");   // thiếu break
  case 2:
    console.log("Case 2 cũng chạy!");
    break;
}`,
String.raw`function dayType(day) {
  switch (day) {
    case "Sat":
    case "Sun":
      return "Cuối tuần";
    default:
      return "Ngày thường";
  }
}
console.log(dayType("Sun"), dayType("Mon"));`,
String.raw`console.log(Math.floor(4.9));   // 4
console.log(Math.floor(2850 / 1000));  // 2`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>switch</code> so sánh bằng <code>===</code> với từng <code>case</code>, không so sánh được khoảng. Vì vậy phải tính nhóm trước: <code>Math.floor(404 / 100)</code> là <code>4</code>.</li>
<li>Mỗi <code>case</code> có <code>return</code> nên không cần <code>break</code>.</li>
<li><code>default</code> bắt mọi nhóm còn lại (1, 6, 7...).</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Dùng <code>console.log</code> hoặc gán biến trong <code>case</code> mà quên <code>break</code>: code chạy tuột xuống các <code>case</code> bên dưới (fall-through).</p>`,
examples:[String.raw`function classifyStatusSwitch(code) {
  switch (Math.floor(code / 100)) {
    case 2: return "Success";
    case 3: return "Redirect";
    case 4: return "Client Error";
    case 5: return "Server Error";
    default: return "Unknown";
  }
}

console.log(classifyStatusSwitch(302)); // Redirect
console.log(classifyStatusSwitch(700)); // Unknown`]},
});
