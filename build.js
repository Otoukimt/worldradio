const fs = require('fs');
const path = require('path');

/* ===== أسماء الدول بالعربية ===== */
const CN_AR = {
AF:'أفغانستان',AL:'ألبانيا',DZ:'الجزائر',AD:'أندورا',AO:'أنغولا',AR:'الأرجنتين',AM:'أرمينيا',
AU:'أستراليا',AT:'النمسا',AZ:'أذربيجان',BH:'البحرين',BD:'بنغلاديش',BY:'بيلاروسيا',BE:'بلجيكا',
BJ:'بنين',BO:'بوليفيا',BA:'البوسنة والهرسك',BW:'بوتسوانا',BR:'البرازيل',BG:'بلغاريا',BF:'بوركينا فاسو',
BI:'بوروندي',KH:'كمبوديا',CM:'الكاميرون',CA:'كندا',CV:'الرأس الأخضر',CF:'إفريقيا الوسطى',TD:'تشاد',
CL:'تشيلي',CN:'الصين',CO:'كولومبيا',KM:'جزر القمر',CG:'الكونغو',CD:'الكونغو الديمقراطية',CR:'كوستاريكا',
CI:'ساحل العاج',HR:'كرواتيا',CU:'كوبا',CY:'قبرص',CZ:'التشيك',DK:'الدنمارك',DJ:'جيبوتي',DO:'الدومينيكان',
EC:'الإكوادور',EG:'مصر',SV:'السلفادور',EE:'إستونيا',ET:'إثيوبيا',FI:'فنلندا',FR:'فرنسا',GA:'الغابون',
GM:'غامبيا',GE:'جورجيا',DE:'ألمانيا',GH:'غانا',GR:'اليونان',GT:'غواتيمالا',GN:'غينيا',HT:'هايتي',
HN:'هندوراس',HK:'هونغ كونغ',HU:'المجر',IS:'آيسلندا',IN:'الهند',ID:'إندونيسيا',IR:'إيران',IQ:'العراق',
IE:'أيرلندا',IL:'إسرائيل',IT:'إيطاليا',JM:'جامايكا',JP:'اليابان',JO:'الأردن',KZ:'كازاخستان',KE:'كينيا',
KW:'الكويت',KG:'قيرغيزستان',LA:'لاوس',LV:'لاتفيا',LB:'لبنان',LY:'ليبيا',LT:'ليتوانيا',LU:'لوكسمبورغ',
MK:'مقدونيا الشمالية',MG:'مدغشقر',MW:'مالاوي',MY:'ماليزيا',ML:'مالي',MT:'مالطا',MR:'موريتانيا',
MU:'موريشيوس',MX:'المكسيك',MD:'مولدوفا',MN:'منغوليا',ME:'الجبل الأسود',MA:'المغرب',MZ:'موزمبيق',
MM:'ميانمار',NA:'ناميبيا',NP:'نيبال',NL:'هولندا',NZ:'نيوزيلندا',NI:'نيكاراغوا',NE:'النيجر',
NG:'نيجيريا',KP:'كوريا الشمالية',NO:'النرويج',OM:'عُمان',PK:'باكستان',PS:'فلسطين',PA:'بنما',
PY:'باراغواي',PE:'بيرو',PH:'الفلبين',PL:'بولندا',PT:'البرتغال',PR:'بورتوريكو',QA:'قطر',RO:'رومانيا',
RU:'روسيا',RW:'رواندا',SA:'السعودية',SN:'السنغال',RS:'صربيا',SG:'سنغافورة',SK:'سلوفاكيا',SI:'سلوفينيا',
SO:'الصومال',ZA:'جنوب إفريقيا',KR:'كوريا الجنوبية',SS:'جنوب السودان',ES:'إسبانيا',LK:'سريلانكا',
SD:'السودان',SE:'السويد',CH:'سويسرا',SY:'سوريا',TW:'تايوان',TJ:'طاجيكستان',TZ:'تنزانيا',TH:'تايلاند',
TG:'توغو',TN:'تونس',TR:'تركيا',TM:'تركمانستان',UG:'أوغندا',UA:'أوكرانيا',AE:'الإمارات',
GB:'المملكة المتحدة',US:'الولايات المتحدة',UY:'أوروغواي',UZ:'أوزبكستان',VE:'فنزويلا',VN:'فيتنام',
YE:'اليمن',ZM:'زامبيا',ZW:'زيمبابوي'
};

