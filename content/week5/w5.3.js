defineExercise({
  id: 'w5.3',
  ci: true,
  title: 'Workflow GitHub Actions đầu tiên',
  files: { [WFP]: String.raw`# Workflow đầu tiên: chạy test mỗi khi có code mới.
# Yêu cầu:
#   - Tên workflow: Playwright Tests
#   - Chạy khi push lên nhánh main và khi có pull request vào main
#   - Một job tên "test" chạy trên ubuntu-latest
#   - Các bước (bước nào cũng có name):
#       1. Lấy mã nguồn (actions/checkout@v4)
#       2. Cài Node.js 20, bật cache npm (actions/setup-node@v4)
#       3. Cài thư viện bằng npm ci
#       4. Cài trình duyệt chromium kèm thư viện hệ thống
#       5. Chạy test
`, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_FALLBACK },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Viết workflow đầu tiên trong <code>.github/workflows/playwright.yml</code> theo yêu cầu ghi trong tệp.</p>
<p>Sau đó mở tab <strong>Pipeline</strong>, thử lần lượt các sự kiện: push lên main, push lên nhánh feature, pull request vào main. Để ý workflow nào chạy, workflow nào không, và vì sao.</p>
<p class="note">YAML dùng <strong>khoảng trắng</strong> để thể hiện cấp lồng nhau (không dùng Tab). Phím Tab trong editor đã được đổi thành 2 khoảng trắng.</p>`,
  hints: [
    '<code>on:</code> có hai sự kiện <code>push</code> và <code>pull_request</code>, mỗi sự kiện có <code>branches: [main]</code>.',
    'Mỗi bước là một phần tử danh sách bắt đầu bằng <code>- name: ...</code>, dòng dưới là <code>uses:</code> (dùng action có sẵn) hoặc <code>run:</code> (chạy lệnh). Tham số cho action đặt trong <code>with:</code>.',
    'Cài trình duyệt: <code>npx playwright install --with-deps chromium</code>. Xem bài giảng có một workflow hoàn chỉnh để đối chiếu cấu trúc.'],
  tests: CIG + String.raw`
let wf;
check('Tệp YAML hợp lệ, có name, on, jobs.test', async () => { wf = await H.yaml('` + WFP + String.raw`'); expect(wf.name, 'name').toBe('Playwright Tests'); expect(!!(wf.jobs && wf.jobs.test), 'Cần job tên "test"').toBe(true); expect(wf.jobs.test['runs-on']).toBe('ubuntu-latest'); });
check('push lên main: pipeline xanh, chạy đủ 14 test', async () => { const run = __ok(await H.run('push-main')); __green(run); const s = __sum(run); expect(s.length > 0, 'Chưa có bước nào chạy test').toBe(true); expect(s[0].total).toBe(14); });
check('Pull request vào main cũng kích hoạt', async () => { const r = await H.run('pr-main'); expect(r.triggered.length, 'Pull request vào main chưa kích hoạt workflow').toBe(1); });
check('Push lên nhánh feature không kích hoạt', async () => { const r = await H.run('push-feature'); expect(r.triggered.length, 'Workflow đang chạy cả khi push lên feature/login, hãy giới hạn branches').toBe(0); });
check('Dùng npm ci, cài Node 20 và bật cache npm', async () => { const run = (await H.run('push-main')).triggered[0]; expect(run.jobs[0].npm, 'Hãy dùng npm ci').toBe('ci'); const node = __steps(wf).find(s => String(s.uses || '').startsWith('actions/setup-node')); expect(!!node && Number(node.with && node.with['node-version']) >= 20, 'Cần setup-node với node-version 20').toBe(true); expect(node.with.cache, 'Cần cache: npm').toBe('npm'); });
check('Cài trình duyệt kèm --with-deps', () => expect(__steps(wf).some(s => /playwright install/.test(s.run || '') && /--with-deps/.test(s.run)), 'Cần npx playwright install --with-deps ...').toBe(true));
check('Bước nào cũng có name', () => expect(__steps(wf).every(s => s.name), 'Có bước chưa đặt name').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Luồng làm việc với Git và pull request</h3>
<pre>tạo nhánh feature/login → commit → push → mở pull request vào main
     → CI tự chạy test trên PR → review → merge vào main → CI chạy lại trên main</pre>
<p>Admin thường bật <strong>branch protection</strong> cho main: bắt buộc pipeline xanh mới được merge. Đó là lúc bộ test automation trở thành "người gác cổng" cho chất lượng.</p>
<h3>Cấu trúc một workflow</h3>
${TRACE(['Thành phần', 'Ý nghĩa'], [['workflow', 'một tệp .yml trong <code>.github/workflows/</code>'], ['on', 'sự kiện nào kích hoạt (push, pull_request, schedule...)'], ['job', 'một nhóm bước chạy trên <strong>một máy riêng</strong>'], ['runs-on', 'loại máy: ubuntu-latest, windows-latest, macos-latest'], ['step', 'một bước: dùng action có sẵn (<code>uses</code>) hoặc chạy lệnh (<code>run</code>)'], ['action', 'bước đóng gói sẵn do người khác viết, ví dụ actions/checkout']])}
{{ex0}}
<p>Bấm <strong>Chạy ví dụ</strong> để chạy workflow này với sự kiện đang chọn trong tab Pipeline. Thử bỏ bước checkout hay npm ci để xem lỗi gì xuất hiện.</p>
<h3>YAML nhập môn</h3>
<ul>
<li><code>key: value</code>. Cấp lồng nhau thể hiện bằng thụt lề (khoảng trắng, không dùng Tab).</li>
<li>Danh sách: mỗi phần tử bắt đầu bằng <code>- </code>, hoặc viết gọn <code>[a, b]</code>.</li>
<li>Chuỗi nhiều dòng: <code>run: |</code> rồi viết các dòng thụt vào bên dưới.</li>
<li><code>#</code> là comment.</li>
</ul>`,
examples:[yml(String.raw`name: Kiểm tra nhanh

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Lấy mã nguồn
        uses: actions/checkout@v4

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Cài thư viện
        run: npm ci

      - name: Cài chromium
        run: npx playwright install --with-deps chromium

      - name: Chạy test smoke
        run: npm run test:smoke`)]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li><code>checkout</code> phải đứng đầu: máy CI ban đầu trống, chưa có code.</li><li><code>cache: npm</code> lưu thư mục thư viện giữa các lần chạy; từ lần thứ hai, <code>npm ci</code> nhanh hơn nhiều (thử chạy pipeline hai lần để thấy).</li><li><code>npm ci</code> cài đúng phiên bản trong <code>package-lock.json</code>, bảo đảm máy CI giống hệt máy dev.</li><li>Bộ lọc <code>branches: [main]</code> khiến push lên nhánh feature không chạy, còn PR vào main thì chạy.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_BASE }]},
});
