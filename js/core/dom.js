/* Tham chiếu tới các phần tử của trang và hàm tiện ích DOM. */

const $ = s => document.querySelector(s);
const ta = $('#code'), hlEl = $('#hl'), gutEl = $('#gutter');
const briefEl = $('#brief'), sideEl = $('#side'), stripEl = $('#strip'), countEl = $('#count');
const consoleEl = $('#paneConsole'), testsEl = $('#paneTests'), badgeEl = $('#testBadge');
const runBtn = $('#runBtn'), checkBtn = $('#checkBtn'), markBtn = $('#markBtn'), resetBtn = $('#resetBtn'), copyBtn = $('#copyBtn');
let current = null;

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
