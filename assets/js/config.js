/*
 * Zirconium — configuração central do site.
 * Tudo que você precisa trocar fica aqui: IDs de analytics, contatos,
 * preços de material, acabamentos, margem e limites do orçamentador.
 */
window.ZIRC_CONFIG = {
  // ---------------------------------------------------------------
  // Analytics (só carregam depois do consentimento LGPD)
  // Substitua pelos seus IDs. Enquanto estiver com "X", nada é carregado.
  // ---------------------------------------------------------------
  analytics: {
    ga4Id: "G-XXXXXXXXXX",        // Google Analytics 4 — ex.: "G-AB12CD34EF"
    metaPixelId: "XXXXXXXXXXXXXXX" // Meta Pixel — ex.: "123456789012345"
  },

  // ---------------------------------------------------------------
  // Contatos e links
  // ---------------------------------------------------------------
  contato: {
    whatsapp: "447470373909",                 // só dígitos, com DDI
    email: "contato@zirconiumlabs.com",
    instagram: "https://www.instagram.com/zirconiumtech/",
    linkedin: "https://www.linkedin.com/company/zirconium-medical-devices/",
    loja: "https://loja.zirctech.com",
    zirclab: "https://www.zirclab.com"
  },

  // Pedidos de orçamento: e-mail com o STL anexado via FormSubmit (https://formsubmit.co).
  // Sem cadastro. No 1º envio o FormSubmit manda um e-mail de ATIVAÇÃO para este endereço:
  // clique em "Activate Form" e depois faça um pedido de teste. Limite: 10 MB por envio
  // (arquivos maiores são compactados em .gz; acima disso o e-mail avisa que falta o arquivo).
  pedidos: {
    email: "contato@zirconiumlabs.com"
  },

  // ---------------------------------------------------------------
  // Orçamentador — parâmetros de custo
  // precoRolo: preço de VENDA de 1 rolo FilaSinter 1,75 mm / 0,5 kg na Loja Integrada
  //            (Catalogo_Loja_Integrada_Consolidado.xlsx, coluna "Preço cadastrado na loja R$").
  // densidade: densidade do filamento (g/cm³), ponto médio da faixa informada na descrição do produto.
  // Custo do material da peça = massa (g) ÷ 500 × precoRolo.
  // Ao mudar um preço na loja, atualize o precoRolo correspondente (o sku ajuda a achar o item).
  // ---------------------------------------------------------------
  orcamento: {
    margem: 0.60,              // margem de lucro sobre o custo (0,60 = 60%)
    perdaProcesso: 0.10,       // purga, suportes e perdas (10%)
    paredeMm: 1.2,             // espessura de parede/casca usada no cálculo de preenchimento
    processoPorPeca: 0,        // taxa fixa opcional por peça (impressão + sinterização), em R$
    preenchimentoPadrao: 100,  // % — peças metálicas sinterizadas costumam ir a 100%
    descontosQuantidade: [     // aplicados sobre o total
      { aPartirDe: 10, desconto: 0.10 },
      { aPartirDe: 5,  desconto: 0.05 }
    ],
    // Faixas por maior dimensão da peça; o valor é o pedido mínimo da faixa.
    faixas: [
      { id: "P", ateMm: 60,       minimo: 290 },
      { id: "M", ateMm: 150,      minimo: 690 },
      { id: "G", ateMm: Infinity, minimo: 1490 }
    ],
    // Maior peça final (após retração da sinterização), em mm — x, y, z.
    pecaMaxima: [360, 360, 320],
    materiais: [
      { id: "m300",     nome: "Aço ferramenta M300",                 familia: "Aços",               sku: "FM300175500G", precoRolo: 2565.31, densidade: 3.575, prazoDias: 14, cor: [0.50, 0.53, 0.57] },
      { id: "174",      nome: "Aço inox 17-4",                       familia: "Aços",               sku: "F174175500G",  precoRolo: 2808.27, densidade: 3.70,  prazoDias: 12, cor: [0.60, 0.63, 0.66] },
      { id: "316l",     nome: "Aço inox 316L",                       familia: "Aços",               sku: "FSS175500G",   precoRolo: 2836.86, densidade: 3.50,  prazoDias: 12, cor: [0.66, 0.69, 0.72] },
      { id: "bronze",   nome: "Bronze",                              familia: "Cobre e ligas",      sku: "FBR175500G",   precoRolo: 2393.80, densidade: 4.30,  prazoDias: 10, cor: [0.72, 0.53, 0.30] },
      { id: "cobre",    nome: "Cobre",                               familia: "Cobre e ligas",      sku: "FCU175500G",   precoRolo: 1864.99, densidade: 4.65,  prazoDias: 10, cor: [0.80, 0.45, 0.28] },
      { id: "inconel",  nome: "Inconel 718",                         familia: "Superligas",         sku: "F718175500G",  precoRolo: 4037.40, densidade: 3.90,  prazoDias: 15, cor: [0.55, 0.57, 0.58] },
      { id: "aluminio", nome: "Alumínio 6061",                       familia: "Metais leves",       sku: "FAL175500G",   precoRolo: 3265.62, densidade: 1.35,  prazoDias: 12, cor: [0.78, 0.80, 0.83] },
      // Pyrex: ainda não cadastrado na loja; preço calculado pela mesma regra (US$ 153,99 → R$ 2.022,20)
      { id: "pyrex",    nome: "Pyrex (borossilicato)",               familia: "Vidros e cerâmicas", sku: "FPB175500G",   precoRolo: 2022.20, densidade: 1.50,  prazoDias: 12, cor: [0.80, 0.88, 0.90] },
      { id: "porcelana",nome: "Porcelana",                           familia: "Vidros e cerâmicas", sku: "FPO175500G",   precoRolo: 2007.91, densidade: 1.45,  prazoDias: 12, cor: [0.93, 0.92, 0.89] },
      // Na loja: "FilaSinter Cerâmico Silicato de Zircônio (Zircopax®)"
      { id: "zirconia", nome: "Zircônia (dissilicato de zircônia)",  familia: "Vidros e cerâmicas", sku: "FZS175500G",   precoRolo: 3694.39, densidade: 2.145, prazoDias: 14, cor: [0.95, 0.95, 0.92] }
    ],
    // Acabamento: valor fixo por peça + valor por cm² de superfície (R$).
    acabamentos: [
      { id: "bruto",   nome: "Bruto (como sai do forno)", fixo: 0,  porCm2: 0 },
      { id: "lixado",  nome: "Lixado",                    fixo: 40, porCm2: 0.8 },
      { id: "polido",  nome: "Polido",                    fixo: 90, porCm2: 2.0 },
      { id: "pintado", nome: "Pintado",                   fixo: 70, porCm2: 1.5 }
    ]
  }
};
