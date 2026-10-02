defineExercise({
  id: 'w2.9',
  title: 'Dãy Fibonacci',
  desc: `<p>Dãy Fibonacci: <code>0, 1, 1, 2, 3, 5, 8, 13...</code> Từ số thứ ba trở đi, mỗi số bằng tổng hai số liền trước.</p>
<p>Viết <code>fibonacci(n)</code> trả về mảng gồm <code>n</code> số đầu tiên.</p>
<pre>fibonacci(7) → [0, 1, 1, 2, 3, 5, 8]
fibonacci(1) → [0]
fibonacci(0) → []</pre>`,
  hints: [
    'Xử lý riêng hai trường hợp <code>n &lt;= 0</code> và <code>n === 1</code> trước.',
    'Bắt đầu với <code>const result = [0, 1]</code>. Mỗi vòng, thêm vào cuối tổng của hai phần tử cuối.',
    'Phần tử cuối: <code>result[result.length - 1]</code>, áp chót: <code>result[result.length - 2]</code>. Lặp <code>while (result.length &lt; n)</code>.'],
  starter: String.raw`function fibonacci(n) {

}

console.log(fibonacci(7)); // [0, 1, 1, 2, 3, 5, 8]
`,
  tests: String.raw`
test('fibonacci(7)', () => expect(fibonacci(7)).toEqual([0, 1, 1, 2, 3, 5, 8]));
test('fibonacci(0) → []', () => expect(fibonacci(0)).toEqual([]));
test('fibonacci(1) → [0]', () => expect(fibonacci(1)).toEqual([0]));
test('fibonacci(2) → [0, 1]', () => expect(fibonacci(2)).toEqual([0, 1]));
test('fibonacci(10) kết thúc bằng 34', () => { const r = fibonacci(10); expect(r.length).toBe(10); expect(r[9]).toBe(34); });
test('fibonacci(50) chạy nhanh, số cuối là 7778742049', () => expect(fibonacci(50)[49]).toBe(7778742049));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Xây dần từ kết quả trước</h3>
<p>Mỗi số Fibonacci chỉ cần hai số trước nó. Vì vậy chỉ cần giữ mảng kết quả và liên tục thêm số mới vào cuối. Đây là dạng đơn giản nhất của quy hoạch động: dùng lại kết quả đã tính thay vì tính lại.</p>
{{ex0}}
<h3>Đệ quy: đẹp nhưng chậm</h3>
<p>Đệ quy là function tự gọi lại chính nó. Viết Fibonacci bằng đệ quy rất gọn, nhưng tính lại cùng một giá trị rất nhiều lần:</p>
{{ex1}}
<p>Chỉ để tính số thứ 20 mà function bị gọi hơn 20.000 lần. Với n = 50, cách này chạy hàng giờ, còn cách dùng mảng chỉ cần 50 bước.</p>`,
examples:[String.raw`const arr = [0, 1];
console.log("phần tử cuối:", arr[arr.length - 1]);
console.log("phần tử áp chót:", arr[arr.length - 2]);
arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
console.log(arr);`,
String.raw`let calls = 0;
function fib(n) {
  calls++;
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
console.log("fib(20) =", fib(20), "| số lần gọi:", calls);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Xử lý riêng n nhỏ, sau đó bắt đầu từ <code>[0, 1]</code> và thêm tổng hai phần tử cuối cho tới khi đủ n phần tử.</p>
{{ex0}}
<h3>Chạy tay với n = 6</h3>
${TRACE(['result trước', 'hai số cuối', 'thêm'], [['[0, 1]', '1 + 0', '1'], ['[0, 1, 1]', '1 + 1', '2'], ['[0, 1, 1, 2]', '2 + 1', '3'], ['[0, 1, 1, 2, 3]', '3 + 2', '5'], ['[0, 1, 1, 2, 3, 5]', '', 'đủ 6, dừng']])}
<h3>Độ phức tạp</h3>
<p>O(n) thời gian. So với đệ quy thuần là khoảng O(2ⁿ):</p>
<pre>              fib(5)
          /          \
      fib(4)        fib(3)
      /    \        /    \
  fib(3)  fib(2)  fib(2) fib(1)
  ...   fib(3) và fib(2) bị tính lại nhiều lần</pre>
<h3>Lỗi hay gặp</h3>
<p>Trả về <code>[0, 1]</code> khi n = 1 hoặc n = 0 vì quên xử lý riêng. Đây là lý do bộ chấm có test cho n = 0, 1, 2.</p>`,
examples:[String.raw`function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const result = [0, 1];
  while (result.length < n) {
    const next = result[result.length - 1] + result[result.length - 2];
    result.push(next);
  }
  return result;
}

console.log(fibonacci(10));`]},
});
