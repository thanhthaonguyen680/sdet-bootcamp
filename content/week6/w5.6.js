defineExercise({
  id: 'w5.6',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultScenario: 'bug',
  title: 'Điều kiện if và báo lỗi lên Slack',
  files: { [WFP]: WF_ART, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Khi test trên <strong>main</strong> thất bại, cả team cần biết ngay. Thêm bước cuối <code>Báo lỗi lên Slack</code>:</p>
<ul>
<li>Chỉ chạy khi có lỗi <strong>và</strong> đang chạy trên nhánh main (pull request đỏ thì người tạo PR tự xem, không cần báo cả team).</li>
<li>Gửi bằng <code>curl</code> tới địa chỉ webhook lấy từ secret <code>SLACK_WEBHOOK_URL</code>.</li>
<li>Nội dung tin nhắn phải có đường link tới lần chạy pipeline này.</li>
</ul>`,
  hints: [
    'Kết hợp điều kiện: <code>if: failure() &amp;&amp; github.ref == \'refs/heads/main\'</code>.',
    'Link lần chạy: <code>${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}</code>.',
    'Đưa secret vào <code>env</code> rồi dùng <code>"$SLACK_WEBHOOK_URL"</code> trong lệnh. Lệnh nhiều dòng dùng <code>run: |</code>, xuống dòng giữa chừng một lệnh dùng dấu <code>\\</code> ở cuối dòng.'],
  tests: CIG + String.raw`
const WEBHOOK = 'https://hooks.slack.test/services/T01/B02/xyz';
check('Bug trên main: gửi đúng 1 thông báo tới webhook', async () => { const run = __ok(await H.run('push-main', { scenario: 'bug' })); expect(run.notifications.length, 'Số thông báo đã gửi').toBe(1); expect(run.notifications[0].url, 'URL webhook phải lấy từ secret SLACK_WEBHOOK_URL').toBe(WEBHOOK); });
check('Tin nhắn có link tới lần chạy', async () => { const run = (await H.run('push-main', { scenario: 'bug' })).triggered[0]; const body = (run.notifications[0] || {}).body || ''; expect(/actions\/runs\/\d+/.test(body), 'Nội dung chưa có link .../actions/runs/<run_id>').toBe(true); });
check('Test xanh: không gửi thông báo', async () => { const run = __ok(await H.run('push-main')); expect(run.notifications.length).toBe(0); });
check('Pull request đỏ: không gửi thông báo', async () => { const run = __ok(await H.run('pr-main', { scenario: 'bug' })); expect(run.notifications.length, 'PR thất bại không nên báo cả team').toBe(0); });
check('Không ghi thẳng webhook vào YAML', () => expect(__files['` + WFP + String.raw`'].includes('hooks.slack.test')).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Biểu thức và ngữ cảnh github</h3>
<p>Bên trong <code>${'${{'} }}</code> có thể dùng ngữ cảnh và toán tử:</p>
${TRACE(['Biểu thức', 'Giá trị ví dụ'], [['<code>github.ref</code>', 'refs/heads/main (push) hoặc refs/pull/42/merge (PR)'], ['<code>github.event_name</code>', 'push, pull_request, schedule, workflow_dispatch'], ['<code>github.run_id</code>', 'số định danh của lần chạy này'], ['<code>github.repository</code>', 'thao/sandemo-e2e'], ['<code>==</code>, <code>!=</code>, <code>&amp;&amp;</code>, <code>||</code>, <code>!</code>', 'so sánh và kết hợp điều kiện']])}
<p>Trong <code>if:</code> có thể bỏ <code>${'${{'} }}</code>: <code>if: failure() &amp;&amp; github.ref == 'refs/heads/main'</code>.</p>
<h3>Gửi thông báo bằng curl</h3>
<p>Slack, Microsoft Teams, Google Chat đều nhận thông báo qua <em>incoming webhook</em>: một URL bí mật, gửi request POST có nội dung JSON là tin nhắn hiện trong kênh.</p>
{{ex0}}
<p>Dấu <code>\\</code> cuối dòng nối lệnh sang dòng tiếp theo cho dễ đọc. Webhook là secret: ai có URL này đều gửi được tin vào kênh của team.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`      - name: Báo lỗi
        if: failure()
        run: |
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"Lần chạy ${'${{'} github.run_id }} thất bại"}' \
            "$SLACK_WEBHOOK_URL"
        env:
          SLACK_WEBHOOK_URL: ${'${{'} secrets.SLACK_WEBHOOK_URL }}` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Điều kiện <code>failure() &amp;&amp; github.ref == 'refs/heads/main'</code>: với pull request, <code>github.ref</code> có dạng <code>refs/pull/42/merge</code> nên không gửi.</li><li>Webhook đi qua <code>env</code> rồi dùng <code>"$SLACK_WEBHOOK_URL"</code>: log chỉ hiện <code>***</code>.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_NOTIFY }]},
});
