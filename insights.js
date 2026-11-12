/* LiveRadio — رؤى يومية بحساب الخدمة نفسه (قراءة فقط):
   ١. Search Console: الكلمات التي جلبت الزوار، والصفحات الأقوى
   ٢. الأرشفة: هل أرشف جوجل كل مقال وصفحة دولة مهمة؟
   ٣. Analytics: المحطات التي تتعطّل عند الزوار، والأكثر تشغيلاً
   ٤. السرعة: درجات PageSpeed، أسبوعياً
   كل قسم مستقل: إن فشل أحدها كُتب سببه وبقيت الأقسام الأخرى. النتيجة insights.json */
const fs = require('fs');
const crypto = require('crypto');

const KEY = process.env.GA_KEY;
const PROP = (process.env.GA_PROPERTY || '').replace(/\D/g, '');
const PSI_KEY = process.env.PSI_KEY || '';
const SITE = 'https://worldliveradio.com';
const errors = [];

function b64url(x) { return Buffer.from(x).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); }
async function token(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = crypto.createSign('RSA-SHA256').update(head + '.' + body).sign(sa.private_key, 'base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + body + '.' + sig });
  const j = await r.json();
  if (!j.access_token) throw new Error('رفضت Google الدخول: ' + JSON.stringify(j).slice(0, 160));
  return j.access_token;
}
async function api(t, url, body) {
  const r = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error((j.error && (j.error.message || j.error.status)) || ('HTTP ' + r.status));
  return j;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const day = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const slugOf = u => (u.match(/\/articles\/([a-z0-9-]+)\.html/) || [])[1] || '';

/* ===== ١. Search Console ===== */
async function search(t) {
  const sites = (await api(t, 'https://www.googleapis.com/webmasters/v3/sites')).siteEntry || [];
  const site = (sites.find(s => s.siteUrl === 'sc-domain:worldliveradio.com') || sites.find(s => /worldliveradio\.com/.test(s.siteUrl)) || {}).siteUrl;
  if (!site) throw new Error('حساب الخدمة غير مضاف في Search Console بعد');
  const base = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(site) + '/searchAnalytics/query';
  const range = { startDate: day(30), endDate: day(2) };   /* بيانات Search Console تتأخر يومين */
  const q = await api(t, base, { ...range, dimensions: ['query'], rowLimit: 150 });
  const p = await api(t, base, { ...range, dimensions: ['page'], rowLimit: 60 });
  const tot = await api(t, base, { ...range });
  const r1 = x => Math.round(x * 10) / 10;
  return {
    site, range,
    totals: { clicks: (tot.rows && tot.rows[0] && tot.rows[0].clicks) || 0, impressions: (tot.rows && tot.rows[0] && tot.rows[0].impressions) || 0 },
    queries: (q.rows || []).map(r => ({ q: r.keys[0], c: r.clicks, i: r.impressions, p: r1(r.position) })),
    pages: (p.rows || []).map(r => ({ u: r.keys[0].replace(SITE, ''), c: r.clicks, i: r.impressions, p: r1(r.position) }))
  };
}

/* ===== ٢. الأرشفة: المقالات، وصفحات الدول ذات المقالات، والرئيسية ===== */
async function index(t, site) {
  let urls = [];
  try {
    const x = fs.readFileSync('sitemap.xml', 'utf8');
    const re = /<loc>([^<]+)<\/loc>[\s\S]*?<priority>([\d.]+)<\/priority>/g; let m;
    /* كل صفحات الخريطة، والأهم أولاً: إن ضاق الوقت يوماً، تُفحص المقالات وصفحات الدول ذات المقالات قبل غيرها */
    const all = []; while ((m = re.exec(x))) all.push({ u: m[1], p: Number(m[2]) });
    all.sort((a, b) => b.p - a.p);
    urls = all.map(o => o.u);
  } catch (e) { throw new Error('لم أجد sitemap.xml'); }
  urls = urls.slice(0, 600);
  let old = {}; try { (JSON.parse(fs.readFileSync('insights.json', 'utf8')).index || []).forEach(o => old[o.u] = o); } catch (e) {}
  const out = [];
  let quotaHit = false;
  for (const u of urls) {
    const short = u.replace(SITE, '') || '/';
    /* المؤرشف لا نعيد فحصه إلا كل أسبوع: الحصة 2000 فحص في اليوم، ونريد أن نبقى بعيدين عنها */
    const o = old[short];
    if (o && o.v === 'PASS' && o.at && (Date.now() - Date.parse(o.at)) < 7 * 864e5) { out.push(o); continue; }
    /* «Internal error» خطأ مؤقت من جوجل حين تتتابع الطلبات بسرعة: نتمهّل بين الطلبات، ونعيد مرتين،
       وإن بقي الخطأ نحتفظ بآخر نتيجة سليمة بدل أن نكتب «خطأ» */
    let done = false;
    for (let tryN = 0; tryN < 3 && !done; tryN++) {
      if (tryN) await sleep(2500 * tryN);
      try {
        const r = await api(t, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: site });
        const s = (r.inspectionResult && r.inspectionResult.indexStatusResult) || {};
        out.push({ u: short, v: s.verdict || '', st: s.coverageState || '', crawl: (s.lastCrawlTime || '').slice(0, 10), at: new Date().toISOString().slice(0, 10) });
        done = true;
      } catch (e) {
        if (/quota/i.test(e.message)) { out.push(o || { u: short, v: 'WAIT', st: 'تجاوز حصة الفحص اليومية، يُكمَل غداً', at: '' }); done = true; quotaHit = true; }
        else if (tryN === 2) out.push(o && o.v !== 'ERR' ? o : { u: short, v: 'WAIT', st: 'خطأ مؤقت من جوجل، يُعاد الفحص في التحديث القادم', at: '' });
      }
    }
    if (quotaHit) break;
    await sleep(700);
  }
  return out;
}

/* ===== ٣. المحطات من Analytics ===== */
async function stations(t) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`;
  const rep = ev => api(t, url, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'customEvent:station_name' }], metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: ev } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 60
  });
  const rows = j => (j.rows || []).map(r => ({ n: r.dimensionValues[0].value, c: Number(r.metricValues[0].value) }))
    .filter(x => x.n && x.n !== '(not set)');
  const [f, rp, pl] = await Promise.all([rep('station_failed'), rep('station_report'), rep('play_station')]);
  const reports = {}; rows(rp).forEach(x => reports[x.n] = x.c);
  const plays = {}; rows(pl).forEach(x => plays[x.n] = x.c);
  const failed = rows(f).map(x => ({ n: x.n, fails: x.c, reports: reports[x.n] || 0, plays: plays[x.n] || 0 }));
  Object.keys(reports).forEach(n => { if (!failed.find(x => x.n === n)) failed.push({ n, fails: 0, reports: reports[n], plays: plays[n] || 0 }); });
  failed.sort((a, b) => (b.fails + b.reports * 3) - (a.fails + a.reports * 3));
  return { failed: failed.slice(0, 40), played: rows(pl).slice(0, 25) };
}

/* ===== ٤. السرعة: أسبوعياً (الإثنين) أو عند التشغيل اليدوي ===== */
async function speed() {
  const pages = ['/', '/articles.html'];
  try { const a = JSON.parse(fs.readFileSync('articles.json', 'utf8')).sort((x, y) => (y.date || '').localeCompare(x.date || ''))[0]; if (a) pages.push('/articles/' + a.slug + '.html'); } catch (e) {}
  const out = [];
  for (const p of pages) {
    const u = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&url=' + encodeURIComponent(SITE + p) +
      ['performance', 'accessibility', 'best-practices', 'seo'].map(c => '&category=' + c).join('') + (PSI_KEY ? '&key=' + PSI_KEY : '');
    const r = await fetch(u); const j = await r.json().catch(() => ({}));
    if (j.error) throw new Error('PageSpeed: ' + (j.error.message || j.error.status).slice(0, 120));
    const c = (j.lighthouseResult && j.lighthouseResult.categories) || {};
    const s = k => c[k] ? Math.round(c[k].score * 100) : null;
    const au = (j.lighthouseResult && j.lighthouseResult.audits) || {};
    out.push({ u: p, perf: s('performance'), a11y: s('accessibility'), bp: s('best-practices'), seo: s('seo'),
      lcp: au['largest-contentful-paint'] ? au['largest-contentful-paint'].displayValue : '', cls: au['cumulative-layout-shift'] ? au['cumulative-layout-shift'].displayValue : '' });
  }
  return { date: day(0), pages: out };
}

async function main() {
  if (!KEY) { console.log('الرؤى: لم يُضبط GA_KEY — لا تغيير.'); return; }
  const sa = JSON.parse(KEY);
  let old = {}; try { old = JSON.parse(fs.readFileSync('insights.json', 'utf8')); } catch (e) {}
  const out = { updated: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC' };
  let gsc = null;
  try {
    gsc = await token(sa, 'https://www.googleapis.com/auth/webmasters.readonly');
    out.search = await search(gsc);
    console.log(`Search Console: ${out.search.queries.length} كلمة · ${out.search.totals.clicks} نقرة · ${out.search.totals.impressions} ظهور`);
  } catch (e) { errors.push('Search Console: ' + e.message); out.search = old.search || null; }
  try {
    if (gsc && out.search) { out.index = await index(gsc, out.search.site); console.log(`الأرشفة: ${out.index.filter(x => x.v === 'PASS').length} مؤرشفة من ${out.index.length}`); }
    else out.index = old.index || [];
  } catch (e) { errors.push('الأرشفة: ' + e.message); out.index = old.index || []; }
  try {
    if (!PROP) throw new Error('GA_PROPERTY غير مضبوط');
    const ga = await token(sa, 'https://www.googleapis.com/auth/analytics.readonly');
    out.stations = await stations(ga);
    console.log(`المحطات: ${out.stations.failed.length} محطة بها أعطال · ${out.stations.played.length} الأكثر تشغيلاً`);
  } catch (e) { errors.push('المحطات: ' + e.message); out.stations = old.stations || null; }
  const monday = new Date().getUTCDay() === 1;
  if (monday || process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' || !old.speed) {
    try { out.speed = await speed(); console.log('السرعة: ' + out.speed.pages.map(p => p.u + ' ' + p.perf).join(' · ')); }
    catch (e) { errors.push('السرعة: ' + e.message); out.speed = old.speed || null; }
  } else out.speed = old.speed || null;
  out.errors = errors;
  fs.writeFileSync('insights.json', JSON.stringify(out, null, 1) + '\n');
  if (errors.length) console.log('تنبيهات:\n- ' + errors.join('\n- '));
}
main().catch(e => { console.log('الرؤى: ' + e.message); process.exitCode = 1; });
