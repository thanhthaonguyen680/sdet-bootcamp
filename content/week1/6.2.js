defineExercise({
  id: '6.2',
  title: 'Loại bỏ mã trùng lặp',
  desc: `<p>Viết function <code>unique(arr)</code> trả về mảng mới không có phần tử trùng, giữ nguyên thứ tự xuất hiện. Chỉ dùng vòng lặp và <code>includes</code>, <strong>không</strong> dùng <code>Set</code>.</p>
<pre>["7203", "6758", "7203", "9984", "6758", "8306"]
→ ["7203", "6758", "9984", "8306"]</pre>`,
  hint: `Tạo mảng <code>result = []</code>. Duyệt từng phần tử, nếu <code>!result.includes(x)</code> thì <code>push</code> vào.`,
  starter: String.raw`const codes = ["7203", "6758", "7203", "9984", "6758", "8306"];

function unique(arr) {

}

console.log(unique(codes));
`,
  tests: String.raw`
test('Loại trùng và giữ thứ tự', () => expect(unique(["7203", "6758", "7203", "9984", "6758", "8306"])).toEqual(["7203", "6758", "9984", "8306"]));
test('Mảng rỗng → []', () => expect(unique([])).toEqual([]));
test('Không làm thay đổi mảng gốc', () => { const a = ["1", "1", "2"]; unique(a); expect(a).toEqual(["1", "1", "2"]); });
test('Không dùng Set', () => expect(/new\s+Set/.test(__source), 'Bài này hãy tự viết bằng vòng lặp, chưa dùng Set').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kiểm tra phần tử có trong mảng</h3>
{{ex0}}
<h3>Tạo mảng mới thay vì sửa mảng gốc</h3>
<p>Tạo một mảng rỗng, duyệt mảng gốc, phần tử nào thỏa điều kiện thì <code>push</code> vào mảng mới. Mảng gốc giữ nguyên.</p>
${ANAT('if (', ['!', '"Không": đảo true thành false và ngược lại.'], ['result.includes(x)', 'Mảng <code>result</code> đã có <code>x</code> chưa? Trả về true/false.'], ') ', ['result.push(x)', 'Chưa có thì thêm vào.'], ';')}
<p>Đọc cả dòng: "nếu result <strong>chưa</strong> có x thì thêm x vào result".</p>
{{ex1}}
<p class="note">Không sửa dữ liệu đầu vào là nguyên tắc quan trọng. Trong code test, dữ liệu dùng chung bị một test sửa mất sẽ làm test khác fail một cách khó hiểu. Sau này bạn sẽ học <code>Set</code> và <code>filter</code> để làm việc này ngắn hơn.</p>`,
examples:[String.raw`const codes = ["7203", "6758"];
console.log(codes.includes("7203"));  // true
console.log(codes.indexOf("6758"));   // 1
console.log(codes.indexOf("9999"));   // -1`,
String.raw`const nums = [3, 8, 1, 9, 4];
const big = [];
for (const n of nums) {
  if (n > 3) big.push(n);
}
console.log("Mảng mới:", big);
console.log("Mảng gốc:", nums);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tạo mảng mới <code>result</code>, không sửa mảng gốc.</li>
<li>Phần tử nào chưa có trong <code>result</code> thì thêm vào. Lần xuất hiện đầu tiên được giữ lại nên thứ tự không đổi.</li>
</ul>
<h3>Độ phức tạp</h3>
<p><code>includes</code> duyệt lại <code>result</code> mỗi lần, nên tổng là O(n²). Với vài nghìn phần tử vẫn ổn. Từ tuần 3, bạn sẽ dùng <code>[...new Set(arr)]</code> cho O(n) và cũng giữ thứ tự.</p>`,
examples:[String.raw`const codes = ["7203", "6758", "7203", "9984", "6758", "8306"];

function unique(arr) {
  const result = [];
  for (const x of arr) {
    if (!result.includes(x)) result.push(x);
  }
  return result;
}

console.log(unique(codes));
console.log(codes); // mảng gốc không đổi`]},
});