/* مرايا متعددة: إن تعثّرت واحدة نجرّب التالية */
const MIRRORS = [
  'https://de2.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

async function fetchCountries() {
  for (const m of MIRRORS) {
    try {
      const res = await fetch(m + '/json/countries?order=stationcount&reverse=true&limit=300', {
        headers: { 'User-Agent': 'worldliveradio-ssg/1.0' }
      });
      if (!res.ok) continue;
      const d = await res.json();
      if (Array.isArray(d) && d.length) return d;
    } catch (e) {}
  }
  return [];
}

/* الحروف المزيّنة تتحول إلى أصلها: Côte → cote، Türkiye → turkiye، Réunion → reunion */
function slugify(name) {
  return String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
/* الطريقة القديمة كانت تحذف هذه الحروف (c-te-d-ivoire). نبقي روابطها القديمة
   صفحاتِ تحويل فورية، حتى لا يجد من يفتحها — أو جوجل — صفحة خطأ */
function oldSlugify(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function redirectPage(slug, en) {
  const to = '/countries/' + slug + '.html';
  return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n' +
    '<title>' + esc(en) + ' Radio Live | LiveRadio</title>\n' +
    '<link rel="canonical" href="https://worldliveradio.com' + to + '">\n' +
    '<meta http-equiv="refresh" content="0; url=' + to + '">\n' +
    '<script>location.replace(' + JSON.stringify(to) + '+location.search+location.hash);</script>\n' +
    '</head><body><p>This page has moved to <a href="' + to + '">' + esc(en) + ' radio</a>.</p></body></html>\n';
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ===== البيانات المنظمة (JSON-LD) =====
   أنواع يدعمها جوجل فعلاً: مسار التنقل (Breadcrumb)، المقال (Article)، واسم الموقع.
   لا تقييمات ولا نجوم: جوجل يمنع التقييمات التي يكتبها الموقع عن نفسه. */
const SITE_URL = 'https://worldliveradio.com';
const ORG = { '@type': 'Organization', '@id': SITE_URL + '/#org', name: 'LiveRadio', url: SITE_URL + '/',
  logo: { '@type': 'ImageObject', url: SITE_URL + '/icon-512.png', width: 512, height: 512 } };
function ldScript(graph) {
  /* "</" داخل النص قد يُغلق الوسم مبكراً */
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1)
    .replace(/</g, '\\u003c');
  return '<script type="application/ld+json">\n' + json + '\n</script>';
}
function plain(html, n) {
  const t = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  if (!n || t.length <= n) return t;
  const cut = t.slice(0, n); return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 20)).trim() + '…';
}
function countryLd(o) {
  const url = `${SITE_URL}/countries/${o.slug}.html`;
  const g = [];
  const page = {
    '@type': 'CollectionPage', '@id': url + '#page', url,
    name: `${o.en} Radio Live — Free Online Radio Stations`,
    description: `Listen to ${o.en} radio live online, free. News, music, sport and talk stations from ${o.en}.`,
    inLanguage: ['en', 'ar'], isPartOf: { '@id': SITE_URL + '/#website' },
    about: { '@type': 'Country', name: o.en }, breadcrumb: { '@id': url + '#crumbs' }, dateModified: o.date
  };
  g.push(page);
  g.push({ '@type': 'BreadcrumbList', '@id': url + '#crumbs', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'LiveRadio', item: SITE_URL + '/' },
    { '@type': 'ListItem', position: 2, name: `${o.en} Radio`, item: url } ] });
  if (o.descEn || o.descAr) {
    const words = plain(o.descEn || o.descAr).split(' ').length;
    const art = {
      '@type': 'Article', '@id': url + '#article', mainEntityOfPage: { '@id': url + '#page' },
      headline: `Radio in ${o.en}: history and main stations`.slice(0, 110),
      alternativeHeadline: `الإذاعة في ${o.ar}: التاريخ وأبرز المحطات`,
      description: plain(o.descEn || o.descAr, 160),
      inLanguage: ['en', 'ar'], wordCount: words,
      datePublished: o.date, dateModified: o.date,
      author: { '@id': SITE_URL + '/#org' }, publisher: { '@id': SITE_URL + '/#org' },
      about: { '@type': 'Country', name: o.en }
    };
    if (o.sources && o.sources.length)
      art.citation = o.sources.map(x => ({ '@type': 'CreativeWork', name: x.t || x.u, url: x.u }));
    g.push(art);
    page.mainEntity = { '@id': url + '#article' };
  }
  g.push(ORG);
  return ldScript(g);
}
function articleLd(a) {
  const url = `${SITE_URL}/articles/${a.slug}.html`;
  const t = a.title || {}, d = a.desc || {};
  const art = {
    '@type': 'Article', '@id': url + '#article', url, mainEntityOfPage: url,
    headline: String(t.en || t.ar || a.slug).slice(0, 110),
    description: plain(d.en || d.ar, 160), inLanguage: ['en', 'ar'],
    datePublished: a.date, dateModified: a.updated || a.date,
    author: { '@id': SITE_URL + '/#org' }, publisher: { '@id': SITE_URL + '/#org' },
    isPartOf: { '@id': SITE_URL + '/#website' }
  };
  if (t.ar && t.en) art.alternativeHeadline = String(t.ar);
  if (a.tag && a.tag.en) art.articleSection = a.tag.en;
  if (a.kw && ((a.kw.en || []).length || (a.kw.ar || []).length))
    art.keywords = [].concat(a.kw.en || [], a.kw.ar || []).slice(0, 16).join(', ');
  return ldScript([art,
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'LiveRadio', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: SITE_URL + '/articles.html' },
      { '@type': 'ListItem', position: 3, name: String(t.en || t.ar || a.slug).slice(0, 110), item: url } ] },
    ORG]);
}
/* صفحات المقالات يكتبها التطبيق؛ نضيف إليها الكتلة بين علامتين، فإن أعاد التطبيق
   كتابة المقال، تعود الكتلة في البناء التالي. لا نكتب الملف إلا إن تغيّر. */
