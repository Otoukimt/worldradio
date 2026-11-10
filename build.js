const fs = require('fs');
const path = require('path');

// قائمة تعريب أسماء الدول التي تستخدمها في موقعك
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

async function generatePages() {
    const dataPath = path.join(__dirname, 'countries.json');
    const templatePath = path.join(__dirname, 'country-template.html');
    const outDir = path.join(__dirname, 'countries');

    // 1. قراءة قالب HTML
    const template = fs.readFileSync(templatePath, 'utf8');

    // 2. قراءة المقالات التي كتبتها (إن وجدت)
    let customArticles = [];
    if (fs.existsSync(dataPath)) {
        try {
            customArticles = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch(e) {}
    }

    // 3. جلب جميع دول العالم التي بها محطات راديو أوتوماتيكياً من الـ API
    console.log("جاري جلب الدول من الخادم...");
    const res = await fetch('https://de1.api.radio-browser.info/json/countries?limit=250');
    const allCountries = await res.json();

    if (!fs.existsSync(outDir)){
        fs.mkdirSync(outDir);
    }

    let count = 0;
    const today = new Date().toISOString().split('T')[0];

    // 4. توليد صفحة HTML لكل دولة في العالم
    allCountries.forEach(apiCountry => {
        // نتجاهل الدول التي ليس لها محطات أو رمزها غير صحيح
        if (!apiCountry.iso_3166_1 || apiCountry.stationcount < 3) return;

        let cc = apiCountry.iso_3166_1.toUpperCase();
        let enName = apiCountry.name;
        let arName = CN_AR[cc] || enName; // جلب الاسم العربي إذا توفر
        let slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // البحث عما إذا كنت قد كتبت مقالة لهذه الدولة في countries.json
        let customData = customArticles.find(a => a.cc === cc) || {};
        let descEn = customData.descEn || '';
        let descAr = customData.descAr || '';
        
        // إخفاء قسم المقالة إذا لم تكن قد كتبتها بعد
        let aboutDisplay = (descEn === '' && descAr === '') ? 'style="display:none"' : '';

        // دمج البيانات في القالب
        let html = template
            .replace(/{{cc}}/g, cc)
            .replace(/{{slug}}/g, slug)
            .replace(/{{en}}/g, enName)
            .replace(/{{ar}}/g, arName)
            .replace(/{{date}}/g, today)
            .replace(/{{descEn}}/g, descEn)
            .replace(/{{descAr}}/g, descAr)
            .replace('id="aboutSec"', `id="aboutSec" ${aboutDisplay}`);
        
        fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
        count++;
    });

    console.log(`تم توليد ${count} صفحة دولة بنجاح!`);
}

generatePages();
