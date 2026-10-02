defineExercise({
  id: 'w2.15',
  title: 'Gộp hai mảng đã sắp xếp',
  desc: `<p>Cho hai mảng đã sắp xếp tăng dần. Viết <code>mergeSorted(a, b)</code> gộp thành một mảng mới cũng tăng dần. Không dùng <code>sort</code>.</p>
<pre>([1, 3, 5], [2, 4, 6]) → [1, 2, 3, 4, 5, 6]
([1, 1, 3], [1, 2])    → [1, 1, 1, 2, 3]
([1, 2], [])           → [1, 2]</pre>`,
  hints: [
    'Dùng hai con trỏ: <code>i</code> cho mảng <code>a</code>, <code>j</code> cho mảng <code>b</code>, cùng bắt đầu từ 0.',
    'So sánh <code>a[i]</code> với <code>b[j]</code>, đưa số nhỏ hơn vào kết quả rồi tăng con trỏ của mảng đó. Lặp khi cả hai mảng còn phần tử.',
    'Khi một mảng đã hết, đưa toàn bộ phần còn lại của mảng kia vào kết quả (thêm hai vòng <code>while</code> nhỏ).'],
  starter: String.raw`function mergeSorted(a, b) {

}

console.log(mergeSorted([1, 3, 5], [2, 4, 6])); // [1, 2, 3, 4, 5, 6]
`,
  tests: String.raw`
test('([1, 3, 5], [2, 4, 6])', () => expect(mergeSorted([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]));
test('([1, 1, 3], [1, 2]) giữ số trùng', () => expect(mergeSorted([1, 1, 3], [1, 2])).toEqual([1, 1, 1, 2, 3]));
test('([1, 2], []) và ([], [3])', () => { expect(mergeSorted([1, 2], [])).toEqual([1, 2]); expect(mergeSorted([], [3])).toEqual([3]); });
test('Một mảng dài hơn hẳn: ([10], [1, 2, 3, 20])', () => expect(mergeSorted([10], [1, 2, 3, 20])).toEqual([1, 2, 3, 10, 20]));
test('Không sửa mảng đầu vào', () => { const a = [1, 4], b = [2, 3]; mergeSorted(a, b); expect(a).toEqual([1, 4]); expect(b).toEqual([2, 3]); });
test('Không dùng sort', () => expect(/\.sort\s*\(/.test(__source)).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Hai con trỏ trên hai mảng</h3>
<p>Vì cả hai mảng đã sắp xếp, phần tử nhỏ nhất còn lại luôn nằm ở đầu một trong hai mảng. Chỉ cần so sánh hai "đầu hàng" và lấy số nhỏ hơn.</p>
<pre>a: [1, 3, 5]    b: [2, 4, 6]
    ↑ i             ↑ j        1 &lt; 2 → lấy 1, i tiến
       ↑ i          ↑ j        3 &gt; 2 → lấy 2, j tiến</pre>
{{ex0}}
<p>Giống như gộp hai hàng người đã xếp theo chiều cao thành một hàng: mỗi lần chỉ nhìn hai người đứng đầu. Đây cũng là bước cốt lõi của thuật toán merge sort, một thuật toán sắp xếp O(n log n).</p>`,
examples:[String.raw`const a = [1, 3];
const b = [2];
let i = 0;
let j = 0;
console.log("So sánh", a[i], "và", b[j]);
console.log("Hết mảng b khi j =", b.length, "| b[1] là", b[1]);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Hai con trỏ trên hai mảng: lấy số nhỏ hơn giữa hai đầu hàng. Khi một mảng hết thì chép nốt mảng còn lại.</p>
{{ex0}}
<h3>Chạy tay với [1, 4] và [2, 3, 9]</h3>
${TRACE(['i', 'j', 'so sánh', 'result'], [['0', '0', '1 vs 2', '[1]'], ['1', '0', '4 vs 2', '[1, 2]'], ['1', '1', '4 vs 3', '[1, 2, 3]'], ['1', '2', '4 vs 9', '[1, 2, 3, 4]'], ['2', '2', 'a hết', 'chép 9 → [1, 2, 3, 4, 9]']])}
<h3>Độ phức tạp</h3>
<p>O(n + m): mỗi phần tử được đưa vào kết quả đúng một lần. Nếu nối hai mảng rồi sắp xếp lại sẽ tốn O((n + m) log(n + m)).</p>
<h3>Chi tiết nhỏ</h3>
<p>Dùng <code>&lt;=</code> khi so sánh để khi bằng nhau, phần tử của mảng <code>a</code> được lấy trước. Thuộc tính này gọi là "ổn định" (stable), quan trọng khi sắp xếp object theo một trường, ví dụ các lệnh cùng giá thì lệnh đến trước phải đứng trước.</p>`,
examples:[String.raw`function mergeSorted(a, b) {
  const result = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(b[j]);
      j++;
    }
  }
  while (i < a.length) { result.push(a[i]); i++; }
  while (j < b.length) { result.push(b[j]); j++; }
  return result;
}

console.log(mergeSorted([1, 4], [2, 3, 9]));`]},
});
