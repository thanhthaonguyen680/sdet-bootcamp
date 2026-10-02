defineExercise({
  id: '5.1',
  title: 'Phân tích URL',
  desc: `<p>Viết hai function:</p>
<ul>
<li><code>isStaging(url)</code>: trả về <code>true</code> nếu URL chứa <code>"devstg"</code>.</li>
<li><code>parseQuery(url)</code>: lấy phần sau dấu <code>?</code> và trả về object chứa các cặp key/value.</li>
</ul>
<pre>parseQuery("https://devstg.example.jp/order?code=7203&amp;side=buy")
→ { code: "7203", side: "buy" }

parseQuery("https://www.example.jp/")
→ {}</pre>`,
  hint: `<code>url.split("?")[1]</code> lấy phần query (có thể là <code>undefined</code>). Tiếp tục <code>split("&amp;")</code>, rồi mỗi phần <code>split("=")</code>.`,
  starter: String.raw`const url = "https://devstg.example.jp/order?code=7203&side=buy";

function isStaging(url) {

}

function parseQuery(url) {

}

console.log(isStaging(url));
console.log(parseQuery(url));
`,
  tests: String.raw`
test('isStaging: URL có devstg → true', () => expect(isStaging("https://devstg.example.jp/order?code=7203&side=buy")).toBe(true));
test('isStaging: URL production → false', () => expect(isStaging("https://www.example.jp/order")).toBe(false));
test('parseQuery tách đúng 2 tham số', () => expect(parseQuery("https://devstg.example.jp/order?code=7203&side=buy")).toEqual({ code: "7203", side: "buy" }));
test('parseQuery với 1 tham số', () => expect(parseQuery("https://www.example.jp/search?q=toyota")).toEqual({ q: "toyota" }));
test('URL không có dấu ? → {}', () => expect(parseQuery("https://www.example.jp/")).toEqual({}));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tìm trong chuỗi</h3>
{{ex0}}
<h3>split: tách chuỗi thành mảng</h3>
<p><code>split(dấu_tách)</code> cắt chuỗi tại mọi vị trí có dấu tách. Nếu không có dấu tách nào, kết quả là mảng chỉ có một phần tử.</p>
{{ex1}}
<h3>Thêm key vào object bằng biến</h3>
${ANAT(['result', 'Object cần thêm key.'], ['[key]', 'Ngoặc vuông: tên key lấy <strong>từ giá trị của biến</strong> <code>key</code>, tức <code>"side"</code>. Viết <code>result.key</code> thì lại tạo key có tên đúng là chữ "key".'], ' ', ['=', 'Gán.'], ' ', ['"buy"', 'Giá trị. Sau dòng này <code>result</code> là <code>{ side: "buy" }</code>.'], ';')}
{{ex2}}
<p class="note">Góc QA: trong Playwright bạn sẽ thường xuyên lấy URL hiện tại rồi kiểm tra query parameter. JavaScript có sẵn <code>new URL(url).searchParams</code> để làm việc này, nhưng tự viết một lần giúp bạn hiểu rõ nó hoạt động thế nào.</p>`,
examples:[String.raw`const url = "https://devstg.example.jp/order";
console.log(url.includes("devstg"));   // true
console.log(url.startsWith("https"));  // true
console.log(url.indexOf("/order"));    // vị trí xuất hiện, -1 nếu không có`,
String.raw`const pair = "code=7203";
const parts = pair.split("=");
console.log(parts);              // ["code", "7203"]
console.log(parts[0], parts[1]);

console.log("a&b&c".split("&"));
console.log("khong-co-dau-hoi".split("?"));     // chỉ 1 phần tử
console.log("khong-co-dau-hoi".split("?")[1]);  // undefined`,
String.raw`const result = {};
const key = "side";
result[key] = "buy";
result["code"] = "7203";
console.log(result);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>includes</code> trả về <code>true/false</code>, dùng thẳng làm kết quả.</li>
<li><code>url.split("?")[1]</code> là phần query. URL không có dấu <code>?</code> thì phần tử này là <code>undefined</code>, trả về <code>{}</code> luôn.</li>
<li>Mỗi cặp <code>key=value</code> tách bằng <code>split("=")</code>, rồi gán <code>result[key] = value</code>. Phải dùng ngoặc vuông vì tên key nằm trong biến.</li>
</ul>
<h3>Thực tế</h3>
<p>Trình duyệt và Node có sẵn <code>new URL(url).searchParams</code>, xử lý cả ký tự mã hóa như <code>%20</code>. Bài này tự viết để luyện <code>split</code>.</p>`,
examples:[String.raw`const url = "https://devstg.example.jp/order?code=7203&side=buy";

function isStaging(url) {
  return url.includes("devstg");
}

function parseQuery(url) {
  const result = {};
  const query = url.split("?")[1];
  if (!query) return result;
  for (const pair of query.split("&")) {
    const parts = pair.split("=");
    result[parts[0]] = parts[1];
  }
  return result;
}

console.log(isStaging(url));
console.log(parseQuery(url));
console.log(parseQuery("https://www.example.jp/"));`]},
});
