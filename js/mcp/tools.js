/* Mô phỏng Playwright MCP: các công cụ (tool) mà AI gọi để điều khiển trình duyệt.

   Tên và tham số theo Playwright MCP thật. Mỗi lệnh thao tác trả về:
     code      dòng code Playwright tương đương vừa được chạy (mục "Ran Playwright code")
     url, title, snapshot   trạng thái trang sau thao tác (mục "Page state")
   Code sinh ra được chạy thật trên Sàn Demo, nên nếu code sai thì lệnh báo lỗi. */

const mcpQ = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

const MCP_TOOLS = {
  browser_navigate: {
    params: ['url'],
    hint: 'browser_navigate /order',
    async run(page, a){
      if (!a.url) throw pwErr('Thiếu url, ví dụ: browser_navigate /order');
      await page.goto(a.url);
      await appWaitReady();
      return { code: 'await page.goto(' + mcpQ(a.url) + ');' };
    },
  },
  browser_snapshot: {
    params: [],
    hint: 'browser_snapshot',
    async run(){ return { snapshotOnly: true }; },
  },
  browser_click: {
    params: ['element', 'ref'],
    hint: 'browser_click e12',
    async run(page, a){
      const { loc, expr } = mcpLocatorFor(mcpTarget(a.ref), page);
      await loc.click({ timeout: 2000 });
      return { code: 'await ' + expr + '.click();' };
    },
  },
  browser_type: {
    params: ['element', 'ref', 'text'],
    hint: 'browser_type e8 thao@sandemo.test',
    async run(page, a){
      const { loc, expr } = mcpLocatorFor(mcpTarget(a.ref), page);
      await loc.fill(a.text == null ? '' : String(a.text));
      return { code: 'await ' + expr + '.fill(' + mcpQ(a.text == null ? '' : a.text) + ');' };
    },
  },
  browser_select_option: {
    params: ['element', 'ref', 'values'],
    hint: 'browser_select_option e20 Chờ khớp',
    async run(page, a){
      const values = [].concat(a.values == null ? [] : a.values);
      const { loc, expr } = mcpLocatorFor(mcpTarget(a.ref), page);
      await loc.selectOption(values.length === 1 ? values[0] : values);
      return { code: 'await ' + expr + '.selectOption(' + (values.length === 1 ? mcpQ(values[0]) : '[' + values.map(mcpQ).join(', ') + ']') + ');' };
    },
  },
  browser_wait_for: {
    params: ['text', 'time'],
    hint: 'browser_wait_for Sony Group',
    async run(page, a){
      if (a.time != null){
        await pwSleep(Math.min(+a.time, 5) * 1000);
        return { code: 'await new Promise(f => setTimeout(f, ' + (+a.time) + ' * 1000));' };
      }
      if (!a.text) throw pwErr('Thiếu text hoặc time, ví dụ: browser_wait_for Sony Group');
      const loc = page.getByText(a.text).first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      return { code: 'await ' + 'page.' + String(loc) + '.waitFor({ state: \'visible\' });' };
    },
  },
};

// Phần tử ứng với ref; báo lỗi giống bản thật khi ref không còn trong trang.
function mcpTarget(ref){
  if (!ref) throw pwErr('Thiếu ref. Hãy gọi browser_snapshot rồi dùng một ref trong đó, ví dụ e12.');
  const el = mcpElementOf(ref);
  if (!el) throw pwErr('Ref ' + ref + ' không có trong trang hiện tại. Trang có thể đã đổi hoặc ref đã cũ. Hãy gọi browser_snapshot để lấy ref mới.');
  return el;
}

// Gọi một công cụ. Trả về { code?, url, title, snapshot, error? }; lệnh nào cũng kèm trạng thái trang như bản thật.
async function mcpCall(page, tool, args){
  const t = MCP_TOOLS[tool];
  const res = {};
  if (!t) res.error = 'Không có công cụ ' + tool + '. Các công cụ: ' + Object.keys(MCP_TOOLS).join(', ');
  else {
    try { Object.assign(res, await t.run(page, args || {})); }
    catch (e){ res.error = e.message; }
  }
  if (App.doc && App.path !== 'about:blank'){ res.url = App.fullUrl(); res.title = App.doc.title; res.snapshot = mcpSnapshot(App.doc); }
  return res;
}
