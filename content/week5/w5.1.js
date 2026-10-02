defineExercise({
  id: 'w5.1',
  ci: true,
  ciMode: 'terminal',
  title: 'Scripts trong package.json',
  files: { 'package.json': String.raw`{
  "name": "sandemo-e2e",
  "version": "1.0.0",
  "private": true,
  "scripts": {},
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.7.0",
    "typescript": "^5.6.0"
  }
}
`, 'playwright.config.ts': String.raw`import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: { baseURL: 'https://staging.sandemo.test' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
` },
  open: 'package.json',
  projectName: 'sandemo-e2e',
  runCommands: ['npm test', 'npm run test:smoke', 'npm run test:chromium', 'npm run test:smoke -- --project=firefox'],
  cmdHint: 'npm run test:smoke',
  desc: `<p>Project <code>sandemo-e2e</code> chứa các test của Sàn Demo (14 test cho mỗi trình duyệt, 3 test có tag <code>@smoke</code>). Pipeline CI sẽ không gõ lệnh dài dòng mà gọi các <strong>script</strong> khai báo trong <code>package.json</code>. Hãy thêm vào <code>"scripts"</code>:</p>
<ul>
<li><code>test</code>: chạy toàn bộ test.</li>
<li><code>test:smoke</code>: chỉ chạy test có tag <code>@smoke</code>.</li>
<li><code>test:chromium</code>: chỉ chạy project <code>chromium</code>.</li>
<li><code>test:headed</code>: chạy có mở cửa sổ trình duyệt.</li>
<li><code>report</code>: mở báo cáo HTML.</li>
</ul>
<p>Bấm <strong>Chạy</strong> để chạy thử các lệnh mẫu, hoặc gõ lệnh vào terminal trong tab Pipeline.</p>`,
  hints: [
    'Mỗi script là một cặp <code>"tên": "lệnh"</code>. Bên trong script không cần <code>npx</code>: <code>"test": "playwright test"</code>.',
    'Tùy chọn cần dùng: <code>--grep @smoke</code>, <code>--project=chromium</code>, <code>--headed</code>. Mở báo cáo: <code>playwright show-report</code>.',
    'Nhớ JSON không có dấu phẩy sau cặp cuối cùng. Truyền thêm tùy chọn cho script bằng <code>--</code>: <code>npm run test:smoke -- --project=firefox</code>.'],
  tests: String.raw`
check('package.json hợp lệ và có scripts', () => { const p = H.pkg(); expect(!!(p && p.scripts), 'Thiếu "scripts"').toBe(true); for (const k of ['test', 'test:smoke', 'test:chromium', 'test:headed', 'report']) expect(typeof p.scripts[k], 'Thiếu script "' + k + '"').toBe('string'); });
check('npm test chạy đủ 28 test (14 test × 2 trình duyệt)', async () => { const r = await H.local('npm test'); expect(r.code, r.out).toBe(0); expect(r.summary && r.summary.total).toBe(28); });
check('npm run test:smoke chỉ chạy 6 test @smoke', async () => { const r = await H.local('npm run test:smoke'); expect(r.code, r.out).toBe(0); expect(r.summary && r.summary.total, 'Số test chạy').toBe(6); });
check('npm run test:chromium chỉ chạy chromium', async () => { const r = await H.local('npm run test:chromium'); expect(r.code, r.out).toBe(0); expect(r.summary.projects).toEqual(['chromium']); expect(r.summary.total).toBe(14); });
check('test:headed có --headed, report dùng show-report', () => { const s = H.pkg().scripts; expect(/--headed/.test(s['test:headed']), 'test:headed cần --headed').toBe(true); expect(/show-report/.test(s.report), 'report cần playwright show-report').toBe(true); });
check('Truyền thêm tùy chọn qua --', async () => { const r = await H.local('npm run test:smoke -- --project=firefox'); expect(r.summary && r.summary.total, 'npm run test:smoke -- --project=firefox phải chạy 3 test').toBe(3); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 5: CI/CD là gì</h3>
<p><strong>CI</strong> (Continuous Integration, tích hợp liên tục): mỗi khi có người đưa code lên, một máy chủ tự động lấy code về, cài đặt, chạy kiểm tra và báo kết quả. <strong>CD</strong> (Continuous Delivery/Deployment): nếu mọi kiểm tra đều qua, tự động đưa bản mới lên môi trường staging hoặc production.</p>
<pre>code mới → lấy code → cài đặt → typecheck → chạy test → báo cáo → (deploy)
           └──────────────── pipeline ────────────────┘</pre>
<p>Với SDET, pipeline là nơi bộ test automation thực sự phát huy giá trị: test chạy tự động cho <strong>mọi</strong> thay đổi, không phụ thuộc ai nhớ bấm chạy. Test hay nhưng không nằm trong pipeline thì gần như không ai chạy.</p>
<h3>Repo mô phỏng của tuần này</h3>
<p>Tuần này làm việc với repo <code>thao/sandemo-e2e</code> chứa các test cho Sàn Demo ở tuần 4: 14 test cho mỗi trình duyệt, trong đó 3 test có tag <code>@smoke</code> và 7 test có tag <code>@auth</code>. Trình duyệt trong trang không chạy được máy CI thật, nên toàn bộ GitHub Actions, npm và Playwright được mô phỏng với hành vi và thông báo lỗi giống thật. Trong tab <strong>Pipeline</strong> có thể chọn <em>kịch bản code</em> (ổn định, có test flaky, có bug...) để xem pipeline phản ứng thế nào.</p>
<h3>Bước 1: scripts trong package.json</h3>
<p>Mục <code>"scripts"</code> đặt tên ngắn cho các lệnh hay dùng. Cả người và pipeline đều gọi <code>npm run tên</code>, khi cần đổi lệnh chỉ sửa một chỗ.</p>
{{ex0}}
${TRACE(['Gõ', 'Thực chất chạy'], [['<code>npm test</code>', 'script "test" (lệnh đặc biệt, không cần run)'], ['<code>npm run test:smoke</code>', 'script "test:smoke"'], ['<code>npm run test:smoke -- --project=firefox</code>', 'script "test:smoke" kèm thêm <code>--project=firefox</code>'], ['<code>npm run</code>', 'liệt kê mọi script']])}
<p class="note">Góc QA: bảng so sánh tên gọi ở các công cụ CI phổ biến: GitHub Actions gọi là <em>workflow / job / step</em>; GitLab CI gọi là <em>pipeline / job / script</em> trong tệp <code>.gitlab-ci.yml</code>; Jenkins gọi là <em>pipeline / stage / step</em> trong <code>Jenkinsfile</code>. Hiểu một công cụ thì chuyển sang công cụ khác rất nhanh.</p>`,
examples:[{ run:false, code:String.raw`{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "lint": "eslint ."
  }
}` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Trong script không cần <code>npx</code>, vì npm tự thêm thư mục <code>node_modules/.bin</code> vào đường dẫn.</li><li><code>npm run test:smoke -- --project=firefox</code>: mọi thứ sau <code>--</code> được nối vào cuối lệnh của script, nên không cần tạo thêm script cho từng tổ hợp.</li></ul>`,
examples:[String.raw`// @file: package.json
{
  "name": "sandemo-e2e",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:chromium": "playwright test --project=chromium",
    "test:headed": "playwright test --headed",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.7.0",
    "typescript": "^5.6.0"
  }
}`]},
});
