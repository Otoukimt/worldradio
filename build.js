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

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    const date = my.date || today;
    const hide = (!descEn && !descAr) ? ' style="display:none"' : '';

    const html = template
      .replace(/\{\{cc\}\}/g, cc)
      .replace(/\{\{slug\}\}/g, slug)
      .replace(/\{\{en\}\}/g, esc(en))
      .replace(/\{\{ar\}\}/g, esc(ar))
      .replace(/\{\{date\}\}/g, date)
      .replace(/\{\{descEn\}\}/g, descEn)
      .replace(/\{\{descAr\}\}/g, descAr)
      .replace('id="aboutSec"', 'id="aboutSec"' + hide);

    fs.writeFileSync(path.join(outDir, slug + '.html'), html);
    pages.push({ cc, slug, en, ar, n: c.stationcount, hasArticle: !!(descEn || descAr), date });
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
  buildSitemap(root, pages);

  console.log('تم توليد ' + pages.length + ' صفحة دولة.');
  console.log('منها ' + pages.filter(p => p.hasArticle).length + ' صفحة تحمل مقالاً.');
}

function buildSitemap(root, pages) {
  const SITE = 'https://worldliveradio.com';
  const today = new Date().toISOString().split('T')[0];
  let arts = [];
  try { arts = JSON.parse(fs.readFileSync(path.join(root, 'articles.json'), 'utf8')); } catch (e) {}

  const rows = [];
  const add = (loc, mod, pr) => rows.push(
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${mod}</lastmod>\n    <priority>${pr}</priority>\n  </url>`);

  add(SITE + '/', today, '1.0');
  add(SITE + '/articles.html', today, '0.9');
  ['about', 'privacy', 'contact'].forEach(p => add(`${SITE}/${p}.html`, today, '0.3'));
  pages.forEach(p => add(`${SITE}/countries/${p.slug}.html`, p.date, p.hasArticle ? '0.8' : '0.6'));
  arts.forEach(a => add(`${SITE}/articles/${a.slug}.html`, a.date || today, '0.7'));

  fs.writeFileSync(path.join(root, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    rows.join('\n') + '\n</urlset>\n');
  console.log('خريطة الموقع: ' + rows.length + ' رابطاً.');
}

generatePages();
