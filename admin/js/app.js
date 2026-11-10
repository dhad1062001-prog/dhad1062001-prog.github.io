(() => {
  "use strict";
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
    trash: "نقل العناصر المحذوفة حذفًا آمنًا إلى السلة، وإتاحـة الاستعادة، وتقييد الحذف النهائي وفق الصلاحيات المعتمدة."
  };
  const nav = document.getElementById("navigation");
  const view = document.getElementById("moduleView");
  const title = document.getElementById("pageTitle");
  const subtitle = document.getElementById("pageSubtitle");
  const breadcrumb = document.getElementById("breadcrumbTitle");
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("sidebarScrim");

  function showModule(key) {
    if (key === "overview") {
      title.textContent = "مرحبًا بك في ضاد";
      subtitle.textContent = "نظرة عامة على وحدات إدارة المنصة التعليمية.";
      breadcrumb.textContent = titles.overview;
      view.innerHTML = document.getElementById("overviewTemplate")?.innerHTML || view.innerHTML;
      // The overview is retained in the original document and restored without data calls.
      location.hash = "";
      return;
    }
    if (!titles[key]) return;
    document.querySelectorAll("[data-module]").forEach(button => {
      button.classList.toggle("active", button.dataset.module === key);
    });
    title.textContent = titles[key];
    subtitle.textContent = "وحدة ضمن مركز إدارة ضاد المستقل.";
    breadcrumb.textContent = titles[key];
    view.innerHTML = '<section class="module-placeholder"><h2>' + escapeHtml(titles[key]) +
      '</h2><p>' + escapeHtml(descriptions[key] || "سيتم إعداد هذه الوحدة ضمن مراحل التطوير المعتمدة.") +
      '</p><div class="lock-note"><span>◈</span><span>لم يتم ربط هذه الوحدة بقاعدة البيانات بعد — لا توجد عمليات فعلية مفعّلة.</span></div></section>';
    location.hash = key;
    closeMenu();
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }
  function closeMenu() {
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
  }
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-module]");
    if (target) showModule(target.dataset.module);
  });
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    scrim.classList.toggle("show");
  });
  scrim.addEventListener("click", closeMenu);
  window.addEventListener("hashchange", () => {
    const key = location.hash.replace(/^#/, "");
    if (key && titles[key]) showModule(key);
  });
  if (location.hash && titles[location.hash.slice(1)]) {
    showModule(location.hash.slice(1));
  }
})();