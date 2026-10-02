(function () {
  "use strict";

  const ESTILOS = [
    { id: "executiva", nome: "Executiva", arquivo: "fonts/AlexBrush-Regular.ttf", traco: "gancho", angulo: -1 },
    { id: "classica", nome: "Clássica", arquivo: "fonts/GreatVibes-Regular.ttf", traco: "longo", angulo: -1.5 },
    { id: "fluida", nome: "Fluida", arquivo: "fonts/Allura-Regular.ttf", traco: "longo", angulo: -2 },
    { id: "formal", nome: "Formal", arquivo: "fonts/PinyonScript-Regular.ttf", traco: "gancho", angulo: -0.6 },
    { id: "rapida", nome: "Rápida", arquivo: "fonts/Sacramento-Regular.ttf", traco: "gancho", angulo: -2.2 },
  ];

  const TINTAS = [
    { id: "azul", nome: "Azul caneta", cor: "#163a86" },
    { id: "preto", nome: "Preto", cor: "#1a1a1a" },
    { id: "marinho", nome: "Azul-marinho", cor: "#0b1f44" },
  ];

  const KEY = "assinatura-documentos:v1";
  const $ = (id) => document.getElementById(id);

  const textoEl = $("texto");
  const rubricaEl = $("rubrica");
  const nomeEl = $("nome-extenso");
  const linhaEl = $("linha");
  const tracoEl = $("traco");
  const fundoEl = $("fundo");
  const statusEl = $("status");
  const toastEl = $("toast");

  const fontes = new Map();
  let estiloId = "executiva";
  let tintaId = "azul";
  let pronto = false;

  function n(v) {
    return Math.round(v * 100) / 100;
  }

  function unir(a, b) {
    if (!a) return b;
    if (!b) return a;
    return {
      x1: Math.min(a.x1, b.x1),
      y1: Math.min(a.y1, b.y1),
      x2: Math.max(a.x2, b.x2),
      y2: Math.max(a.y2, b.y2),
    };
  }

  function girarCaixa(b, graus, cx, cy) {
    if (!graus) return { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2 };
    const rad = (graus * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const [x, y] of [[b.x1, b.y1], [b.x2, b.y1], [b.x1, b.y2], [b.x2, b.y2]]) {
      const dx = x - cx;
      const dy = y - cy;
      const rx = cx + dx * c - dy * s;
      const ry = cy + dx * s + dy * c;
      x1 = Math.min(x1, rx);
      y1 = Math.min(y1, ry);
      x2 = Math.max(x2, rx);
      y2 = Math.max(y2, ry);
    }
    return { x1, y1, x2, y2 };
  }

  function amostraCubica(p0, p1, p2, p3, passos) {
    const pts = [];
    for (let i = 0; i <= passos; i += 1) {
      const t = i / passos;
      const u = 1 - t;
      const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
      const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
      const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
      const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
      pts.push({ x, y, dx, dy });
    }
    return pts;
  }

  // Traço preenchido, grosso no início e fino na ponta, como uma caneta.
  function pena(p0, p1, p2, p3, larguraInicio, larguraFim) {
    const amostras = amostraCubica(p0, p1, p2, p3, 36);
    const esquerda = [];
    const direita = [];
    for (let i = 0; i < amostras.length; i += 1) {
      const s = amostras[i];
      const len = Math.hypot(s.dx, s.dy) || 1;
      const nx = -s.dy / len;
      const ny = s.dx / len;
      const t = i / (amostras.length - 1);
      const w = (larguraInicio + (larguraFim - larguraInicio) * t) / 2;
      esquerda.push([s.x + nx * w, s.y + ny * w]);
      direita.push([s.x - nx * w, s.y - ny * w]);
    }
    const pts = esquerda.concat(direita.reverse());
    let d = `M ${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let i = 1; i < pts.length; i += 1) d += ` L ${n(pts[i][0])} ${n(pts[i][1])}`;
    d += " Z";
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const [x, y] of pts) {
      x1 = Math.min(x1, x);
      y1 = Math.min(y1, y);
      x2 = Math.max(x2, x);
      y2 = Math.max(y2, y);
    }
    return { d, bounds: { x1, y1, x2, y2 } };
  }

  function tracoLongo(bb, size) {
    const w = bb.x2 - bb.x1;
    return pena(
      { x: bb.x2 - size * 0.08, y: size * 0.02 },
      { x: bb.x2 + size * 0.04, y: size * 0.28 },
      { x: bb.x1 + w * 0.42, y: size * 0.46 },
      { x: bb.x1 + size * 0.04, y: size * 0.16 },
      size * 0.034,
      size * 0.008
    );
  }

  function tracoGancho(bb, size) {
    return pena(
      { x: bb.x2 - size * 0.12, y: size * 0.01 },
      { x: bb.x2 + size * 0.22, y: size * 0.05 },
      { x: bb.x2 + size * 0.12, y: size * 0.40 },
      { x: bb.x2 - size * 0.62, y: size * 0.20 },
      size * 0.04,
      size * 0.007
    );
  }

  const TRACOS = { longo: tracoLongo, gancho: tracoGancho };

  function carregarFonte(arquivo) {
    if (!fontes.has(arquivo)) fontes.set(arquivo, opentype.load(arquivo));
    return fontes.get(arquivo);
  }

  function compor(fonte, texto, estilo, cor, comTraco) {
    const size = 200;
    const caminho = fonte.getPath(texto, 0, 0, size);
    const tb = caminho.getBoundingBox();
    if (!isFinite(tb.x1) || tb.x2 - tb.x1 < 1) return null;
    const flourish = comTraco ? TRACOS[estilo.traco](tb, size) : null;
    const bruto = unir(tb, flourish && flourish.bounds);
    const cx = (bruto.x1 + bruto.x2) / 2;
    const cy = (bruto.y1 + bruto.y2) / 2;
    const girado = girarCaixa(bruto, estilo.angulo, cx, cy);
    const folga = size * 0.08;
    girado.x1 -= folga;
    girado.y1 -= folga * 0.45;
    girado.x2 += folga;
    girado.y2 += folga * 0.35;
    return {
      caminho,
      flourish,
      bounds: girado,
      cx,
      cy,
      angulo: estilo.angulo,
      cor,
    };
  }

  function pintar(ctx, modelo, fundo) {
    const b = modelo.bounds;
    const w = b.x2 - b.x1;
    const h = b.y2 - b.y1;
    if (fundo) {
      ctx.fillStyle = fundo;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.save();
    ctx.translate(-b.x1, -b.y1);
    if (modelo.angulo) {
      ctx.translate(modelo.cx, modelo.cy);
      ctx.rotate((modelo.angulo * Math.PI) / 180);
      ctx.translate(-modelo.cx, -modelo.cy);
    }
    modelo.caminho.fill = modelo.cor;
    modelo.caminho.stroke = null;
    modelo.caminho.draw(ctx);
    if (modelo.flourish) {
      ctx.fillStyle = modelo.cor;
      ctx.fill(new Path2D(modelo.flourish.d));
    }
    ctx.restore();
    return { w, h };
  }

  function raster(modelo, larguraAlvo, fundo) {
    const w = modelo.bounds.x2 - modelo.bounds.x1;
    const h = modelo.bounds.y2 - modelo.bounds.y1;
    const escala = larguraAlvo / w;
    const tela = document.createElement("canvas");
    tela.width = Math.max(1, Math.ceil(w * escala));
    tela.height = Math.max(1, Math.ceil(h * escala));
    const ctx = tela.getContext("2d");
    ctx.scale(escala, escala);
    pintar(ctx, modelo, fundo);
    return tela;
  }

  function paraSvg(modelo) {
    const b = modelo.bounds;
    const w = b.x2 - b.x1;
    const h = b.y2 - b.y1;
    const giro = modelo.angulo
      ? ` rotate(${n(modelo.angulo)} ${n(modelo.cx)} ${n(modelo.cy)})`
      : "";
    const transform = `translate(${n(-b.x1)} ${n(-b.y1)})${giro}`;
    const traco = modelo.flourish
      ? `<path d="${modelo.flourish.d}" fill="${modelo.cor}"/>`
      : "";
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="0 0 ${n(w)} ${n(h)}">
  <g transform="${transform}" fill="${modelo.cor}">
    <path d="${modelo.caminho.toPathData(1)}"/>
    ${traco}
  </g>
</svg>
`;
  }

  function estiloAtual() {
    return ESTILOS.find((item) => item.id === estiloId) || ESTILOS[0];
  }

  function corAtual() {
    return (TINTAS.find((item) => item.id === tintaId) || TINTAS[0]).cor;
  }

  function slug(valor) {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "assinatura";
  }

  function baixarBlob(nome, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  let toastTimer;
  function aviso(mensagem) {
    toastEl.textContent = mensagem;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  async function modeloDe(texto, estilo) {
    const limpo = texto.trim();
    if (!limpo) return null;
    const fonte = await carregarFonte(estilo.arquivo);
    return compor(fonte, limpo, estilo, corAtual(), tracoEl.checked);
  }

  function aplicarImagem(img, tela, alt) {
    img.src = tela.toDataURL("image/png");
    img.alt = alt;
  }

  function marcarChips() {
    document.querySelectorAll(".chip").forEach((chip) => {
      const input = $(chip.dataset.for);
      chip.classList.toggle("active", input.value === chip.dataset.value);
    });
  }

  async function render() {
    if (!pronto) return;
    marcarChips();
    const estilo = estiloAtual();
    const texto = textoEl.value;
    const rubrica = rubricaEl.value;
    $("doc-nome").textContent = nomeEl.value.trim() || "Lucas Braz Queiroz";
    const linha = linhaEl.value.trim();
    const cargo = $("doc-cargo");
    cargo.textContent = linha;
    cargo.hidden = !linha;
    statusEl.textContent = "";

    try {
      const principal = await modeloDe(texto, estilo);
      if (!principal) {
        statusEl.textContent = "Digite o nome que deseja assinar.";
        return;
      }
      aplicarImagem($("preview-assinatura"), raster(principal, 1800), `Assinatura de ${texto.trim()}`);
      aplicarImagem($("doc-assinatura"), raster(principal, 1200), "");

      const curto = await modeloDe(rubrica, estilo);
      if (curto) {
        aplicarImagem($("preview-rubrica"), raster(curto, 900), `Rubrica de ${rubrica.trim()}`);
        aplicarImagem($("doc-rubrica"), raster(curto, 700), "Rubrica no canto da página");
      }

      const miniaturas = document.querySelectorAll(".style-card img");
      await Promise.all(ESTILOS.map(async (item, indice) => {
        const modelo = await modeloDe(texto, item);
        if (modelo && miniaturas[indice]) {
          miniaturas[indice].src = raster(modelo, 640).toDataURL("image/png");
        }
      }));
    } catch (erro) {
      statusEl.textContent = "Não foi possível desenhar a assinatura. Sirva a pasta por HTTP (python3 -m http.server).";
      console.error(erro);
    }
  }

  function persistir() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        texto: textoEl.value,
        rubrica: rubricaEl.value,
        nome: nomeEl.value,
        linha: linhaEl.value,
        traco: tracoEl.checked,
        fundo: fundoEl.checked,
        estiloId,
        tintaId,
      }));
    } catch (_) {}
  }

  function restaurar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!salvo) return;
      if (typeof salvo.texto === "string") textoEl.value = salvo.texto;
      if (typeof salvo.rubrica === "string") rubricaEl.value = salvo.rubrica;
      if (typeof salvo.nome === "string") nomeEl.value = salvo.nome;
      if (typeof salvo.linha === "string") linhaEl.value = salvo.linha;
      if (typeof salvo.traco === "boolean") tracoEl.checked = salvo.traco;
      if (typeof salvo.fundo === "boolean") fundoEl.checked = salvo.fundo;
      if (ESTILOS.some((item) => item.id === salvo.estiloId)) estiloId = salvo.estiloId;
      if (TINTAS.some((item) => item.id === salvo.tintaId)) tintaId = salvo.tintaId;
    } catch (_) {}
  }

  function montarEstilos() {
    const grade = $("estilos");
    for (const estilo of ESTILOS) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "style-card";
      botao.dataset.id = estilo.id;
      botao.setAttribute("role", "radio");
      botao.setAttribute("aria-checked", String(estilo.id === estiloId));
      const img = document.createElement("img");
      img.alt = "";
      const legenda = document.createElement("span");
      legenda.textContent = estilo.nome;
      if (estilo.id === "executiva") {
        const tag = document.createElement("em");
        tag.className = "tag";
        tag.textContent = "indicada";
        legenda.append(tag);
      }
      botao.append(img, legenda);
      botao.addEventListener("click", () => {
        estiloId = estilo.id;
        document.querySelectorAll(".style-card").forEach((card) => {
          const ativo = card.dataset.id === estiloId;
          card.classList.toggle("selected", ativo);
          card.setAttribute("aria-checked", String(ativo));
        });
        render();
        persistir();
      });
      grade.appendChild(botao);
    }
    grade.querySelector(`[data-id="${estiloId}"]`).classList.add("selected");
  }

  function montarTintas() {
    const linha = $("tintas");
    for (const tinta of TINTAS) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "ink";
      botao.dataset.id = tinta.id;
      botao.setAttribute("role", "radio");
      botao.setAttribute("aria-checked", String(tinta.id === tintaId));
      const bola = document.createElement("span");
      bola.className = "swatch";
      bola.style.background = tinta.cor;
      const nome = document.createElement("span");
      nome.textContent = tinta.nome;
      botao.append(bola, nome);
      botao.addEventListener("click", () => {
        tintaId = tinta.id;
        document.querySelectorAll(".ink").forEach((item) => {
          const ativo = item.dataset.id === tintaId;
          item.classList.toggle("selected", ativo);
          item.setAttribute("aria-checked", String(ativo));
        });
        render();
        persistir();
      });
      linha.appendChild(botao);
    }
    linha.querySelector(`[data-id="${tintaId}"]`).classList.add("selected");
  }

  async function baixar(tipo, rubrica) {
    const estilo = estiloAtual();
    const texto = (rubrica ? rubricaEl.value : textoEl.value).trim();
    const modelo = await modeloDe(texto, estilo);
    if (!modelo) {
      aviso("Digite um texto para baixar.");
      return;
    }
    const base = `${rubrica ? "rubrica" : "assinatura"}-${slug(texto)}`;
    if (tipo === "svg") {
      baixarBlob(`${base}.svg`, new Blob([paraSvg(modelo)], { type: "image/svg+xml" }));
      aviso("SVG baixado.");
      return;
    }
    const fundo = fundoEl.checked ? "#ffffff" : null;
    const tela = raster(modelo, 2200, fundo);
    const nome = fundo ? `${base}-fundo-branco.png` : `${base}.png`;
    tela.toBlob((blob) => {
      if (!blob) {
        aviso("Não foi possível gerar o PNG.");
        return;
      }
      baixarBlob(nome, blob);
      aviso("PNG baixado.");
    }, "image/png");
  }

  function ligar() {
    for (const id of ["texto", "rubrica", "nome-extenso", "linha"]) {
      $(id).addEventListener("input", () => { render(); persistir(); });
    }
    tracoEl.addEventListener("change", () => { render(); persistir(); });
    fundoEl.addEventListener("change", persistir);
    document.body.addEventListener("click", (evento) => {
      const chip = evento.target.closest(".chip");
      if (!chip) return;
      $(chip.dataset.for).value = chip.dataset.value;
      render();
      persistir();
    });
    $("baixar-png").addEventListener("click", () => baixar("png", false));
    $("baixar-svg").addEventListener("click", () => baixar("svg", false));
    $("baixar-rubrica-png").addEventListener("click", () => baixar("png", true));
    $("baixar-rubrica-svg").addEventListener("click", () => baixar("svg", true));
  }

  $("doc-data").textContent = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (location.protocol === "file:") {
    statusEl.textContent = "Abra esta pasta com um servidor local (python3 -m http.server) para carregar as fontes.";
  }

  restaurar();
  montarEstilos();
  montarTintas();
  ligar();

  Promise.all(ESTILOS.map((estilo) => carregarFonte(estilo.arquivo)))
    .then(() => {
      pronto = true;
      return render();
    })
    .catch((erro) => {
      statusEl.textContent = "Não foi possível carregar as fontes. Sirva a pasta por HTTP (python3 -m http.server).";
      console.error(erro);
    });
})();
