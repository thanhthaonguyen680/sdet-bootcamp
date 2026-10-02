defineExercise({
  id: 'w3.14',
  title: 'async/await và try/catch',
  desc: `<p>Viết bằng <code>async</code>/<code>await</code>, không dùng <code>.then</code>:</p>
<ul>
<li><code>getPriceTextAsync(code, fetchPrice)</code>: gọi <code>await fetchPrice(code)</code> để lấy giá rồi trả về chuỗi, dùng <code>try/catch</code> để bắt lỗi:
<pre>thành công → "7203: 2,850"                     (định dạng bằng toLocaleString("en-US"))
thất bại   → "0000: lỗi - Unknown code: 0000"</pre></li>
<li><code>getPortfolioValue(positions, fetchPrice)</code>: với <code>positions = [{ code, qty }]</code>, lấy giá từng mã và trả về tổng <code>qty × giá</code>.</li>
</ul>
<pre>getPortfolioValue([{ code: "7203", qty: 100 }, { code: "6758", qty: 10 }], fetchPrice)
→ 2850 × 100 + 13200 × 10 = 417000</pre>
<p><code>fetchPrice</code> là API giả được truyền vào như tham số (giống bài retry tuần 1 nhận <code>getRandom</code>): nó trả về Promise, sau 100 ms thì có giá hoặc báo lỗi <code>Unknown code</code>.</p>`,
  hints: [
    'Thêm <code>async</code> trước tham số: <code>const f = async (code, fetchPrice) =&gt; { ... }</code>. Bên trong dùng <code>const price = await fetchPrice(code);</code>',
    'Bọc phần <code>await</code> bằng <code>try { ... } catch (err) { ... }</code>, mỗi nhánh <code>return</code> một chuỗi.',
    'Với danh mục: <code>for (const { code, qty } of positions) { total += qty * await fetchPrice(code); }</code>. Đừng dùng <code>forEach</code> với <code>await</code> vì nó không chờ.'],
  starter: String.raw`const getPriceTextAsync = async (code, fetchPrice) => {

};

const getPortfolioValue = async (positions, fetchPrice) => {

};

const PRICES = { "7203": 2850, "6758": 13200 };
const fakeFetch = (code) => new Promise((resolve, reject) =>
  setTimeout(() => (code in PRICES ? resolve(PRICES[code]) : reject(new Error("Unknown code: " + code))), 100));

// console.log(await getPriceTextAsync("7203", fakeFetch));
// console.log(await getPortfolioValue([{ code: "7203", qty: 100 }, { code: "6758", qty: 10 }], fakeFetch));
`,
  tests: STRIP + String.raw`
const __f = __mk({ "7203": 2850, "6758": 13200 });
test('Thành công', async () => expect(await getPriceTextAsync("7203", __f)).toBe("7203: 2,850"));
test('Thất bại', async () => expect(await getPriceTextAsync("0000", __f)).toBe("0000: lỗi - Unknown code: 0000"));
test('getPortfolioValue → 417000', async () => expect(await getPortfolioValue([{ code: "7203", qty: 100 }, { code: "6758", qty: 10 }], __f)).toBe(417000));
test('Danh mục rỗng → 0', async () => expect(await getPortfolioValue([], __f)).toBe(0));
test('Dùng async, await, try/catch; không dùng .then', () => { expect(/\basync\b/.test(__code) && /\bawait\b/.test(__code) && /\btry\s*\{/.test(__code), 'Cần có async, await và try/catch').toBe(true); expect(__code.includes(".then("), 'Bài này không dùng .then').toBe(false); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Promise trong một phút</h3>
<p>Có những việc cần thời gian mới xong: gọi API, mở trang, bấm nút rồi chờ trang phản hồi. JavaScript không đứng chờ, mà trả về ngay một <strong>Promise</strong>: một "phiếu hẹn" cho kết quả sẽ có sau. Giống phiếu gửi xe, lúc cầm phiếu chưa có xe trong tay, nhưng sau này sẽ nhận được xe (thành công) hoặc được báo có sự cố (thất bại).</p>
<p>Bạn gần như không phải tự tạo Promise. Playwright và các thư viện tạo sẵn, việc của bạn là <strong>chờ</strong> chúng bằng <code>await</code>. Muốn hiểu sâu hơn thì xem các bài nâng cao 13–15.</p>
<h3>async/await: viết code bất đồng bộ như đồng bộ</h3>
<p><code>await</code> dừng function tại chỗ cho tới khi Promise xong, rồi trả về giá trị của nó. Chỉ dùng được bên trong function có <code>async</code>. Function <code>async</code> luôn trả về Promise.</p>
{{ex0}}
<h3>Bắt lỗi bằng try/catch</h3>
<p>Promise bị reject thì <code>await</code> sẽ ném lỗi, bắt bằng <code>try/catch</code> quen thuộc.</p>
{{ex1}}
<h3>Hai lỗi hay gặp</h3>
<ul>
<li><strong>Quên await:</strong> nhận về Promise chứ không phải giá trị.</li>
<li><strong>Dùng await trong forEach:</strong> <code>forEach</code> không chờ callback async. Dùng <code>for...of</code> để chờ từng cái.</li>
</ul>
{{ex2}}
<p class="note">Góc QA: mọi dòng thao tác trong Playwright đều bắt đầu bằng <code>await</code>. Quên <code>await</code> là lỗi phổ biến nhất khi mới viết test: hành động chưa làm xong thì dòng tiếp theo đã chạy.</p>`,
examples:[String.raw`const wait = ms => new Promise(r => setTimeout(r, ms));
const fetchPrice = async (code) => { await wait(100); return 2850; };

const showPrice = async () => {
  console.log("Bắt đầu");
  const price = await fetchPrice("7203");
  console.log("Giá:", price);
  return price * 100;
};
const total = await showPrice();
console.log("Tổng:", total);`,
String.raw`const fetchPrice = async (code) => { throw new Error("Unknown code: " + code); };

const safeGet = async (code) => {
  try {
    return await fetchPrice(code);
  } catch (err) {
    console.log("Bắt được lỗi:", err.message);
    return null;
  }
};
console.log(await safeGet("0000"));`,
String.raw`const fetchPrice = async (code) => 2850;
const p = fetchPrice("7203");
console.log(p);            // Promise, chưa phải giá

let total = 0;
[1, 2].forEach(async (n) => { total += await fetchPrice("x"); });
console.log("forEach:", total);   // 0: không chờ

total = 0;
for (const n of [1, 2]) total += await fetchPrice("x");
console.log("for...of:", total);  // 5700`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Code đọc từ trên xuống như code đồng bộ: lấy giá, định dạng, trả về; lỗi thì nhảy vào <code>catch</code>.</li>
<li><code>getPortfolioValue</code> dùng <code>for...of</code> với destructuring <code>{ code, qty }</code>, <code>await</code> từng mã.</li>
<li>Không có <code>try/catch</code> trong <code>getPortfolioValue</code>: một mã lỗi thì cả hàm bị reject, người gọi tự quyết định xử lý thế nào. Đây thường là lựa chọn đúng, tổng giá trị thiếu một mã là con số sai.</li>
</ul>
<h3>Nhanh hơn với Promise.all</h3>
<p>Cách trên gọi lần lượt từng mã. Bài 7 sẽ cho thấy cách gọi đồng thời để nhanh hơn nhiều lần. Muốn xem cách viết cũ bằng <code>.then/.catch</code> thì làm bài nâng cao 15.</p>`,
examples:[L(
'const getPriceTextAsync = async (code, fetchPrice) => {',
'  try {',
'    const price = await fetchPrice(code);',
'    return `${code}: ${price.toLocaleString("en-US")}`;',
'  } catch (err) {',
'    return `${code}: lỗi - ${err.message}`;',
'  }',
'};',
'',
'const getPortfolioValue = async (positions, fetchPrice) => {',
'  let total = 0;',
'  for (const { code, qty } of positions) {',
'    total += qty * await fetchPrice(code);',
'  }',
'  return total;',
'};',
'',
'const PRICES = { "7203": 2850, "6758": 13200 };',
'const fakeFetch = (code) => new Promise((resolve, reject) =>',
'  setTimeout(() => (code in PRICES ? resolve(PRICES[code]) : reject(new Error("Unknown code: " + code))), 100));',
'',
'console.log(await getPriceTextAsync("0000", fakeFetch));',
'console.log(await getPortfolioValue([{ code: "7203", qty: 100 }, { code: "6758", qty: 10 }], fakeFetch));')]},
});
