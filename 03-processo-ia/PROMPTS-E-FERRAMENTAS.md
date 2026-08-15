# Anexo B — Documentação do processo com IA: ferramentas e prompts utilizados

Este anexo documenta, de forma transparente e reproduzível, como as ferramentas de IA foram usadas para chegar à proposta CicloVerde — do mapeamento do mercado à validação da originalidade da ideia.

---

## 1. Ferramentas utilizadas

| Ferramenta | Papel no processo |
|---|---|
| **Assistente de IA com busca na web em tempo real** (ex.: ChatGPT com navegação / Perplexity / Gemini) | Pesquisa de mercado: varredura de notícias, comunicados oficiais e análises sobre concorrentes e regulação, sempre com retorno das fontes para verificação |
| **LLM em modo raciocínio/análise** | Cruzamento dos achados, identificação de lacunas competitivas, estruturação do racional econômico e "advogado do diabo" (teste de estresse da ideia) |
| **Verificação manual das fontes** | Toda afirmação relevante foi checada no link original (imprensa especializada, comunicados das montadoras, textos de lei no Planalto/Presidência) antes de entrar na proposta |

**Princípio de método**: a IA foi usada como *aceleradora de pesquisa e sparring de raciocínio*, nunca como fonte final. Nenhum dado entrou na proposta sem fonte verificável (todas listadas no [Anexo A](../02-pesquisa/PESQUISA-CONCORRENTES.md)).

---

## 2. Etapa 1 — Varredura do mercado: o que os concorrentes estão fazendo

**Objetivo**: mapear inovações "além do veículo" (assinatura, financiamento, recarga, serviços conectados, sustentabilidade) de montadoras chinesas e de outras origens na América do Sul.

**Prompt 1.1**
> "Pesquise o que as montadoras chinesas (BYD, GWM, Chery/Omoda & Jaecoo) estão desenvolvendo ou testando no mercado sul-americano, especialmente no Brasil, em serviços além do veículo: infraestrutura de carregamento, carro por assinatura, modelos de financiamento, serviços conectados e iniciativas de sustentabilidade. Traga notícias recentes com fontes."

*Principais retornos*: rede de 1.000 carregadores Flash Charging da BYD até 2027 e ecossistema de Camaçari; Assinatura GWM com Localiza/Movida/Unidas; financiamento 100% online da GWM com Mercado Livre; taxa zero de 60 meses da Omoda & Jaecoo.

**Prompt 1.2**
> "Além das chinesas, quais montadoras tradicionais (VW, Toyota, Renault, GM) oferecem no Brasil serviços de assinatura, programas de sustentabilidade ligados ao carro conectado ou monetização de dados/emissões? Cite programas específicos com fontes."

*Principal retorno*: programa "Abasteça Consciente" da VW — telemetria mostrando CO₂ evitado com etanol, mas **sem recompensa financeira**. Este achado foi decisivo: mostrou o conceito validado e o elo em aberto.

---

## 3. Etapa 2 — Leitura do incumbente: a estratégia da Stellantis na região

**Objetivo**: garantir que a proposta se apoiasse nos ativos e na estratégia reais da Stellantis (aderência), em vez de ser uma ideia genérica.

**Prompt 2.1**
> "Resuma a estratégia atual da Stellantis para a América do Sul: investimentos anunciados, o programa Bio-Hybrid (etanol + eletrificação), participação de mercado, papel das fábricas de Betim, Goiana e Porto Real, e a parceria com a Leapmotor. Use fontes oficiais e imprensa especializada."

*Principais retornos*: R$ 32 bilhões (2025–2030), Betim como centro global do Bio-Hybrid, 6 híbridos flex em 2026, ~22,8% de share e meta de 1 milhão de veículos/ano, Leapmotor em Goiana.

---

## 4. Etapa 3 — Busca da lacuna: cruzando os mapas

**Objetivo**: encontrar o "espaço vazio" entre o que os concorrentes fazem e o que a Stellantis tem de único.

**Prompt 3.1**
> "Compare: (a) as inovações das montadoras chinesas no Brasil se apoiam em eletrificação plena e infraestrutura de recarga; (b) a Stellantis apostou no etanol com o Bio-Hybrid. Existe algum mecanismo econômico no Brasil que transforme o uso de etanol em valor financeiro mensurável? Explique RenovaBio, CBIOs e o novo mercado regulado de carbono (Lei 15.042/2024), com fontes."

