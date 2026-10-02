defineExercise({
  id: 'w5.5',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultScenario: 'bug',
  title: 'Lưu báo cáo test (artifact)',
  files: { [WFP]: WF_ENV, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Máy CI bị xóa sạch sau mỗi lần chạy. Muốn xem báo cáo HTML của Playwright thì phải tải nó lên thành <strong>artifact</strong>. Thêm hai bước cuối job:</p>
<ul>
<li>Lưu báo cáo: artifact tên <code>playwright-report</code>, thư mục <code>playwright-report/</code>, giữ 14 ngày. Phải chạy <strong>cả khi test thất bại</strong> (đó chính là lúc cần báo cáo nhất).</li>
<li>Lưu trace: artifact tên <code>test-results</code>, thư mục <code>test-results/</code>, <strong>chỉ khi</strong> có lỗi.</li>
</ul>
<p>Kịch bản mặc định của bài là <strong>Có bug thật</strong>. Thử chạy trước khi sửa để thấy bước upload bị bỏ qua khi test đỏ.</p>`,
  hints: [
    'Mặc định mỗi bước chỉ chạy khi các bước trước đều thành công. Đổi điều kiện bằng <code>if:</code>.',
    '<code>if: ${{ !cancelled() }}</code> (hoặc <code>always()</code>): chạy dù trước đó thành công hay thất bại. <code>if: failure()</code>: chỉ chạy khi có bước thất bại.',
    '<pre>- name: Lưu báo cáo HTML\n  if: ${{ !cancelled() }}\n  uses: actions/upload-artifact@v4\n  with:\n    name: playwright-report\n    path: playwright-report/\n    retention-days: 14</pre>'],
  tests: CIG + String.raw`
check('Khi test đỏ: vẫn có báo cáo HTML và trace', async () => { const run = __ok(await H.run('push-main', { scenario: 'bug' })); expect(run.conclusion, 'Kịch bản có bug thì pipeline phải đỏ').toBe('failure'); const names = run.artifacts.map(a => a.name); expect(names.includes('playwright-report'), 'Thiếu artifact playwright-report khi test thất bại').toBe(true); expect(names.includes('test-results'), 'Thiếu artifact test-results khi test thất bại').toBe(true); });
check('Khi test xanh: có báo cáo, không tải trace', async () => { const run = __ok(await H.run('push-main')); __green(run); const names = run.artifacts.map(a => a.name); expect(names.includes('playwright-report')).toBe(true); expect(names.includes('test-results'), 'test-results chỉ nên tải khi có lỗi').toBe(false); });
check('Báo cáo giữ không quá 30 ngày', async () => { const run = (await H.run('push-main')).triggered[0]; const a = run.artifacts.find(x => x.name === 'playwright-report'); expect(!!a && a.retention <= 30, 'Đặt retention-days (ví dụ 14) để không tốn dung lượng').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Máy CI dùng xong là xóa</h3>
<p>Mọi tệp sinh ra trong job (báo cáo HTML, ảnh chụp, trace) biến mất khi job kết thúc. <strong>Artifact</strong> là cách giữ chúng lại: tải lên GitHub, xem hoặc tải về từ trang kết quả của lần chạy.</p>
<h3>Điều kiện if và các hàm trạng thái</h3>
${TRACE(['Điều kiện', 'Bước chạy khi'], [['(mặc định) <code>success()</code>', 'mọi bước trước đều thành công'], ['<code>failure()</code>', 'có bước trước thất bại'], ['<code>always()</code>', 'luôn chạy, kể cả khi bị hủy'], ['<code>!cancelled()</code>', 'luôn chạy, trừ khi lần chạy bị hủy']])}
{{ex0}}
<p>Báo cáo cần nhất đúng vào lúc test đỏ, nên bước upload báo cáo phải có điều kiện <code>!cancelled()</code> (hoặc <code>always()</code>). Thiếu điều kiện này là lỗi rất phổ biến: test đỏ thì bước upload bị bỏ qua, và không ai có báo cáo để xem.</p>
<p class="note">Góc QA: trace của Playwright (tải về, mở bằng <code>npx playwright show-trace trace.zip</code> hoặc trang trace.playwright.dev) cho xem lại từng bước, ảnh chụp màn hình, request mạng tại thời điểm test lỗi trên máy CI. Đây là công cụ debug quan trọng nhất khi test chỉ lỗi trên CI.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`      - name: Lưu báo cáo
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Báo cáo HTML dùng <code>!cancelled()</code>: có cả khi xanh lẫn đỏ, chỉ bỏ qua khi lần chạy bị hủy giữa chừng.</li><li>Trace chỉ cần khi có lỗi nên dùng <code>failure()</code>, và giữ ngắn hơn (7 ngày) vì dung lượng lớn.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_ART }]},
});
