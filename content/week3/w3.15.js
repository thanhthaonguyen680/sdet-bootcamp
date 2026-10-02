defineExercise({
  id: 'w3.15',
  title: 'Tuần tự và song song (Promise.all)',
  desc: `<p>Mỗi lần gọi <code>fetchPrice</code> mất 100 ms. Viết hai function cùng trả về mảng giá theo đúng thứ tự của <code>codes</code>:</p>
<ul>
<li><code>getPricesSequential(codes, fetchPrice)</code>: gọi lần lượt, chờ xong mã này mới gọi mã tiếp.</li>
<li><code>getPricesParallel(codes, fetchPrice)</code>: gọi tất cả cùng lúc bằng <code>Promise.all</code>.</li>
</ul>
<p>Bộ chấm đo thời gian: với 3 mã, cách tuần tự mất khoảng 300 ms, cách song song chỉ khoảng 100 ms.</p>`,
  hints: [
    'Tuần tự: tạo mảng rỗng, <code>for...of</code> qua từng mã, <code>push(await fetchPrice(code))</code>.',
    'Song song: <code>codes.map(code =&gt; fetchPrice(code))</code> cho ra mảng các Promise, tất cả đã bắt đầu chạy.',
    '<code>return Promise.all(mangPromise);</code> hoặc <code>return await Promise.all(...)</code>. Kết quả giữ đúng thứ tự dù Promise nào xong trước.'],
  starter: String.raw`const getPricesSequential = async (codes, fetchPrice) => {

};

const getPricesParallel = async (codes, fetchPrice) => {

};

const PRICES = { "7203": 2850, "6758": 13200, "9984": 8900 };
const fakeFetch = (code) => new Promise(resolve => setTimeout(() => resolve(PRICES[code]), 100));

// let t = performance.now();
// console.log(await getPricesSequential(["7203", "6758", "9984"], fakeFetch), Math.round(performance.now() - t) + " ms");
// t = performance.now();
// console.log(await getPricesParallel(["7203", "6758", "9984"], fakeFetch), Math.round(performance.now() - t) + " ms");
`,
  tests: STRIP + String.raw`
const __f = __mk({ "7203": 2850, "6758": 13200, "9984": 8900 }, 100);
const __codes = ["7203", "6758", "9984"];
test('Tuần tự: đúng kết quả', async () => expect(await getPricesSequential(__codes, __f)).toEqual([2850, 13200, 8900]));
test('Tuần tự: mất khoảng 300 ms', async () => { const t = performance.now(); await getPricesSequential(__codes, __f); const ms = performance.now() - t; expect(ms >= 270, 'Chỉ mất ' + Math.round(ms) + ' ms, có vẻ đang chạy song song').toBe(true); });
test('Song song: đúng kết quả và thứ tự', async () => expect(await getPricesParallel(__codes, __f)).toEqual([2850, 13200, 8900]));
test('Song song: nhanh hơn 200 ms', async () => { const t = performance.now(); await getPricesParallel(__codes, __f); const ms = performance.now() - t; expect(ms < 200, 'Mất ' + Math.round(ms) + ' ms, có vẻ vẫn đang chờ từng mã').toBe(true); });
test('Song song: một mã lỗi thì cả Promise.all bị reject', async () => { const e = await __rejects(getPricesParallel(["7203", "0000"], __f)); expect(e && e.message).toBe("Unknown code: 0000"); });
test('Có dùng Promise.all', () => expect(__code.includes("Promise.all(")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Chờ lần lượt hay chạy cùng lúc</h3>
<p>Ba việc độc lập, mỗi việc mất 100 ms: làm lần lượt mất 300 ms, bắt đầu cả ba cùng lúc chỉ mất 100 ms. Giống như gọi ba món ăn: không cần đợi món đầu ra mới gọi món thứ hai.</p>
{{ex0}}
<h3>Promise.all</h3>
<p>Nhận một mảng Promise, trả về Promise của mảng kết quả <strong>đúng thứ tự</strong> ban đầu. Nếu một Promise bị reject thì cả <code>Promise.all</code> bị reject ngay.</p>
<p>Mấu chốt: gọi <code>fetchPrice</code> là việc đã bắt đầu chạy. <code>codes.map(c =&gt; fetchPrice(c))</code> khởi động tất cả cùng lúc, <code>Promise.all</code> chỉ việc chờ.</p>
<h3>Khi nào phải tuần tự</h3>
<p>Khi bước sau cần kết quả bước trước (đăng nhập rồi mới lấy token để gọi API), hoặc khi server giới hạn số request cùng lúc.</p>
<p class="note">Góc QA: chuẩn bị test data song song bằng <code>Promise.all</code> có thể giảm thời gian setup của cả bộ test đáng kể.</p>
<h3>Gặp trong Playwright</h3>
<p>Mẫu hay gặp nhất: bấm nút và chờ response của API <strong>cùng lúc</strong>. Nếu bấm trước rồi mới chờ, response có thể về trước khi bạn kịp bắt đầu chờ và test bị treo. <code>[response]</code> lấy phần tử đầu tiên của mảng kết quả (destructuring mảng, bài nâng cao 8).</p>
{{ex1}}`,
examples:[String.raw`const wait = ms => new Promise(r => setTimeout(r, ms));
const task = async (name) => { await wait(100); return name; };

let t = performance.now();
const r1 = [await task("A"), await task("B"), await task("C")];
console.log("Lần lượt:", r1, Math.round(performance.now() - t), "ms");

t = performance.now();
const r2 = await Promise.all([task("A"), task("B"), task("C")]);
console.log("Cùng lúc:", r2, Math.round(performance.now() - t), "ms");`,
{ run:false, code:String.raw`const [response] = await Promise.all([
  page.waitForResponse("**/api/orders"),
  page.getByRole("button", { name: "Đặt lệnh" }).click(),
]);
expect(response.status()).toBe(201);` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tuần tự: mỗi <code>await</code> trong vòng lặp chờ xong mới sang mã tiếp, tổng thời gian cộng dồn.</li>
<li>Song song: <code>codes.map(fetchPrice)</code> gọi <code>fetchPrice</code> cho mọi mã ngay lập tức, các request cùng chạy. <code>Promise.all</code> chờ tất cả và trả kết quả theo đúng thứ tự trong mảng, không theo thứ tự hoàn thành.</li>
</ul>
<h3>Cẩn thận khi viết gọn map(fetchPrice)</h3>
<p><code>map</code> truyền cho callback cả <code>(phần_tử, index, mảng)</code>. Nếu hàm nhận thêm tham số thứ hai với ý nghĩa khác, nó sẽ nhận nhầm index. An toàn hơn là viết rõ <code>map(code =&gt; fetchPrice(code))</code>.</p>
<h3>Độ phức tạp thời gian</h3>
${TRACE(['Cách', '3 mã', '100 mã'], [['Tuần tự', '~300 ms', '~10 giây'], ['Song song', '~100 ms', '~100 ms (nếu server chịu được)']])}`,
examples:[String.raw`const getPricesSequential = async (codes, fetchPrice) => {
  const prices = [];
  for (const code of codes) {
    prices.push(await fetchPrice(code));
  }
  return prices;
};

const getPricesParallel = (codes, fetchPrice) =>
  Promise.all(codes.map(code => fetchPrice(code)));

const PRICES = { "7203": 2850, "6758": 13200, "9984": 8900 };
const fakeFetch = (code) => new Promise(resolve => setTimeout(() => resolve(PRICES[code]), 100));

let t = performance.now();
console.log(await getPricesSequential(["7203", "6758", "9984"], fakeFetch), Math.round(performance.now() - t) + " ms");
t = performance.now();
console.log(await getPricesParallel(["7203", "6758", "9984"], fakeFetch), Math.round(performance.now() - t) + " ms");`]},
});
