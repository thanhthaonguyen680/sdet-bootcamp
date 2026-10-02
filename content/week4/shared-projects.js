/* Khung chấm và bộ tệp mẫu cho các dự án POM hoàn chỉnh. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const CONFIG_REF = String.raw`// TỆP THAM KHẢO: sân tập không chạy tệp này.
// Trong project thật, tệp này cho Playwright biết baseURL để page.goto('/login') hoạt động.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://sandemo.test',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
`;
const PROJG = String.raw`
const F = __pw.files || {};
const __body = t => String(t || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/^\s*#.*$/gm, '').trim();
const __resolve = (from, spec) => { const parts = from.split('/').slice(0, -1); for (const s of spec.split('/')) { if (s === '.' || !s) continue; if (s === '..') parts.pop(); else parts.push(s); } const b = parts.join('/'); return [b, b + '.ts', b + '/index.ts'].find(c => F[c] !== undefined) || null; };
const __importProblems = () => {
  const out = [];
  for (const [p, txt] of Object.entries(F)) {
    if (!p.endsWith('.ts') || /playwright\.config/.test(p)) continue;
    const re = /import\s+(type\s+)?(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g; let m;
    while ((m = re.exec(__body(txt)))) {
      const spec = m[4]; if (!spec.startsWith('.')) continue;
      const target = __resolve(p, spec);
      if (!target) { out.push(p + ': không tìm thấy "' + spec + '"'); continue; }
      if (!m[2] || target.endsWith('.json')) continue;
      for (const raw of m[2].split(',')) {
        const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim(); if (!name) continue;
        const t = __body(F[target]);
        const ok = new RegExp('export\\s+(declare\\s+)?(abstract\\s+)?(const|let|var|function|async\\s+function|class|interface|type|enum)\\s+' + name + '\\b').test(t) || new RegExp('export\\s*\\{[^}]*\\b' + name + '\\b').test(t);
        if (!ok) out.push(p + ': "' + name + '" chưa được export từ ' + target);
      }
    }
  }
  return out;
};
const __need = (list) => { const empty = list.filter(p => !__body(F[p])); expect(empty.length === 0, 'Các tệp còn trống: ' + empty.join(', ')).toBe(true); };
`;

