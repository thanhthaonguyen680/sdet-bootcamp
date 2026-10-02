defineExercise({
  id: 'w2.17',
  title: 'Tìm kiếm nhị phân',
  desc: `<p>Cho mảng đã sắp xếp tăng dần. Viết <code>binarySearch(arr, target)</code> trả về vị trí của <code>target</code>, không có thì trả về <code>-1</code>. Không dùng <code>indexOf</code>, <code>includes</code>, <code>find</code>, <code>findIndex</code>.</p>
<pre>([1, 3, 5, 7, 9, 11], 7) → 3
([1, 3, 5, 7, 9, 11], 4) → -1</pre>
<p>Bộ chấm có một mảng 1 triệu phần tử và đếm xem code đọc mảng bao nhiêu lần. Tìm kiếm nhị phân chỉ cần khoảng 20 vòng lặp.</p>`,
  hints: [
    'Nhìn phần tử ở giữa. Bằng <code>target</code> thì xong. Nhỏ hơn <code>target</code> thì đáp án (nếu có) nằm ở nửa bên phải, lớn hơn thì nằm ở nửa bên trái.',
    'Dùng <code>low = 0</code>, <code>high = arr.length - 1</code>. Lặp khi <code>low &lt;= high</code>, mỗi vòng tính <code>mid = Math.floor((low + high) / 2)</code>.',
    'Nếu <code>arr[mid] &lt; target</code> thì <code>low = mid + 1</code>, ngược lại <code>high = mid - 1</code>. Hết vòng mà chưa thấy thì <code>return -1</code>.'],
  starter: String.raw`function binarySearch(arr, target) {

}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7)); // 3
`,
  tests: String.raw`
test('Tìm thấy ở giữa: 7 → 3', () => expect(binarySearch([1, 3, 5, 7, 9, 11], 7)).toBe(3));
test('Phần tử đầu và cuối', () => { expect(binarySearch([1, 3, 5, 7, 9, 11], 1)).toBe(0); expect(binarySearch([1, 3, 5, 7, 9, 11], 11)).toBe(5); });
test('Không có: 4, 0, 12 → -1', () => { for (const t of [4, 0, 12]) expect(binarySearch([1, 3, 5, 7, 9, 11], t), 'Sai với ' + t).toBe(-1); });
test('Mảng rỗng và mảng 1 phần tử', () => { expect(binarySearch([], 5)).toBe(-1); expect(binarySearch([5], 5)).toBe(0); });
test('Không dùng indexOf / includes / find', () => expect(/\.(indexOf|includes|find|findIndex|lastIndexOf)\s*\(/.test(__source)).toBe(false));
test('Mảng 1 triệu phần tử: đọc tối đa 45 lần', () => {
  const base = []; for (let i = 0; i < 1000000; i++) base.push(i * 2);
  let reads = 0;
  const p = new Proxy(base, { get(t, k) { if (typeof k === "string" && /^\d+$/.test(k)) reads++; return t[k]; } });
  expect(binarySearch(p, 1500000)).toBe(750000);
  expect(reads <= 45, 'Code đã đọc mảng ' + reads + ' lần, tìm kiếm nhị phân chỉ cần khoảng 20 vòng lặp').toBe(true);
});
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Trò chơi đoán số</h3>
<p>Đoán một số từ 1 đến 100, mỗi lần được trả lời "cao hơn" hoặc "thấp hơn". Chiến lược tốt nhất là luôn đoán số ở giữa, mỗi lần loại được một nửa. Tối đa chỉ cần 7 lần.</p>
{{ex0}}
<h3>Chia đôi mạnh cỡ nào</h3>
<div class="tbl"><table><tr><th>Số phần tử</th><th>Duyệt tuần tự</th><th>Tìm kiếm nhị phân</th></tr>
<tr><td>1.000</td><td>1.000</td><td>10</td></tr>
<tr><td>1.000.000</td><td>1.000.000</td><td>20</td></tr>
<tr><td>1.000.000.000</td><td>1.000.000.000</td><td>30</td></tr></table></div>
<p>Điều kiện bắt buộc: mảng phải được sắp xếp sẵn.</p>
<p class="note">Góc QA: lệnh <code>git bisect</code> dùng đúng ý tưởng này để tìm ra commit nào gây bug trong hàng trăm commit, chỉ cần test khoảng 7–8 lần.</p>`,
examples:[String.raw`const secret = 73;
let low = 1;
let high = 100;
let tries = 0;
while (low <= high) {
  const guess = Math.floor((low + high) / 2);
  tries++;
  if (guess === secret) {
    console.log("Đoán", guess, "→ đúng sau", tries, "lần");
    break;
  }
  if (guess < secret) {
    console.log("Đoán", guess, "→ cao hơn");
    low = guess + 1;
  } else {
    console.log("Đoán", guess, "→ thấp hơn");
    high = guess - 1;
  }
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Giữ khoảng tìm kiếm <code>[low, high]</code>. Mỗi vòng xem phần tử giữa, loại bỏ nửa không thể chứa đáp án.</p>
{{ex0}}
<h3>Chạy tay: tìm 7 trong [1, 3, 5, 7, 9, 11]</h3>
${TRACE(['low', 'high', 'mid', 'arr[mid]', 'hành động'], [['0', '5', '2', '5', '5 &lt; 7 → low = 3'], ['3', '5', '4', '9', '9 &gt; 7 → high = 3'], ['3', '3', '3', '7', 'tìm thấy, trả về 3']])}
<h3>Chạy tay: tìm 4</h3>
${TRACE(['low', 'high', 'mid', 'arr[mid]', 'hành động'], [['0', '5', '2', '5', '5 &gt; 4 → high = 1'], ['0', '1', '0', '1', '1 &lt; 4 → low = 1'], ['1', '1', '1', '3', '3 &lt; 4 → low = 2'], ['2', '1', '', '', 'low &gt; high, trả về -1']])}
<h3>Độ phức tạp</h3>
<p>O(log n). Mảng 1 triệu phần tử chỉ cần khoảng 20 lần so sánh.</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Viết <code>low &lt; high</code> thay vì <code>&lt;=</code>: bỏ sót khi khoảng chỉ còn một phần tử, ví dụ tìm 5 trong <code>[5]</code>.</li>
<li>Viết <code>low = mid</code> thay vì <code>mid + 1</code>: khoảng có thể không bao giờ thu hẹp, lặp vô hạn.</li>
</ul>`,
examples:[String.raw`function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));
console.log(binarySearch([1, 3, 5, 7, 9, 11], 4));`]},
});
