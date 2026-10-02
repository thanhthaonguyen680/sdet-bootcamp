defineExercise({
  id: '3.1',
  title: 'Test, Case, TestCase',
  desc: `<p>In ra các số từ 1 đến 50, mỗi số một dòng. Nhưng:</p>
<ul><li>Chia hết cho 3 in <code>"Test"</code></li><li>Chia hết cho 5 in <code>"Case"</code></li><li>Chia hết cho cả 3 và 5 in <code>"TestCase"</code></li></ul>
<p>Chỉ in đúng 50 dòng, không in thêm gì khác.</p>`,
  hint: `Dùng toán tử chia lấy dư <code>%</code>. Kiểm tra trường hợp chia hết cho 15 <strong>trước</strong>.`,
  starter: String.raw`for (let i = 1; i <= 50; i++) {

}
`,
  tests: String.raw`
test('In đúng 50 dòng', () => expect(__out.length, 'Cần in đúng 50 dòng, hiện có ' + __out.length).toBe(50));
test('Dòng 1 là "1"', () => expect(__out[0]).toBe("1"));
test('Dòng 3 là "Test"', () => expect(__out[2]).toBe("Test"));
test('Dòng 5 là "Case"', () => expect(__out[4]).toBe("Case"));
test('Dòng 15 và 45 là "TestCase"', () => { expect(__out[14]).toBe("TestCase"); expect(__out[44]).toBe("TestCase"); });
test('Dòng 49 là "49"', () => expect(__out[48]).toBe("49"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vòng lặp for</h3>
<p>Vòng lặp <code>for</code> có ba phần trong ngoặc, cách nhau bằng dấu chấm phẩy: khởi tạo biến đếm, điều kiện để tiếp tục, và bước nhảy sau mỗi vòng.</p>
${ANAT('for (', ['let i = 1', 'Khởi tạo: tạo biến đếm <code>i</code> bằng 1. Chỉ chạy <strong>một lần</strong> lúc bắt đầu. Dùng <code>let</code> vì <code>i</code> sẽ thay đổi.'], '; ', ['i <= 5', 'Điều kiện: kiểm tra <strong>trước</strong> mỗi vòng. Còn đúng thì chạy tiếp, sai thì dừng.'], '; ', ['i++', 'Bước nhảy: chạy <strong>sau</strong> mỗi vòng. <code>i++</code> là viết tắt của <code>i = i + 1</code>.'], ') ', ['{\n  console.log("Lần", i);\n}', 'Thân vòng lặp: chạy một lần cho mỗi giá trị của <code>i</code> (1, 2, 3, 4, 5).'])}
<p>Thứ tự chạy: khởi tạo → kiểm tra → thân → bước nhảy → kiểm tra → thân → ... cho tới khi điều kiện sai.</p>
{{ex0}}
<h3>Toán tử chia lấy dư %</h3>
<p><code>a % b</code> trả về phần dư khi chia <code>a</code> cho <code>b</code>. Nếu kết quả bằng 0 thì <code>a</code> chia hết cho <code>b</code>.</p>
${ANAT(['10', 'Số bị chia.'], ' ', ['%', 'Toán tử chia lấy dư.'], ' ', ['3', 'Số chia.'], '  // → ', ['1', 'Phần dư: 10 = 3 × 3 + <strong>1</strong>. Dư bằng 0 nghĩa là chia hết.'])}
{{ex1}}
<h3>Thứ tự điều kiện</h3>
<p>Khi các điều kiện chồng lên nhau, điều kiện <strong>cụ thể nhất phải kiểm tra trước</strong>. Số 15 chia hết cho 3, nên nếu kiểm tra "chia hết cho 3" trước thì sẽ không bao giờ tới được nhánh "chia hết cho 15".</p>`,
examples:[String.raw`for (let i = 1; i <= 5; i++) {
  console.log("Lần", i);
}`,
String.raw`console.log(10 % 3);  // 1
console.log(9 % 3);   // 0 → 9 chia hết cho 3

for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) console.log(i, "là số chẵn");
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>i % 3 === 0</code> nghĩa là <code>i</code> chia hết cho 3.</li>
<li>Kiểm tra chia hết cho 15 (cả 3 và 5) <strong>trước</strong>. Nếu đặt sau, số 15 đã khớp điều kiện chia hết cho 3 và in ra <code>"Test"</code>.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Dùng nhiều <code>if</code> rời nhau thay vì <code>else if</code>: số 15 in ra 3 dòng, tổng số dòng không còn là 50.</p>`,
examples:[String.raw`for (let i = 1; i <= 50; i++) {
  if (i % 15 === 0) console.log("TestCase");
  else if (i % 3 === 0) console.log("Test");
  else if (i % 5 === 0) console.log("Case");
  else console.log(i);
}`]},
});
