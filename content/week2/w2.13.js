defineExercise({
  id: 'w2.13',
  title: 'Đảo ngược mảng tại chỗ',
  desc: `<p>Viết <code>reverseInPlace(arr)</code> đảo ngược mảng <strong>ngay trên mảng gốc</strong> (không tạo mảng mới), rồi trả về chính mảng đó. Không dùng <code>.reverse()</code>.</p>
<pre>[1, 2, 3, 4] → [4, 3, 2, 1]
[1, 2, 3]    → [3, 2, 1]</pre>`,
  hints: [
    'Dùng hai con trỏ như bài palindrome: <code>left</code> ở đầu, <code>right</code> ở cuối.',
    'Hoán đổi <code>arr[left]</code> với <code>arr[right]</code>, rồi cùng tiến vào giữa. Dừng khi <code>left &gt;= right</code>.',
    'Hoán đổi cần biến tạm: <code>const temp = arr[left]; arr[left] = arr[right]; arr[right] = temp;</code>'],
  starter: String.raw`function reverseInPlace(arr) {

}

const nums = [1, 2, 3, 4];
reverseInPlace(nums);
console.log(nums); // [4, 3, 2, 1]
`,
  tests: String.raw`
test('[1, 2, 3, 4] → [4, 3, 2, 1]', () => expect(reverseInPlace([1, 2, 3, 4])).toEqual([4, 3, 2, 1]));
test('Số phần tử lẻ [1, 2, 3] → [3, 2, 1]', () => expect(reverseInPlace([1, 2, 3])).toEqual([3, 2, 1]));
test('[] và [7]', () => { expect(reverseInPlace([])).toEqual([]); expect(reverseInPlace([7])).toEqual([7]); });
test('Sửa đúng mảng gốc', () => { const a = ["a", "b", "c"]; reverseInPlace(a); expect(a).toEqual(["c", "b", "a"]); });
test('Trả về chính mảng gốc, không phải mảng mới', () => { const a = [1, 2]; expect(reverseInPlace(a) === a, 'Function đang trả về một mảng khác').toBe(true); });
test('Không dùng .reverse()', () => expect(/\.reverse\s*\(/.test(__source)).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Mảng là tham chiếu</h3>
<p>Biến chứa mảng thực chất giữ "địa chỉ" của mảng. Gán sang biến khác hay truyền vào function thì vẫn là cùng một mảng, sửa ở đâu cũng thấy.</p>
{{ex0}}
<h3>"Tại chỗ" (in-place) nghĩa là gì</h3>
<p>Thuật toán tại chỗ sửa trực tiếp dữ liệu đầu vào, không tạo mảng mới, nên chỉ tốn O(1) bộ nhớ thêm. Đổi lại, người gọi phải biết mảng của mình sẽ bị thay đổi.</p>
<h3>Hoán đổi hai phần tử</h3>
{{ex1}}`,
examples:[String.raw`const a = [1, 2, 3];
const b = a;        // cùng một mảng
b.push(4);
console.log(a);     // [1, 2, 3, 4]

function clear(arr) { arr.length = 0; }
clear(a);
console.log(a, b);  // [] []`,
String.raw`const arr = ["x", "y", "z"];
const temp = arr[0];
arr[0] = arr[2];
arr[2] = temp;
console.log(arr);  // ["z", "y", "x"]`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Hai con trỏ ở hai đầu, hoán đổi rồi cùng tiến vào giữa.</p>
{{ex0}}
<h3>Chạy tay với [1, 2, 3, 4, 5]</h3>
${TRACE(['left', 'right', 'mảng sau khi đổi'], [['0', '4', '[5, 2, 3, 4, 1]'], ['1', '3', '[5, 4, 3, 2, 1]'], ['2', '2', 'left không còn nhỏ hơn right, dừng']])}
<p>Phần tử chính giữa (số 3) tự đứng yên, không cần xử lý riêng.</p>
<h3>Độ phức tạp</h3>
<p>O(n) thời gian (n/2 lần đổi), O(1) bộ nhớ thêm.</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Duyệt hết cả mảng thay vì dừng ở giữa: đổi xong lại đổi ngược, mảng trở về như cũ.</li>
<li>Tạo mảng mới rồi <code>return</code> mảng mới: sai yêu cầu "tại chỗ", mảng của người gọi không đổi.</li>
</ul>
<h3>Cú pháp hoán đổi gọn</h3>
<p>Bạn sẽ học cú pháp destructuring sau, nhưng xem trước cách hoán đổi không cần biến tạm:</p>
{{ex1}}`,
examples:[String.raw`function reverseInPlace(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}

const nums = [1, 2, 3, 4, 5];
reverseInPlace(nums);
console.log(nums);`,
String.raw`const a = [1, 2, 3];
[a[0], a[2]] = [a[2], a[0]];
console.log(a);  // [3, 2, 1]`]},
});
