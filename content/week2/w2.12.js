defineExercise({
  id: 'w2.12',
  title: 'Tìm số bị thiếu',
  desc: `<p>Mảng <code>nums</code> chứa các số từ 1 đến n, thứ tự bất kỳ, thiếu đúng một số (nên <code>n = nums.length + 1</code>). Viết <code>missingNumber(nums)</code> tìm số bị thiếu.</p>
<pre>[1, 2, 4, 5] → 3
[3, 1]       → 2
[1, 2, 3]    → 4
[]           → 1</pre>`,
  hints: [
    'Tổng các số từ 1 đến n có công thức <code>n * (n + 1) / 2</code>.',
    'Số bị thiếu = tổng đầy đủ − tổng thực tế của mảng.',
    '<code>const n = nums.length + 1;</code> tính tổng mảng bằng vòng lặp, rồi <code>return n * (n + 1) / 2 - sum;</code>'],
  starter: String.raw`function missingNumber(nums) {

}

console.log(missingNumber([1, 2, 4, 5])); // 3
`,
  tests: String.raw`
test('[1, 2, 4, 5] → 3', () => expect(missingNumber([1, 2, 4, 5])).toBe(3));
test('[3, 1] → 2', () => expect(missingNumber([3, 1])).toBe(2));
test('[1, 2, 3] → 4 (thiếu số cuối)', () => expect(missingNumber([1, 2, 3])).toBe(4));
test('[2] → 1 (thiếu số đầu)', () => expect(missingNumber([2])).toBe(1));
test('[] → 1', () => expect(missingNumber([])).toBe(1));
test('100.000 phần tử, thiếu 54321', () => { const a = []; for (let i = 100000; i >= 1; i--) if (i !== 54321) a.push(i); expect(missingNumber(a)).toBe(54321); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Toán học rút gọn thuật toán</h3>
<p>Chuyện kể rằng cậu bé Gauss được giao tính tổng 1 + 2 + ... + 100 và trả lời ngay 5050: ghép số đầu với số cuối (1 + 100, 2 + 99...) được 50 cặp, mỗi cặp bằng 101. Từ đó có công thức <code>n × (n + 1) / 2</code>.</p>
{{ex0}}
<h3>So sánh với cách thô</h3>
<p>Cách thô: với mỗi số từ 1 tới n, dùng <code>includes</code> kiểm tra có trong mảng không. Nhưng <code>includes</code> bản thân nó cũng duyệt cả mảng, nên thành O(n²). Dùng công thức, chỉ cần một lượt để tính tổng.</p>
<p class="note">Góc QA: dữ liệu real-time như order book thường có số thứ tự (sequence number) tăng dần. Phát hiện số thứ tự bị thiếu là cách kiểm tra có bị mất message hay không.</p>`,
examples:[String.raw`const n = 100;
let loopSum = 0;
for (let i = 1; i <= n; i++) loopSum += i;
console.log("Cộng bằng vòng lặp:", loopSum);
console.log("Dùng công thức:", n * (n + 1) / 2);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Tổng đầy đủ từ 1 tới n trừ đi tổng thực tế của mảng chính là số bị thiếu.</p>
{{ex0}}
<h3>Chạy tay với [1, 2, 4, 5]</h3>
${TRACE(['bước', 'giá trị'], [['n', '4 + 1 = 5'], ['Tổng đầy đủ', '5 × 6 / 2 = 15'], ['Tổng mảng', '1 + 2 + 4 + 5 = 12'], ['Số thiếu', '15 − 12 = 3']])}
<h3>Độ phức tạp</h3>
<p>O(n) thời gian, O(1) bộ nhớ.</p>
<h3>Cách khác: đánh dấu</h3>
<p>Dùng object ghi lại các số đã có, rồi duyệt 1 tới n tìm số chưa được ghi. Cũng là O(n), tốn thêm bộ nhớ nhưng mở rộng được cho trường hợp thiếu nhiều số, rất hợp để kiểm tra sequence number bị hổng:</p>
{{ex1}}`,
examples:[String.raw`function missingNumber(nums) {
  const n = nums.length + 1;
  let sum = 0;
  for (const x of nums) sum += x;
  return n * (n + 1) / 2 - sum;
}

console.log(missingNumber([1, 2, 4, 5]));`,
String.raw`function findGaps(seqs, from, to) {
  const seen = {};
  for (const s of seqs) seen[s] = true;
  const gaps = [];
  for (let i = from; i <= to; i++) {
    if (!seen[i]) gaps.push(i);
  }
  return gaps;
}
console.log(findGaps([101, 102, 105, 106, 108], 101, 108));  // [103, 104, 107]`]},
});
