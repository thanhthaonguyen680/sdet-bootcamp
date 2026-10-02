/* Hàm hỗ trợ viết bài giảng: L (nối dòng code), ANAT (mổ xẻ cú pháp), TRACE (bảng). */

const L = (...lines) => lines.join('\n');
// Mổ xẻ một câu lệnh: chuỗi thường là phần không giải thích, [phần, giải_thích] được tô màu và đánh số.
const ANAT_C = ['--sx-k', '--sx-f', '--sx-s', '--sx-n', '--fail', '--warn'];
const ANAT = (...segs) => {
  const e = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const items = [];
  const code = segs.map(sg => {
    if (typeof sg === 'string') return e(sg);
    const c = 'style="--c:var(' + ANAT_C[items.length % ANAT_C.length] + ')"';
    items.push('<li><code class="anat-tok" ' + c + '>' + e(sg[0].trim()) + '</code> ' + sg[1] + '</li>');
    return '<span class="anat-p" ' + c + '>' + e(sg[0]) + '<sup>' + items.length + '</sup></span>';
  }).join('');
  return '<div class="anat"><pre class="anat-code">' + code + '</pre><ol class="anat-list">' + items.join('') + '</ol></div>';
};

const TRACE = (head, rows) => '<div class="tbl"><table><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr>' +
  rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table></div>';
