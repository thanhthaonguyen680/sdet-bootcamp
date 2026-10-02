defineExercise({
  id: 'w2.18',
  title: 'Mua bán cổ phiếu lời nhất',
  desc: `<p><code>prices[i]</code> là giá cổ phiếu ngày thứ <code>i</code>. Bạn được mua một lần và bán một lần, ngày bán phải sau ngày mua. Viết <code>maxProfit(prices)</code> trả về tiền lời lớn nhất có thể, không lời được thì trả về 0.</p>
<pre>[7, 1, 5, 3, 6, 4]                     → 5   (mua 1, bán 6)
[7, 6, 4, 3, 1]                        → 0
[2850, 2800, 2900, 2780, 2950, 2910]   → 170</pre>
<p>Bộ chấm có dữ liệu 100.000 ngày, nên cần cách duyệt một lần.</p>`,
  hints: [
    'Cách thô: thử mọi cặp (mua ngày <code>i</code>, bán ngày <code>j &gt; i</code>). Đúng nhưng O(n²), quá chậm với 100.000 ngày.',
    'Duyệt một lần, luôn nhớ giá thấp nhất từ đầu tới hôm nay. Nếu hôm nay bán thì lời = giá hôm nay − giá thấp nhất trước đó.',
    'Mỗi ngày: <code>best = Math.max(best, price - minPrice)</code>, rồi <code>minPrice = Math.min(minPrice, price)</code>. Khởi tạo <code>minPrice = Infinity</code>, <code>best = 0</code>.'],
  starter: String.raw`function maxProfit(prices) {

}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
`,
  tests: String.raw`
test('[7, 1, 5, 3, 6, 4] → 5', () => expect(maxProfit([7, 1, 5, 3, 6, 4])).toBe(5));
test('[7, 6, 4, 3, 1] → 0 (giá chỉ giảm)', () => expect(maxProfit([7, 6, 4, 3, 1])).toBe(0));
test('Dữ liệu giá thật → 170', () => expect(maxProfit([2850, 2800, 2900, 2780, 2950, 2910])).toBe(170));
test('[3, 8, 1, 4] → 5 (giá thấp nhất nằm sau giá cao nhất)', () => expect(maxProfit([3, 8, 1, 4]), 'Không thể bán trước khi mua: lấy max − min là sai').toBe(5));
test('[] và [5] → 0', () => { expect(maxProfit([])).toBe(0); expect(maxProfit([5])).toBe(0); });
test('Chạy nhanh với 100.000 ngày', () => {
  const p = []; for (let i = 0; i < 100000; i++) p.push((i * 7919) % 10007);
  let lo = Infinity, best = 0; for (const x of p) { if (x - lo > best) best = x - lo; if (x < lo) lo = x; }
  expect(maxProfit(p)).toBe(best);
});
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao lấy max − min là sai</h3>
<p>Không thể bán trước khi mua. Nếu giá thấp nhất xuất hiện sau giá cao nhất thì cặp đó không hợp lệ.</p>
{{ex0}}
<h3>Theo dõi giá trị tốt nhất tới hiện tại</h3>
<p>Đứng ở một ngày bất kỳ, câu hỏi "nếu bán hôm nay thì lời nhất bao nhiêu" chỉ phụ thuộc vào giá thấp nhất <strong>trước đó</strong>. Vậy chỉ cần giữ một biến giá thấp nhất, cập nhật dần khi đi qua từng ngày.</p>
{{ex1}}
<p class="note">Bài này là phiên bản thu gọn của một câu hỏi thật trong ngành: với dữ liệu giá lịch sử, điểm mua bán tối ưu nằm ở đâu. Dữ liệu thị trường rất lớn, nên khác biệt giữa O(n) và O(n²) là khác biệt giữa vài mili giây và vài giờ.</p>`,
examples:[String.raw`const prices = [3, 8, 1, 4];
console.log("max − min =", Math.max(...prices) - Math.min(...prices), "(sai: giá 1 nằm sau giá 8)");
console.log("Đáp án đúng: mua 3 bán 8 = 5");`,
String.raw`const prices = [5, 3, 6, 2];
let minSoFar = Infinity;
for (const p of prices) {
  minSoFar = Math.min(minSoFar, p);
  console.log("Giá", p, "| thấp nhất tới nay:", minSoFar);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Duyệt từng ngày. Tính lời nếu bán hôm nay (giá hôm nay trừ giá thấp nhất trước đó), cập nhật mức lời tốt nhất, rồi cập nhật giá thấp nhất.</p>
{{ex0}}
<h3>Chạy tay với dữ liệu giá thật</h3>
${TRACE(['Ngày', 'Giá', 'Lời nếu bán hôm nay', 'best', 'minPrice sau bước'], [['0', '2850', 'không có (Infinity)', '0', '2850'], ['1', '2800', '−50', '0', '2800'], ['2', '2900', '100', '100', '2800'], ['3', '2780', '−20', '100', '2780'], ['4', '2950', '170', '170', '2780'], ['5', '2910', '130', '170', '2780']])}
<p>Kết quả 170: mua ngày 3 giá 2780, bán ngày 4 giá 2950.</p>
<h3>Vì sao tính lời trước rồi mới cập nhật giá thấp nhất</h3>
<p>Để bảo đảm giá mua luôn thuộc một ngày trước ngày bán. Nếu đổi thứ tự, hôm nay vừa là ngày mua vừa là ngày bán, lời bằng 0. Kết quả vẫn đúng, nhưng thứ tự này thể hiện đúng logic của đề.</p>
<h3>Độ phức tạp</h3>
<p>O(n) thời gian, O(1) bộ nhớ. Với 100.000 ngày chỉ cần 100.000 bước, trong khi thử mọi cặp cần khoảng 5 tỷ bước.</p>
<h3>Mở rộng: trả về cả ngày mua và ngày bán</h3>
{{ex1}}`,
examples:[String.raw`function maxProfit(prices) {
  let minPrice = Infinity;
  let best = 0;
  for (const price of prices) {
    best = Math.max(best, price - minPrice);
    minPrice = Math.min(minPrice, price);
  }
  return best;
}

console.log(maxProfit([2850, 2800, 2900, 2780, 2950, 2910]));`,
String.raw`function bestTrade(prices) {
  let minIdx = 0;
  let best = { profit: 0, buy: null, sell: null };
  for (let i = 1; i < prices.length; i++) {
    const profit = prices[i] - prices[minIdx];
    if (profit > best.profit) best = { profit, buy: minIdx, sell: i };
    if (prices[i] < prices[minIdx]) minIdx = i;
  }
  return best;
}
console.log(bestTrade([2850, 2800, 2900, 2780, 2950, 2910]));`]},
});
