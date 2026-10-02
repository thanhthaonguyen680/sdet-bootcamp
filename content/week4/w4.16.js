defineExercise({
  id: 'w4.16',
  pw: true,
  title: 'TypeScript: interface và test theo dữ liệu',
  desc: `<p>Thay vì viết 3 test gần giống nhau, hãy mô tả dữ liệu bằng TypeScript rồi sinh test tự động:</p>
<ul>
<li>Khai báo <code>interface LoginCase</code> gồm <code>name</code>, <code>email</code>, <code>password</code>, <code>message</code> (đều là <code>string</code>).</li>
<li>Tạo mảng <code>cases: LoginCase[]</code> với 3 trường hợp: bỏ trống email, bỏ trống mật khẩu, sai mật khẩu.</li>
<li>Dùng <code>for...of</code> để tạo một test cho mỗi trường hợp, mỗi test kiểm tra đúng thông báo lỗi.</li>
</ul>
<pre>Bỏ trống email       → "Vui lòng nhập email"
Bỏ trống mật khẩu    → "Vui lòng nhập mật khẩu"
Sai mật khẩu         → "Email hoặc mật khẩu không đúng"</pre>`,
  hints: [
    '<code>interface LoginCase { name: string; email: string; password: string; message: string; }</code>',
    'Gọi <code>test(...)</code> bên trong vòng lặp. Tên test phải khác nhau, ví dụ <code>test(c.name, async ({ page }) =&gt; { ... })</code>.',
    'Điền chuỗi rỗng <code>fill(\'\')</code> vẫn hợp lệ, không cần viết <code>if</code> riêng cho trường hợp bỏ trống.'],
  starter: String.raw`import { test, expect } from '@playwright/test';

// 1. Khai báo interface LoginCase


// 2. Mảng dữ liệu
const cases: LoginCase[] = [

];

// 3. Sinh test cho từng trường hợp
`,
  tests: PWG + String.raw`
check('Có khai báo interface', () => expect(/\binterface\s+\w+/.test(__code)).toBe(true));
check('Sinh ít nhất 3 test', () => expect(__pw.tests.length >= 3, 'Mới có ' + __pw.tests.length + ' test').toBe(true));
check('Tên các test không trùng nhau', () => expect(new Set(__pw.tests.map(t => t.name)).size === __pw.tests.length).toBe(true));
check('Test được tạo bằng vòng lặp', () => expect(/for\s*\(\s*(const|let)\s+\w+\s+of\b|\.forEach\s*\(/.test(__code)).toBe(true));
check('Tất cả test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Mỗi test kiểm tra thông báo lỗi', () => expect(__pw.tests.every(t => t.asserts.some(a => a.pass && /^(toHaveText|toContainText)$/.test(a.matcher)))).toBe(true));
check('Test phát hiện được bug "sai nội dung thông báo"', async () => { const r = await H.rerun('login-error-text'); expect(r.some(t => t.status === 'failed')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>interface: mô tả hình dạng dữ liệu</h3>
{{ex0}}
<p>Khai báo <code>cases: LoginCase[]</code> nghĩa là mảng các phần tử có đúng hình dạng đó. Trong VS Code, thiếu một trường hay gõ sai tên trường sẽ bị gạch đỏ ngay.</p>
<h3>Test theo dữ liệu (data-driven)</h3>
<p>Gọi <code>test()</code> trong vòng lặp để sinh nhiều test từ một mảng dữ liệu. Thêm test case mới chỉ cần thêm một dòng dữ liệu.</p>
{{ex1}}
<p class="note">Góc QA: đây là cách chuyển bảng test case trong Excel thành code. Cột "Dữ liệu vào" và "Kết quả mong đợi" trở thành các trường của interface.</p>`,
examples:[String.raw`interface Stock {
  code: string;
  name: string;
  price: number;
}

const stocks: Stock[] = [
  { code: '7203', name: 'Toyota Motor', price: 2850 },
  { code: '6758', name: 'Sony Group', price: 13200 },
];
for (const s of stocks) console.log(s.code, s.name, s.price);`,
String.raw`const codes: string[] = ['7203', '6758', '9984'];

for (const code of codes) {
  test('mở trang đặt lệnh cho mã ' + code, async ({ page }) => {
    await page.goto('/order?code=' + code);
    await expect(page.getByLabel('Mã cổ phiếu')).toHaveValue(code);
  });
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Interface mô tả một dòng test case; mảng <code>cases</code> là cả bảng test case.</li>
<li>Vòng <code>for...of</code> chạy khi file được nạp, gọi <code>test()</code> 3 lần, sinh ra 3 test độc lập với 3 tên khác nhau trong báo cáo.</li>
<li>Test fail thì tên test cho biết ngay trường hợp nào hỏng, tốt hơn nhiều so với một test lớn kiểm tra cả 3 trường hợp.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

interface LoginCase {
  name: string;
  email: string;
  password: string;
  message: string;
}

const cases: LoginCase[] = [
  { name: 'bỏ trống email', email: '', password: 'Demo@123', message: 'Vui lòng nhập email' },
  { name: 'bỏ trống mật khẩu', email: 'thao@sandemo.test', password: '', message: 'Vui lòng nhập mật khẩu' },
  { name: 'sai mật khẩu', email: 'thao@sandemo.test', password: 'sai', message: 'Email hoặc mật khẩu không đúng' },
];

for (const c of cases) {
  test('đăng nhập lỗi: ' + c.name, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(c.email);
    await page.getByLabel('Mật khẩu').fill(c.password);
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page.getByRole('alert')).toHaveText(c.message);
  });
}`]},
});
