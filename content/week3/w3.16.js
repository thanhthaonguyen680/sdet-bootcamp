defineExercise({
  id: 'w3.16',
  title: 'Kiểm tra nhiều endpoint (allSettled)',
  desc: `<p>Viết <code>checkEndpoints(urls, ping)</code>. <code>ping(url)</code> trả về Promise: resolve nếu endpoint sống, reject kèm lỗi nếu chết. Kết quả trả về:</p>
<pre>{
  up:   ["/api/prices", "/api/orders"],
  down: [{ url: "/api/news", error: "503 Service Unavailable" }],
}</pre>
<p>Phải kiểm tra <strong>tất cả</strong> endpoint cùng lúc, một endpoint lỗi không được làm dừng các endpoint khác. Giữ thứ tự như trong <code>urls</code>.</p>`,
  hints: [
    '<code>Promise.all</code> dừng ngay khi có một lỗi. <code>Promise.allSettled</code> thì chờ tất cả và cho biết từng cái thành công hay thất bại.',
    'Mỗi phần tử kết quả của <code>allSettled</code> có dạng <code>{ status: "fulfilled", value }</code> hoặc <code>{ status: "rejected", reason }</code>. Index của nó trùng với index trong <code>urls</code>.',
    'Dùng <code>filter</code> và <code>map</code> trên kết quả, kèm index để lấy lại url: <code>results.map((r, i) =&gt; ...)</code>. Thông báo lỗi là <code>r.reason.message</code>.'],
  starter: String.raw`const checkEndpoints = async (urls, ping) => {

};

const fakePing = (url) => new Promise((resolve, reject) =>
  setTimeout(() => (url.includes("news") ? reject(new Error("503 Service Unavailable")) : resolve("OK")), 80));

// console.log(await checkEndpoints(["/api/prices", "/api/news", "/api/orders"], fakePing));
`,
  tests: STRIP + String.raw`
const __p = url => new Promise((res, rej) => setTimeout(() => (url.includes("bad") ? rej(new Error("503 " + url)) : res("OK")), 60));
test('Phân loại up/down', async () => expect(await checkEndpoints(["/a", "/bad1", "/b"], __p)).toEqual({ up: ["/a", "/b"], down: [{ url: "/bad1", error: "503 /bad1" }] }));
test('Tất cả sống', async () => expect(await checkEndpoints(["/a", "/b"], __p)).toEqual({ up: ["/a", "/b"], down: [] }));
test('Tất cả chết', async () => expect((await checkEndpoints(["/bad1", "/bad2"], __p)).down.length).toBe(2));
test('Chạy song song (dưới 150 ms cho 3 endpoint)', async () => { const t = performance.now(); await checkEndpoints(["/a", "/b", "/c"], __p); expect(performance.now() - t < 150, 'Có vẻ đang ping lần lượt từng endpoint').toBe(true); });
test('Có dùng Promise.allSettled', () => expect(__code.includes("Promise.allSettled(")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Các cách chờ nhiều Promise</h3>
${TRACE(['Method', 'Xong khi', 'Khi có lỗi'], [['<code>Promise.all</code>', 'tất cả thành công', 'reject ngay với lỗi đầu tiên'], ['<code>Promise.allSettled</code>', 'tất cả xong (dù lỗi hay không)', 'không bao giờ reject'], ['<code>Promise.race</code>', 'cái đầu tiên xong', 'theo cái đầu tiên xong'], ['<code>Promise.any</code>', 'cái đầu tiên thành công', 'reject nếu tất cả đều lỗi']])}
<h3>Kết quả của allSettled</h3>
{{ex0}}
<p>Mỗi phần tử kết quả cho biết Promise tương ứng thành công (<code>value</code>) hay thất bại (<code>reason</code>), thứ tự giữ nguyên.</p>
<p class="note">Góc QA: kiểm tra sức khỏe hệ thống (health check) cần biết <strong>tất cả</strong> endpoint nào đang chết, không phải dừng lại ở cái đầu tiên. Đó là lúc dùng <code>allSettled</code>.</p>`,
examples:[String.raw`const ok = Promise.resolve("dữ liệu");
const fail = Promise.reject(new Error("503"));

const results = await Promise.allSettled([ok, fail]);
console.log(results);
results.forEach((r, i) =>
  console.log(i, r.status, r.status === "fulfilled" ? r.value : r.reason.message));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>urls.map(url =&gt; ping(url))</code> khởi động mọi lần ping cùng lúc.</li>
<li><code>allSettled</code> chờ tất cả, không dừng khi có lỗi. Kết quả <code>results[i]</code> ứng với <code>urls[i]</code>.</li>
<li>Duyệt kết quả bằng <code>forEach</code> kèm index, chia vào hai mảng <code>up</code> và <code>down</code>.</li>
</ul>
<h3>Cách viết chỉ dùng filter và map</h3>
{{ex1}}`,
examples:[String.raw`const checkEndpoints = async (urls, ping) => {
  const results = await Promise.allSettled(urls.map(url => ping(url)));
  const up = [];
  const down = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") up.push(urls[i]);
    else down.push({ url: urls[i], error: r.reason.message });
  });
  return { up, down };
};

const fakePing = (url) => new Promise((resolve, reject) =>
  setTimeout(() => (url.includes("news") ? reject(new Error("503 Service Unavailable")) : resolve("OK")), 80));
console.log(await checkEndpoints(["/api/prices", "/api/news", "/api/orders"], fakePing));`,
String.raw`const checkEndpoints2 = async (urls, ping) => {
  const results = await Promise.allSettled(urls.map(url => ping(url)));
  const paired = results.map((r, i) => ({ ...r, url: urls[i] }));
  return {
    up: paired.filter(r => r.status === "fulfilled").map(r => r.url),
    down: paired.filter(r => r.status === "rejected").map(r => ({ url: r.url, error: r.reason.message })),
  };
};
console.log(await checkEndpoints2(["/a"], async () => "OK"));`]},
});
