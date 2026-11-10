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
      view.innerHTML = overviewMarkup;
    } else if (key === "materials" || key === "supplies") {
      title.textContent = titles[key];
      subtitle.textContent = "عرض الملفات التعليمية المسجلة — دون تعديل البيانات.";
      breadcrumb.textContent = titles[key];
      loadMaterials(key);
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



  // Homepage management: owner-only, using the existing site_pages and home_sections tables.
  let homepageSections = [];
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
            <label class="homepage-label">نوع المحتوى<select id="homepageSectionType"><option value="text">نص</option><option value="image">صورة</option><option value="file">ملف</option><option value="link">رابط</option></select></label>
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
      const [pageResult, sectionsResult] = await Promise.all([
        supabase.from("site_pages").select("slug,title,content,is_visible,home_title,home_subtitle").eq("slug", HOMEPAGE_DESCRIPTION_SLUG).maybeSingle(),
        supabase.from("home_sections").select("id,title,content_type,content,file_path,sort_order,is_active,display_limit,display_style,section_description,show_on_home,parent_id,icon,created_at").order("sort_order", { ascending: true }).order("created_at", { ascending: true })
      ]);
      if (pageResult.error) throw pageResult.error;
      if (sectionsResult.error) throw sectionsResult.error;
      const page = pageResult.data || {};
      document.getElementById("homepageTitle").value = page.home_title || "رحلتك إلى التميز تبدأ من هنا";
      document.getElementById("homepageSubtitle").value = page.home_subtitle || "تعلّم .. اقرأ .. واكتشف جمال لغتنا العربية";
      document.getElementById("homepageDescription").value = page.content || "منصة ضاد مساحة تعليمية عربية تجمع الموارد والملفات والأنشطة التي يحتاج إليها معلم اللغة العربية والطالب وولي الأمر، وتسهّل الوصول إليها وتنظيمها في مكان واحد.";
      document.getElementById("homepageVisible").checked = page.is_visible !== false;
      homepageSections = sectionsResult.data || [];
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

    if (type === "image") {
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

  function renderHomepageSections() {
    const list = document.getElementById("homepageSectionsList");
    if (!list) return;
    if (!homepageSections.length) {
      list.innerHTML = '<div class="homepage-empty">لا توجد أقسام حتى الآن. يمكنك إنشاء أول قسم من النموذج المجاور.</div>';
      return;
    }
    list.innerHTML = homepageSections.map(row => {
      const parent = homepageSections.find(item => String(item.id) === String(row.parent_id));
      return `
      <article class="homepage-section-item">
        <div class="homepage-section-info"><strong>${escapeHtml(row.icon || "▣")} ${escapeHtml(row.title || "قسم دون عنوان")}</strong><small>${parent ? "يتبع: " + escapeHtml(parent.title) + " · " : "قسم رئيسي · "}النوع: ${escapeHtml(row.content_type)} · الترتيب: ${numberFormat(row.sort_order)} · ${row.is_active ? "مفعّل" : "معطّل"} · ${row.show_on_home === false ? "غير معروض في الرئيسية" : "معروض في الرئيسية"}</small></div>
        <div class="homepage-section-actions">
          <button type="button" data-homepage-action="edit" data-id="${escapeHtml(row.id)}">تعديل</button>
          <button type="button" data-homepage-action="toggle" data-id="${escapeHtml(row.id)}">${row.is_active ? "إخفاء" : "إظهار"}</button>
          <button type="button" class="danger" data-homepage-action="delete" data-id="${escapeHtml(row.id)}">حذف</button>
        </div>
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
    if (!["text", "image", "file", "link"].includes(type)) return setHomepageStatus("نوع المحتوى غير صالح.", "error");
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
      await loadHomepageSectionsOnly();
      setHomepageStatus("تم حذف القسم. بقي الملف في مساحة التخزين دون حذف.", "success");
    } catch (error) {
      setHomepageStatus((deleted ? "تم حذف القسم، لكن تعذر تحديث القائمة: " : "تعذر حذف القسم: ") + (error?.message || "خطأ غير معروف"), "error");
    }
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
  async function loadMaterials(viewKey = "materials") {
    const root=document.getElementById("moduleView");
    root.innerHTML='<div class="data-loading">جارٍ تحميل الملفات…</div>';
    const [m,g,s,c]=await Promise.all([
      supabase.from("materials").select("id,title,file_name,grade_id,semester_id,category_id,download_count,is_public,created_at,primary_section,additional_sections").order("created_at",{ascending:false}).limit(500),
      supabase.from("grades").select("id,name").order("sort_order"),
      supabase.from("semesters").select("id,name").order("sort_order"),
      supabase.from("categories").select("id,name").order("sort_order")
    ]);
    const error=m.error||g.error||s.error||c.error;
    if(error){root.innerHTML='<div class="data-error">تعذر تحميل الملفات: '+escapeHtml(error.message)+'</div>';return;}
    const allMaterials=m.data||[], materials=viewKey === "supplies" ? allMaterials.filter(x => x.primary_section === "teacher_supplies" || (x.additional_sections || []).includes("teacher_supplies")) : allMaterials;
    const grades=g.data||[], semesters=s.data||[], categories=c.data||[];
    const row=item=>'<tr><td><strong>'+escapeHtml(item.title)+'</strong><small>'+escapeHtml(item.file_name)+'</small></td><td>'+escapeHtml(lookup(grades,item.grade_id))+'</td><td>'+escapeHtml(lookup(semesters,item.semester_id))+'</td><td>'+escapeHtml(lookup(categories,item.category_id))+'</td><td>'+numberFormat(item.download_count)+'</td><td>'+(item.is_public?'منشور':'غير منشور')+'</td><td>'+fmtDate(item.created_at)+'</td></tr>';
    root.innerHTML='<section class="data-module"><div class="data-module-head"><div><h2>'+escapeHtml(titles[viewKey]) + '</h2><p>بيانات مباشرة من قاعدة البيانات — عرض فقط في هذه المرحلة.</p></div><span class="data-count">'+numberFormat(materials.length)+' ملف</span></div><input class="data-search" id="materialsSearch" type="search" placeholder="ابحث باسم الملف أو عنوانه"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الملف</th><th>الصف</th><th>الفصل</th><th>التصنيف</th><th>التنزيلات المسجلة</th><th>الحالة</th><th>تاريخ الإضافة</th></tr></thead><tbody id="materialsRows">'+(materials.map(row).join("")||'<tr><td colspan="7">لا توجد ملفات.</td></tr>')+'</tbody></table></div><p class="data-note">لا يوجد رفع أو تعديل أو حذف مفعّل هنا؛ لم تتغير أي بيانات أو مسارات تخزين.</p></section>';
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