defineExercise({
  id: 'w6.3',
  title: 'AI sinh test case: bổ sung và sửa',
  desc: `<p>Bạn dùng prompt ở bài 2 và AI trả về 4 test case cho ô <strong>Khối lượng</strong> (đã chuyển sang dạng dữ liệu trong code). Quy tắc thật của form chỉ có một: khối lượng phải <strong>lớn hơn 0</strong> và là <strong>bội số của 100</strong>.</p>
<p>Hãy tạo mảng <code>finalCases</code>: giữ ca đúng của AI, sửa ca sai, và bổ sung các ca còn thiếu. Mỗi ca có dạng <code>{ name, qty, expected }</code>, với <code>expected</code> là <code>"ok"</code> hoặc <code>"error"</code>.</p>
<p>Bộ chấm kiểm tra:</p>
<ul>
<li>Mọi <code>expected</code> đúng theo quy tắc thật, kể cả ca AI tự bịa quy tắc.</li>
<li>Có đủ: ca bằng 0, ca số âm, ca sát biên (99 hoặc 101), ca biên nhỏ nhất hợp lệ (100), ca số thập phân.</li>
<li>Ít nhất 6 ca, không trùng khối lượng, ca nào cũng có tên.</li>
</ul>`,
  hints: [
    'Đọc kỹ từng ca của AI và đối chiếu với quy tắc trong đề. Có một ca AI tự nghĩ ra một giới hạn mà đề không hề nói tới.',
    'Phân vùng: nhỏ hơn hoặc bằng 0 (lỗi), dương nhưng không chia hết cho 100 (lỗi), dương và chia hết cho 100 (hợp lệ). Mỗi vùng lấy giá trị ở biên: 0, 99, 100, 101.',
    'Thập phân: <code>100.5 % 100</code> bằng <code>0.5</code>, nên là lỗi. Có thể bắt đầu bằng <code>const finalCases = [...aiCases]</code> rồi sửa và thêm, hoặc viết lại từ đầu.'],
  starter: String.raw`// Câu trả lời của AI, đã chuyển thành dữ liệu:
const aiCases = [
  { name: "khối lượng hợp lệ", qty: 100, expected: "ok" },
  { name: "khối lượng lẻ", qty: 150, expected: "error" },
  { name: "vượt quá khối lượng tối đa", qty: 1000000, expected: "error" },
  { name: "khối lượng 200", qty: 200, expected: "ok" },
];

const finalCases = [
  // giữ, sửa và bổ sung ở đây
];

for (const c of finalCases) console.log(c.qty, "→", c.expected, "|", c.name);
`,
  tests: String.raw`
const __rule = q => (!q || q <= 0 || q % 100 !== 0) ? 'error' : 'ok';
const __cs = () => (typeof finalCases !== 'undefined' && Array.isArray(finalCases)) ? finalCases : [];
test('Có ít nhất 6 trường hợp', () => expect(__cs().length >= 6, 'Hiện có ' + __cs().length + ' trường hợp').toBe(true));
test('Đã sửa ca AI tự bịa quy tắc', () => { const big = __cs().find(c => c.qty === 1000000); expect(!big || big.expected === 'ok', 'Đề không có giới hạn tối đa: 1000000 là bội số của 100 nên hợp lệ. AI đã tự thêm quy tắc').toBe(true); });
test('Mọi expected đúng theo quy tắc thật', () => { const wrong = __cs().filter(c => c.expected !== __rule(c.qty)); expect(wrong.length === 0, 'Sai: ' + wrong.map(c => c.name + ' (qty ' + c.qty + ' phải là "' + __rule(c.qty) + '")').join('; ')).toBe(true); });
test('Có ca khối lượng bằng 0', () => expect(__cs().some(c => c.qty === 0)).toBe(true));
test('Có ca số âm', () => expect(__cs().some(c => c.qty < 0)).toBe(true));
test('Có ca sát biên: 99 hoặc 101', () => expect(__cs().some(c => c.qty === 99 || c.qty === 101)).toBe(true));
test('Có ca biên nhỏ nhất hợp lệ: 100', () => expect(__cs().some(c => c.qty === 100)).toBe(true));
test('Có ca số thập phân', () => expect(__cs().some(c => typeof c.qty === 'number' && !Number.isInteger(c.qty))).toBe(true));
test('Không trùng khối lượng, ca nào cũng có tên', () => { const cs = __cs(); expect(new Set(cs.map(c => c.qty)).size, 'Có khối lượng bị trùng').toBe(cs.length); expect(cs.every(c => typeof c.name === 'string' && c.name.trim() !== ''), 'Có ca chưa có tên').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>AI viết test case nhanh, nhưng không đủ và không luôn đúng</h3>
<p>Với cùng prompt, mỗi lần hỏi AI trả về một danh sách hơi khác nhau. Thường gặp 3 vấn đề:</p>
<ul>
<li><strong>Bịa quy tắc</strong>: AI thêm "khối lượng tối đa", "không quá 10 lệnh một ngày"... vì các form tương tự hay có, dù đề của bạn không hề nói.</li>
<li><strong>Thiếu giá trị biên</strong>: có ca 150 (lẻ) nhưng thiếu 0, 99, 101.</li>
<li><strong>Trùng ý</strong>: 100 và 200 cùng một vùng hợp lệ, thêm ca 200 không phát hiện thêm bug nào.</li>
</ul>
<h3>Cách kiểm chứng: phân vùng và giá trị biên</h3>
<p>Đây là kỹ thuật bạn đã dùng khi viết test case thủ công. Chia dữ liệu thành các vùng có cùng kết quả, rồi lấy giá trị ở ranh giới mỗi vùng:</p>
${TRACE(['Vùng', 'Kết quả', 'Giá trị nên thử'], [['Nhỏ hơn hoặc bằng 0', 'lỗi', '0, -100'], ['Dương, không chia hết cho 100', 'lỗi', '99, 101, 150, 100.5'], ['Dương, chia hết cho 100', 'hợp lệ', '100 (biên nhỏ nhất), một số lớn']])}
<p>Rồi đối chiếu <strong>từng</strong> ca của AI với quy tắc trong yêu cầu gốc. Ca nào dựa trên quy tắc không có trong yêu cầu thì hỏi lại BA, đừng tự tin theo AI.</p>
{{ex0}}
<p class="note">Góc QA: ghi test case ở dạng dữ liệu (mảng object, JSON) như bài này giúp chuyển thẳng sang test theo dữ liệu (bài 13 tuần 4). AI cũng làm việc tốt hơn khi bạn yêu cầu trả về đúng dạng đó.</p>`,
examples:[String.raw`const rule = q => (!q || q <= 0 || q % 100 !== 0) ? "error" : "ok";
for (const q of [0, -100, 99, 100, 101, 100.5, 1000000]) {
  console.log(q, "→", rule(q));
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Ca "vượt quá khối lượng tối đa" là AI <strong>bịa quy tắc</strong>: đề không có giới hạn tối đa. 1000000 chia hết cho 100 nên hợp lệ. Trong thực tế, gặp ca như vậy hãy hỏi lại BA thay vì tự quyết.</li>
<li>Ca 200 của AI trùng vùng với ca 100, bỏ đi không làm mất khả năng phát hiện bug nào.</li>
<li>Các ca thêm vào phủ đủ biên của mỗi vùng: 0, -100 (vùng nhỏ hơn hoặc bằng 0), 99, 101, 100.5 (dương nhưng không chia hết), 100 (biên nhỏ nhất hợp lệ).</li>
</ul>`,
examples:[String.raw`const finalCases = [
  { name: "biên nhỏ nhất hợp lệ", qty: 100, expected: "ok" },
  { name: "khối lượng rất lớn (không có giới hạn tối đa)", qty: 1000000, expected: "ok" },
  { name: "bằng 0", qty: 0, expected: "error" },
  { name: "số âm", qty: -100, expected: "error" },
  { name: "sát biên dưới", qty: 99, expected: "error" },
  { name: "sát biên trên", qty: 101, expected: "error" },
  { name: "khối lượng lẻ", qty: 150, expected: "error" },
  { name: "số thập phân", qty: 100.5, expected: "error" },
];

for (const c of finalCases) console.log(c.qty, "→", c.expected, "|", c.name);`]},
});