function injectArticles(root) {
  let arts = [];
  try { arts = JSON.parse(fs.readFileSync(path.join(root, 'articles.json'), 'utf8')); } catch (e) { return 0; }
  let n = 0;
  arts.forEach(a => {
    if (!a || !a.slug || !/^[a-z0-9-]+$/.test(a.slug)) return;
    const f = path.join(root, 'articles', a.slug + '.html');
    if (!fs.existsSync(f)) return;
    const html = fs.readFileSync(f, 'utf8');
    const block = '<!--ld:start-->\n' + articleLd(a) + '\n<!--ld:end-->';
    let out;
    if (html.includes('<!--ld:start-->')) out = html.replace(/<!--ld:start-->[\s\S]*?<!--ld:end-->/, () => block);
    else if (html.includes('</head>')) out = html.replace('</head>', () => block + '\n</head>');
    else return;
    /* محرك الإعلانات (مطفأ حتى يُشغَّل ads.json) */
    out = out.replace('<script src="/assets/ads.js" defer></script>', '<script src="/ads.js" defer></script>');
    if (!out.includes('/ads.js"') && out.includes('</body>'))
      out = out.replace('</body>', () => '<script src="/ads.js" defer></script>\n</body>');
    /* أزرار المشاركة، زر محطات الدولة، الكلمات المفتاحية، والصورة كاملة */
    if (!out.includes('/art.js"') && out.includes('</body>'))
      out = out.replace('</body>', () => '<script src="/art.js" defer></script>\n</body>');
    if (!out.includes('/social.js"') && out.includes('</body>'))
      out = out.replace('</body>', () => '<script src="/social.js" defer></script>\n</body>');
    if (out !== html) { fs.writeFileSync(f, out); n++; }
  });
  return n;
}

/* ===== فحص الروابط =====
   الداخلية: في كل بناء (سريع، من الملفات نفسها).
   الخارجية (المصادر وروابط المقالات): أسبوعياً أو عند التشغيل اليدوي فقط،
   حتى لا نطرق مواقع الناس مع كل نشر. النتيجة في link-report.txt */
