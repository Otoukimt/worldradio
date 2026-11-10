const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'countries.json');
const templatePath = path.join(__dirname, 'country-template.html');
const outDir = path.join(__dirname, 'countries');

const countries = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir);
}

countries.forEach(country => {
    let descEn = country.descEn || '';
    let descAr = country.descAr || '';
    
    // إخفاء قسم المقالة إذا كانت البيانات فارغة
    let aboutDisplay = (descEn === '' && descAr === '') ? 'style="display:none"' : '';

    let html = template
        .replace(/{{cc}}/g, country.cc || '')
        .replace(/{{slug}}/g, country.slug || '')
        .replace(/{{en}}/g, country.en || '')
        .replace(/{{ar}}/g, country.ar || '')
        .replace(/{{date}}/g, country.date || '')
        .replace(/{{descEn}}/g, descEn)
        .replace(/{{descAr}}/g, descAr)
        .replace('id="aboutSec"', `id="aboutSec" ${aboutDisplay}`);
    
    fs.writeFileSync(path.join(outDir, `${country.slug}.html`), html);
});
console.log("تم إنشاء صفحات الدول بنجاح!");
