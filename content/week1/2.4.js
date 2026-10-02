defineExercise({
  id: '2.4',
  title: 'Toán tử ?? và ?.',
  desc: `<p>Viết hai function:</p>
<ul>
<li><code>getTheme(user)</code> trả về <code>user.settings.theme</code>, nếu là <code>null/undefined</code> (hoặc không có <code>settings</code>) thì trả về <code>"default"</code>.</li>
<li><code>getAvatar(user)</code> trả về <code>user.profile.avatar</code> mà không bị lỗi khi thiếu <code>profile</code>.</li>
</ul>
<p>Thêm: tự thử thay <code>??</code> bằng <code>||</code> khi theme là <code>""</code> hoặc <code>0</code> và xem khác nhau thế nào.</p>`,
  hint: `<code>a ?? b</code> chỉ lấy <code>b</code> khi <code>a</code> là <code>null</code>/<code>undefined</code>. Còn <code>a || b</code> lấy <code>b</code> với mọi giá trị falsy, kể cả <code>""</code> và <code>0</code>.`,
  starter: String.raw`const user = { name: "Thao", settings: { theme: null } };

function getTheme(user) {
  // Trả về theme, nếu null/undefined thì "default"
}

function getAvatar(user) {
  // Trả về avatar mà không bị lỗi khi thiếu profile
}

console.log(getTheme(user));  // default
console.log(getAvatar(user)); // undefined
`,
  tests: String.raw`
test('theme null → "default"', () => expect(getTheme({ settings: { theme: null } })).toBe("default"));
test('theme "dark" → "dark"', () => expect(getTheme({ settings: { theme: "dark" } })).toBe("dark"));
test('theme "" vẫn giữ nguyên ""', () => expect(getTheme({ settings: { theme: "" } }), 'Chuỗi rỗng bị thay thành giá trị khác, bạn có đang dùng || không?').toBe(""));
test('Không có settings → "default"', () => expect(getTheme({})).toBe("default"));
test('getAvatar khi thiếu profile → undefined, không lỗi', () => expect(getAvatar({ name: "A" })).toBe(undefined));
test('getAvatar khi có avatar', () => expect(getAvatar({ profile: { avatar: "a.png" } })).toBe("a.png"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Optional chaining <code>?.</code></h3>
<p>Truy cập thuộc tính của <code>null</code> hoặc <code>undefined</code> sẽ gây lỗi và dừng chương trình. <code>?.</code> dừng lại an toàn và trả về <code>undefined</code> thay vì báo lỗi.</p>
${ANAT(['res.data.user', 'Đi lần lượt vào từng tầng của object: <code>res</code> → <code>data</code> → <code>user</code>. Ở ví dụ dưới, <code>user</code> là <code>null</code>.'], ['?.', '"Nếu phía trước là null/undefined thì dừng và trả về undefined, còn không thì đi tiếp". Thay cho dấu chấm thường ở chỗ có thể bị thiếu.'], ['name', 'Thuộc tính muốn lấy. Chỉ được đọc khi <code>user</code> có giá trị.'])}
{{ex0}}
<h3>Nullish coalescing <code>??</code></h3>
<p><code>a ?? b</code> trả về <code>b</code> chỉ khi <code>a</code> là <code>null</code> hoặc <code>undefined</code>. Còn <code>a || b</code> trả về <code>b</code> với mọi giá trị falsy, kể cả <code>0</code> và <code>""</code>.</p>
${ANAT(['qty', 'Giá trị cần kiểm tra.'], ' ', ['??', '"Nếu vế trái là null hoặc undefined thì dùng vế phải". 0, "" hay false vẫn được giữ nguyên.'], ' ', ['10', 'Giá trị dự phòng.'])}
{{ex1}}
<h3>Kết hợp cả hai</h3>
{{ex2}}
<p class="note">Góc QA: response API thường có field tùy chọn. Dùng <code>?.</code> để code test không bị crash khi thiếu field, và dùng <code>??</code> để không vô tình coi <code>0</code> là thiếu dữ liệu.</p>`,
examples:[String.raw`const res = { data: { user: null } };
// console.log(res.data.user.name); // lỗi: Cannot read properties of null
console.log(res.data.user?.name);   // undefined, không lỗi
console.log(res.meta?.page?.size);  // undefined`,
String.raw`const qty = 0;
console.log(qty || 10);  // 10  (0 bị coi là "không có")
console.log(qty ?? 10);  // 0   (chỉ thay khi null/undefined)

const note = "";
console.log(note || "N/A");  // "N/A"
console.log(note ?? "N/A");  // ""`,
String.raw`const config = { display: {} };
const lang = config.display?.lang ?? "ja";
console.log(lang);  // "ja"`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>user.settings?.theme</code>: nếu <code>settings</code> là <code>null/undefined</code> thì dừng lại và trả về <code>undefined</code> thay vì báo lỗi.</li>
<li><code>?? "default"</code> chỉ thay khi vế trái là <code>null/undefined</code>, nên <code>""</code> vẫn được giữ nguyên.</li>
</ul>
<h3>?? khác || thế nào</h3>
{{ex1}}
<p>Với dữ liệu mà <code>0</code>, <code>""</code>, <code>false</code> là giá trị hợp lệ (số lượng, giá, cờ bật tắt), dùng <code>??</code>.</p>`,
examples:[String.raw`const user = { name: "Thao", settings: { theme: null } };

function getTheme(user) {
  return user.settings?.theme ?? "default";
}

function getAvatar(user) {
  return user.profile?.avatar;
}

console.log(getTheme(user));  // default
console.log(getAvatar(user)); // undefined`,
String.raw`const theme = "";
console.log(theme ?? "default"); // ""
console.log(theme || "default"); // "default"

const qty = 0;
console.log(qty ?? 100); // 0
console.log(qty || 100); // 100`]},
});