function listHtml(dir, rel) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f), r = rel ? rel + '/' + f : f;
    if (f.startsWith('.') || f === 'node_modules') continue;
    if (fs.statSync(full).isDirectory()) { if (['articles', 'countries'].includes(r)) out = out.concat(listHtml(full, r)); }
    else if (f.endsWith('.html') && f !== 'country-template.html') out.push(r);
  }
  return out;
}
function decodeAttr(t) { return t.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); }
function linksOf(html) {
  const out = [];
  /* روابط تبنيها السكربتات أجزاءً ('./' + slug) ليست روابط حقيقية */
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  const take = h => { const re = /href=["']([^"']+)["']/g; let m; while ((m = re.exec(h))) out.push(m[1]); };
  take(html);
  const re2 = /data-(?:en|ar)="([^"]*)"/g; let m;
  while ((m = re2.exec(html))) take(decodeAttr(m[1]));
  return out;
}
const SKIP_HOSTS = /(^|\.)(googleapis|gstatic|googletagmanager|googlesyndication|google-analytics)\.com$/;
async function checkUrl(u) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LiveRadioLinkCheck/1.0; +https://worldliveradio.com)', 'Accept': 'text/html,*/*' } });
    try { r.body && r.body.cancel && r.body.cancel(); } catch (e) {}
    if (r.status === 404 || r.status === 410) return 'broken:' + r.status;
    if (r.status >= 400) return 'blocked:' + r.status;    /* مواقع تمنع البرامج الآلية — ليست بالضرورة معطلة */
    return 'ok';
  } catch (e) {
    const c = (e.cause && e.cause.code) || e.name || 'error';
    return /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|CERT|ERR_TLS/i.test(c) ? 'broken:' + c : 'blocked:' + c;
  } finally { clearTimeout(t); }
}
async function checkLinks(root) {
  const SITE = 'https://worldliveradio.com/';
  const pages = listHtml(root, '');
  const exists = new Set(pages.concat(['articles.json', 'site.json', 'countries-index.json', 'sitemap.xml',
    'ads.json', 'ads.js', 'llms.txt', 'robots.txt', 'manifest.json', 'icon-192.png', 'icon-512.png', 'blocked-stations.json']));
  fs.readdirSync(root).forEach(f => exists.add(f));
  const internal = [], ext = new Map();
  for (const pg of pages) {
    const html = fs.readFileSync(path.join(root, pg), 'utf8');
    const base = html.includes('<base href="/">') ? SITE : SITE + pg;
    for (const h of linksOf(html)) {
      if (/^(mailto:|tel:|javascript:|#|data:)/.test(h) || h.includes('{{')) continue;
      let u; try { u = new URL(h, base); } catch (e) { continue; }
      if (u.host && u.host !== 'worldliveradio.com') {
        if (!SKIP_HOSTS.test(u.host) && /^https?:$/.test(u.protocol)) {
          const k = u.href.split('#')[0]; if (!ext.has(k)) ext.set(k, new Set()); ext.get(k).add(pg);
        }
        continue;
      }
      let p = decodeURIComponent(u.pathname).replace(/^\//, '');
      if (p === '' || p.endsWith('/')) p += 'index.html';
      if (!exists.has(p)) internal.push({ page: pg, link: h });
    }
  }
  /* مصادر مقالات الدول من countries.json أيضاً */
  try {
    JSON.parse(fs.readFileSync(path.join(root, 'countries.json'), 'utf8')).forEach(c =>
      (c.sources || []).forEach(x => { if (x && x.u) { if (!ext.has(x.u)) ext.set(x.u, new Set()); ext.get(x.u).add('countries/' + (c.slug || c.cc) + '.html'); } }));
  } catch (e) {}

  let old = {}; try { old = JSON.parse(fs.readFileSync(path.join(root, 'link-report.json'), 'utf8')); } catch (e) {}
  const ev = process.env.GITHUB_EVENT_NAME || '';
  let external = old.external || null;
  if (process.env.GITHUB_ACTIONS && (ev === 'schedule' || ev === 'workflow_dispatch')) {
    const urls = [...ext.keys()], res = {};
    let i = 0;
    await Promise.all(Array.from({ length: 6 }, async () => { while (i < urls.length) { const u = urls[i++]; res[u] = await checkUrl(u); } }));
    external = { checked: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC', total: urls.length,
      broken: urls.filter(u => res[u].startsWith('broken')).map(u => ({ url: u, why: res[u].split(':')[1], pages: [...ext.get(u)] })),
      blocked: urls.filter(u => res[u].startsWith('blocked')).map(u => ({ url: u, why: res[u].split(':')[1], pages: [...ext.get(u)] })) };
  }
  const report = { built: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC', pages: pages.length, internal, external };
  fs.writeFileSync(path.join(root, 'link-report.json'), JSON.stringify(report, null, 1));

  const L = [];
  L.push('تقرير الروابط — LiveRadio', 'آخر بناء: ' + report.built + '  |  الصفحات المفحوصة: ' + report.pages, '');
  L.push('== الروابط الداخلية المعطلة: ' + internal.length + ' ==');
  internal.forEach(x => L.push('  ✗ ' + x.page + '  ←  ' + x.link));
  if (!internal.length) L.push('  ✓ لا شيء');
  L.push('');
  if (external) {
    L.push('== الروابط الخارجية (آخر فحص: ' + external.checked + ' — ' + external.total + ' رابطاً) ==', '');
    L.push('معطلة فعلاً (' + external.broken.length + ') — استبدلها:');
    external.broken.forEach(x => L.push('  ✗ ' + x.url + '  [' + x.why + ']  في: ' + x.pages.join('، ')));
    if (!external.broken.length) L.push('  ✓ لا شيء');
    L.push('', 'لم يُتح فحصها (' + external.blocked.length + ') — غالباً تعمل، لكن الموقع يمنع البرامج الآلية. افتحها يدوياً إن شئت:');
    external.blocked.forEach(x => L.push('  ? ' + x.url + '  [' + x.why + ']'));
    if (!external.blocked.length) L.push('  ✓ لا شيء');
  } else L.push('== الروابط الخارجية: تُفحص أسبوعياً، أو حين تشغّل الأتمتة يدوياً من Actions ==');
  fs.writeFileSync(path.join(root, 'link-report.txt'), L.join('\n') + '\n');
  console.log('فحص الروابط: داخلية معطلة ' + internal.length + (external ? ' | خارجية معطلة ' + external.broken.length + ' من ' + external.total : ''));
}


async function generatePages() {
  const root = __dirname;
  const template = fs.readFileSync(path.join(root, 'country-template.html'), 'utf8');

  let custom = [];
  const dataPath = path.join(root, 'countries.json');
  if (fs.existsSync(dataPath)) {
    try { custom = JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch (e) {}
  }

  console.log('جاري جلب الدول...');
  const all = await fetchCountries();
  if (!all.length) { console.error('تعذّر جلب الدول — تم إيقاف التوليد'); process.exit(1); }

  const outDir = path.join(root, 'countries');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const today = new Date().toISOString().split('T')[0];
  const OLD = readOldSitemap(root);
  const pages = [];

  all.forEach(c => {
    if (!c.iso_3166_1 || c.iso_3166_1.length !== 2) return;
    if ((c.stationcount || 0) < 5) return;

    const cc = c.iso_3166_1.toUpperCase();
    const en = c.name;
    const ar = CN_AR[cc] || en;
    const slug = slugify(en);
    if (!slug) return;

    const my = custom.find(a => (a.cc || '').toUpperCase() === cc) || {};
    const descEn = my.descEn || '';
    const descAr = my.descAr || '';
    /* بلا مقال: نحتفظ بالتاريخ السابق، حتى لا تبدو كل الصفحات «معدّلة» كل أسبوع */
    const date = my.date || OLD[`https://worldliveradio.com/countries/${slug}.html`] || today;
    const hide = (!descEn && !descAr) ? ' style="display:none"' : '';
    const srcs = (Array.isArray(my.sources) ? my.sources : [])
      .filter(x => x && /^https?:\/\//.test(x.u || ''));
    const sourcesHtml = srcs.length
      ? '<div class="srcs"><h3 data-en="Sources" data-ar="المصادر">Sources</h3><ol>' +
        srcs.map(x => '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener nofollow">' +
          esc(x.t || x.u) + '</a></li>').join('') + '</ol></div>'
      : '';

    const html = template
      .replace(/\{\{cc\}\}/g, cc)
      .replace(/\{\{slug\}\}/g, slug)
      .replace(/\{\{en\}\}/g, esc(en))
      .replace(/\{\{ar\}\}/g, esc(ar))
      .replace(/\{\{date\}\}/g, date)
      /* دالة بدل نص: حتى لا تُفسَّر علامة $ داخل المقال كرمز استبدال */
      .replace(/\{\{descEn\}\}/g, () => descEn)
      .replace(/\{\{descAr\}\}/g, () => descAr)
      .replace(/\{\{sources\}\}/g, () => sourcesHtml)
      .replace(/\{\{jsonld\}\}/g, () => countryLd({ slug, en, ar, date, descEn, descAr, sources: srcs }))
      .replace('id="aboutSec"', 'id="aboutSec"' + hide);

    fs.writeFileSync(path.join(outDir, slug + '.html'), html);
    pages.push({ cc, slug, en, ar, n: c.stationcount, hasArticle: !!(descEn || descAr), date });
    const legacy = oldSlugify(en);
    if (legacy && legacy !== slug) fs.writeFileSync(path.join(outDir, legacy + '.html'), redirectPage(slug, en));
  });

  /* فهرس تقرؤه الصفحة الرئيسية: الدول التي لها مقال أولاً */
  pages.sort((a, b) => (b.hasArticle - a.hasArticle) || (b.n - a.n));
  const index = pages.map(p => {
    const my = custom.find(a => (a.cc || '').toUpperCase() === p.cc) || {};
    const strip = t => String(t || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
    return {
      cc: p.cc, slug: p.slug, en: p.en, ar: p.ar, date: p.date, n: p.n,
      descEn: strip(my.descEn), descAr: strip(my.descAr)
    };
  });
  fs.writeFileSync(path.join(root, 'countries-index.json'), JSON.stringify(index, null, 2));

  /* خريطة الموقع: الصفحات التي فيها مقال أعلى أولوية */
  const nArt = injectArticles(root);
  console.log('البيانات المنظمة: حُدّث ' + nArt + ' مقالاً.');
  const before = OLD;
  const after = buildSitemap(root, pages, OLD);
  await notifyIndexNow(before, after);
  await checkLinks(root);

  console.log('تم توليد ' + pages.length + ' صفحة دولة.');
  console.log('منها ' + pages.filter(p => p.hasArticle).length + ' صفحة تحمل مقالاً.');
}

function readOldSitemap(root) {
  const map = {};
  try {
    const x = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    const re = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
    let m;
    while ((m = re.exec(x))) map[m[1]] = m[2];
  } catch (e) {}
  return map;
}

function buildSitemap(root, pages, OLD) {
  const SITE = 'https://worldliveradio.com';
  const today = new Date().toISOString().split('T')[0];
  let arts = [];
  try { arts = JSON.parse(fs.readFileSync(path.join(root, 'articles.json'), 'utf8')); } catch (e) {}

  /* الرئيسية وصفحة المقالات تتغيّران حين يُنشر مقال أو مقال دولة */
  const dates = arts.map(a => a.date).concat(pages.filter(p => p.hasArticle).map(p => p.date))
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || '')).sort();
  const newest = dates.length ? dates[dates.length - 1] : today;

  const rows = [], out = {};
  const add = (loc, mod, pr) => {
    out[loc] = mod;
    rows.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${mod}</lastmod>\n    <priority>${pr}</priority>\n  </url>`);
  };

  add(SITE + '/', newest, '1.0');
  add(SITE + '/articles.html', newest, '0.9');
  ['about', 'privacy', 'contact', 'broadcasters', 'terms'].forEach(p => {
    const u = `${SITE}/${p}.html`; add(u, OLD[u] || today, '0.3');
  });
  pages.forEach(p => add(`${SITE}/countries/${p.slug}.html`, p.date, p.hasArticle ? '0.8' : '0.6'));
  arts.forEach(a => {
    const u = `${SITE}/articles/${a.slug}.html`; add(u, a.date || OLD[u] || today, '0.7');
  });

  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    rows.join('\n') + '\n</urlset>\n');
  console.log('خريطة الموقع: ' + rows.length + ' رابطاً.');
  return out;
}

/* IndexNow: نُبلغ Bing وYandex وغيرهما بالروابط الجديدة أو المعدّلة فقط.
   جوجل لا يدعمه، فيبقى معتمداً على خريطة الموقع. */
const INDEXNOW_KEY = 'd63e1b6e11aa22adbc5ee329ad282a2c';
async function notifyIndexNow(before, after) {
  const changed = Object.keys(after).filter(u => before[u] !== after[u]);
  if (!changed.length) { console.log('IndexNow: لا روابط جديدة أو معدّلة.'); return; }
  if (!process.env.GITHUB_ACTIONS) { console.log('IndexNow: ' + changed.length + ' رابطاً (لا إرسال خارج GitHub Actions).'); return; }
  /* لو لم تكن هناك خريطة سابقة أصلاً، فهذه أول مرة: لا نُغرق المحركات بكل الموقع */
  if (!Object.keys(before).length) { console.log('IndexNow: أول تشغيل، الخريطة تكفي هذه المرة.'); return; }
  /* ننتظر قليلاً حتى ينشر GitHub Pages الصفحات الجديدة، فلا يجد المحرك 404 */
  await new Promise(r => setTimeout(r, 90000));
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'worldliveradio.com',
        key: INDEXNOW_KEY,
        keyLocation: 'https://worldliveradio.com/' + INDEXNOW_KEY + '.txt',
        urlList: changed.slice(0, 10000)
      })
    });
    console.log('IndexNow: أُرسل ' + changed.length + ' رابطاً — الرد ' + res.status);
  } catch (e) {
    console.log('IndexNow: تعذّر الإرسال (' + e.message + ') — لا يؤثر على البناء.');
  }
}

generatePages();
