defineExercise({
  id: 'w3.3',
  title: 'Destructuring mảng',
  desc: `<p>Viết ba function dùng destructuring mảng:</p>
<ul>
<li><code>parseQuery(url)</code>: làm lại bài 5.1 tuần 1 theo phong cách mới, tách từng cặp bằng <code>const [key, value] = pair.split("=")</code>.</li>
<li><code>swap(pair)</code>: nhận <code>[a, b]</code>, trả về <code>[b, a]</code>.</li>
<li><code>firstAndRest(arr)</code>: trả về <code>{ first, rest }</code>, với <code>first</code> là phần tử đầu và <code>rest</code> là mảng các phần tử còn lại.</li>
</ul>
<pre>parseQuery("https://x.jp/order?code=7203&amp;side=buy") → { code: "7203", side: "buy" }
swap([1, 2])              → [2, 1]
firstAndRest([1, 2, 3])   → { first: 1, rest: [2, 3] }</pre>`,
  hints: [
    '<code>const [a, b] = [10, 20];</code> gán theo vị trí. <code>const [first, ...rest] = arr;</code> gom phần còn lại vào mảng.',
    'Với <code>parseQuery</code>: <code>const [, query] = url.split("?");</code> bỏ qua phần đầu. Nhớ xử lý khi <code>query</code> là <code>undefined</code>.',
    '<code>swap</code> chỉ cần một dòng: <code>const swap = ([a, b]) =&gt; [b, a];</code>'],
  starter: String.raw`const parseQuery = (url) => {

};

const swap = (pair) => {

};

const firstAndRest = (arr) => {

};

console.log(parseQuery("https://x.jp/order?code=7203&side=buy"));
console.log(swap([1, 2]));
console.log(firstAndRest([1, 2, 3]));
`,
  tests: STRIP + String.raw`
test('parseQuery 2 tham số', () => expect(parseQuery("https://x.jp/order?code=7203&side=buy")).toEqual({ code: "7203", side: "buy" }));
test('parseQuery không có dấu ? → {}', () => expect(parseQuery("https://x.jp/")).toEqual({}));
test('swap([1, 2]) → [2, 1]', () => expect(swap([1, 2])).toEqual([2, 1]));
test('firstAndRest([1, 2, 3])', () => expect(firstAndRest([1, 2, 3])).toEqual({ first: 1, rest: [2, 3] }));
test('firstAndRest([]) → { first: undefined, rest: [] }', () => expect(firstAndRest([])).toEqual({ first: undefined, rest: [] }));
test('Có dùng destructuring mảng', () => expect(/(const|let)\s*\[|\(\s*\[/.test(__code), 'Chưa thấy cú pháp destructuring [ ... ]').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Destructuring mảng</h3>
<p>Mảng được destructuring theo <strong>vị trí</strong> chứ không theo tên.</p>
{{ex0}}
<h3>Bỏ qua, gom phần còn lại, hoán đổi</h3>
{{ex1}}
<h3>Kết hợp với Object.entries</h3>
<p><code>Object.entries(obj)</code> biến object thành mảng các cặp <code>[key, value]</code>. Kết hợp destructuring trong <code>for...of</code> cho code rất gọn, thay được cho <code>for...in</code>:</p>
{{ex2}}`,
examples:[String.raw`const [a, b] = [10, 20];
console.log(a, b);

const [key, value] = "code=7203".split("=");
console.log(key, value);`,
String.raw`const [, second] = ["A", "B", "C"];        // bỏ qua phần tử đầu
console.log(second);                         // "B"

const [head, ...tail] = [1, 2, 3, 4];        // gom phần còn lại
console.log(head, tail);                     // 1 [2, 3, 4]

let x = 1, y = 2;
[x, y] = [y, x];                             // hoán đổi không cần biến tạm
console.log(x, y);`,
String.raw`const prices = { "7203": 2850, "6758": 13200 };
for (const [code, price] of Object.entries(prices)) {
  console.log(code, "→", price);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>const [, query] = url.split("?")</code> bỏ qua phần trước dấu <code>?</code>. Không có dấu <code>?</code> thì <code>query</code> là <code>undefined</code>, trả về <code>{}</code> ngay.</li>
<li>Trong vòng lặp, <code>const [key, value] = pair.split("=")</code> thay cho <code>parts[0]</code>, <code>parts[1]</code>, dễ đọc hơn nhiều.</li>
<li><code>swap</code> và <code>firstAndRest</code> destructuring luôn ở tham số.</li>
</ul>
<h3>So với tuần 1</h3>
<p>Có thể viết <code>parseQuery</code> hoàn toàn không dùng vòng lặp bằng <code>Object.fromEntries</code>, hàm ngược của <code>Object.entries</code>:</p>
{{ex1}}`,
examples:[String.raw`const parseQuery = (url) => {
  const [, query] = url.split("?");
  const result = {};
  if (!query) return result;
  for (const pair of query.split("&")) {
    const [key, value] = pair.split("=");
    result[key] = value;
  }
  return result;
};

const swap = ([a, b]) => [b, a];
const firstAndRest = ([first, ...rest]) => ({ first, rest });

console.log(parseQuery("https://x.jp/order?code=7203&side=buy"));
console.log(swap([1, 2]), firstAndRest([1, 2, 3]));`,
String.raw`const parseQueryShort = (url) => {
  const [, query] = url.split("?");
  return query ? Object.fromEntries(query.split("&").map(p => p.split("="))) : {};
};
console.log(parseQueryShort("https://x.jp/order?code=7203&side=buy"));`]},
});
