/* In giá trị ra Console và so sánh sâu. */

function fmt(v, depth, top, seen){
  depth = depth || 0; seen = seen || new Set();
  const t = typeof v;
  if (t === 'string') return top ? v : JSON.stringify(v);
  if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
  if (t === 'bigint') return v + 'n';
  if (v === null) return 'null';
  if (t === 'undefined' || t === 'boolean') return String(v);
  if (t === 'symbol') return v.toString();
  if (t === 'function') return '[Function: ' + (v.name || 'anonymous') + ']';
  if (v instanceof Error) return (v.name || 'Error') + ': ' + v.message;
  if (typeof Promise !== 'undefined' && v instanceof Promise) return 'Promise { … }';
  if (seen.has(v)) return '[Circular]';
  if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
  seen.add(v);
  let r;
  if (Array.isArray(v)){
    const items = v.slice(0, 100).map(x => fmt(x, depth + 1, false, seen));
    if (v.length > 100) items.push('… còn ' + (v.length - 100) + ' phần tử');
    r = items.length ? '[ ' + items.join(', ') + ' ]' : '[]';
  } else if (v instanceof Map){
    r = 'Map(' + v.size + ') { ' + Array.from(v).map(p => fmt(p[0], depth+1, false, seen) + ' => ' + fmt(p[1], depth+1, false, seen)).join(', ') + ' }';
  } else if (v instanceof Set){
    r = 'Set(' + v.size + ') { ' + Array.from(v).map(x => fmt(x, depth+1, false, seen)).join(', ') + ' }';
  } else if (v instanceof Date){
    r = isNaN(v) ? 'Invalid Date' : v.toISOString();
  } else if (v instanceof RegExp){
    r = String(v);
  } else {
    const keys = Object.keys(v);
    r = keys.length ? '{ ' + keys.map(k => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + fmt(v[k], depth+1, false, seen)).join(', ') + ' }' : '{}';
  }
  seen.delete(v);
  return r;
}
function deepEqual(a, b){
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}
