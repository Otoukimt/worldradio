/* LiveRadio — المشاهدات الحقيقية لكل مقال من Google Analytics 4، يومياً.
   يعمل في GitHub Actions بحساب خدمة (Service Account) للقراءة فقط، ويكتب stats.json
   الذي تعرضه صفحات الموقع ويقرؤه التطبيق. بلا مكتبات خارجية. */
const fs = require('fs');
const crypto = require('crypto');

const KEY = process.env.GA_KEY;            /* محتوى ملف JSON لحساب الخدمة */
const PROP = (process.env.GA_PROPERTY || '').replace(/\D/g, '');   /* رقم الموقع في Analytics */
const START = process.env.GA_START || '2025-01-01';

function b64url(x) { return Buffer.from(x).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); }

async function token(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  }));
  const sig = crypto.createSign('RSA-SHA256').update(head + '.' + body).sign(sa.private_key, 'base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + body + '.' + sig
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('رفضت Google تسجيل الدخول: ' + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

async function main() {
  if (!KEY || !PROP) { console.log('المشاهدات: لم يُضبط GA_KEY أو GA_PROPERTY بعد — لا تغيير.'); return; }
  let sa; try { sa = JSON.parse(KEY); } catch (e) { console.log('المشاهدات: GA_KEY ليس JSON صالحاً.'); process.exitCode = 1; return; }
  const t = await token(sa);
  const views = {};
  let offset = 0;
  for (;;) {
    const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`, {
      method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: START, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }],
        dimensionFilter: { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'CONTAINS', value: '/articles/' } } },
        limit: 10000, offset
      })
    });
    const j = await r.json();
    if (j.error) throw new Error('Analytics: ' + j.error.message);
    const rows = j.rows || [];
    for (const row of rows) {
      /* /articles/slug.html و/articles/slug.html?x=… تُجمع معاً */
      const m = row.dimensionValues[0].value.match(/\/articles\/([a-z0-9-]+)\.html/);
      if (!m) continue;
      views[m[1]] = (views[m[1]] || 0) + Number(row.metricValues[0].value || 0);
    }
    if (rows.length < 10000) break;
    offset += 10000;
  }
  /* نُبقي المقالات الموجودة فقط، بترتيب الأكثر قراءة */
  let slugs = null;
  try { slugs = new Set(JSON.parse(fs.readFileSync('articles.json', 'utf8')).map(a => a.slug)); } catch (e) {}
  const out = {};
  Object.keys(views).filter(s => !slugs || slugs.has(s)).sort((a, b) => views[b] - views[a]).forEach(s => out[s] = views[s]);
  fs.writeFileSync('stats.json', JSON.stringify(out, null, 1) + '\n');
  /* الموقع كله: الزوار الفعليون (مستخدمون فريدون) والمشاهدات، منذ البداية */
  const rt = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`, {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateRanges: [{ startDate: START, endDate: 'today' }], metrics: [{ name: 'totalUsers' }, { name: 'screenPageViews' }] })
  });
  const jt = await rt.json();
  if (jt.error) throw new Error('Analytics (الإجمالي): ' + jt.error.message);
  const mv = (jt.rows && jt.rows[0] && jt.rows[0].metricValues) || [];
  const site = { users: Number((mv[0] || {}).value || 0), views: Number((mv[1] || {}).value || 0), since: START, updated: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync('site-stats.json', JSON.stringify(site, null, 1) + '\n');
  console.log(`الموقع: ${site.users} زائر · ${site.views} مشاهدة صفحة.`);
  const total = Object.values(out).reduce((a, b) => a + b, 0);
  console.log(`المشاهدات: ${Object.keys(out).length} مقالاً · ${total} مشاهدة منذ ${START}.`);
}
main().catch(e => { console.log('المشاهدات: ' + e.message); process.exitCode = 1; });
