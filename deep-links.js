
/* ضاد | نظام الروابط المباشرة والمشاركة وصفحات تفاصيل المواد
   إضافة مستقلة لا تغيّر قاعدة البيانات */
(function(){
  'use strict';

  const DIRECT_KEYS=['material','game','additional','calendar','homeSection'];
  const requestedAtBoot=new URL(location.href);

  const baseMetadata={
    title:document.title,
    description:document.querySelector('meta[name="description"]')?.content||'',
    canonical:document.querySelector('link[rel="canonical"]')?.href||location.origin+location.pathname
  };

  let bootScreen=document.getElementById('dhadDirectBoot');

  function finishDirectBootScreen(){
    if(bootScreen){
      bootScreen.classList.add('dhad-boot-hide');
      window.setTimeout(()=>{
        bootScreen?.remove();
        bootScreen=null;
      },220);
    }
  }

  const baseHideAll=window.hideAll;

  const style=document.createElement('style');

  style.textContent=`
    #dhadMaterialDirectPage .dhad-direct-card{
      background:var(--panel,#fff);
      border:1px solid var(--line,#e5e7eb);
      border-radius:20px;
      padding:clamp(16px,3vw,28px);
      box-shadow:0 10px 30px rgba(0,0,0,.05);
    }

    #dhadMaterialDirectPage .dhad-direct-meta{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin:14px 0;
    }

    #dhadMaterialDirectPage .dhad-direct-meta span{
      background:var(--soft,#f4f4f0);
      border:1px solid var(--line,#e5e7eb);
      border-radius:999px;
      padding:6px 11px;
      font-size:.9rem;
    }

    #dhadMaterialDirectPage .dhad-direct-layout{
      display:flex;
      flex-direction:column;
      direction:rtl;
      gap:22px;
      align-items:stretch;
    }

    #dhadMaterialDirectPage .dhad-direct-card{
      direction:rtl;
    }

    #dhadMaterialDirectPage .dhad-direct-download{
      position:static;
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
      margin-top:8px;
    }

    #dhadMaterialDirectPage .dhad-direct-download h3{
      margin:0 0 2px;
      font-size:1.1rem;
    }

    #dhadMaterialDirectPage .dhad-direct-download button{
      width:100%;
      min-height:46px;
    }

    #dhadMaterialDirectPage .dhad-direct-description{
      line-height:2;
      white-space:pre-wrap;
      overflow-wrap:anywhere;
    }

    #dhadMaterialDirectPage .dhad-direct-description:empty{
      display:none;
    }

    #dhadMaterialDirectPage .dhad-direct-info-block{
      margin:18px 0;
      padding:14px;
      border:1px solid var(--line,#e5e7eb);
      border-radius:14px;
      background:var(--soft,#f7f7f4);
      line-height:2;
    }

    #dhadMaterialDirectPage .dhad-direct-info-block h3{
      margin:0 0 8px;
      font-size:1rem;
    }

    #dhadMaterialDirectPage .dhad-direct-info-block p{
      margin:0;
      white-space:pre-wrap;
      overflow-wrap:anywhere;
    }

    #dhadMaterialDirectPage .dhad-direct-info-block p+p{
      margin-top:6px;
    }

    #dhadMaterialDirectPage .dhad-direct-main-button{
      width:100%;
      min-height:50px;
      margin-top:20px;
      font-size:1rem;
      font-weight:bold;
    }

    #dhadMaterialDirectPage .dhad-direct-back-button{
      margin-bottom:15px;
      min-height:42px;
    }

    #dhadMaterialDirectPage .dhad-direct-download-view{
      display:none;
    }

    #dhadMaterialDirectPage .dhad-direct-actions button{
      min-height:44px;
    }

    @media(max-width:760px){
      #dhadMaterialDirectPage .dhad-direct-download{
        grid-template-columns:1fr;
      }
    }

    .dhad-feature-share{
      display:flex;
      justify-content:flex-start;
      margin-top:12px;
    }

    .dhad-uploaded-link{
      margin-top:10px;
    }

    .dhad-uploaded-link:empty{
      display:none;
    }

    .dhad-uploaded-link .dhad-uploaded-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      flex-wrap:wrap;
      background:var(--soft,#f7f7f4);
      border:1px solid var(--line,#e5e5df);
      padding:10px 12px;
      border-radius:12px;
      margin-top:8px;
    }

    .dhad-uploaded-link code{
      direction:ltr;
      unicode-bidi:plaintext;
      overflow-wrap:anywhere;
      font-size:.82rem;
    }

    .dhad-uploaded-link button{
      white-space:nowrap;
    }

    /* هوية زيتية داكنة ولمسات ذهبية دون خلفيات بيضاء */
    #dhadMaterialDirectPage{color:#E8E0C8;background:#20291C!important}
    #dhadMaterialDirectPage>.panel{background:transparent!important;color:#E8E0C8!important;border:0!important;box-shadow:none!important;padding:clamp(10px,2vw,22px)!important}
    #dhadMaterialDirectPage .page-title{background:transparent!important;border:0!important;border-bottom:2px solid #C3A45F!important;border-radius:0!important;padding:8px 0 16px!important;margin-bottom:18px}
    #dhadMaterialDirectPage .page-title h2{color:#E8D39B!important;font-size:clamp(24px,4vw,32px)}
    #dhadMaterialDirectPage .page-title p,#dhadMaterialDirectPage .crumb{color:#D8DCCF!important}
    #dhadMaterialDirectPage .dhad-direct-card{background:#2B3527!important;color:#E8E0C8!important;border:1px solid #596044!important;border-radius:16px!important;box-shadow:0 10px 28px rgba(0,0,0,.22)!important}
    #dhadMaterialDirectPage .dhad-direct-card h3{color:#D8B968!important;margin:0 0 12px}
    #dhadMaterialDirectPage .dhad-direct-card p,#dhadMaterialDirectPage .dhad-direct-description{color:#E8E0C8!important}
    #dhadMaterialDirectPage .dhad-direct-info-block{background:#333E2D!important;border:1px solid #596044!important;border-right:3px solid #C3A45F!important;border-radius:8px!important;color:#E8E0C8!important;padding:14px 16px!important}
    #dhadMaterialDirectPage .dhad-direct-info-block h3{color:#D8B968!important}
    #dhadMaterialDirectPage .dhad-direct-info-block p{color:#E8E0C8!important}
    #dhadMaterialDirectPage .dhad-direct-meta span{background:#333E2D!important;border:1px solid #596044!important;color:#E8D39B!important}
    #dhadMaterialDirectPage .dhad-direct-main-button,#dhadMaterialDirectPage #dhadDirectDownloadButton,#dhadMaterialDirectPage #dhadDirectPreviewButton,#dhadMaterialDirectPage #dhadDirectShareButton,#dhadMaterialDirectPage .back{background:#46543A!important;color:#F1E5C5!important;border:1px solid #C3A45F!important;border-radius:10px!important;box-shadow:none!important}
    #dhadMaterialDirectPage #dhadDirectShareButton{background:#333E2D!important;color:#E8D39B!important;border-color:#C3A45F!important}
    #dhadMaterialDirectPage .dhad-direct-main-button:hover,#dhadMaterialDirectPage #dhadDirectDownloadButton:hover,#dhadMaterialDirectPage #dhadDirectPreviewButton:hover,#dhadMaterialDirectPage #dhadDirectShareButton:hover,#dhadMaterialDirectPage .back:hover{filter:brightness(1.12);background:#596847!important}
    #dhadMaterialDirectPage .empty{background:#333E2D!important;color:#E8E0C8!important;border:1px solid #596044!important}
    #dhadMaterialDirectPage .dhad-direct-card b{color:#E8D39B!important}
    #dhadMaterialDirectPage .dhad-material-overline{color:#D8B968;font-size:12px;font-weight:800;margin-bottom:8px}
    #dhadMaterialDirectPage .dhad-material-description{white-space:pre-wrap;overflow-wrap:anywhere;line-height:2.05;margin:0}
    #dhadMaterialDirectPage .dhad-material-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:10px}
    #dhadMaterialDirectPage .dhad-material-stat{background:#333E2D;border:1px solid #596044;border-radius:11px;padding:12px}
    #dhadMaterialDirectPage .dhad-material-stat span{display:block;color:#D1C7A9;font-size:12px}
    #dhadMaterialDirectPage .dhad-material-stat strong{display:block;color:#E8D39B;font-size:24px;font-weight:900}
    #dhadMaterialDirectPage .dhad-material-file-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:14px}
    #dhadMaterialDirectPage .dhad-material-file-meta div{background:#333E2D;border:1px solid #596044;border-radius:10px;padding:10px}
    #dhadMaterialDirectPage .dhad-material-file-meta span{display:block;color:#D1C7A9;font-size:11px}
    #dhadMaterialDirectPage .dhad-material-file-meta b{display:block;color:#E8D39B;font-size:13px;overflow-wrap:anywhere}
    #dhadMaterialDirectPage .dhad-related-under-actions{margin:10px 0 0;padding:12px;width:100%;box-sizing:border-box}
    #dhadMaterialDirectPage .dhad-related-under-actions .dhad-material-related{display:grid;grid-template-columns:1fr;gap:8px}
    #dhadMaterialDirectPage .dhad-material-stats-panel{width:100%;box-sizing:border-box;margin-top:16px}
    #dhadMaterialDirectPage .dhad-material-stats-panel .dhad-material-stats{width:100%;box-sizing:border-box}
    #dhadMaterialDirectPage .dhad-material-related{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    #dhadMaterialDirectPage .dhad-material-related button{background:#333E2D;border:1px solid #596044;border-radius:10px;padding:12px;text-align:right;color:#E8D39B;font-weight:800}
    #dhadMaterialDirectPage .dhad-direct-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;align-items:start;gap:16px}
    #dhadMaterialDirectPage .dhad-direct-download{display:grid;grid-template-columns:1fr;align-content:start;position:sticky;top:92px}
    @media(max-width:760px){#dhadMaterialDirectPage .dhad-direct-layout{display:flex;flex-direction:column}#dhadMaterialDirectPage .dhad-direct-download{position:static;grid-template-columns:1fr;width:100%}#dhadMaterialDirectPage .dhad-material-stats-panel{position:relative;left:50%;transform:translateX(-50%);width:100vw;max-width:100vw;border-radius:0!important;padding:14px 12px!important;margin-top:16px}#dhadMaterialDirectPage .dhad-material-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}#dhadMaterialDirectPage .dhad-material-stat{min-width:0;padding:12px 9px;text-align:center}#dhadMaterialDirectPage .dhad-material-stat strong{font-size:clamp(20px,6vw,26px)}#dhadMaterialDirectPage .dhad-material-file-meta{grid-template-columns:repeat(2,minmax(0,1fr))}#dhadMaterialDirectPage .dhad-material-related{grid-template-columns:1fr}}
  
  `;

  document.head.appendChild(style);


  /* إنشاء صفحة تفاصيل المادة وصفحة التنزيل */

  function ensureMaterialPage(){

    if(document.getElementById('dhadMaterialDirectPage'))return;

    const section=document.createElement('section');

    section.className='content-page';
    section.id='dhadMaterialDirectPage';
    section.style.display='none';

    section.innerHTML=`

      <div class="panel">

        <button class="back"
          type="button"
          onclick="goHomeAndClearDirectLink()">
          ↩ العودة إلى ضاد
        </button>

        <div class="crumb">
          الرئيسية ← المواد التعليمية
        </div>

        <div class="page-title">
          <h2 id="dhadDirectMaterialTitle">المادة التعليمية</h2>
          <p id="dhadDirectMaterialSubtitle">
            تفاصيل المادة التعليمية
          </p>
        </div>

        <!-- صفحة تفاصيل المادة -->

        <div id="dhadDirectDetailsView">

          <article class="dhad-direct-card">

            <div id="dhadDirectMaterialStatus" class="empty">
              جاري تحميل بيانات المادة...
            </div>

            <div id="dhadDirectMaterialBody"></div>

            <button
              id="dhadShowDownloadPageButton"
              class="primary dhad-direct-main-button"
              type="button">
              📥 الذهاب إلى صفحة التنزيل
            </button>

          </article>

        </div>

        <!-- صفحة التنزيل -->

        <div id="dhadDirectDownloadView"
             class="dhad-direct-download-view">

          <button
            class="back dhad-direct-back-button"
            type="button"
            onclick="showMaterialDetailsPage()">
            ↩ العودة إلى تفاصيل المادة
          </button>

          <div class="dhad-direct-layout">

            <article class="dhad-direct-card">

              <h3>معلومات الملف</h3>

              <div id="dhadDownloadMaterialMeta"
                   class="dhad-direct-meta"></div>

              <div id="dhadDownloadMaterialExtra"></div>
            </article>

            <aside class="dhad-direct-card dhad-direct-download"
                   aria-label="تنزيل المادة">

              <button
                id="dhadDirectDownloadButton"
                class="primary"
                type="button">
                ⬇ تنزيل الملف
              </button>

              <button
                id="dhadDirectPreviewButton"
                class="preview"
                type="button">
                👁 معاينة الملف
              </button>

              <button
                id="dhadDirectShareButton"
                class="secondary"
                type="button">
                🔗 مشاركة الرابط
              </button>

              <section id="dhadMaterialRelatedSection" class="dhad-direct-info-block dhad-related-under-actions" style="display:none">
                <h3>مواد ذات صلة</h3>
                <div id="dhadMaterialRelated" class="dhad-material-related"></div>
              </section>

            </aside>

          </div>

          <section class="dhad-direct-info-block dhad-material-stats-panel" aria-label="إحصائيات المادة">
            <h3>إحصائيات المادة</h3>
            <div id="dhadMaterialStats" class="dhad-material-stats">
              <div class="dhad-material-stat"><span>المشاهدات</span><strong>—</strong></div>
              <div class="dhad-material-stat"><span>التنزيلات</span><strong>—</strong></div>
              <div class="dhad-material-stat"><span>المعاينات</span><strong>—</strong></div>
              <div class="dhad-material-stat"><span>المشاركات</span><strong>—</strong></div>
            </div>
          </section>

        </div>

      </div>
    `;

    const listing=document.getElementById('listingPage');

    if(listing?.parentNode){
      listing.parentNode.insertBefore(section,listing.nextSibling);
    }else{
      document.body.appendChild(section);
    }

    document.getElementById('dhadShowDownloadPageButton')
      ?.addEventListener('click',showMaterialDownloadPage);
  }

  ensureMaterialPage();


  /* المحافظة على دورة إظهار وإخفاء الصفحات */

  if(typeof baseHideAll==='function'){

    window.hideAll=function(){

      baseHideAll();

      const page=document.getElementById('dhadMaterialDirectPage');

      if(page)page.style.display='none';

    };

  }


  /* نظام المسارات */

  const originalSetRoute=window.setRoute;

  window.setRoute=function(route){

    try{

      const url=new URL(location.href);

      let changed=false;

      DIRECT_KEYS.forEach(key=>{

        if(url.searchParams.has(key)){
          url.searchParams.delete(key);
          changed=true;
        }

      });

      if(changed){
        history.replaceState(null,'',url.pathname+url.search+url.hash);
      }

    }catch(e){}

    restoreBaseMetadata();

    if(typeof originalSetRoute==='function'){
      return originalSetRoute(route);
    }

  };


  /* إنشاء الروابط المباشرة */

  function directUrl(kind,id){

    const key=
      kind==='material'?'material':
      kind==='game'?'game':
      kind==='additional'?'additional':
      kind==='calendar'?'calendar':
      kind==='homeSection'?'homeSection':'';

    if(!key||!id)return '';

    const url=new URL(location.origin+location.pathname);

    url.searchParams.set(key,String(id));

    return url.href;

  }

  window.getDhadDirectUrl=directUrl;


  /* مشاركة الصفحة الحالية */

  window.shareCurrentDhadPage=async function(){

    const url=location.href;

    if(navigator.share){

      try{

        await navigator.share({
          title:'منصة ضاد - اللغة العربية',
          text:'رابط مباشر من منصة ضاد',
          url
        });

        return;

      }catch(error){

        if(error?.name==='AbortError')return;

      }

    }

    const copied=await copyText(url);

    if(typeof showInfo==='function'){

      showInfo(
        copied?'تم نسخ رابط الصفحة':'تعذر نسخ الرابط',
        copied?
          'يمكنك الآن مشاركة الصفحة مع الآخرين.':
          'الرابط: '+url
      );

    }

  };


  /* أُزيل زر «نسخ رابط الصفحة»؛ يبقى زر «مشاركة الصفحة» الأصلي في صفحة الصفوف. */


  /* نسخ النصوص */

  async function copyText(value){

    try{

      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(value);
        return true;
      }

    }catch(e){}

    try{

      const area=document.createElement('textarea');

      area.value=value;
      area.setAttribute('readonly','');
      area.style.position='fixed';
      area.style.opacity='0';

      document.body.appendChild(area);

      area.select();

      const ok=document.execCommand('copy');

      area.remove();

      return !!ok;

    }catch(e){

      return false;

    }

  }


  /* مشاركة الروابط المباشرة */

  window.shareDhadLink=async function(kind,id){

    const url=directUrl(kind,id);

    if(!url)return;

    const labels={
      material:'مادة تعليمية من منصة ضاد',
      game:'لعبة تعليمية من منصة ضاد',
      additional:'مورد تعليمي من منصة ضاد',
      calendar:'تقويم دراسي من منصة ضاد',
      homeSection:'قسم من الصفحة الرئيسية في منصة ضاد'
    };

    const title=labels[kind]||'محتوى من منصة ضاد';

    if(navigator.share){

      try{

        await navigator.share({
          title,
          text:title,
          url
        });

        if(kind==='material'&&typeof window.recordDhadAnalyticsEvent==='function'){
          window.recordDhadAnalyticsEvent('share',id);
        }
        return true;

      }catch(error){

        if(error?.name==='AbortError')return false;

      }

    }

    const copied=await copyText(url);

    if(copied&&kind==='material'&&typeof window.recordDhadAnalyticsEvent==='function'){
      window.recordDhadAnalyticsEvent('share',id);
    }

    if(typeof showInfo==='function'){

      showInfo(
        copied?'تم نسخ الرابط':'تعذر نسخ الرابط',
        copied?
          'يمكنك الآن إرسال الرابط إلى واتساب أو فيسبوك أو أي تطبيق آخر.':
          'انسخ الرابط يدويًا: '+url
      );

    }
    return !!copied;

  };


  /* إظهار رابط المادة بعد رفعها */

  window.showUploadedMaterialLink=function(containerId,id,title){

    const el=document.getElementById(containerId);

    if(!el)return;

    const url=directUrl('material',id);

    if(!url)return;

    el.innerHTML=
      '<div class="dhad-uploaded-row">'+
        '<div><b>'+safeText(title||'المادة الجديدة')+'</b><br>'+
        '<code>'+safeText(url)+'</code></div>'+
        '<button type="button" class="secondary" '+
        'onclick="shareDhadLink(\'material\',\''+
        safeText(id)+'\')">🔗 نسخ / مشاركة الرابط</button>'+
      '</div>';

  };


  /* روابط الملفات المرفوعة دفعة واحدة */

  window.renderBatchUploadedLinks=function(){

    const el=document.getElementById('batchUploadedLinks');

    if(!el)return;

    const rows=(typeof materialBatchQueue!=='undefined'?
      materialBatchQueue:[]).filter(x=>x.materialId);

    el.innerHTML=rows.map(x=>{

      const url=directUrl('material',x.materialId);

      return '<div class="dhad-uploaded-row">'+
        '<div><b>'+safeText(x.title||x.file?.name||'ملف')+
        '</b><br><code>'+safeText(url)+'</code></div>'+
        '<button type="button" class="secondary" '+
        'onclick="shareDhadLink(\'material\',\''+
        safeText(x.materialId)+'\')">🔗 نسخ / مشاركة</button>'+
        '</div>';

    }).join('');

  };


  /* حماية النصوص المعروضة */

  function safeText(value){

    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[ch]));

  }


  /* بيانات محركات البحث والمشاركة */

  function setMeta(selector,value){

    const element=document.querySelector(selector);

    if(element){
      element.setAttribute('content',value);
    }

  }


  function restoreBaseMetadata(){

    document.title=baseMetadata.title;

    setMeta('meta[name="description"]',baseMetadata.description);
    setMeta('meta[property="og:title"]',baseMetadata.title);
    setMeta('meta[property="og:description"]',baseMetadata.description);
    setMeta('meta[property="og:url"]',baseMetadata.canonical);

    const canonical=document.querySelector('link[rel="canonical"]');

    if(canonical){
      canonical.href=baseMetadata.canonical;
    }

  }


  function setDirectMetadata(kind,id,itemTitle,itemDescription,fallback){

    const title=(itemTitle||fallback||'محتوى تعليمي')+
      ' | ضاد – منصة اللغة العربية';

    const description=String(
      itemDescription||fallback||
      'محتوى تعليمي من منصة ضاد للغة العربية.'
    ).replace(/\s+/g,' ').trim().slice(0,160);

    const url=directUrl(kind,id);

    document.title=title;

    setMeta('meta[name="description"]',description);
    setMeta('meta[property="og:title"]',title);
    setMeta('meta[property="og:description"]',description);
    setMeta('meta[property="og:url"]',url);

    const canonical=document.querySelector('link[rel="canonical"]');

    if(canonical){
      canonical.href=url;
    }

  }


  function setMaterialMetadata(data){

    setDirectMetadata(
      'material',
      data.id,
      data.title,
      data.description,
      'تنزيل '+(data.file_name||'مادة تعليمية')+
      ' من منصة ضاد.'
    );

  }


  /* العودة إلى الصفحة الرئيسية */

  window.goHomeAndClearDirectLink=function(){

    try{

      const url=new URL(location.href);

      DIRECT_KEYS.forEach(key=>url.searchParams.delete(key));

      history.replaceState(
        null,
        '',
        url.pathname+url.search+url.hash
      );

    }catch(e){}

    restoreBaseMetadata();

    if(typeof goHome==='function'){
      goHome();
    }

  };


  /* الانتقال إلى صفحة تفاصيل المادة */

  window.showMaterialDetailsPage=function(){

    const details=document.getElementById('dhadDirectDetailsView');

    const download=document.getElementById('dhadDirectDownloadView');

    if(details)details.style.display='block';

    if(download)download.style.display='none';

    const subtitle=document.getElementById('dhadDirectMaterialSubtitle');

    if(subtitle){
      subtitle.textContent='تفاصيل المادة التعليمية';
    }

    window.scrollTo({
      top:0,
      behavior:'smooth'
    });

  };


  /* الانتقال إلى صفحة التنزيل */

  function showMaterialDownloadPage(){

    const details=document.getElementById('dhadDirectDetailsView');

    const download=document.getElementById('dhadDirectDownloadView');

    if(details)details.style.display='none';

    if(download)download.style.display='block';

    const subtitle=document.getElementById('dhadDirectMaterialSubtitle');

    if(subtitle){
      subtitle.textContent='صفحة تنزيل ومعاينة المادة التعليمية';
    }

    window.scrollTo({
      top:0,
      behavior:'smooth'
    });

  }

  window.showMaterialDownloadPage=showMaterialDownloadPage;


  /* الدالة التي تستدعيها بطاقات المواد */

  window.openMaterialInfoPage=async function(id){

    if(!id)return;

    const url=directUrl('material',id);

    if(url){

      try{

        history.pushState(
          {dhadMaterial:String(id)},
          '',
          url
        );

      }catch(error){

        console.warn('تعذر تحديث رابط المادة:',error);

      }

    }

    await showMaterialDirectPage(id);

    window.scrollTo({
      top:0,
      behavior:'smooth'
    });

  };


  /* تحميل وعرض بيانات المادة */

  async function showMaterialDirectPage(id){

    ensureMaterialPage();

    const page=document.getElementById('dhadMaterialDirectPage');

    const status=document.getElementById('dhadDirectMaterialStatus');

    const body=document.getElementById('dhadDirectMaterialBody');

    if(typeof hideAll==='function'){
      hideAll();
    }

    page.style.display='block';

    status.textContent='جاري تحميل بيانات المادة...';

    body.innerHTML='';

    showMaterialDetailsPage();

    if(typeof sb==='undefined'||!sb){

      status.textContent=
        'تعذر الاتصال بقاعدة البيانات. حدّث الصفحة وحاول مجددًا.';

      return;

    }

    try{

      const {data,error}=await sb
        .from('materials')
        .select(`
          id,
          title,
          description,
          content_summary,
          learning_objectives,
          target_audience,
          page_count,
          grade_id,
          semester_id,
          category_id,
          file_path,
          file_name,
          file_type,
          file_size,
          created_at,
          track_name,
          field_name,
          is_public,
          download_count
        `)
        .eq('id',id)
        .eq('is_public',true)
        .maybeSingle();

      if(error)throw error;

      if(!data){

        status.textContent=
          'هذه المادة غير متاحة للعامة أو لم تعد موجودة.';

        const button=document.getElementById('dhadShowDownloadPageButton');

        if(button)button.style.display='none';

        return;

      }

      const button=document.getElementById('dhadShowDownloadPageButton');

      if(button)button.style.display='block';

      window.__materials=[data];

      setMaterialMetadata(data);


      /* بيانات الصف والفصل والفئة */

      const grade=(typeof grades!=='undefined'?grades:[])
        .find(x=>String(x.id)===String(data.grade_id));

      const semester=(typeof semesters!=='undefined'?semesters:[])
        .find(x=>String(x.id)===String(data.semester_id));

      const category=(typeof categories!=='undefined'?categories:[])
        .find(x=>String(x.id)===String(data.category_id));

      const meta=[
        grade?.name,
        data.track_name,
        data.field_name,
        semester?.name,
        category?.name
      ].filter(Boolean);


      /* عنوان المادة */

      document.getElementById('dhadDirectMaterialTitle').textContent=
        data.title||'مادة تعليمية';

      status.textContent='تم العثور على المادة التعليمية.';


      /* بناء محتوى المادة من البيانات المحفوظة فعليًا */

      const description=String(data.description||'').trim();
      const summary=String(data.content_summary||'').trim();
      const objectives=String(data.learning_objectives||'').trim();
      const audience=String(data.target_audience||'').trim();
      const fileName=String(data.file_name||data.title||'').trim();
      const fileType=String(data.file_type||'').split('/').pop().toUpperCase()||'ملف';
      const fileSize=formatFileSize(data.file_size)||'غير محدد';
      const pageCount=data.page_count?String(data.page_count)+' صفحة':'غير محدد';
      const dateValue=data.updated_at||data.created_at;
      const updated=dateValue?new Date(dateValue).toLocaleDateString('ar-JO'):'غير محدد';

      const chips=[grade?.name,data.track_name,data.field_name,semester?.name,category?.name].filter(Boolean);

      const detailsHTML=
        '<div class="dhad-material-overline">مادة تعليمية من منصة ضاد</div>'+
        '<p class="dhad-material-description">'+(description?safeText(description):'لم يضف المشرف وصفًا تفصيليًا لهذه المادة بعد.')+'</p>'+
        (summary?'<div class="dhad-direct-info-block"><h3>نبذة عن المحتوى</h3><p class="dhad-material-description">'+safeText(summary)+'</p></div>':'')+
        (objectives?'<div class="dhad-direct-info-block"><h3>الأهداف التعليمية</h3><p class="dhad-material-description">'+safeText(objectives)+'</p></div>':'')+
        (audience?'<div class="dhad-direct-info-block"><h3>الفئة المستهدفة</h3><p class="dhad-material-description">'+safeText(audience)+'</p></div>':'')+
        (chips.length?'<div class="dhad-direct-meta">'+chips.map(x=>'<span>'+safeText(x)+'</span>').join('')+'</div>':'')+
        (fileName?'<p><b>اسم الملف:</b> '+safeText(fileName)+'</p>':'');

      body.innerHTML=detailsHTML;
      document.getElementById('dhadDownloadMaterialMeta').innerHTML=
        '<div class="dhad-material-file-meta">'+
          '<div><span>نوع الملف</span><b>'+safeText(fileType)+'</b></div>'+
          '<div><span>حجم الملف</span><b>'+safeText(fileSize)+'</b></div>'+
          '<div><span>عدد الصفحات</span><b>'+safeText(pageCount)+'</b></div>'+
          '<div><span>آخر تحديث</span><b>'+safeText(updated)+'</b></div>'+
          '<div><span>الصف</span><b>'+safeText(grade?.name||'غير محدد')+'</b></div>'+
          '<div><span>الفصل</span><b>'+safeText(semester?.name||'غير محدد')+'</b></div>'+
        '</div>';

      document.getElementById('dhadDownloadMaterialExtra').innerHTML='';

      const statusBox=document.getElementById('dhadDirectMaterialStatus');
      if(statusBox)statusBox.style.display='none';

      /* تحميل الإحصائيات الحقيقية المسجلة لهذه المادة */
      loadMaterialPublicStats(data.id);

      /* تحميل مواد مرتبطة من نفس الصف والقسم */
      loadRelatedMaterials(data);


      /* زر التنزيل */

      document.getElementById('dhadDirectDownloadButton').onclick=()=>{

        if(typeof downloadMaterial==='function'){
          downloadMaterial(data.id);
        }else if(typeof showInfo==='function'){
          showInfo('تعذر التنزيل','وظيفة تنزيل الملف غير متاحة حاليًا.');
        }

      };


      /* زر المعاينة */

      document.getElementById('dhadDirectPreviewButton').onclick=()=>{

        if(typeof previewMaterial==='function'){
          previewMaterial(data.id);
        }else if(typeof showInfo==='function'){
          showInfo('تعذرت المعاينة','وظيفة معاينة الملف غير متاحة حاليًا.');
        }

      };


      /* زر المشاركة */

      document.getElementById('dhadDirectShareButton').onclick=()=>{
        shareDhadLink('material',data.id);
      };

    }catch(error){

      console.error('Dhad direct material route:',error);

      status.textContent=
        'تعذر تحميل المادة. تحقق من الاتصال ثم أعد المحاولة.';

    }

  }


  async function loadMaterialPublicStats(materialId){
    const box=document.getElementById('dhadMaterialStats');
    if(!box||!sb)return;
    try{
      const {data,error}=await sb.rpc('get_public_material_stats',{p_material_id:materialId});
      if(error||!data?.available)throw error||new Error('stats_unavailable');
      const labels=[['المشاهدات',data.views],['التنزيلات',data.downloads],['المعاينات',data.previews],['المشاركات',data.shares]];
      box.innerHTML=labels.map(([label,value])=>'<div class="dhad-material-stat"><span>'+label+'</span><strong>'+Number(value||0).toLocaleString('ar')+'</strong></div>').join('');
    }catch(error){
      console.warn('تعذر تحميل إحصائيات المادة:',error);
      box.innerHTML='<p>إحصائيات المادة غير متاحة حاليًا.</p>';
    }
  }

  async function loadMaterialPreview(data){
    const section=document.getElementById('dhadMaterialPreviewSection');
    const target=document.getElementById('dhadMaterialPreview');
    if(!section||!target)return;
    const isPdf=/pdf/i.test(String(data.file_type||''))||/\.pdf$/i.test(String(data.file_name||data.file_path||''));
    if(!isPdf)return;
    try{
      const resolved=await resolveStorageFile(data.file_path,'');
      if(!resolved.url)return;
      let previewUrl=resolved.url;
      const drive=String(data.file_path||'').match(/^drive:([A-Za-z0-9_-]+)$/);
      if(drive)previewUrl='https://drive.google.com/file/d/'+encodeURIComponent(drive[1])+'/preview';
      target.innerHTML='<div class="dhad-material-preview"><iframe title="معاينة ملف PDF" loading="lazy" src="'+safeText(previewUrl)+'" allow="autoplay"></iframe></div>';
      section.style.display='block';
    }catch(error){console.warn('تعذرت معاينة PDF:',error);}
  }

  async function loadRelatedMaterials(data){
    const section=document.getElementById('dhadMaterialRelatedSection');
    const target=document.getElementById('dhadMaterialRelated');
    if(!section||!target||!sb||!data.category_id)return;
    try{
      let query=sb.from('materials').select('id,title,file_type').eq('is_public',true).eq('category_id',data.category_id).neq('id',data.id).order('created_at',{ascending:false}).limit(4);
      if(data.grade_id)query=query.eq('grade_id',data.grade_id);
      const {data:rows,error}=await query;
      if(error)throw error;
      if(!rows?.length)return;
      target.innerHTML=rows.map(row=>'<button type="button" onclick="openMaterialInfoPage(\''+safeText(row.id)+'\')">'+safeText(row.title||'مادة تعليمية')+' ←</button>').join('');
      section.style.display='block';
    }catch(error){console.warn('تعذر تحميل المواد المرتبطة:',error);}
  }

  /* تنسيق حجم الملف */

  function formatFileSize(bytes){

    const size=Number(bytes);

    if(!Number.isFinite(size)||size<=0)return '';

    const units=['بايت','كيلوبايت','ميغابايت','غيغابايت'];

    let value=size;
    let index=0;

    while(value>=1024&&index<units.length-1){
      value/=1024;
      index++;
    }

    return (index===0?
      Math.round(value):
      value.toFixed(value>=10?0:1)
    )+' '+units[index];

  }


  /* استعادة المسارات المباشرة */

  async function restoreRoute(){

    if(window.__DHAD_ROUTE_RESTORING__)return;

    if(typeof sb==='undefined'||!sb||
       !window.__DHAD_LOOKUPS_READY__||
       typeof grades==='undefined'||
       typeof semesters==='undefined'||
       typeof categories==='undefined')return;

    window.__DHAD_ROUTE_RESTORING__=true;

    try{

      const url=new URL(location.href);

      const material=url.searchParams.get('material');
      const game=url.searchParams.get('game');
      const additional=url.searchParams.get('additional');
      const calendar=url.searchParams.get('calendar');
      const homeSection=url.searchParams.get('homeSection');


      /* فتح المادة مباشرة على صفحة التفاصيل */

      if(material){

        await showMaterialDirectPage(material);

        return;

      }


      restoreBaseMetadata();


      /* رابط القسم في الصفحة الرئيسية */

      if(homeSection){

        const row=(typeof homeSectionsPublic!=='undefined'?
          homeSectionsPublic:[])
          .find(x=>
            String(x.id)===String(homeSection)&&x.is_active
          );

        if(row){

          if(typeof hideAll==='function')hideAll();

          document.getElementById('home').style.display='block';

          const target=document.getElementById(
            'homeSectionPublic_'+homeSection
          );

          target?.scrollIntoView({
            behavior:'smooth',
            block:'center'
          });

          if(target){

            target.style.outline='2px solid var(--accent,#20a486)';
            target.style.outlineOffset='5px';

          }

        }else if(typeof showInfo==='function'){

          showInfo(
            'القسم غير متاح',
            'هذا القسم غير منشور حاليًا أو لم يعد موجودًا.'
          );

        }

        return;

      }


      /* الألعاب والموارد والتقويم */

      if(game||additional||calendar){

        const kind=game?'games':additional?'additional':'calendar';

        const id=game||additional||calendar;

        if(typeof hideAll==='function')hideAll();

        const page=document.getElementById(
          kind==='games'?'gamesPage':
          kind==='additional'?'additionalPage':
          'calendarPage'
        );

        if(page)page.style.display='block';

        if(typeof loadDhadFeatureData==='function'&&
           !window.__DHAD_FEATURE_DATA_READY__){

          await loadDhadFeatureData();

          await renderDhadFeaturePages();

          window.__DHAD_FEATURE_DATA_READY__=true;

        }else if(typeof renderDhadFeaturePages==='function'){

          await renderDhadFeaturePages();

        }


        if(kind==='games'){

          const gameRow=(dhadFeatureData.games||[])
            .find(x=>
              String(x.id)===String(id)&&dhadFeatureIsPublished(x)
            );

          if(gameRow){

            setDirectMetadata(
              'game',
              id,
              gameRow.title,
              gameRow.description,
              'لعبة تعليمية من منصة ضاد.'
            );

            await playDhadGame(id);

          }else{

            document.getElementById('gamesGrid')
              ?.insertAdjacentHTML(
                'afterbegin',
                '<div class="empty">هذه اللعبة غير متاحة أو لم تعد منشورة.</div>'
              );

          }

        }else{

          const rows=kind==='additional'?
            (dhadFeatureData.additional||[]):
            (dhadFeatureData.calendar||[]);

          const directItem=rows.find(x=>
            String(x.id)===String(id)&&dhadFeatureIsPublished(x)
          );

          if(directItem){

            setDirectMetadata(
              kind==='additional'?'additional':'calendar',
              id,
              directItem.title,
              directItem.description||directItem.year,
              kind==='additional'?
                'مورد تعليمي من منصة ضاد.':
                'تقويم دراسي من منصة ضاد.'
            );

          }

          const selector=kind==='additional'?
            '[data-dhad-additional-item]':
            '[data-dhad-calendar-item]';

          const target=Array.from(
            document.querySelectorAll(selector)
          ).find(el=>
            el.getAttribute(
              kind==='additional'?
                'data-dhad-additional-item':
                'data-dhad-calendar-item'
            )===String(id)
          );

          if(target){

            target.scrollIntoView({
              behavior:'smooth',
              block:'center'
            });

            target.style.outline='2px solid var(--accent,#20a486)';
            target.style.outlineOffset='5px';

          }else{

            document.getElementById(
              kind==='additional'?
                'additionalContent':
                'calendarGallery'
            )?.insertAdjacentHTML(
              'afterbegin',
              '<div class="empty">هذا المحتوى غير متاح أو لم يعد منشورًا.</div>'
            );

          }

        }

        return;

      }


      /* استعادة مسارات الصفحات */

      const route=String(location.hash||'').replace(/^#/,'');

      if(!route||route==='home'){

        if(document.getElementById('home')?.style.display!=='block'){
          goHome();
        }

        return;

      }

      if(route==='grades'){

        if(document.getElementById('gradesHubPage')?.style.display!=='block'){
          showGradesPage(false);
        }

        return;

      }

      if(['games','additional','calendar','certificate'].includes(route)){

        showDhadFeaturePage(route,false);

        return;

      }


      const p=route.split('/');

      const decodePart=value=>{

        try{
          return decodeURIComponent(value||'');
        }catch(e){
          return value||'';
        }

      };

      const resolveTrackIndex=(gradeId,value)=>{

        if(!value||value==='none')return null;

        if(/^\d+$/.test(value))return Number(value);

        return getTracksForGrade(gradeId)
          .findIndex(item=>item.name===decodePart(value));

      };

      const resolveFieldIndex=(gradeId,trackIndex,value)=>{

        if(!value||value==='none')return null;

        if(/^\d+$/.test(value))return Number(value);

        const track=getTracksForGrade(gradeId)[trackIndex];

        return track?.fields?.findIndex(
          item=>item===decodePart(value)
        )??-1;

      };


      if(p[0]==='grade'&&p[1]){

        showGrade(p[1],false);

        return;

      }

      if(p[0]==='track'&&p.length>=3){

        const ti=resolveTrackIndex(Number(p[1]),p[2]);

        if(ti!==null&&ti>=0){
          showTrack(Number(p[1]),ti,false);
        }

        return;

      }

      if(p[0]==='field'&&p.length>=4){

        const ti=resolveTrackIndex(Number(p[1]),p[2]);

        const fi=ti===null||ti<0?
          -1:
          resolveFieldIndex(Number(p[1]),ti,p[3]);

        if(ti>=0&&fi>=0){
          showField(Number(p[1]),ti,fi,false);
        }

        return;

      }

      if(p[0]==='semester'&&p.length>=5){

        const ti=resolveTrackIndex(Number(p[1]),p[2]);

        const fi=ti===null?
          null:
          resolveFieldIndex(Number(p[1]),ti,p[3]);

        const si=(typeof semesters!=='undefined'?semesters:[])
          .findIndex(x=>String(x.id)===String(p[4]));

        if(si>=0){
          showSemester(Number(p[1]),ti,fi,si,false);
        }

        return;

      }

      if(p[0]==='category'&&p.length>=4){

        const categoryIndex=(typeof categories!=='undefined'?categories:[])
          .findIndex(x=>String(x.id)===String(p[3]));

        if(categoryIndex>=0){

          const ti=p[4]&&p[4]!=='none'?
            resolveTrackIndex(Number(p[1]),p[4]):
            null;

          const fi=ti===null?
            null:
            resolveFieldIndex(Number(p[1]),ti,p[5]);

          await loadMaterials(
            Number(p[1]),
            Number(p[2]),
            categoryIndex,
            ti,
            fi,
            false
          );

        }

        return;

      }

    }finally{

      window.__DHAD_ROUTE_RESTORING__=false;

      finishDirectBootScreen();

    }

  }


  window.restoreDhadRouteFromLocation=restoreRoute;


  /* تهيئة النظام عند فتح رابط مادة مباشرة */

  const previousInit=window.initSupabase;

  if(typeof previousInit==='function'){

    window.initSupabase=async function(){

      const directMaterialId=
        new URLSearchParams(location.search).get('material');

      if(directMaterialId&&typeof sb!=='undefined'&&sb){

        const normalInit=(async()=>{

          try{

            await previousInit();

          }catch(error){

            console.error('Dhad background initialization:',error);

          }

        })();

        try{

          await showMaterialDirectPage(directMaterialId);

        }finally{

          finishDirectBootScreen();

        }

        await normalInit;

        return;

      }

      try{

        await previousInit();

        if(typeof sb!=='undefined'&&sb){

          if(typeof loadDhadFeatureData==='function'&&
             !window.__DHAD_FEATURE_DATA_READY__){

            await loadDhadFeatureData();

            await renderDhadFeaturePages();

            window.__DHAD_FEATURE_DATA_READY__=true;

          }

          await restoreRoute();

        }

      }finally{

        finishDirectBootScreen();

      }

    };

  }


  document.addEventListener('DOMContentLoaded',addPageShareButtons);

  window.addEventListener('hashchange',()=>{
    restoreRoute();
  });

  window.addEventListener('popstate',()=>{
    restoreRoute();
  });


  /* معالجة حالة تحميل Supabase قبل هذا الملف */

  if(window.__SUPABASE_LOADED__){

    if(typeof sb==='undefined'||!sb){

      if(typeof initUI==='function'){
        initUI();
      }

    }else if(window.__DHAD_LOOKUPS_READY__){

      restoreRoute();

    }

  }

})();
