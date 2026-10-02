defineExercise({
  id: '3.4',
  title: 'Cơ chế retry với while',
  desc: `<p>Viết function <code>callWithRetry(maxAttempts, getRandom)</code> mô phỏng việc gọi API có retry:</p>
<ul>
<li>Mỗi lần thử, gọi <code>getRandom()</code>. Nếu kết quả &gt; 0.7 là thành công, dừng lại.</li>
<li>Thử tối đa <code>maxAttempts</code> lần, dùng <code>while</code>.</li>
<li>In từng lần thử, ví dụ <code>Lần 1: thất bại (0.42)</code>.</li>
<li>Trả về <code>{ success, attempts }</code>.</li>
</ul>
<p class="note"><code>getRandom</code> được truyền vào thay vì gọi thẳng <code>Math.random</code> để có thể test được. Đây là kỹ thuật rất hay dùng khi viết code dễ test.</p>`,
  hint: `Điều kiện vòng lặp: <code>while (attempt &lt;= maxAttempts)</code>. Khi thành công thì <code>return</code> ngay trong vòng lặp.`,
  starter: String.raw`function callWithRetry(maxAttempts, getRandom) {
  let attempt = 1;
  // Dùng while
  // Trả về { success: true/false, attempts: số lần đã thử }
}

console.log(callWithRetry(5, Math.random));
`,
  tests: String.raw`
test('Thành công ngay lần 1', () => expect(callWithRetry(5, () => 0.9)).toEqual({ success: true, attempts: 1 }));
test('Luôn thất bại → dừng sau 5 lần', () => expect(callWithRetry(5, () => 0.1)).toEqual({ success: false, attempts: 5 }));
test('Thành công ở lần 3', () => { const seq = [0.1, 0.5, 0.8, 0.9]; expect(callWithRetry(5, () => seq.shift())).toEqual({ success: true, attempts: 3 }); });
test('maxAttempts = 3 thì chỉ thử 3 lần', () => { let calls = 0; const r = callWithRetry(3, () => { calls++; return 0.2; }); expect(calls, 'getRandom bị gọi ' + calls + ' lần').toBe(3); expect(r).toEqual({ success: false, attempts: 3 }); });
test('0.7 chưa tính là thành công', () => expect(callWithRetry(1, () => 0.7).success).toBe(false));
test('In ra từng lần thử', () => expect(captureLogs(() => callWithRetry(3, () => 0.1)).length, 'Cần in 1 dòng cho mỗi lần thử').toBe(3));
test('Có dùng while', () => expect(/\bwhile\s*\(/.test(__source)).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vòng lặp while</h3>
<p><code>while</code> lặp khi điều kiện còn đúng. Hợp với trường hợp không biết trước sẽ lặp bao nhiêu lần.</p>
${ANAT(['while', '"Trong khi...".'], ' ', ['(attempt <= 3)', 'Điều kiện, kiểm tra trước mỗi vòng. Còn đúng thì chạy thân, sai thì dừng.'], ' {\n  console.log("Thử lần", attempt);\n  ', ['attempt++;', 'Dòng làm thay đổi điều kiện. Thiếu nó thì <code>attempt</code> mãi là 1 và vòng lặp không bao giờ dừng.'], '\n}')}
<p>Khác <code>for</code>: <code>while</code> chỉ có điều kiện, phần khởi tạo và bước nhảy bạn tự viết ở trước và bên trong vòng lặp.</p>
{{ex0}}
<p>Luôn phải có thứ làm điều kiện thành sai, thường là tăng biến đếm. Quên dòng <code>attempt++</code> sẽ thành lặp vô hạn (công cụ này sẽ tự dừng sau 3 giây).</p>
<h3>Thoát sớm với break</h3>
{{ex1}}
<p>Trong function, <code>return</code> vừa thoát vòng lặp vừa thoát luôn function.</p>
<h3>Truyền function làm tham số</h3>
<p>Function trong JavaScript là một giá trị, có thể truyền vào function khác rồi gọi như bình thường:</p>
{{ex2}}
<p class="note">Góc QA: retry là kỹ thuật cơ bản để xử lý test "flaky". Playwright có sẵn cơ chế auto-retry, nhưng hiểu cách tự viết giúp bạn biết lúc nào nên dùng, lúc nào đang che giấu bug thật.</p>`,
examples:[String.raw`let attempt = 1;
while (attempt <= 3) {
  console.log("Thử lần", attempt);
  attempt++;
}`,
String.raw`const values = [0.2, 0.5, 0.9, 0.1];
let i = 0;
while (i < values.length) {
  if (values[i] > 0.7) {
    console.log("Tìm thấy ở vị trí", i);
    break;
  }
  i++;
}`,
String.raw`function runTwice(action) {
  action();
  action();
}
runTwice(function () { console.log("Đã gọi action"); });

function alwaysHigh() { return 0.8; }
function check(getValue) {
  const v = getValue();
  console.log("Giá trị nhận được:", v);
}
check(alwaysHigh);
check(Math.random);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi vòng gọi <code>getRandom()</code> <strong>một lần</strong> và lưu vào biến. Gọi hai lần (một lần để so sánh, một lần để in) sẽ tốn thêm lượt và in sai giá trị.</li>
<li>Thành công thì <code>return</code> ngay trong vòng lặp, không cần biến cờ hay <code>break</code>.</li>
<li>Ra khỏi vòng lặp nghĩa là đã thử hết <code>maxAttempts</code> lần mà không thành công.</li>
<li>Điều kiện là <code>&gt; 0.7</code>, nên đúng 0.7 vẫn là thất bại.</li>
</ul>
<h3>Chạy tay với dãy 0.1, 0.5, 0.8</h3>
${TRACE(['attempt', 'getRandom()', 'Kết quả'], [['1', '0.1', 'thất bại, tăng attempt'], ['2', '0.5', 'thất bại, tăng attempt'], ['3', '0.8', 'thành công, trả về { success: true, attempts: 3 }']])}`,
examples:[String.raw`function callWithRetry(maxAttempts, getRandom) {
  let attempt = 1;
  while (attempt <= maxAttempts) {
    const value = getRandom();
    if (value > 0.7) {
      console.log("Lần " + attempt + ": thành công (" + value.toFixed(2) + ")");
      return { success: true, attempts: attempt };
    }
    console.log("Lần " + attempt + ": thất bại (" + value.toFixed(2) + ")");
    attempt++;
  }
  return { success: false, attempts: maxAttempts };
}

console.log(callWithRetry(5, Math.random));

const seq = [0.1, 0.5, 0.8];
console.log(callWithRetry(5, () => seq.shift()));`]},
});
