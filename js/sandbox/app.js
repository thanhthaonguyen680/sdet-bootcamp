/* Sàn Demo: bộ điều khiển trang, điều hướng và chờ trang sẵn sàng. */

const APP_BASE = 'https://sandemo.test';

const App = {
  frame: null, doc: null, win: null, readyP: null, state: freshAppState(), path: 'about:blank', query: {}, search: '', token: 0, bugs: new Set(), fast: false,
  init(){
    if (this.readyP) return this.readyP;
    this.frame = document.getElementById('appFrame');
    this.readyP = new Promise(res => {
      this.frame.addEventListener('load', () => {
        this.doc = this.frame.contentDocument; this.win = this.frame.contentWindow;
        this.doc.addEventListener('click', e => {
          const a = e.target.closest && e.target.closest('a[href]');
          if (a && !e.defaultPrevented){ e.preventDefault(); this.navigate(a.getAttribute('href')); }
        });
        this.doc.addEventListener('submit', e => e.preventDefault());
        res();
      }, { once: true });
      this.frame.srcdoc = APP_SHELL;
    });
    return this.readyP;
  },
  reset(){ this.state = freshAppState(); this.bugs = new Set(); },
  bug(n){ return this.bugs.has(n); },
  alive(t){ return t === this.token; },
  navigate(url){
    let u = String(url || '/');
    if (u === 'about:blank'){ this.path = 'about:blank'; this.search = ''; this.query = {}; this.token++; this.doc.title = ''; this.doc.body.innerHTML = ''; appUrlUpdate(); return; }
    if (u.startsWith(APP_BASE)) u = u.slice(APP_BASE.length) || '/';
    if (!u.startsWith('/')) u = '/' + u;
    const qi = u.indexOf('?');
    let p = qi >= 0 ? u.slice(0, qi) : u; const q = qi >= 0 ? u.slice(qi + 1) : '';
    if (p === '/') p = '/login';
    const route = APP_ROUTES[p] || APP_ROUTES['/404'];
    this.path = p; this.search = q ? '?' + q : ''; this.query = Object.fromEntries(new URLSearchParams(q));
    this.token++;
    this.doc.title = route.title;
    this.doc.body.innerHTML = route.render(this.state, this);
    this.win.scrollTo(0, 0);
    if (route.setup) route.setup(this.doc, this, this.token);
    appUrlUpdate();
  },
  fullUrl(){ return this.path === 'about:blank' ? 'about:blank' : APP_BASE + this.path + this.search; },
};
function appUrlUpdate(){ const el = document.getElementById('appUrl'); if (el) el.textContent = App.fullUrl(); }
const pwSleep = ms => new Promise(r => setTimeout(r, ms));
async function appWaitReady(){
  if (App.path === '/dashboard'){
    const t0 = performance.now();
    while (performance.now() - t0 < 3000 && App.doc.querySelector('.loading')) await pwSleep(30);
  }
}
