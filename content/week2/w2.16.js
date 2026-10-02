defineExercise({
  id: 'w2.16',
  title: 'Sắp xếp nổi bọt (bubble sort)',
  desc: `<p>Viết <code>bubbleSort(arr)</code> trả về một <strong>mảng mới</strong> đã sắp xếp tăng dần bằng thuật toán nổi bọt. Không dùng <code>.sort()</code>, không sửa mảng gốc.</p>
<pre>[5, 2, 9, 1]   → [1, 2, 5, 9]
[3, -1, 3, 0]  → [-1, 0, 3, 3]
[10, 9, 100]   → [9, 10, 100]</pre>`,
  hints: [
    'Sao chép mảng trước khi sắp xếp: <code>const a = arr.slice();</code>',
    'Một lượt: đi từ đầu mảng, so sánh từng cặp kề nhau <code>a[i]</code> và <code>a[i + 1]</code>, cặp nào sai thứ tự thì đổi chỗ. Sau lượt đầu, số lớn nhất đã "nổi" về cuối.',
    'Lặp <code>n - 1</code> lượt. Lượt thứ <code>pass</code> chỉ cần xét tới <code>a.length - 1 - pass</code>. Nếu một lượt không đổi chỗ lần nào thì mảng đã xong, <code>break</code> luôn.'],
  starter: String.raw`function bubbleSort(arr) {

}

console.log(bubbleSort([5, 2, 9, 1])); // [1, 2, 5, 9]
`,
  tests: String.raw`
test('[5, 2, 9, 1] → [1, 2, 5, 9]', () => expect(bubbleSort([5, 2, 9, 1])).toEqual([1, 2, 5, 9]));
test('Số âm và số trùng', () => expect(bubbleSort([3, -1, 3, 0])).toEqual([-1, 0, 3, 3]));
test('[10, 9, 100] → [9, 10, 100] (so sánh theo số, không theo chữ)', () => expect(bubbleSort([10, 9, 100])).toEqual([9, 10, 100]));
test('[] và [1]', () => { expect(bubbleSort([])).toEqual([]); expect(bubbleSort([1])).toEqual([1]); });
test('Mảng đã sắp xếp sẵn', () => expect(bubbleSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]));
test('Không sửa mảng gốc', () => { const a = [3, 1, 2]; bubbleSort(a); expect(a, 'Mảng gốc đã bị thay đổi, hãy sao chép bằng slice() trước').toEqual([3, 1, 2]); });
test('Không dùng .sort()', () => expect(/\.sort\s*\(/.test(__source)).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Nổi bọt nghĩa là gì</h3>
<p>Mỗi lượt đi qua mảng, so sánh từng cặp kề nhau và đổi chỗ nếu sai thứ tự. Số lớn nhất sẽ bị đẩy dần về cuối như bọt khí nổi lên mặt nước.</p>
{{ex0}}
<p>Sau lượt 1, phần tử cuối đã đúng chỗ. Sau lượt 2, hai phần tử cuối đúng chỗ. Cứ thế, cần tối đa n − 1 lượt.</p>
<h3>Bẫy của .sort() mặc định</h3>
<p>Khi dùng trong thực tế, cẩn thận: <code>.sort()</code> không truyền tham số sẽ so sánh theo <strong>chuỗi</strong>, không theo số.</p>
{{ex1}}`,
examples:[String.raw`const a = [5, 2, 9, 1];
console.log("Bắt đầu:", a);
for (let i = 0; i < a.length - 1; i++) {
  if (a[i] > a[i + 1]) {
    const temp = a[i];
    a[i] = a[i + 1];
    a[i + 1] = temp;
  }
  console.log("Sau khi xét cặp", i, "và", i + 1, ":", a);
}`,
String.raw`console.log([10, 9, 100].sort());                  // [10, 100, 9] sai!
console.log([10, 9, 100].sort((x, y) => x - y));    // [9, 10, 100]`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Sao chép mảng. Mỗi lượt so sánh các cặp kề nhau và đổi chỗ khi sai thứ tự. Lượt nào không đổi chỗ lần nào thì dừng sớm.</p>
{{ex0}}
<h3>Chạy tay với [5, 2, 9, 1]</h3>
${TRACE(['Lượt', 'Mảng sau lượt', 'Đã đúng chỗ'], [['1', '[2, 5, 1, 9]', '9'], ['2', '[2, 1, 5, 9]', '5, 9'], ['3', '[1, 2, 5, 9]', 'tất cả']])}
<h3>Giải thích hai vòng lặp</h3>
<ul>
<li>Vòng ngoài <code>pass</code> đếm số lượt, tối đa <code>n − 1</code>.</li>
<li>Vòng trong dừng ở <code>a.length - 1 - pass</code> vì sau mỗi lượt có thêm một phần tử cuối đã đúng chỗ.</li>
<li><code>swapped</code> ghi nhận lượt này có đổi chỗ không. Không đổi tức là đã sắp xếp xong.</li>
</ul>
<h3>Độ phức tạp</h3>
<p>Trường hợp xấu O(n²). Trường hợp tốt nhất (mảng đã sắp xếp) chỉ một lượt, O(n), nhờ biến <code>swapped</code>. Bubble sort chủ yếu để học. Thực tế dùng <code>.sort()</code> với hàm so sánh, là thuật toán O(n log n):</p>
{{ex1}}`,
examples:[String.raw`function bubbleSort(arr) {
  const a = arr.slice();
  for (let pass = 0; pass < a.length - 1; pass++) {
    let swapped = false;
    for (let i = 0; i < a.length - 1 - pass; i++) {
      if (a[i] > a[i + 1]) {
        const temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

console.log(bubbleSort([5, 2, 9, 1]));`,
String.raw`const prices = [2900, 2850, 2910];
const sorted = prices.slice().sort((x, y) => x - y);
console.log(sorted, prices);`]},
});
