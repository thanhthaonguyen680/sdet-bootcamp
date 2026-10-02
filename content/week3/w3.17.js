defineExercise({
  id: 'w3.17',
  title: 'Retry bất đồng bộ',
  desc: `<p>Viết <code>retryAsync(fn, times, delayMs)</code>:</p>
<ul>
<li>Gọi <code>fn()</code> (trả về Promise). Thành công thì trả về kết quả ngay.</li>
<li>Thất bại thì chờ <code>delayMs</code> rồi thử lại, tổng cộng tối đa <code>times</code> lần.</li>
<li>Hết lượt vẫn lỗi thì ném ra (throw) lỗi của lần thử cuối cùng.</li>
</ul>
<p>Đây là bản nâng cấp của bài retry tuần 1, đúng kiểu retry dùng thật khi gọi API trong test automation.</p>`,
  hints: [
    'Tự viết hàm chờ <code>const wait = ms =&gt; new Promise(r =&gt; setTimeout(r, ms));</code> (xem bài 14).',
    'Vòng <code>for (let attempt = 1; attempt &lt;= times; attempt++)</code>, bên trong <code>try { return await fn(); } catch (err) { lastError = err; }</code>.',
    'Chỉ chờ khi còn lượt: <code>if (attempt &lt; times) await wait(delayMs);</code>. Sau vòng lặp: <code>throw lastError;</code>'],
  starter: String.raw`const retryAsync = async (fn, times, delayMs) => {

};

// Thử: API lỗi 2 lần đầu, lần 3 mới thành công
let calls = 0;
const flakyApi = () => new Promise((resolve, reject) => {
  calls++;
  setTimeout(() => (calls < 3 ? reject(new Error("Lần " + calls + " lỗi")) : resolve("OK ở lần " + calls)), 20);
});
// console.log(await retryAsync(flakyApi, 5, 100));
`,
  tests: STRIP + String.raw`
const __flaky = (failTimes) => { let n = 0; const fn = () => { n++; return n <= failTimes ? Promise.reject(new Error("fail " + n)) : Promise.resolve("ok " + n); }; fn.count = () => n; return fn; };
test('Thành công ngay lần 1', async () => { const f = __flaky(0); expect(await retryAsync(f, 3, 10)).toBe("ok 1"); expect(f.count()).toBe(1); });
test('Thành công ở lần 3', async () => { const f = __flaky(2); expect(await retryAsync(f, 5, 10)).toBe("ok 3"); expect(f.count(), 'Đã gọi ' + f.count() + ' lần').toBe(3); });
test('Hết lượt: ném lỗi của lần cuối', async () => { const f = __flaky(99); const e = await __rejects(retryAsync(f, 3, 10)); expect(e && e.message, 'Cần throw lỗi của lần thử cuối').toBe("fail 3"); expect(f.count()).toBe(3); });
test('Có chờ giữa các lần thử', async () => { const f = __flaky(2); const t = performance.now(); await retryAsync(f, 5, 60); expect(performance.now() - t >= 110, 'Chưa chờ delayMs giữa các lần').toBe(true); });
test('Không chờ thừa sau lần cuối', async () => { const f = __flaky(99); const t = performance.now(); await __rejects(retryAsync(f, 2, 80)); const ms = performance.now() - t; expect(ms < 150, 'Mất ' + Math.round(ms) + ' ms, có vẻ vẫn chờ sau lần thử cuối').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Retry với async/await</h3>
<p>Kết hợp ba thứ đã học: vòng lặp, <code>try/catch</code> với <code>await</code>, và hàm <code>wait</code>. <code>return</code> bên trong <code>try</code> thoát luôn function khi thành công.</p>
{{ex0}}
<h3>throw: ném lỗi ra ngoài</h3>
<p>Sau khi thử hết lượt, function nên báo cho người gọi biết đã thất bại bằng cách <code>throw</code> lỗi. Trong function <code>async</code>, <code>throw</code> làm Promise trả về bị reject.</p>
{{ex1}}
<p class="note">Góc QA: retry giúp xử lý lỗi mạng chập chờn khi chuẩn bị test data. Nhưng đừng dùng retry để che một test lúc pass lúc fail mà không tìm hiểu nguyên nhân, vì đó có thể là bug thật về race condition. Thực tế người ta còn tăng dần thời gian chờ sau mỗi lần thử (exponential backoff) để không dồn tải cho server.</p>`,
examples:[String.raw`const wait = ms => new Promise(r => setTimeout(r, ms));
let n = 0;
const unstable = async () => { n++; if (n < 3) throw new Error("lỗi lần " + n); return "OK"; };

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    const result = await unstable();
    console.log("Thành công ở lần", attempt, result);
    break;
  } catch (err) {
    console.log("Lần", attempt, "thất bại:", err.message);
    await wait(100);
  }
}`,
String.raw`const mustBePositive = async (n) => {
  if (n <= 0) throw new Error("n phải dương");
  return n;
};
try {
  await mustBePositive(-1);
} catch (err) {
  console.log("Người gọi bắt được:", err.message);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Chạy tay: lỗi 2 lần, times = 5</h3>
${TRACE(['attempt', 'fn()', 'hành động'], [['1', 'lỗi', 'lưu lỗi, chờ delayMs'], ['2', 'lỗi', 'lưu lỗi, chờ delayMs'], ['3', 'thành công', '<code>return</code> kết quả, thoát hàm']])}
<h3>Giải thích</h3>
<ul>
<li><code>return await fn()</code> nằm trong <code>try</code>: phải có <code>await</code> thì lỗi mới được <code>catch</code> bắt. Viết <code>return fn()</code> thì Promise lỗi đi thẳng ra ngoài, không được thử lại.</li>
<li><code>if (attempt &lt; times)</code> tránh chờ vô ích sau lần thử cuối.</li>
<li>Hết vòng lặp nghĩa là mọi lần đều lỗi: <code>throw lastError</code> để người gọi biết.</li>
</ul>`,
examples:[String.raw`const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryAsync = async (fn, times, delayMs) => {
  let lastError;
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < times) await wait(delayMs);
    }
  }
  throw lastError;
};

let calls = 0;
const flakyApi = async () => {
  calls++;
  if (calls < 3) throw new Error("Lần " + calls + " lỗi");
  return "OK ở lần " + calls;
};
console.log(await retryAsync(flakyApi, 5, 100));`]},
});
