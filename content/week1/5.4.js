defineExercise({
  id: '5.4',
  title: 'Đếm lỗi trong log',
  desc: `<p>Viết function <code>countWord(log, word)</code> đếm số lần <code>word</code> xuất hiện trong chuỗi <code>log</code>.</p>
<pre>countWord(log, "ERROR") → 3</pre>`,
  hint: `Cách nhanh: <code>log.split(word).length - 1</code>. Cách luyện tay: dùng <code>indexOf(word, viTriBatDau)</code> trong vòng lặp <code>while</code> cho tới khi trả về -1.`,
  starter: String.raw`const log = "INFO  Start test\nERROR Timeout at /order\nINFO  Retry\nERROR Element not found\nWARN  Slow response\nERROR Timeout at /order";

function countWord(log, word) {

}

console.log(countWord(log, "ERROR")); // 3
`,
  tests: String.raw`
const __log = "INFO  Start test\nERROR Timeout at /order\nINFO  Retry\nERROR Element not found\nWARN  Slow response\nERROR Timeout at /order";
test('Đếm ERROR → 3', () => expect(countWord(__log, "ERROR")).toBe(3));
test('Đếm INFO → 2', () => expect(countWord(__log, "INFO")).toBe(2));
test('Không có FATAL → 0', () => expect(countWord(__log, "FATAL")).toBe(0));
test('"ERROR ERROR" → 2', () => expect(countWord("ERROR ERROR", "ERROR")).toBe(2));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>indexOf có vị trí bắt đầu</h3>
<p><code>indexOf(từ, vị_trí)</code> tìm từ vị trí chỉ định trở đi, trả về <code>-1</code> nếu không thấy.</p>
${ANAT(['text', 'Chuỗi cần tìm trong đó, ở đây là <code>"abcabc"</code>.'], '.indexOf(', ['"b"', 'Nội dung cần tìm.'], ', ', ['2', 'Vị trí bắt đầu tìm (không bắt buộc, bỏ đi thì tìm từ 0).'], ')  // → ', ['4', 'Vị trí đầu tiên tìm thấy tính từ 2. Không thấy thì trả về <code>-1</code>.'])}
{{ex0}}
<h3>Tìm tất cả vị trí xuất hiện</h3>
<p>Kết hợp với <code>while</code>: mỗi lần tìm thấy thì tìm tiếp từ vị trí ngay sau đó, cho tới khi nhận về <code>-1</code>.</p>
{{ex1}}
<h3>Ký tự xuống dòng</h3>
<p>Trong chuỗi, <code>\\n</code> là ký tự xuống dòng. Log thực tế thường là nhiều dòng nối với nhau bằng ký tự này.</p>
{{ex2}}`,
examples:[String.raw`const text = "abcabc";
console.log(text.indexOf("b"));     // 1
console.log(text.indexOf("b", 2));  // 4: tìm từ vị trí 2
console.log(text.indexOf("x"));     // -1: không thấy`,
String.raw`const s = "a-b-c-d";
let pos = s.indexOf("-");
while (pos !== -1) {
  console.log("Thấy dấu - ở vị trí", pos);
  pos = s.indexOf("-", pos + 1);
}`,
String.raw`const log = "dòng 1\ndòng 2\ndòng 3";
console.log(log);
console.log(log.split("\n").length, "dòng");`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>indexOf(word, pos)</code> tìm <code>word</code> bắt đầu từ vị trí <code>pos</code>, không thấy trả về -1.</li>
<li>Mỗi lần tìm thấy thì đếm và nhảy qua hết từ vừa tìm (<code>pos + word.length</code>) rồi tìm tiếp.</li>
</ul>
<h3>Cách ngắn</h3>
{{ex1}}
<p>Chuỗi bị cắt tại mỗi chỗ có <code>word</code>, nên số mảnh luôn nhiều hơn số lần xuất hiện đúng 1.</p>`,
examples:[String.raw`const log = "INFO  Start test\nERROR Timeout at /order\nINFO  Retry\nERROR Element not found\nWARN  Slow response\nERROR Timeout at /order";

function countWord(log, word) {
  let count = 0;
  let pos = log.indexOf(word);
  while (pos !== -1) {
    count++;
    pos = log.indexOf(word, pos + word.length);
  }
  return count;
}

console.log(countWord(log, "ERROR")); // 3
console.log(countWord(log, "FATAL")); // 0`,
String.raw`const countWordShort = (log, word) => log.split(word).length - 1;
console.log(countWordShort("ERROR x ERROR", "ERROR")); // 2`]},
});
