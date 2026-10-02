defineExercise({
  id: 'w4.11',
  pw: true,
  title: 'Test Playwright đầu tiên',
  desc: `<p>Viết test tên <code>'mở trang đăng nhập'</code>:</p>
<ul>
<li>Mở trang <code>/login</code>.</li>
<li>Kiểm tra tiêu đề tab trình duyệt có chữ "Đăng nhập" bằng <code>toHaveTitle</code>.</li>
<li>Kiểm tra tiêu đề (heading) "Đăng nhập" hiển thị trên trang bằng <code>toBeVisible</code>.</li>
</ul>
<p>Bấm Chạy để xem trình duyệt mô phỏng thực hiện từng bước trong tab Trang web.</p>`,
  hints: [
    'Mọi lệnh làm việc với trang đều bất đồng bộ, nhớ <code>await</code>: <code>await page.goto(\'/login\');</code>',
    'Kiểm tra tiêu đề tab: <code>await expect(page).toHaveTitle(/Đăng nhập/);</code>',
    '<code>await expect(page.getByRole(\'heading\', { name: \'Đăng nhập\' })).toBeVisible();</code>'],
  starter: String.raw`import { test, expect } from '@playwright/test';

test('mở trang đăng nhập', async ({ page }) => {
  // 1. Mở trang /login

  // 2. Kiểm tra tiêu đề tab có chữ "Đăng nhập"

  // 3. Kiểm tra heading "Đăng nhập" hiển thị
});
`,
  tests: PWG + String.raw`
check('Có ít nhất 1 test', () => expect(__pw.tests.length > 0, 'Chưa có test nào').toBe(true));
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Mở trang /login', () => expect(__acts().some(a => a.type === 'goto' && /login/.test(String(a.arg))), 'Chưa thấy page.goto(\'/login\')').toBe(true));
check('Kiểm tra tiêu đề tab bằng toHaveTitle', () => expect(__okAssert(/^toHaveTitle$/), 'Chưa có expect(page).toHaveTitle(...) nào pass').toBe(true));
check('Kiểm tra heading bằng toBeVisible', () => expect(__asserts().some(a => a.pass && a.matcher === 'toBeVisible' && /heading|h1/.test(a.target)), 'Cần expect(page.getByRole(\'heading\', ...)).toBeVisible()').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Cấu trúc một file test</h3>
{{ex0}}
<ul>
<li><code>import { test, expect } from '@playwright/test'</code>: lấy hai hàm chính.</li>
<li><code>test('tên', async ({ page }) =&gt; { ... })</code>: khai báo một test. <code>{ page }</code> là destructuring (tuần 3): Playwright truyền vào một tab trình duyệt mới cho mỗi test.</li>
<li>Mỗi test bắt đầu từ trang trắng và dữ liệu sạch, các test không ảnh hưởng nhau.</li>
<li>Mọi thao tác đều bất đồng bộ nên phải có <code>await</code>. Sân tập sẽ báo lỗi nếu bạn quên.</li>
</ul>
<h3>Assertion tự chờ</h3>
<p><code>expect(locator).toBeVisible()</code> không kiểm tra một lần rồi thôi, mà thử lại liên tục trong tối đa 5 giây. Đây là "web-first assertion", lý do Playwright ít flaky hơn Selenium.</p>
<h3>TypeScript nhập môn</h3>
<p>TypeScript là JavaScript có thêm <strong>kiểu dữ liệu</strong>. Mọi thứ đã học vẫn dùng được; chỉ thêm phần mô tả kiểu sau dấu hai chấm:</p>
{{ex1}}
<p>Khi code, VS Code dùng kiểu để gợi ý và báo lỗi ngay (ví dụ truyền số vào chỗ cần chuỗi). Trong sân tập, TypeScript chỉ được dịch sang JavaScript để chạy, chưa kiểm tra kiểu đầy đủ như VS Code.</p>
<h3>Khi làm với project thật</h3>
{{ex2}}`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('trang đăng nhập có nút Đăng nhập', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
});`,
String.raw`const code: string = '7203';
const qty: number = 100;
const isBuy: boolean = true;
const codes: string[] = ['7203', '6758'];

function total(price: number, quantity: number): number {
  return price * quantity;
}
console.log(code, codes, total(2850, qty), isBuy);`,
{ run:false, code:String.raw`# Tạo project Playwright mới (chạy trong terminal)
npm init playwright@latest

# Chạy toàn bộ test
npx playwright test

# Chạy với giao diện để xem từng bước
npx playwright test --ui

# playwright.config.ts: khai báo địa chỉ trang để goto('/login') hoạt động
#   use: { baseURL: 'https://sandemo.test' }` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>toHaveTitle(/Đăng nhập/)</code> dùng regex nên chỉ cần tiêu đề tab có chứa "Đăng nhập". Tiêu đề thật là "Đăng nhập | Sàn Demo".</li>
<li>Kiểm tra heading bằng <code>getByRole</code> để chắc đây là tiêu đề, không phải nút cùng chữ.</li>
<li>Mỗi dòng đều có <code>await</code>. Thiếu <code>await</code> trước <code>expect</code>, test có thể kết thúc trước khi kiểm tra xong.</li>
</ul>`,
examples:[String.raw`import { test, expect } from '@playwright/test';

test('mở trang đăng nhập', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Đăng nhập/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
});`]},
});
