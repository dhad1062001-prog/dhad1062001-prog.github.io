/*
 * ضاد: أدوات الأقسام الجديدة.
 * تحفظ الإعدادات في site_pages وملفاتها في مساحة materials القائمتين بالفعل.
 */
const DHAD_FEATURE_SLUGS={homeCards:'dhad-home-cards-v1',additional:'dhad-additional-items-v1',calendar:'dhad-calendar-items-v1',games:'dhad-games-v1',certificate:'dhad-certificate-v1'};
const DHAD_HOME_CARD_DEFAULTS=[
  {id:'grades',title:'الصفوف الدراسية',description:'جميع الصفوف والمناهج في مكان واحد',icon:'🎓',color:'#3986D9',size:'normal',order:1,visible:true,target:'grades',url:'',imagePath:''},
  {id:'games',title:'ألعاب تعليمية تفاعلية',description:'تعلّم بطريقة ممتعة ومشوّقة',icon:'🎮',color:'#E85B68',size:'normal',order:2,visible:true,target:'games',url:'',imagePath:''},
  {id:'additional',title:'التعليم الإضافي',description:'دروس وموارد إضافية لتعزيز مهاراتك',icon:'💡',color:'#35B6B0',size:'normal',order:3,visible:true,target:'additional',url:'',imagePath:''},
  {id:'calendar',title:'التقويم الدراسي',description:'تابع مواعيدك الدراسية بكل سهولة',icon:'🗓️',color:'#F0A23B',size:'normal',order:4,visible:true,target:'calendar',url:'',imagePath:''},
  {id:'certificate',title:'شهادات التقدير',description:'احصل على شهادتك بكل إنجاز',icon:'🏅',color:'#8764D8',size:'normal',order:5,visible:true,target:'certificate',url:'',imagePath:''}
];
const DHAD_CERTIFICATE_DEFAULT={title:'شهادة تقدير',intro:'تُمنح هذه الشهادة بكل فخر واعتزاز إلى',body:'تقديرًا لجهوده المميزة وإبداعه واجتهاده في تعلّم اللغة العربية. مع تمنياتنا له بدوام التوفيق والنجاح.',footer:'مع خالص التقدير',school:'',teacher:'',color:'#D9A441',showBrand:true};
let dhadFeatureData={homeCards:JSON.parse(JSON.stringify(DHAD_HOME_CARD_DEFAULTS)),additional:[],calendar:[],games:[],certificate:{...DHAD_CERTIFICATE_DEFAULT}};
let dhadGameExistingFiles=[];
let dhadGameExistingMainPath='';

