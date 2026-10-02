defineExercise({
  id: 'w5.4',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  title: 'Secrets và biến môi trường',
  files: { [WFP]: WF_BASE, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Team vừa đổi test: địa chỉ trang lấy từ biến <code>BASE_URL</code> (xem <code>playwright.config.ts</code>), và các test đăng nhập đọc mật khẩu từ <code>TEST_USER_PASSWORD</code>. Chạy pipeline ngay bây giờ sẽ thấy đỏ.</p>
<p>Repo mô phỏng đã được admin cấu hình sẵn trong Settings:</p>
<pre>Secrets:   TEST_USER_PASSWORD, SLACK_WEBHOOK_URL
Variables: BASE_URL_STAGING, BASE_URL_PROD</pre>
<p>Hãy truyền <code>BASE_URL</code> (lấy từ variable <code>BASE_URL_STAGING</code>) và <code>TEST_USER_PASSWORD</code> (lấy từ secret) vào bước chạy test. <strong>Không</strong> được ghi thẳng mật khẩu hay URL vào tệp YAML.</p>`,
  hints: [
    'Biến môi trường cho một bước khai báo trong <code>env:</code>, cùng cấp với <code>run:</code>.',
    'Đọc secret: <code>${{ secrets.TEN }}</code>. Đọc variable: <code>${{ vars.TEN }}</code>.',
    '<pre>env:\n  BASE_URL: ${{ vars.BASE_URL_STAGING }}\n  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}</pre>'],
  tests: CIG + String.raw`
check('push lên main: pipeline xanh', async () => { const run = __ok(await H.run('push-main')); __green(run); expect(__sum(run)[0].baseURL, 'BASE_URL').toBe('https://staging.sandemo.test'); });
check('Mật khẩu lấy từ secrets, không ghi thẳng', () => { const t = __files['` + WFP + String.raw`']; expect(/Demo@123/.test(t), 'Không được ghi thẳng mật khẩu vào YAML').toBe(false); expect(/\$\{\{\s*secrets\.TEST_USER_PASSWORD\s*\}\}/.test(t), 'Cần dùng ${'${{'} secrets.TEST_USER_PASSWORD }}').toBe(true); });
check('BASE_URL lấy từ variables', () => { const t = __files['` + WFP + String.raw`']; expect(/staging\.sandemo\.test/.test(t), 'Không ghi thẳng URL, hãy dùng vars').toBe(false); expect(/vars\.BASE_URL_STAGING/.test(t), 'Cần dùng ${'${{'} vars.BASE_URL_STAGING }}').toBe(true); });
check('Log không làm lộ mật khẩu', async () => { const run = (await H.run('push-main')).triggered[0]; expect(run.jobs.flatMap(j => j.steps.flatMap(s => s.log)).join('\n').includes('Demo@123')).toBe(false); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Không bao giờ ghi mật khẩu vào code</h3>
<p>Tệp workflow nằm trong repo, ai đọc được repo là đọc được mật khẩu, và lịch sử Git giữ lại mãi mãi. GitHub có hai nơi lưu giá trị cấu hình, đặt trong <strong>Settings → Secrets and variables → Actions</strong>:</p>
${TRACE(['', 'Secrets', 'Variables'], [['Dùng cho', 'mật khẩu, token, webhook', 'URL, tên môi trường, cấu hình không nhạy cảm'], ['Đọc trong workflow', '<code>${{ secrets.TEN }}</code>', '<code>${{ vars.TEN }}</code>'], ['Hiện trong log', 'tự động che thành ***', 'hiện bình thường'], ['Xem lại sau khi lưu', 'không được', 'được']])}
<h3>Truyền vào bước chạy test</h3>
{{ex0}}
<p><code>env</code> có thể đặt ở ba cấp: cả workflow, cả job, hoặc một bước. Cấp càng hẹp càng an toàn: chỉ bước chạy test mới cần mật khẩu.</p>
<p class="note">Góc QA: nếu vô tình commit mật khẩu, xóa đi ở commit sau là chưa đủ (vẫn còn trong lịch sử). Việc cần làm là <strong>đổi mật khẩu ngay</strong>.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`      - name: Chạy test
        run: |
          echo "Chạy trên $BASE_URL"
          echo "Mật khẩu: $TEST_USER_PASSWORD"
          npx playwright test
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Thử thêm dòng <code>echo "$TEST_USER_PASSWORD"</code> vào bước chạy test: log sẽ hiện <code>***</code> vì GitHub tự che giá trị của secret.</p>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_ENV }]},
});
