/* Mẫu package.json, playwright.config.ts và workflow dùng chung cho các bài tuần 5. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const PKG_BASE = String.raw`{
  "name": "sandemo-e2e",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.7.0",
    "typescript": "^5.6.0"
  }
}
`;
const cfgCI = (baseURL, projects, reporter) => String.raw`import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: ` + reporter + String.raw`,
  use: {
    baseURL: ` + baseURL + String.raw`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
` + projects + String.raw`
  ],
});
`;
const P_CHROME = "    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },";
const P_ALL = P_CHROME + "\n    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },\n    { name: 'webkit', use: { ...devices['Desktop Safari'] } },";
const REP_HTML = "process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list'";
const CFG_FALLBACK = cfgCI("process.env.BASE_URL ?? 'https://staging.sandemo.test'", P_CHROME, REP_HTML);
const CFG_ENV = cfgCI('process.env.BASE_URL', P_CHROME, REP_HTML);
const CFG_ENV3 = cfgCI('process.env.BASE_URL', P_ALL, REP_HTML);
const CFG_BLOB = cfgCI('process.env.BASE_URL', P_CHROME, "process.env.CI ? 'blob' : 'html'");
const WF_HEAD = String.raw`name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
`;
const WF_SETUP = String.raw`      - name: Lấy mã nguồn
        uses: actions/checkout@v4

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Cài thư viện
        run: npm ci
`;
const WF_BASE = WF_HEAD + String.raw`
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Chạy test
        run: npx playwright test
`;
const WF_ENV = WF_BASE + String.raw`        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
`;
const WF_ART = WF_ENV + String.raw`
      - name: Lưu báo cáo HTML
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Lưu trace khi có lỗi
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
          retention-days: 7
`;
const WF_NOTIFY = WF_ART + String.raw`
      - name: Báo lỗi lên Slack
        if: failure() && github.ref == 'refs/heads/main'
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"Test E2E thất bại trên main: ${'${{'} github.server_url }}/${'${{'} github.repository }}/actions/runs/${'${{'} github.run_id }}"}' \
            "$SLACK_WEBHOOK_URL"
        env:
          SLACK_WEBHOOK_URL: ${'${{'} secrets.SLACK_WEBHOOK_URL }}
`;
const WFP = '.github/workflows/playwright.yml';
const CIG = String.raw`
const __ok = (res) => {
  if (res.errors.length) expect(false, res.errors.map(e => e.message).join('\n')).toBe(true);
  expect(res.triggered.length > 0, 'Không có workflow nào chạy khi ' + res.eventLabel).toBe(true);
  return res.triggered[0];
};
const __why = (run) => run.jobs.filter(j => j.status === 'failure' || j.status === 'cancelled').map(j => '[' + j.key + '] ' + j.status + (j.log.length ? ': ' + j.log.join(' ') : '') + '\n' + j.steps.filter(s => s.status === 'failure' || s.status === 'cancelled').map(s => '  ✕ ' + s.name + '\n    ' + s.log.slice(-4).join('\n    ')).join('\n')).join('\n');
const __green = (run) => expect(run.conclusion, 'Pipeline chưa xanh:\n' + __why(run)).toBe('success');
const __sum = (run) => run.jobs.flatMap(j => j.summaries || []);
const __steps = (wf) => Object.values(wf.jobs || {}).flatMap(j => j.steps || []);
`;
const yml = (code) => ({ code, lang: 'yaml' });
