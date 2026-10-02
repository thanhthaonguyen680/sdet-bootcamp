defineExercise({
  id: '6.3',
  title: 'slice và splice',
  desc: `<p>Điền tham số còn thiếu để:</p>
<ul>
<li><code>slice</code> lấy các phần tử <code>3, 4, 5</code>, mảng gốc không đổi.</li>
<li><code>splice</code> xóa 2 phần tử bắt đầu từ vị trí (index) 4, mảng gốc bị thay đổi.</li>
</ul>
<p>Quan sát mảng gốc sau mỗi thao tác để thấy khác biệt.</p>`,
  hint: `<code>slice(start, end)</code> không lấy phần tử ở <code>end</code>. <code>splice(start, deleteCount)</code> trả về mảng các phần tử bị xóa.`,
  starter: String.raw`const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// slice: lấy 3, 4, 5
const part = arr.slice(/* ? */);
console.log("slice:", part);
console.log("Mảng gốc sau slice:", arr);

// splice: xóa 2 phần tử từ index 4
const removed = arr.splice(/* ? */);
console.log("Đã xóa:", removed);
console.log("Mảng gốc sau splice:", arr);
`,
  tests: String.raw`
test('part = [3, 4, 5]', () => expect(part).toEqual([3, 4, 5]));
test('removed = [5, 6]', () => expect(removed).toEqual([5, 6]));
test('Mảng gốc sau splice = [1, 2, 3, 4, 7, 8, 9, 10]', () => expect(arr).toEqual([1, 2, 3, 4, 7, 8, 9, 10]));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Index bắt đầu từ 0</h3>
<p>Phần tử "thứ 1" nằm ở index 0, "thứ 3" nằm ở index 2. Nhầm lẫn giữa vị trí đếm thông thường và index là lỗi rất phổ biến (lỗi lệch 1).</p>
<h3>slice: cắt ra bản sao</h3>
<p><code>slice(start, end)</code> lấy từ <code>start</code> tới <strong>trước</strong> <code>end</code>, không thay đổi mảng gốc. Số âm tính từ cuối mảng.</p>
${ANAT('letters.slice(', ['1', 'Index bắt đầu, có lấy.'], ', ', ['3', 'Index kết thúc, <strong>không</strong> lấy. Lấy index 1, 2 → <code>["b", "c"]</code>.'], ')')}
{{ex0}}
<h3>splice: sửa trực tiếp mảng gốc</h3>
<p><code>splice(start, số_lượng_xóa, ...phần_tử_chèn)</code> xóa và/hoặc chèn ngay trong mảng gốc, trả về mảng các phần tử đã bị xóa.</p>
${ANAT('items.splice(', ['1', 'Index bắt đầu.'], ', ', ['2', '<strong>Số lượng</strong> phần tử cần xóa, không phải index kết thúc.'], ', ', ['"X"', 'Phần tử chèn vào chỗ vừa xóa (không bắt buộc).'], ')')}
{{ex1}}`,
examples:[String.raw`const letters = ["a", "b", "c", "d", "e"];
console.log(letters.slice(1, 3));  // ["b", "c"]: không lấy index 3
console.log(letters.slice(-2));    // 2 phần tử cuối
console.log(letters);              // không đổi`,
String.raw`const items = ["a", "b", "c", "d", "e"];
const removed = items.splice(1, 2);  // từ index 1, xóa 2 phần tử
console.log(removed);                // ["b", "c"]
console.log(items);                  // ["a", "d", "e"]

items.splice(1, 0, "X");             // chèn, không xóa gì
console.log(items);                  // ["a", "X", "d", "e"]`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>slice(2, 5)</code>: lấy từ index 2 đến <strong>trước</strong> index 5, tức index 2, 3, 4 là các giá trị 3, 4, 5. Mảng gốc không đổi.</li>
<li><code>splice(4, 2)</code>: từ index 4 (giá trị 5) xóa 2 phần tử là 5 và 6. Trả về mảng các phần tử bị xóa và <strong>sửa luôn</strong> mảng gốc.</li>
</ul>
<h3>Mẹo nhớ</h3>
<p><code>slice</code> = cắt một lát để xem, <code>splice</code> = nối/ghép lại dây, có thay đổi. Tham số thứ hai cũng khác nghĩa: <code>slice</code> là vị trí kết thúc, <code>splice</code> là số lượng.</p>`,
examples:[String.raw`const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const part = arr.slice(2, 5);
console.log("slice:", part);                 // [3, 4, 5]
console.log("Mảng gốc sau slice:", arr);     // không đổi

const removed = arr.splice(4, 2);
console.log("Đã xóa:", removed);             // [5, 6]
console.log("Mảng gốc sau splice:", arr);    // [1, 2, 3, 4, 7, 8, 9, 10]`]},
});
