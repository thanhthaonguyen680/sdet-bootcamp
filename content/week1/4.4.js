defineExercise({
  id: '4.4',
  title: 'Rest parameter',
  desc: `<p>Viết function <code>sumAll(...numbers)</code> tính tổng của bao nhiêu tham số cũng được.</p>
<pre>sumAll(1, 2, 3) → 6
sumAll()        → 0</pre>`,
  hint: `<code>numbers</code> bên trong function là một mảng bình thường, chỉ cần duyệt và cộng dồn.`,
  starter: String.raw`function sumAll(...numbers) {

}

console.log(sumAll(1, 2, 3)); // 6
`,
  tests: String.raw`
test('sumAll(1, 2, 3) → 6', () => expect(sumAll(1, 2, 3)).toBe(6));
test('sumAll(10) → 10', () => expect(sumAll(10)).toBe(10));
test('sumAll() → 0', () => expect(sumAll()).toBe(0));
test('sumAll(-1, 1, 5) → 5', () => expect(sumAll(-1, 1, 5)).toBe(5));
test('Có dùng rest parameter ...', () => expect(/\.\.\.\s*\w+\s*\)/.test(__source)).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Rest parameter</h3>
<p>Dấu ba chấm <code>...</code> trước tham số cuối cùng gom tất cả đối số còn lại vào một <strong>mảng thật</strong>. Nhờ vậy function nhận được số lượng tham số bất kỳ.</p>
${ANAT('function logAll(', ['label', 'Tham số thường, nhận đối số thứ nhất.'], ', ', ['...items', 'Ba chấm + tên: gom <strong>tất cả</strong> đối số còn lại vào mảng <code>items</code>.'], ') { ... }\n\nlogAll(', ['"B"', 'Vào <code>label</code>.'], ', ', ['1, 2, 3', 'Vào <code>items</code>, thành mảng <code>[1, 2, 3]</code>. Không truyền thêm gì thì <code>items</code> là mảng rỗng <code>[]</code>.'], ');')}
{{ex0}}
<p>Rest parameter phải đứng cuối cùng. Vì là mảng thật nên dùng được <code>length</code>, <code>for...of</code> và mọi method của mảng.</p>
{{ex1}}`,
examples:[String.raw`function logAll(label, ...items) {
  console.log(label, "nhận", items.length, "phần tử:", items);
}
logAll("A");
logAll("B", 1, 2, 3);`,
String.raw`function multiplyAll(...nums) {
  let result = 1;
  for (const n of nums) result *= n;
  return result;
}
console.log(multiplyAll(2, 3, 4));  // 24`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>...numbers</code> gom mọi tham số truyền vào thành một mảng. Không truyền gì thì là mảng rỗng <code>[]</code>.</li>
<li><code>total</code> khởi tạo bằng 0, nên với mảng rỗng vòng lặp không chạy và kết quả là 0.</li>
</ul>
<h3>Cách viết khác</h3>
<p>Từ tuần 3, bạn sẽ gặp <code>reduce</code>: <code>numbers.reduce((sum, n) =&gt; sum + n, 0)</code>. Nhớ giá trị khởi tạo <code>0</code>, thiếu nó thì <code>sumAll()</code> báo lỗi.</p>`,
examples:[String.raw`function sumAll(...numbers) {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

console.log(sumAll(1, 2, 3)); // 6
console.log(sumAll());        // 0`]},
});
