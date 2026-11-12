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
| E-mail que recebe os pedidos com o STL anexado | `pedidos.email` (FormSubmit, sem cadastro) |
| WhatsApp, e-mail, loja, redes | `contato` |
| Materiais (10): preço de venda do rolo de 0,5 kg na Loja Integrada, SKU, densidade e prazo | `orcamento.materiais` |
| Taxas de acabamento | `orcamento.acabamentos` |
| Margem, perdas, parede, taxa por peça | `orcamento.margem`, `perdaProcesso`, `paredeMm`, `processoPorPeca` |
| Faixas P/M/G e pedido mínimo | `orcamento.faixas` |
| Maior peça aceita | `orcamento.pecaMaxima` |

Os preços de material são o **preço de venda de cada filamento FilaSinter 0,5 kg na Loja Integrada** (Catalogo_Loja_Integrada_Consolidado.xlsx, 12/11/2026), e as densidades vêm das descrições dos produtos. O Pyrex ainda não está na loja: o preço foi calculado pela mesma regra (R$ 2.022,20). Quando um preço mudar na loja, atualize o `precoRolo` do mesmo SKU.

## Cache: depois de editar CSS ou JS

As páginas carregam os arquivos com um número de versão (`config.js?v=20261112-1730`), para o
navegador não usar uma cópia antiga. Sempre que alterar `config.js`, `style.css` ou outro JS,
troque esse número em todos os `.html` (localizar e substituir `v=20261112-1730` por um novo
valor, ex.: a data e a hora). Para conferir na hora, abra a página com Ctrl+F5.

## Como o preço é calculado

```
casca           = min(volume, área × parede)
volume efetivo  = casca + (volume − casca) × preenchimento
massa (g)       = volume efetivo × densidade × (1 + perdas)
material (R$)   = massa ÷ 500 × preço de venda do rolo de 0,5 kg na loja
acabamento (R$) = fixo + R$/cm² × área
preço por peça  = (material + taxa por peça + acabamento) × (1 + margem)
total           = máx(preço × quantidade × (1 − desconto), pedido mínimo da faixa)
```

O STL é lido no navegador do cliente para medir a peça. Um único botão, **Enviar pedido**, faz tudo em ordem:

1. envia o pedido por **FormSubmit** para `pedidos.email`, com o **STL anexado**, os dados do cliente, o resumo,
   os custos internos (material, SKU, preço do rolo, acabamento, margem, massa) e as UTMs; o cliente recebe uma
   confirmação automática;
2. leva o cliente para `obrigado.html`, que mostra o número do pedido (`ZR-AAMMDD-HHMM-XXX`) e **abre o WhatsApp
   sozinho** com o resumo (há também um botão, caso o navegador não abra).

O e-mail sai antes do WhatsApp de propósito: no celular, abrir o app do WhatsApp primeiro podia interromper o envio.
O WhatsApp não permite anexar arquivos por link; o arquivo segue pelo e-mail.

Limite de anexo: 10 MB. Arquivos maiores são compactados no navegador (`.stl.gz`; um STL de 11,7 MB virou 1,9 MB
no teste). Se ainda passar do limite, o e-mail chega com o campo `atencao_arquivo` avisando para pedir o arquivo.

### Ativar o e-mail (uma vez, antes de divulgar)

1. Publique o site e faça um pedido de teste.
2. O FormSubmit envia um e-mail "Action Required: Activate FormSubmit" para `contato@zirconiumlabs.com`.
   Clique em **Activate Form**. O pedido de teste é entregue depois disso, mas **sem o anexo**, que não é guardado
   antes da ativação.
3. Faça um segundo pedido de teste e confira se o e-mail chega com o STL anexado.
4. Opcional: o e-mail de ativação traz um endereço alternativo (código aleatório). Use-o em `pedidos.email` para
   não deixar o e-mail real visível no código do site.

## Eventos de analytics

| Evento | Quando | Meta Pixel |
|---|---|---|
| `clique_orcamento` | clique em qualquer CTA de orçamento | custom |
| `clique_whatsapp` | clique em qualquer link de WhatsApp | Contact |
| `stl_carregado` | arquivo lido no orçamentador | ViewContent |
| `envio_orcamento` | pedido enviado (com valor em BRL) | Lead |
| `pedido_confirmado` | chegada na página obrigado.html | custom |
| `clique_loja` | clique na loja de consumíveis | custom |

As UTMs da primeira visita ficam na sessão e seguem junto com o pedido (e-mail do FormSubmit).
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
                      apple-touch-icon.png, og-image.png, STL de exemplo,
                      caso-*.jpg (imagens dos casos), trelicas-metalicas.jpg,
                      metaliklab-equipamento.jpg
```
