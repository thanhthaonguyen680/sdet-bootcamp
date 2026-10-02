defineExercise({
  id: 'w5.11',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultEvent: 'pr-main',
  title: 'Tổng hợp: pipeline cho PR và chạy đêm',
  files: { '.github/workflows/pr.yml': String.raw`# PR checks: kiểm tra nhanh cho mỗi pull request vào main và mỗi lần push lên main.
#   - typecheck, sau đó smoke test chỉ trên chromium
#   - luôn lưu báo cáo HTML
`, '.github/workflows/nightly.yml': String.raw`# Nightly regression: chạy đầy đủ trên cả 3 trình duyệt.
#   - chạy 7:00 sáng giờ Việt Nam từ thứ 2 đến thứ 6, và cho phép chạy tay
#   - matrix 3 trình duyệt, lỗi một trình duyệt không hủy các trình duyệt khác
#   - mỗi trình duyệt một artifact báo cáo
#   - có lỗi thì báo lên Slack
`, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV3 },
  open: '.github/workflows/pr.yml',
  projectName: 'sandemo-e2e',
  desc: `<p>Bài cuối: dựng bộ pipeline hoàn chỉnh gồm <strong>hai workflow</strong> cho hai mục đích khác nhau.</p>
<p><code>pr.yml</code> (nhanh, cho mỗi thay đổi code):</p>
<ul><li>Chạy khi có pull request vào main và khi push lên main.</li><li>Job <code>typecheck</code>, rồi job <code>smoke</code> chỉ chạy test <code>@smoke</code> trên chromium.</li><li>Luôn lưu báo cáo HTML.</li></ul>
<p><code>nightly.yml</code> (đầy đủ, mỗi sáng):</p>
<ul><li>Chạy 7:00 sáng giờ Việt Nam thứ 2 đến thứ 6, và cho phép chạy tay.</li><li>Matrix 3 trình duyệt, không hủy nhau khi một trình duyệt lỗi, mỗi trình duyệt một artifact báo cáo.</li><li>Có lỗi thì gửi Slack (có link tới lần chạy).</li></ul>
<p>Cả hai đều cần <code>BASE_URL</code> và <code>TEST_USER_PASSWORD</code> như bài 4.</p>`,
  hints: [
    'Dùng lại những gì đã viết ở bài 3–10: phần lớn là ghép các đoạn đã có. Mở cây thư mục để chuyển giữa hai tệp.',
    'Smoke chỉ trên chromium: <code>npx playwright test --project=chromium --grep @smoke</code>, chỉ cài chromium.',
    'Trong nightly, bước Slack đặt trong job matrix với <code>if: failure()</code>: chỉ job của trình duyệt bị lỗi mới gửi thông báo.'],
  tests: CIG + String.raw`
check('Pull request: chỉ pr.yml chạy, smoke chromium xanh', async () => { const r = await H.run('pr-main'); if (r.errors.length) expect(false, r.errors.map(e => e.message).join('\n')).toBe(true); expect(r.triggered.map(t => t.file), 'Workflow được kích hoạt').toEqual(['.github/workflows/pr.yml']); const run = r.triggered[0]; __green(run); const s = __sum(run); expect(s.length > 0 && s.every(x => x.projects.join() === 'chromium' && x.total === 3), 'PR chỉ nên chạy 3 test @smoke trên chromium').toBe(true); expect(run.jobs.some(j => j.id === 'typecheck')).toBe(true); expect(run.artifacts.some(a => a.kind === 'html'), 'Cần lưu báo cáo HTML').toBe(true); });
check('Push lên main: chạy pr.yml; push nhánh khác: không chạy gì', async () => { const a = await H.run('push-main'); expect(a.triggered.map(t => t.file)).toEqual(['.github/workflows/pr.yml']); const b = await H.run('push-feature'); expect(b.triggered.length).toBe(0); });
check('Lịch chạy: chỉ nightly.yml, 3 trình duyệt đều xanh', async () => { const r = await H.run('schedule'); expect(r.triggered.map(t => t.file)).toEqual(['.github/workflows/nightly.yml']); const run = r.triggered[0]; __green(run); const s = __sum(run); expect(s.map(x => x.projects.join()).sort()).toEqual(['chromium', 'firefox', 'webkit']); expect(s.every(x => x.total === 14)).toBe(true); expect(run.artifacts.filter(a => a.kind === 'html').length).toBe(3); });
check('Lịch 7:00 sáng giờ Việt Nam, thứ 2 đến thứ 6', async () => { const on = H.on(await H.yaml('.github/workflows/nightly.yml')); expect('workflow_dispatch' in on, 'nightly cần cho phép chạy tay').toBe(true); for (const d of H.cronNext([].concat(on.schedule)[0].cron, 7)) { const vn = new Date(d.getTime() + 7 * 3600000); expect(vn.getUTCHours() === 7 && vn.getUTCMinutes() === 0 && vn.getUTCDay() >= 1 && vn.getUTCDay() <= 5, 'Lịch chưa đúng 7:00 giờ Việt Nam thứ 2–6').toBe(true); } });
check('WebKit lỗi ban đêm: chỉ webkit đỏ, gửi đúng 1 thông báo có link', async () => { const run = (await H.run('schedule', { scenario: 'webkit' })).triggered[0]; const st = Object.fromEntries(run.jobs.filter(j => j.summaries[0]).map(j => [j.summaries[0].projects[0], j.status])); expect(st).toEqual({ chromium: 'success', firefox: 'success', webkit: 'failure' }); expect(run.notifications.length).toBe(1); expect(/actions\/runs\/\d+/.test(run.notifications[0].body || '')).toBe(true); });
check('Không có mật khẩu hay webhook viết thẳng', () => { const t = __files['.github/workflows/pr.yml'] + __files['.github/workflows/nightly.yml']; expect(/Demo@123|hooks\.slack\.test/.test(t)).toBe(false); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Chiến lược pipeline trong thực tế</h3>
<p>Không có bộ test nào vừa chạy đầy đủ vừa nhanh. Các team thường chia thành nhiều tầng:</p>
${TRACE(['Khi nào', 'Chạy gì', 'Mục tiêu'], [['Mỗi pull request, mỗi push lên main', 'typecheck + smoke trên 1 trình duyệt', 'phản hồi nhanh (dưới 5 phút)'], ['Mỗi đêm hoặc mỗi sáng', 'toàn bộ test trên mọi trình duyệt', 'bắt lỗi hiếm, lỗi riêng trình duyệt'], ['Trước khi release', 'toàn bộ + môi trường giống production', 'xác nhận bản phát hành']])}
<p>Bài này ghép lại mọi thứ của tuần: scripts, config cho CI, secrets, artifact, điều kiện, matrix, lịch chạy và thông báo.</p>
<h3>Đưa sang repo thật</h3>
<ul>
<li>Tạo repo GitHub, đẩy project Playwright của bạn lên (có thư mục <code>.github/workflows/</code>).</li>
<li>Vào Settings → Secrets and variables → Actions, tạo các secret và variable cần dùng.</li>
<li>Mở tab Actions trên GitHub để xem kết quả, giống tab Pipeline ở đây.</li>
<li>Settings → Branches: bật "Require status checks to pass" cho nhánh main để PR đỏ không merge được.</li>
</ul>
<p class="note">Góc QA: khi phỏng vấn SDET, câu "bạn tích hợp test vào CI thế nào" gần như chắc chắn được hỏi. Mô tả được chiến lược nhiều tầng như trên, cùng cách xử lý test flaky, báo cáo và thông báo, là một điểm cộng lớn.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Hai workflow tách biệt mục đích: PR cần nhanh, nightly cần đầy đủ. Mỗi tệp chỉ phản ứng với sự kiện của nó.</li><li>Bước Slack trong job matrix với <code>if: failure()</code> nên chỉ job của trình duyệt lỗi gửi tin, không spam 3 tin giống nhau.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: .github/workflows/pr.yml\n' + String.raw`name: PR checks

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${'${{'} github.workflow }}-${'${{'} github.ref }}
  cancel-in-progress: true

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Kiểm tra TypeScript
        run: npx tsc --noEmit

  smoke:
    needs: typecheck
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Cài chromium
        run: npx playwright install --with-deps chromium
      - name: Smoke test trên chromium
        run: npx playwright test --project=chromium --grep @smoke
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
      - name: Lưu báo cáo
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

// @file: .github/workflows/nightly.yml
name: Nightly regression

on:
  schedule:
    - cron: '0 0 * * 1-5'
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]
    steps:
` + WF_SETUP + String.raw`
      - name: Cài ${'${{'} matrix.project }}
        run: npx playwright install --with-deps ${'${{'} matrix.project }}
      - name: Toàn bộ test trên ${'${{'} matrix.project }}
        run: npx playwright test --project=${'${{'} matrix.project }}
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
      - name: Lưu báo cáo
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${'${{'} matrix.project }}
          path: playwright-report/
          retention-days: 14
      - name: Báo lỗi lên Slack
        if: failure()
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"Nightly ${'${{'} matrix.project }} thất bại: ${'${{'} github.server_url }}/${'${{'} github.repository }}/actions/runs/${'${{'} github.run_id }}"}' \
            "$SLACK_WEBHOOK_URL"
        env:
          SLACK_WEBHOOK_URL: ${'${{'} secrets.SLACK_WEBHOOK_URL }}
` }]},
});
