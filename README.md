# Personal

Projetos pessoais de **Lucas Braz Queiroz** — dados aplicados a marketing.

## Projetos

### `assinatura-email/`

Gerador de assinatura de e-mail profissional, 100% estático (HTML/CSS/JS, sem dependências).

- Pré-visualização ao vivo dentro de um mock de e-mail
- 3 templates (Moderno, Clássico, Minimalista), cor de destaque e fonte configuráveis
- Saída em tabelas com estilos inline — compatível com Gmail, Outlook e Apple Mail
- Botões para copiar a assinatura formatada, copiar o HTML ou baixar um `.html`
- Os dados ficam salvos no navegador (`localStorage`)

**Como usar**

```bash
cd assinatura-email
python3 -m http.server 8080
# abra http://localhost:8080
```

Ou simplesmente abra `assinatura-email/index.html` no navegador.