*Principais retornos*: mecânica dos CBIOs (1 crédito = 1 tCO₂ evitada, negociado na B3), criação do SBCE pela Lei 15.042/2024 e o debate de harmonização com o RenovaBio. Aqui surgiu a hipótese central: *o CO₂ evitado pelo cliente que roda com etanol é um ativo mensurável — e o carro conectado é o instrumento de medição.*

**Prompt 3.2**
> "Já existe no Brasil algum programa que converta dados de telemetria veicular em créditos de carbono ou recompensas financeiras para o motorista? Montadoras, apps de mobilidade ou startups. Traga casos concretos com fontes."

*Principais retornos*: piloto 99/Osten/IturanMob/BVM12 (até R$ 200/mês para motoristas de app, créditos negociados na B3) e plataformas como Matrix Carbon. Conclusão: o modelo já foi validado em nicho, **mas nenhuma montadora o opera em escala com dados de fábrica** — a lacuna estava confirmada.

---

## 5. Etapa 4 — Teste de originalidade e estresse da ideia

**Objetivo**: verificar se a ideia era de fato original e resistente a objeções antes de escrevê-la.

**Prompt 4.1 (originalidade)**
> "Alguma montadora no mundo já monetiza a descarbonização gerada pelos próprios clientes (créditos de carbono a partir do uso do veículo) e devolve parte do valor ao consumidor? Procure casos nos EUA, Europa, China e América Latina."

*Retorno*: nenhum programa de montadora fechando o ciclo completo foi encontrado — apenas iniciativas informativas (VW) ou de terceiros (startups/apps). Casos de venda de créditos regulatórios entre montadoras (ex.: créditos de emissão vendidos pela Tesla a outras fabricantes) existem, mas não envolvem o consumidor nem biocombustível.

**Prompt 4.2 (advogado do diabo)**
> "Aja como um executivo cético da Stellantis e ataque esta ideia: um programa que mede via telemetria o CO₂ evitado por clientes que rodam com etanol, certifica e monetiza esses créditos e devolve parte ao cliente. Liste os 5 maiores riscos: regulatórios, de dupla contagem, de viabilidade econômica por veículo, de privacidade e de volatilidade do preço do carbono."

*Retornos incorporados à proposta*: (i) hoje só produtores de biocombustível emitem CBIOs → decisão de começar pelo **mercado voluntário**; (ii) risco de dupla contagem → metodologia focada na **adicionalidade comportamental do consumidor**; (iii) valor unitário modesto (~R$ 90–180/carro/ano) → racional econômico reancorado em **retenção, pós-venda e hedge regulatório**; (iv) LGPD → desenho **opt-in** com transparência; (v) volatilidade → quatro fontes de valor e teto orçamentário para recompensas.

**Prompt 4.3 (validação dos números)**
> "Verifique este cálculo: um carro flex que roda 12.000 km/ano a ~12 km/l consome ~1.000 litros; a gasolina emite ~2,3 kg de CO₂ por litro; o etanol, na análise do poço à roda, reduz 70–80% das emissões. Quanto CO₂ um motorista evita por ano rodando majoritariamente com etanol, e quanto isso vale a preços de CBIO (R$ 60–100/t)?"

*Retorno*: ~1,5–1,8 tCO₂e evitadas/ano → ~R$ 90–180/carro/ano — números conservadores usados na proposta, com a leitura honesta de que o carbono sozinho não sustenta o programa.

---

## 6. O que a IA agregou (e o que ficou por minha conta)

- **A IA acelerou**: varredura de dezenas de fontes em horas, tradução de leis e mecanismos regulatórios complexos (RenovaBio, SBCE) em linguagem operacional, e o teste sistemático de objeções.
- **Ficou por minha conta**: a formulação da hipótese ("etanol como ativo financeiro do cliente"), a decisão de mudar o tabuleiro competitivo em vez de copiar as chinesas, o desenho do programa em três camadas, o racional econômico com leitura crítica dos números e a estruturação final da proposta.

Essa divisão reflete como pretendo usar IA profissionalmente: **máquina para amplitude e velocidade; julgamento humano para hipótese, ceticismo e decisão.**
