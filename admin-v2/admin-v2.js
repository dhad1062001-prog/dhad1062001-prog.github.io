(() => {
"use strict";
const SUPABASE_URL="https://rjkrfvnexrhebvulrtgp.supabase.co";
const SUPABASE_KEY="sb_publishable_INgrDnl6WPs_vNhpvwXMSA_YiHX8x7J";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root=document.getElementById("dhad-admin");
const OWNER="dhad1062001@gmail.com";
let session=null,access=null,active="overview",sections=[],pages=[],links=[],analytics=null;
const names={overview:"الرئيسية",sections:"إدارة الأقسام",files:"إدارة الملفات",analytics:"الإحصائيات",pages:"صفحات الموقع",social:"مواقع التواصل"};
const icons={overview:"⌂",sections:"▤",files:"▧",analytics:"▥",pages:"▣",social:"◎"};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg,bad=false){const el=document.createElement("div");el.className="toast"+(bad?" bad":"");el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),3200)}
function fail(err){console.error(err);toast(err?.message||"حدث خطأ غير متوقع",true)}
async function adminAction(action,extra={}){const {data,error}=await sb.functions.invoke("admin-control",{body:{action,...extra}});if(error)throw error;if(data?.error)throw new Error(data.detail||data.error);return data}
function login(message=""){root.innerHTML='<div class="login-wrap"><section class="login-card"><div class="brand-mark">ض</div><h1>مركز إدارة ضاد</h1><p>لوحة إدارة مستقلة لمنصة اللغة العربية، متصلة بقاعدة البيانات مع التحقق من صلاحية الحساب من الخادم.</p>'+(message?'<div class="error">'+esc(message)+'</div>':'')+'<button class="btn login-btn" id="login">المتابعة باستخدام Google</button><small class="login-foot">تسجيل الدخول لا يمنح صلاحية الإدارة تلقائياً. لا تظهر اللوحة إلا للحسابات المعتمدة.</small></section></div>';document.getElementById("login").onclick=async e=>{e.currentTarget.disabled=true;e.currentTarget.textContent="جارٍ تحويلك…";const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});if(error)login(error.message)}}
function denied(){root.innerHTML='<div class="login-wrap"><section class="login-card"><div class="brand-mark">ض</div><h1>لا تملك صلاحية الدخول</h1><p>تم تسجيل الدخول، لكن الحساب غير معتمد لإدارة منصة ضاد.</p><button class="btn" id="out">العودة لتسجيل الدخول</button></section></div>';document.getElementById("out").onclick=async()=>{await sb.auth.signOut({scope:"local"});login()}}
function shell(){root.innerHTML='<div class="layout"><aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">ض</span><span><strong>ضــاد</strong><small>مركز إدارة المنصة</small></span></div><div class="side-label">إدارة المنصة</div><nav class="nav">'+Object.keys(names).map(k=>'<button data-nav="'+k+'" class="'+(k===active?'active':'')+'"><span class="ico">'+icons[k]+'</span>'+names[k]+'</button>').join("")+'</nav><div class="side-bottom"><div class="userline">'+esc(session.user.email)+'<br><span class="muted">صلاحية: '+esc(access.role||"مدير")+'</span></div><button class="btn light" style="width:100%;margin-top:12px" id="logout">تسجيل الخروج</button></div></aside><div class="mobile-scrim" id="scrim"></div><main class="main"><header class="topbar"><div><button class="btn light mobile-menu" id="menu">☰</button><div class="eyebrow">ضــاد / مركز الإدارة</div><h1 id="pageTitle">'+names[active]+'</h1></div><div class="top-actions"><a class="btn light" href="./" target="_blank" rel="noopener">عرض الموقع ↗</a></div></header><div id="view"></div></main></div>';root.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>go(b.dataset.nav));document.getElementById("logout").onclick=async()=>{await sb.auth.signOut({scope:"local"});login()};document.getElementById("menu").onclick=()=>{document.getElementById("sidebar").classList.toggle("open");document.getElementById("scrim").classList.toggle("show")};document.getElementById("scrim").onclick=()=>{document.getElementById("sidebar").classList.remove("open");document.getElementById("scrim").classList.remove("show")};render()}
function go(key){active=key;root.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===key));document.getElementById("pageTitle").textContent=names[key];document.getElementById("sidebar").classList.remove("open");document.getElementById("scrim").classList.remove("show");render()}
function canOwner(){return access.owner===true}
function render(){const v=document.getElementById("view");if(active==="overview")return overview(v);if(active==="sections")return loadSections(v);if(active==="analytics")return loadAnalytics(v);if(active==="pages")return loadPages(v);if(active==="social")return loadLinks(v);if(active==="files")return filesPlaceholder(v)}
function overview(v){v.innerHTML='<section class="welcome"><h2>مرحباً بك في إدارة ضاد</h2><p>من هنا يمكنك إدارة الملفات والأقسام ومحتوى الموقع ومتابعة أداء المنصة.</p></section><div class="grid" id="quickStats"><article class="stat"><span class="stat-icon">▧</span><div class="label">الملفات المنشورة</div><strong>…</strong><small>يتم تحميل البيانات</small></article><article class="stat"><span class="stat-icon">▤</span><div class="label">الأقسام</div><strong>…</strong><small>الأقسام الرئيسية والفرعية</small></article><article class="stat"><span class="stat-icon">◉</span><div class="label">زيارات الموقع</div><strong>…</strong><small>آخر 30 يوماً</small></article><article class="stat"><span class="stat-icon">↓</span><div class="label">التنزيلات</div><strong>…</strong><small>آخر 30 يوماً</small></article></div><div class="section-head"><div><h2>أقسام الإدارة</h2><p>اختر القسم الذي تريد العمل عليه</p></div></div><div class="module-grid">'+Object.keys(names).filter(k=>k!=="overview").map(k=>'<button class="module-card" data-go="'+k+'"><span class="module-icon">'+icons[k]+'</span><span><b>'+names[k]+'</b><small>'+({sections:"إضافة الأقسام وتنظيم المستويات الفرعية",files:"رفع الملفات وإدارة بياناتها وتصنيفاتها",analytics:"الزيارات والتنزيلات والتقارير",pages:"تحديث محتوى صفحات الموقع",social:"إدارة روابط التواصل الاجتماعي"}[k])+'</small></span></button>').join("")+'</div><div class="notice">هذه نسخة تطوير مستقلة. لن تتغير صفحات الموقع العامة أو لوحة الإدارة الحالية حتى اكتمال الاختبارات والموافقة على النشر.</div>';v.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));loadQuickStats()}
async function loadQuickStats(){try{const [m,s,a]=await Promise.all([sb.from("materials").select("id",{count:"exact",head:true}).eq("is_public",true),sb.from("home_sections").select("id",{count:"exact",head:true}),adminAction("my_access").then(()=>sb.functions.invoke("admin-analytics"))]);const totals=a.data?.totals||{};const cards=document.querySelectorAll("#quickStats .stat strong");if(cards[0])cards[0].textContent=m.count??"—";if(cards[1])cards[1].textContent=s.count??"—";if(cards[2])cards[2].textContent=totals.page_views??"—";if(cards[3])cards[3].textContent=totals.downloads??"—";}catch(e){console.warn("quick stats",e)}}
function canManageContent(){return access?.owner===true}
async function loadSections(v){
 v.innerHTML='<div class="section-head"><div><h2>الأقسام الرئيسية والفرعية</h2><p>إدارة هيكل الأقسام مع الحفاظ على روابط المواد الحالية.</p></div>'+(canManageContent()?'<button class="btn gold" id="newSection">＋ إضافة قسم</button>':'')+'</div><div class="panel"><div class="toolbar"><input id="sectionSearch" placeholder="ابحث عن قسم…" style="max-width:300px"><button class="btn light" id="refreshSections">تحديث</button></div><div id="sectionTable" class="empty">جارٍ تحميل الأقسام…</div></div><div id="sectionForm"></div>';
 document.getElementById("refreshSections").onclick=()=>loadSections(v);
 document.getElementById("sectionSearch").oninput=e=>drawSections(document.getElementById("sectionTable"),e.target.value);
 document.getElementById("newSection")?.addEventListener("click",()=>sectionForm());
 const {data,error}=await sb.from("home_sections").select("id,title,content_type,content,sort_order,is_active,parent_id,section_description,icon,show_on_home,slug").order("sort_order").order("id");
 if(error){document.getElementById("sectionTable").textContent="تعذر تحميل الأقسام: "+error.message;return}
 sections=data||[];drawSections(document.getElementById("sectionTable"));
}
function drawSections(el,q=""){
 const query=q.trim().toLowerCase();
 const rows=sections.filter(x=>(x.title+" "+(x.slug||"")).toLowerCase().includes(query));
 if(!rows.length){el.innerHTML='<div class="empty">لا توجد أقسام مطابقة.</div>';return}
 const roots=rows.filter(x=>!x.parent_id);
 el.innerHTML='<div class="table-wrap"><table><thead><tr><th>اسم القسم</th><th>المستوى</th><th>الظهور</th><th>الترتيب</th><th>الإجراءات</th></tr></thead><tbody>'+roots.map(p=>sectionRow(p,false)+rows.filter(c=>c.parent_id===p.id).map(c=>sectionRow(c,true)).join("")).join("")+rows.filter(x=>x.parent_id&&!sections.some(p=>p.id===x.parent_id)).map(x=>sectionRow(x,true)).join("")+'</tbody></table></div>';
 el.querySelectorAll("[data-edit-section]").forEach(btn=>btn.onclick=()=>sectionForm(Number(btn.dataset.editSection)));
 el.querySelectorAll("[data-delete-section]").forEach(btn=>btn.onclick=()=>deleteSection(Number(btn.dataset.deleteSection)));
 el.querySelectorAll("[data-toggle-section]").forEach(btn=>btn.onclick=()=>toggleSection(Number(btn.dataset.toggleSection)));
}
function sectionRow(s,child){
 const actions=canManageContent()?'<div class="row-actions"><button class="btn light tiny" data-edit-section="'+s.id+'">تعديل</button><button class="btn light tiny" data-toggle-section="'+s.id+'">'+(s.is_active?"إخفاء":"إظهار")+'</button><button class="btn danger tiny" data-delete-section="'+s.id+'">حذف</button></div>':'<span class="muted">عرض فقط</span>';
 return '<tr><td class="'+(child?'tree-child':'')+'">'+(child?'↳ ':'')+'<b>'+esc(s.title)+'</b><div class="muted">'+esc(s.slug||"بدون رابط مختصر")+'</div></td><td>'+(child?"فرعي":"رئيسي")+'</td><td><span class="pill '+(s.is_active?"":"off")+'">'+(s.is_active?"نشط":"مخفي")+'</span></td><td>'+Number(s.sort_order||0)+'</td><td>'+actions+'</td></tr>';
}
function sectionForm(id=null){
 if(!canManageContent())return toast("ليس لديك صلاحية إدارة الأقسام.",true);
 const old=sections.find(x=>x.id===id)||{};
 const el=document.getElementById("sectionForm");if(!el)return;
 const hasChildren=sections.some(x=>x.parent_id===id);
 const parentChoices=sections.filter(x=>!x.parent_id&&x.id!==id&&(!id||old.parent_id||!hasChildren));
 const parentOptions=parentChoices.map(x=>'<option value="'+x.id+'" '+(String(old.parent_id)===String(x.id)?"selected":"")+'>'+esc(x.title)+'</option>').join("");
 el.innerHTML='<div class="panel"><h3>'+(id?"تعديل القسم":"إضافة قسم جديد")+'</h3><div class="notice">يسمح النظام بمستويين فقط: قسم رئيسي وقسم فرعي. لا يمكن نقل قسم رئيسي يحتوي على أقسام فرعية إلى مستوى فرعي.</div><form id="sectionEditor"><div class="form-grid"><div class="field"><label>اسم القسم</label><input name="title" required maxlength="120" value="'+esc(old.title||"")+'"></div><div class="field"><label>القسم الأب (اتركه فارغاً للقسم الرئيسي)</label><select name="parent_id"><option value="">قسم رئيسي</option>'+parentOptions+'</select></div><div class="field"><label>الرابط المختصر (اختياري)</label><input name="slug" maxlength="120" value="'+esc(old.slug||"")+'" placeholder="teacher-resources"></div><div class="field"><label>الأيقونة</label><input name="icon" maxlength="60" value="'+esc(old.icon||"folder")+'"></div><div class="field"><label>ترتيب العرض</label><input name="sort_order" type="number" min="0" step="1" value="'+Number(old.sort_order||0)+'"></div><div class="field"><label>الظهور</label><select name="is_active"><option value="true" '+(old.is_active!==false?"selected":"")+'>ظاهر</option><option value="false" '+(old.is_active===false?"selected":"")+'>مخفي</option></select></div></div><div class="field"><label>وصف القسم</label><textarea name="section_description" maxlength="5000">'+esc(old.section_description||"")+'</textarea></div><label><input type="checkbox" name="show_on_home" '+(old.show_on_home!==false?"checked":"")+'> إظهار القسم في الصفحة الرئيسية</label><div class="toolbar" style="margin-top:16px"><button class="btn gold">حفظ القسم</button><button type="button" class="btn light" id="cancelSection">إلغاء</button></div></form></div>';
 document.getElementById("cancelSection").onclick=()=>el.innerHTML="";
 document.getElementById("sectionEditor").onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),title=String(f.get("title")||"").trim(),parent=String(f.get("parent_id")||"")?Number(f.get("parent_id")):null,slug=String(f.get("slug")||"").trim().toLowerCase()||null,sort=Number(f.get("sort_order")||0);
  if(!title)return toast("اسم القسم مطلوب.",true);
  if(!Number.isInteger(sort)||sort<0)return toast("ترتيب العرض يجب أن يكون رقماً صحيحاً غير سالب.",true);
  if(parent&&sections.some(x=>x.id===parent&&x.parent_id))return toast("لا يمكن إنشاء مستوى ثالث من الأقسام.",true);
  if(parent&&hasChildren)return toast("انقل الأقسام الفرعية أولاً قبل تحويل هذا القسم الرئيسي إلى قسم فرعي.",true);
  if(parent===id)return toast("لا يمكن جعل القسم أباً لنفسه.",true);
  if(slug&&sections.some(x=>x.id!==id&&String(x.slug||"").toLowerCase()===slug))return toast("هذا الرابط المختصر مستخدم بالفعل.",true);
  const payload={title,parent_id:parent,slug,icon:String(f.get("icon")||"").trim()||"folder",sort_order:sort,is_active:f.get("is_active")==="true",show_on_home:f.get("show_on_home")==="on",section_description:String(f.get("section_description")||""),content_type:old.content_type||"text",content:old.content||""};
  const {error}=id?await sb.from("home_sections").update(payload).eq("id",id):await sb.from("home_sections").insert(payload);
  if(error)return toast("تعذر حفظ القسم: "+error.message,true);
  toast(id?"تم تحديث القسم.":"تم إنشاء القسم.");await loadSections(document.getElementById("view"));
 };
}
async function toggleSection(id){
 if(!canManageContent())return toast("ليس لديك صلاحية إدارة الأقسام.",true);
 const s=sections.find(x=>x.id===id);if(!s)return;
 const {error}=await sb.from("home_sections").update({is_active:!s.is_active}).eq("id",id);
 if(error)return fail(error);toast("تم تحديث حالة القسم.");await loadSections(document.getElementById("view"));
}
async function deleteSection(id){
 if(!canManageContent())return toast("ليس لديك صلاحية إدارة الأقسام.",true);
 const s=sections.find(x=>x.id===id);if(!s)return;
 const [child,linksCount]=await Promise.all([sb.from("home_sections").select("id",{count:"exact",head:true}).eq("parent_id",id),sb.from("home_section_materials").select("material_id",{count:"exact",head:true}).eq("section_id",id)]);
 if(child.error||linksCount.error)return fail(child.error||linksCount.error);
 if(child.count||linksCount.count){toast("لا يمكن حذف القسم قبل نقل أو معالجة الأقسام الفرعية والملفات المرتبطة به. يمكنك إخفاؤه مؤقتاً.",true);return}
 if(!confirm("سيُحذف القسم «"+s.title+"» نهائياً لأنه لا يحتوي على أقسام فرعية أو ملفات مرتبطة. هل تريد المتابعة؟"))return;
 const {error}=await sb.from("home_sections").delete().eq("id",id);
 if(error)return fail(error);toast("تم حذف القسم.");await loadSections(document.getElementById("view"));
}
async function loadAnalytics(v){v.innerHTML='<div class="section-head"><div><h2>الإحصائيات والتقارير</h2><p>بيانات الأحداث المسجلة في النظام، وليست تقديرات.</p></div><select id="period" style="max-width:150px"><option value="7">آخر 7 أيام</option><option value="30" selected>آخر 30 يوماً</option><option value="90">آخر 90 يوماً</option></select></div><div id="analyticsBody" class="empty">جارٍ تحميل الإحصائيات…</div>';document.getElementById("period").onchange=()=>fetchAnalytics(Number(document.getElementById("period").value));await fetchAnalytics(30)}
async function fetchAnalytics(days){const el=document.getElementById("analyticsBody");if(!el)return;try{const to=new Date(),from=new Date(Date.now()-days*86400000);const {data,error}=await sb.functions.invoke("admin-analytics",{body:{from:from.toISOString(),to:to.toISOString()}});if(error)throw error;if(data?.error)throw new Error(data.error);analytics=data;const t=data.totals||{};el.innerHTML='<div class="grid"><article class="stat"><div class="label">مشاهدات الصفحات</div><strong>'+Number(t.page_views||0).toLocaleString("ar")+'</strong></article><article class="stat"><div class="label">الزوار الفريدون</div><strong>'+Number(t.unique_visitors||0).toLocaleString("ar")+'</strong></article><article class="stat"><div class="label">التنزيلات المسجلة</div><strong>'+Number(t.downloads||0).toLocaleString("ar")+'</strong></article><article class="stat"><div class="label">معاينات الملفات</div><strong>'+Number(t.previews||0).toLocaleString("ar")+'</strong></article></div><div class="panel" style="margin-top:16px"><h3>النشاط اليومي</h3><div class="chart-list">'+(data.daily||[]).map(d=>'<div class="bar-line"><span>'+esc(String(d.day).slice(5))+'</span><div class="bar-track"><div class="bar-fill" style="width:'+Math.max(2,Math.min(100,Number(d.page_views||0)/Math.max(1,...data.daily.map(x=>Number(x.page_views||0)))*100))+'%"></div></div><b>'+Number(d.page_views||0)+'</b></div>').join("")+'</div></div><div class="form-grid"><div class="panel"><h3>أكثر الملفات نشاطاً</h3>'+((data.top_materials||[]).map(x=>'<p>'+esc(x.title)+' <b class="muted">('+Number(x.downloads||0)+' تنزيل)</b></p>').join("")||'<p class="muted">لا توجد بيانات كافية.</p>')+'</div><div class="panel"><h3>أكثر الصفحات زيارة</h3>'+(data.top_pages||[]).map(x=>'<p>'+esc(x.path)+' <b class="muted">('+Number(x.views||0)+')</b></p>').join("")+'</div></div>'}catch(e){el.innerHTML='<div class="error">تعذر تحميل الإحصائيات: '+esc(e.message)+'<br>تحقق من صلاحية الحساب وخدمة admin-analytics.</div>'}}
async function loadPages(v){if(!canOwner()){v.innerHTML='<div class="notice">إدارة الصفحات متاحة لمالك المنصة فقط.</div>';return}v.innerHTML='<div class="section-head"><div><h2>صفحات الموقع</h2><p>تعديل محتوى الصفحات المسجل في site_pages.</p></div><button class="btn light" id="refreshPages">تحديث</button></div><div id="pagesList" class="empty">جارٍ تحميل الصفحات…</div>';document.getElementById("refreshPages").onclick=()=>loadPages(v);const {data,error}=await sb.from("site_pages").select("*").order("id");if(error){document.getElementById("pagesList").textContent=error.message;return}pages=data||[];document.getElementById("pagesList").innerHTML=pages.map(p=>'<section class="panel"><form data-page="'+p.id+'"><div class="form-grid"><div class="field"><label>عنوان الصفحة</label><input name="title" value="'+esc(p.title)+'" required></div><div class="field"><label>الرابط</label><input value="'+esc(p.slug)+'" disabled></div></div><div class="field"><label>المحتوى</label><textarea name="content">'+esc(p.content)+'</textarea></div><label><input type="checkbox" name="is_visible" '+(p.is_visible?"checked":"")+'> الصفحة ظاهرة للزوار</label><div class="toolbar" style="margin-top:12px"><button class="btn gold">حفظ التعديلات</button></div></form></section>').join("")||'<div class="empty">لا توجد صفحات مسجلة.</div>';document.querySelectorAll("[data-page]").forEach(form=>form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form);const {error}=await sb.from("site_pages").update({title:f.get("title"),content:f.get("content"),is_visible:f.get("is_visible")==="on",updated_by:session.user.id,updated_at:new Date().toISOString()}).eq("id",Number(form.dataset.page));if(error)return fail(error);toast("تم تحديث الصفحة");loadPages(v)})}
async function loadLinks(v){if(!canOwner()){v.innerHTML='<div class="notice">إدارة روابط التواصل متاحة لمالك المنصة فقط.</div>';return}v.innerHTML='<div class="section-head"><div><h2>روابط التواصل الاجتماعي</h2><p>إدارة الروابط التي يعرضها الموقع للزوار.</p></div><button class="btn gold" id="newLink">＋ إضافة رابط</button></div><div id="linksList" class="empty">جارٍ تحميل الروابط…</div><div id="linkForm"></div>';document.getElementById("newLink").onclick=()=>linkForm();const {data,error}=await sb.from("site_contact_links").select("*").order("sort_order");if(error){document.getElementById("linksList").textContent=error.message;return}links=data||[];document.getElementById("linksList").innerHTML='<div class="panel table-wrap"><table><thead><tr><th>المنصة</th><th>الرابط</th><th>الترتيب</th><th>الإجراءات</th></tr></thead><tbody>'+links.map(x=>'<tr><td>'+esc(x.title)+'</td><td><a href="'+esc(x.url)+'" target="_blank" rel="noopener">فتح الرابط ↗</a></td><td>'+x.sort_order+'</td><td><div class="row-actions"><button class="btn light tiny" data-edit-link="'+esc(x.key)+'">تعديل</button><button class="btn danger tiny" data-del-link="'+esc(x.key)+'">حذف</button></div></td></tr>').join("")+'</tbody></table></div>';document.querySelectorAll("[data-edit-link]").forEach(b=>b.onclick=()=>linkForm(b.dataset.editLink));document.querySelectorAll("[data-del-link]").forEach(b=>b.onclick=()=>deleteLink(b.dataset.delLink))}
function linkForm(key=null){const old=links.find(x=>x.key===key)||{};const el=document.getElementById("linkForm");el.innerHTML='<div class="panel"><h3>'+(key?"تعديل رابط":"إضافة رابط تواصل")+'</h3><form id="linkEditor"><div class="form-grid"><div class="field"><label>معرّف المنصة (key)</label><input name="key" value="'+esc(old.key||"")+'" '+(key?"readonly":"")+' required placeholder="facebook"></div><div class="field"><label>اسم المنصة</label><input name="title" value="'+esc(old.title||"")+'" required></div><div class="field"><label>الرابط</label><input name="url" type="url" value="'+esc(old.url||"")+'" required></div><div class="field"><label>الترتيب</label><input name="sort_order" type="number" value="'+Number(old.sort_order||0)+'"></div></div><div class="toolbar"><button class="btn gold">حفظ</button><button type="button" class="btn light" id="cancelLink">إلغاء</button></div></form></div>';document.getElementById("cancelLink").onclick=()=>el.innerHTML="";document.getElementById("linkEditor").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={key:String(f.get("key")).trim(),title:String(f.get("title")).trim(),url:String(f.get("url")).trim(),sort_order:Number(f.get("sort_order")||0),updated_by:session.user.id,updated_at:new Date().toISOString()};const q=key?sb.from("site_contact_links").update(payload).eq("key",key):sb.from("site_contact_links").insert(payload);const {error}=await q;if(error)return fail(error);toast("تم حفظ الرابط");loadLinks(document.getElementById("view"))}}
async function deleteLink(key){if(!confirm("حذف رابط التواصل المحدد؟"))return;const {error}=await sb.from("site_contact_links").delete().eq("key",key);if(error)return fail(error);toast("تم حذف الرابط");loadLinks(document.getElementById("view"))}
let uploadFiles=[],uploadGrades=[],uploadSemesters=[],uploadCategories=[];
const legacySections=[
 ["school_grades","الصفوف الدراسية"],
 ["curricula","المناهج الدراسية"],
 ["teacher_supplies","لوازم المعلمين"],
 ["interactive_games","الألعاب التفاعلية"],
 ["supplementary_education","التعليم الإضافي"]
];
function canManageFiles(){return access?.owner===true||access?.permissions?.files===true}
function filesPlaceholder(v){
 v.innerHTML='<div class="section-head"><div><h2>إدارة الملفات</h2><p>رفع ملف واحد أو مجموعة ملفات، وتحديد القسم والوصف لكل ملف قبل الحفظ.</p></div><div class="toolbar">+(access?.owner||(!access?.staff&&access?.role==="admin")?'<button class="btn light" id="showTrash">سلة المحذوفات</button>':'')+'<button class="btn light" id="refreshMaterials">تحديث القائمة</button></div></div>'+
 '<div class="panel"><h3>رفع ملفات جديدة</h3><div class="notice">يُحفظ الملف في مخزن materials ثم يُنشأ سجل له في قاعدة البيانات ويُربط بالقسم الذي تختاره. لا يتم استبدال الملفات الموجودة أو تغيير مساراتها.</div>'+
 '<div class="field"><label>اختيار الملفات (يمكن تحديد عدة ملفات)</label><input id="uploadPicker" type="file" multiple></div>'+
 '<div class="form-grid"><div class="field"><label>الصف الدراسي (اختياري ويطبق على المجموعة)</label><select id="uploadGrade"><option value="">بدون تحديد صف</option></select></div>'+
 '<div class="field"><label>الفصل الدراسي (اختياري ويطبق على المجموعة)</label><select id="uploadSemester"><option value="">بدون تحديد فصل</option></select></div>'+
 '<div class="field"><label>نوع المادة / التصنيف التفصيلي (اختياري)</label><select id="uploadCategory"><option value="">بدون تصنيف تفصيلي</option></select></div>'+
 '<div class="field"><label>حالة الملفات</label><select id="uploadVisibility"><option value="true">منشورة للزوار</option><option value="false">مسودة / غير منشورة</option></select></div></div>'+
 '<div id="uploadRows" class="upload-rows"><div class="empty">اختر ملفاً واحداً أو أكثر للبدء.</div></div>'+
 '<div class="toolbar"><button class="btn gold" id="startUpload" disabled>رفع الملفات وحفظها</button><button class="btn light" id="clearUpload" type="button">إفراغ الاختيار</button><span id="uploadStatus" class="muted"></span></div></div>'+
 '<div class="panel"><div class="section-head" style="margin-top:0"><div><h3>الملفات المسجلة</h3><p>أحدث 100 ملف، مع عدد التنزيلات المسجل.</p></div><button class="btn light tiny" id="loadMaterials">عرض الملفات</button></div><div id="materialsPreview" class="empty">اضغط «عرض الملفات» لتحميل القائمة.</div></div>';
 document.getElementById("refreshMaterials").onclick=()=>loadMaterialsList();
 document.getElementById("showTrash").onclick=()=>loadTrashList();
 document.getElementById("loadMaterials").onclick=()=>loadMaterialsList();
 document.getElementById("uploadPicker").onchange=e=>{uploadFiles=Array.from(e.target.files||[]).map(file=>({file,title:file.name.replace(/\.[^.]+$/,""),description:"",sectionId:"",legacy:""}));drawUploadRows();};
 document.getElementById("clearUpload").onclick=()=>{uploadFiles=[];document.getElementById("uploadPicker").value="";drawUploadRows();document.getElementById("uploadStatus").textContent="";};
 document.getElementById("startUpload").onclick=()=>uploadSelectedFiles();
 loadUploadOptions();
}
async function loadUploadOptions(){
 const status=document.getElementById("uploadStatus");
 try{
  const results=await Promise.all([
   sb.from("home_sections").select("id,title,parent_id,is_active,sort_order").order("sort_order").order("id"),
   sb.from("grades").select("id,name").order("id"),
   sb.from("semesters").select("id,name").order("id"),
   sb.from("categories").select("id,name").order("id")
  ]);
  for(const r of results)if(r.error)throw r.error;
  sections=results[0].data||[];uploadGrades=results[1].data||[];uploadSemesters=results[2].data||[];uploadCategories=results[3].data||[];
  document.getElementById("uploadGrade").innerHTML='<option value="">بدون تحديد صف</option>'+uploadGrades.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("");
  document.getElementById("uploadSemester").innerHTML='<option value="">بدون تحديد فصل</option>'+uploadSemesters.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("");
  document.getElementById("uploadCategory").innerHTML='<option value="">بدون تصنيف تفصيلي</option>'+uploadCategories.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("");
  if(!sections.length)status.textContent="أضف قسماً من «إدارة الأقسام» قبل رفع الملفات.";
  drawUploadRows();
 }catch(e){status.textContent="تعذر تحميل خيارات الرفع: "+e.message;status.className="error"}
}
function uploadSectionOptions(selected){
 const ordered=sections.filter(s=>s.is_active!==false);
 if(!ordered.length)return '<option value="">لا توجد أقسام نشطة — أنشئ قسماً أولاً</option>';
 return '<option value="">اختر القسم الذي سيظهر فيه الملف</option>'+ordered.map(s=>{
  const parent=ordered.find(p=>String(p.id)===String(s.parent_id));
  const label=(parent?parent.title+" / ":"")+s.title+(parent?" (فرعي)":" (رئيسي)");
  return '<option value="'+s.id+'" '+(String(selected)===String(s.id)?"selected":"")+'>'+esc(label)+'</option>';
 }).join("");
}
function drawUploadRows(){
 const box=document.getElementById("uploadRows"),button=document.getElementById("startUpload");
 if(!box)return;
 if(!uploadFiles.length){box.innerHTML='<div class="empty">اختر ملفاً واحداً أو أكثر للبدء.</div>';button.disabled=true;return}
 box.innerHTML=uploadFiles.map((item,i)=>'<article class="upload-item"><div class="upload-item-head"><b>'+esc(item.file.name)+'</b><span class="muted">'+(item.file.size/1024/1024).toFixed(2)+' MB</span></div>'+
 '<div class="form-grid"><div class="field"><label>العنوان الظاهر للزوار</label><input data-upload-title="'+i+'" value="'+esc(item.title)+'" maxlength="180" required></div>'+
 '<div class="field"><label>القسم الذي ينتمي إليه الملف</label><select data-upload-section="'+i+'">'+uploadSectionOptions(item.sectionId)+'</select></div>'+
 '<div class="field"><label>التصنيف الأساسي المتوافق مع قاعدة البيانات الحالية</label><select data-upload-legacy="'+i+'"><option value="">اختر التصنيف الأساسي</option>'+legacySections.map(([key,label])=>'<option value="'+key+'" '+(item.legacy===key?"selected":"")+'>'+label+'</option>').join("")+'</select></div>'+
 '<div class="field"><label>وصف الملف</label><textarea data-upload-description="'+i+'" rows="3" placeholder="اكتب وصفاً يوضح محتوى الملف وفائدته والفئة المستهدفة...">'+esc(item.description)+'</textarea></div></div></article>').join("");
 box.querySelectorAll("[data-upload-title]").forEach(el=>el.oninput=()=>uploadFiles[Number(el.dataset.uploadTitle)].title=el.value);
 box.querySelectorAll("[data-upload-description]").forEach(el=>el.oninput=()=>uploadFiles[Number(el.dataset.uploadDescription)].description=el.value);
 box.querySelectorAll("[data-upload-section]").forEach(el=>el.onchange=()=>uploadFiles[Number(el.dataset.uploadSection)].sectionId=el.value);
 box.querySelectorAll("[data-upload-legacy]").forEach(el=>el.onchange=()=>uploadFiles[Number(el.dataset.uploadLegacy)].legacy=el.value);
 button.disabled=!sections.some(s=>s.is_active!==false);
}
function safeStorageName(name){
 const ext=(name.match(/\.([a-z0-9]{1,10})$/i)||[])[1]||"bin";
 const base=name.replace(/\.[^.]+$/,"").normalize("NFKD").replace(/[^\w-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"file";
 return base+"."+ext.toLowerCase();
}
async function uploadSelectedFiles(){
 if(!canManageFiles())return toast("ليس لديك صلاحية إدارة الملفات.",true);
 if(!uploadFiles.length)return;
 const grade=document.getElementById("uploadGrade").value||null;
 const semester=document.getElementById("uploadSemester").value||null;
 const category=document.getElementById("uploadCategory").value||null;
 const isPublic=document.getElementById("uploadVisibility").value==="true";
 const invalid=uploadFiles.find(x=>!x.title.trim()||!x.sectionId||!x.legacy);
 if(invalid){toast("أكمل عنوان الملف والقسم والتصنيف الأساسي لكل ملف.",true);return}
 const btn=document.getElementById("startUpload"),status=document.getElementById("uploadStatus");
 btn.disabled=true;let successes=0,failures=[];
 for(let i=0;i<uploadFiles.length;i++){
  const item=uploadFiles[i],file=item.file;
  status.textContent="جارٍ رفع "+(i+1)+" من "+uploadFiles.length+": "+file.name;
  let storagePath=null,materialId=null;
  try{
   const section=sections.find(s=>String(s.id)===String(item.sectionId));
   if(!section||section.is_active===false)throw new Error("القسم المختار غير نشط أو لم يعد موجوداً.");
   const safeName=safeStorageName(file.name);
   storagePath="admin-v2/"+item.legacy+"/"+crypto.randomUUID()+"-"+safeName;
   const {error:storageError}=await sb.storage.from("materials").upload(storagePath,file,{upsert:false,contentType:file.type||"application/octet-stream",cacheControl:"3600"});
   if(storageError)throw storageError;
   const payload={
    title:item.title.trim(),description:item.description.trim()||null,
    grade_id:grade?Number(grade):null,semester_id:semester?Number(semester):null,category_id:category?Number(category):null,
    file_path:storagePath,file_name:file.name,file_type:file.type||(file.name.includes(".")?file.name.split(".").pop().toLowerCase():null),
    file_size:file.size,is_public:isPublic,created_by:session.user.id,
    primary_section:item.legacy,additional_sections:[]
   };
   const {data:material,error:materialError}=await sb.from("materials").insert(payload).select("id").single();
   if(materialError)throw materialError;
   materialId=material.id;
   const {error:linkError}=await sb.from("home_section_materials").insert({section_id:Number(item.sectionId),material_id:materialId,is_primary:true,sort_order:0});
   if(linkError)throw linkError;
   successes++;
  }catch(e){
   let keepObject=false;
   if(materialId){const {error:rollbackError}=await sb.from("materials").delete().eq("id",materialId);if(rollbackError){keepObject=true;console.error("material rollback failed",rollbackError)}}
   if(storagePath&&!keepObject){const {error:removeError}=await sb.storage.from("materials").remove([storagePath]);if(removeError)console.error("storage rollback failed",removeError)}
   failures.push({index:i,fileName:file.name,message:(e.message||"تعذر الحفظ")+(keepObject?" — تعذر التراجع عن سجل قاعدة البيانات، ولم يُحذف ملف التخزين حفاظاً على سلامة البيانات.":"")});
  }
 }
 status.textContent="اكتمل الرفع: "+successes+" ناجح، "+failures.length+" لم يكتمل.";
 if(failures.length)toast("بعض الملفات لم تكتمل. راجع تفاصيل الأخطاء أسفل نموذج الرفع.",true);
 else toast("تم رفع جميع الملفات وربطها بالأقسام بنجاح.");
 if(successes){const failedIndexes=new Set(failures.map(x=>x.index));uploadFiles=uploadFiles.filter((x,i)=>failedIndexes.has(i));document.getElementById("uploadPicker").value="";drawUploadRows();await loadMaterialsList()}
 if(failures.length){const box=document.getElementById("uploadRows");box.insertAdjacentHTML("beforeend",'<div class="error upload-errors">'+failures.map(x=>esc(x.fileName+": "+x.message)).join("<br>")+'</div>')}
 btn.disabled=!uploadFiles.length||!sections.some(s=>s.is_active!==false);
}
async function loadTrashList(){
 const el=document.getElementById("materialsPreview");if(!el)return;
 el.textContent="جارٍ تحميل سلة المحذوفات…";
 try{
  const result=await adminAction("trash_list");
  const entries=result.entries||[];
  if(!entries.length){el.innerHTML='<div class="empty">سلة المحذوفات فارغة حالياً.</div>';return}
  el.innerHTML='<div class="toolbar"><b>سلة المحذوفات</b><button class="btn light tiny" id="backToMaterials">العودة إلى الملفات</button></div><div class="table-wrap"><table><thead><tr><th>اسم الملف</th><th>تاريخ الأرشفة</th><th>بواسطة</th><th>الإجراء</th></tr></thead><tbody>'+entries.filter(x=>x.entity_type==="material").map(x=>'<tr><td><b>'+esc(x.title||"ملف")+'</b><div class="muted">'+esc(x.storage_path||"")+'</div></td><td>'+new Date(x.deleted_at).toLocaleDateString("ar")+'</td><td>'+esc(x.deleted_by_email||"—")+'</td><td>'+(access?.owner?'<button class="btn gold tiny" data-trash-restore="'+esc(x.id)+'">استعادة السجل</button>':'<span class="muted">الاستعادة للمالك فقط</span>')+'</td></tr>').join("")+'</tbody></table></div>';
  document.getElementById("backToMaterials").onclick=()=>loadMaterialsList();
  el.querySelectorAll("[data-trash-restore]").forEach(btn=>btn.onclick=async()=>{
   if(!confirm("سيعاد سجل الملف إلى قاعدة البيانات مع مساره الأصلي. هل تريد الاستعادة؟"))return;
   try{const restored=await adminAction("trash_restore",{id:btn.dataset.trashRestore});toast(restored.message||"تمت الاستعادة.");await loadTrashList()}catch(e){fail(e)}
  });
 }catch(e){el.textContent="تعذر تحميل سلة المحذوفات: "+e.message}
}
async function loadMaterialsList(){
 const el=document.getElementById("materialsPreview");if(!el)return;
 el.textContent="جارٍ تحميل الملفات…";
 const {data,error}=await sb.from("materials").select("id,title,description,file_name,file_path,file_type,file_size,is_public,download_count,created_at,grade_id,semester_id,category_id,primary_section").order("created_at",{ascending:false}).limit(100);
 if(error){el.textContent="تعذر تحميل القائمة: "+error.message;return}
 if(!data?.length){el.innerHTML='<div class="empty">لا توجد ملفات مسجلة.</div>';return}
 window.__dhadAdminMaterials=data;
 el.innerHTML='<div class="table-wrap"><table><thead><tr><th>اسم الملف</th><th>نوعه</th><th>الحجم</th><th>التنزيلات</th><th>الحالة</th><th>تاريخ الإضافة</th><th>الإجراءات</th></tr></thead><tbody>'+data.map(m=>'<tr><td><b>'+esc(m.title||m.file_name)+'</b><div class="muted">'+esc(m.file_name||"")+'</div></td><td>'+esc(m.file_type||"—")+'</td><td>'+((Number(m.file_size||0)/1024/1024).toFixed(2))+' MB</td><td>'+Number(m.download_count||0)+'</td><td><span class="pill '+(m.is_public?"":"off")+'">'+(m.is_public?"منشور":"غير منشور")+'</span></td><td>'+new Date(m.created_at).toLocaleDateString("ar")+'</td><td><div class="row-actions"><button class="btn light tiny" data-material-edit="'+m.id+'">تعديل البيانات</button><button class="btn light tiny" data-material-toggle="'+m.id+'">'+(m.is_public?"إخفاء":"نشر")+'</button>'+(access?.owner||(!access?.staff&&access?.role==="admin")?'<button class="btn danger tiny" data-material-trash="'+m.id+'">أرشفة</button>':'')+'</div></td></tr>').join("")+'</tbody></table></div><div id="materialEditPanel"></div>';
 el.querySelectorAll("[data-material-edit]").forEach(btn=>btn.onclick=()=>editMaterial(btn.dataset.materialEdit));
 el.querySelectorAll("[data-material-toggle]").forEach(btn=>btn.onclick=()=>toggleMaterialVisibility(btn.dataset.materialToggle));
 el.querySelectorAll("[data-material-trash]").forEach(btn=>btn.onclick=()=>archiveMaterial(btn.dataset.materialTrash));
}
async function editMaterial(id){
 const m=(window.__dhadAdminMaterials||[]).find(x=>x.id===id);if(!m)return;
 const panel=document.getElementById("materialEditPanel");if(!panel)return;
 const {data:linksNow,error:linksError}=await sb.from("home_section_materials").select("section_id,is_primary").eq("material_id",id);
 if(linksError)return fail(linksError);
 const currentPrimary=linksNow?.find(x=>x.is_primary)?.section_id||linksNow?.[0]?.section_id||"";
 const options=sections.filter(s=>s.is_active!==false).map(s=>'<option value="'+s.id+'" '+(String(currentPrimary)===String(s.id)?"selected":"")+'>'+esc(s.title)+'</option>').join("");
 const sectionField=access?.owner?'<div class="field"><label>القسم الرئيسي للعرض</label><select name="section_id"><option value="">عدم تغيير ارتباط القسم</option>'+options+'</select></div>':'<div class="notice">تغيير ارتباط القسم الرئيسي متاح لمالك المنصة فقط.</div>';
 panel.innerHTML='<div class="panel" style="margin-top:16px"><h3>تعديل بيانات الملف</h3><div class="notice">يمكنك تعديل العنوان والوصف. لن يتغير ملف التخزين أو مساره.</div><form id="materialEditor"><div class="field"><label>عنوان الملف</label><input name="title" maxlength="180" required value="'+esc(m.title||"")+'"></div><div class="field"><label>وصف الملف</label><textarea name="description" rows="5">'+esc(m.description||"")+'</textarea></div>'+sectionField+'<div class="toolbar"><button class="btn gold">حفظ التعديلات</button><button class="btn light" type="button" id="cancelMaterialEdit">إلغاء</button></div></form></div>';
 document.getElementById("cancelMaterialEdit").onclick=()=>panel.innerHTML="";
 document.getElementById("materialEditor").onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget),title=String(f.get("title")||"").trim(),description=String(f.get("description")||"").trim(),newSection=String(f.get("section_id")||"");
  if(!title){toast("عنوان الملف مطلوب.",true);return}
  const submit=e.currentTarget.querySelector("button:not([type])");if(submit)submit.disabled=true;
  const {error}=await sb.from("materials").update({title,description:description||null,updated_at:new Date().toISOString()}).eq("id",id);
  if(error){if(submit)submit.disabled=false;return fail(error)}
  if(newSection){
   if(!access?.owner){if(submit)submit.disabled=false;return toast("تغيير القسم الرئيسي متاح لمالك المنصة فقط.",true)}
   const {error:upsertError}=await sb.from("home_section_materials").upsert({section_id:Number(newSection),material_id:id,is_primary:true,sort_order:0},{onConflict:"section_id,material_id"});
   if(upsertError){if(submit)submit.disabled=false;return fail(upsertError)}
   const {error:demoteError}=await sb.from("home_section_materials").update({is_primary:false}).eq("material_id",id).neq("section_id",Number(newSection));
   if(demoteError){if(submit)submit.disabled=false;return fail(demoteError)}
  }
  toast("تم تحديث بيانات الملف.");await loadMaterialsList();
 };
}
async function toggleMaterialVisibility(id){
 if(!canManageFiles())return toast("ليس لديك صلاحية إدارة الملفات.",true);
 const m=(window.__dhadAdminMaterials||[]).find(x=>x.id===id);if(!m)return;
 const next=!m.is_public;
 if(!confirm(next?"هل تريد نشر هذا الملف للزوار؟":"هل تريد إخفاء هذا الملف عن الزوار؟"))return;
 const {error}=await sb.from("materials").update({is_public:next,updated_at:new Date().toISOString()}).eq("id",id);
 if(error)return fail(error);
 toast(next?"تم نشر الملف.":"تم إخفاء الملف.");await loadMaterialsList();
}
async function archiveMaterial(id){
 if(!(access?.owner||(!access?.staff&&access?.role==="admin")))return toast("أرشفة الملفات متاحة للمالك والمدير المعتمد فقط.",true);
 const m=(window.__dhadAdminMaterials||[]).find(x=>x.id===id);if(!m)return;
 if(!confirm("سيُنقل الملف إلى سلة المحذوفات ويُخفى عن الزوار دون حذف ملف التخزين. هل تريد المتابعة؟"))return;
 try{const result=await adminAction("trash_material",{id});toast(result.message||"تمت أرشفة الملف.");await loadMaterialsList()}
 catch(e){fail(e)}
}
async function boot(){const {data:{session:s}}=await sb.auth.getSession();session=s;if(!session){login();return}try{access=await adminAction("my_access");if(!access.allowed){denied();return}shell()}catch(e){await sb.auth.signOut({scope:"local"});login("تعذر التحقق من صلاحية الحساب: "+e.message)}}
sb.auth.onAuthStateChange((_event,s)=>{if(!s){session=null;login()}});
boot();
})();