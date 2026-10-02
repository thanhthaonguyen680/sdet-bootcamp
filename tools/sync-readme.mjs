// Cập nhật bảng tuần và số tuần trong README.md từ content/curriculum.js (nguồn duy nhất).
//   npm run readme            ghi lại README.md
//   npm run readme -- --check chỉ kiểm tra, thoát mã 1 nếu README đã lỗi thời
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root, 'content/curriculum.js'), 'utf8') + ';globalThis.CURRICULUM = CURRICULUM;', ctx);
const { weeks } = ctx.CURRICULUM;

const count = (w, optional) => w.groups.filter(g => !!g.optional === optional).reduce((n, g) => n + g.exercises.length, 0);
const rows = weeks.map(w => {
  const req = count(w, false), opt = count(w, true);
  const title = w.title[0].toUpperCase() + w.title.slice(1);
  const tip = w.tip.replace(/\{n\}/g, req);
  return `| ${w.week} | **${title}.** ${tip} | ${req}${opt ? ` + ${opt} nâng cao` : ''} |`;
});
const table = ['| Tuần | Chủ đề | Số bài |', '|------|--------|--------|', ...rows].join('\n');

const file = path.join(root, 'README.md');
const before = fs.readFileSync(file, 'utf8');
const START = '<!-- curriculum:start -->', END = '<!-- curriculum:end -->';
if (!before.includes(START) || !before.includes(END)) { console.error('README.md thiếu dấu mốc ' + START + ' ... ' + END); process.exit(1); }
let after = before.replace(new RegExp(START + '[\\s\\S]*?' + END), () => `${START}\n${table}\n${END}`);
after = after.replace(/<!--weeks-->\d+<!--\/weeks-->/, () => `<!--weeks-->${weeks.length}<!--/weeks-->`);

if (process.argv.includes('--check')) {
  if (after !== before) { console.error('README.md đã lỗi thời so với content/curriculum.js. Chạy: npm run readme'); process.exit(1); }
  console.log('README.md đã khớp với danh mục.');
} else {
  fs.writeFileSync(file, after);
  console.log(after === before ? 'README.md đã khớp, không đổi gì.' : `Đã cập nhật README.md (${weeks.length} tuần).`);
}
