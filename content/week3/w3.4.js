defineExercise({
  id: 'w3.4',
  title: 'Spread: sao chép và gộp',
  desc: `<p>Viết ba function dùng toán tử spread <code>...</code>, không sửa dữ liệu đầu vào:</p>
<ul>
<li><code>mergeSettings(defaults, overrides)</code>: trả về object mới, giá trị trong <code>overrides</code> đè lên <code>defaults</code>.</li>
<li><code>addItem(list, item)</code>: trả về mảng mới có thêm <code>item</code> ở cuối.</li>
<li><code>maxOf(...nums)</code>: trả về số lớn nhất bằng <code>Math.max</code>. Không có số nào thì trả về <code>null</code>.</li>
</ul>
<pre>mergeSettings({ lang: "ja", theme: "light" }, { theme: "dark" })
→ { lang: "ja", theme: "dark" }</pre>`,
  hints: [
    'Gộp object: <code>{ ...a, ...b }</code>. Key trùng thì object viết sau thắng.',
    'Mảng mới có thêm phần tử: <code>[...list, item]</code>. Không dùng <code>push</code> vì sẽ sửa mảng gốc.',
    '<code>Math.max(...nums)</code> trải mảng thành từng tham số. Kiểm tra <code>nums.length === 0</code> trước.'],
  starter: String.raw`const mergeSettings = (defaults, overrides) => {

};

const addItem = (list, item) => {

};

const maxOf = (...nums) => {

};

console.log(mergeSettings({ lang: "ja", theme: "light" }, { theme: "dark" }));
console.log(addItem(["7203"], "6758"));
console.log(maxOf(3, 9, 2));
`,
  tests: STRIP + String.raw`
test('mergeSettings đè đúng giá trị', () => expect(mergeSettings({ lang: "ja", theme: "light" }, { theme: "dark" })).toEqual({ lang: "ja", theme: "dark" }));
test('mergeSettings không sửa object gốc', () => { const d = { a: 1 }, o = { a: 2 }; mergeSettings(d, o); expect(d).toEqual({ a: 1 }); expect(o).toEqual({ a: 2 }); });
test('addItem trả về mảng mới', () => { const l = ["a"]; const r = addItem(l, "b"); expect(r).toEqual(["a", "b"]); expect(l, 'Mảng gốc đã bị sửa').toEqual(["a"]); expect(r !== l).toBe(true); });
test('maxOf(3, 9, 2) → 9', () => expect(maxOf(3, 9, 2)).toBe(9));
test('maxOf(-5, -1) → -1', () => expect(maxOf(-5, -1)).toBe(-1));
test('maxOf() → null', () => expect(maxOf()).toBe(null));
test('Có dùng spread', () => expect(/\.\.\.\s*\w/.test(__code)).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Spread với mảng</h3>
<p>Ba chấm <code>...</code> đặt trước một mảng sẽ "trải" các phần tử của nó ra.</p>
{{ex0}}
<h3>Spread với object</h3>
<p>Gộp object: key trùng thì object viết sau thắng. Đây là cách chuẩn để tạo bản sao có chỉnh sửa mà không đụng tới bản gốc.</p>
{{ex1}}
<h3>Cẩn thận: chỉ sao chép một lớp</h3>
<p>Spread chỉ sao chép lớp ngoài cùng. Object hay mảng lồng bên trong vẫn dùng chung.</p>
{{ex2}}
<h3>Spread hay rest?</h3>
<p>Cùng là <code>...</code>: đứng ở chỗ <strong>nhận</strong> giá trị (tham số, bên trái dấu <code>=</code>) thì là rest, gom lại. Đứng ở chỗ <strong>đưa</strong> giá trị ra (gọi hàm, tạo mảng/object) thì là spread, trải ra.</p>
<p class="note">Góc QA: tạo biến thể test data rất gọn: <code>const admin = { ...baseUser, role: "admin" }</code>.</p>`,
examples:[String.raw`const a = [1, 2];
const b = [3, 4];
console.log([...a, ...b]);        // gộp mảng
console.log([...a, 99]);          // thêm phần tử, mảng a không đổi
console.log(Math.max(...b));      // trải thành tham số: Math.max(3, 4)
const copy = [...a];
console.log(copy === a);          // false: mảng mới`,
String.raw`const baseUser = { name: "test01", role: "viewer", active: true };
const admin = { ...baseUser, role: "admin" };
console.log(admin);
console.log(baseUser);   // không đổi`,
String.raw`const original = { name: "A", tags: ["x"] };
const copy = { ...original };
copy.name = "B";          // không ảnh hưởng original
copy.tags.push("y");      // ảnh hưởng! tags là mảng dùng chung
console.log(original);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>{ ...defaults, ...overrides }</code>: trải <code>defaults</code> trước, <code>overrides</code> sau, key trùng thì cái sau đè. Đổi thứ tự là sai.</li>
<li><code>[...list, item]</code> tạo mảng mới, không động tới <code>list</code>. Bộ chấm kiểm tra cả việc mảng trả về khác mảng gốc.</li>
<li>Trong <code>maxOf</code>, <code>...nums</code> ở tham số là rest (gom lại), còn <code>Math.max(...nums)</code> là spread (trải ra). Cùng ký hiệu, hai vai trò ngược nhau.</li>
<li>Không kiểm tra mảng rỗng thì <code>Math.max()</code> trả về <code>-Infinity</code>.</li>
</ul>`,
examples:[String.raw`const mergeSettings = (defaults, overrides) => ({ ...defaults, ...overrides });
const addItem = (list, item) => [...list, item];
const maxOf = (...nums) => (nums.length === 0 ? null : Math.max(...nums));

console.log(mergeSettings({ lang: "ja", theme: "light" }, { theme: "dark" }));
console.log(addItem(["7203"], "6758"));
console.log(maxOf(3, 9, 2), maxOf());`]},
});
