/* expect của bài JavaScript và cách giải thích lỗi cho người học. */

function assertFail(msg){ const e = new Error(msg); e.__assert = true; throw e; }
function expect(actual, custom){
  const f = def => assertFail(custom || def);
  const api = {
    toBe: exp => { if (!Object.is(actual, exp)) f('Mong đợi ' + fmt(exp) + ', nhận được ' + fmt(actual)); },
    toEqual: exp => { if (!deepEqual(actual, exp)) f('Mong đợi ' + fmt(exp) + ',\nnhận được ' + fmt(actual)); },
    toBeCloseTo: (exp, d) => { d = d == null ? 2 : d; if (typeof actual !== 'number' || !(Math.abs(actual - exp) < Math.pow(10, -d) / 2)) f('Mong đợi xấp xỉ ' + exp + ', nhận được ' + fmt(actual)); },
    toContain: x => { if (actual == null || typeof actual.includes !== 'function' || !actual.includes(x)) f('Mong đợi có ' + fmt(x) + ',\nnhận được ' + fmt(actual)); },
  };
  api.not = {
    toBe: exp => { if (Object.is(actual, exp)) f('Không mong đợi ' + fmt(exp)); },
    toContain: x => { if (actual != null && typeof actual.includes === 'function' && actual.includes(x)) f('Không mong đợi có ' + fmt(x)); },
  };
  return api;
}
function explain(e){
  if (e == null) return 'Lỗi không xác định';
  if (e.__assert || e.__loop) return e.message;
  const m = String(e.message != null ? e.message : e);
  if (e.name === 'ReferenceError'){
    const v = m.match(/^(\S+) is not defined/) || m.match(/Can't find variable: (\S+)/);
    if (v) return 'ReferenceError: "' + v[1] + '" chưa được khai báo. Kiểm tra lại tên (có phân biệt hoa thường).';
  }
  if (e.name === 'TypeError' && /undefined|null/.test(m)) return 'TypeError: ' + m + '\nMột giá trị đang là undefined hoặc null. Function đã return kết quả chưa?';
  if (e.name === 'SyntaxError') return 'Lỗi cú pháp: ' + m;
  return (e.name || 'Error') + ': ' + m;
}
