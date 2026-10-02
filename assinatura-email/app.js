(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const inputs = {
    nome: $("nome"),
    cargo: $("cargo"),
    empresa: $("empresa"),
    email: $("email"),
    telefone: $("telefone"),
    linkedin: $("linkedin"),
    site: $("site"),
    foto: $("foto"),
    tagline: $("tagline"),
    cor: $("cor"),
    fonte: $("fonte"),
  };

  const preview = $("preview");
  const codigo = $("codigo");
  const toast = $("toast");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readForm() {
    const template = document.querySelector('input[name="template"]:checked').value;
    const data = {};
    for (const key of Object.keys(inputs)) data[key] = inputs[key].value.trim();
    data.template = template;
    return data;
  }

  function stripProtocol(url) {
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }

  function telHref(phone) {
    return "tel:" + phone.replace(/[^\d+]/g, "");
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  // Todos os templates usam tabelas e estilos inline para máxima compatibilidade
  // com Gmail, Outlook e Apple Mail.
  const templates = {
    moderno(d) {
      const e = escapeHtml;
      const base = `font-family:${d.fonte};font-size:13px;line-height:1.5;color:#333333;`;
      const avatar = d.foto
        ? `<img src="${e(d.foto)}" width="72" height="72" alt="${e(d.nome)}" style="display:block;width:72px;height:72px;border-radius:50%;object-fit:cover;border:0;" />`
        : `<div style="width:72px;height:72px;border-radius:50%;background:${d.cor};color:#ffffff;${base}font-size:24px;font-weight:bold;line-height:72px;text-align:center;">${e(initials(d.nome))}</div>`;

      const contacts = [];
      if (d.email) contacts.push(`<a href="mailto:${e(d.email)}" style="color:#333333;text-decoration:none;">${e(d.email)}</a>`);
      if (d.telefone) contacts.push(`<a href="${e(telHref(d.telefone))}" style="color:#333333;text-decoration:none;">${e(d.telefone)}</a>`);

      const links = [];
      if (d.linkedin) links.push(`<a href="${e(d.linkedin)}" style="color:${d.cor};text-decoration:none;font-weight:bold;">LinkedIn</a>`);
      if (d.site) links.push(`<a href="${e(d.site)}" style="color:${d.cor};text-decoration:none;font-weight:bold;">${e(stripProtocol(d.site))}</a>`);

      return `
<table cellpadding="0" cellspacing="0" border="0" style="${base}border-collapse:collapse;">
  <tr>
    <td style="padding:0 16px 0 0;vertical-align:middle;">${avatar}</td>
    <td style="border-left:3px solid ${d.cor};padding:2px 0 2px 16px;vertical-align:middle;">
      <div style="${base}font-size:17px;font-weight:bold;color:#111111;">${e(d.nome)}</div>
      ${d.cargo ? `<div style="${base}color:${d.cor};font-weight:bold;">${e(d.cargo)}${d.empresa ? ` <span style="color:#777777;font-weight:normal;">| ${e(d.empresa)}</span>` : ""}</div>` : d.empresa ? `<div style="${base}color:#777777;">${e(d.empresa)}</div>` : ""}
      ${contacts.length ? `<div style="${base}margin-top:6px;">${contacts.join(`<span style="color:#bbbbbb;"> &nbsp;·&nbsp; </span>`)}</div>` : ""}
      ${links.length ? `<div style="${base}margin-top:2px;">${links.join(`<span style="color:#bbbbbb;"> &nbsp;·&nbsp; </span>`)}</div>` : ""}
      ${d.tagline ? `<div style="${base}font-size:12px;color:#888888;font-style:italic;margin-top:6px;">${e(d.tagline)}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
    },

    classico(d) {
      const e = escapeHtml;
      const base = `font-family:${d.fonte};font-size:13px;line-height:1.5;color:#333333;`;
      const rows = [];
      if (d.email) rows.push(["E-mail", `<a href="mailto:${e(d.email)}" style="color:#333333;text-decoration:none;">${e(d.email)}</a>`]);
      if (d.telefone) rows.push(["Telefone", `<a href="${e(telHref(d.telefone))}" style="color:#333333;text-decoration:none;">${e(d.telefone)}</a>`]);
      if (d.linkedin) rows.push(["LinkedIn", `<a href="${e(d.linkedin)}" style="color:${d.cor};text-decoration:none;">${e(stripProtocol(d.linkedin))}</a>`]);
      if (d.site) rows.push(["Site", `<a href="${e(d.site)}" style="color:${d.cor};text-decoration:none;">${e(stripProtocol(d.site))}</a>`]);

      const photo = d.foto
        ? `<td style="padding:0 18px 0 0;vertical-align:top;"><img src="${e(d.foto)}" width="80" height="80" alt="${e(d.nome)}" style="display:block;width:80px;height:80px;border-radius:6px;object-fit:cover;border:0;" /></td>`
        : "";

      return `
<table cellpadding="0" cellspacing="0" border="0" style="${base}border-collapse:collapse;">
  <tr>
    <td colspan="2" style="padding:0 0 10px 0;border-bottom:2px solid ${d.cor};">
      <div style="${base}font-size:18px;font-weight:bold;color:#111111;letter-spacing:0.3px;">${e(d.nome)}</div>
      ${d.cargo || d.empresa ? `<div style="${base}color:#555555;">${e(d.cargo)}${d.cargo && d.empresa ? " — " : ""}${e(d.empresa)}</div>` : ""}
    </td>
  </tr>
  <tr>
    ${photo}
    <td style="padding:10px 0 0 0;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0" style="${base}border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `<tr>
          <td style="${base}padding:1px 10px 1px 0;color:${d.cor};font-weight:bold;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">${label}</td>
          <td style="${base}padding:1px 0;">${value}</td>
        </tr>`
          )
          .join("\n")}
      </table>
      ${d.tagline ? `<div style="${base}font-size:12px;color:#888888;margin-top:8px;">${e(d.tagline)}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
    },

    minimal(d) {
      const e = escapeHtml;
      const base = `font-family:${d.fonte};font-size:13px;line-height:1.6;color:#333333;`;
      const parts = [];
      if (d.email) parts.push(`<a href="mailto:${e(d.email)}" style="color:#555555;text-decoration:none;">${e(d.email)}</a>`);
      if (d.telefone) parts.push(`<a href="${e(telHref(d.telefone))}" style="color:#555555;text-decoration:none;">${e(d.telefone)}</a>`);
      if (d.linkedin) parts.push(`<a href="${e(d.linkedin)}" style="color:${d.cor};text-decoration:none;">LinkedIn</a>`);
      if (d.site) parts.push(`<a href="${e(d.site)}" style="color:${d.cor};text-decoration:none;">${e(stripProtocol(d.site))}</a>`);

      return `
<table cellpadding="0" cellspacing="0" border="0" style="${base}border-collapse:collapse;">
  <tr>
    <td style="padding:0;">
      <div style="${base}font-size:15px;font-weight:bold;color:#111111;">${e(d.nome)}</div>
      ${d.cargo || d.empresa ? `<div style="${base}color:#666666;">${e(d.cargo)}${d.cargo && d.empresa ? ` <span style="color:${d.cor};">·</span> ` : ""}${e(d.empresa)}</div>` : ""}
      ${parts.length ? `<div style="${base}margin-top:4px;">${parts.join(`<span style="color:#bbbbbb;"> &nbsp;/&nbsp; </span>`)}</div>` : ""}
    </td>
  </tr>
</table>`.trim();
    },
  };

  function buildSignature(data) {
    return templates[data.template](data);
  }

  function render() {
    const data = readForm();
    const html = buildSignature(data);
    preview.innerHTML = html;
    codigo.textContent = html;
    return html;
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyRich() {
    const html = render();
    const text = preview.innerText;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
        showToast("Assinatura copiada. Cole no seu cliente de e-mail.");
        return;
      }
    } catch (_) {
      // cai para o fallback por seleção
    }
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const ok = document.execCommand("copy");
    selection.removeAllRanges();
    showToast(ok ? "Assinatura copiada. Cole no seu cliente de e-mail." : "Não foi possível copiar automaticamente.");
  }

  async function copyHtml() {
    const html = render();
    try {
      await navigator.clipboard.writeText(html);
      showToast("Código HTML copiado.");
    } catch (_) {
      showToast("Não foi possível copiar. Use o bloco 'Ver código HTML'.");
    }
  }

  function download() {
    const data = readForm();
    const html = buildSignature(data);
    const doc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Assinatura — ${escapeHtml(data.nome)}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;">
${html}
</body>
</html>
`;
    const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = data.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assinatura";
    a.href = url;
    a.download = `assinatura-${slug}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Arquivo .html baixado.");
  }

  const STORAGE_KEY = "assinatura-email:v1";

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readForm()));
    } catch (_) {}
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      for (const key of Object.keys(inputs)) {
        if (typeof saved[key] === "string") inputs[key].value = saved[key];
      }
      const radio = document.querySelector(`input[name="template"][value="${saved.template}"]`);
      if (radio) radio.checked = true;
    } catch (_) {}
  }

  for (const el of Object.values(inputs)) {
    el.addEventListener("input", () => { render(); persist(); });
  }
  document.querySelectorAll('input[name="template"]').forEach((radio) => {
    radio.addEventListener("change", () => { render(); persist(); });
  });

  $("copiar-rich").addEventListener("click", copyRich);
  $("copiar-html").addEventListener("click", copyHtml);
  $("baixar").addEventListener("click", download);

  restore();
  render();
})();
