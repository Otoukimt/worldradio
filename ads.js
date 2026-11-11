/* LiveRadio — تجهيز إعلانات AdSense
   مطفأ تماماً حتى يصير "enabled": true في ads.json. وهو مطفأ:
   لا طلب لجوجل، ولا مساحات فارغة، ولا أثر على السرعة.
   وحين يُشغَّل: مساحات محجوزة بمقاس ثابت قبل وصول الإعلان (فلا تتحرك الصفحة)،
   والإعلانات لا تُطلب إلا قرب ظهورها، والمشغل يرتفع فوق الإعلان الثابت أسفل الهاتف. */
(function(){
  if(window.lrAds)return;
  var CFG=null,io=null,scriptOn=false,queue=[];
  var base=document.querySelector('base');
  var ROOT=base?base.href:(location.origin+'/');

  function lang(){return (document.documentElement.lang||'').indexOf('ar')===0?'ar':'en';}

  /* أماكن الإعلانات: علامات صريحة في الرئيسية، ومواضع ثابتة في المقالات وصفحات الدول */
  function spots(root){
    var out=[],i;
    var m=root.querySelectorAll('[data-ad-spot]');
    for(i=0;i<m.length;i++)out.push({ref:m[i],where:'in'});
    var art=root.querySelector('main[data-type="article"]');
    if(art){
      var ps=art.querySelectorAll(':scope > p');
      if(ps.length>=6)out.push({ref:ps[2],where:'after'});       /* بعد الفقرة الثالثة في المقالات الطويلة */
      var sr=art.querySelector('.sharerow');if(sr)out.push({ref:sr,where:'before'});
    }
    var c=root.querySelector('main[data-type="country"]');
    if(c){
      var ab=c.querySelector('#aboutSec');if(ab)out.push({ref:ab,where:'before'});   /* بين المحطات والمقال */
      var rs=c.querySelector('#relSec');if(rs)out.push({ref:rs,where:'before'});
    }
    return out;
  }
  function make(){
    var w=document.createElement('div');w.className='adslot';
    var l=document.createElement('div');l.className='adl';
    l.textContent=lang()==='ar'?(CFG.labelAr||'إعلان'):(CFG.labelEn||'Advertisement');
    var ins=document.createElement('ins');ins.className='adsbygoogle';
    ins.style.display='block';
    ins.setAttribute('data-ad-client',CFG.client);
    if(CFG.slot)ins.setAttribute('data-ad-slot',CFG.slot);
    ins.setAttribute('data-ad-format','auto');
    ins.setAttribute('data-full-width-responsive','true');
    w.appendChild(l);w.appendChild(ins);
    return w;
  }
  function fill(slot){
    if(slot.dataset.pushed)return;slot.dataset.pushed='1';
    queue.push(1);
    try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
  }
  function place(root){
    if(!CFG)return;
    spots(root||document).forEach(function(s){
      if(s.ref.dataset.adDone)return;s.ref.dataset.adDone='1';
      var slot=make();
      if(s.where==='in')s.ref.appendChild(slot);
      else if(s.where==='after')s.ref.parentNode.insertBefore(slot,s.ref.nextSibling);
      else s.ref.parentNode.insertBefore(slot,s.ref);
      if(io)io.observe(slot);else fill(slot);
    });
  }
  function css(){
    var st=document.createElement('style');
    st.textContent=
      '.adslot{display:block;margin:24px auto;max-width:728px;text-align:center;min-height:300px;contain:layout}'+
      '.adslot .adl{font-size:11px;color:#8a94a8;margin-bottom:6px;letter-spacing:.02em}'+
      '@media(min-width:768px){.adslot{min-height:290px}}'+
      '.adslot:has(ins[data-ad-status="unfilled"]){display:none}';
    document.head.appendChild(st);
  }
  /* الإعلان الثابت أسفل الشاشة: نقيس ارتفاعه ونرفع المشغل فوقه */
  function watchAnchor(){
    var de=document.documentElement,last=-1;
    function check(){
      var a=document.querySelectorAll('ins.adsbygoogle[data-anchor-status]'),h=0;
      for(var i=0;i<a.length;i++){
        var st=a[i].getAttribute('data-anchor-status');
        if(st==='dismissed'||st==='hidden'||a[i].style.display==='none')continue;
        var r=a[i].getBoundingClientRect();
        if(r.height>0&&r.bottom>=window.innerHeight-4)h=Math.max(h,Math.round(r.height));
      }
      if(h!==last){last=h;de.style.setProperty('--adB',h+'px');}
    }
    new MutationObserver(check).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-anchor-status','style']});
    window.addEventListener('resize',check);
    setInterval(check,2000);
  }
  function loadScript(){
    if(scriptOn)return;scriptOn=true;
    var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(CFG.client);
    document.head.appendChild(s);
  }
  function start(){
    css();
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(es){
        es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);fill(e.target);}});
      },{rootMargin:'400px 0px'});
    }
    place(document);
    watchAnchor();
    /* سكربت جوجل بعد اكتمال تحميل الصفحة، حتى لا يؤخر ظهور المحتوى */
    var go=function(){(window.requestIdleCallback||function(f){setTimeout(f,1200);})(loadScript,{timeout:3000});};
    if(document.readyState==='complete')go();else window.addEventListener('load',go);
  }

  window.lrAds={scan:function(root){place(root||document);},on:function(){return !!CFG;}};

  fetch(ROOT+'ads.json',{cache:'no-cache'})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){
      if(!d||d.enabled!==true||!/^ca-pub-\d{10,20}$/.test(d.client||''))return;   /* مطفأ */
      CFG=d;
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
    }).catch(function(){});
})();
