defineExercise({
  id: 'w3.13',
  title: 'Xử lý Promise với then/catch',
  desc: `<p>Viết <code>getPriceText(code, fetchPrice)</code> trả về một Promise mà kết quả là chuỗi:</p>
<pre>thành công → "7203: 2,850"                     (định dạng bằng toLocaleString("en-US"))
thất bại   → "0000: lỗi - Unknown code: 0000"</pre>
<p>Dùng <code>.then</code> và <code>.catch</code>, <strong>chưa</strong> dùng async/await. <code>fetchPrice</code> được truyền vào như tham số, giống cách bài retry tuần 1 nhận <code>getRandom</code>, để bộ chấm có thể truyền API giả của nó vào.</p>`,
  hints: [
    '<code>fetchPrice(code).then(price =&gt; ...)</code> nhận giá khi thành công. Giá trị bạn <code>return</code> trong <code>then</code> trở thành kết quả của Promise mới.',
    'Nối tiếp <code>.catch(err =&gt; ...)</code> để bắt lỗi, trả về chuỗi báo lỗi dùng <code>err.message</code>.',
    'Nhớ <code>return</code> cả chuỗi Promise: <code>return fetchPrice(code).then(...).catch(...);</code> Thiếu <code>return</code> thì function trả về <code>undefined</code>.'],
  starter: String.raw`const getPriceText = (code, fetchPrice) => {

};

// API giả để bạn chạy thử
const PRICES = { "7203": 2850, "6758": 13200 };
const fakeFetch = (code) => new Promise((resolve, reject) =>
  setTimeout(() => (code in PRICES ? resolve(PRICES[code]) : reject(new Error("Unknown code: " + code))), 100));

// getPriceText("7203", fakeFetch).then(text => console.log(text));
// getPriceText("0000", fakeFetch).then(text => console.log(text));
`,
  tests: STRIP + String.raw`
const __f = __mk({ "7203": 2850, "6758": 13200 });
test('Trả về Promise', () => expect(getPriceText("7203", __f) instanceof Promise, 'Function chưa return Promise, có quên return không?').toBe(true));
test('Thành công: "7203: 2,850"', async () => expect(await getPriceText("7203", __f)).toBe("7203: 2,850"));
test('Thành công: "6758: 13,200"', async () => expect(await getPriceText("6758", __f)).toBe("6758: 13,200"));
test('Thất bại vẫn resolve ra chuỗi lỗi', async () => expect(await getPriceText("0000", __f)).toBe("0000: lỗi - Unknown code: 0000"));
test('Dùng then/catch, chưa dùng async/await', () => { expect(__code.includes(".then(") && __code.includes(".catch("), 'Cần dùng .then và .catch').toBe(true); expect(/\bawait\b|\basync\b/.test(__code), 'Bài này chưa dùng async/await').toBe(false); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>then và catch</h3>
<p><code>.then(callback)</code> chạy khi Promise thành công, <code>.catch(callback)</code> chạy khi thất bại. Cả hai đều trả về một <strong>Promise mới</strong>, nên có thể nối tiếp.</p>
{{ex0}}
<h3>Giá trị return trong then đi tiếp xuống dưới</h3>
{{ex1}}
<p>Sau khi <code>catch</code> xử lý lỗi và trả về giá trị, chuỗi quay lại trạng thái thành công. Vì vậy <code>.then(...).catch(...)</code> luôn cho ra một kết quả, dù lỗi hay không.</p>
<h3>Lỗi hay gặp: quên return</h3>
<p>Function bọc một chuỗi Promise mà thiếu <code>return</code> thì trả về <code>undefined</code>, người gọi không có gì để chờ. Lỗi này trong code test làm test kết thúc sớm và "pass" dù chưa kiểm tra gì.</p>`,
examples:[String.raw`const fetchPrice = (code) => new Promise((resolve, reject) =>
  setTimeout(() => (code === "7203" ? resolve(2850) : reject(new Error("Unknown code"))), 100));

fetchPrice("7203")
  .then(price => console.log("Giá:", price))
  .catch(err => console.log("Lỗi:", err.message))
  .finally(() => console.log("Xong (luôn chạy)"));`,
String.raw`Promise.resolve(2850)
  .then(price => price * 100)       // 285000
  .then(total => total.toLocaleString("en-US"))
  .then(text => console.log("Tổng:", text));

Promise.reject(new Error("mất mạng"))
  .then(x => console.log("không chạy"))
  .catch(err => "Giá trị thay thế khi lỗi")
  .then(v => console.log(v));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>return</code> ở đầu trả cả chuỗi Promise cho người gọi. Arrow function một biểu thức (không có <code>{ }</code>) tự return nên càng gọn.</li>
<li><code>.then</code> đổi giá thành chuỗi. Giá trị return trong <code>then</code> trở thành kết quả của Promise tiếp theo.</li>
<li><code>.catch</code> đặt cuối chuỗi bắt lỗi của <code>fetchPrice</code> và trả về chuỗi báo lỗi. Nhờ vậy Promise cuối cùng luôn thành công.</li>
</ul>
<h3>Thứ tự then/catch có ý nghĩa</h3>
<p>Nếu đặt <code>.catch</code> trước <code>.then</code>, lỗi được đổi thành chuỗi rồi lại đi qua <code>.then</code> và bị định dạng như một con số, cho kết quả sai.</p>`,
examples:[L(
'const getPriceText = (code, fetchPrice) =>',
'  fetchPrice(code)',
'    .then(price => `${code}: ${price.toLocaleString("en-US")}`)',
'    .catch(err => `${code}: lỗi - ${err.message}`);',
'',
'const PRICES = { "7203": 2850 };',
'const fakeFetch = (code) => new Promise((resolve, reject) =>',
'  setTimeout(() => (code in PRICES ? resolve(PRICES[code]) : reject(new Error("Unknown code: " + code))), 100));',
'',
'getPriceText("7203", fakeFetch).then(console.log);',
'getPriceText("0000", fakeFetch).then(console.log);')]},
});
