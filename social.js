/* LiveRadio — روابط التواصل الاجتماعي.
   القائمة والأماكن في social.json، ويكتبها تطبيق الاستوديو. لا شيء يظهر ما دامت القائمة فارغة. */
(function(){
  if(window.lrSoc)return;
  var P={
    facebook:['Facebook','#1877F2','M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.3 2 10 3.6 10 6.1V8H8v3h2v11h4V11h2.7l.4-3H14z'],
    instagram:['Instagram','#E1306C','M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8.2c-.1-1.6-.4-3-1.6-4.1-1.1-1.2-2.5-1.5-4.1-1.6C14.6 2.4 9.4 2.4 7.8 2.5c-1.6.1-3 .4-4.1 1.6-1.2 1.1-1.5 2.5-1.6 4.1-.1 1.6-.1 6.8 0 8.4.1 1.6.4 3 1.6 4.1 1.1 1.2 2.5 1.5 4.1 1.6 1.6.1 6.8.1 8.4 0 1.6-.1 3-.4 4.1-1.6 1.2-1.1 1.5-2.5 1.6-4.1.1-1.6.1-6.8 0-8.4zM19.8 18a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.1.4-5.4.4s-4.2.1-5.4-.4A3.1 3.1 0 0 1 5.4 18c-.5-1.2-.4-4.1-.4-5.4s-.1-4.2.4-5.4A3.1 3.1 0 0 1 7.2 5.4c1.2-.5 4.1-.4 5.4-.4s4.2-.1 5.4.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.1.4 5.4s.1 4.2-.4 5.4z'],
    x:['X','#000000','M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z'],
    youtube:['YouTube','#FF0000','M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3-5.8 3z'],
    tiktok:['TikTok','#000000','M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.1a6.4 6.4 0 1 0 5.5 6.3V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7z'],
    telegram:['Telegram','#26A5E4','M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3z'],
    whatsapp:['WhatsApp','#25D366','M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.3z'],
    linkedin:['LinkedIn','#0A66C2','M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z'],
    threads:['Threads','#000000','M16.7 11.2c-.1-2.3-1.4-3.6-3.6-3.6-1.3 0-2.4.6-3 1.6l1.2.8c.5-.7 1.1-.9 1.8-.9.9 0 1.5.3 1.8 1-.6-.1-1.2-.1-1.9-.1-2 .1-3.3 1.3-3.2 2.9.1 1.6 1.5 2.6 3.2 2.5 2.1-.1 3.2-1.5 3.5-3.4.6.4.9 1 1 1.8.2 1.7-1 3.4-3.6 3.6-2.9.2-5-1.6-5.1-5.6.1-4 2.2-5.8 5.1-5.6 2.1.1 3.5 1.2 4.1 3.1l1.5-.4c-.8-2.6-2.8-4.1-5.6-4.2-3.8-.2-6.6 2.3-6.7 7.1.1 4.8 2.9 7.3 6.7 7.1 3.4-.2 5.4-2.5 5.2-5.1-.1-1.2-.8-2.3-2.4-3zm-3.4 2.9c-.9 0-1.6-.4-1.6-1.1 0-.7.7-1.2 1.8-1.3.6 0 1.1 0 1.7.1-.2 1.4-.9 2.2-1.9 2.3z'],
    snapchat:['Snapchat','#FFFC00','M12 2c3 0 5.4 2.3 5.4 5.4v2.3c.4.2.9.1 1.3-.1.6-.2 1.1.4.7.9-.4.4-1.2.7-1.8.9-.3.1-.4.4-.3.7.7 1.6 1.9 2.8 3.5 3.3.4.1.4.6 0 .8-.6.3-1.4.4-2 .6-.2.5-.2 1.1-.6 1.2-.6.1-1.5-.3-2.6.1-1 .4-1.9 1.8-3.6 1.8s-2.6-1.4-3.6-1.8c-1.1-.4-2 0-2.6-.1-.4-.1-.4-.7-.6-1.2-.6-.2-1.4-.3-2-.6-.4-.2-.4-.7 0-.8 1.6-.5 2.8-1.7 3.5-3.3.1-.3 0-.6-.3-.7-.6-.2-1.4-.5-1.8-.9-.4-.5.1-1.1.7-.9.4.2.9.3 1.3.1V7.4C6.6 4.3 9 2 12 2z'],
    pinterest:['Pinterest','#E60023','M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.3-2 3.3-4.9 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 2 .8 2.5.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.6-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.7-2.4 6.8-5.6 6.8-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.2 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2z'],
    email:['Email','#0d9488','M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4.4 7H19.6zM4 8.7V17h16V8.7l-8 5.4z'],
    website:['Website','#5b53e0','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.6 15.6 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.6 16.6 0 0 0 0 4zm.8 2h2.9c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16zM8 8H5.1a8 8 0 0 1 4.3-3.6C8.8 5.5 8.3 6.7 8 8zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.7-5.6a16.6 16.6 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z']
  };
  var css=
    '.lrSoc{display:flex;flex-wrap:wrap;gap:8px;align-items:center}'+
    '.lrSoc a{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:13px;border:1px solid var(--line);'+
      'background:var(--card);color:var(--txt);text-decoration:none;transition:transform .15s,background .15s,color .15s,border-color .15s}'+
    '.lrSoc a:hover{transform:translateY(-2px);background:var(--b);border-color:var(--b);color:#fff}'+
    '.lrSoc svg{width:19px;height:19px;fill:currentColor}.lrSoc img{width:20px;height:20px;object-fit:contain}'+
    '.lrSoc.sm a{width:34px;height:34px;border-radius:50%}.lrSoc.sm svg{width:16px;height:16px}'+
    '.lrFollow{margin:24px 0 6px;padding:16px;border:1px solid var(--line);border-radius:18px;background:var(--card)}'+
    '.lrFollow .lbl{font-size:14px;font-weight:800;margin:0 0 10px}'+
    '.lrFollow .sub{font-size:12.5px;color:var(--mut);margin:-6px 0 12px}'+
    '.lrSocH{margin-inline-end:6px}@media(max-width:640px){.lrSocH{display:none}}'+
    '.lrSocF{justify-content:center;margin:4px 0 14px}'+
    '#fs .lrSoc{justify-content:center;margin:18px 0 4px}#fs .lrSoc a{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15);color:#fff}';
  var cfg=null;
  function isAr(){return (document.documentElement.lang||'').indexOf('ar')===0;}
  function row(small){
    var d=document.createElement('div');d.className='lrSoc'+(small?' sm':'');
    (cfg.links||[]).forEach(function(l){
      if(!l||!/^(https?:|mailto:)/.test(l.url||''))return;
      var p=P[l.id]||null;
      var a=document.createElement('a');a.href=l.url;a.target='_blank';a.rel='noopener me';
      var name=l.label||(p?p[0]:'Link');a.setAttribute('aria-label',name);a.title=name;
      a.style.setProperty('--b',l.color||(p?p[1]:'var(--acc)'));
      if(l.icon&&/^https?:/.test(l.icon)){var im=document.createElement('img');im.src=l.icon;im.alt='';a.appendChild(im);}
      else a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(p?p[2]:P.website[2])+'"/></svg>';
      d.appendChild(a);
    });
    return d;
  }
  function box(){
    var b=document.createElement('section');b.className='lrFollow';
    var t=cfg.title||{},s=cfg.sub||{};
    var h=document.createElement('div');h.className='lbl';
    var en=t.en||'Follow LiveRadio',ar=t.ar||'تابع LiveRadio';
    h.setAttribute('data-en',en);h.setAttribute('data-ar',ar);h.textContent=isAr()?ar:en;b.appendChild(h);
    if(s.en||s.ar){var q=document.createElement('div');q.className='sub';q.setAttribute('data-en',s.en||s.ar);q.setAttribute('data-ar',s.ar||s.en);q.textContent=isAr()?(s.ar||s.en):(s.en||s.ar);b.appendChild(q);}
    b.appendChild(row(false));return b;
  }
  function on(k){return cfg&&cfg.places&&cfg.places[k]&&(cfg.links||[]).length;}

  /* أماكن داخل صفحة (مقال أو دولة): تُستدعى أيضاً حين تُفتح الصفحة داخل الموقع */
  function scan(root,type){
    if(!cfg||!root)return;
    var m=root.querySelector('main[data-type]');
    var t=type||(m?m.getAttribute('data-type'):'');
    var host=m||root;
    if(host.querySelector('.lrFollow'))return;
    if(t==='article'&&on('article')){
      var cta=host.querySelector('a.cta'),b=box();
      if(cta)cta.parentNode.insertBefore(b,cta);else host.appendChild(b);
    }
    if(t==='country'&&on('country')){
      var rel=host.querySelector('#relSec'),ab=host.querySelector('#aboutSec'),b2=box();
      if(rel)rel.parentNode.insertBefore(b2,rel);else if(ab)ab.parentNode.insertBefore(b2,ab.nextSibling);else host.appendChild(b2);
    }
  }
  function global(){
    if(on('header')&&!document.querySelector('.lrSocH')){
      var sp=document.querySelector('header .hrow .spacer');
      if(sp){var r=row(true);r.classList.add('lrSocH');sp.parentNode.insertBefore(r,sp.nextSibling);}
    }
    if(on('footer')&&!document.querySelector('.lrSocF')){
      var f=document.querySelector('footer');
      if(f){var r2=row(true);r2.classList.add('lrSocF');f.insertBefore(r2,f.firstChild);}
    }
    var home=document.getElementById('home');
    if(home&&on('home')&&!home.querySelector('.lrFollow')){home.appendChild(box());}
    var fsb=document.querySelector('#fs .fsBody');
    if(fsb&&on('player')&&!fsb.querySelector('.lrSoc'))fsb.appendChild(row(false));
    scan(document);
  }
  window.lrSoc={scan:function(r,t){scan(r||document,t);}};
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var base=document.querySelector('main[data-type="article"],main[data-type="country"]')&&!document.querySelector('base')?'../':'/';
  fetch(base+'social.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d||!(d.links||[]).length)return;cfg=d;
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',global);else global();
  }).catch(function(){});
})();
