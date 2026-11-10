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
      if (activeModule === "homepage") {
        const actionButton = event.target.closest("[data-homepage-action]");
        if (actionButton) {
          const action = actionButton.dataset.homepageAction;
          const id = actionButton.dataset.id;
          if (action === "edit") editHomepageSection(id);
          if (action === "toggle") toggleHomepageSection(id);
          if (action === "delete") deleteHomepageSection(id);
        }
        const linksButton = event.target.closest("[data-homepage-links-save]");
        if (linksButton) saveHomepageSectionLinks(linksButton.dataset.homepageLinksSave);
        if (event.target.closest("[data-homepage-refresh]")) loadHomepage();
        if (event.target.closest("[data-homepage-reset]")) resetHomepageSectionForm();
      }
      const periodButton = event.target.closest("[data-analytics-period]");
      if (periodButton && activeModule === "analytics") {
        loadAnalytics(Number(periodButton.dataset.analyticsPeriod));
        return;
      }
      if (event.target.closest("[data-analytics-refresh]") && activeModule === "analytics") {
        loadAnalytics(currentAnalyticsDays);
      }
      const adminAction = event.target.closest("[data-admin-action]");
      if (adminAction) {
        handleAdminAction(adminAction).catch(error => showModuleError(error));
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
    if (key === "homepage") {
      title.textContent = titles.homepage;
      subtitle.textContent = "إدارة العنوان الترحيبي والوصف والأقسام المنشورة على الصفحة الرئيسية.";
      breadcrumb.textContent = titles.homepage;
      loadHomepage();
    } else if (key === "overview") {
      title.textContent = "مرحبًا بك في ضاد";
      subtitle.textContent = "نظرة عامة على وحدات إدارة المنصة التعليمية.";
      breadcrumb.textContent = titles.overview;
      view.innerHTML = overviewMarkup + '<section class="data-module" id="overviewLiveStats"><div class="data-loading">جارٍ تحميل ملخص قاعدة البيانات…</div></section>';
      loadOverviewSummary();
    } else if (key === "materials" || key === "supplies") {
      title.textContent = titles[key];
      subtitle.textContent = "عرض الملفات التعليمية المسجلة — دون تعديل البيانات.";
      breadcrumb.textContent = titles[key];
      loadMaterials(key);
    } else if (key === "sections") {
      title.textContent = titles.sections;
      subtitle.textContent = "إدارة التصنيفات والأقسام المرتبطة بالموقع.";
      breadcrumb.textContent = titles.sections;
      loadSections();
    } else if (key === "academic") {
      title.textContent = titles.academic;
      subtitle.textContent = "إدارة الصفوف والفصول الدراسية من قاعدة البيانات.";
      breadcrumb.textContent = titles.academic;
      loadAcademic();
    } else if (key === "pages") {
      title.textContent = titles.pages;
      subtitle.textContent = "تحرير صفحات الموقع وروابط التواصل المحفوظة.";
      breadcrumb.textContent = titles.pages;
      loadPages();
    } else if (key === "settings") {
      title.textContent = titles.settings;
      subtitle.textContent = "إدارة هوية المنصة المحفوظة في إعدادات الموقع.";
      breadcrumb.textContent = titles.settings;
      loadSettings();
    } else if (key === "games") {
      title.textContent = titles.games;
      subtitle.textContent = "إدارة بيانات الألعاب والأنشطة المحفوظة في الموقع.";
      breadcrumb.textContent = titles.games;
      loadFeatureEditor();
    } else if (key === "storage") {
      title.textContent = titles.storage;
      subtitle.textContent = "عرض مساحات التخزين المسجلة في النظام.";
      breadcrumb.textContent = titles.storage;
      loadStorage();
    } else if (key === "drive") {
      title.textContent = titles.drive;
      subtitle.textContent = "تسجيل مساحات Google Drive تمهيدًا لربط OAuth.";
      breadcrumb.textContent = titles.drive;
      loadDrive();
    } else if (key === "staff") {
      title.textContent = titles.staff;
      subtitle.textContent = "عرض الحسابات الإدارية المعتمدة دون إضافة حسابات جديدة.";
      breadcrumb.textContent = titles.staff;
      loadStaff();
    } else if (key === "analytics") {
      title.textContent = titles.analytics;
      subtitle.textContent = "إحصائيات الاستخدام المسجلة خلال الفترة المحددة.";
      breadcrumb.textContent = titles.analytics;
      view.innerHTML = analyticsMarkup();
      loadAnalytics(30);
    } else if (key === "seo") {
      title.textContent = titles.seo;
      subtitle.textContent = "إدارة بيانات العناوين والوصف والروابط الأساسية.";
      breadcrumb.textContent = titles.seo;
      loadSeo();
    } else if (key === "audit") {
      title.textContent = titles.audit;
      subtitle.textContent = "سجل العمليات الإدارية المسجلة من الخدمات الخلفية.";
      breadcrumb.textContent = titles.audit;
      loadAudit();
    } else if (key === "trash") {
      title.textContent = titles.trash;
      subtitle.textContent = "استعادة الملفات المؤرشفة أو حذفها نهائيًا.";
      breadcrumb.textContent = titles.trash;
      loadTrash();
    } else if (["ads","security","backups"].includes(key)) {
      title.textContent = titles[key];
      subtitle.textContent = "معلومات موثوقة عن حالة الوحدة ومتطلبات تفعيلها.";
      breadcrumb.textContent = titles[key];
      loadIntegrationStatus(key);
    } else {
      title.textContent = titles[key];
      subtitle.textContent = "وحدة ضمن مركز إدارة ضاد المستقل.";
      breadcrumb.textContent = titles[key];
      view.innerHTML = '<section class="module-placeholder"><h2>' + escapeHtml(titles[key]) +
        '</h2><p>' + escapeHtml(descriptions[key] || "سيتم إعداد هذه الوحدة ضمن مراحل التطوير المعتمدة.") +
        '</p><div class="lock-note"><span>◈</span><span>هذه الوحدة لم تُفعّل بعد؛ لن تظهر أدوات شكلية توحي بأن عملياتها تعمل.</span></div></section>';
    }
    if (updateHash) {
      if (key === "overview") history.replaceState(null, "", location.pathname);
      else history.replaceState(null, "", location.pathname + "#" + key);
    }
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("sidebarScrim")?.classList.remove("show");
  }



  // Homepage management: owner-only, using the existing site_pages and home_sections tables.
  let homepageSections = [];
  let homepageMaterials = [];
  let homepageSectionLinks = {};
  let homepageEditingId = null;
  const HOMEPAGE_DESCRIPTION_SLUG = "home-description";
  const MATERIALS_BUCKET = "materials";

  function homepageMarkup() {
    return `
      <section class="homepage-admin">
        <div class="homepage-intro">
          <div><h2>محتوى واجهة الاستقبال</h2><p>التعديلات تُحفظ في قاعدة البيانات الحالية وتظهر للزوار وفق إعدادات النشر.</p></div>
          <span class="homepage-owner-tag">خاص بمالك المنصة</span>
        </div>
        <div id="homepageStatus" class="homepage-status" role="status" aria-live="polite"></div>
        <form id="homepageHeroForm" class="homepage-card">
          <h3>العنوان الترحيبي والوصف التعريفي</h3>
          <div class="homepage-fields">
            <label>العنوان الرئيسي<input id="homepageTitle" maxlength="180" required placeholder="رحلتك إلى التميز تبدأ من هنا"></label>
            <label>العنوان الفرعي<input id="homepageSubtitle" maxlength="240" placeholder="تعلّم .. اقرأ .. واكتشف جمال لغتنا العربية"></label>
          </div>
          <label class="homepage-label">وصف المنصة<textarea id="homepageDescription" rows="7" placeholder="اكتب وصفًا واضحًا للمنصة وما تقدمه للمعلم والطالب وولي الأمر..."></textarea></label>
          <label class="homepage-check"><input id="homepageVisible" type="checkbox" checked> إظهار الوصف التعريفي للزوار</label>
          <div class="homepage-actions"><button class="homepage-primary" type="submit">حفظ بيانات الواجهة</button></div>
        </form>
        <div class="homepage-columns">
          <form id="homepageSectionForm" class="homepage-card">
            <h3 id="homepageSectionFormTitle">إضافة قسم جديد</h3>
            <input id="homepageSectionId" type="hidden">
            <label class="homepage-label">عنوان القسم<input id="homepageSectionTitle" maxlength="160" required placeholder="مثال: موارد تعليمية للمعلم"></label>
            <div class="homepage-fields">
              <label>القسم الرئيسي الأب<select id="homepageSectionParent"><option value="">قسم رئيسي (دون أب)</option></select></label>
              <label>رمز القسم أو الأيقونة<input id="homepageSectionIcon" maxlength="12" placeholder="📚 أو ✦"></label>
            </div>
            <label class="homepage-label">وصف مختصر يظهر أسفل عنوان القسم<textarea id="homepageSectionDescription" rows="3" placeholder="اكتب وصفًا مختصرًا يعرّف الزائر بهذا القسم..."></textarea></label>
            <label class="homepage-label">نوع المحتوى<select id="homepageSectionType"><option value="text">نص</option><option value="image">صورة</option><option value="file">ملف</option><option value="link">رابط</option><option value="materials">ملفات مرتبطة فقط</option></select></label>
            <label class="homepage-label"><span id="homepageSectionContentLabel">المحتوى النصي أو وصفه</span><textarea id="homepageSectionContent" rows="5" placeholder="اكتب المحتوى أو الوصف..."></textarea></label>
            <label class="homepage-label" id="homepageSectionFileWrap" hidden>اختيار صورة أو ملف<input id="homepageSectionFile" type="file"></label>
            <p id="homepageSectionCurrentFile" class="homepage-help"></p>
            <div class="homepage-fields">
              <label>ترتيب العرض<input id="homepageSectionOrder" type="number" min="0" step="1" value="1" required></label>
              <label>عدد الملفات المرتبطة<input id="homepageSectionLimit" type="number" min="1" max="50" value="6" required></label>
            </div>
            <label class="homepage-label">طريقة عرض الملفات<select id="homepageSectionStyle"><option value="grid">بطاقات</option><option value="list">قائمة</option></select></label>
            <label class="homepage-check"><input id="homepageSectionActive" type="checkbox" checked> تفعيل القسم</label>
            <label class="homepage-check"><input id="homepageSectionShowOnHome" type="checkbox" checked> إظهار القسم في الصفحة الرئيسية</label>
            <div class="homepage-preview" id="homepageSectionPreview">ستظهر هنا معاينة مبسطة لمحتوى القسم.</div>
            <div class="homepage-actions"><button class="homepage-primary" type="submit">حفظ القسم</button><button class="homepage-secondary" type="button" data-homepage-reset>إلغاء / قسم جديد</button></div>
          </form>
          <section class="homepage-card">
            <div class="homepage-list-head"><div><h3>الأقسام الحالية</h3><p>الأقسام النشطة والمخفية المسجلة في قاعدة البيانات.</p></div><button type="button" class="homepage-secondary" data-homepage-refresh>تحديث ↻</button></div>
            <div id="homepageSectionsList" class="homepage-section-list"><div class="homepage-empty">جارٍ تحميل الأقسام...</div></div>
          </section>
        </div>
        <p class="homepage-footnote">الحذف يزيل سجل القسم فقط، ولا يحذف الملف المرتبط من مساحة التخزين. لا يتم تعديل التصنيفات أو الملفات التعليمية أو صلاحيات المستخدمين من هذه الوحدة.</p>
      </section>`;
  }

  function setHomepageStatus(message, kind = "info") {
    const el = document.getElementById("homepageStatus");
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
  }

  async function loadHomepage() {
    const root = document.getElementById("moduleView");
    if (!root) return;
    if (accessState?.owner !== true) {
      root.innerHTML = '<div class="data-error">هذه الوحدة متاحة لمالك المنصة فقط.</div>';
      return;
    }
    root.innerHTML = homepageMarkup();
    bindHomepageForms();
    setHomepageStatus("جارٍ تحميل بيانات الصفحة الرئيسية...");
    try {
      const [pageResult, sectionsResult, materialsResult] = await Promise.all([
        supabase.from("site_pages").select("slug,title,content,is_visible,home_title,home_subtitle").eq("slug", HOMEPAGE_DESCRIPTION_SLUG).maybeSingle(),
        supabase.from("home_sections").select("id,title,content_type,content,file_path,sort_order,is_active,display_limit,display_style,section_description,show_on_home,parent_id,icon,created_at").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
        supabase.from("materials").select("id,title,file_name,description,is_public").eq("is_public", true).order("created_at", { ascending: false }).limit(1000)
      ]);
      if (pageResult.error) throw pageResult.error;
      if (sectionsResult.error) throw sectionsResult.error;
      if (materialsResult.error) throw materialsResult.error;
      const page = pageResult.data || {};
      document.getElementById("homepageTitle").value = page.home_title || "رحلتك إلى التميز تبدأ من هنا";
      document.getElementById("homepageSubtitle").value = page.home_subtitle || "تعلّم .. اقرأ .. واكتشف جمال لغتنا العربية";
      document.getElementById("homepageDescription").value = page.content || "منصة ضاد مساحة تعليمية عربية تجمع الموارد والملفات والأنشطة التي يحتاج إليها معلم اللغة العربية والطالب وولي الأمر، وتسهّل الوصول إليها وتنظيمها في مكان واحد.";
      document.getElementById("homepageVisible").checked = page.is_visible !== false;
      homepageSections = sectionsResult.data || [];
      homepageMaterials = materialsResult.data || [];
      await loadHomepageSectionLinks();
      renderHomepageParentOptions();
      renderHomepageSections();
      const order = document.getElementById("homepageSectionOrder");
      if (order) order.value = String(homepageSections.length + 1);
      setHomepageStatus("تم تحميل بيانات الصفحة الرئيسية والأقسام.", "success");
    } catch (error) {
      setHomepageStatus("تعذر تحميل بيانات الصفحة الرئيسية: " + (error.message || "خطأ غير معروف"), "error");
      const list = document.getElementById("homepageSectionsList");
      if (list) list.innerHTML = '<div class="homepage-empty">تعذر تحميل الأقسام. تحقق من اتصال Supabase وسياسات الوصول.</div>';
    }
  }

  function bindHomepageForms() {
    document.getElementById("homepageHeroForm")?.addEventListener("submit", saveHomepageHero);
    document.getElementById("homepageSectionForm")?.addEventListener("submit", saveHomepageSection);
    document.getElementById("homepageSectionType")?.addEventListener("change", updateHomepageSectionEditor);
    ["homepageSectionTitle", "homepageSectionDescription", "homepageSectionContent"].forEach(id => document.getElementById(id)?.addEventListener("input", previewHomepageSection));
    document.getElementById("homepageSectionFile")?.addEventListener("change", previewHomepageSection);
    updateHomepageSectionEditor();
  }

  async function saveHomepageHero(event) {
    event.preventDefault();
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const title = document.getElementById("homepageTitle").value.trim();
    const subtitle = document.getElementById("homepageSubtitle").value.trim();
    const content = document.getElementById("homepageDescription").value.trim();
    if (!title) return setHomepageStatus("أدخل العنوان الترحيبي أولًا.", "error");
    if (!content) return setHomepageStatus("اكتب وصف المنصة قبل الحفظ.", "error");
    setHomepageStatus("جارٍ حفظ بيانات الواجهة...");
    const payload = {
      slug: HOMEPAGE_DESCRIPTION_SLUG,
      title: "وصف منصة ضاد",
      content,
      is_visible: document.getElementById("homepageVisible").checked,
      home_title: title,
      home_subtitle: subtitle,
      updated_at: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from("site_pages").upsert(payload, { onConflict: "slug" });
      if (error) throw error;
      await logAdminAction("homepage_hero_updated","site_page",HOMEPAGE_DESCRIPTION_SLUG,{title,subtitle});
      setHomepageStatus("تم حفظ العنوان والوصف بنجاح. ستظهر التغييرات للزوار عند تحديث الصفحة.", "success");
    } catch (error) {
      setHomepageStatus("تعذر حفظ بيانات الواجهة: " + (error?.message || "خطأ غير معروف"), "error");
    }
  }

  function updateHomepageSectionEditor() {
    const type = document.getElementById("homepageSectionType")?.value || "text";
    const fileWrap = document.getElementById("homepageSectionFileWrap");
    const label = document.getElementById("homepageSectionContentLabel");
    const content = document.getElementById("homepageSectionContent");
    if (fileWrap) fileWrap.hidden = !["image", "file"].includes(type);
    if (label) label.textContent = ({ text: "المحتوى النصي", image: "وصف الصورة (اختياري)", file: "وصف الملف (اختياري)", link: "رابط المحتوى" })[type];
    if (content) {
      content.required = type === "text" || type === "link";
      content.placeholder = type === "link" ? "https://example.com" : "اكتب المحتوى أو الوصف...";
    }
    const file = document.getElementById("homepageSectionFile");
    if (file) file.accept = type === "image" ? "image/*" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.mp4,.webm,.zip";
    previewHomepageSection();
  }

  let homepagePreviewObjectUrl = null;

  function previewHomepageSection() {
    const box = document.getElementById("homepageSectionPreview");
    if (!box) return;
    if (homepagePreviewObjectUrl) {
      URL.revokeObjectURL(homepagePreviewObjectUrl);
      homepagePreviewObjectUrl = null;
    }

    const title = document.getElementById("homepageSectionTitle")?.value.trim() || "عنوان القسم";
    const description = document.getElementById("homepageSectionDescription")?.value.trim() || "";
    const type = document.getElementById("homepageSectionType")?.value || "text";
    const content = document.getElementById("homepageSectionContent")?.value.trim() || "";
    const file = document.getElementById("homepageSectionFile")?.files?.[0] || null;
    const old = homepageSections.find(row => String(row.id) === String(homepageEditingId));
    const filePath = file ? "" : (old?.content_type === type ? (old?.file_path || "") : "");
    const fileName = file?.name || (filePath ? filePath.split("/").pop() : "");
    const fileSize = file ? numberFormat(Math.ceil(file.size / 1024)) + " كيلوبايت" : "";
    let media = "";

    if (type === "materials") {
      media = '<div class="homepage-preview-meta">سيظهر هنا عدد الملفات التي تختار ربطها بهذا القسم.</div>';
    } else if (type === "image") {
      let imageUrl = "";
      if (file && file.type.startsWith("image/")) {
        homepagePreviewObjectUrl = URL.createObjectURL(file);
        imageUrl = homepagePreviewObjectUrl;
      } else if (filePath) {
        imageUrl = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(filePath).data?.publicUrl || "";
      }
      if (imageUrl) {
        media = '<img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(title) + '" style="display:block;max-width:100%;max-height:220px;object-fit:contain;border-radius:9px;margin:10px 0">';
      } else {
        media = '<div class="homepage-preview-meta">اختر صورة لمعاينتها هنا.</div>';
      }
    } else if (type === "file") {
      const details = fileName ? '<strong>' + escapeHtml(fileName) + '</strong>' + (fileSize ? '<small>' + escapeHtml(fileSize) + '</small>' : '') : '<span>لم يتم اختيار ملف بعد.</span>';
      let fileUrl = "";
      if (filePath) fileUrl = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(filePath).data?.publicUrl || "";
      media = '<div class="homepage-preview-file">📄 ' + details + (fileUrl ? '<a href="' + escapeHtml(fileUrl) + '" target="_blank" rel="noopener noreferrer">فتح الملف الحالي</a>' : '') + '</div>';
    } else if (type === "link") {
      media = content && /^https?:\/\//i.test(content)
        ? '<a href="' + escapeHtml(content) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(content) + '</a>'
        : '<span>أدخل رابطًا صحيحًا يبدأ بـ http:// أو https://</span>';
    } else {
      media = '<div>' + escapeHtml(content || "اكتب محتوى القسم لمعاينته هنا.") + '</div>';
    }

    box.innerHTML = '<strong>' + escapeHtml(title) + '</strong>' + (description ? '<div class="homepage-preview-content">' + escapeHtml(description) + '</div>' : '') + '<div class="homepage-preview-content">' + media + '</div>';
  }

  function resetHomepageSectionForm() {
    const form = document.getElementById("homepageSectionForm");
    if (!form) return;
    form.reset();
    homepageEditingId = null;
    document.getElementById("homepageSectionId").value = "";
    document.getElementById("homepageSectionFormTitle").textContent = "إضافة قسم جديد";
    document.getElementById("homepageSectionOrder").value = String(homepageSections.length + 1);
    document.getElementById("homepageSectionLimit").value = "6";
    document.getElementById("homepageSectionStyle").value = "grid";
    document.getElementById("homepageSectionActive").checked = true;
    document.getElementById("homepageSectionShowOnHome").checked = true;
    document.getElementById("homepageSectionDescription").value = "";
    document.getElementById("homepageSectionParent").value = "";
    document.getElementById("homepageSectionIcon").value = "";
    document.getElementById("homepageSectionCurrentFile").textContent = "";
    renderHomepageParentOptions();
    updateHomepageSectionEditor();
  }

  function renderHomepageParentOptions() {
    const select = document.getElementById("homepageSectionParent");
    if (!select) return;
    const editingId = homepageEditingId === null ? null : String(homepageEditingId);
    const descendants = new Set();
    const collect = parentId => homepageSections.forEach(row => {
      if (String(row.parent_id ?? "") === String(parentId) && !descendants.has(String(row.id))) {
        descendants.add(String(row.id));
        collect(row.id);
      }
    });
    if (editingId !== null) collect(editingId);
    const current = select.value;
    const options = homepageSections
      .filter(row => String(row.id) !== editingId && !descendants.has(String(row.id)))
      .map(row => '<option value="' + escapeHtml(row.id) + '">' + escapeHtml(row.title || "قسم دون عنوان") + '</option>')
      .join("");
    select.innerHTML = '<option value="">قسم رئيسي (دون أب)</option>' + options;
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  async function loadHomepageSectionLinks() {
    homepageSectionLinks = {};
    if (!homepageSections.length) return;
    const sectionIds = homepageSections.map(row => row.id);
    const { data, error } = await supabase.from("home_section_materials")
      .select("section_id,material_id,sort_order")
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    (data || []).forEach(link => {
      (homepageSectionLinks[String(link.section_id)] ||= []).push(link);
    });
  }

  async function saveHomepageSectionLinks(sectionId) {
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const select = document.querySelector('[data-homepage-materials="' + String(sectionId) + '"]');
    if (!select) return setHomepageStatus("تعذر العثور على قائمة الملفات لهذا القسم.", "error");
    const selected = Array.from(select.selectedOptions).map(option => String(option.value));
    const allowed = new Set(homepageMaterials.map(item => String(item.id)));
    if (selected.some(id => !allowed.has(id))) return setHomepageStatus("تتضمن القائمة ملفًا غير متاح. حدّث البيانات ثم حاول مجددًا.", "error");
    try {
      setHomepageStatus("جارٍ تحديث الملفات المرتبطة بالقسم...");
      const { data: existingRows, error: readError } = await supabase.from("home_section_materials")
        .select("material_id")
        .eq("section_id", sectionId);
      if (readError) throw readError;
      const current = (existingRows || []).map(row => String(row.material_id));
      const added = selected.filter(id => !current.includes(id));
      const removed = current.filter(id => !selected.includes(id));
      if (added.length) {
        const rows = added.map(id => ({ section_id: sectionId, material_id: id, sort_order: selected.indexOf(id) }));
        const { error } = await supabase.from("home_section_materials").insert(rows);
        if (error) throw error;
      }
      for (const id of selected.filter(value => current.includes(value))) {
        const { error } = await supabase.from("home_section_materials")
          .update({ sort_order: selected.indexOf(id) })
          .eq("section_id", sectionId).eq("material_id", id);
        if (error) throw error;
      }
      if (removed.length) {
        const { error } = await supabase.from("home_section_materials")
          .delete().eq("section_id", sectionId).in("material_id", removed);
        if (error) throw error;
      }
      await loadHomepageSectionLinks();
      renderHomepageSections();
      await logAdminAction("homepage_section_materials_updated","home_section",sectionId,{linked_count:selected.length,added_count:added.length,removed_count:removed.length});
      setHomepageStatus("تم تحديث الملفات المرتبطة. لم يتم حذف أي ملف من المكتبة أو التخزين.", "success");
    } catch (error) {
      setHomepageStatus("تعذر تحديث الملفات المرتبطة: " + (error?.message || "خطأ غير معروف"), "error");
    }
  }

  function renderHomepageSections() {
    const list = document.getElementById("homepageSectionsList");
    if (!list) return;
    if (!homepageSections.length) {
      list.innerHTML = '<div class="homepage-empty">لا توجد أقسام حتى الآن. يمكنك إنشاء أول قسم من النموذج المجاور.</div>';
      return;
    }
    list.innerHTML = homepageSections.map(row => {
      const parent = homepageSections.find(item => String(item.id) === String(row.parent_id));
      const linkedRows = homepageSectionLinks[String(row.id)] || [];
      const linkedOrder = new Map(linkedRows.map(link => [String(link.material_id), Number(link.sort_order || 0)]));
      const sortedMaterials = [...homepageMaterials].sort((a, b) => {
        const aLinked = linkedOrder.has(String(a.id)), bLinked = linkedOrder.has(String(b.id));
        if (aLinked && bLinked) return linkedOrder.get(String(a.id)) - linkedOrder.get(String(b.id));
        if (aLinked) return -1;
        if (bLinked) return 1;
        return String(a.title || a.file_name || "").localeCompare(String(b.title || b.file_name || ""), "ar");
      });
      return `
      <article class="homepage-section-item">
        <div class="homepage-section-info"><strong>${escapeHtml(row.icon || "▣")} ${escapeHtml(row.title || "قسم دون عنوان")}</strong><small>${parent ? "يتبع: " + escapeHtml(parent.title) + " · " : "قسم رئيسي · "}النوع: ${escapeHtml(row.content_type)} · الترتيب: ${numberFormat(row.sort_order)} · ${row.is_active ? "مفعّل" : "معطّل"} · ${row.show_on_home === false ? "غير معروض في الرئيسية" : "معروض في الرئيسية"}</small></div>
        <div class="homepage-section-actions">
          <button type="button" data-homepage-action="edit" data-id="${escapeHtml(row.id)}">تعديل</button>
          <button type="button" data-homepage-action="toggle" data-id="${escapeHtml(row.id)}">${row.is_active ? "إخفاء" : "إظهار"}</button>
          <button type="button" class="danger" data-homepage-action="delete" data-id="${escapeHtml(row.id)}">حذف</button>
        </div>
        <details class="homepage-links-manager">
          <summary>الملفات المرتبطة (${linkedRows.length})</summary>
          <p>اختر الملفات المنشورة التي تريد عرضها داخل هذا القسم. يمكنك تحديد أكثر من ملف، وإعادة ترتيبها من خلال ترتيب الاختيار.</p>
          <select multiple size="6" data-homepage-materials="${escapeHtml(row.id)}" aria-label="الملفات المرتبطة بالقسم">
            ${sortedMaterials.map(material => '<option value="' + escapeHtml(material.id) + '" ' + (linkedOrder.has(String(material.id)) ? "selected" : "") + '>' + escapeHtml(material.title || material.file_name || "ملف تعليمي") + '</option>').join("")}
          </select>
          ${homepageMaterials.length ? "" : '<small>لا توجد ملفات منشورة متاحة للربط حاليًا.</small>'}
          <button type="button" class="homepage-secondary" data-homepage-links-save="${escapeHtml(row.id)}">حفظ الملفات المرتبطة</button>
        </details>
      </article>`;
    }).join("");
  }

  function editHomepageSection(id) {
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const row = homepageSections.find(item => String(item.id) === String(id));
    if (!row) return setHomepageStatus("لم يتم العثور على القسم المطلوب.", "error");
    homepageEditingId = row.id;
    renderHomepageParentOptions();
    document.getElementById("homepageSectionId").value = String(row.id);
    document.getElementById("homepageSectionParent").value = row.parent_id == null ? "" : String(row.parent_id);
    document.getElementById("homepageSectionIcon").value = row.icon || "";
    document.getElementById("homepageSectionTitle").value = row.title || "";
    document.getElementById("homepageSectionDescription").value = row.section_description || "";
    document.getElementById("homepageSectionType").value = row.content_type || "text";
    document.getElementById("homepageSectionContent").value = row.content || "";
    document.getElementById("homepageSectionOrder").value = String(row.sort_order || 0);
    document.getElementById("homepageSectionLimit").value = String(row.display_limit || 6);
    document.getElementById("homepageSectionStyle").value = row.display_style === "list" ? "list" : "grid";
    document.getElementById("homepageSectionActive").checked = !!row.is_active;
    document.getElementById("homepageSectionShowOnHome").checked = row.show_on_home !== false;
    document.getElementById("homepageSectionCurrentFile").textContent = row.file_path ? "الملف الحالي: " + row.file_path : "لا يوجد ملف مرتبط حاليًا.";
    document.getElementById("homepageSectionFormTitle").textContent = "تعديل القسم";
    updateHomepageSectionEditor();
    document.getElementById("homepageSectionForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveHomepageSection(event) {
    event.preventDefault();
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const title = document.getElementById("homepageSectionTitle").value.trim();
    const type = document.getElementById("homepageSectionType").value;
    const content = document.getElementById("homepageSectionContent").value.trim();
    const sortOrder = Number(document.getElementById("homepageSectionOrder").value);
    const displayLimit = Number(document.getElementById("homepageSectionLimit").value);
    const displayStyle = document.getElementById("homepageSectionStyle").value === "list" ? "list" : "grid";
    const active = document.getElementById("homepageSectionActive").checked;
    const showOnHome = document.getElementById("homepageSectionShowOnHome").checked;
    const sectionDescription = document.getElementById("homepageSectionDescription").value.trim();
    const parentValue = document.getElementById("homepageSectionParent").value;
    const parentId = parentValue || null;
    const icon = document.getElementById("homepageSectionIcon").value.trim();
    const file = document.getElementById("homepageSectionFile").files?.[0] || null;
    const old = homepageSections.find(row => String(row.id) === String(homepageEditingId));

    if (!title) return setHomepageStatus("أدخل عنوان القسم.", "error");
    if (parentId !== null && !homepageSections.some(row => String(row.id) === parentId)) return setHomepageStatus("القسم الأب المحدد غير صالح. حدّث القائمة وحاول مجددًا.", "error");
    if (parentId !== null && (String(parentId) === String(homepageEditingId) || (() => {
      let current = homepageSections.find(row => String(row.id) === parentId);
      const visited = new Set();
      while (current && !visited.has(String(current.id))) {
        visited.add(String(current.id));
        if (String(current.id) === String(homepageEditingId)) return true;
        current = homepageSections.find(row => String(row.id) === String(current.parent_id));
      }
      return false;
    })())) return setHomepageStatus("لا يمكن وضع القسم داخل نفسه أو داخل أحد أقسامه الفرعية.", "error");
    if (!["text", "image", "file", "link", "materials"].includes(type)) return setHomepageStatus("نوع المحتوى غير صالح.", "error");
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return setHomepageStatus("أدخل ترتيبًا صحيحًا يبدأ من صفر.", "error");
    if (!Number.isInteger(displayLimit) || displayLimit < 1 || displayLimit > 50) return setHomepageStatus("عدد الملفات المرتبطة يجب أن يكون بين 1 و50.", "error");
    if ((type === "text" || type === "link") && !content) return setHomepageStatus("أدخل محتوى القسم أو رابطه.", "error");
    if (type === "link") {
      try {
        const url = new URL(content);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return setHomepageStatus("الرابط غير صالح. استخدم رابطًا يبدأ بـ http:// أو https://.", "error");
      }
    }
    if (type === "image" && file && !file.type.startsWith("image/")) return setHomepageStatus("اختر ملف صورة صالحًا.", "error");
    if ((type === "image" || type === "file") && file && file.size > 50 * 1024 * 1024) return setHomepageStatus("الحد الأعلى لحجم الملف 50 ميجابايت.", "error");
    const needsFile = type === "image" || type === "file";
    if (needsFile && !file && (!old?.file_path || old.content_type !== type)) return setHomepageStatus("اختر صورة أو ملفًا مناسبًا لنوع المحتوى المحدد.", "error");

    setHomepageStatus("جارٍ حفظ القسم...");
    let filePath = needsFile ? (old?.content_type === type ? (old?.file_path || null) : null) : null;
    let uploadedNewFile = false;
    let recordSaved = false;
    try {
      if (needsFile && file) {
        const safeName = file.name.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 120) || "file";
        const path = "home-sections/" + crypto.randomUUID() + "-" + safeName;
        const { data, error } = await supabase.storage.from(MATERIALS_BUCKET).upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
        if (error) throw new Error("تعذر رفع الملف: " + error.message);
        filePath = data?.path || path;
        uploadedNewFile = true;
      }

      const payload = {
        title, content_type: type, content,
        section_description: sectionDescription,
        show_on_home: showOnHome,
        parent_id: parentId,
        icon: icon || "folder",
        file_path: filePath || "",
        sort_order: sortOrder, display_limit: displayLimit,
        display_style: displayStyle, is_active: active,
        updated_at: new Date().toISOString()
      };
      const result = homepageEditingId
        ? await supabase.from("home_sections").update(payload).eq("id", homepageEditingId).select("id").maybeSingle()
        : await supabase.from("home_sections").insert(payload).select("id").single();
      if (result.error || !result.data) throw new Error(result.error?.message || "لم تؤكد قاعدة البيانات حفظ القسم.");
      recordSaved = true;
      await logAdminAction(homepageEditingId?"homepage_section_updated":"homepage_section_created","home_section",result.data.id,{title,content_type:type});

      resetHomepageSectionForm();
      await loadHomepageSectionsOnly();
      setHomepageStatus("تم حفظ القسم بنجاح.", "success");
    } catch (error) {
      if (!recordSaved && uploadedNewFile && filePath) {
        const { error: cleanupError } = await supabase.storage.from(MATERIALS_BUCKET).remove([filePath]);
        if (cleanupError) console.warn("تعذر تنظيف الملف المرفوع بعد فشل الحفظ:", cleanupError);
      }
      setHomepageStatus(recordSaved
        ? "تم حفظ القسم، لكن تعذر تحديث القائمة: " + (error?.message || "خطأ غير معروف")
        : "تعذر حفظ القسم: " + (error?.message || "خطأ غير معروف"), "error");
    }
  }

  async function loadHomepageSectionsOnly() {
    try {
      const { data, error } = await supabase.from("home_sections")
        .select("id,title,content_type,content,file_path,sort_order,is_active,display_limit,display_style,section_description,show_on_home,parent_id,icon,created_at")
        .order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      homepageSections = data || [];
      renderHomepageParentOptions();
      renderHomepageSections();
      const order = document.getElementById("homepageSectionOrder");
      if (order) order.value = String(homepageSections.length + 1);
    } catch (error) {
      setHomepageStatus("تعذر تحديث قائمة الأقسام: " + (error?.message || "خطأ غير معروف"), "error");
      throw error;
    }
  }

  async function toggleHomepageSection(id) {
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const row = homepageSections.find(item => String(item.id) === String(id));
    if (!row) return;
    let changed = false;
    try {
      const { data, error } = await supabase.from("home_sections")
        .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
        .eq("id", row.id).select("id").maybeSingle();
      if (error || !data) throw new Error(error?.message || "لم تؤكد قاعدة البيانات التغيير.");
      changed = true;
      await logAdminAction("homepage_section_visibility_changed","home_section",id,{is_active:!row.is_active});
      await loadHomepageSectionsOnly();
      setHomepageStatus(row.is_active ? "تم إخفاء القسم عن الزوار." : "تم إظهار القسم للزوار.", "success");
    } catch (error) {
      setHomepageStatus((changed ? "تم تغيير حالة القسم، لكن تعذر تحديث القائمة: " : "تعذر تغيير حالة القسم: ") + (error?.message || "خطأ غير معروف"), "error");
    }
  }

  async function deleteHomepageSection(id) {
    if (accessState?.owner !== true) return setHomepageStatus("هذه العملية متاحة لمالك المنصة فقط.", "error");
    const row = homepageSections.find(item => String(item.id) === String(id));
    if (!row) return;
    if (homepageSections.some(item => String(item.parent_id) === String(row.id))) {
      return setHomepageStatus("لا يمكن حذف هذا القسم قبل نقل أقسامه الفرعية إلى قسم آخر أو جعلها أقسامًا رئيسية.", "error");
    }
    if (!window.confirm("هل تريد حذف القسم «" + row.title + "»؟ لن يُحذف الملف من مساحة التخزين.")) return;
    let deleted = false;
    try {
      const { data, error } = await supabase.from("home_sections").delete().eq("id", row.id).select("id").maybeSingle();
      if (error || !data) throw new Error(error?.message || "لم تؤكد قاعدة البيانات الحذف.");
      deleted = true;
      await logAdminAction("homepage_section_deleted","home_section",id,{title:row.title});
      await loadHomepageSectionsOnly();
      setHomepageStatus("تم حذف القسم. بقي الملف في مساحة التخزين دون حذف.", "success");
    } catch (error) {
      setHomepageStatus((deleted ? "تم حذف القسم، لكن تعذر تحديث القائمة: " : "تعذر حذف القسم: ") + (error?.message || "خطأ غير معروف"), "error");
    }
  }


  function moduleError(root, message) {
    if (root) root.innerHTML = '<div class="data-error">' + escapeHtml(message) + '</div>';
  }
  function showModuleError(error) {
    const root = document.getElementById("moduleView");
    moduleError(root, error?.message || "حدث خطأ غير متوقع.");
  }
  function ownerCanWrite() { return accessState?.owner === true; }
  async function logAdminAction(action, targetType = "", targetId = "", details = {}) {
    try {
      await supabase.functions.invoke("admin-control", {
        body: { action: "audit_record", audit_action: action, target_type: targetType, target_id: String(targetId || ""), details }
      });
    } catch (error) {
      console.warn("تعذر تسجيل العملية في سجل الإدارة:", error);
    }
  }
  function ownerNotice() {
    return '<p class="data-note">العرض متاح، أما التعديل والحفظ فيتطلبان حساب مالك المنصة وفق صلاحيات قاعدة البيانات الحالية.</p>';
  }
  async function handleAdminAction(button) {
    const action = button.dataset.adminAction;
    const id = button.dataset.id;
    const kind = button.dataset.kind;
    if (action === "material-edit") {
      if (!["owner","admin"].includes(accessState?.role) && !ownerCanWrite()) throw new Error("صلاحية غير كافية.");
      const row = window.__adminModuleMaterials?.find(item => String(item.id) === String(id));
      if (!row) throw new Error("لم يتم العثور على الملف.");
      const title = window.prompt("عنوان الملف:", row.title || "");
      if (title === null) return;
      const description = window.prompt("الوصف التفصيلي للملف:", row.description || "");
      if (description === null) return;
      const contentSummary = window.prompt("ملخص محتوى الملف:", row.content_summary || "");
      if (contentSummary === null) return;
      const learningObjectives = window.prompt("الأهداف التعليمية:", row.learning_objectives || "");
      if (learningObjectives === null) return;
      const targetAudience = window.prompt("الفئة المستهدفة:", row.target_audience || "");
      if (targetAudience === null) return;
      const pageCountText = window.prompt("عدد الصفحات (اتركه فارغًا إن لم يكن معروفًا):", row.page_count == null ? "" : String(row.page_count));
      if (pageCountText === null) return;
      const pageCount = pageCountText.trim() ? Number(pageCountText) : null;
      if (!title.trim()) throw new Error("عنوان الملف مطلوب.");
      if (pageCount !== null && (!Number.isInteger(pageCount) || pageCount < 1)) throw new Error("عدد الصفحات يجب أن يكون عددًا صحيحًا أكبر من صفر.");
      const { error } = await supabase.from("materials").update({
        title: title.trim(), description: description.trim(), content_summary: contentSummary.trim(),
        learning_objectives: learningObjectives.trim(), target_audience: targetAudience.trim(),
        page_count: pageCount, updated_at: new Date().toISOString()
      }).eq("id", id);
      if (error) throw error;
      await logAdminAction("material_updated","material",id,{title:title.trim(),description_length:description.trim().length});
      await loadMaterials(activeModule);
      return;
    }
    if (action === "material-toggle") {
      const row = window.__adminModuleMaterials?.find(item => String(item.id) === String(id));
      if (!row) throw new Error("لم يتم العثور على الملف.");
      const { data, error } = await supabase.from("materials")
        .update({ is_public: !row.is_public, updated_at: new Date().toISOString() })
        .eq("id", id).select("id").maybeSingle();
      if (error || !data) throw new Error(error?.message || "لم تؤكد قاعدة البيانات تغيير حالة النشر.");
      await logAdminAction("material_visibility_changed","material",id,{is_public:!row.is_public});
      await loadMaterials(activeModule);
      return;
    }
    if (action === "lookup-add" || action === "lookup-edit") {
      if (!ownerCanWrite()) throw new Error("إضافة وتعديل التصنيفات والصفوف والفصول متاحة للمالك فقط.");
      await editLookupRecord(kind, action === "lookup-edit" ? id : null);
      return;
    }
    if (action === "lookup-delete") {
      if (!ownerCanWrite()) throw new Error("حذف السجلات الأكاديمية متاح للمالك فقط.");
      if (!window.confirm("هل تريد حذف هذا السجل؟ إذا كان مرتبطًا بملفات فلن تسمح قاعدة البيانات بحذفه.")) return;
      const table = ({category:"categories",grade:"grades",semester:"semesters"})[kind];
      if (!table) throw new Error("نوع السجل غير معروف.");
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await logAdminAction("lookup_deleted",kind,id);
      if (activeModule === "academic") await loadAcademic(); else await loadSections();
      return;
    }
    if (action === "feature-load") {
      await loadFeatureEditor(button.dataset.slug);
      return;
    }
    if (action === "material-trash") {
      if (!["owner","admin"].includes(accessState?.role)) throw new Error("هذه العملية متاحة للحسابات الإدارية المعتمدة فقط.");
      if (!window.confirm("سيُنقل الملف إلى سلة المحذوفات ويُخفى عن الزوار، دون حذف ملف التخزين. متابعة؟")) return;
      const {data,error}=await supabase.functions.invoke("admin-control",{body:{action:"trash_material",id}});
      if(error||data?.error) throw new Error(data?.detail||data?.error||error.message);
      await loadMaterials(activeModule);
      return;
    }
    if (action === "trash-restore" || action === "trash-purge") {
      if (!ownerCanWrite()) throw new Error("إدارة سلة المحذوفات متاحة لمالك المنصة فقط.");
      if (action === "trash-purge" && !window.confirm("تحذير: سيُحذف سجل الملف وروابطه وملف التخزين نهائيًا. لا يمكن التراجع. هل تريد المتابعة؟")) return;
      const edgeAction=action==="trash-restore"?"trash_restore":"trash_purge";
      const {data,error}=await supabase.functions.invoke("admin-control",{body:{action:edgeAction,id}});
      if(error||data?.error) throw new Error(data?.detail||data?.error||error.message);
      await loadTrash();
      return;
    }
    if (action === "seo-edit") {
      const row=(window.__adminSeoEntries||[]).find(item=>item.page_path===id);
      if(!row) throw new Error("لم يتم العثور على إعداد SEO.");
      document.getElementById("seoPath").value=row.page_path;
      document.getElementById("seoTitle").value=row.page_title||"";
      document.getElementById("seoDescription").value=row.meta_description||"";
      document.getElementById("seoCanonical").value=row.canonical_url||"";
      document.getElementById("seoRobots").value=row.robots||"index,follow";
      document.getElementById("seoOgTitle").value=row.og_title||"";
      document.getElementById("seoOgDescription").value=row.og_description||"";
      document.getElementById("seoOgImage").value=row.og_image_url||"";
      document.getElementById("seoPublished").checked=!!row.is_published;
      document.getElementById("seoPath").disabled=true;
      document.getElementById("seoForm").scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    if (action === "seo-delete") {
      if(!ownerCanWrite()) throw new Error("إدارة SEO متاحة لمالك المنصة فقط.");
      if(!window.confirm("هل تريد حذف بيانات SEO لهذه الصفحة؟"))return;
      const {error}=await supabase.from("site_seo").delete().eq("page_path",id);
      if(error)throw error;
      await logAdminAction("seo_metadata_deleted","site_seo",id);
      await loadSeo();
      return;
    }
  }

  async function editLookupRecord(kind, id) {
    const table = ({category:"categories",grade:"grades",semester:"semesters"})[kind];
    if (!table) throw new Error("نوع السجل غير معروف.");
    const isNew = !id;
    const { data: current, error: readError } = isNew ? {data:null,error:null} :
      await supabase.from(table).select("*").eq("id", id).single();
    if (readError) throw readError;
    const name = window.prompt("الاسم:", current?.name || "");
    if (name === null) return;
    if (!name.trim()) throw new Error("الاسم مطلوب.");
    const sort = window.prompt("رقم الترتيب:", String(current?.sort_order ?? 0));
    if (sort === null) return;
    const sortOrder = Number(sort);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) throw new Error("رقم الترتيب يجب أن يكون صفرًا أو أكبر.");
    const payload = { name: name.trim(), sort_order: sortOrder };
    if (kind === "category" || kind === "grade") {
      const slug = window.prompt("الرابط المختصر (slug):", current?.slug || "");
      if (slug === null) return;
      if (!/^[a-z0-9-]+$/.test(slug.trim())) throw new Error("الرابط المختصر يجب أن يتكون من حروف إنجليزية صغيرة وأرقام وشرطة فقط.");
      payload.slug = slug.trim();
    }
    if (kind === "grade") {
      payload.emoji = (window.prompt("رمز الصف (اختياري):", current?.emoji || "📘") ?? current?.emoji ?? "📘").trim().slice(0,8);
    }
    const result = isNew
      ? await supabase.from(table).insert(payload)
      : await supabase.from(table).update(payload).eq("id", id);
    if (result.error) throw result.error;
    await logAdminAction(isNew?"lookup_created":"lookup_updated",kind,id||payload.slug||payload.name,{name:payload.name});
    if (activeModule === "academic") await loadAcademic(); else await loadSections();
  }

  async function loadAcademic() {
    const root = document.getElementById("moduleView");
    root.innerHTML = '<div class="data-loading">جارٍ تحميل الصفوف والفصول…</div>';
    const [grades, semesters] = await Promise.all([
      supabase.from("grades").select("id,name,slug,sort_order,emoji").order("sort_order"),
      supabase.from("semesters").select("id,name,sort_order").order("sort_order")
    ]);
    if (grades.error || semesters.error) return moduleError(root, (grades.error || semesters.error).message);
    const writable = ownerCanWrite();
    const actions = (kind,row) => writable ?
      '<button type="button" data-admin-action="lookup-edit" data-kind="'+kind+'" data-id="'+row.id+'">تعديل</button> <button type="button" data-admin-action="lookup-delete" data-kind="'+kind+'" data-id="'+row.id+'">حذف</button>' : "—";
    const gradeRows = (grades.data || []).map(row => '<tr><td>'+escapeHtml(row.name)+'</td><td>'+escapeHtml(row.slug)+'</td><td>'+escapeHtml(row.emoji || "📘")+'</td><td>'+Number(row.sort_order||0)+'</td><td>'+actions("grade",row)+'</td></tr>').join("");
    const semesterRows = (semesters.data || []).map(row => '<tr><td>'+escapeHtml(row.name)+'</td><td>'+Number(row.sort_order||0)+'</td><td>'+actions("semester",row)+'</td></tr>').join("");
    root.innerHTML = '<section class="data-module"><div class="data-module-head"><div><h2>الصفوف الدراسية</h2><p>إدارة جدول grades مع المحافظة على ارتباط الملفات.</p></div><span class="data-count">'+numberFormat((grades.data||[]).length)+' صف</span></div>' +
      (writable ? '<button type="button" data-admin-action="lookup-add" data-kind="grade">إضافة صف</button>' : '') +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>الصف</th><th>الرابط</th><th>الرمز</th><th>الترتيب</th><th>الإجراءات</th></tr></thead><tbody>'+ (gradeRows || '<tr><td colspan="5">لا توجد صفوف.</td></tr>') + '</tbody></table></div>' +
      '<div class="data-module-head"><div><h2>الفصول الدراسية</h2><p>إدارة جدول semesters.</p></div><span class="data-count">'+numberFormat((semesters.data||[]).length)+' فصل</span></div>' +
      (writable ? '<button type="button" data-admin-action="lookup-add" data-kind="semester">إضافة فصل</button>' : '') +
      '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>الفصل</th><th>الترتيب</th><th>الإجراءات</th></tr></thead><tbody>'+ (semesterRows || '<tr><td colspan="3">لا توجد فصول.</td></tr>') + '</tbody></table></div>' +
      (writable ? '<p class="data-note">تُرفض عمليات الحذف تلقائيًا إذا كان السجل مرتبطًا بملفات تعليمية.</p>' : ownerNotice()) + '</section>';
  }

  async function loadPages() {
    const root = document.getElementById("moduleView");
    root.innerHTML = '<div class="data-loading">جارٍ تحميل صفحات الموقع وروابط التواصل…</div>';
    const [pages, links] = await Promise.all([
      supabase.from("site_pages").select("id,slug,title,content,is_visible,updated_at").order("slug"),
      supabase.from("site_contact_links").select("key,title,url,sort_order").order("sort_order")
    ]);
    if (pages.error || links.error) return moduleError(root, (pages.error || links.error).message);
    const writable = ownerCanWrite();
    const pageOptions = (pages.data||[]).map(row=>'<option value="'+escapeHtml(row.slug)+'">'+escapeHtml(row.title)+' ('+escapeHtml(row.slug)+')</option>').join("");
    const contactRows = (links.data||[]).map(row=>'<tr><td>'+escapeHtml(row.title)+'</td><td><input data-contact-url="'+escapeHtml(row.key)+'" value="'+escapeHtml(row.url||'')+'" '+(!writable?'disabled':'')+'></td></tr>').join("");
    root.innerHTML = '<section class="data-module"><div class="data-module-head"><div><h2>محتوى الصفحات</h2><p>تعديل النصوص المحفوظة في site_pages.</p></div><span class="data-count">'+numberFormat((pages.data||[]).length)+' صفحات</span></div>' +
      '<form id="adminPageForm"><label>الصفحة<select id="adminPageSlug">'+pageOptions+'</select></label><label>العنوان<input id="adminPageTitle" maxlength="180" '+(!writable?'disabled':'')+'></label><label>المحتوى<textarea id="adminPageContent" rows="12" '+(!writable?'disabled':'')+'></textarea></label><label><input id="adminPageVisible" type="checkbox" '+(!writable?'disabled':'')+'> إظهار الصفحة للزوار</label>' +
      (writable ? '<button type="submit">حفظ الصفحة</button>' : ownerNotice()) + '</form>' +
      '<div class="data-module-head"><div><h2>روابط التواصل</h2><p>تحديث روابط صفحات التواصل المحفوظة.</p></div></div>' +
      '<form id="adminContactForm"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>المنصة</th><th>الرابط</th></tr></thead><tbody>'+contactRows+'</tbody></table></div>'+(writable?'<button type="submit">حفظ روابط التواصل</button>':'')+'</form></section>';
    const select = document.getElementById("adminPageSlug");
    const populate = () => {
      const row = (pages.data||[]).find(item=>item.slug===select.value);
      document.getElementById("adminPageTitle").value = row?.title || "";
      document.getElementById("adminPageContent").value = row?.content || "";
      document.getElementById("adminPageVisible").checked = row?.is_visible !== false;
    };
    select.addEventListener("change", populate); populate();
    document.getElementById("adminPageForm").addEventListener("submit", async event => {
      event.preventDefault();
      if (!ownerCanWrite()) return moduleError(root,"حفظ صفحات الموقع متاح للمالك فقط.");
      const slug=select.value, row=(pages.data||[]).find(item=>item.slug===slug);
      if(!row)return;
      const {error}=await supabase.from("site_pages").update({
        title:document.getElementById("adminPageTitle").value.trim(),
        content:document.getElementById("adminPageContent").value,
        is_visible:document.getElementById("adminPageVisible").checked,
        updated_at:new Date().toISOString()
      }).eq("slug",slug);
      if(error)return moduleError(root,error.message);
      await logAdminAction("site_page_updated","site_page",slug,{title:document.getElementById("adminPageTitle").value.trim()});
      await loadPages();
    });
    document.getElementById("adminContactForm").addEventListener("submit", async event => {
      event.preventDefault();
      if (!ownerCanWrite()) return moduleError(root,"تعديل روابط التواصل متاح للمالك فقط.");
      const updates=[...root.querySelectorAll("[data-contact-url]")].map(input=>({key:input.dataset.contactUrl,url:input.value.trim()}));
      for(const item of updates){
        if(item.url && !/^(https?:\/\/|mailto:|tel:)/i.test(item.url)) return moduleError(root,"يجب أن يبدأ الرابط بـ https:// أو http:// أو mailto: أو tel:.");
        const {error}=await supabase.from("site_contact_links").update({url:item.url,updated_at:new Date().toISOString()}).eq("key",item.key);
        if(error)return moduleError(root,error.message);
      }
      await logAdminAction("contact_links_updated","site_contact_links","all",{count:updates.length});
      await loadPages();
    });
  }

  async function loadSettings() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل هوية المنصة…</div>';
    const {data,error}=await supabase.from("site_pages").select("title,content,updated_at").eq("slug","site-branding").maybeSingle();
    if(error)return moduleError(root,error.message);
    let branding={};
    try{branding=JSON.parse(data?.content||"{}");}catch(_){return moduleError(root,"بيانات هوية المنصة الحالية ليست JSON صالحًا. لم يتم تعديلها.");}
    const writable=ownerCanWrite();
    root.innerHTML='<section class="data-module"><h2>هوية منصة ضاد</h2><p>تعديل الاسم والشعار النصي والعبارة التعريفية. تبقى الصور الحالية محفوظة ولا تُحذف عند تعديل البيانات.</p><form id="adminBrandingForm"><label>اسم المنصة<input id="brandName" maxlength="100" '+(!writable?'disabled':'')+'></label><label>العبارة التعريفية<input id="brandTagline" maxlength="240" '+(!writable?'disabled':'')+'></label><label>الحرف أو الرمز<input id="brandMark" maxlength="8" '+(!writable?'disabled':'')+'></label><label>نص اعتماد المعلم<input id="brandTeacher" maxlength="180" '+(!writable?'disabled':'')+'></label><label>رابط تحميل التطبيق<input id="brandAppUrl" type="url" '+(!writable?'disabled':'')+'></label><label>مسار ملف الشعار الحالي<input id="brandLogoPath" '+(!writable?'disabled':'')+'></label><label>مسار خلفية الواجهة الحالية<input id="brandHeroPath" '+(!writable?'disabled':'')+'></label>'+(writable?'<button type="submit">حفظ إعدادات الهوية</button>':ownerNotice())+'</form><p class="data-note">لا تضع روابط خاصة أو رموز وصول هنا. مسارات الصور يجب أن تكون مسارات ملفات موجودة داخل حاوية materials.</p></section>';
    document.getElementById("brandName").value=branding.name||"ضـــاد";
    document.getElementById("brandTagline").value=branding.tagline||"";
    document.getElementById("brandMark").value=branding.mark||"ض";
    document.getElementById("brandTeacher").value=branding.teacherText||"";
    document.getElementById("brandAppUrl").value=branding.appDownloadUrl||"";
    document.getElementById("brandLogoPath").value=branding.logoPath||"";
    document.getElementById("brandHeroPath").value=branding.heroBackgroundPath||"";
    document.getElementById("adminBrandingForm").addEventListener("submit",async event=>{
      event.preventDefault();if(!ownerCanWrite())return;
      const appDownloadUrl=document.getElementById("brandAppUrl").value.trim();
      if(appDownloadUrl&&!/^https?:\/\//i.test(appDownloadUrl))return moduleError(root,"رابط التطبيق يجب أن يبدأ بـ https:// أو http://.");
      const next={...branding,
        name:document.getElementById("brandName").value.trim(),
        tagline:document.getElementById("brandTagline").value.trim(),
        mark:document.getElementById("brandMark").value.trim()||"ض",
        teacherText:document.getElementById("brandTeacher").value.trim(),
        appDownloadUrl,
        logoPath:document.getElementById("brandLogoPath").value.trim(),
        heroBackgroundPath:document.getElementById("brandHeroPath").value.trim()
      };
      if(!next.name)return moduleError(root,"اسم المنصة مطلوب.");
      const {error:saveError}=await supabase.from("site_pages").update({content:JSON.stringify(next),updated_at:new Date().toISOString()}).eq("slug","site-branding");
      if(saveError)return moduleError(root,saveError.message);
      await logAdminAction("site_branding_updated","site_page","site-branding",{name:next.name});
      moduleError(root,"تم حفظ إعدادات الهوية بنجاح. حدّث الموقع العام للتحقق من ظهورها.");
    });
  }

  const ADMIN_FEATURES = [
    ["dhad-games-v1","الألعاب التعليمية","array"],
    ["dhad-additional-items-v1","التعليم الإضافي","array"],
    ["dhad-calendar-items-v1","التقويم الدراسي","array"],
    ["dhad-certificate-v1","قالب الشهادة","object"],
    ["dhad-home-cards-v1","بطاقات الصفحة الرئيسية","array"]
  ];
  async function loadFeatureEditor(selectedSlug) {
    const root=document.getElementById("moduleView");
    const slug=selectedSlug||"dhad-games-v1";
    root.innerHTML='<div class="data-loading">جارٍ تحميل بيانات الأنشطة…</div>';
    const [rowsResult]=await Promise.all([supabase.from("site_pages").select("slug,title,content,updated_at").in("slug",ADMIN_FEATURES.map(x=>x[0]))]);
    if(rowsResult.error)return moduleError(root,rowsResult.error.message);
    const row=(rowsResult.data||[]).find(x=>x.slug===slug);
    const feature=ADMIN_FEATURES.find(x=>x[0]===slug);
    const options=ADMIN_FEATURES.map(x=>'<option value="'+x[0]+'" '+(x[0]===slug?'selected':'')+'>'+x[1]+'</option>').join("");
    const writable=ownerCanWrite();
    root.innerHTML='<section class="data-module"><h2>محتوى الأنشطة والبطاقات</h2><p>هذه البيانات هي المصدر الذي تقرؤه features.js في الموقع العام. احتفظ بالبنية المطلوبة لكل نوع.</p><label>نوع المحتوى<select id="adminFeatureSlug">'+options+'</select></label><label>المحتوى بصيغة JSON<textarea id="adminFeatureJson" rows="18" '+(!writable?'disabled':'')+'></textarea></label>'+(writable?'<button id="saveFeatureJson" type="button">حفظ المحتوى</button>':ownerNotice())+'<p class="data-note">لن تُرفع الملفات من هذه الشاشة؛ مسارات الملفات الحالية محفوظة كما هي. اترك المعرّفات ومسارات الصور وملفات الألعاب دون تغيير ما لم تكن متأكدًا منها.</p></section>';
    document.getElementById("adminFeatureJson").value=row?.content || (feature?.[2]==="array"?"[]":"{}");
    document.getElementById("adminFeatureSlug").addEventListener("change",event=>loadFeatureEditor(event.target.value));
    document.getElementById("saveFeatureJson")?.addEventListener("click",async()=>{
      if(!ownerCanWrite())return;
      let value;try{value=JSON.parse(document.getElementById("adminFeatureJson").value);}catch(_){return moduleError(root,"صيغة JSON غير صحيحة.");}
      if(feature?.[2]==="array"&&!Array.isArray(value))return moduleError(root,"هذا النوع يتطلب قائمة JSON تبدأ بـ [].");
      if(feature?.[2]==="object"&&(!value||typeof value!=="object"||Array.isArray(value)))return moduleError(root,"هذا النوع يتطلب كائن JSON يبدأ بـ {}.");
      const title=feature?.[1]||slug;
      const {error:saveError}=await supabase.from("site_pages").upsert({slug,title,content:JSON.stringify(value),is_visible:true,updated_at:new Date().toISOString()},{onConflict:"slug"});
      if(saveError)return moduleError(root,saveError.message);
      await logAdminAction("feature_content_updated","site_page",slug,{title});
      moduleError(root,"تم حفظ المحتوى. حدّث الموقع العام للتحقق من ظهوره.");
    });
  }

  async function loadStorage() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل مساحات التخزين…</div>';
    if(!ownerCanWrite())return moduleError(root,"إدارة مساحات التخزين متاحة لمالك المنصة فقط.");
    try{
      const result=await invokeAdmin("storage_list");
      const accounts=result.accounts||[];
      root.innerHTML='<section class="data-module"><h2>مساحة Supabase الحالية</h2><p>الحاوية المستخدمة لملفات الموقع: <strong>materials</strong>. الملفات الحالية لا تُنقل ولا تُحذف من هذه الشاشة.</p><div class="data-module-head"><h3>مساحات خارجية مسجلة</h3><span class="data-count">'+numberFormat(accounts.length)+' مساحة</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>الحساب</th><th>الحالة</th><th>تاريخ الإضافة</th></tr></thead><tbody>'+(accounts.map(x=>'<tr><td>'+escapeHtml(x.label)+'</td><td>'+escapeHtml(x.account_email||"—")+'</td><td>'+escapeHtml(x.status)+'</td><td>'+fmtDate(x.created_at)+'</td></tr>').join("")||'<tr><td colspan="4">لا توجد مساحات خارجية مسجلة.</td></tr>')+'</tbody></table></div><p class="data-note">لا تعرض هذه الشاشة حجم التخزين الفعلي أو جميع ملفات الحاوية؛ هذه البيانات تحتاج قياسًا منفصلًا من Storage API.</p></section>';
    }catch(error){moduleError(root,error.message);}
  }
  async function loadDrive() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل حسابات Google Drive…</div>';
    if(!ownerCanWrite())return moduleError(root,"إدارة حسابات التخزين متاحة لمالك المنصة فقط.");
    try{
      const result=await invokeAdmin("storage_list");
      const accounts=result.accounts||[];
      root.innerHTML='<section class="data-module"><h2>حسابات Google Drive</h2><p>يمكن تسجيل بيانات الحساب الآن، لكن الاتصال الفعلي ومزامنة الملفات يتطلبان إعداد Google OAuth على الخادم. لا تُدخل كلمات مرور أو رموز وصول هنا.</p><form id="adminDriveForm"><label>اسم تعريفي للحساب<input id="driveLabel" maxlength="80" required></label><label>البريد الإلكتروني للحساب (اختياري)<input id="driveEmail" type="email"></label><button type="submit">تسجيل مساحة Drive</button></form><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>البريد</th><th>الحالة</th></tr></thead><tbody>'+(accounts.map(x=>'<tr><td>'+escapeHtml(x.label)+'</td><td>'+escapeHtml(x.account_email||"—")+'</td><td>'+escapeHtml(x.status)+'</td></tr>').join("")||'<tr><td colspan="3">لا توجد حسابات مسجلة.</td></tr>')+'</tbody></table></div></section>';
      document.getElementById("adminDriveForm").addEventListener("submit",async event=>{
        event.preventDefault();
        const label=document.getElementById("driveLabel").value.trim(),account_email=document.getElementById("driveEmail").value.trim();
        const {data,error}=await supabase.functions.invoke("admin-control",{body:{action:"storage_add",label,account_email}});
        if(error||data?.error)return moduleError(root,data?.detail||data?.error||error.message);
        await loadDrive();
      });
    }catch(error){moduleError(root,error.message);}
  }
  async function loadStaff() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ التحقق من الحسابات الإدارية…</div>';
    if(!ownerCanWrite())return moduleError(root,"عرض تفاصيل الحسابات الإدارية متاح للمالك فقط.");
    try{
      const result=await invokeAdmin("staff_list");
      const staff=result.staff||[];
      root.innerHTML='<section class="data-module"><h2>الحسابات الإدارية المعتمدة</h2><p>الحسابان المضمنان يعملان من إعدادات الخادم ولا يحتاجان إلى سجل في admin_staff. لم تتم إضافة أي حساب جديد.</p><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الحساب</th><th>الصفة</th><th>المصدر</th></tr></thead><tbody><tr><td>dhad1062001@gmail.com</td><td>مالك المنصة</td><td>حساب مضمّن في الخادم</td></tr><tr><td>abeer112026@gmail.com</td><td>مشرف</td><td>حساب مضمّن في الخادم</td></tr>'+(staff.map(x=>'<tr><td>'+escapeHtml(x.email)+'</td><td>'+escapeHtml(x.role)+'</td><td>'+escapeHtml(x.status)+'</td></tr>').join(""))+'</tbody></table></div><p class="data-note">وفق القرار الحالي، لا توجد أزرار دعوة أو إضافة مشرفين. يمكن إضافة مشرف جديد يدويًا لاحقًا عند الحاجة.</p></section>';
    }catch(error){moduleError(root,error.message);}
  }

  async function loadOverviewSummary() {
    const root=document.getElementById("overviewLiveStats");
    if(!root)return;
    const [materials,grades,categories,pages,sections]=await Promise.all([
      supabase.from("materials").select("id",{count:"exact",head:true}),
      supabase.from("grades").select("id",{count:"exact",head:true}),
      supabase.from("categories").select("id",{count:"exact",head:true}),
      supabase.from("site_pages").select("id",{count:"exact",head:true}),
      supabase.from("home_sections").select("id",{count:"exact",head:true})
    ]);
    const error=[materials,grades,categories,pages,sections].find(x=>x.error)?.error;
    if(error)return moduleError(root,"تعذر تحميل الملخص: "+error.message);
    root.innerHTML='<h2>ملخص قاعدة البيانات</h2><div class="analytics-stats"><article><span>الملفات التعليمية</span><strong>'+numberFormat(materials.count)+'</strong></article><article><span>الصفوف</span><strong>'+numberFormat(grades.count)+'</strong></article><article><span>التصنيفات</span><strong>'+numberFormat(categories.count)+'</strong></article><article><span>صفحات الموقع</span><strong>'+numberFormat(pages.count)+'</strong></article><article><span>أقسام الصفحة الرئيسية</span><strong>'+numberFormat(sections.count)+'</strong></article></div><p class="data-note">الأرقام مباشرة من قاعدة البيانات الحالية.</p>';
  }

  async function loadSeo() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل بيانات SEO…</div>';
    const {data,error}=await supabase.from("site_seo").select("*").order("page_path");
    if(error)return moduleError(root,error.message);
    window.__adminSeoEntries=data||[];
    const writable=ownerCanWrite();
    const rows=(data||[]).map(x=>'<tr><td>'+escapeHtml(x.page_path)+'</td><td>'+escapeHtml(x.page_title)+'</td><td>'+(x.is_published?'منشور':'مسودة')+'</td><td>'+fmtDate(x.updated_at)+'</td><td>'+(writable?'<button type="button" data-admin-action="seo-edit" data-id="'+escapeHtml(x.page_path)+'">تعديل</button> <button type="button" data-admin-action="seo-delete" data-id="'+escapeHtml(x.page_path)+'">حذف</button>':'—')+'</td></tr>').join("");
    root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>بيانات محركات البحث</h2><p>تُحفظ في جدول site_seo، وتُقرأ للزوار من خلال ملف seo.js.</p></div><span class="data-count">'+numberFormat((data||[]).length)+' صفحة</span></div><form id="seoForm"><label>مسار الصفحة<input id="seoPath" required placeholder="/platform.html" '+(!writable?'disabled':'')+'></label><label>عنوان SEO<input id="seoTitle" maxlength="180" required '+(!writable?'disabled':'')+'></label><label>الوصف التعريفي<textarea id="seoDescription" rows="3" maxlength="320" '+(!writable?'disabled':'')+'></textarea></label><label>الرابط الأساسي Canonical<input id="seoCanonical" type="url" '+(!writable?'disabled':'')+'></label><label>تعليمات الفهرسة<select id="seoRobots" '+(!writable?'disabled':'')+'><option value="index,follow">index,follow</option><option value="noindex,follow">noindex,follow</option><option value="noindex,nofollow">noindex,nofollow</option></select></label><label>عنوان المشاركة<input id="seoOgTitle" '+(!writable?'disabled':'')+'></label><label>وصف المشاركة<textarea id="seoOgDescription" rows="2" '+(!writable?'disabled':'')+'></textarea></label><label>رابط صورة المشاركة<input id="seoOgImage" type="url" '+(!writable?'disabled':'')+'></label><label><input id="seoPublished" type="checkbox" checked '+(!writable?'disabled':'')+'> نشر بيانات SEO للزوار</label>'+(writable?'<button type="submit">حفظ بيانات SEO</button><button type="button" id="seoNew">سجل جديد</button>':ownerNotice())+'</form><div class="data-table-wrap"><table class="data-table"><thead><tr><th>المسار</th><th>العنوان</th><th>الحالة</th><th>آخر تحديث</th><th>الإجراءات</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5">لا توجد سجلات SEO بعد.</td></tr>')+'</tbody></table></div><p class="data-note">تحديث الوسوم في المتصفح لا يضمن وحده فهرسة فورية؛ ستظل ملفات HTML الثابتة هي النسخة الأولية التي قد يقرأها بعض الزواحف.</p></section>';
    const form=document.getElementById("seoForm");
    document.getElementById("seoNew")?.addEventListener("click",()=>{form.reset();document.getElementById("seoPath").disabled=false;document.getElementById("seoPublished").checked=true;});
    form.addEventListener("submit",async event=>{
      event.preventDefault();if(!ownerCanWrite())return;
      const page_path=document.getElementById("seoPath").value.trim();
      if(!page_path.startsWith("/")||page_path.includes(".."))return moduleError(root,"أدخل مسارًا داخليًا يبدأ بشرطة مائلة ولا يحتوي على ..");
      const canonical_url=document.getElementById("seoCanonical").value.trim();
      const og_image_url=document.getElementById("seoOgImage").value.trim();
      const payload={page_path,page_title:document.getElementById("seoTitle").value.trim(),meta_description:document.getElementById("seoDescription").value.trim(),canonical_url,robots:document.getElementById("seoRobots").value,og_title:document.getElementById("seoOgTitle").value.trim(),og_description:document.getElementById("seoOgDescription").value.trim(),og_image_url,is_published:document.getElementById("seoPublished").checked,updated_at:new Date().toISOString(),updated_by:accessState?.user?.id||null};
      const {error:saveError}=await supabase.from("site_seo").upsert(payload,{onConflict:"page_path"});
      if(saveError)return moduleError(root,saveError.message);
      await logAdminAction("seo_metadata_saved","site_seo",page_path,{title:payload.page_title});
      await loadSeo();
    });
  }

  async function loadAudit() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل سجل العمليات…</div>';
    if(!ownerCanWrite())return moduleError(root,"عرض سجل العمليات متاح لمالك المنصة فقط.");
    try{
      const result=await invokeAdmin("audit_list");
      const entries=result.entries||[];
      root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>سجل العمليات الإدارية</h2><p>سجل مركزي تحفظه الخدمات الخلفية للعمليات المدعومة.</p></div><span class="data-count">'+numberFormat(entries.length)+' عملية</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الوقت</th><th>الحساب</th><th>العملية</th><th>العنصر</th><th>النتيجة</th></tr></thead><tbody>'+(entries.map(x=>'<tr><td>'+fmtDate(x.created_at)+'</td><td>'+escapeHtml(x.actor_email)+'</td><td>'+escapeHtml(x.action)+'</td><td>'+escapeHtml(x.target_type)+' '+escapeHtml(x.target_id)+'</td><td>'+escapeHtml(x.result)+'</td></tr>').join("")||'<tr><td colspan="5">لا توجد عمليات مسجلة بعد.</td></tr>')+'</tbody></table></div><p class="data-note">السجل يبدأ من تاريخ تفعيل هذه الوظيفة، ولا يحتوي تلقائيًا على العمليات القديمة التي سبقت إنشاؤه.</p></section>';
    }catch(error){moduleError(root,error.message);}
  }

  async function loadTrash() {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل سلة المحذوفات…</div>';
    if(!["owner","admin"].includes(accessState?.role))return moduleError(root,"عرض سلة المحذوفات متاح للحسابات الإدارية المعتمدة فقط.");
    try{
      const result=await invokeAdmin("trash_list");
      const entries=result.entries||[];
      root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>الملفات المؤرشفة</h2><p>النقل إلى السلة يخفي الملف ولا يحذف ملف التخزين. الحذف النهائي لا يتم إلا من هنا.</p></div><span class="data-count">'+numberFormat(entries.length)+' ملف</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الملف</th><th>تاريخ النقل</th><th>الحذف التلقائي</th><th>الإجراءات</th></tr></thead><tbody>'+(entries.map(x=>'<tr><td>'+escapeHtml(x.title)+'</td><td>'+fmtDate(x.deleted_at)+'</td><td>'+fmtDate(x.expires_at)+'</td><td>'+(ownerCanWrite()?'<button type="button" data-admin-action="trash-restore" data-id="'+x.id+'">استعادة</button> <button type="button" data-admin-action="trash-purge" data-id="'+x.id+'">حذف نهائي</button>':'متاح للمالك فقط')+'</td></tr>').join("")||'<tr><td colspan="4">سلة المحذوفات فارغة.</td></tr>')+'</tbody></table></div><p class="data-note">النسخة الحالية تدعم أرشفة ملفات materials فقط. لا تُحذف الملفات تلقائيًا عند انتهاء 30 يومًا؛ يتطلب ذلك مهمة مجدولة منفصلة.</p></section>';
    }catch(error){moduleError(root,error.message);}
  }

  function loadIntegrationStatus(key) {
    const root=document.getElementById("moduleView");
    const messages={
      ads:["إدارة الإعلانات","تكامل AdSense يعمل من خلال كود الموقع ومعرّف الناشر الحالي. لا توجد واجهة API أو بيانات اعتماد AdSense مرتبطة بلوحة ضاد لإدارة الوحدات أو الأرباح؛ لذلك لن نعرض أزرارًا وهمية للتحكم بحساب Google."],
      security:["الأمان والحماية","فحص Supabase أظهر أن الجداول الحساسة admin_staff وstorage_accounts وprivate.analytics_events محمية بـ RLS ولا تملك سياسات مباشرة، ويجري الوصول إليها عبر Edge Functions الموثوقة. لا تغيّر هذه الحماية من الواجهة."],
      backups:["النسخ الاحتياطي","النسخ الاحتياطي الفعلي يُدار من Supabase Dashboard وخطة المشروع، ولا يمكن إنشاؤه من قاعدة البيانات نفسها دون تكامل Management API آمن."],
      trash:["سلة المحذوفات","لا يوجد نظام سلة أو أرشفة في المخطط الحالي. سنحتاج إلى آلية نقل واستعادة تحفظ سجل الملف ومساره قبل تفعيل الحذف من لوحة الإدارة."]
    };
    const item=messages[key]||["الوحدة","لا تتوفر بيانات كافية لتفعيل هذه الوحدة."];
    const links={
      ads:'<a class="site-link" href="https://www.google.com/adsense/" target="_blank" rel="noopener noreferrer">فتح حساب Google AdSense</a>',
      backups:'<a class="site-link" href="https://supabase.com/dashboard/project/rjkrfvnexrhebvulrtgp" target="_blank" rel="noopener noreferrer">فتح لوحة مشروع Supabase</a>',
      security:'<a class="site-link" href="https://supabase.com/dashboard/project/rjkrfvnexrhebvulrtgp" target="_blank" rel="noopener noreferrer">فتح إعدادات المشروع والحماية</a>'
    };
    root.innerHTML='<section class="data-module"><h2>'+escapeHtml(item[0])+'</h2><p>'+escapeHtml(item[1])+'</p>'+(links[key]||'')+'<p class="data-note">لن تُعرض أدوات شكلية أو عمليات غير موصولة فعليًا. بعض الإجراءات تتطلب صلاحيات أو مفاتيح تكامل خارجية.</p></section>';
  }

  function canAccessModule(key) {
    const p = accessState?.permissions || {};
    const isOwnerOrAdmin = accessState?.owner === true || accessState?.role === "admin";
    if (key === "overview") return true;
    if (key === "homepage") return accessState?.owner === true;
    if (isOwnerOrAdmin) return true;
    if (["materials", "supplies"].includes(key)) return p.files === true;
    if (key === "analytics") return p.analytics === true;
    if (["homepage", "sections", "academic", "pages", "seo", "games"].includes(key)) return p.content === true;
    if (["staff", "storage", "drive", "ads", "settings", "security", "audit", "backups", "trash"].includes(key)) {
      return p.settings === true;
    }
    return false;
  }
  function hideUnauthorizedModules() {
    document.querySelectorAll("[data-module]").forEach(el => {
      if (!canAccessModule(el.dataset.module)) el.remove();
    });
  }
  const fmtDate = value => value ? new Intl.DateTimeFormat("ar-JO",{dateStyle:"medium"}).format(new Date(value)) : "—";
  const lookup = (items,id) => items.find(x => String(x.id)===String(id))?.name || "—";

  let adminMaterialQueue = [];
  let adminUploadBusy = false;
  let adminUploadMessage = "";

  function renderAdminMaterialQueue(grades,semesters,categories) {
    const root=document.getElementById("adminMaterialQueue");
    if(!root)return;
    if(!adminMaterialQueue.length){root.innerHTML='<div class="data-note">اختر ملفات لإضافتها إلى قائمة الرفع.</div>';return;}
    const options=(items,selected)=>items.map(x=>'<option value="'+escapeHtml(String(x.id))+'" '+(String(x.id)===String(selected)?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join("");
    const sections=[["school_grades","الصفوف الدراسية"],["curricula","المناهج"],["teacher_supplies","لوازم المعلمين"],["interactive_games","الألعاب التفاعلية"],["supplementary_education","التعليم الإضافي"]];
    root.innerHTML='<div class="data-table-wrap"><table class="data-table"><thead><tr><th>الملف والعنوان</th><th>الصف</th><th>الفصل</th><th>التصنيف</th><th>القسم الأساسي</th><th>الحالة</th></tr></thead><tbody>'+adminMaterialQueue.map((item,index)=>'<tr data-admin-upload-row="'+index+'"><td><small>'+escapeHtml(item.file.name)+' · '+formatAdminFileSize(item.file.size)+'</small><input data-upload-title value="'+escapeHtml(item.title)+'" aria-label="عنوان الملف"><textarea data-upload-description rows="2" placeholder="وصف الملف">'+escapeHtml(item.description||"")+'</textarea></td><td><select data-upload-grade>'+options(grades,item.gradeId)+'</select></td><td><select data-upload-semester>'+options(semesters,item.semesterId)+'</select></td><td><select data-upload-category>'+options(categories,item.categoryId)+'</select></td><td><select data-upload-section>'+sections.map(x=>'<option value="'+x[0]+'" '+(x[0]===item.primarySection?'selected':'')+'>'+x[1]+'</option>').join("")+'</select></td><td data-upload-status>'+escapeHtml(item.status||"بانتظار الرفع")+'</td></tr>').join("")+'</tbody></table></div>';
    root.querySelectorAll("[data-admin-upload-row]").forEach(row=>{
      const index=Number(row.dataset.adminUploadRow),item=adminMaterialQueue[index];if(!item)return;
      row.querySelector("[data-upload-title]")?.addEventListener("input",event=>item.title=event.target.value);
      row.querySelector("[data-upload-description]")?.addEventListener("input",event=>item.description=event.target.value);
      row.querySelector("[data-upload-grade]")?.addEventListener("change",event=>item.gradeId=event.target.value);
      row.querySelector("[data-upload-semester]")?.addEventListener("change",event=>item.semesterId=event.target.value);
      row.querySelector("[data-upload-category]")?.addEventListener("change",event=>item.categoryId=event.target.value);
      row.querySelector("[data-upload-section]")?.addEventListener("change",event=>item.primarySection=event.target.value);
    });
  }
  function formatAdminFileSize(bytes) {
    const value=Number(bytes)||0;
    if(value<1024)return value+" B";
    if(value<1024*1024)return (value/1024).toFixed(1)+" KB";
    return (value/1024/1024).toFixed(1)+" MB";
  }
  function safeAdminFileName(name) {
    return String(name||"file").normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g,"-").replace(/-+/g,"-").replace(/^[-.]+|[-.]+$/g,"").slice(0,100)||"file";
  }
  async function uploadAdminMaterialBatch(viewKey,grades,semesters,categories) {
    if(adminUploadBusy||!adminMaterialQueue.length)return;
    if(!["owner","admin"].includes(accessState?.role))return showModuleError(new Error("رفع الملفات متاح للمالك والمشرف المعتمد فقط."));
    adminUploadBusy=true;
    const status=document.getElementById("adminMaterialUploadStatus");
    if(status)status.textContent="جارٍ رفع الملفات بالتتابع…";
    let success=0,failed=0;
    try {
      for(let i=0;i<adminMaterialQueue.length;i++){
        const item=adminMaterialQueue[i];
        if(item.status==="تم الرفع")continue;
        const row=document.querySelector('[data-admin-upload-row="'+i+'"]');
        const title=row?.querySelector("[data-upload-title]")?.value.trim()||item.title;
        const gradeId=Number(row?.querySelector("[data-upload-grade]")?.value);
        const semesterId=Number(row?.querySelector("[data-upload-semester]")?.value);
        const categoryId=Number(row?.querySelector("[data-upload-category]")?.value);
        const primarySection=row?.querySelector("[data-upload-section]")?.value||"school_grades";
        const setStatus=value=>{item.status=value;const cell=row?.querySelector("[data-upload-status]");if(cell)cell.textContent=value;};
        if(!title||!gradeId||!semesterId||!categoryId){setStatus("فشل: أكمل البيانات");failed++;continue;}
        if(item.file.size>50*1024*1024){setStatus("فشل: أكبر من 50MB");failed++;continue;}
        setStatus("جارٍ الرفع…");
        let uploadedPath="";
        try{
          const ext=(item.file.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"")||"bin";
          const path="grade-"+gradeId+"/semester-"+semesterId+"/category-"+categoryId+"/"+crypto.randomUUID()+"-"+safeAdminFileName(item.file.name);
          const {data:uploaded,error:uploadError}=await supabase.storage.from("materials").upload(path,item.file,{contentType:item.file.type||"application/octet-stream",upsert:false});
          if(uploadError)throw uploadError;
          uploadedPath=uploaded?.path||path;
          const {data:saved,error:dbError}=await supabase.from("materials").insert({
            title,description:item.description||"",grade_id:gradeId,semester_id:semesterId,category_id:categoryId,
            file_path:uploadedPath,file_name:item.file.name,file_type:item.file.type||null,file_size:item.file.size,
            is_public:true,created_by:accessState?.user?.id||null,primary_section:primarySection,
            additional_sections:[],track_name:null,field_name:null
          }).select("id").single();
          if(dbError||!saved?.id)throw dbError||new Error("لم تُرجع قاعدة البيانات معرّف الملف بعد الحفظ.");
          item.status="تم الرفع";success++;
          await logAdminAction("material_uploaded","material",saved.id,{title,file_name:item.file.name,primary_section:primarySection});
          setStatus("تم الرفع");
        }catch(error){
          if(uploadedPath)await supabase.storage.from("materials").remove([uploadedPath]);
          setStatus("فشل: "+(error?.message||"خطأ غير معروف"));failed++;
        }
      }
    } finally {
      adminUploadBusy=false;
      adminUploadMessage="اكتمل الرفع: نجح "+success+"، فشل "+failed+".";
      adminMaterialQueue=adminMaterialQueue.filter(item=>item.status!=="تم الرفع");
      await loadMaterials(viewKey);
    }
  }

  async function loadMaterials(viewKey = "materials") {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل الملفات…</div>';
    const [m,g,s,c]=await Promise.all([
      supabase.from("materials").select("id,title,description,content_summary,learning_objectives,target_audience,page_count,file_name,file_path,file_type,file_size,grade_id,semester_id,category_id,download_count,is_public,created_at,updated_at,primary_section,additional_sections").order("created_at",{ascending:false}).limit(500),
      supabase.from("grades").select("id,name").order("sort_order"),
      supabase.from("semesters").select("id,name").order("sort_order"),
      supabase.from("categories").select("id,name").order("sort_order")
    ]);
    const error=m.error||g.error||s.error||c.error;
    if(error){root.innerHTML='<div class="data-error">تعذر تحميل الملفات: '+escapeHtml(error.message)+'</div>';return;}
    let allMaterials=m.data||[];
    try {
      const {data:trashData}=await supabase.functions.invoke("admin-control",{body:{action:"trash_list"}});
      const trashedIds=new Set((trashData?.entries||[]).map(item=>String(item.entity_id)));
      allMaterials=allMaterials.filter(item=>!trashedIds.has(String(item.id)));
    } catch(error) { console.warn("تعذر استبعاد الملفات المؤرشفة من قائمة الإدارة:",error); }
    const materials=viewKey === "supplies" ? allMaterials.filter(x => x.primary_section === "teacher_supplies" || (x.additional_sections || []).includes("teacher_supplies")) : allMaterials;
    const grades=g.data||[], semesters=s.data||[], categories=c.data||[];
    window.__adminModuleMaterials=allMaterials;
    window.__adminLookups={grades,semesters,categories};
    const writable=["owner","admin"].includes(accessState?.role);
    const row=item=>'<tr><td><strong>'+escapeHtml(item.title)+'</strong><small>'+escapeHtml(item.file_name)+'</small><small>'+escapeHtml(item.description||"دون وصف")+'</small></td><td>'+escapeHtml(lookup(grades,item.grade_id))+'</td><td>'+escapeHtml(lookup(semesters,item.semester_id))+'</td><td>'+escapeHtml(lookup(categories,item.category_id))+'</td><td>'+numberFormat(item.download_count)+'</td><td>'+(item.is_public?'منشور':'غير منشور')+'</td><td>'+fmtDate(item.created_at)+'</td><td>'+(writable?'<button type="button" data-admin-action="material-edit" data-id="'+item.id+'">تعديل الوصف</button> <button type="button" data-admin-action="material-toggle" data-id="'+item.id+'">'+(item.is_public?'إخفاء':'نشر')+'</button> <button type="button" data-admin-action="material-trash" data-id="'+item.id+'">إلى السلة</button>':'—')+'</td></tr>';
    const uploadMarkup=writable?'<section class="data-module"><div class="data-module-head"><div><h2>رفع مجموعة ملفات</h2><p>كل ملف له صف مستقل لتحديد الصف والفصل والتصنيف والقسم الأساسي.</p></div><span class="data-count">حتى 50MB للملف</span></div><label>اختر الملفات<input id="adminMaterialFiles" type="file" multiple></label><div id="adminMaterialQueue"></div><div class="homepage-actions"><button type="button" id="adminMaterialUploadButton">بدء رفع الملفات</button><button type="button" id="adminMaterialClearButton">مسح القائمة</button></div><p id="adminMaterialUploadStatus" class="data-note">'+escapeHtml(adminUploadMessage)+'</p></section>':'';
    root.innerHTML=uploadMarkup+'<section class="data-module"><div class="data-module-head"><div><h2>'+escapeHtml(titles[viewKey]) + '</h2><p>بيانات مباشرة من قاعدة البيانات — تعديل النشر والوصف ورفع الملفات متاح للحسابات الإدارية المعتمدة.</p></div><span class="data-count">'+numberFormat(materials.length)+' ملف</span></div><input class="data-search" id="materialsSearch" type="search" placeholder="ابحث باسم الملف أو عنوانه"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الملف</th><th>الصف</th><th>الفصل</th><th>التصنيف</th><th>التنزيلات المسجلة</th><th>الحالة</th><th>تاريخ الإضافة</th><th>إجراءات</th></tr></thead><tbody id="materialsRows">'+(materials.map(row).join("")||'<tr><td colspan="8">لا توجد ملفات.</td></tr>')+'</tbody></table></div><p class="data-note">الحذف من قائمة الملفات ينقل الملف إلى سلة المحذوفات ولا يحذف ملف التخزين. الحذف النهائي يتم من وحدة السلة بواسطة المالك.</p></section>';
    if(writable){
      renderAdminMaterialQueue(grades,semesters,categories);
      document.getElementById("adminMaterialFiles")?.addEventListener("change",event=>{
        for(const file of Array.from(event.target.files||[])){
          const duplicate=adminMaterialQueue.some(x=>x.file.name===file.name&&x.file.size===file.size)||allMaterials.some(x=>x.file_name===file.name&&Number(x.file_size)===file.size);
          if(duplicate&&!window.confirm("يوجد ملف بالاسم والحجم نفسيهما: «"+file.name+"». هل تريد إضافته رغم احتمال التكرار؟"))continue;
          adminMaterialQueue.push({file,title:file.name.replace(/\.[^.]+$/,""),description:"",gradeId:grades[0]?.id||"",semesterId:semesters[0]?.id||"",categoryId:categories[0]?.id||"",primarySection:viewKey==="supplies"?"teacher_supplies":"school_grades",status:"بانتظار الرفع"});
        }
        event.target.value="";
        renderAdminMaterialQueue(grades,semesters,categories);
      });
      document.getElementById("adminMaterialUploadButton")?.addEventListener("click",()=>uploadAdminMaterialBatch(viewKey,grades,semesters,categories));
      document.getElementById("adminMaterialClearButton")?.addEventListener("click",()=>{if(adminUploadBusy)return;adminMaterialQueue=[];renderAdminMaterialQueue(grades,semesters,categories);});
    }
    document.getElementById("materialsSearch").addEventListener("input",e=>{
      const q=e.target.value.trim().toLocaleLowerCase("ar");
      document.getElementById("materialsRows").innerHTML=materials.filter(x=>[x.title,x.file_name,x.description].some(v=>String(v||"").toLocaleLowerCase("ar").includes(q))).map(row).join("")||'<tr><td colspan="8">لا توجد نتائج.</td></tr>';
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
    const sections=s.data||[],categories=c.data||[],writable=ownerCanWrite();
    const categoryRows=categories.map(x=>'<tr><td>'+escapeHtml(x.name)+'</td><td>'+escapeHtml(x.slug)+'</td><td>'+numberFormat(x.sort_order)+'</td><td>'+(writable?'<button type="button" data-admin-action="lookup-edit" data-kind="category" data-id="'+x.id+'">تعديل</button> <button type="button" data-admin-action="lookup-delete" data-kind="category" data-id="'+x.id+'">حذف</button>':'—')+'</td></tr>').join("");
    const sectionRows=sections.map(x=>{const parent=sections.find(y=>y.id===x.parent_id);return '<tr><td><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.slug||"—")+'</small></td><td>'+escapeHtml(parent?.title||"قسم رئيسي")+'</td><td>'+escapeHtml(x.content_type)+'</td><td>'+numberFormat(x.sort_order)+'</td><td>'+(x.is_active?"نشط":"متوقف")+'</td><td>'+(x.show_on_home?"نعم":"لا")+'</td></tr>';}).join("");
    root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>التصنيفات التعليمية</h2><p>إدارة جدول categories الذي ترتبط به المواد.</p></div><span class="data-count">'+numberFormat(categories.length)+' تصنيف</span></div>'+(writable?'<button type="button" data-admin-action="lookup-add" data-kind="category">إضافة تصنيف</button>':'')+'<div class="data-table-wrap"><table class="data-table"><thead><tr><th>التصنيف</th><th>الرابط المختصر</th><th>الترتيب</th><th>الإجراءات</th></tr></thead><tbody>'+(categoryRows||'<tr><td colspan="4">لا توجد تصنيفات.</td></tr>')+'</tbody></table></div><div class="data-module-head"><div><h2>أقسام الصفحة الرئيسية</h2><p>تُدار تفاصيل الأقسام ومحتواها من وحدة الصفحة الرئيسية.</p></div><span class="data-count">'+numberFormat(sections.length)+' قسم</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>القسم</th><th>يتبع</th><th>نوع المحتوى</th><th>الترتيب</th><th>الحالة</th><th>على الرئيسية</th></tr></thead><tbody>'+(sectionRows||'<tr><td colspan="6">لا توجد أقسام بعد.</td></tr>')+'</tbody></table></div>'+(writable?'<p class="data-note">يمكنك إدارة تفاصيل الأقسام من وحدة «الصفحة الرئيسية». لا يؤدي حذف تصنيف مرتبط بملفات إلى حذف الملفات.</p>':ownerNotice())+'</section>';
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