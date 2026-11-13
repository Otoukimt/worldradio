/* LiveRadio — شريط الأخبار.
   المحتوى يُكتب في الصفحة نفسها عند البناء (لتقرأه محركات البحث)، وهذا السكربت يحرّكه فقط:
   باتجاه اللغة، بسرعة ثابتة، يتوقف عند اللمس، ويُخفي الأخبار المنتهية. داخل الموقع يبدّل الشريط حسب الصفحة. */
(function(){
  if(window.lrTick)return;
  var I={
    breaking:'M13 2 4 14h7l-1 8 9-12h-7z',
    sport:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.2 2.6 1.9-1 3.1h-3.2l-1-3.1zM5.6 9.4l2.5.4 1 3.1-1.9 2.6-2.4-.9a7.9 7.9 0 0 1 .8-5.2zm12.8 0a7.9 7.9 0 0 1 .8 5.2l-2.4.9-1.9-2.6 1-3.1zM9.5 16.4l2.5-1.8 2.5 1.8-.4 2.5a8 8 0 0 1-4.2 0z',
    economy:'M3 17l6-6 4 4 7-7v5h2V4h-9v2h5l-5 5-4-4-8 8z',
    politics:'M12 2 2 7v2h20V7zM4 10v8h3v-8zm6.5 0v8h3v-8zM17 10v8h3v-8zM2 20v2h20v-2z',
    tech:'M7 2v2H5a1 1 0 0 0-1 1v2H2v2h2v2H2v2h2v2H2v2h2v2a1 1 0 0 0 1 1h2v2h2v-2h2v2h2v-2h2v2h2v-2h2a1 1 0 0 0 1-1v-2h2v-2h-2v-2h2v-2h-2V9h2V7h-2V5a1 1 0 0 0-1-1h-2V2h-2v2h-2V2h-2v2H9V2zm1 6h8v8H8z',
    weather:'M6.5 19a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 17.6 9 4.5 4.5 0 0 1 18 19z',
    culture:'M12 3v10.6A4 4 0 1 0 14 17V7h4V3z',
    health:'M12 21s-7.5-4.6-9.6-9.4C.8 7.7 3.4 4 7 4c2 0 3.5 1.1 5 2.8C13.5 5.1 15 4 17 4c3.6 0 6.2 3.7 4.6 7.6C19.5 16.4 12 21 12 21z',
    general:'M20 6H8.3l8.3-3.4-.8-1.8L3.2 6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM7 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm13-7h-2v-2h-2v2H4V8h16z'
  };
  var css=
    '.lrTk{display:flex;align-items:center;height:46px;padding-inline-start:8px;background:var(--card,#fff);border-bottom:1px solid var(--line,#e5e7eb);overflow:hidden;position:relative;z-index:5}'+
    '.lrTk[hidden]{display:none}'+
    /* العنوان: كبسولة بحواف دائرية وظل ناعم */
    '.lrTk .lb{flex:none;display:flex;align-items:center;gap:9px;height:30px;padding:0 14px 0 12px;margin-inline-end:6px;border-radius:999px;'+
      'font-size:12px;font-weight:800;color:#fff;letter-spacing:.3px;white-space:nowrap;'+
      'background:linear-gradient(135deg,#087064,#4f46e5);'+
      'box-shadow:0 3px 10px rgba(15,23,42,.18),0 1px 2px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.22)}'+
    'html[lang^="ar"] .lrTk .lb [lang="en"],html:not([lang^="ar"]) .lrTk .lb [lang="ar"]{display:none}'+
    /* النقطة الحمراء، وموجتان خفيفتان تتسعان من الداخل إلى الخارج */
    '.lrTk .lb i{position:relative;flex:none;width:8px;height:8px;border-radius:50%;background:#ff3b3b;box-shadow:0 0 0 1.5px rgba(255,255,255,.9),0 0 6px rgba(255,59,59,.8)}'+
    '.lrTk .lb i:before,.lrTk .lb i:after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,90,90,.85);animation:lrWave 1.8s ease-out infinite}'+
    '.lrTk .lb i:after{animation-delay:.9s}'+
    '@keyframes lrWave{from{transform:scale(1);opacity:.9}to{transform:scale(3.1);opacity:0}}'+
    '.lrTk .vp{flex:1;align-self:stretch;overflow:hidden;position:relative;-webkit-mask:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent);mask:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)}'+
    '.lrTk .tr{display:flex;width:max-content;height:100%;animation:lrRoll var(--d,60s) linear infinite}'+
    'html[dir="rtl"] .lrTk .tr{animation-name:lrRollR}'+
    '.lrTk:hover .tr,.lrTk.hold .tr,.lrTk:focus-within .tr{animation-play-state:paused}'+
    '@keyframes lrRoll{from{transform:translateX(0)}to{transform:translateX(-50%)}}'+
    '@keyframes lrRollR{from{transform:translateX(0)}to{transform:translateX(50%)}}'+
    '.lrTk ul{display:flex;align-items:center;margin:0;padding:0;list-style:none;height:100%}'+
    'html[lang^="ar"] .lrTk ul[lang="en"],html:not([lang^="ar"]) .lrTk ul[lang="ar"]{display:none}'+
    '.lrTk li{display:flex;align-items:center;padding:0 22px;white-space:nowrap;font-size:13.5px;height:100%;position:relative}'+
    '.lrTk li a{display:flex;align-items:center}'+
    '.lrTk li:after{content:"";position:absolute;inset-inline-end:0;top:15px;bottom:15px;width:1px;background:var(--line,#e5e7eb)}'+
    /* الأيقونة والوقت بمسافة عن نص الخبر */
    '.lrTk li svg{width:15px;height:15px;fill:var(--acc,#0ea47f);flex:none;margin-inline-end:9px}'+
    'html:not([data-theme="dark"]) .lrTk li svg{fill:#087064}'+
    '.lrTk li[data-c="breaking"] svg,html:not([data-theme="dark"]) .lrTk li[data-c="breaking"] svg{fill:#e5484d}'+
    '.lrTk li[data-c="breaking"] .t{font-weight:700}'+
    '.lrTk a{color:var(--txt,#111);text-decoration:none}.lrTk a:hover .t{text-decoration:underline}'+
    '.lrTk .tm{margin-inline-start:10px;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.5;'+
      'color:#92400e;background:rgba(245,158,11,.16)}'+
    'html[data-theme="dark"] .lrTk .tm{color:#fcd34d;background:rgba(251,191,36,.12)}'+
    '.lrTk .tm:empty{display:none}'+
    '@media (prefers-reduced-motion:reduce){.lrTk .tr,.lrTk .lb i:before,.lrTk .lb i:after{animation:none}.lrTk .vp{overflow-x:auto;-webkit-mask:none;mask:none}}';
  /* التنسيق يأتي عادةً مكتوباً داخل الصفحة مع الشريط (ticker.css عبر البناء)؛ وإلا نضيفه هنا */
  if(!document.getElementById('lrTkCss')){var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);}

  function ago(iso,ar){
    var t=Date.parse(iso);if(!t)return '';var m=Math.max(1,Math.round((Date.now()-t)/60000));
    if(m<60)return ar?('منذ '+m+' د'):(m+'m ago');var h=Math.round(m/60);
    if(h<24)return ar?('منذ '+h+' س'):(h+'h ago');var d=Math.round(h/24);return ar?('منذ '+d+' ي'):(d+'d ago');
  }
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function live(list){var n=Date.now();return (list||[]).filter(function(x){return !x.exp||Date.parse(x.exp)>n;}).slice(0,15);}

  /* نفس الشكل الذي يكتبه البناء في الصفحات */
  function html(list,root){
    function ul(lang){
      return '<ul lang="'+lang+'">'+list.map(function(x){
        var t=esc(x[lang]||x.en||x.ar);var href=x.link?(/^https?:/.test(x.link)?x.link:root+x.link):'';
        var inner='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(I[x.cat]||I.general)+'"/></svg><span class="t">'+t+'</span>'+
          (x.at?'<span class="tm" data-at="'+esc(x.at)+'"></span>':'');
        return '<li data-c="'+esc(x.cat||'general')+'"'+(x.exp?' data-exp="'+esc(x.exp)+'"':'')+'>'+(href?'<a href="'+esc(href)+'">'+inner+'</a>':inner)+'</li>';
      }).join('')+'</ul>';
    }
    return '<div class="lb"><i></i><span lang="ar">أخبار مباشرة</span><span lang="en">Live news</span></div>'+
      '<div class="vp"><div class="tr">'+ul('ar')+ul('en')+'</div></div>';
  }
  function isAr(){return (document.documentElement.lang||'').indexOf('ar')===0;}

  /* تشغيل شريط موجود: حذف المنتهي، أيقونات، أوقات، تكرار للدوران المتصل، وسرعة ثابتة */
  function run(el){
    if(!el)return;
    var now=Date.now();
    el.querySelectorAll('li[data-exp]').forEach(function(li){if(Date.parse(li.getAttribute('data-exp'))<=now)li.remove();});
    el.querySelectorAll('li').forEach(function(li){
      if(!li.querySelector('svg')){var c=li.getAttribute('data-c')||'general';li.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(I[c]||I.general)+'"/></svg>');}
    });
    el.querySelectorAll('.tm[data-at]').forEach(function(s){var ar=s.closest('ul').getAttribute('lang')==='ar';s.textContent=ago(s.getAttribute('data-at'),ar);});
    var tr=el.querySelector('.tr');if(!tr)return;
    tr.querySelectorAll('[aria-hidden="true"].dup').forEach(function(d){d.remove();});
    var any=false;tr.querySelectorAll('ul').forEach(function(u){if(u.children.length)any=true;});
    el.hidden=!any;if(!any)return;
    /* نسخة ثانية من القائمة تلي الأولى، فيدور الشريط بلا فراغ */
    tr.querySelectorAll('ul:not(.dup)').forEach(function(u){var d=u.cloneNode(true);d.classList.add('dup');d.setAttribute('aria-hidden','true');
      d.querySelectorAll('a').forEach(function(a){a.tabIndex=-1;});u.after(d);});
    requestAnimationFrame(function(){
      var u=tr.querySelector('ul:not([style*="none"])'),w=0;
      tr.querySelectorAll('ul').forEach(function(x){if(getComputedStyle(x).display!=='none')w+=x.offsetWidth;});
      tr.style.setProperty('--d',Math.max(20,Math.round(w/2/45))+'s');   /* 45 بكسل في الثانية */
    });
    el.ontouchstart=function(){el.classList.add('hold');};
    el.ontouchend=function(){setTimeout(function(){el.classList.remove('hold');},1200);};
    el.onclick=function(e){var a=e.target.closest('a');if(a&&window.gtag)try{gtag('event','ticker_click',{link_url:a.href});}catch(x){}};
  }

  var cache={},root='/';
  /* ملف الشريط المطلوب وحده (نحو 10 ك.ب)، لا ملف كل الأشرطة */
  function load(name){
    if(cache[name])return cache[name];
    cache[name]=fetch(root+'tk/'+name+'.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});
    return cache[name];
  }

  /* داخل الموقع: نوع الصفحة يحدد الشريط. «global» للرئيسية والمفضلة والمقالات، ورمز دولة لصفحتها، وnull للإخفاء */
  function forView(kind,cc){
    var el=document.getElementById('lrTicker');if(!el)return;
    if(!kind){el.hidden=true;return;}
    var key=kind+':'+(cc||'');
    /* الشريط العام مكتوب في الرئيسية وصفحة المقالات أصلاً: لا تحميل */
    if(kind==='global'&&!el.dataset.k&&el.querySelector('li')){el.dataset.k=key;el.hidden=false;run(el);return;}
    if(el.dataset.k===key&&!el.hidden)return;
    var want=kind==='country'&&cc?cc.toUpperCase():'global';
    load(want).then(function(l){
      var list=live(l);
      if(!list.length&&want!=='global')return load('global').then(function(g){show(live(g));});
      show(list);
    });
    function show(list){
      if(!list.length){el.hidden=true;return;}
      el.dataset.k=key;el.innerHTML=html(list,root);run(el);
    }
  }
  /* تغيير اللغة يغيّر الاتجاه: نعيد حساب الطول */
  new MutationObserver(function(){var el=document.getElementById('lrTicker');if(el&&!el.hidden)run(el);}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  window.lrTick={forView:forView,run:run};
  /* داخل الموقع تقرر الصفحة الرئيسية أي شريط يظهر؛ وإن سبقها السكربت أعطيناها الكلمة الآن */
  function go(){if(typeof window.tickerSync==='function'){window.tickerSync();return;}var el=document.getElementById('lrTicker');if(el&&el.querySelector('li'))run(el);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
