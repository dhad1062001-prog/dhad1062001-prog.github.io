(() => {
  "use strict";

  const SUPABASE_URL = "https://rjkrfvnexrhebvulrtgp.supabase.co";
  // Publishable key only. Privileged service keys and OAuth secrets stay server-side.
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_INgrDnl6WPs_vNhpvwXMSA_YiHX8x7J";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const app = document.getElementById("app");
  const dashboardMarkup = app.innerHTML;
  const titles = {
    overview: "لوحة المعلومات",
    homepage: "إدارة الصفحة الرئيسية",
    sections: "إدارة الأقسام والتصنيفات",
    materials: "إدارة الملفات التعليمية",
    supplies: "لوازم المعلمين",
    academic: "الصفوف والمناهج",
    staff: "المستخدمون والصلاحيات",
    storage: "مساحات التخزين",
    drive: "حسابات Google Drive",
    analytics: "الإحصائيات والتقارير",
    pages: "صفحات الموقع",
    seo: "تحسين الظهور SEO",
    games: "الألعاب والأنشطة",
    ads: "إدارة الإعلانات",
    settings: "إعدادات المنصة",
    security: "الأمان والحماية",
    audit: "سجل العمليات",
    backups: "النسخ الاحتياطي",
    trash: "سلة المحذوفات"
  };
  const descriptions = {
    homepage: "التحكم بمحتوى واجهة الاستقبال والعناوين والوصف والصور والأزرار والروابط، مع معاينة التغييرات قبل نشرها.",
    sections: "إنشاء الأقسام الرئيسية والفرعية، وضبط ترتيبها وظهورها، وربط الملفات بها دون إنشاء نسخ مكررة من الملفات.",
    materials: "رفع ملف واحد أو مجموعة ملفات، وإضافة الوصف والبيانات التعليمية، وتحديد القسم الأساسي والأقسام الإضافية، وإدارة المعاينة والتنزيل.",
    supplies: "تنظيم الموارد المهنية الخاصة بالمعلمين، وإدارتها ضمن قسم مستقل مع إمكانية تصنيفها وربطها بالملفات.",
    academic: "إدارة الصفوف والفصول والمناهج والوحدات والدروس والمواد التعليمية مع المحافظة على العلاقات الحالية.",
    staff: "إدارة حسابات فريق العمل، وتحديد الأدوار والصلاحيات على مستوى الوحدات والإجراءات، والتحقق من الصلاحيات في الخادم.",
    storage: "عرض مسارات التخزين وحالة الملفات والمساحة المستخدمة، مع حماية الملفات الموجودة وعدم نقلها أو حذفها دون موافقة.",
    drive: "ربط حسابات Google Drive من خلال تدفق OAuth آمن في الخادم، دون وضع أسرار الخدمة أو رموز OAuth في المتصفح.",
    analytics: "عرض الزيارات ومشاهدات الملفات ومحاولات التنزيل والتنزيلات المكتملة عند توفر قياس موثوق، مع تقارير خاصة بالإدارة.",
    pages: "إدارة صفحات من نحن والخصوصية والتواصل ومحتواها وعناوينها وحالة نشرها.",
    seo: "إدارة عناوين الصفحات وأوصافها والروابط الأساسية وبيانات المشاركة وخريطة الموقع ومتطلبات الفهرسة.",
    games: "إدارة الألعاب والأنشطة التعليمية الحالية وإعداداتها ومحتواها دون التأثير على وظائفها القائمة.",
    ads: "متابعة مواضع الإعلانات وإعدادات عرضها وحالة التكامل مع خدمات الإعلانات.",
    settings: "إدارة هوية المنصة وألوانها وإعداداتها العامة، مع اعتماد اللون الزيتوني والذهبي والمحافظة على بساطة الواجهة.",
    security: "مراجعة إعدادات الدخول والجلسات وسياسات الوصول ومفاتيح الخدمات وممارسات الحماية.",
    audit: "تسجيل العمليات الإدارية المهمة مع اسم المنفذ والوقت والعنصر المتأثر ونتيجة العملية.",
    backups: "تحديد سياسة النسخ الاحتياطي والتحقق من قابلية الاستعادة وتوثيق خطوات التعافي.",
    trash: "نقل العناصر المحذوفة حذفًا آمنًا إلى السلة، وإتاحة الاستعادة، وتقييد الحذف النهائي وفق الصلاحيات المعتمدة."
  };

  let activeModule = "overview";
  let accessState = null;
  let authorizationInProgress = false;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  async function invokeAdmin(action) {
    const { data, error } = await supabase.functions.invoke("admin-control", {
      body: { action }
    });
    if (error) throw new Error(error.message || "تعذر الاتصال بخدمة التحقق الإداري.");
    if (data?.error) throw new Error(data.detail || data.error);
    return data;
  }

  function showLogin(message = "") {
    app.innerHTML = `
      <section class="login-screen">
        <div class="login-card">
          <div class="login-mark">ض</div>
          <h1>مركز إدارة ضاد</h1>
          <p>لوحة الإدارة المستقلة لمنصة اللغة العربية.<br>سجّل الدخول بحساب Google، ثم سنتحقق من صلاحية الحساب من الخادم قبل عرض لوحة التحكم.</p>
          ${message ? '<div class="login-error">' + escapeHtml(message) + '</div>' : ''}
          <button class="google-login" id="googleLogin" type="button">المتابعة باستخدام Google</button>
          <small class="login-foot">لا يتم منح الصلاحية لمجرد تسجيل الدخول. يسمح النظام فقط للحسابات المعتمدة.</small>
        </div>
      </section>`;
    const button = document.getElementById("googleLogin");
    button?.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "جارٍ تحويلك إلى Google…";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: location.origin + location.pathname }
      });
      if (error) {
        showLogin("تعذر بدء تسجيل الدخول: " + error.message);
      }
    });
  }

  function showDenied(message) {
    app.innerHTML = `
      <section class="login-screen">
        <div class="login-card">
          <div class="login-mark">ض</div>
          <h1>الحساب غير مخوّل</h1>
          <p>${escapeHtml(message)}</p>
          <button class="google-login" id="signOutDenied" type="button">العودة إلى تسجيل الدخول</button>
          <small class="login-foot">إذا كنت تعتقد أن هذا خطأ، تواصل مع مالك منصة ضاد.</small>
        </div>
      </section>`;
    document.getElementById("signOutDenied")?.addEventListener("click", async () => {
      await supabase.auth.signOut({ scope: "local" });
      showLogin();
    });
  }

  function bindDashboard() {
    const nav = document.getElementById("navigation");
    const sidebar = document.getElementById("sidebar");
    const scrim = document.getElementById("sidebarScrim");
    const user = accessState?.staff;
    hideUnauthorizedModules();
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const avatar = document.getElementById("userAvatar");
    if (userName) userName.textContent = user?.display_name || accessState?.user?.user_metadata?.full_name || accessState?.user?.email || "مستخدم الإدارة";
    if (userEmail) userEmail.textContent = accessState?.user?.email || "";
    if (avatar) avatar.textContent = (user?.display_name || accessState?.user?.email || "ض").trim().charAt(0) || "ض";

    document.getElementById("menuToggle")?.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      scrim.classList.toggle("show");
    });
    const closeMenu = () => {
      sidebar.classList.remove("open");
      scrim.classList.remove("show");
    };
    scrim?.addEventListener("click", closeMenu);
    document.getElementById("signOutButton")?.addEventListener("click", async () => {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) showLogin("تعذر تسجيل الخروج: " + error.message);
    });
    document.addEventListener("click", event => {
      const moduleButton = event.target.closest("[data-module]");
      if (moduleButton) {
        showModule(moduleButton.dataset.module);
        return;
      }
      const periodButton = event.target.closest("[data-analytics-period]");
      if (periodButton && activeModule === "analytics") {
        loadAnalytics(Number(periodButton.dataset.analyticsPeriod));
        return;
      }
      if (event.target.closest("[data-analytics-refresh]") && activeModule === "analytics") {
        loadAnalytics(currentAnalyticsDays);
      }
    });
    window.addEventListener("hashchange", () => {
      const key = location.hash.replace(/^#/, "");
      if (key && titles[key]) showModule(key, false);
    });
    if (location.hash && titles[location.hash.slice(1)]) {
      showModule(location.hash.slice(1), false);
    } else {
      showModule("overview", false);
    }
  }

  function showModule(key, updateHash = true) {
    if (!titles[key]) return;
    if (accessState && !canAccessModule(key)) { key = "overview"; updateHash = true; }
    activeModule = key;
    document.querySelectorAll("[data-module]").forEach(button => {
      button.classList.toggle("active", button.dataset.module === key);
    });
    const title = document.getElementById("pageTitle");
    const subtitle = document.getElementById("pageSubtitle");
    const breadcrumb = document.getElementById("breadcrumbTitle");
    const view = document.getElementById("moduleView");
    if (!title || !view) return;
    if (key === "overview") {
      title.textContent = "مرحبًا بك في ضاد";
      subtitle.textContent = "نظرة عامة على وحدات إدارة المنصة التعليمية.";
      breadcrumb.textContent = titles.overview;
      view.innerHTML = overviewMarkup;
    } else if (key === "materials" || key === "supplies") {
      title.textContent = titles[key];
      subtitle.textContent = "عرض الملفات التعليمية المسجلة — دون تعديل البيانات.";
      breadcrumb.textContent = titles[key];
      loadMaterials();
    } else if (key === "sections") {
      title.textContent = titles.sections;
      subtitle.textContent = "عرض الأقسام والتصنيفات الحالية.";
      breadcrumb.textContent = titles.sections;
      loadSections();
    } else if (key === "analytics") {
      title.textContent = titles.analytics;
      subtitle.textContent = "إحصائيات الاستخدام المسجلة خلال الفترة المحددة.";
      breadcrumb.textContent = titles.analytics;
      view.innerHTML = analyticsMarkup();
      loadAnalytics(30);
    } else {
      title.textContent = titles[key];
      subtitle.textContent = "وحدة ضمن مركز إدارة ضاد المستقل.";
      breadcrumb.textContent = titles[key];
      view.innerHTML = '<section class="module-placeholder"><h2>' + escapeHtml(titles[key]) +
        '</h2><p>' + escapeHtml(descriptions[key] || "سيتم إعداد هذه الوحدة ضمن مراحل التطوير المعتمدة.") +
        '</p><div class="lock-note"><span>◈</span><span>لم يتم ربط هذه الوحدة بقاعدة البيانات بعد — لا توجد عمليات فعلية مفعّلة.</span></div></section>';
    }
    if (updateHash) {
      if (key === "overview") history.replaceState(null, "", location.pathname);
      else history.replaceState(null, "", location.pathname + "#" + key);
    }
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("sidebarScrim")?.classList.remove("show");
  }


  function canAccessModule(key) {
    const p = accessState?.permissions || {};
    if (["materials","supplies"].includes(key)) return p.files === true || accessState?.owner === true;
    if (["sections","academic"].includes(key)) return p.content === true || accessState?.owner === true;
    if (key === "analytics") return p.analytics === true || accessState?.owner === true;
    return true;
  }
  function hideUnauthorizedModules() {
    document.querySelectorAll("[data-module]").forEach(el => {
      if (!canAccessModule(el.dataset.module)) el.remove();
    });
  }
  const fmtDate = value => value ? new Intl.DateTimeFormat("ar-JO",{dateStyle:"medium"}).format(new Date(value)) : "—";
  const lookup = (items,id) => items.find(x => String(x.id)===String(id))?.name || "—";
  async function loadMaterials() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل الملفات…</div>';
    const [m,g,s,c]=await Promise.all([
      supabase.from("materials").select("id,title,file_name,grade_id,semester_id,category_id,download_count,is_public,created_at").order("created_at",{ascending:false}).limit(500),
      supabase.from("grades").select("id,name").order("sort_order"),
      supabase.from("semesters").select("id,name").order("sort_order"),
      supabase.from("categories").select("id,name").order("sort_order")
    ]);
    const error=m.error||g.error||s.error||c.error;
    if(error){root.innerHTML='<div class="data-error">تعذر تحميل الملفات: '+escapeHtml(error.message)+'</div>';return;}
    const materials=m.data||[], grades=g.data||[], semesters=s.data||[], categories=c.data||[];
    const row=item=>'<tr><td><strong>'+escapeHtml(item.title)+'</strong><small>'+escapeHtml(item.file_name)+'</small></td><td>'+escapeHtml(lookup(grades,item.grade_id))+'</td><td>'+escapeHtml(lookup(semesters,item.semester_id))+'</td><td>'+escapeHtml(lookup(categories,item.category_id))+'</td><td>'+numberFormat(item.download_count)+'</td><td>'+(item.is_public?'منشور':'غير منشور')+'</td><td>'+fmtDate(item.created_at)+'</td></tr>';
    root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>الملفات التعليمية</h2><p>بيانات مباشرة من قاعدة البيانات — عرض فقط في هذه المرحلة.</p></div><span class="data-count">'+numberFormat(materials.length)+' ملف</span></div><input class="data-search" id="materialsSearch" type="search" placeholder="ابحث باسم الملف أو عنوانه"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الملف</th><th>الصف</th><th>الفصل</th><th>التصنيف</th><th>التنزيلات المسجلة</th><th>الحالة</th><th>تاريخ الإضافة</th></tr></thead><tbody id="materialsRows">'+(materials.map(row).join("")||'<tr><td colspan="7">لا توجد ملفات.</td></tr>')+'</tbody></table></div><p class="data-note">لا يوجد رفع أو تعديل أو حذف مفعّل هنا؛ لم تتغير أي بيانات أو مسارات تخزين.</p></section>';
    document.getElementById("materialsSearch").addEventListener("input",e=>{
      const q=e.target.value.trim().toLocaleLowerCase("ar");
      document.getElementById("materialsRows").innerHTML=materials.filter(x=>[x.title,x.file_name].some(v=>String(v||"").toLocaleLowerCase("ar").includes(q))).map(row).join("")||'<tr><td colspan="7">لا توجد نتائج.</td></tr>';
    });
  }
  async function loadSections() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل الأقسام والتصنيفات…</div>';
    const [s,c]=await Promise.all([
      supabase.from("home_sections").select("id,title,content_type,sort_order,is_active,parent_id,show_on_home,slug").order("sort_order"),
      supabase.from("categories").select("id,name,slug,sort_order").order("sort_order")
    ]);
    if(s.error||c.error){root.innerHTML='<div class="data-error">تعذر تحميل الأقسام: '+escapeHtml((s.error||c.error).message)+'</div>';return;}
    const sections=s.data||[], categories=c.data||[];
    const sectionRows=sections.map(x=>{const parent=sections.find(y=>y.id===x.parent_id);return '<tr><td><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.slug||"—")+'</small></td><td>'+escapeHtml(parent?.title||"قسم رئيسي")+'</td><td>'+escapeHtml(x.content_type)+'</td><td>'+numberFormat(x.sort_order)+'</td><td>'+(x.is_active?"نشط":"متوقف")+'</td><td>'+(x.show_on_home?"نعم":"لا")+'</td></tr>';}).join("");
    const categoryRows=categories.map(x=>'<tr><td>'+escapeHtml(x.name)+'</td><td>'+escapeHtml(x.slug)+'</td><td>'+numberFormat(x.sort_order)+'</td></tr>').join("");
    root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>الأقسام الحالية</h2><p>الأقسام الرئيسية والفرعية المسجلة في النظام.</p></div><span class="data-count">'+numberFormat(sections.length)+' قسم</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>القسم</th><th>يتبع</th><th>نوع المحتوى</th><th>الترتيب</th><th>الحالة</th><th>الرئيسية</th></tr></thead><tbody>'+(sectionRows||'<tr><td colspan="6">لا توجد أقسام حاليًا.</td></tr>')+'</tbody></table></div><div class="data-module-head"><div><h3>التصنيفات</h3></div><span class="data-count">'+numberFormat(categories.length)+' تصنيف</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>التصنيف</th><th>الرابط المختصر</th><th>الترتيب</th></tr></thead><tbody>'+(categoryRows||'<tr><td colspan="3">لا توجد تصنيفات.</td></tr>')+'</tbody></table></div><p class="data-note">هذه شاشة قراءة فقط. ستضاف أدوات الإنشاء والتعديل بعد ضبط الصلاحيات وسجل العمليات.</p></section>';
  }

  let currentAnalyticsDays = 30;
  let analyticsRequestId = 0;

  function analyticsMarkup() {
    return `
      <section class="analytics-panel">
        <div class="analytics-toolbar">
          <div>
            <h2>ملخص أداء المنصة</h2>
            <p>بيانات مسجلة من نظام الإحصائيات الحالي، وتظهر للإدارة المصرح لها فقط.</p>
          </div>
          <div class="analytics-controls">
            <div class="period-switch" role="group" aria-label="الفترة الزمنية">
              <button type="button" data-analytics-period="7">7 أيام</button>
              <button type="button" data-analytics-period="30" class="selected">30 يومًا</button>
              <button type="button" data-analytics-period="90">90 يومًا</button>
            </div>
            <button type="button" class="refresh-analytics" data-analytics-refresh>تحديث ↻</button>
          </div>
        </div>
        <div id="analyticsResults" aria-live="polite">
          <div class="analytics-loading">جارٍ تحميل الإحصائيات بأمان…</div>
        </div>
      </section>`;
  }

  function numberFormat(value) {
    return new Intl.NumberFormat("ar-JO").format(Number(value) || 0);
  }

  function analyticsList(items, labelKey, valueKey, emptyText) {
    if (!Array.isArray(items) || !items.length) return '<p class="analytics-empty">' + emptyText + '</p>';
    const max = Math.max(1, ...items.map(item => Number(item[valueKey]) || 0));
    return '<div class="analytics-list">' + items.map(item => {
      const label = escapeHtml(item[labelKey] ?? "غير محدد");
      const value = Number(item[valueKey]) || 0;
      const width = Math.max(value > 0 ? 2 : 0, Math.min(100, value / max * 100));
      return '<div class="analytics-list-row"><div class="analytics-list-label"><span title="' + label + '">' + label + '</span><strong>' + numberFormat(value) + '</strong></div><div class="analytics-track"><i style="width:' + width + '%"></i></div></div>';
    }).join("") + '</div>';
  }

  function renderAnalytics(data, days) {
    const root = document.getElementById("analyticsResults");
    if (!root) return;
    const totals = data?.totals || {};
    const daily = Array.isArray(data?.daily) ? data.daily : [];
    const topMaterials = Array.isArray(data?.top_materials) ? data.top_materials : [];
    const topPages = Array.isArray(data?.top_pages) ? data.top_pages : [];
    const devices = Array.isArray(data?.devices) ? data.devices : [];
    const referrers = Array.isArray(data?.referrers) ? data.referrers : [];
    const maxViews = Math.max(1, ...daily.map(row => Number(row.page_views) || 0));
    const dailyMarkup = daily.length ? daily.map(row => {
      const day = escapeHtml(String(row.day || "").slice(5));
      const views = Number(row.page_views) || 0;
      const downloads = Number(row.downloads) || 0;
      return '<div class="daily-row"><span>' + day + '</span><div class="daily-bars"><i class="views-bar" style="width:' + Math.max(views ? 2 : 0, views / maxViews * 100) + '%"></i><i class="downloads-bar" style="width:' + Math.max(downloads ? 2 : 0, downloads / Math.max(1, ...daily.map(x => Number(x.downloads) || 0)) * 100) + '%"></i></div><strong>' + numberFormat(views) + '</strong></div>';
    }).join("") : '<p class="analytics-empty">لا توجد بيانات يومية في هذه الفترة.</p>';
    root.innerHTML = `
      <div class="analytics-stats">
        <article><span>مشاهدات الصفحات</span><strong>${numberFormat(totals.page_views)}</strong></article>
        <article><span>الزوار المميزون</span><strong>${numberFormat(totals.unique_visitors)}</strong></article>
        <article><span>عمليات التنزيل المسجلة</span><strong>${numberFormat(totals.downloads)}</strong></article>
        <article><span>مشاهدات الملفات</span><strong>${numberFormat(totals.material_views)}</strong></article>
        <article><span>معاينات الملفات</span><strong>${numberFormat(totals.previews)}</strong></article>
        <article><span>بدء الألعاب</span><strong>${numberFormat(totals.game_starts)}</strong></article>
      </div>
      <div class="analytics-grid">
        <section class="analytics-card analytics-wide">
          <h3>الحركة اليومية</h3>
          <div class="chart-legend"><span><i class="legend-view"></i> مشاهدات الصفحات</span><span><i class="legend-download"></i> عمليات التنزيل المسجلة</span></div>
          <div class="daily-chart">${dailyMarkup}</div>
        </section>
        <section class="analytics-card"><h3>أكثر الملفات تفاعلًا</h3>${analyticsList(topMaterials.map(x => ({label: x.title, value: x.downloads})), "label", "value", "لا توجد تفاعلات للملفات.")}</section>
        <section class="analytics-card"><h3>الصفحات الأكثر زيارة</h3>${analyticsList(topPages.map(x => ({label: x.path, value: x.views})), "label", "value", "لا توجد بيانات للصفحات.")}</section>
        <section class="analytics-card"><h3>الأجهزة</h3>${analyticsList(devices.map(x => ({label: x.device_type || "غير محدد", value: x.events})), "label", "value", "لا توجد بيانات للأجهزة.")}</section>
        <section class="analytics-card"><h3>مصادر الزيارة</h3>${analyticsList(referrers.map(x => ({label: x.source, value: x.visits})), "label", "value", "لا توجد بيانات للمصادر.")}</section>
      </div>
      <p class="analytics-disclaimer">تنبيه: «عمليات التنزيل المسجلة» تعكس أحداث التنزيل التي سجلها الموقع، ولا تثبت وحدها اكتمال نقل الملف إلى جهاز الزائر. كما أن الأرقام تخص آخر ${numberFormat(days)} يومًا.</p>`;
    document.querySelectorAll("[data-analytics-period]").forEach(button => {
      button.classList.toggle("selected", Number(button.dataset.analyticsPeriod) === days);
    });
  }

  async function loadAnalytics(days = 30) {
    const root = document.getElementById("analyticsResults");
    if (!root) return;
    const safeDays = [7, 30, 90].includes(days) ? days : 30;
    currentAnalyticsDays = safeDays;
    const requestId = ++analyticsRequestId;
    root.innerHTML = '<div class="analytics-loading">جارٍ تحميل الإحصائيات…</div>';
    try {
      const to = new Date();
      const from = new Date(to.getTime() - safeDays * 86400000);
      const { data, error } = await supabase.functions.invoke("admin-analytics", {
        body: { from: from.toISOString(), to: to.toISOString() }
      });
      if (requestId !== analyticsRequestId) return;
      if (error) throw new Error(error.message || "تعذر جلب الإحصائيات.");
      if (data?.error) throw new Error(data.error);
      renderAnalytics(data, safeDays);
    } catch (error) {
      if (requestId !== analyticsRequestId) return;
      root.innerHTML = '<div class="analytics-error"><strong>تعذر تحميل الإحصائيات</strong><p>' + escapeHtml(error.message || "حدث خطأ غير متوقع.") + '</p><small>تأكد من الدخول بحساب إداري مخوّل، ثم حاول التحديث.</small></div>';
    }
  }

  const overviewMarkup = (() => {
    const temporary = document.createElement("div");
    temporary.innerHTML = dashboardMarkup;
    return temporary.querySelector("#moduleView")?.innerHTML || "";
  })();

  async function authorize(session) {
    if (authorizationInProgress) return;
    if (!session?.user) {
      showLogin();
      return;
    }
    authorizationInProgress = true;
    try {
      const result = await invokeAdmin("my_access");
      if (!result?.allowed) {
        await supabase.auth.signOut({ scope: "local" });
        showDenied("تم تسجيل الدخول، لكن هذا الحساب غير موجود ضمن الحسابات المصرح لها بإدارة المنصة.");
        return;
      }
      accessState = { ...result, user: session.user };
      app.innerHTML = dashboardMarkup;
      bindDashboard();
    } catch (error) {
      showLogin("تعذر التحقق من صلاحية الحساب من الخادم: " + error.message);
    } finally {
      authorizationInProgress = false;
    }
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      accessState = null;
      showLogin();
      return;
    }
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
      Promise.resolve().then(() => authorize(session));
    }
  });
})();