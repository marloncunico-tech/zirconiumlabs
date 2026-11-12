# Site Zirconium (GitHub Pages)

Site estático da pivotagem: peças sob demanda a partir do CAD, orçamento online com STL,
landing pages por persona, MetalikLab, loja e analytics com consentimento LGPD.

## Publicar no GitHub Pages

1. Crie um repositório (ex.: `zirconium-site`) e envie todo o conteúdo desta pasta para a raiz da branch `main`.
2. No GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
3. Domínio: o arquivo `CNAME` já aponta para `www.zirconiumlabs.com.br`. No DNS do domínio:
   - `www` → registro **CNAME** para `<seu-usuario>.github.io`
   - domínio raiz (`zirconiumlabs.com.br`) → registros **A** para 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
4. Em Settings → Pages, marque **Enforce HTTPS** quando o certificado for emitido.
5. Para testar antes de trocar o domínio, apague o `CNAME` e use `https://<usuario>.github.io/zirconium-site/`.

## O que configurar (um único arquivo: `assets/js/config.js`)

| Item | Campo |
|---|---|
| Google Analytics 4 | `analytics.ga4Id` |
| Meta Pixel | `analytics.metaPixelId` |
| Cópia do pedido por e-mail | `formspreeId` (crie em formspree.io) |
| WhatsApp, e-mail, loja, redes | `contato` |
| Preço do rolo de 0,5 kg, densidade e prazo por material | `orcamento.materiais` |
| Taxas de acabamento | `orcamento.acabamentos` |
| Margem, perdas, parede, taxa por peça | `orcamento.margem`, `perdaProcesso`, `paredeMm`, `processoPorPeca` |
| Faixas P/M/G e pedido mínimo | `orcamento.faixas` |
| Maior peça aceita | `orcamento.pecaMaxima` |

Os preços de material vêm preenchidos com **valores de referência**. Revise antes de publicar.

## Como o preço é calculado

```
casca           = min(volume, área × parede)
volume efetivo  = casca + (volume − casca) × preenchimento
massa (g)       = volume efetivo × densidade × (1 + perdas)
material (R$)   = massa ÷ 500 × preço do rolo de 0,5 kg
acabamento (R$) = fixo + R$/cm² × área
preço por peça  = (material + taxa por peça + acabamento) × (1 + margem)
total           = máx(preço × quantidade × (1 − desconto), pedido mínimo da faixa)
```

O STL é lido no navegador do cliente (nada é enviado ao servidor). O pedido abre no WhatsApp
com o resumo pronto e, se o Formspree estiver configurado, uma cópia com os custos internos vai
para o e-mail da empresa.

## Eventos de analytics

| Evento | Quando | Meta Pixel |
|---|---|---|
| `clique_orcamento` | clique em qualquer CTA de orçamento | custom |
| `clique_whatsapp` | clique em qualquer link de WhatsApp | Contact |
| `stl_carregado` | arquivo lido no orçamentador | ViewContent |
| `envio_orcamento` | pedido enviado (com valor em BRL) | Lead |
| `clique_loja` | clique na loja de consumíveis | custom |

As UTMs da primeira visita ficam na sessão e seguem junto com o pedido (Formspree).
Marque `envio_orcamento` como **conversão** no GA4.

## Estrutura

```
index.html            Home: do CAD à peça, faixas P/M/G, lote R$ 990
orcamento.html        Orçamentador online (STL, 3D, preço, pedido)
makers.html           LP makers e hobbistas
startups.html         LP startups de hardware
ferramentarias.html   LP ferramentarias (refrigeração conformal)
metaliklab.html       Studio, STD e IG, tecnologias FST/SST/SFT
materiais.html        Materiais e disponibilidade
cases.html            Casos com números
privacidade.html      Política LGPD
404.html, sitemap.xml, robots.txt, CNAME, .nojekyll
assets/css/style.css
assets/js/config.js   ← configuração
assets/js/analytics.js, main.js, stl.js, viewer.js, quote.js
assets/img/           logo-zirconium.png (cabeçalho), logo-zirconium-branco.png (rodapé),
                      logo-marca*.svg (marca vetorial: azul, escura, branca; favicon),
                      apple-touch-icon.png, og-image.png, STL de exemplo
```
