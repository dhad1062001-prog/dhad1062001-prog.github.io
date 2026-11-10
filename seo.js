/* DHAD dynamic SEO metadata. Public reads only published records from site_seo. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://rjkrfvnexrhebvulrtgp.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_INgrDnl6WPs_vNhpvwXMSA_YiHX8x7J";

  function loadClient(done) {
    if (window.supabase?.createClient) return done();
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = done;
    script.onerror = () => {};
    document.head.appendChild(script);
  }
  function setMeta(name, content, property = false) {
    if (!content) return;
    const attr = property ? "property" : "name";
    let element = document.head.querySelector("meta[" + attr + '="' + name + '"]');
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }
  function apply(row) {
    if (!row) return;
    if (row.page_title) document.title = row.page_title;
    setMeta("description", row.meta_description);
    setMeta("robots", row.robots);
    setMeta("og:title", row.og_title || row.page_title, true);
    setMeta("og:description", row.og_description || row.meta_description, true);
    setMeta("og:image", row.og_image_url, true);
    setMeta("og:url", location.href.split("#")[0], true);
    if (row.canonical_url) {
      let canonical = document.head.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = row.canonical_url;
    }
  }
  loadClient(async () => {
    try {
      const client = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const path = location.pathname || "/";
      const candidates = path === "/index.html" ? ["/index.html", "/"] :
        path === "/" ? ["/", "/index.html"] : [path];
      for (const candidate of candidates) {
        const { data, error } = await client.from("site_seo")
          .select("page_title,meta_description,canonical_url,robots,og_title,og_description,og_image_url")
          .eq("page_path", candidate).eq("is_published", true).maybeSingle();
        if (error) break;
        if (data) { apply(data); break; }
      }
    } catch (error) {
      console.warn("تعذر تحميل بيانات SEO الديناميكية.", error);
    }
  });
})();