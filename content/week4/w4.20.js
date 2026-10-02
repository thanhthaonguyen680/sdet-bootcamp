defineExercise({
  id: 'w4.20',
  pw: true,
  exports: ['OrderPage'],
  title: 'Dữ liệu test trong tệp JSON',
  desc: `<p>Tách dữ liệu ra khỏi code: mỗi lệnh trong <code>test-data/orders.json</code> trở thành một test.</p>
<ul>
<li><code>test-data/orders.json</code>: ít nhất <strong>3</strong> lệnh, có cả mua và bán. Mỗi lệnh gồm <code>code</code>, <code>side</code> (<code>"buy"</code> hoặc <code>"sell"</code>), <code>qty</code> và <code>expected</code> (câu thông báo mong đợi, ví dụ <code>"Đặt lệnh thành công: BÁN 6758 x200"</code>).</li>
<li><code>pages/OrderPage.ts</code>: hoàn thiện <code>placeOrder(order: OrderData)</code> (chọn mã, chọn loại lệnh, điền khối lượng, đồng ý, bấm đặt lệnh).</li>
<li><code>tests/order.spec.ts</code>: <code>import orders from '../test-data/orders.json'</code> rồi sinh một test cho mỗi lệnh. Không viết cứng mã cổ phiếu trong tệp test.</li>
</ul>
<p class="note">Sân tập hiểu <code>import tenBien from '.../ten-tep.json'</code>: nội dung của phần <code>// @file: .../ten-tep.json</code> được gán vào biến đó, giống Playwright thật khi bật <code>resolveJsonModule</code>.</p>`,
  hints: [
    'JSON khác object JavaScript: key và chuỗi bắt buộc dùng nháy kép, không có dấu phẩy ở phần tử cuối, không có comment.',
    'Chọn loại lệnh theo dữ liệu: <code>await this.page.getByLabel(order.side === \'buy\' ? \'Mua\' : \'Bán\').check();</code> Số phải đổi sang chuỗi khi <code>fill</code>: <code>String(order.qty)</code>.',
    'Tên test lấy từ dữ liệu để không trùng: <code>test(\'đặt lệnh \' + o.side + \' \' + o.code, async ({ page }) =&gt; { ... })</code>.'],
  starter: String.raw`// @file: test-data/orders.json
[
  { "code": "7203", "side": "buy", "qty": 100, "expected": "Đặt lệnh thành công: MUA 7203 x100" }
]

// @file: types/order.ts
export interface OrderData {
  code: string;
  side: 'buy' | 'sell';
  qty: number;
  expected: string;
}

// @file: pages/OrderPage.ts
import { Page, Locator } from '@playwright/test';
import { OrderData } from '../types/order';

export class OrderPage {
  readonly toast: Locator;

  constructor(private page: Page) {
    this.toast = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/order');
  }

  async placeOrder(order: OrderData) {

  }
}

// @file: tests/order.spec.ts
import { test, expect } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import orders from '../test-data/orders.json';

// Sinh một test cho mỗi lệnh trong orders
`,
  tests: PWG + SECG + String.raw`
check('Có đủ các tệp', () => { for (const f of ['orders.json', 'pages/OrderPage', '.spec.ts']) expect(__hasFile(f), 'Thiếu tệp ' + f).toBe(true); });
let __orders = null;
check('orders.json hợp lệ, có ít nhất 3 lệnh gồm cả mua và bán', () => {
  const raw = Object.entries(__sections).find(([k]) => k.endsWith('orders.json'));
  try { __orders = JSON.parse(raw[1]); } catch (e) { expect(false, 'orders.json chưa phải JSON hợp lệ: ' + e.message).toBe(true); }
  expect(Array.isArray(__orders) && __orders.length >= 3, 'Cần ít nhất 3 lệnh').toBe(true);
  expect(__orders.some(o => o.side === 'buy') && __orders.some(o => o.side === 'sell'), 'Cần có cả buy và sell').toBe(true);
});
check('Mỗi lệnh sinh ra một test', () => expect(__pw.tests.length, 'Số test phải bằng số lệnh trong orders.json').toBe((__orders || []).length));
check('Tất cả test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Tệp test không viết cứng mã cổ phiếu', () => expect(/['"]\d{4}['"]/.test(__sec('.spec.ts')), 'Tệp test vẫn có mã cổ phiếu viết cứng, dữ liệu phải lấy từ orders.json').toBe(false));
check('Mọi test đều kiểm tra thông báo', () => expect(__pw.tests.every(t => t.asserts.some(a => a.pass && /^(toHaveText|toContainText)$/.test(a.matcher)))).toBe(true));
check('Test phát hiện được bug "luôn đặt lệnh mua"', async () => { const r = await H.rerun('order-side-ignored'); expect(r.some(t => t.status === 'failed')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tách dữ liệu khỏi code</h3>
<p>Ở bài 13, dữ liệu nằm ngay trong tệp test. Khi có vài chục test case, nên chuyển dữ liệu sang tệp JSON:</p>
<ul>
<li>BA hoặc QA manual đọc và bổ sung được mà không cần biết TypeScript.</li>
<li>Thêm một test case chỉ là thêm một dòng dữ liệu.</li>
<li>Cùng một bộ test chạy được với nhiều bộ dữ liệu (staging, UAT) bằng cách đổi tệp.</li>
</ul>
<h3>JSON khác object JavaScript ở đâu</h3>
${TRACE(['Object JavaScript', 'JSON'], [["<code>{ code: '7203' }</code>", '<code>{ "code": "7203" }</code>: key và chuỗi phải dùng nháy kép'], ['cho phép dấu phẩy cuối <code>[1, 2,]</code>', 'không cho phép'], ['có comment <code>// ...</code>', 'không có comment'], ['có <code>undefined</code>, hàm', 'chỉ có chuỗi, số, true/false, null, mảng, object']])}
<h3>Import tệp JSON</h3>
{{ex0}}
<p>Trong project thật cần bật <code>"resolveJsonModule": true</code> trong <code>tsconfig.json</code> (project tạo bằng <code>npm init playwright</code> thường đã có sẵn).</p>
<p class="note">Góc QA: nếu team đang quản lý test case bằng Excel, có thể xuất sang CSV rồi đọc bằng thư viện <code>csv-parse</code> theo đúng cách này. Bảng Excel trở thành nguồn dữ liệu trực tiếp cho automation.</p>`,
examples:[L(
'// @file: test-data/stocks.json',
'[',
'  { "code": "7203", "name": "Toyota" },',
'  { "code": "7974", "name": "Nintendo" }',
']',
'',
'// @file: tests/stocks.spec.ts',
'import stocks from \'../test-data/stocks.json\';',
'',
'for (const s of stocks) {',
'  test(\'bảng giá có \' + s.name, async ({ page }) => {',
'    await page.goto(\'/dashboard\');',
'    await expect(page.getByRole(\'row\', { name: s.code })).toContainText(s.name);',
'  });',
'}')]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>placeOrder</code> nhận nguyên object <code>OrderData</code>: sau này thêm trường (giá đặt, loại lệnh giới hạn) chỉ sửa interface và page object, chữ ký hàm không đổi.</li>
<li>Câu thông báo mong đợi nằm trong dữ liệu, nên mỗi test case tự mang theo kết quả mong đợi của nó, đúng như một dòng trong bảng test case.</li>
<li>Tên test ghép từ dữ liệu, báo cáo sẽ hiện rõ lệnh nào fail.</li>
</ul>`,
examples:[String.raw`// @file: test-data/orders.json
[
  { "code": "7203", "side": "buy", "qty": 100, "expected": "Đặt lệnh thành công: MUA 7203 x100" },
  { "code": "6758", "side": "sell", "qty": 200, "expected": "Đặt lệnh thành công: BÁN 6758 x200" },
  { "code": "9984", "side": "buy", "qty": 300, "expected": "Đặt lệnh thành công: MUA 9984 x300" }
]

// @file: types/order.ts
export interface OrderData {
  code: string;
  side: 'buy' | 'sell';
  qty: number;
  expected: string;
}

// @file: pages/OrderPage.ts
import { Page, Locator } from '@playwright/test';
import { OrderData } from '../types/order';

export class OrderPage {
  readonly toast: Locator;

  constructor(private page: Page) {
    this.toast = page.getByRole('status');
  }

  async goto() {
    await this.page.goto('/order');
  }

  async placeOrder(order: OrderData) {
    await this.page.getByLabel('Mã cổ phiếu').selectOption(order.code);
    await this.page.getByLabel(order.side === 'buy' ? 'Mua' : 'Bán').check();
    await this.page.getByLabel('Khối lượng').fill(String(order.qty));
    await this.page.getByLabel('Tôi đồng ý').check();
    await this.page.getByRole('button', { name: 'Đặt lệnh' }).click();
  }
}

// @file: tests/order.spec.ts
import { test, expect } from '@playwright/test';
import { OrderPage } from '../pages/OrderPage';
import orders from '../test-data/orders.json';

for (const order of orders) {
  test('đặt lệnh ' + order.side + ' ' + order.code, async ({ page }) => {
    const orderPage = new OrderPage(page);
    await orderPage.goto();
    await orderPage.placeOrder(order);
    await expect(orderPage.toast).toContainText(order.expected);
  });
}`]},
});
