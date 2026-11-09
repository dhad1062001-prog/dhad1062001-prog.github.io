/* ضاد | قياس الزيارات والتنزيلات وإحصائيات الإدارة */
(function(){
'use strict';
const EVENT_FN='record-analytics-event',ADMIN_FN='admin-analytics';
let started=false,visitorHashPromise=null,sessionHashPromise=null,lastPagePath='',activeMaterialDownloadId=null;
function api(){return typeof sb!=='undefined'&&sb?sb:null;}
function randomId(){if(window.crypto?.randomUUID)return window.crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);});}
function stored(store,key){try{if(!store)return randomId();let v=store.getItem(key);if(!v){v=randomId();store.setItem(key,v);}return v;}catch(e){return randomId();}}
function storage(name){try{return window[name];}catch(e){return null;}}
async function digest(v){if(!window.crypto?.subtle)return null;const b=new TextEncoder().encode(v),d=await window.crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function visitor(){if(!visitorHashPromise)visitorHashPromise=digest(stored(storage('localStorage'),'dhad_analytics_visitor_v1'));return visitorHashPromise;}
function session(){if(!sessionHashPromise)sessionHashPromise=digest(stored(storage('sessionStorage'),'dhad_analytics_session_v1'));return sessionHashPromise;}
function device(){const w=innerWidth||0;return w&&w<600?'mobile':w&&w<1024?'tablet':w?'desktop':'unknown';}
function path(){const u=new URL(location.href);const q=u.searchParams.has('material')?'?material':u.searchParams.has('game')?'?game':'';return u.pathname+q+u.hash;}
async function record(type,materialId){
 const client=api();if(!client?.functions)return null;
 try{
  const [v,s]=await Promise.all([visitor(),session()]);if(!v)return null;
  const body={event_id:randomId(),event_type:type,visitor_hash:v,session_hash:s,material_id:materialId?String(materialId):null,page_path:path(),referrer_host:(()=>{try{return document.referrer?new URL(document.referrer).hostname:'';}catch(e){return '';}})(),device_type:device()};
  const {data,error}=await client.functions.invoke(EVENT_FN,{body});
  if(error){console.warn('تعذر تسجيل إحصائية ضاد:',error.message||error);return null;}
  if(type==='download'&&materialId&&Number.isFinite(Number(data?.download_count)))updateCount(materialId,Number(data.download_count));
  return data;
 }catch(e){console.warn('تعذر تسجيل إحصائية ضاد.',e);return null;}
}
function updateCount(id,count){
 const key=String(id);
 document.querySelectorAll('[data-material-count]').forEach(el=>{
  if(el.getAttribute('data-material-count')!==key)return;
  const value=el.querySelector('[data-count-value]');if(value)value.textContent=Number(count).toLocaleString('ar');else el.textContent=Number(count).toLocaleString('ar');
 });
 [window.__materials,window.__adminMaterials,window.__homeLatestMaterials].forEach(rows=>{if(Array.isArray(rows))rows.forEach(row=>{if(String(row.id)===key)row.download_count=count;});});
}
function pageView(){const p=path();if(p===lastPagePath)return;lastPagePath=p;record('page_view');}
function hookNavigation(){
 const push=history.pushState;history.pushState=function(){const r=push.apply(this,arguments);queueMicrotask(pageView);return r;};
 const replace=history.replaceState;history.replaceState=function(){const r=replace.apply(this,arguments);queueMicrotask(pageView);return r;};
 addEventListener('hashchange',pageView);addEventListener('popstate',pageView);
}
function hookAdminPage(){
 if(typeof window.showAdminPage==='function'&&!window.showAdminPage.__dhadAnalytics){
  const original=window.showAdminPage;
  const wrapped=async function(){
   const result=await original.apply(this,arguments);
   if(typeof isFileManager==='function'&&isFileManager())window.loadDhadAdminAnalytics();
   return result;
  };
  wrapped.__dhadAnalytics=true;
  window.showAdminPage=wrapped;
 }
}
function hookActions(){
 if(typeof window.openMaterialInfoPage==='function'&&!window.openMaterialInfoPage.__dhadAnalytics){const fn=window.openMaterialInfoPage;const w=async function(id){if(id)record('material_view',id);return fn.apply(this,arguments);};w.__dhadAnalytics=true;window.openMaterialInfoPage=w;}
 if(typeof window.previewMaterial==='function'&&!window.previewMaterial.__dhadAnalytics){const fn=window.previewMaterial;const w=function(id){if(id)record('preview',id);return fn.apply(this,arguments);};w.__dhadAnalytics=true;window.previewMaterial=w;}
 if(typeof window.downloadMaterial==='function'&&!window.downloadMaterial.__dhadAnalytics){const fn=window.downloadMaterial;const w=async function(id){activeMaterialDownloadId=String(id||'');try{return await fn.apply(this,arguments);}finally{activeMaterialDownloadId=null;}};w.__dhadAnalytics=true;window.downloadMaterial=w;}
 if(typeof window.triggerFileDownload==='function'&&!window.triggerFileDownload.__dhadAnalytics){const fn=window.triggerFileDownload;const w=function(){if(activeMaterialDownloadId)record('download',activeMaterialDownloadId);return fn.apply(this,arguments);};w.__dhadAnalytics=true;window.triggerFileDownload=w;}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function num(v){return Number(v||0).toLocaleString('ar');}
function setStatus(msg,type){const el=document.getElementById('dhadAnalyticsStatus');if(!el)return;el.textContent=msg||'';el.className='status'+(msg?' show':'');el.style.background=type==='error'?'rgba(180,50,50,.12)':type==='ok'?'rgba(50,140,80,.12)':'rgba(199,154,74,.11)';}
function list(rows,materials){
 if(!Array.isArray(rows)||!rows.length)return '<p>لا توجد بيانات خلال الفترة المحددة.</p>';
 return '<ol style="padding-right:22px;margin:0">'+rows.map(x=>materials?'<li style="margin:8px 0"><b>'+esc(x.title||'ملف')+'</b> — تنزيلات: '+num(x.downloads)+' · مشاهدات: '+num(x.views)+'</li>':'<li style="margin:8px 0">'+esc(x.path||'/')+' — '+num(x.views)+'</li>').join('')+'</ol>';
}
function daily(rows){
 if(!Array.isArray(rows)||!rows.length)return 'لا توجد بيانات بعد.';
 return '<table style="width:100%;border-collapse:collapse;min-width:420px"><thead><tr><th style="text-align:right;padding:8px">التاريخ</th><th style="padding:8px">الزيارات</th><th style="padding:8px">الزوار</th><th style="padding:8px">التنزيلات</th></tr></thead><tbody>'+rows.map(x=>'<tr><td style="padding:8px;border-top:1px solid var(--line,#ddd)">'+esc(x.day)+'</td><td style="text-align:center;border-top:1px solid var(--line,#ddd)">'+num(x.page_views)+'</td><td style="text-align:center;border-top:1px solid var(--line,#ddd)">'+num(x.unique_visitors)+'</td><td style="text-align:center;border-top:1px solid var(--line,#ddd)">'+num(x.downloads)+'</td></tr>').join('')+'</tbody></table>';
}
window.loadDhadAdminAnalytics=async function(){
 const client=api();if(!client){setStatus('لم يكتمل الاتصال بقاعدة البيانات.','error');return;}
 if(typeof isFileManager==='function'&&!isFileManager()){setStatus('هذه الإحصائيات متاحة للإدارة فقط.','error');return;}
 const days=Number(document.getElementById('dhadAnalyticsRange')?.value||30),to=new Date(),from=new Date(to.getTime()-days*86400000);
 setStatus('جارٍ تحميل الإحصائيات...');
 try{
  const {data,error}=await client.functions.invoke(ADMIN_FN,{body:{from:from.toISOString(),to:to.toISOString()}});if(error)throw error;
  const t=data?.totals||{},put=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=num(v);};
  put('dhadAnalyticsPageViews',t.page_views);put('dhadAnalyticsVisitors',t.unique_visitors);put('dhadAnalyticsDownloads',t.downloads);put('dhadAnalyticsMaterialViews',t.material_views);
  const m=document.getElementById('dhadAnalyticsTopMaterials'),p=document.getElementById('dhadAnalyticsTopPages'),d=document.getElementById('dhadAnalyticsDaily');
  if(m)m.innerHTML=list(data?.top_materials,true);if(p)p.innerHTML=list(data?.top_pages,false);if(d)d.innerHTML=daily(data?.daily);
  setStatus('تم تحديث الإحصائيات. الزوار الفريدون تقديريون ويُحسبون بمعرّف مجهول محفوظ في المتصفح.','ok');
 }catch(e){console.warn('تعذر تحميل إحصائيات الإدارة:',e);setStatus('تعذر تحميل الإحصائيات. تحقق من تسجيل الدخول وصلاحية الإدارة ثم أعد المحاولة.','error');}
};
function start(){
 if(started||!api())return;started=true;hookNavigation();hookActions();hookAdminPage();pageView();
 const id=new URL(location.href).searchParams.get('material');if(id)record('material_view',id);
}
start();addEventListener('supabase-loaded',start);addEventListener('load',start);
})();