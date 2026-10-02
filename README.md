# Personal

Projetos pessoais de Lucas Braz Queiroz.

## Assinatura para documentos

A pasta `assinatura/` desenha uma assinatura do nome para contratos, propostas e PDFs.

- Formas do nome (completo, com inicial do meio, nome e sobrenome)
- Cinco estilos de caligrafia, com traço final de caneta
- Tinta preta, azul caneta ou azul-marinho
- Rubrica curta para visto de página
- Pré-visualização num documento de exemplo
- Download em PNG (transparente ou com fundo branco) e SVG

As letras são convertidas em vetor. O arquivo não depende da fonte estar instalada no computador de quem abre o documento.

```bash
cd assinatura
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Abrir o `index.html` direto no disco bloqueia a leitura das fontes.

Há uma versão pronta, no estilo Executiva e tinta azul, em `assinatura/prontas/`:

- `assinatura-lucas-braz-queiroz.png` — fundo transparente, para colar no documento
- `assinatura-lucas-braz-queiroz.svg` — o mesmo traço em vetor
- `rubrica-l-queiroz.png` — visto curto para as páginas internas

Fontes sob a SIL Open Font License 1.1 (`assinatura/fonts/OFL.txt` e `NOTICE.txt`): Alex Brush, Allura, Great Vibes, Pinyon Script e Sacramento.

A conversão das letras em vetor usa [opentype.js](https://github.com/opentypejs/opentype.js) (MIT), em `assinatura/vendor/`.
