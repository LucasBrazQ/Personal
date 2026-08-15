#!/usr/bin/env python3
"""Converte os markdowns do case Stellantis em PDFs com estética profissional."""
import subprocess
import tempfile
import os
import html as html_lib
import markdown

BASE = "/workspace"

DOCS = [
    {
        "src": "ENTREGAVEL-breve-proposta-biocircle.md",
        "pdf": "ENTREGAVEL-breve-proposta-biocircle.pdf",
        "kicker": "Entregável — Versão breve",
        "title": "BioCircle Stellantis",
        "subtitle": "Cenário 2 — Oportunidades de Inovação Futura na América do Sul",
    },
    {
        "src": "proposta-stellantis-cenario2-biocircle.md",
        "pdf": "proposta-stellantis-cenario2-biocircle.pdf",
        "kicker": "Proposta completa",
        "title": "BioCircle Stellantis",
        "subtitle": "Análise competitiva, plano piloto e documentação de IA",
    },
    {
        "src": "README.md",
        "pdf": "README.pdf",
        "kicker": "Índice dos entregáveis",
        "title": "Proposta Stellantis — Cenário 2",
        "subtitle": "Guia dos documentos do case de estágio",
    },
]

CSS = """
:root{
  --ink:#0f1b2d; --muted:#5b6b7f; --line:#e4e9f0;
  --brand:#0a2a4e; --accent:#1f6feb; --accent2:#0f9d58;
  --soft:#f6f8fb; --code:#0b1f38;
}
*{box-sizing:border-box;}
@page{
  size:A4; margin:20mm 16mm 18mm 16mm;
}
@page:first{ margin:0; }
html,body{margin:0;padding:0;}
body{
  font-family:"Segoe UI","Helvetica Neue",Arial,system-ui,sans-serif;
  color:var(--ink); font-size:11pt; line-height:1.62;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
/* ---------- COVER ---------- */
.cover{
  position:relative; height:297mm; width:210mm;
  background:linear-gradient(150deg,#061a33 0%,#0a2a4e 45%,#123a68 100%);
  color:#fff; padding:34mm 22mm; page-break-after:always; overflow:hidden;
}
.cover::before{
  content:""; position:absolute; right:-90mm; top:-90mm;
  width:200mm; height:200mm; border-radius:50%;
  background:radial-gradient(circle at center, rgba(31,111,235,.55), rgba(31,111,235,0) 70%);
}
.cover::after{
  content:""; position:absolute; left:-60mm; bottom:-70mm;
  width:150mm; height:150mm; border-radius:50%;
  background:radial-gradient(circle at center, rgba(15,157,88,.35), rgba(15,157,88,0) 70%);
}
.cover .inner{position:relative; z-index:2; height:100%; display:flex; flex-direction:column;}
.badge{
  display:inline-block; align-self:flex-start; letter-spacing:.28em; text-transform:uppercase;
  font-size:8.5pt; font-weight:700; padding:7px 14px; border:1px solid rgba(255,255,255,.4);
  border-radius:999px; color:#dce9ff;
}
.cover .kicker{margin-top:auto; color:#7fb4ff; font-weight:700; letter-spacing:.12em;
  text-transform:uppercase; font-size:10pt;}
.cover h1{font-size:44pt; line-height:1.02; margin:10px 0 8px; font-weight:800; letter-spacing:-.5px;}
.cover .sub{font-size:15pt; color:#c8d8ec; font-weight:400; max-width:150mm; line-height:1.4;}
.cover .rule{height:4px; width:70mm; background:linear-gradient(90deg,var(--accent),var(--accent2));
  border-radius:4px; margin:22px 0 20px;}
.cover .meta{font-size:10pt; color:#a9c2e0; line-height:1.7;}
.cover .foot{position:absolute; left:22mm; right:22mm; bottom:20mm; z-index:2;
  display:flex; justify-content:space-between; align-items:center;
  border-top:1px solid rgba(255,255,255,.18); padding-top:12px;
  font-size:8.5pt; color:#9db6d6; letter-spacing:.05em;}
.cover .foot b{color:#fff; letter-spacing:.2em; text-transform:uppercase;}
/* ---------- CONTENT ---------- */
.content{padding:0;}
h1,h2,h3,h4{color:var(--brand); line-height:1.25; font-weight:700;}
.content > h1:first-child{margin-top:0;}
h1{font-size:20pt; margin:26px 0 10px; padding-bottom:8px; border-bottom:3px solid var(--accent);}
h2{font-size:15pt; margin:22px 0 8px; padding-left:12px; border-left:5px solid var(--accent);}
h3{font-size:12.5pt; margin:16px 0 6px; color:#123a68;}
h4{font-size:11pt; margin:12px 0 4px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;}
p{margin:8px 0;}
a{color:var(--accent); text-decoration:none;}
strong{color:#0a2a4e;}
ul,ol{margin:8px 0 8px 4px; padding-left:22px;}
li{margin:4px 0;}
hr{border:none; border-top:1px solid var(--line); margin:22px 0;}
blockquote{
  margin:14px 0; padding:12px 18px; background:var(--soft);
  border-left:4px solid var(--accent2); border-radius:0 8px 8px 0; color:#33465c;
}
blockquote p{margin:0;}
/* tables */
table{
  width:100%; border-collapse:collapse; margin:14px 0; font-size:9.8pt;
  box-shadow:0 1px 0 var(--line); border-radius:10px; overflow:hidden;
}
thead th{
  background:linear-gradient(90deg,var(--brand),#123a68); color:#fff; text-align:left;
  padding:9px 12px; font-weight:600; font-size:9.5pt;
}
tbody td{padding:8px 12px; border-bottom:1px solid var(--line); vertical-align:top;}
tbody tr:nth-child(even){background:var(--soft);}
tbody tr:last-child td{border-bottom:none;}
/* code */
code{
  font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;
  background:#eef2f8; color:#0a2a4e; padding:1.5px 5px; border-radius:4px; font-size:9pt;
}
pre{
  background:var(--code); color:#e6edf6; padding:14px 16px; border-radius:10px;
  overflow-x:auto; font-size:8.8pt; line-height:1.5; margin:12px 0;
  border:1px solid #0a1930;
}
pre code{background:none; color:inherit; padding:0; font-size:8.8pt;}
h1,h2,h3,h4{page-break-after:avoid;}
table,pre,blockquote,img{page-break-inside:avoid;}
"""

