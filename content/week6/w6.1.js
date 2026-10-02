defineExercise({
  id: 'w6.1',
  title: 'Che dữ liệu nhạy cảm trước khi hỏi AI',
  desc: `<p>Test đăng nhập bị lỗi và bạn muốn dán log vào AI để nhờ phân tích. Nhưng trong log có mật khẩu, token và email thật. Trước khi dán, hãy viết 2 function để che chúng đi:</p>
<ul>
<li><code>maskSecrets(text, secrets)</code>: thay <strong>mọi</strong> chỗ xuất hiện của từng giá trị trong mảng <code>secrets</code> bằng <code>***</code>. Bỏ qua phần tử là chuỗi rỗng.</li>
<li><code>maskEmails(text)</code>: thay mọi địa chỉ email bằng <code>[email]</code>.</li>
</ul>
<pre>maskSecrets("pw=X1; again X1", ["X1"])  → "pw=***; again ***"
maskEmails("Gửi an@congty.vn nhé")      → "Gửi [email] nhé"</pre>
<p class="note">Phần còn lại của log (mã lỗi, đường dẫn, thời gian) phải giữ nguyên, vì AI cần chúng để phân tích.</p>`,
  hints: [
    '<code>replaceAll(cái_cần_thay, "***")</code> thay mọi chỗ xuất hiện (bài 5.2 tuần 1). Duyệt mảng <code>secrets</code> bằng <code>for...of</code>, mỗi vòng thay một giá trị.',
    'Chuỗi rỗng phải bỏ qua: <code>"abc".replaceAll("", "*")</code> chèn dấu sao vào giữa mọi ký tự. Đầu vòng lặp: <code>if (!s) continue;</code>',
    'Email: <code>text.replace(/[^\\s@"]+@[^\\s@"]+\\.[^\\s@"]+/g, "[email]")</code>. Mẫu này nghĩa là: một cụm không có khoảng trắng, @ hay dấu nháy, rồi @, rồi tên miền có dấu chấm.'],
  starter: String.raw`const log = '[10:41] POST /api/login {"email":"khach.hang@congty.vn","password":"Matkhau@2026"}\n[10:41] 401 Unauthorized\n[10:42] Retry với token=sk-test-8f2a91c0\n[10:42] Liên hệ hỗ trợ: an.nguyen@congty.vn';
const secrets = ["Matkhau@2026", "sk-test-8f2a91c0"];

function maskSecrets(text, secrets) {

}

function maskEmails(text) {

}

console.log(maskEmails(maskSecrets(log, secrets)));
`,
  tests: String.raw`
const __log = '[10:41] POST /api/login {"email":"khach.hang@congty.vn","password":"Matkhau@2026"}\n[10:41] 401 Unauthorized\n[10:42] Retry với token=sk-test-8f2a91c0\n[10:42] Liên hệ hỗ trợ: an.nguyen@congty.vn';
test('Thay mọi chỗ xuất hiện của một secret', () => expect(maskSecrets('pw=X1; again X1', ['X1'])).toBe('pw=***; again ***'));
test('Thay nhiều secret khác nhau', () => expect(maskSecrets('a=AAA b=BBB', ['AAA', 'BBB'])).toBe('a=*** b=***'));
test('Bỏ qua secret là chuỗi rỗng', () => expect(maskSecrets('abc', ['', 'b']), 'Chuỗi rỗng phải được bỏ qua, nếu không *** bị chèn vào giữa mọi ký tự').toBe('a***c'));
test('Mảng secrets rỗng thì giữ nguyên', () => expect(maskSecrets('abc', [])).toBe('abc'));
test('maskEmails thay mọi email', () => expect(maskEmails('Gửi an@congty.vn và b.c@cong-ty.com.vn nhé')).toBe('Gửi [email] và [email] nhé'));
test('Log mẫu không còn dữ liệu nhạy cảm, phần cần cho AI vẫn còn', () => { const r = maskEmails(maskSecrets(__log, ['Matkhau@2026', 'sk-test-8f2a91c0'])); for (const bad of ['Matkhau@2026', 'sk-test-8f2a91c0', '@congty.vn']) expect(r.includes(bad), 'Vẫn còn "' + bad + '"').toBe(false); for (const keep of ['401 Unauthorized', '/api/login', '[10:42]']) expect(r.includes(keep), 'Đã xóa mất "' + keep + '", AI cần phần này để phân tích').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 6: AI là trợ lý, bạn là người chịu trách nhiệm</h3>
<p>AI viết code rất nhanh, nhưng nó không biết ứng dụng của bạn, không nhìn thấy trang của bạn (trừ khi được cấp công cụ), và đôi khi <strong>tự bịa</strong> ra thông tin nghe rất hợp lý. Hiện tượng này gọi là "ảo giác" (hallucination). Vì vậy tuần này tập trung vào kỹ năng quan trọng nhất: <strong>nhờ AI làm phần việc tay chân, và kiểm chứng mọi thứ AI đưa ra</strong>.</p>
${TRACE(['AI làm tốt', 'AI hay sai'], [['Viết nháp test case, test, dữ liệu test', 'Tự thêm quy tắc nghiệp vụ không có thật'], ['Giải thích lỗi, đọc log dài', 'Đoán locator theo tên "thường gặp" (Submit, Số lượng...)'], ['Chuyển code sang cấu trúc khác (POM, fixture)', 'Sửa lỗi bằng cách che lỗi: chờ cứng, .first(), assertion yếu'], ['Gợi ý trường hợp bạn chưa nghĩ tới', 'Viết test pass cả khi ứng dụng có bug']])}
<p>Trong trang này, câu trả lời của AI được <strong>ghi sẵn</strong> trong đề, lấy từ những lỗi AI hay mắc thật. Bài 8 hướng dẫn cách dùng AI thật trên máy của bạn.</p>
<h3>Quy tắc bảo mật</h3>
<p>Mọi thứ bạn dán vào công cụ AI đều được gửi ra ngoài công ty, và có thể được lưu lại. Trước khi dùng, hãy hỏi team công ty cho phép công cụ nào. Với công cụ chưa được duyệt, <strong>không</strong> dán:</p>
<ul>
<li>Mật khẩu, token, API key, nội dung tệp <code>.env</code>.</li>
<li>Dữ liệu khách hàng thật: tên, email, số điện thoại, số tài khoản.</li>
<li>Code và tài liệu nội bộ khi công ty chưa cho phép.</li>
</ul>
<p>Cần nhờ AI phân tích log thì <strong>che dữ liệu nhạy cảm trước</strong>, nhưng giữ lại phần AI cần: mã lỗi, đường dẫn, thời gian. Bài tập này viết đúng công cụ đó.</p>
{{ex0}}
<p class="note">Góc QA: dữ liệu test cũng nên giả ngay từ đầu (email dạng <code>...@sandemo.test</code>, tên "Nguyễn Kiểm Thử"). Dữ liệu giả thì dán vào đâu cũng không lo lộ.</p>`,
examples:[String.raw`const line = "token=abc123, again token=abc123";
console.log(line.replace("abc123", "***"));     // chỉ thay chỗ đầu
console.log(line.replaceAll("abc123", "***"));  // thay tất cả

console.log("abc".replaceAll("", "*"));         // bẫy: chuỗi rỗng chèn * khắp nơi`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>maskSecrets</code> thay lần lượt từng secret bằng <code>replaceAll</code>. Gán lại vào <code>result</code> mỗi vòng, vì chuỗi không bị sửa tại chỗ mà luôn trả về chuỗi mới.</li>
<li><code>if (!s) continue;</code> bỏ qua chuỗi rỗng. Thiếu dòng này, <code>replaceAll("", "***")</code> chèn dấu sao vào giữa mọi ký tự.</li>
<li>Mẫu email loại trừ dấu nháy <code>"</code>, nên trong log dạng JSON chỉ phần email bị thay, cấu trúc JSON vẫn giữ nguyên để AI đọc được.</li>
</ul>`,
examples:[String.raw`const log = '[10:41] POST /api/login {"email":"khach.hang@congty.vn","password":"Matkhau@2026"}\n[10:41] 401 Unauthorized\n[10:42] Retry với token=sk-test-8f2a91c0\n[10:42] Liên hệ hỗ trợ: an.nguyen@congty.vn';
const secrets = ["Matkhau@2026", "sk-test-8f2a91c0"];

function maskSecrets(text, secrets) {
  let result = text;
  for (const s of secrets) {
    if (!s) continue;
    result = result.replaceAll(s, "***");
  }
  return result;
}

function maskEmails(text) {
  return text.replace(/[^\s@"]+@[^\s@"]+\.[^\s@"]+/g, "[email]");
}

console.log(maskEmails(maskSecrets(log, secrets)));`]},
});
