defineExercise({
  id: 'w2.6',
  title: 'Dấu ngoặc hợp lệ',
  desc: `<p>Viết <code>isBalanced(str)</code> kiểm tra các dấu ngoặc <code>()</code>, <code>[]</code>, <code>{}</code> có được mở và đóng đúng thứ tự không. Các ký tự khác bỏ qua.</p>
<pre>"([]{})"   → true
"a(b)c"    → true
"(]"       → false
"(()"      → false
"([)]"     → false
""         → true</pre>`,
  hints: [
    'Gặp ngoặc mở thì cất vào một mảng. Mảng này dùng như ngăn xếp (stack).',
    'Gặp ngoặc đóng thì lấy ngoặc mở gần nhất ra bằng <code>pop()</code> và kiểm tra có đúng cặp không. Tra cặp bằng object: <code>const pairs = { ")": "(", "]": "[", "}": "{" }</code>.',
    'Duyệt xong, mảng phải rỗng (không còn ngoặc mở nào chưa đóng): <code>return stack.length === 0</code>.'],
  starter: String.raw`function isBalanced(str) {

}

console.log(isBalanced("([]{})")); // true
console.log(isBalanced("([)]"));   // false
`,
  tests: String.raw`
test('"([]{})" → true', () => expect(isBalanced("([]{})")).toBe(true));
test('"{[()()]}" → true', () => expect(isBalanced("{[()()]}")).toBe(true));
test('"a(b)c" → true', () => expect(isBalanced("a(b)c")).toBe(true));
test('"" → true', () => expect(isBalanced("")).toBe(true));
test('"(]" → false', () => expect(isBalanced("(]")).toBe(false));
test('"(()" → false (còn ngoặc chưa đóng)', () => expect(isBalanced("(()")).toBe(false));
test('")(" → false (đóng trước khi mở)', () => expect(isBalanced(")(")).toBe(false));
test('"([)]" → false (đúng số lượng nhưng sai thứ tự)', () => expect(isBalanced("([)]")).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Ngăn xếp (stack)</h3>
<p>Ngăn xếp hoạt động như chồng đĩa: đĩa đặt vào sau cùng sẽ được lấy ra đầu tiên (vào sau, ra trước). Trong JavaScript chỉ cần một mảng với <code>push</code> và <code>pop</code>.</p>
{{ex0}}
<h3>Vì sao đếm số lượng là chưa đủ</h3>
<p><code>"([)]"</code> có đủ một cặp tròn, một cặp vuông, nhưng thứ tự đóng sai. Ngoặc đóng phải khớp với ngoặc mở <strong>gần nhất</strong>, và đó chính xác là thứ ngăn xếp lưu ở trên cùng.</p>
<h3>Bảng tra cứu bằng object</h3>
<p>Thay vì viết nhiều <code>if</code>, dùng object để tra ngoặc mở tương ứng:</p>
{{ex1}}
<p class="note">Góc QA: cùng ý tưởng này được dùng để kiểm tra JSON, HTML hay XML có đóng thẻ đúng không. Các công cụ lint và parser đều làm việc này.</p>`,
examples:[String.raw`const stack = [];
stack.push("(");
stack.push("[");
console.log(stack);          // ["(", "["]
console.log(stack.pop());    // "["  (vào sau, ra trước)
console.log(stack.pop());    // "("
console.log(stack.pop());    // undefined: ngăn xếp rỗng`,
String.raw`const pairs = { ")": "(", "]": "[", "}": "{" };
console.log(pairs[")"]);   // "("
console.log(pairs["a"]);   // undefined: không phải ngoặc đóng`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Ngoặc mở thì đẩy vào ngăn xếp. Ngoặc đóng thì lấy phần tử trên cùng ra, phải đúng là ngoặc mở tương ứng. Cuối cùng ngăn xếp phải rỗng.</p>
{{ex0}}
<h3>Chạy tay với "([)]"</h3>
${TRACE(['ch', 'hành động', 'stack'], [['(', 'push', '["("]'], ['[', 'push', '["(", "["]'], [')', 'pop ra "[", cần "(" → sai', '<code>false</code>']])}
<h3>Chạy tay với ")("</h3>
<p>Gặp <code>)</code> khi ngăn xếp rỗng: <code>pop()</code> trả về <code>undefined</code>, khác <code>"("</code>, nên trả về <code>false</code> luôn. Không cần viết riêng trường hợp ngăn xếp rỗng.</p>
<h3>Độ phức tạp</h3>
<p>O(n) thời gian, O(n) bộ nhớ cho ngăn xếp trong trường hợp toàn ngoặc mở.</p>
<h3>Lỗi hay gặp</h3>
<p>Chỉ đếm số ngoặc mở và đóng: <code>"([)]"</code> sẽ bị cho là đúng. Quên kiểm tra ngăn xếp rỗng ở cuối: <code>"(()"</code> sẽ bị cho là đúng.</p>`,
examples:[String.raw`function isBalanced(str) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of str) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (pairs[ch]) {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}

console.log(isBalanced("{[()()]}"));
console.log(isBalanced("([)]"));`]},
});
