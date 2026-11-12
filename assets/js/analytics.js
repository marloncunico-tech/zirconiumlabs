/* Analytics com consentimento (LGPD): GA4 + Meta Pixel + UTMs + eventos por data-track. */
(function () {
  var cfg = (window.ZIRC_CONFIG || {}).analytics || {};
  var KEY = "zirc_consent";
  var loaded = false;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function valid(id) { return id && !/X{4,}/.test(id); }

  // UTMs: guardadas na sessão e anexadas ao pedido de orçamento
  (function captureUtm() {
    var p = new URLSearchParams(location.search), utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(function (k) {
      if (p.get(k)) utm[k] = p.get(k);
    });
    if (Object.keys(utm).length) sstore("zirc_utm", JSON.stringify(utm));
    if (!sstore("zirc_landing")) sstore("zirc_landing", location.pathname);
  })();
  window.zircUtm = function () {
    var u = {}; try { u = JSON.parse(sstore("zirc_utm") || "{}"); } catch (e) {}
    u.landing = sstore("zirc_landing") || ""; return u;
  };

  function loadTags() {
    if (loaded) return; loaded = true;
    if (valid(cfg.ga4Id)) {
      var s = document.createElement("script");
      s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.ga4Id;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag("js", new Date());
      gtag("consent", "default", { ad_storage: "granted", analytics_storage: "granted" });
      gtag("config", cfg.ga4Id, { anonymize_ip: true });
    }
    if (valid(cfg.metaPixelId)) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", cfg.metaPixelId); fbq("track", "PageView");
    }
  }

  // Mapeamento de eventos próprios para eventos padrão do Meta
  var META = { envio_orcamento: "Lead", clique_whatsapp: "Contact", stl_carregado: "ViewContent", clique_loja: "FindLocation" };

  window.zircTrack = function (name, params) {
    params = params || {};
    if (window.gtag) gtag("event", name, params);
    if (window.fbq) { if (META[name] && META[name] !== "FindLocation") fbq("track", META[name], params); else fbq("trackCustom", name, params); }
    if (window.console && location.hostname === "localhost") console.log("[track]", name, params);
  };

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (el) zircTrack(el.getAttribute("data-track"), { local: el.getAttribute("data-track-local") || location.pathname });
  });

  function banner() {
    var b = document.createElement("div");
    b.className = "consent"; b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "Cookies e privacidade");
    b.innerHTML = '<p>Usamos cookies de medição (Google Analytics e Meta) para saber quais páginas ajudam você a pedir orçamento. ' +
      '<a href="privacidade.html">Política de privacidade</a></p>' +
      '<div class="consent-actions"><button type="button" class="btn btn-ghost" data-c="0">Recusar</button>' +
      '<button type="button" class="btn btn-primary" data-c="1">Aceitar medição</button></div>';
    document.body.appendChild(b);
    b.addEventListener("click", function (e) {
      var c = e.target.getAttribute("data-c"); if (c === null) return;
      store(KEY, c === "1" ? "granted" : "denied"); b.remove(); if (c === "1") loadTags();
    });
  }

  window.zircResetConsent = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  document.addEventListener("DOMContentLoaded", function () {
    var c = store(KEY);
    if (c === "granted") loadTags(); else if (!c) banner();
  });
})();
