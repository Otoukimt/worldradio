/* LiveRadio — تحسينات صفحة المقال، لكل المقالات القديمة والجديدة:
   الصورة كاملة بنسبة 16:9، أزرار المشاركة، زر محطات الدولة المذكورة، والكلمات المفتاحية.
   يعمل في صفحة المقال المستقلة، وداخل الموقع حين يُفتح المقال دون إعادة تحميل. */
(function(){
  if(window.lrArt)return;
  var ICON={
    wa:'<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.3z"/>',
    fb:'<path d="M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.3 2 10 3.6 10 6.1V8H8v3h2v11h4V11h2.7l.4-3H14z"/>',
    x:'<path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/>',
    tg:'<path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3z"/>',
    li:'<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/>',
    copy:'<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>',
    share:'<path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7c0 .3 0 .5.1.8L8.4 11.2a3 3 0 1 0 0 1.6l6.7 3.4A3 3 0 1 0 18 16z"/>'
  };
  var css=
    /* الصورة كاملة: كان ارتفاعها ثابتاً 190 بكسل فيُقصّ أغلبها على الحاسوب */
    'main .hero:has(.heroimg),#page .hero:has(.heroimg){height:auto;aspect-ratio:16/9;max-height:560px}'+
    /* الوضع الفاتح: لون التمييز الأخضر باهت على الخلفية البيضاء للنصوص الصغيرة (تباين 2.98، والمطلوب 4.5).
       نستعمل درجته الداكنة للنصوص فقط (تباين 5.6)، وتبقى الأزرار والخلفيات بلونها */
    'html:not([data-theme="dark"]) main p a,html:not([data-theme="dark"]) main li a,html:not([data-theme="dark"]) main blockquote a,'+
    'html:not([data-theme="dark"]) main .crumb a,html:not([data-theme="dark"]) main .tagx,html:not([data-theme="dark"]) main .meta,'+
    'html:not([data-theme="dark"]) header .logo span,html:not([data-theme="dark"]) .lrKw a:before{color:#087064!important}'+
    /* روابط المصادر والقوائم كانت تأخذ لون النص الرمادي فلا تبدو روابط */
    'main p a,#page p a,main li a,#page li a,main blockquote a,#page blockquote a{color:var(--acc);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;word-break:break-word}'+
    'main li a:hover,#page li a:hover{color:var(--acc2,var(--acc))}'+
    '.lrShare{margin:30px 0 8px}'+
    '.lrShare .lbl,.lrKw .lbl{font-size:13px;font-weight:800;color:var(--mut);margin:0 0 10px;letter-spacing:.2px}'+
    '.lrShare .row{display:flex;flex-wrap:wrap;gap:8px}'+
    '.lrShare .b{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 15px;border-radius:13px;'+
      'border:1px solid var(--line);background:var(--card);color:var(--txt);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;'+
      'text-decoration:none;transition:transform .15s,background .15s,color .15s,border-color .15s}'+
    '.lrShare .b svg{width:18px;height:18px;fill:currentColor;flex:none}'+
    '.lrShare .b:hover{transform:translateY(-1px)}'+
    '.lrShare .wa:hover{background:#25D366;border-color:#25D366;color:#fff}'+
    '.lrShare .fb:hover{background:#1877F2;border-color:#1877F2;color:#fff}'+
    '.lrShare .x:hover{background:#000;border-color:#000;color:#fff}'+
    '.lrShare .tg:hover{background:#26A5E4;border-color:#26A5E4;color:#fff}'+
    '.lrShare .li:hover{background:#0A66C2;border-color:#0A66C2;color:#fff}'+
    '.lrShare .cp:hover,.lrShare .nt:hover{border-color:var(--acc);color:var(--acc)}'+
    '@media(max-width:560px){.lrShare .b .t{display:none}.lrShare .b{width:46px;padding:0}.lrShare .nt .t,.lrShare .cp .t{display:inline}.lrShare .nt,.lrShare .cp{width:auto;padding:0 14px}}'+
    '.lrKw{margin:24px 0 4px;padding-top:18px;border-top:1px solid var(--line)}'+
    '.lrKw .row{display:flex;flex-wrap:wrap;gap:8px}'+
    '.lrKw a{display:inline-block;padding:7px 13px;border-radius:999px;background:var(--card2,var(--card));border:1px solid var(--line);'+
      'font-size:13px;color:var(--txt);text-decoration:none}'+
    '.lrKw a:before{content:"#";color:var(--acc);margin-inline-end:3px;font-weight:800}'+
    '.lrKw a:hover{border-color:var(--acc);color:var(--acc)}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var cache={};
  function json(u){
    if(!cache[u])cache[u]=fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
    return cache[u];
  }
  function isAr(){return (document.documentElement.lang||'').indexOf('ar')===0;}
  function el(tag,cls,en,ar){
    var e=document.createElement(tag);if(cls)e.className=cls;
    if(en!==undefined){e.setAttribute('data-en',en);e.setAttribute('data-ar',ar);e.textContent=isAr()?ar:en;}
    return e;
  }
  function btn(cls,icon,en,ar,href,onclick){
    var b=document.createElement(href?'a':'button');b.className='b '+cls;
    if(href){b.href=href;b.target='_blank';b.rel='noopener nofollow';}
    else b.type='button';
    b.setAttribute('aria-label',isAr()?ar:en);
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[icon]+'</svg>';
    var t=el('span','t',en,ar);b.appendChild(t);
    if(onclick)b.onclick=onclick;
    return b;
  }
  function toast(msg){
    if(typeof window.toast==='function'){window.toast(msg);return;}
    var d=document.createElement('div');d.textContent=msg;
    d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:var(--txt);color:var(--bg);padding:10px 16px;border-radius:12px;font-weight:700;z-index:99';
    document.body.appendChild(d);setTimeout(function(){d.remove();},1800);
  }

  /* root: عنصر main في الصفحة المستقلة، أو حاوية الصفحة داخل الموقع. base: بادئة الروابط */
  function enhance(root,slug,base,after){
    if(!root||root.querySelector('.lrShare'))return;
    var url=location.origin+'/articles/'+slug+'.html';
    var h1=root.querySelector('h1');
    function title(){return (h1&&h1.textContent.trim())||document.title;}
    var cta=root.querySelector('a.cta');

    /* ١. أزرار المشاركة — تحلّ محل الأزرار القديمة إن وُجدت */
    var old=root.querySelector('.sharerow');
    var box=el('section','lrShare');
    box.appendChild(el('div','lbl','Share this article','شارك المقال'));
    var row=document.createElement('div');row.className='row';
    var enc=encodeURIComponent;
    if(navigator.share)row.appendChild(btn('nt','share','Share','مشاركة',null,function(){navigator.share({title:title(),url:url}).catch(function(){});}));
    row.appendChild(btn('wa','wa','WhatsApp','واتساب','https://wa.me/?text='+enc(title()+' '+url)));
    row.appendChild(btn('fb','fb','Facebook','فيسبوك','https://www.facebook.com/sharer/sharer.php?u='+enc(url)));
    row.appendChild(btn('x','x','X','إكس','https://twitter.com/intent/tweet?text='+enc(title())+'&url='+enc(url)));
    row.appendChild(btn('tg','tg','Telegram','تيليغرام','https://t.me/share/url?url='+enc(url)+'&text='+enc(title())));
    row.appendChild(btn('li','li','LinkedIn','لينكدإن','https://www.linkedin.com/sharing/share-offsite/?url='+enc(url)));
    row.appendChild(btn('cp','copy','Copy link','نسخ الرابط',null,function(){
      var ok=function(){toast(isAr()?'نُسخ الرابط':'Link copied');};
      if(navigator.clipboard)navigator.clipboard.writeText(url).then(ok).catch(function(){});
    }));
    box.appendChild(row);
    /* الترتيب ثابت: الوسوم ← المشاركة ← «تابعنا» ← زر المحطات، أياً كان موضع الأزرار القديمة */
    if(old)old.remove();
    var fw=root.querySelector('.lrFollow');
    if(fw)fw.parentNode.insertBefore(box,fw);
    else if(cta)cta.parentNode.insertBefore(box,cta);
    else root.appendChild(box);

    /* ٢ و٣. زر محطات الدولة، والكلمات المفتاحية — من فهرس المقالات */
    Promise.all([json(base+'articles.json'),json(base+'countries-index.json')]).then(function(r){
      var arts=r[0]||[],idx=r[1]||[],me=null;
      for(var i=0;i<arts.length;i++)if(arts[i].slug===slug){me=arts[i];break;}
      if(!me)return;
      if(cta&&me.cc){
        var c=null;for(var j=0;j<idx.length;j++)if((idx[j].cc||'').toUpperCase()===me.cc.toUpperCase()){c=idx[j];break;}
        if(c){
          cta.href=base+'countries/'+c.slug+'.html';
          var en='Listen to '+c.en+' radio live →',ar='استمع إلى إذاعات '+c.ar+' مباشرة ←';
          cta.setAttribute('data-en',en);cta.setAttribute('data-ar',ar);cta.textContent=isAr()?ar:en;
        }
      }
      var kw=me.kw||{},ken=(kw.en||[]).slice(0,8),kar=(kw.ar||[]).slice(0,8);
      if(ken.length||kar.length){
        var k=el('section','lrKw');
        k.appendChild(el('div','lbl','Keywords','كلمات مفتاحية'));
        var kr=document.createElement('div');kr.className='row';
        var n=Math.max(ken.length,kar.length);
        for(var m=0;m<n;m++){
          var en2=ken[m]||kar[m],ar2=kar[m]||ken[m];
          var a=el('a','',en2,ar2);
          a.href=base+'articles.html?q='+encodeURIComponent(isAr()?ar2:en2);
          kr.appendChild(a);
        }
        k.appendChild(kr);
        box.parentNode.insertBefore(k,box);
      }
      if(after)after();
    });
  }
  window.lrArt={enhance:enhance};

  /* الصفحة المستقلة */
  var main=document.querySelector('main[data-type="article"]');
  if(main){
    var go=function(){enhance(main,main.getAttribute('data-slug')||'',(document.querySelector('base')?'':'../'));};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
  }
})();
