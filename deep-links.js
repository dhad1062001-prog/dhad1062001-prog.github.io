/* ضاد | نظام الروابط المباشرة والمشاركة - إضافة مستقلة لا تغيّر قاعدة البيانات */
(function(){
  'use strict';
  const DIRECT_KEYS=['material','game','additional','calendar','homeSection'];
  const requestedAtBoot=new URL(location.href);
  const hasDirectEntry=!!window.__DHAD_DIRECT_ENTRY__ || DIRECT_KEYS.some(key=>requestedAtBoot.searchParams.has(key)) || (!!location.hash&&location.hash!=='#home');
  let bootScreen=document.getElementById('dhadDirectBoot');
  function finishDirectBootScreen(){
    if(bootScreen){bootScreen.classList.add('dhad-boot-hide');window.setTimeout(()=>{bootScreen?.remove();bootScreen=null;},220);}
  }
  const baseHideAll=window.hideAll;
  const style=document.createElement('style');
  style.textContent=`
    #dhadMaterialDirectPage .dhad-direct-card{background:var(--panel,#fff);border:1px solid var(--line,#e5e7eb);border-radius:20px;padding:clamp(16px,3vw,28px);box-shadow:0 10px 30px rgba(0,0,0,.05)}
    #dhadMaterialDirectPage .dhad-direct-meta{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
    #dhadMaterialDirectPage .dhad-direct-meta span{background:var(--soft,#f4f4f0);border:1px solid var(--line,#e5e7eb);border-radius:999px;padding:6px 11px;font-size:.9rem}
    #dhadMaterialDirectPage .dhad-direct-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px}
    #dhadMaterialDirectPage .dhad-direct-actions button{min-height:44px}
    .dhad-feature-share{display:flex;justify-content:flex-start;margin-top:12px}
    .dhad-uploaded-link{margin-top:10px}
    .dhad-uploaded-link:empty{display:none}
    .dhad-uploaded-link .dhad-uploaded-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--soft,#f7f7f4);border:1px solid var(--line,#e5e5df);padding:10px 12px;border-radius:12px;margin-top:8px}
    .dhad-uploaded-link code{direction:ltr;unicode-bidi:plaintext;overflow-wrap:anywhere;font-size:.82rem}
    .dhad-uploaded-link button{white-space:nowrap}
  `;
  document.head.appendChild(style);

  function ensureMaterialPage(){
    if(document.getElementById('dhadMaterialDirectPage'))return;
    const section=document.createElement('section');
    section.className='content-page';section.id='dhadMaterialDirectPage';section.style.display='none';
    section.innerHTML=`<div class="panel"><button class="back" type="button" onclick="goHomeAndClearDirectLink()">↩ العودة إلى ضاد</button><div class="crumb">الرئيسية ← المادة التعليمية</div><div class="page-title"><h2 id="dhadDirectMaterialTitle">المادة التعليمية</h2><p>رابط مباشر من منصة ضاد</p></div><div class="dhad-direct-card"><div id="dhadDirectMaterialStatus" class="empty">جاري تحميل بيانات المادة...</div><div id="dhadDirectMaterialBody"></div></div></div>`;
    const listing=document.getElementById('listingPage');
    if(listing?.parentNode)listing.parentNode.insertBefore(section,listing.nextSibling);else document.body.appendChild(section);
  }
  ensureMaterialPage();

  // Keep the new direct page in the app's normal hide/show lifecycle.
  if(typeof baseHideAll==='function'){
    window.hideAll=function(){baseHideAll();const page=document.getElementById('dhadMaterialDirectPage');if(page)page.style.display='none';};
  }

  const originalSetRoute=window.setRoute;
  window.setRoute=function(route){
    try{
      const url=new URL(location.href);let changed=false;
      DIRECT_KEYS.forEach(key=>{if(url.searchParams.has(key)){url.searchParams.delete(key);changed=true;}});
      if(changed)history.replaceState(null,'',url.pathname+url.search+url.hash);
    }catch(e){}
    if(typeof originalSetRoute==='function')return originalSetRoute(route);
  };

  function directUrl(kind,id){
    const key=kind==='material'?'material':kind==='game'?'game':kind==='additional'?'additional':kind==='calendar'?'calendar':kind==='homeSection'?'homeSection':'';
    if(!key||!id)return '';
    const url=new URL(location.origin+location.pathname);
    url.searchParams.set(key,String(id));
    return url.href;
  }
  window.getDhadDirectUrl=directUrl;
  window.shareCurrentDhadPage=async function(){
    const url=location.href;
    if(navigator.share){try{await navigator.share({title:'منصة ضاد - اللغة العربية',text:'رابط مباشر من منصة ضاد',url});return;}catch(error){if(error?.name==='AbortError')return;}}
    const copied=await copyText(url);
    if(typeof showInfo==='function')showInfo(copied?'تم نسخ رابط الصفحة':'تعذر نسخ الرابط',copied?'يمكنك الآن مشاركة الصفحة مع الآخرين.':'الرابط: '+url);
  };
  function addPageShareButtons(){
    const allowed=['gradesHubPage','gradePage','listingPage','gamesPage','additionalPage','calendarPage','certificatePage'];
    allowed.forEach(id=>{
      const page=document.getElementById(id),heading=page?.querySelector('.page-title');
      if(!heading||heading.querySelector('[data-dhad-page-share]'))return;
      const button=document.createElement('button');button.type='button';button.className='secondary ui-shape';button.setAttribute('data-dhad-page-share','true');button.textContent='🔗 نسخ رابط الصفحة';button.addEventListener('click',()=>shareCurrentDhadPage());
      heading.appendChild(button);
    });
  }
  addPageShareButtons();

  async function copyText(value){
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}}catch(e){}
    try{const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return !!ok;}catch(e){return false;}
  }
  window.shareDhadLink=async function(kind,id){
    const url=directUrl(kind,id);if(!url)return;
    const labels={material:'مادة تعليمية من منصة ضاد',game:'لعبة تعليمية من منصة ضاد',additional:'مورد تعليمي من منصة ضاد',calendar:'تقويم دراسي من منصة ضاد',homeSection:'قسم من الصفحة الرئيسية في منصة ضاد'};
    const title=labels[kind]||'محتوى من منصة ضاد';
    if(navigator.share){
      try{await navigator.share({title,text:title,url});return;}catch(error){if(error?.name==='AbortError')return;}
    }
    const copied=await copyText(url);
    if(typeof showInfo==='function')showInfo(copied?'تم نسخ الرابط':'تعذر نسخ الرابط',copied?'يمكنك الآن إرسال الرابط إلى واتساب أو فيسبوك أو أي تطبيق آخر.':'انسخ الرابط يدويًا: '+url);
  };
  window.showUploadedMaterialLink=function(containerId,id,title){
    const el=document.getElementById(containerId);if(!el)return;
    const url=directUrl('material',id);if(!url)return;
    el.innerHTML='<div class="dhad-uploaded-row"><div><b>'+safeText(title||'المادة الجديدة')+'</b><br><code>'+safeText(url)+'</code></div><button type="button" class="secondary" onclick="shareDhadLink(\'material\',\''+safeText(id)+'\')">🔗 نسخ / مشاركة الرابط</button></div>';
  };
  window.renderBatchUploadedLinks=function(){
    const el=document.getElementById('batchUploadedLinks');if(!el)return;
    const rows=(typeof materialBatchQueue!=='undefined'?materialBatchQueue:[]).filter(x=>x.materialId);
    el.innerHTML=rows.map(x=>{const url=directUrl('material',x.materialId);return '<div class="dhad-uploaded-row"><div><b>'+safeText(x.title||x.file?.name||'ملف')+'</b><br><code>'+safeText(url)+'</code></div><button type="button" class="secondary" onclick="shareDhadLink(\'material\',\''+safeText(x.materialId)+'\')">🔗 نسخ / مشاركة</button></div>';}).join('');
  };
  function safeText(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  window.goHomeAndClearDirectLink=function(){
    try{const url=new URL(location.href);DIRECT_KEYS.forEach(key=>url.searchParams.delete(key));history.replaceState(null,'',url.pathname+url.search+url.hash);}catch(e){}
    if(typeof goHome==='function')goHome();
  };

  async function showMaterialDirectPage(id){
    ensureMaterialPage();
    const page=document.getElementById('dhadMaterialDirectPage');
    const status=document.getElementById('dhadDirectMaterialStatus');
    const body=document.getElementById('dhadDirectMaterialBody');
    if(typeof hideAll==='function')hideAll();
    page.style.display='block';status.textContent='جاري تحميل بيانات المادة...';body.innerHTML='';
    if(typeof sb==='undefined'||!sb){status.textContent='تعذر الاتصال بقاعدة البيانات. حدّث الصفحة وحاول مجددًا.';return;}
    try{
      const {data,error}=await sb.from('materials').select('id,title,description,grade_id,semester_id,category_id,file_path,file_name,file_type,file_size,created_at,track_name,field_name,is_public').eq('id',id).eq('is_public',true).maybeSingle();
      if(error)throw error;
      if(!data){status.textContent='هذه المادة غير متاحة للعامة أو لم تعد موجودة.';return;}
      window.__materials=[data];
      const grade=(typeof grades!=='undefined'?grades:[]).find(x=>String(x.id)===String(data.grade_id));
      const semester=(typeof semesters!=='undefined'?semesters:[]).find(x=>String(x.id)===String(data.semester_id));
      const category=(typeof categories!=='undefined'?categories:[]).find(x=>String(x.id)===String(data.category_id));
      const meta=[grade?.name, data.track_name, data.field_name, semester?.name, category?.name].filter(Boolean);
      document.getElementById('dhadDirectMaterialTitle').textContent=data.title||'مادة تعليمية';
      status.textContent='تم العثور على المادة التعليمية.';
      body.innerHTML=(data.description?'<p>'+safeText(data.description)+'</p>':'')+
        '<div class="dhad-direct-meta">'+meta.map(x=>'<span>'+safeText(x)+'</span>').join('')+'<span>'+safeText((data.file_type||'ملف').split('/').pop().toUpperCase())+'</span></div>'+
        '<p><b>اسم الملف:</b> '+safeText(data.file_name||data.title||'ملف')+'</p>'+
        '<div class="dhad-direct-actions"><button class="primary" type="button" onclick="downloadMaterial(\''+safeText(data.id)+'\')">⬇ تنزيل الملف</button><button class="preview" type="button" onclick="previewMaterial(\''+safeText(data.id)+'\')">👁 معاينة الملف</button><button class="secondary" type="button" onclick="shareDhadLink(\'material\',\''+safeText(data.id)+'\')">🔗 مشاركة الرابط</button></div>';
    }catch(error){console.error('Dhad direct material route:',error);status.textContent='تعذر تحميل المادة. تحقق من الاتصال ثم أعد المحاولة.';}
  }

  async function restoreRoute(){
    if(window.__DHAD_ROUTE_RESTORING__)return;
    if(typeof sb==='undefined'||!sb||!window.__DHAD_LOOKUPS_READY__||typeof grades==='undefined'||typeof semesters==='undefined'||typeof categories==='undefined')return;
    window.__DHAD_ROUTE_RESTORING__=true;
    try{
      const url=new URL(location.href);
      const material=url.searchParams.get('material');
      const game=url.searchParams.get('game');
      const additional=url.searchParams.get('additional');
      const calendar=url.searchParams.get('calendar');
      const homeSection=url.searchParams.get('homeSection');
      if(material){await showMaterialDirectPage(material);return;}
      if(homeSection){
        const row=(typeof homeSectionsPublic!=='undefined'?homeSectionsPublic:[]).find(x=>String(x.id)===String(homeSection)&&x.is_active);
        if(row){if(typeof hideAll==='function')hideAll();document.getElementById('home').style.display='block';const target=document.getElementById('homeSectionPublic_'+homeSection);target?.scrollIntoView({behavior:'smooth',block:'center'});if(target){target.style.outline='2px solid var(--accent,#20a486)';target.style.outlineOffset='5px';}}
        else if(typeof showInfo==='function')showInfo('القسم غير متاح','هذا القسم غير منشور حاليًا أو لم يعد موجودًا.');
        return;
      }
      if(game||additional||calendar){
        const kind=game?'games':additional?'additional':'calendar';
        const id=game||additional||calendar;
        if(typeof hideAll==='function')hideAll();
        const page=document.getElementById(kind==='games'?'gamesPage':kind==='additional'?'additionalPage':'calendarPage');
        if(page)page.style.display='block';
        if(typeof loadDhadFeatureData==='function'&&!window.__DHAD_FEATURE_DATA_READY__){await loadDhadFeatureData();await renderDhadFeaturePages();window.__DHAD_FEATURE_DATA_READY__=true;}
        else if(typeof renderDhadFeaturePages==='function')await renderDhadFeaturePages();
        if(kind==='games'){
          const gameRow=(dhadFeatureData.games||[]).find(x=>String(x.id)===String(id)&&x.active!==false);
          if(gameRow)await playDhadGame(id);else document.getElementById('gamesGrid').insertAdjacentHTML('afterbegin','<div class="empty">هذه اللعبة غير متاحة أو لم تعد منشورة.</div>');
        }else{
          const selector=kind==='additional'?'[data-dhad-additional-item]':'[data-dhad-calendar-item]';
          const target=Array.from(document.querySelectorAll(selector)).find(el=>el.getAttribute(kind==='additional'?'data-dhad-additional-item':'data-dhad-calendar-item')===String(id));
          if(target){target.scrollIntoView({behavior:'smooth',block:'center'});target.style.outline='2px solid var(--accent,#20a486)';target.style.outlineOffset='5px';}
          else document.getElementById(kind==='additional'?'additionalContent':'calendarGallery')?.insertAdjacentHTML('afterbegin','<div class="empty">هذا المحتوى غير متاح أو لم يعد منشورًا.</div>');
        }
        return;
      }
      const route=String(location.hash||'').replace(/^#/,'');
      if(!route||route==='home'){if(document.getElementById('home')?.style.display!=='block')goHome();return;}
      if(route==='grades'){if(document.getElementById('gradesHubPage')?.style.display!=='block')showGradesPage(false);return;}
      if(['games','additional','calendar','certificate'].includes(route)){showDhadFeaturePage(route,false);return;}
      const p=route.split('/');
      const decodePart=value=>{try{return decodeURIComponent(value||'');}catch(e){return value||'';}};
      const resolveTrackIndex=(gradeId,value)=>{if(!value||value==='none')return null;if(/^\d+$/.test(value))return Number(value);return getTracksForGrade(gradeId).findIndex(item=>item.name===decodePart(value));};
      const resolveFieldIndex=(gradeId,trackIndex,value)=>{if(!value||value==='none')return null;if(/^\d+$/.test(value))return Number(value);const track=getTracksForGrade(gradeId)[trackIndex];return track?.fields?.findIndex(item=>item===decodePart(value))??-1;};
      if(p[0]==='grade'&&p[1]){showGrade(p[1],false);return;}
      if(p[0]==='track'&&p.length>=3){const ti=resolveTrackIndex(Number(p[1]),p[2]);if(ti!==null&&ti>=0)showTrack(Number(p[1]),ti,false);return;}
      if(p[0]==='field'&&p.length>=4){const ti=resolveTrackIndex(Number(p[1]),p[2]);const fi=ti===null||ti<0?-1:resolveFieldIndex(Number(p[1]),ti,p[3]);if(ti>=0&&fi>=0)showField(Number(p[1]),ti,fi,false);return;}
      if(p[0]==='semester'&&p.length>=5){
        const ti=resolveTrackIndex(Number(p[1]),p[2]),fi=ti===null?null:resolveFieldIndex(Number(p[1]),ti,p[3]);
        const si=(typeof semesters!=='undefined'?semesters:[]).findIndex(x=>String(x.id)===String(p[4]));
        if(si>=0)showSemester(Number(p[1]),ti,fi,si,false);return;
      }
      if(p[0]==='category'&&p.length>=4){
        const categoryIndex=(typeof categories!=='undefined'?categories:[]).findIndex(x=>String(x.id)===String(p[3]));
        if(categoryIndex>=0){const ti=p[4]&&p[4]!=='none'?resolveTrackIndex(Number(p[1]),p[4]):null;const fi=ti===null?null:resolveFieldIndex(Number(p[1]),ti,p[5]);await loadMaterials(Number(p[1]),Number(p[2]),categoryIndex,ti,fi,false);}return;
      }
    }finally{window.__DHAD_ROUTE_RESTORING__=false;finishDirectBootScreen();}
  }
  window.restoreDhadRouteFromLocation=restoreRoute;

  // Open a requested material as soon as the Supabase client is available.
  // Do not make the material wait for unrelated grade/semester/category lookups.
  const previousInit=window.initSupabase;
  if(typeof previousInit==='function'){
    window.initSupabase=async function(){
      const directMaterialId=new URLSearchParams(location.search).get('material');
      if(directMaterialId&&typeof sb!=='undefined'&&sb){
        // Keep normal authentication and lookup initialization running in parallel.
        const normalInit=(async()=>{
          try{await previousInit();}
          catch(error){console.error('Dhad background initialization:',error);}
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
          if(typeof loadDhadFeatureData==='function'&&!window.__DHAD_FEATURE_DATA_READY__){await loadDhadFeatureData();await renderDhadFeaturePages();window.__DHAD_FEATURE_DATA_READY__=true;}
          await restoreRoute();
        }
      }finally{
        finishDirectBootScreen();
      }
    };
  }
  document.addEventListener('DOMContentLoaded',addPageShareButtons);
  window.addEventListener('hashchange',()=>{restoreRoute();});
  window.addEventListener('popstate',()=>{restoreRoute();});
  // Handle the rare case where Supabase finished loading before this script was parsed.
  if(window.__SUPABASE_LOADED__){
    if(typeof sb==='undefined'||!sb){if(typeof initUI==='function')initUI();}
    else if(window.__DHAD_LOOKUPS_READY__)restoreRoute();
  }
})();