function dhadSafeColor(value,fallback='#20A486'){
  const color=String(value||'').trim();
  return /^#[0-9a-f]{6}$/i.test(color)?color:fallback;
}
function dhadClone(value){return JSON.parse(JSON.stringify(value));}
function dhadFeatureStatus(message,type='ok'){
  const el=document.getElementById('featureAdminStatus');
  if(el&&typeof showStatus==='function')showStatus(el,message,type);
}
function dhadNormalizeCards(rows){
  const source=Array.isArray(rows)?rows:[];
  return DHAD_HOME_CARD_DEFAULTS.map(base=>{
    const saved=source.find(item=>item&&item.id===base.id)||{};
    return {...base,...saved,color:dhadSafeColor(saved.color,base.color),order:Number.isFinite(Number(saved.order))?Number(saved.order):base.order,visible:saved.visible!==false};
  });
}
async function loadDhadFeatureData(){
  dhadFeatureData.homeCards=dhadNormalizeCards(DHAD_HOME_CARD_DEFAULTS);
  dhadFeatureData.certificate={...DHAD_CERTIFICATE_DEFAULT};
  dhadFeatureData.additional=[];dhadFeatureData.calendar=[];dhadFeatureData.games=[];
  if(!sb)return;
  const slugs=Object.values(DHAD_FEATURE_SLUGS);
  try{
    const {data,error}=await sb.from('site_pages').select('slug,content').in('slug',slugs);
    if(error)throw error;
    for(const row of data||[]){
      let parsed;try{parsed=JSON.parse(row.content||'null');}catch(e){continue;}
      if(row.slug===DHAD_FEATURE_SLUGS.homeCards)dhadFeatureData.homeCards=dhadNormalizeCards(parsed);
      else if(row.slug===DHAD_FEATURE_SLUGS.additional&&Array.isArray(parsed))dhadFeatureData.additional=parsed;
      else if(row.slug===DHAD_FEATURE_SLUGS.calendar&&Array.isArray(parsed))dhadFeatureData.calendar=parsed;
      else if(row.slug===DHAD_FEATURE_SLUGS.games&&Array.isArray(parsed))dhadFeatureData.games=parsed;
      else if(row.slug===DHAD_FEATURE_SLUGS.certificate&&parsed&&typeof parsed==='object')dhadFeatureData.certificate={...DHAD_CERTIFICATE_DEFAULT,...parsed,color:dhadSafeColor(parsed.color,DHAD_CERTIFICATE_DEFAULT.color)};
    }
  }catch(error){console.warn('تعذر تحميل إعدادات الأقسام الإضافية من site_pages.',error);}
  renderDhadHomeCards();
}
async function saveDhadFeatureRecord(key,value,title){
  if(!isOwner())return dhadFeatureStatus('إدارة هذا المحتوى متاحة لمالك المنصة فقط.','error'),false;
  if(!sb)return dhadFeatureStatus('تعذر الاتصال بقاعدة البيانات. افتح الموقع من رابطه وسجّل الدخول.','error'),false;
  const {error}=await sb.from('site_pages').upsert({slug:DHAD_FEATURE_SLUGS[key],title,content:JSON.stringify(value),updated_at:new Date().toISOString()},{onConflict:'slug'});
  if(error){dhadFeatureStatus('تعذر حفظ التغييرات: '+error.message,'error');return false;}
  return true;
}
function dhadPublicUrl(value){
  const raw=String(value||'').trim();if(!raw)return '';
  try{const url=new URL(raw,window.location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch(e){return '';}
}
function renderDhadHomeCards(){
  const container=document.getElementById('homeCardsGrid');if(!container)return;
  const cards=dhadNormalizeCards(dhadFeatureData.homeCards).filter(card=>card.visible).sort((a,b)=>a.order-b.order);
  container.innerHTML=cards.map(card=>'<button class="platform-card size-'+(card.size==='compact'?'compact':card.size==='large'?'large':'normal')+'" type="button" data-home-card="'+escapeHtml(card.id)+'" style="--card-accent:'+dhadSafeColor(card.color,card.color)+'"><span class="platform-card-icon" aria-hidden="true">'+escapeHtml(card.icon||'📘')+'</span><strong class="platform-card-title">'+escapeHtml(card.title||'قسم تعليمي')+'</strong><span class="platform-card-description">'+escapeHtml(card.description||'')+'</span><span class="platform-card-arrow" aria-hidden="true">←</span></button>').join('');
  container.querySelectorAll('[data-home-card]').forEach(button=>{
    const card=cards.find(item=>item.id===button.getAttribute('data-home-card'));
    const imageUrl=card?.imagePath?getMaterialUrl(card.imagePath):'';
    if(imageUrl){button.classList.add('has-image');button.style.setProperty('--card-image','url("'+imageUrl.replace(/["\\\r\n]/g,'')+'")');}
    button.addEventListener('click',()=>openDhadHomeCard(button.getAttribute('data-home-card')));
  });
}
function openDhadHomeCard(id){
  const card=dhadFeatureData.homeCards.find(item=>item.id===id);if(!card)return;
  const url=dhadPublicUrl(card.url);if(url){window.open(url,'_blank','noopener,noreferrer');return;}
  const target=card.target||id;
  if(target==='grades')showGradesPage();else if(target==='games'||target==='additional'||target==='calendar'||target==='certificate')showDhadFeaturePage(target);
}
function renderHomeCardsAdmin(){
  const list=document.getElementById('homeCardAdminList');if(!list)return;
  const options=[['grades','الصفوف الدراسية'],['games','الألعاب التعليمية'],['additional','التعليم الإضافي'],['calendar','التقويم الدراسي'],['certificate','شهادات التقدير']];
  list.innerHTML=dhadNormalizeCards(dhadFeatureData.homeCards).sort((a,b)=>a.order-b.order).map(card=>'<div class="home-card-admin-row" data-home-card-admin="'+escapeHtml(card.id)+'"><strong>'+escapeHtml(card.title||card.id)+'</strong><div class="card-admin-fields"><div class="field"><label>العنوان</label><input data-card-field="title" value="'+escapeHtml(card.title||'')+'" maxlength="80"></div><div class="field"><label>الوصف</label><input data-card-field="description" value="'+escapeHtml(card.description||'')+'" maxlength="160"></div><div class="field"><label>الرمز</label><input data-card-field="icon" value="'+escapeHtml(card.icon||'')+'" maxlength="8"></div><div class="field"><label>لون البطاقة</label><input data-card-field="color" type="color" value="'+dhadSafeColor(card.color,'#20A486')+'"></div><div class="field"><label>حجم البطاقة</label><select data-card-field="size"><option value="compact" '+(card.size==='compact'?'selected':'')+'>صغير</option><option value="normal" '+(!card.size||card.size==='normal'?'selected':'')+'>متوسط</option><option value="large" '+(card.size==='large'?'selected':'')+'>كبير</option></select></div><div class="field"><label>الوجهة</label><select data-card-field="target">'+options.map(([value,label])=>'<option value="'+value+'" '+((card.target||card.id)===value?'selected':'')+'>'+label+'</option>').join('')+'</select></div><div class="field"><label>رابط خارجي اختياري</label><input data-card-field="url" type="url" value="'+escapeHtml(card.url||'')+'" placeholder="https://..."></div><div class="field"><label>ترتيب العرض</label><input data-card-field="order" type="number" min="0" step="1" value="'+Number(card.order||0)+'"></div></div><div class="field"><label>صورة خلفية اختيارية</label><input data-card-field="image" type="file" accept="image/png,image/jpeg,image/webp"><small class="callout-help">'+(card.imagePath?'توجد صورة محفوظة؛ ترك الحقل فارغًا يبقيها.':'تُحفظ الصورة الجديدة في مساحة التخزين الحالية.')+'</small></div><label class="home-section-check"><input data-card-field="visible" type="checkbox" '+(card.visible?'checked':'')+'> إظهار البطاقة</label></div>').join('');
}
async function saveHomeCardsAdmin(){
  if(!isOwner())return showInfo('صلاحية غير كافية','إدارة البطاقات متاحة لمالك المنصة فقط.');
  const list=document.getElementById('homeCardAdminList');if(!list)return;
  const cards=[];
  for(const row of list.querySelectorAll('[data-home-card-admin]')){
    const id=row.getAttribute('data-home-card-admin');const old=dhadFeatureData.homeCards.find(item=>item.id===id)||{};
    const value=field=>row.querySelector('[data-card-field="'+field+'"]');
    const title=(value('title')?.value||'').trim();const sort=Number(value('order')?.value||0);
    if(!title||!Number.isInteger(sort)||sort<0)return dhadFeatureStatus('تحقق من عنوان كل بطاقة ورقم ترتيبها.','error');
    let url=(value('url')?.value||'').trim();if(url&&!dhadPublicUrl(url))return dhadFeatureStatus('أدخل رابطًا خارجيًا يبدأ بـ http:// أو https://.','error');
    let imagePath=old.imagePath||'';const file=value('image')?.files?.[0];
    if(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)return dhadFeatureStatus('صور البطاقات يجب أن تكون PNG أو JPG أو WebP وبحجم لا يتجاوز 5 ميجابايت.','error');imagePath=await uploadDhadFeatureFile(file,'home-cards',id);if(!imagePath)return;}
    cards.push({...old,id,title,description:(value('description')?.value||'').trim(),icon:(value('icon')?.value||'📘').trim().slice(0,8),color:dhadSafeColor(value('color')?.value,old.color),size:value('size')?.value||'normal',target:value('target')?.value||id,url,imagePath,order:sort,visible:!!value('visible')?.checked});
  }
  if(await saveDhadFeatureRecord('homeCards',cards,'بطاقات الصفحة الرئيسية')){
    dhadFeatureData.homeCards=cards;renderDhadHomeCards();renderHomeCardsAdmin();dhadFeatureStatus('تم حفظ بطاقات الصفحة الرئيسية.','ok');
  }
}
async function uploadDhadFeatureFile(file,folder,relativePath=''){
  if(!sb){dhadFeatureStatus('تعذر الاتصال بخدمة التخزين.','error');return '';}
  const max=50*1024*1024;if(file.size>max){dhadFeatureStatus('الملف أكبر من 50 ميجابايت.','error');return '';}
  const safeParts=String(relativePath||file.name).replace(/\\/g,'/').split('/').filter(part=>part&&part!=='.'&&part!=='..').map(part=>part.replace(/[\u0000-\u001f?#%]/g,'_').trim()).filter(Boolean);
  if(!safeParts.length){dhadFeatureStatus('اسم الملف غير صالح.','error');return '';}
  const path='dhad-content/'+folder+'/'+crypto.randomUUID()+'/'+safeParts.join('/');
  let type=file.type||'application/octet-stream';
  const ext=(file.name.split('.').pop()||'').toLowerCase();if(ext==='html'||ext==='htm')type='text/html';else if(ext==='css')type='text/css';else if(ext==='js')type='text/javascript';
  const {data,error}=await sb.storage.from(MATERIALS_BUCKET).upload(path,file,{contentType:type,upsert:false});
  if(error){dhadFeatureStatus('تعذر رفع الملف إلى مساحة materials: '+error.message,'error');return '';}
  return data?.path||path;
}
async function renderDhadFeaturePages(){
  await Promise.all([renderDhadAdditional(),renderDhadCalendar(),renderDhadGames()]);
  renderDhadCertificate();
}
async function renderDhadAdditional(){
  const list=document.getElementById('additionalContent');if(!list)return;
  const items=dhadFeatureData.additional.filter(item=>item&&item.active!==false).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  if(!items.length){list.innerHTML='<div class="empty">لم تُنشر موارد إضافية بعد.</div>';return;}
  const cards=await Promise.all(items.map(async item=>{
    const images=await Promise.all((item.images||[]).map(async img=>{const result=await resolveStorageFile(img.path);return result.url?'<button type="button" data-feature-image="'+escapeHtml(img.path)+'" data-feature-title="'+escapeHtml(item.title||'صورة تعليمية')+'"><img src="'+escapeHtml(result.url)+'" alt="'+escapeHtml(img.name||item.title||'صورة تعليمية')+'" loading="lazy"></button>':'';}));
    const description=item.description?'<div class="feature-card-meta">'+escapeHtml(item.description)+'</div>':'';
    const text=item.text?'<p>'+dhadLinkify(item.text)+'</p>':'';
    return '<article class="feature-content-card"><h3>'+escapeHtml(item.title||'مورد تعليمي')+'</h3>'+description+text+(images.filter(Boolean).length?'<div class="feature-card-images">'+images.filter(Boolean).join('')+'</div>':'')+'</article>';
  }));
  list.innerHTML=cards.join('');
}
function dhadLinkify(text){
  return escapeHtml(text||'').replace(/(https?:\/\/[^\s<]+)/g,match=>{const url=dhadPublicUrl(match.replace(/&amp;/g,'&'));return url?'<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener noreferrer">'+match+'</a>':match;}).replace(/\r?\n/g,'<br>');
}
async function renderDhadCalendar(){
  const list=document.getElementById('calendarGallery');if(!list)return;
  const items=dhadFeatureData.calendar.filter(item=>item&&item.active!==false&&item.imagePath).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  if(!items.length){list.innerHTML='<div class="empty">لا توجد صور تقويم منشورة حاليًا.</div>';return;}
  const cards=await Promise.all(items.map(async item=>{
    const result=await resolveStorageFile(item.imagePath);if(!result.url)return '';
    return '<article class="calendar-item"><h3>'+escapeHtml(item.title||'التقويم الدراسي')+'</h3>'+(item.year?'<div class="feature-card-meta">'+escapeHtml(item.year)+'</div>':'')+(item.description?'<p>'+escapeHtml(item.description)+'</p>':'')+'<img src="'+escapeHtml(result.url)+'" alt="'+escapeHtml(item.title||'صورة التقويم')+'" loading="lazy" data-calendar-image="'+escapeHtml(item.id)+'"><div class="calendar-item-actions"><button class="preview" type="button" data-calendar-preview="'+escapeHtml(item.id)+'">فتح بحجم أكبر</button><button class="download" type="button" data-calendar-download="'+escapeHtml(item.id)+'">تنزيل الصورة</button></div></article>';
  }));
  list.innerHTML=cards.filter(Boolean).join('')||'<div class="empty">تعذر تحميل الصور من مساحة التخزين.</div>';
}
async function renderDhadGames(){
  const list=document.getElementById('gamesGrid');if(!list)return;
  const games=dhadFeatureData.games.filter(game=>game&&game.active!==false&&game.mainPath).sort((a,b)=>Number(a.order||0)-Number(b.order||0));
  if(!games.length){list.innerHTML='<div class="empty">لم تُنشر ألعاب تعليمية بعد.</div>';return;}
  list.innerHTML=await Promise.all(games.map(async game=>{
    const cover=game.coverPath?await resolveStorageFile(game.coverPath):null;
    return '<article class="feature-content-card">'+(cover?.url?'<img class="game-cover" src="'+escapeHtml(cover.url)+'" alt="'+escapeHtml(game.title||'غلاف اللعبة')+'" loading="lazy">':'')+'<h3>'+escapeHtml(game.title||'لعبة تعليمية')+'</h3>'+(game.description?'<p>'+escapeHtml(game.description)+'</p>':'')+'<div class="game-card-actions"><button class="primary" type="button" data-play-game="'+escapeHtml(game.id)+'">▶ ابدأ اللعب</button></div></article>';
  })).then(rows=>rows.join(''));
}
async function renderDhadCertificate(nameOverride){
  const template={...DHAD_CERTIFICATE_DEFAULT,...dhadFeatureData.certificate,color:dhadSafeColor(dhadFeatureData.certificate?.color,DHAD_CERTIFICATE_DEFAULT.color)};
  const name=nameOverride!==undefined?String(nameOverride||''):(document.getElementById('studentName')?.value||'');
  const markup='<div class="certificate-brand">'+(template.showBrand?escapeHtml(siteBranding.name||'ضـــاد'):'')+'</div><h2 class="certificate-title">'+escapeHtml(template.title||'شهادة تقدير')+'</h2><p class="certificate-intro">'+escapeHtml(template.intro||'')+'</p><div class="certificate-student">'+escapeHtml(name)+'</div><p class="certificate-body">'+escapeHtml(template.body||'')+'</p><p class="certificate-footer">'+escapeHtml(template.footer||'')+'</p><div class="certificate-signatures">'+(template.school?'<span>'+escapeHtml(template.school)+'</span>':'<span></span>')+(template.teacher?'<span>'+escapeHtml(template.teacher)+'</span>':'<span></span>')+'</div>';
  ['certificatePreview','certificateAdminPreview'].forEach(id=>{const el=document.getElementById(id);if(el){el.style.setProperty('--certificate-accent',template.color);el.innerHTML=markup;}});
}
function previewCertificate(){renderDhadCertificate();document.getElementById('certificatePreview')?.scrollIntoView({behavior:'smooth',block:'center'});}
function renderCertificateAdmin(){
  const template={...DHAD_CERTIFICATE_DEFAULT,...dhadFeatureData.certificate};
  const fields={certificateTitleInput:template.title,certificateIntroInput:template.intro,certificateBodyInput:template.body,certificateFooterInput:template.footer,certificateSchoolInput:template.school,certificateTeacherInput:template.teacher,certificateColorInput:dhadSafeColor(template.color,DHAD_CERTIFICATE_DEFAULT.color),certificateLogoInput:!!template.showBrand};
  for(const [id,value] of Object.entries(fields)){const el=document.getElementById(id);if(el){if(el.type==='checkbox')el.checked=!!value;else el.value=value||'';}}
  renderDhadCertificate('');
}
async function saveCertificateTemplate(event){
  event?.preventDefault();if(!isOwner())return showInfo('صلاحية غير كافية','إدارة قالب الشهادة متاحة لمالك المنصة فقط.');
  const template={title:document.getElementById('certificateTitleInput').value.trim()||'شهادة تقدير',intro:document.getElementById('certificateIntroInput').value.trim(),body:document.getElementById('certificateBodyInput').value.trim(),footer:document.getElementById('certificateFooterInput').value.trim(),school:document.getElementById('certificateSchoolInput').value.trim(),teacher:document.getElementById('certificateTeacherInput').value.trim(),color:dhadSafeColor(document.getElementById('certificateColorInput').value,DHAD_CERTIFICATE_DEFAULT.color),showBrand:document.getElementById('certificateLogoInput').checked};
  if(await saveDhadFeatureRecord('certificate',template,'قالب شهادة التقدير')){dhadFeatureData.certificate=template;renderCertificateAdmin();dhadFeatureStatus('تم حفظ قالب الشهادة.','ok');}
}
function dhadWrapCanvasText(ctx,text,maxWidth){
  const lines=[];for(const paragraph of String(text||'').split(/\r?\n/)){const words=paragraph.split(/\s+/).filter(Boolean);let line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}lines.push(line);}
  return lines.filter(line=>line!==undefined);
}
async function downloadCertificatePng(){
  const template={...DHAD_CERTIFICATE_DEFAULT,...dhadFeatureData.certificate,color:dhadSafeColor(dhadFeatureData.certificate?.color,DHAD_CERTIFICATE_DEFAULT.color)};
  const name=document.getElementById('studentName')?.value||'';const canvas=document.createElement('canvas');canvas.width=2480;canvas.height=1754;
  const ctx=canvas.getContext('2d');if(!ctx)return showInfo('تنزيل الشهادة','تعذر إنشاء الصورة في هذا المتصفح.');
  try{await document.fonts.ready;await document.fonts.load('700 72px Cairo');}catch(e){}
  ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle=template.color;ctx.lineWidth=22;ctx.strokeRect(58,58,canvas.width-116,canvas.height-116);ctx.lineWidth=4;ctx.strokeRect(91,91,canvas.width-182,canvas.height-182);
  ctx.fillStyle=template.color;ctx.font='900 54px Cairo, sans-serif';ctx.textAlign='center';ctx.direction='rtl';ctx.fillText('✦',160,190);ctx.fillText('✦',canvas.width-160,canvas.height-145);
  let y=310;if(template.showBrand){ctx.fillStyle='#0e6962';ctx.font='900 62px Cairo, sans-serif';ctx.fillText(siteBranding.name||'ضـــاد',canvas.width/2,y);y+=105;}
  const blocks=[
    {text:template.title||'شهادة تقدير',font:108,weight:900,color:template.color,gap:18},
    {text:template.intro||'',font:58,weight:600,color:'#294c48',gap:18},
    {text:name,font:106,weight:900,color:'#0e6962',gap:20},
    {text:template.body||'',font:54,weight:600,color:'#294c48',gap:22},
    {text:template.footer||'',font:48,weight:700,color:'#294c48',gap:0}
  ].filter(block=>String(block.text).trim());
  const available=canvas.height-330-y;let scale=1;let layout=[];
  for(;scale>=.24;scale-=.04){
    let height=0;layout=blocks.map(block=>{ctx.font=block.weight+' '+Math.max(24,Math.round(block.font*scale))+'px Cairo, sans-serif';const lines=dhadWrapCanvasText(ctx,block.text,1850);const lineHeight=Math.max(30,Math.round(block.font*.74*scale));height+=lines.length*lineHeight+Math.round(block.gap*scale);return {...block,lines,fontSize:Math.max(24,Math.round(block.font*scale)),lineHeight};});
    if(height<=available)break;
  }
  for(const block of layout){ctx.fillStyle=block.color;ctx.font=block.weight+' '+block.fontSize+'px Cairo, sans-serif';for(const line of block.lines){ctx.fillText(line,canvas.width/2,y);y+=block.lineHeight;}y+=Math.round(block.gap*scale);}
  ctx.fillStyle='#526a65';ctx.font='700 42px Cairo, sans-serif';if(template.school)ctx.fillText(template.school,canvas.width*.32,canvas.height-235);if(template.teacher)ctx.fillText(template.teacher,canvas.width*.68,canvas.height-235);
  const filename='شهادة-تقدير'+(name.trim()?'-'+name.trim().replace(/[\\/:*?"<>|]+/g,'-'):'')+'.png';
  canvas.toBlob(blob=>{if(!blob)return showInfo('تنزيل الشهادة','تعذر تجهيز ملف PNG.');const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
}
function showDhadFeaturePage(key,push=true){
  if(!['games','additional','calendar','certificate'].includes(key))return;
  if(push)pushNav({type:'feature',id:key});
  hideAll();const page=document.getElementById(key==='games'?'gamesPage':key==='additional'?'additionalPage':key==='calendar'?'calendarPage':'certificatePage');
  if(page)page.style.display='block';setRoute(key);scrollTop();
  loadDhadFeatureData().then(renderDhadFeaturePages);
}
showCalendar=function(push=true){showDhadFeaturePage('calendar',push);};
hideAll=(function(oldHideAll){return function(){oldHideAll();['gamesPage','additionalPage','certificatePage','featureAdminPage'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});};})(hideAll);
goBack=function(){
  if(window.__dhadNavStack?.length){const item=window.__dhadNavStack.pop();if(item.type==='home')return goHome();if(item.type==='feature')return showDhadFeaturePage(item.id,false);if(item.type==='grades')return showGradesPage(false);if(item.type==='grade')return showGrade(item.id,false);if(item.type==='track')return showTrack(item.gradeId,item.trackIndex,false);if(item.type==='field')return showField(item.gradeId,item.trackIndex,item.fieldIndex,false);if(item.type==='semester')return showSemester(item.gradeId,item.trackIndex,item.fieldIndex,item.semesterIndex,false);}
  return goHome();
};
async function showFeatureAdminPage(){
  if(!isOwner())return showInfo('صلاحية غير كافية','إدارة محتوى الأقسام متاحة لمالك المنصة فقط.');
  hideAll();const page=document.getElementById('featureAdminPage');if(page)page.style.display='block';setRoute('feature-admin');scrollTop();
  await loadDhadFeatureData();renderHomeCardsAdmin();renderDhadAdminLists();renderCertificateAdmin();dhadFeatureStatus('');
}
async function renderDhadAdminLists(){
  renderDhadAdminList('additionalAdminList',dhadFeatureData.additional,'additional');
  renderDhadAdminList('calendarAdminList',dhadFeatureData.calendar,'calendar');
  renderDhadAdminList('gamesAdminList',dhadFeatureData.games,'games');
}
function renderDhadAdminList(elementId,items,type){
  const list=document.getElementById(elementId);if(!list)return;
  if(!items?.length){list.innerHTML='<div class="empty">لا توجد عناصر محفوظة.</div>';return;}
  list.innerHTML=items.slice().sort((a,b)=>Number(a.order||0)-Number(b.order||0)).map(item=>'<div class="home-section-admin-item"><div><strong>'+escapeHtml(item.title||'محتوى دون عنوان')+'</strong><div class="home-section-admin-meta">الترتيب: '+Number(item.order||0)+' · '+(item.active===false?'مخفي عن الزوار':'ظاهر للزوار')+(type==='calendar'&&item.year?' · '+escapeHtml(item.year):'')+'</div></div><div class="home-section-admin-actions"><button type="button" class="secondary" data-feature-edit="'+type+'" data-feature-id="'+escapeHtml(item.id)+'">تعديل</button><button type="button" class="'+(item.active===false?'primary':'edit')+'" data-feature-toggle="'+type+'" data-feature-id="'+escapeHtml(item.id)+'">'+(item.active===false?'إظهار':'إخفاء')+'</button><button type="button" class="danger" data-feature-delete="'+type+'" data-feature-id="'+escapeHtml(item.id)+'">حذف</button></div></div>').join('');
}
function resetAdditionalForm(){document.getElementById('additionalForm')?.reset();document.getElementById('additionalId').value='';document.getElementById('additionalOrder').value=String(dhadFeatureData.additional.length+1);document.getElementById('additionalActive').checked=true;document.getElementById('additionalCurrentImages').textContent='';}
function editAdditionalItem(id){const item=dhadFeatureData.additional.find(row=>row.id===id);if(!item)return;document.getElementById('additionalId').value=item.id;document.getElementById('additionalTitle').value=item.title||'';document.getElementById('additionalDescription').value=item.description||'';document.getElementById('additionalText').value=item.text||'';document.getElementById('additionalOrder').value=String(item.order||0);document.getElementById('additionalActive').checked=item.active!==false;document.getElementById('additionalCurrentImages').textContent=(item.images||[]).length?'الصور الحالية محفوظة؛ الصور الجديدة تُضاف إليها.':'';document.getElementById('additionalForm').scrollIntoView({behavior:'smooth',block:'start'});}
async function saveAdditionalItem(event){
  event.preventDefault();if(!isOwner())return showInfo('صلاحية غير كافية','إدارة التعليم الإضافي متاحة لمالك المنصة فقط.');
  const id=document.getElementById('additionalId').value||crypto.randomUUID();const old=dhadFeatureData.additional.find(row=>row.id===id);const order=Number(document.getElementById('additionalOrder').value||0);if(!Number.isInteger(order)||order<0)return dhadFeatureStatus('أدخل رقم ترتيب صحيحًا.','error');
  const images=[...(old?.images||[])];for(const file of Array.from(document.getElementById('additionalImages').files||[])){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)return dhadFeatureStatus('اختر صور PNG أو JPG أو WebP لا يتجاوز حجم كل منها 5 ميجابايت.','error');const path=await uploadDhadFeatureFile(file,'additional');if(!path)return;images.push({path,name:file.name});}
  const item={id,title:document.getElementById('additionalTitle').value.trim(),description:document.getElementById('additionalDescription').value.trim(),text:document.getElementById('additionalText').value.trim(),images,order,active:document.getElementById('additionalActive').checked};
  const next=old?dhadFeatureData.additional.map(row=>row.id===id?item:row):[...dhadFeatureData.additional,item];
  if(await saveDhadFeatureRecord('additional',next,'محتوى التعليم الإضافي')){dhadFeatureData.additional=next;resetAdditionalForm();renderDhadAdminLists();await renderDhadAdditional();dhadFeatureStatus('تم حفظ المحتوى التعليمي.','ok');}
}
function resetCalendarForm(){document.getElementById('calendarForm')?.reset();document.getElementById('calendarId').value='';document.getElementById('calendarOrder').value=String(dhadFeatureData.calendar.length+1);document.getElementById('calendarActive').checked=true;document.getElementById('calendarCurrentImage').textContent='';}
function editCalendarItem(id){const item=dhadFeatureData.calendar.find(row=>row.id===id);if(!item)return;document.getElementById('calendarId').value=item.id;document.getElementById('calendarTitle').value=item.title||'';document.getElementById('calendarDescription').value=item.description||'';document.getElementById('calendarYear').value=item.year||'';document.getElementById('calendarOrder').value=String(item.order||0);document.getElementById('calendarActive').checked=item.active!==false;document.getElementById('calendarCurrentImage').textContent=item.imagePath?'الصورة الحالية محفوظة. رفع صورة جديدة يستبدل الصورة المعروضة ويترك الملف السابق محفوظًا.':'';document.getElementById('calendarForm').scrollIntoView({behavior:'smooth',block:'start'});}
async function saveCalendarItem(event){
  event.preventDefault();if(!isOwner())return showInfo('صلاحية غير كافية','إدارة التقويم متاحة لمالك المنصة فقط.');
  const id=document.getElementById('calendarId').value||crypto.randomUUID();const old=dhadFeatureData.calendar.find(row=>row.id===id);const file=document.getElementById('calendarImage').files?.[0];let imagePath=old?.imagePath||'';
  if(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)return dhadFeatureStatus('اختر صورة PNG أو JPG أو WebP لا يتجاوز حجمها 8 ميجابايت.','error');imagePath=await uploadDhadFeatureFile(file,'calendar');if(!imagePath)return;}
  if(!imagePath)return dhadFeatureStatus('اختر صورة للتقويم قبل الحفظ.','error');
  const order=Number(document.getElementById('calendarOrder').value||0);if(!Number.isInteger(order)||order<0)return dhadFeatureStatus('أدخل رقم ترتيب صحيحًا.','error');
  const item={id,title:document.getElementById('calendarTitle').value.trim(),description:document.getElementById('calendarDescription').value.trim(),year:document.getElementById('calendarYear').value.trim(),imagePath,order,active:document.getElementById('calendarActive').checked};const next=old?dhadFeatureData.calendar.map(row=>row.id===id?item:row):[...dhadFeatureData.calendar,item];
  if(await saveDhadFeatureRecord('calendar',next,'صور التقويم الدراسي')){dhadFeatureData.calendar=next;resetCalendarForm();renderDhadAdminLists();await renderDhadCalendar();dhadFeatureStatus('تم حفظ صورة التقويم.','ok');}
}
function refreshGameMainOptions(){
  const select=document.getElementById('gameMainFile');if(!select)return;
  const newFiles=Array.from(document.getElementById('gameFiles')?.files||[]).filter(file=>/\.html?$/i.test(file.name));
  const options=newFiles.map(file=>({value:'new:'+String(file.webkitRelativePath||file.name).replace(/\\/g,'/'),label:String(file.webkitRelativePath||file.name)}));
  const oldFiles=dhadGameExistingFiles.filter(file=>/\.html?$/i.test(file.relativePath||file.path||''));
  select.innerHTML='<option value="">اختر ملف HTML الرئيسي</option>'+options.map(item=>'<option value="'+escapeHtml(item.value)+'">'+escapeHtml(item.label)+'</option>').join('')+oldFiles.map(file=>'<option value="old:'+escapeHtml(file.path)+'">ملف محفوظ: '+escapeHtml(file.relativePath||file.path.split('/').pop())+'</option>').join('');
  if(dhadGameExistingMainPath&&!newFiles.length)select.value='old:'+dhadGameExistingMainPath;
}
function resetGameForm(){document.getElementById('gameForm')?.reset();document.getElementById('gameId').value='';document.getElementById('gameOrder').value=String(dhadFeatureData.games.length+1);document.getElementById('gameActive').checked=true;dhadGameExistingFiles=[];dhadGameExistingMainPath='';refreshGameMainOptions();}
function editGameItem(id){const game=dhadFeatureData.games.find(row=>row.id===id);if(!game)return;document.getElementById('gameId').value=game.id;document.getElementById('gameTitle').value=game.title||'';document.getElementById('gameDescription').value=game.description||'';document.getElementById('gameOrder').value=String(game.order||0);document.getElementById('gameActive').checked=game.active!==false;dhadGameExistingFiles=game.files||[];dhadGameExistingMainPath=game.mainPath||'';refreshGameMainOptions();document.getElementById('gameForm').scrollIntoView({behavior:'smooth',block:'start'});}
async function saveGameItem(event){
  event.preventDefault();if(!isOwner())return showInfo('صلاحية غير كافية','إدارة الألعاب متاحة لمالك المنصة فقط.');
  const id=document.getElementById('gameId').value||crypto.randomUUID();const old=dhadFeatureData.games.find(row=>row.id===id);let files=[...(old?.files||[])];const selected=Array.from(document.getElementById('gameFiles').files||[]);let uploaded=[];
  if(selected.length){const batch=crypto.randomUUID();for(const file of selected){const relative=String(file.webkitRelativePath||file.name).replace(/\\/g,'/');if(file.size>50*1024*1024)return dhadFeatureStatus('أحد ملفات اللعبة يتجاوز 50 ميجابايت.','error');const path=await uploadDhadFeatureFile(file,'games/'+batch,relative);if(!path)return;uploaded.push({path,relativePath:relative,name:file.name,type:file.type||''});}files=[...files,...uploaded];}
  const selectedMain=document.getElementById('gameMainFile').value;let mainPath=old?.mainPath||'';let mainFile;
  if(selectedMain.startsWith('new:'))mainFile=uploaded.find(file=>file.relativePath===selectedMain.slice(4));else if(selectedMain.startsWith('old:'))mainPath=selectedMain.slice(4);
  if(mainFile)mainPath=mainFile.path;
  if(!mainPath)return dhadFeatureStatus('اختر ملف HTML رئيسيًا للعبة.','error');
  if(!files.some(file=>file.path===mainPath))files.push({path:mainPath,relativePath:mainPath.split('/').pop(),name:mainPath.split('/').pop(),type:'text/html'});
  let coverPath=old?.coverPath||'';const cover=document.getElementById('gameCover').files?.[0];if(cover){if(!['image/png','image/jpeg','image/webp'].includes(cover.type)||cover.size>5*1024*1024)return dhadFeatureStatus('غلاف اللعبة يجب أن يكون PNG أو JPG أو WebP وبحجم لا يتجاوز 5 ميجابايت.','error');coverPath=await uploadDhadFeatureFile(cover,'game-covers');if(!coverPath)return;}
  const order=Number(document.getElementById('gameOrder').value||0);if(!Number.isInteger(order)||order<0)return dhadFeatureStatus('أدخل رقم ترتيب صحيحًا.','error');
  const game={id,title:document.getElementById('gameTitle').value.trim(),description:document.getElementById('gameDescription').value.trim(),coverPath,files,mainPath,order,active:document.getElementById('gameActive').checked};const next=old?dhadFeatureData.games.map(row=>row.id===id?game:row):[...dhadFeatureData.games,game];
  if(await saveDhadFeatureRecord('games',next,'الألعاب التعليمية')){dhadFeatureData.games=next;resetGameForm();renderDhadAdminLists();await renderDhadGames();dhadFeatureStatus('تم حفظ اللعبة وملفاتها.','ok');}
}
async function playDhadGame(id){
  const game=dhadFeatureData.games.find(row=>row.id===id);if(!game)return;
  const resolved=await resolveStorageFile(game.mainPath);if(!resolved.url)return showInfo('تشغيل اللعبة',resolved.message);
  const player=document.getElementById('gamePlayer'),frame=document.getElementById('gameFrame');if(!player||!frame)return;
  document.getElementById('gamePlayerTitle').textContent=game.title||'لعبة تعليمية';frame.src=resolved.url;player.hidden=false;player.scrollIntoView({behavior:'smooth',block:'start'});
}
function closeGamePlayer(){const frame=document.getElementById('gameFrame');if(frame)frame.src='about:blank';const player=document.getElementById('gamePlayer');if(player)player.hidden=true;}
function resetFeatureFormByType(type){if(type==='additional')resetAdditionalForm();else if(type==='calendar')resetCalendarForm();else if(type==='games')resetGameForm();}
async function mutateFeatureItem(type,id,action){
  if(!isOwner())return showInfo('صلاحية غير كافية','هذه العملية متاحة لمالك المنصة فقط.');
  const key=type==='additional'?'additional':type==='calendar'?'calendar':'games';let rows=[...dhadFeatureData[key]];const item=rows.find(row=>row.id===id);if(!item)return;
  if(action==='edit'){if(type==='additional')editAdditionalItem(id);else if(type==='calendar')editCalendarItem(id);else editGameItem(id);return;}
  if(action==='toggle')rows=rows.map(row=>row.id===id?{...row,active:row.active===false}:row);
  if(action==='delete'){if(!confirm('هل تريد حذف «'+(item.title||'هذا المحتوى')+'» من الموقع؟ تبقى الملفات الأصلية محفوظة في مساحة التخزين.'))return;rows=rows.filter(row=>row.id!==id);}
  if(await saveDhadFeatureRecord(key,rows,type==='calendar'?'صور التقويم':type==='games'?'الألعاب التعليمية':'محتوى التعليم الإضافي')){dhadFeatureData[key]=rows;renderDhadAdminLists();if(type==='additional')await renderDhadAdditional();if(type==='calendar')await renderDhadCalendar();if(type==='games')await renderDhadGames();dhadFeatureStatus(action==='toggle'?'تم تحديث حالة الظهور.':'تم حذف العنصر من القائمة.','ok');}
}
async function openCalendarImage(id,download=false){
  const item=dhadFeatureData.calendar.find(row=>row.id===id);if(!item)return;
  const ext=homeSectionExtension(item.imagePath)||'png';const filename=(item.title||'التقويم')+'.'+ext;
  const resolved=await resolveStorageFile(item.imagePath,download?filename:'');if(!resolved.url)return showInfo('صورة التقويم',resolved.message);
  if(download)triggerFileDownload(resolved.url,filename);else openPreviewModal(item.title||'التقويم الدراسي','<div style="display:grid;place-items:center;min-height:250px"><img src="'+escapeHtml(resolved.url)+'" alt="'+escapeHtml(item.title||'صورة التقويم')+'" style="max-width:100%;max-height:75vh;object-fit:contain"></div>',resolved.url);
}
async function openAdditionalImage(path,title){const resolved=await resolveStorageFile(path);if(!resolved.url)return showInfo('الصورة التعليمية',resolved.message);openPreviewModal(title||'صورة تعليمية','<div style="display:grid;place-items:center;min-height:240px"><img src="'+escapeHtml(resolved.url)+'" alt="'+escapeHtml(title||'صورة تعليمية')+'" style="max-width:100%;max-height:72vh;object-fit:contain"></div>',resolved.url);}
function renderFooterContactLinks(rows){
  const el=document.getElementById('footerSocialLinks');if(!el)return;
  const active=(rows||[]).filter(row=>row.url);
  el.innerHTML=active.map(row=>'<a href="'+escapeHtml(row.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escapeHtml(row.title||'رابط تواصل')+'" title="'+escapeHtml(row.title||'رابط تواصل')+'">'+(CONTACT_ICONS[row.key]||'<span aria-hidden="true">↗</span>')+'</a>').join('');
}
function wireDhadFeatureEvents(){
  if(document.body.dataset.dhadFeatureEvents)return;document.body.dataset.dhadFeatureEvents='true';
  document.body.addEventListener('click',event=>{
    const play=event.target.closest('[data-play-game]');if(play){playDhadGame(play.getAttribute('data-play-game'));return;}
    const preview=event.target.closest('[data-calendar-preview]');if(preview){openCalendarImage(preview.getAttribute('data-calendar-preview'));return;}
    const download=event.target.closest('[data-calendar-download]');if(download){openCalendarImage(download.getAttribute('data-calendar-download'),true);return;}
    const image=event.target.closest('[data-calendar-image]');if(image){openCalendarImage(image.getAttribute('data-calendar-image'));return;}
    const additionalImage=event.target.closest('[data-feature-image]');if(additionalImage){openAdditionalImage(additionalImage.getAttribute('data-feature-image'),additionalImage.getAttribute('data-feature-title'));return;}
    const edit=event.target.closest('[data-feature-edit]');if(edit){mutateFeatureItem(edit.getAttribute('data-feature-edit'),edit.getAttribute('data-feature-id'),'edit');return;}
    const toggle=event.target.closest('[data-feature-toggle]');if(toggle){mutateFeatureItem(toggle.getAttribute('data-feature-toggle'),toggle.getAttribute('data-feature-id'),'toggle');return;}
    const del=event.target.closest('[data-feature-delete]');if(del)mutateFeatureItem(del.getAttribute('data-feature-delete'),del.getAttribute('data-feature-id'),'delete');
  });
  document.getElementById('gameFiles')?.addEventListener('change',refreshGameMainOptions);
  document.getElementById('studentName')?.addEventListener('input',renderDhadCertificate);
  window.addEventListener('hashchange',()=>{
    const route=String(location.hash||'').replace(/^#/,'');
    if(['games','additional','calendar','certificate'].includes(route)){const current=document.getElementById(route==='games'?'gamesPage':route==='additional'?'additionalPage':route==='calendar'?'calendarPage':'certificatePage');if(current?.style.display!=='block')showDhadFeaturePage(route,false);}
    else if((route===''||route==='home')&&document.getElementById('home')?.style.display!=='block')goHome();
    else if(route==='grades'&&document.getElementById('gradesHubPage')?.style.display!=='block')showGradesPage(false);
  });
}
const dhadOriginalInitSupabase=initSupabase;
initSupabase=async function(){
  await dhadOriginalInitSupabase();
  if(sb){await loadDhadFeatureData();await renderDhadFeaturePages();try{renderFooterContactLinks(await getContactLinks());}catch(e){}}
};
const dhadOriginalSaveContactLinks=saveContactLinks;
saveContactLinks=async function(){await dhadOriginalSaveContactLinks();try{renderFooterContactLinks(await getContactLinks());}catch(e){}};
const dhadOriginalSaveSiteBranding=saveSiteBranding;
saveSiteBranding=async function(){await dhadOriginalSaveSiteBranding();};
document.addEventListener('DOMContentLoaded',()=>{wireDhadFeatureEvents();renderDhadHomeCards();renderDhadCertificate();});
wireDhadFeatureEvents();renderDhadHomeCards();renderDhadCertificate();
if(window.__SUPABASE_LOADED__&&sb)loadDhadFeatureData().then(async()=>{await renderDhadFeaturePages();try{renderFooterContactLinks(await getContactLinks());}catch(e){}});
