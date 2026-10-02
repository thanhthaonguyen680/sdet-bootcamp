defineExercise({
  id: 'w5.2',
  ci: true,
  ciMode: 'terminal',
  defaultScenario: 'flaky',
  title: 'playwright.config.ts cho môi trường CI',
  files: { 'playwright.config.ts': String.raw`import { defineConfig, devices } from '@playwright/test';

// Máy CI luôn có biến môi trường CI=true.
// Hãy dùng process.env.CI để cấu hình khác nhau giữa máy của bạn và máy CI.
export default defineConfig({
  testDir: './tests',
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'https://staging.sandemo.test',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
`, 'package.json': PKG_BASE },
  open: 'playwright.config.ts',
  projectName: 'sandemo-e2e',
  runCommands: ['npx playwright test', 'CI=true npx playwright test', 'CI=true BASE_URL=https://sandemo.test npx playwright test --grep @smoke'],
  cmdHint: 'CI=true npx playwright test',
  desc: `<p>Cùng một bộ test nhưng máy CI khác máy cá nhân: không có màn hình, ít CPU, mạng chập chờn, và không ai ngồi xem. Sửa <code>playwright.config.ts</code> để:</p>
<ul>
<li><code>retries</code>: 2 lần trên CI, 0 lần ở máy cá nhân.</li>
<li><code>workers</code>: 2 trên CI, máy cá nhân để mặc định (<code>undefined</code>).</li>
<li><code>forbidOnly</code>: bật trên CI (chặn việc lỡ tay commit <code>test.only</code>).</li>
<li><code>reporter</code>: trên CI dùng <code>html</code> với <code>open: 'never'</code> kèm <code>github</code>; ở máy cá nhân dùng <code>list</code>.</li>
<li><code>use.baseURL</code>: lấy từ biến môi trường <code>BASE_URL</code>, không có thì dùng <code>https://staging.sandemo.test</code>.</li>
<li><code>trace: 'on-first-retry'</code> và <code>screenshot: 'only-on-failure'</code>.</li>
</ul>
<p>Kịch bản mặc định của bài là <strong>Có test flaky</strong>: bấm Chạy để thấy khác biệt giữa có và không có retry.</p>`,
  hints: [
    'Toán tử ba ngôi với biến môi trường: <code>retries: process.env.CI ? 2 : 0</code>.',
    '<code>!!process.env.CI</code> đổi chuỗi thành true/false. Reporter nhiều loại là mảng các mảng: <code>[[\'html\', { open: \'never\' }], [\'github\']]</code>.',
    '<code>baseURL: process.env.BASE_URL ?? \'https://staging.sandemo.test\'</code> (toán tử <code>??</code> ở tuần 1).'],
  tests: String.raw`
let ci, local;
check('Cấu hình đọc được ở cả hai môi trường', async () => { ci = await H.config({ CI: 'true', BASE_URL: 'https://prod.test' }); local = await H.config({}); expect(!!ci && !!local).toBe(true); });
check('retries: 2 trên CI, 0 ở máy cá nhân', () => { expect(ci.retries, 'retries trên CI').toBe(2); expect(local.retries || 0, 'retries ở máy cá nhân').toBe(0); });
check('workers: 2 trên CI, mặc định ở máy cá nhân', () => { expect(ci.workers, 'workers trên CI').toBe(2); expect(local.workers, 'workers ở máy cá nhân').toBe(undefined); });
check('forbidOnly chỉ bật trên CI', () => { expect(ci.forbidOnly, 'forbidOnly trên CI').toBe(true); expect(!!local.forbidOnly, 'forbidOnly ở máy cá nhân').toBe(false); });
check('reporter: html (open never) + github trên CI, list ở máy cá nhân', () => {
  const r = Array.isArray(ci.reporter) ? ci.reporter.map(x => Array.isArray(x) ? x : [x]) : [[ci.reporter]];
  const html = r.find(x => x[0] === 'html');
  expect(!!html && html[1] && html[1].open === 'never', 'Trên CI cần [\'html\', { open: \'never\' }]').toBe(true);
  expect(r.some(x => x[0] === 'github'), 'Trên CI cần thêm reporter github').toBe(true);
  const l = Array.isArray(local.reporter) ? local.reporter.map(x => Array.isArray(x) ? x[0] : x) : [local.reporter];
  expect(l.includes('list'), 'Ở máy cá nhân dùng reporter list').toBe(true);
});
check('baseURL lấy từ BASE_URL, có giá trị dự phòng', async () => { expect(ci.use.baseURL).toBe('https://prod.test'); expect(local.use && local.use.baseURL, 'Khi không có BASE_URL').toBe('https://staging.sandemo.test'); });
check('trace và screenshot', () => { expect(ci.use.trace).toBe('on-first-retry'); expect(ci.use.screenshot).toBe('only-on-failure'); });
check('Trên CI, test flaky được chạy lại và không làm đỏ pipeline', async () => { const r = await H.local('CI=true npx playwright test', { scenario: 'flaky' }); expect(r.code, r.out).toBe(0); expect(r.summary.flaky).toBe(1); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Máy CI khác máy của bạn thế nào</h3>
${TRACE(['', 'Máy cá nhân', 'Máy CI (GitHub Actions)'], [['Màn hình', 'có, xem được trình duyệt', 'không có (headless)'], ['CPU', 'nhiều nhân, ít việc khác', '4 nhân, dùng chung'], ['Người theo dõi', 'bạn ngồi xem', 'không ai'], ['Biến CI', 'không có', '<code>CI=true</code>'], ['Mạng', 'ổn định', 'đôi khi chậm']])}
<h3>Dùng process.env.CI để cấu hình theo môi trường</h3>
{{ex0}}
<ul>
<li><strong>retries</strong>: trên CI cho thử lại để test "flaky" (lúc pass lúc fail do mạng, thời gian) không làm đỏ cả pipeline. Playwright vẫn đánh dấu test đó là flaky trong báo cáo để bạn sửa sau.</li>
<li><strong>workers</strong>: giới hạn số test chạy song song để máy CI không quá tải.</li>
<li><strong>forbidOnly</strong>: nếu ai lỡ commit <code>test.only</code>, CI sẽ báo lỗi thay vì âm thầm chỉ chạy một test.</li>
<li><strong>reporter</strong>: HTML không tự mở (không có ai xem), thêm reporter <code>github</code> để lỗi hiện ngay trên giao diện pull request.</li>
<li><strong>trace on-first-retry</strong>: chỉ ghi trace khi thử lại, vừa đủ thông tin để debug vừa không tốn dung lượng.</li>
</ul>
<p>Trong terminal có thể đặt biến môi trường ngay trước lệnh: <code>CI=true npx playwright test</code>.</p>`,
examples:[{ run:false, code:String.raw`export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.BASE_URL ?? 'https://staging.sandemo.test',
  },
});` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Mọi khác biệt giữa hai môi trường dựa vào một biến duy nhất là <code>process.env.CI</code>, GitHub Actions luôn đặt biến này.</li><li>Chạy kịch bản flaky: ở máy cá nhân test đỏ ngay (để bạn thấy và sửa), trên CI được thử lại nên pipeline xanh nhưng vẫn báo "1 flaky".</li></ul>`,
examples:[String.raw`// @file: playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://staging.sandemo.test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});`]},
});