def cover_html(d):
    return f"""
<section class="cover">
  <div class="inner">
    <span class="badge">Programa de Estágio · Stellantis</span>
    <div class="kicker">{html_lib.escape(d['kicker'])}</div>
    <h1>{html_lib.escape(d['title'])}</h1>
    <div class="rule"></div>
    <div class="sub">{html_lib.escape(d['subtitle'])}</div>
    <div style="height:26px"></div>
    <div class="meta">
      Ciências Econômicas · PUC Minas · 5º período<br>
      Case: Oportunidades de Inovação Futura na América do Sul
    </div>
  </div>
  <div class="foot">
    <span><b>BioCircle</b> · Energia dual: etanol + eletricidade</span>
    <span>Proposta confidencial · Processo seletivo</span>
  </div>
</section>
"""

def build(d):
    src_path = os.path.join(BASE, d["src"])
    with open(src_path, encoding="utf-8") as f:
        text = f.read()
    body = markdown.markdown(
        text,
        extensions=["extra", "tables", "fenced_code", "codehilite", "sane_lists", "nl2br"],
        extension_configs={"codehilite": {"guess_lang": False, "noclasses": True}},
    )
    full = f"""<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
<style>{CSS}</style></head><body>
{cover_html(d)}
<main class="content">{body}</main>
</body></html>"""

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(full)
        html_path = tmp.name

    pdf_path = os.path.join(BASE, d["pdf"])
    if os.path.exists(pdf_path):
        os.unlink(pdf_path)
    profile = tempfile.mkdtemp(prefix="chrome-prof-")
    proc = subprocess.Popen([
        "google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu",
        "--disable-dev-shm-usage", f"--user-data-dir={profile}",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}", f"file://{html_path}",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    import time
    last, stable, waited = -1, 0, 0.0
    while waited < 90:
        time.sleep(1.0); waited += 1.0
        if proc.poll() is not None:
            break
        if os.path.exists(pdf_path):
            sz = os.path.getsize(pdf_path)
            if sz > 0 and sz == last:
                stable += 1
                if stable >= 2:
                    break
            else:
                stable = 0
            last = sz
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
    os.unlink(html_path)
    if not (os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0):
        raise RuntimeError(f"PDF não gerado: {d['pdf']}")
    print(f"OK  {d['pdf']}  ({os.path.getsize(pdf_path)//1024} KB)")

if __name__ == "__main__":
    for d in DOCS:
        build(d)
