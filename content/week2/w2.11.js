defineExercise({
  id: 'w2.11',
  title: 'Số lớn thứ hai',
  desc: `<p>Viết <code>secondLargest(nums)</code> trả về số lớn thứ hai (phải khác số lớn nhất). Không có thì trả về <code>null</code>. Chỉ duyệt mảng <strong>một lần</strong>, không dùng <code>sort</code>.</p>
<pre>[3, 9, 5, 7]  → 7
[5, 5, 3]     → 3
[4, 4]        → null
[8]           → null</pre>`,
  hints: [
    'Dùng hai biến <code>first</code> (lớn nhất) và <code>second</code> (lớn nhì), khởi tạo bằng <code>-Infinity</code>.',
    'Gặp số lớn hơn <code>first</code>: <code>second</code> nhận giá trị cũ của <code>first</code>, rồi <code>first</code> nhận số mới.',
    'Gặp số nhỏ hơn <code>first</code> nhưng lớn hơn <code>second</code> thì cập nhật <code>second</code>. Bằng <code>first</code> thì bỏ qua. Cuối cùng <code>second</code> vẫn là <code>-Infinity</code> thì trả về <code>null</code>.'],
  starter: String.raw`function secondLargest(nums) {

}

console.log(secondLargest([3, 9, 5, 7])); // 7
`,
  tests: String.raw`
test('[3, 9, 5, 7] → 7', () => expect(secondLargest([3, 9, 5, 7])).toBe(7));
test('[5, 5, 3] → 3 (bỏ qua số trùng)', () => expect(secondLargest([5, 5, 3])).toBe(3));
test('[10, 9, 10, 8] → 9', () => expect(secondLargest([10, 9, 10, 8])).toBe(9));
test('[-1, -5, -3] → -3 (số âm)', () => expect(secondLargest([-1, -5, -3])).toBe(-3));
test('[4, 4] → null', () => expect(secondLargest([4, 4])).toBe(null));
test('[8] và [] → null', () => { expect(secondLargest([8])).toBe(null); expect(secondLargest([])).toBe(null); });
test('Không dùng sort', () => expect(/\.sort\s*\(/.test(__source), 'Bài này chỉ duyệt một lần, không sắp xếp').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Theo dõi nhiều giá trị trong một lượt duyệt</h3>
<p>Tuần 1 bạn đã tìm số lớn nhất bằng một biến. Bài này mở rộng: giữ hai biến cùng lúc, và mỗi khi biến thứ nhất bị thay thì giá trị cũ của nó "tụt hạng" xuống biến thứ hai.</p>
<h3>Giá trị khởi đầu -Infinity</h3>
<p><code>-Infinity</code> nhỏ hơn mọi số, nên số đầu tiên gặp chắc chắn thay được nó. Cách này an toàn hơn khởi tạo bằng 0, vì mảng có thể toàn số âm.</p>
{{ex0}}
<h3>Vì sao không sắp xếp</h3>
<p>Sắp xếp rồi lấy phần tử áp chót cũng ra kết quả, nhưng tốn O(n log n), làm thay đổi mảng gốc, và vẫn phải xử lý số trùng. Duyệt một lần chỉ tốn O(n).</p>`,
examples:[String.raw`console.log(-Infinity < -1000000000);  // true
let best = -Infinity;
for (const n of [-5, -2, -9]) {
  if (n > best) best = n;
}
console.log(best);  // -2`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Giữ hai biến <code>first</code> và <code>second</code>. Số mới lớn hơn <code>first</code> thì "đẩy" <code>first</code> cũ xuống làm <code>second</code>.</p>
{{ex0}}
<h3>Chạy tay với [10, 9, 10, 8]</h3>
${TRACE(['n', 'first', 'second', 'lý do'], [['10', '10', '-Infinity', '10 &gt; first'], ['9', '10', '9', '9 &lt; first và 9 &gt; second'], ['10', '10', '9', 'bằng first, bỏ qua'], ['8', '10', '9', 'không lớn hơn second']])}
<h3>Độ phức tạp</h3>
<p>O(n) thời gian, O(1) bộ nhớ.</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Thiếu điều kiện <code>n &lt; first</code> ở nhánh thứ hai: với <code>[5, 5, 3]</code> sẽ trả về 5.</li>
<li>Gán <code>first = n</code> trước khi gán <code>second = first</code>: mất giá trị cũ của <code>first</code>. Thứ tự hai dòng rất quan trọng.</li>
</ul>`,
examples:[String.raw`function secondLargest(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n < first && n > second) {
      second = n;
    }
  }
  return second === -Infinity ? null : second;
}

console.log(secondLargest([10, 9, 10, 8]));
console.log(secondLargest([4, 4]));`]},
});
