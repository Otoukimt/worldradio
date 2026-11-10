const fs = require('fs');
const path = require('path');

// مسارات الملفات
const dataPath = path.join(__dirname, 'countries.json');
const templatePath = path.join(__dirname, 'country-template.html');
const outDir = path.join(__dirname, 'countries');

// قراءة البيانات
const countries = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const template = fs.readFileSync(templatePath, 'utf8');

// التأكد من وجود مجلد countries
if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir);
}

let count = 0;

// المرور على كل دولة وإنشاء صفحتها
countries.forEach(country => {
    // استبدال المتغيرات في القالب ببيانات الدولة
    let html = template
        .replace(/{{cc}}/g, country.cc)
        .replace(/{{slug}}/g, country.slug)
        .replace(/{{en}}/g, country.en)
        .replace(/{{ar}}/g, country.ar)
        .replace(/{{date}}/g, country.date)
        .replace(/{{descEn}}/g, country.descEn || '')
        .replace(/{{descAr}}/g, country.descAr || '');
    
    // حفظ الصفحة الجديدة في مجلد countries
    fs.writeFileSync(path.join(outDir, `${country.slug}.html`), html);
    count++;
});

console.log(`✅ Success! Generated ${count} country pages.`);
