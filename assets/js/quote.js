/* Orçamentador online: STL → medidas → custo → resumo → pedido (WhatsApp + e-mail). */
(function () {
  var CFG = window.ZIRC_CONFIG, Q = CFG.orcamento;
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var num = function (v, d) { return v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var $ = function (s) { return document.querySelector(s); };

  var state = { pos: null, nome: "", m: null, unit: "mm", calc: null };
  var viewer = null;

  // ---------- montagem dos controles a partir do config ----------
  function buildControls() {
    var sel = $("#q-material"), fam = {};
    Q.materiais.forEach(function (m) { (fam[m.familia] = fam[m.familia] || []).push(m); });
    Object.keys(fam).forEach(function (f) {
      var g = document.createElement("optgroup"); g.label = f;
      fam[f].forEach(function (m) { var o = document.createElement("option"); o.value = m.id; o.textContent = m.nome; g.appendChild(o); });
      sel.appendChild(g);
    });
    var box = $("#q-acab");
    Q.acabamentos.forEach(function (a, i) {
      var l = document.createElement("label"); l.className = "choice";
      l.innerHTML = '<input type="radio" name="acab" value="' + a.id + '"' + (i === 0 ? " checked" : "") + '><span>' + a.nome + "</span>";
      box.appendChild(l);
    });
    $("#q-infill").value = Q.preenchimentoPadrao;
  }

  // ---------- arquivo ----------
  function loadBuffer(buf, nome) {
    var err = $("#q-error"); err.hidden = true;
    try {
      state.pos = ZircSTL.parse(buf); state.nome = nome;
    } catch (e) { err.textContent = e.message; err.hidden = false; return; }
    $("#q-drop").hidden = true; $("#q-stage").hidden = false;
    $("#q-filename").textContent = nome;
    try {
      if (!viewer) viewer = new ZircViewer($("#q-canvas"), $("#q-labels"));
      viewer.setMesh(state.pos);
    } catch (e) { $("#q-canvas").replaceWith(Object.assign(document.createElement("p"), { className: "note", textContent: e.message })); }
    document.querySelectorAll("[data-needs-file]").forEach(function (el) { el.removeAttribute("aria-disabled"); el.classList.remove("locked"); });
    if (window.zircTrack) zircTrack("stl_carregado", { triangulos: state.pos.length / 9 });
    update();
  }

  function readFile(file) {
    if (!file) return;
    if (!/\.stl$/i.test(file.name)) { var e = $("#q-error"); e.textContent = "Envie um arquivo .stl. Outros formatos (STEP, OBJ) podem ser exportados como STL no seu CAD."; e.hidden = false; return; }
    var r = new FileReader(); r.onload = function () { loadBuffer(r.result, file.name); }; r.readAsArrayBuffer(file);
  }

  // ---------- cálculo ----------
  function faixaPara(maxMm) { for (var i = 0; i < Q.faixas.length; i++) if (maxMm <= Q.faixas[i].ateMm) return Q.faixas[i]; return Q.faixas[Q.faixas.length - 1]; }

  function calcular() {
    var m = state.m, mat = Q.materiais.filter(function (x) { return x.id === $("#q-material").value; })[0];
    var acabId = (document.querySelector("input[name=acab]:checked") || {}).value;
    var acab = Q.acabamentos.filter(function (a) { return a.id === acabId; })[0];
    var infill = +$("#q-infill").value / 100, qtd = Math.max(1, Math.floor(+$("#q-qty").value || 1));
    var V = m.volumeCm3, A = m.areaCm2;
    var casca = Math.min(V, A * Q.paredeMm / 10);
    var Vef = casca + (V - casca) * infill;
    var massa = Vef * mat.densidade * (1 + Q.perdaProcesso);
    var custoMat = massa / 500 * mat.precoRolo;
    var custoAcab = acab.fixo + acab.porCm2 * A;
    var k = 1 + Q.margem;
    var unitMat = (custoMat + Q.processoPorPeca) * k, unitAcab = custoAcab * k, unit = unitMat + unitAcab;
    var bruto = unit * qtd, desc = 0;
    for (var i = 0; i < Q.descontosQuantidade.length; i++) if (qtd >= Q.descontosQuantidade[i].aPartirDe) { desc = Q.descontosQuantidade[i].desconto; break; }
    var comDesc = bruto * (1 - desc);
    var maxDim = Math.max.apply(null, m.dimMm), faixa = faixaPara(maxDim);
    var total = Math.max(comDesc, faixa.minimo);
    var dims = m.dimMm.slice().sort(function (a, b) { return b - a; }), lim = Q.pecaMaxima.slice().sort(function (a, b) { return b - a; });
    var cabe = dims.every(function (d, i) { return d <= lim[i]; });
    var prazo = mat.prazoDias + (acab.id === "bruto" ? 0 : 3) + (qtd > 10 ? 5 : 0);
    return { mat: mat, acab: acab, infill: infill, qtd: qtd, Vef: Vef, massa: massa, custoMat: custoMat, custoAcab: custoAcab,
      unitMat: unitMat, unitAcab: unitAcab, unit: unit, bruto: bruto, desc: desc, comDesc: comDesc, faixa: faixa, total: total,
      ajusteMinimo: total - comDesc, cabe: cabe, prazo: prazo };
  }

  function fmtDim(mm) { return num(mm, 1) + " mm  /  " + num(mm / 25.4, 2) + " pol"; }

  function update() {
    $("#q-infill-out").textContent = $("#q-infill").value + "%";
    if (!state.pos) return;
    state.unit = (document.querySelector("input[name=unit]:checked") || {}).value || "mm";
    state.m = ZircSTL.metrics(state.pos, state.unit === "in" ? 25.4 : 1);
    var c = state.calc = calcular(), m = state.m;
    $("#d-x").textContent = fmtDim(m.dimMm[0]); $("#d-y").textContent = fmtDim(m.dimMm[1]); $("#d-z").textContent = fmtDim(m.dimMm[2]);
    $("#d-vol").textContent = num(m.volumeCm3, 2) + " cm³";
    $("#d-area").textContent = num(m.areaCm2, 1) + " cm²";
    $("#d-faixa").textContent = c.faixa.id + " (pedido mínimo " + brl.format(c.faixa.minimo) + ")";
    var fit = $("#d-fit");
    fit.textContent = c.cabe ? "Cabe no forno em uma peça" : "Maior que a peça máxima (" + Q.pecaMaxima.join(" × ") + " mm). Vamos propor divisão em partes.";
    fit.className = c.cabe ? "ok" : "warn";
    var u = state.unit === "in" ? "pol" : "mm", k = state.unit === "in" ? 1 / 25.4 : 1;
    if (viewer) {
      viewer.setColor(c.mat.cor);
      viewer.setLabels(m.dimMm.map(function (d, i) { return "XYZ"[i] + " " + num(d * k, state.unit === "in" ? 2 : 1) + " " + u; }));
    }
    if (m.volumeCm3 < 0.01) { $("#q-error").textContent = "O arquivo parece não ser um sólido fechado (volume zero). Confira se a malha está fechada no seu CAD."; $("#q-error").hidden = false; }

    var rows = [
      ["Material", c.mat.nome + " — " + num(c.massa, 0) + " g por peça (" + num(c.Vef, 2) + " cm³ com " + Math.round(c.infill * 100) + "% de preenchimento)"],
      ["Material e fabricação, por peça", brl.format(c.unitMat)],
      ["Acabamento " + c.acab.nome.toLowerCase() + ", por peça", brl.format(c.unitAcab)],
      ["Quantidade", c.qtd + (c.qtd > 1 ? " peças" : " peça") + " × " + brl.format(c.unit)]
    ];
    if (c.desc) rows.push(["Desconto por quantidade", "− " + Math.round(c.desc * 100) + "% (" + brl.format(c.bruto - c.comDesc) + ")"]);
    if (c.ajusteMinimo > 0.005) rows.push(["Ajuste ao pedido mínimo da faixa " + c.faixa.id, "+ " + brl.format(c.ajusteMinimo)]);
    $("#q-summary").innerHTML = rows.map(function (r) { return "<tr><th scope='row'>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("");
    $("#q-total").textContent = c.cabe ? brl.format(c.total) : "Sob consulta";
    if (!c.cabe) $("#q-summary").innerHTML += "<tr><th scope='row'>Peça maior que o forno</th><td>Enviaremos proposta em partes</td></tr>";
    $("#q-prazo").textContent = c.prazo + " dias úteis após a aprovação";
  }

  // ---------- pedido ----------
  function resumoTexto(f) {
    var c = state.calc, m = state.m;
    return [
      "*Pedido de orçamento — zirconiumlabs.com.br*",
      "Arquivo: " + state.nome + " (unidade: " + (state.unit === "in" ? "polegada" : "mm") + ")",
      "Dimensões: " + m.dimMm.map(function (d) { return num(d, 1); }).join(" × ") + " mm",
      "Volume: " + num(m.volumeCm3, 2) + " cm³ | Área: " + num(m.areaCm2, 1) + " cm²",
      "Material: " + c.mat.nome + " | Preenchimento: " + Math.round(c.infill * 100) + "%",
      "Acabamento: " + c.acab.nome + " | Quantidade: " + c.qtd,
      "Faixa: " + c.faixa.id + " | Prazo estimado: " + c.prazo + " dias úteis",
      "Total estimado: " + (c.cabe ? brl.format(c.total) : "sob consulta (peça maior que o forno)"),
      "",
      "Nome: " + f.nome + (f.empresa ? " (" + f.empresa + ")" : ""),
      "E-mail: " + f.email + (f.telefone ? " | Tel.: " + f.telefone : ""),
      "Perfil: " + f.perfil,
      f.obs ? "Observações: " + f.obs : ""
    ].filter(Boolean).join("\n");
  }

  function enviar(e) {
    e.preventDefault();
    var form = $("#q-form"), st = $("#q-status");
    if (!state.calc) { st.textContent = "Envie o arquivo STL primeiro: o preço e o resumo dependem das medidas da peça."; st.className = "status warn"; return; }
    if (!form.reportValidity()) return;
    var f = Object.fromEntries(new FormData(form).entries());
    var texto = resumoTexto(f);
    // WhatsApp abre já no clique (evita bloqueio de pop-up)
    window.open(zircWaLink(texto + "\n\nVou anexar o arquivo STL nesta conversa."), "_blank", "noopener");
    if (window.zircTrack) zircTrack("envio_orcamento", { value: Math.round(state.calc.total), currency: "BRL", material: state.calc.mat.id, faixa: state.calc.faixa.id });
    st.className = "status ok";
    st.textContent = "Pedido enviado. Anexe o arquivo STL na conversa do WhatsApp que acabou de abrir; respondemos com a confirmação do preço.";
    if (CFG.formspreeId) {
      var c = state.calc;
      var payload = Object.assign({}, f, {
        _subject: "Orçamento " + c.faixa.id + " — " + c.mat.nome + " — " + brl.format(c.total),
        resumo: texto,
        interno_custo_material: c.custoMat.toFixed(2), interno_custo_acabamento: c.custoAcab.toFixed(2),
        interno_margem: Q.margem, interno_massa_g: c.massa.toFixed(1), utm: JSON.stringify(window.zircUtm ? zircUtm() : {})
      });
      fetch("https://formspree.io/f/" + CFG.formspreeId, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw 0; st.textContent += " Uma cópia foi enviada para o nosso e-mail."; })
        .catch(function () { st.textContent += " A cópia por e-mail não saiu; o WhatsApp já tem todos os dados."; });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildControls();
    var input = $("#q-file"), dz = $("#q-drop");
    input.addEventListener("change", function () { readFile(input.files[0]); });
    ["dragenter", "dragover"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("hot"); }); });
    ["dragleave", "drop"].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("hot"); }); });
    dz.addEventListener("drop", function (e) { readFile(e.dataTransfer.files[0]); });
    $("#q-replace").addEventListener("click", function () { input.value = ""; input.click(); });
    document.querySelectorAll("#q-config input, #q-config select").forEach(function (el) { el.addEventListener("input", update); el.addEventListener("change", update); });
    $("#q-form").addEventListener("submit", enviar);
    $("#q-demo").addEventListener("click", function () { fetch("assets/img/exemplo-engrenagem.stl").then(function (r) { return r.arrayBuffer(); }).then(function (b) { loadBuffer(b, "exemplo-engrenagem.stl"); }); });
    update();
    // arquivo vindo da home
    try {
      var b64 = sessionStorage.getItem("zirc_stl");
      if (b64) {
        var bin = atob(b64), u8 = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        var nome = sessionStorage.getItem("zirc_stl_name") || "peca.stl";
        sessionStorage.removeItem("zirc_stl"); sessionStorage.removeItem("zirc_stl_name");
        loadBuffer(u8.buffer, nome);
      }
    } catch (e) {}
  });
})();
