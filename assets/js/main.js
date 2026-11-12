/* Navegação, links de contato vindos do config e "solte o STL" da home. */
(function () {
  var C = (window.ZIRC_CONFIG || {}).contato || {};

  function waLink(msg) {
    return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg || "Olá! Quero um orçamento de peça. Vim pelo site.");
  }
  window.zircWaLink = waLink;

  document.addEventListener("DOMContentLoaded", function () {
    // Links dinâmicos
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var k = a.getAttribute("data-link");
      if (k === "whatsapp") a.href = waLink(a.getAttribute("data-wa-msg"));
      else if (k === "email") a.href = "mailto:" + C.email;
      else if (C[k]) a.href = C[k];
      if (k !== "email") { a.target = "_blank"; a.rel = "noopener"; }
    });
    document.querySelectorAll("[data-text='email']").forEach(function (el) { el.textContent = C.email; });

    // Menu mobile
    var t = document.querySelector(".nav-toggle"), n = document.getElementById("menu");
    if (t && n) t.addEventListener("click", function () {
      var open = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", String(!open)); n.classList.toggle("open", !open);
    });

    // Home: soltar STL leva ao orçamentador com o arquivo
    var dz = document.querySelector("[data-quick-drop]");
    if (dz) {
      var input = dz.querySelector("input[type=file]");
      function go(file) {
        if (!file) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var bytes = new Uint8Array(r.result), bin = "", CH = 0x8000;
            for (var i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
            sessionStorage.setItem("zirc_stl_name", file.name);
            sessionStorage.setItem("zirc_stl", btoa(bin));
          } catch (e) { /* arquivo grande demais para a sessão: o cliente reenvia na próxima tela */ }
          location.href = "orcamento.html";
        };
        r.readAsArrayBuffer(file);
      }
      input.addEventListener("change", function () { go(input.files[0]); });
      ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("hot"); }); });
      ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("hot"); }); });
      dz.addEventListener("drop", function (e) { go(e.dataTransfer.files[0]); });
    }
  });
})();
