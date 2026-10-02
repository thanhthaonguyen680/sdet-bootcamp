defineExercise({
  id: '3.2',
  title: 'Thống kê giá trong ngày',
  desc: `<p>Viết function <code>priceStats(prices)</code> dùng <code>for...of</code> để tìm giá cao nhất, thấp nhất và trung bình (làm tròn 2 chữ số thập phân).</p>
<p>Trả về object dạng <code>{ max, min, avg }</code>.</p>
<pre>priceStats([2850, 2870, 2845, 2900, 2880, 2910, 2895])
→ { max: 2910, min: 2845, avg: 2878.57 }</pre>`,
  hint: `Khởi tạo <code>max</code> và <code>min</code> bằng phần tử đầu tiên, không phải bằng 0. Làm tròn: <code>Math.round(x * 100) / 100</code>.`,
  starter: String.raw`const prices = [2850, 2870, 2845, 2900, 2880, 2910, 2895];

function priceStats(prices) {
  // Dùng for...of
  // return { max, min, avg };
}

console.log(priceStats(prices));
`,
  tests: String.raw`
test('max = 2910', () => expect(priceStats([2850, 2870, 2845, 2900, 2880, 2910, 2895]).max).toBe(2910));
test('min = 2845', () => expect(priceStats([2850, 2870, 2845, 2900, 2880, 2910, 2895]).min).toBe(2845));
test('avg = 2878.57 (đã làm tròn)', () => expect(priceStats([2850, 2870, 2845, 2900, 2880, 2910, 2895]).avg).toBe(2878.57));
test('Mảng [100, 300]', () => expect(priceStats([100, 300])).toEqual({ max: 300, min: 100, avg: 200 }));
test('Mảng toàn số âm [-5, -2, -9]', () => { const r = priceStats([-5, -2, -9]); expect(r.max, 'max sai, có phải bạn khởi tạo max = 0?').toBe(-2); expect(r.min).toBe(-9); });
test('Có dùng for...of', () => expect(/for\s*\(\s*(const|let)\s+\w+\s+of\b/.test(__source), 'Hãy dùng vòng lặp for...of').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Mảng</h3>
<p>Mảng (array) là một danh sách giá trị có thứ tự, lưu trong một biến:</p>
${ANAT('const codes = ', ['[', 'Ngoặc vuông mở đầu mảng.'], ['"7203", "6758", "9984"', 'Các phần tử, cách nhau bằng dấu phẩy. Mỗi phần tử có một số thứ tự gọi là <strong>index</strong>, bắt đầu từ 0: <code>"7203"</code> ở index 0, <code>"9984"</code> ở index 2.'], [']', 'Ngoặc vuông đóng mảng.'], ';\n', ['codes[0]', 'Lấy phần tử ở index 0, tức <code>"7203"</code>.'], '\n', ['codes.length', 'Số phần tử trong mảng, ở đây là 3.'])}
<h3>for...of duyệt mảng</h3>
<p><code>for...of</code> lấy lần lượt từng <strong>giá trị</strong> trong mảng, không cần quan tâm tới index.</p>
${ANAT('for (', ['const code', 'Biến nhận từng phần tử. Mỗi vòng là một biến mới nên dùng <code>const</code> được. Tên do bạn đặt, thường là dạng số ít của tên mảng.'], ' ', ['of', '"lấy từng giá trị trong".'], ' ', ['codes', 'Mảng cần duyệt.'], ') { ... }')}
<p>Đọc cả dòng: "với mỗi <code>code</code> trong <code>codes</code>, chạy khối lệnh". Vòng 1 <code>code</code> là "7203", vòng 2 là "6758", vòng 3 là "9984".</p>
{{ex0}}
<h3>Cộng dồn và tìm lớn nhất</h3>
<p>Mẫu code rất hay dùng: khai báo biến bên ngoài vòng lặp, cập nhật nó trong mỗi vòng.</p>
{{ex1}}
<p>Chú ý khởi tạo <code>max = nums[0]</code> chứ không phải <code>0</code>. Nếu mảng toàn số âm, khởi tạo bằng 0 sẽ cho kết quả sai.</p>
<h3>Làm tròn số</h3>
{{ex2}}
<p>Khi trả về object mà tên biến trùng tên key, có thể viết gọn <code>return { max, min, avg };</code></p>`,
examples:[String.raw`const codes = ["7203", "6758", "9984"];
for (const code of codes) {
  console.log("Mã:", code);
}`,
String.raw`const nums = [4, 9, 2, 7];
let sum = 0;
let max = nums[0];
for (const n of nums) {
  sum += n;              // viết tắt của sum = sum + n
  if (n > max) max = n;
}
console.log("Tổng:", sum, "| Lớn nhất:", max, "| TB:", sum / nums.length);`,
String.raw`const avg = 10 / 3;
console.log(avg);                          // 3.3333333333333335
console.log(Math.round(avg * 100) / 100);  // 3.33 (kiểu number)
console.log(avg.toFixed(2));               // "3.33" (kiểu string!)`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>max</code> và <code>min</code> khởi tạo bằng phần tử đầu tiên. Nếu khởi tạo <code>max = 0</code>, mảng toàn số âm sẽ ra <code>max = 0</code>, một giá trị không có trong mảng.</li>
<li>Cộng dồn <code>sum</code> trong cùng vòng lặp để chỉ duyệt mảng một lần.</li>
<li><code>Math.round(x * 100) / 100</code> làm tròn 2 chữ số: 2878.5714 → 287857.14 → 287857 → 2878.57.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Dùng <code>avg.toFixed(2)</code>: kết quả là chuỗi <code>"2878.57"</code>, không phải số, nên <code>toBe(2878.57)</code> fail.</p>`,
examples:[String.raw`const prices = [2850, 2870, 2845, 2900, 2880, 2910, 2895];

function priceStats(prices) {
  let max = prices[0];
  let min = prices[0];
  let sum = 0;
  for (const p of prices) {
    if (p > max) max = p;
    if (p < min) min = p;
    sum += p;
  }
  const avg = Math.round((sum / prices.length) * 100) / 100;
  return { max, min, avg };
}

console.log(priceStats(prices));
console.log(priceStats([-5, -2, -9]));`]},
});
