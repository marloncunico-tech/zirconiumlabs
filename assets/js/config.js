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

  // Formspree (https://formspree.io): crie um formulário e cole o ID (ex.: "xyzabcd").
  // Sem ID, o pedido segue só por WhatsApp e o botão de e-mail abre o cliente de e-mail.
  formspreeId: "",

  // ---------------------------------------------------------------
  // Orçamentador — parâmetros de custo
  // Preço do material: valor de 1 rolo de 0,5 kg (R$).
  // Densidade: densidade do filamento impresso (g/cm³), usada para converter volume em massa.
  // VALORES DE REFERÊNCIA — revise antes de publicar.
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
      { id: "316l",   nome: "Aço inox 316L",          familia: "Aços",            densidade: 4.0, precoRolo: 1450, prazoDias: 12, cor: [0.66, 0.69, 0.72] },
      { id: "174ph",  nome: "Aço 17-4 PH",            familia: "Aços",            densidade: 4.0, precoRolo: 1500, prazoDias: 12, cor: [0.60, 0.63, 0.66] },
      { id: "h13",    nome: "Aço ferramenta (H13)",   familia: "Aços",            densidade: 4.1, precoRolo: 1600, prazoDias: 14, cor: [0.48, 0.51, 0.55] },
      { id: "cobre",  nome: "Cobre",                  familia: "Cobre e ligas",   densidade: 4.8, precoRolo: 1350, prazoDias: 10, cor: [0.80, 0.45, 0.28] },
      { id: "bronze", nome: "Bronze",                 familia: "Cobre e ligas",   densidade: 4.7, precoRolo: 1300, prazoDias: 10, cor: [0.72, 0.53, 0.30] },
      { id: "latao",  nome: "Latão",                  familia: "Cobre e ligas",   densidade: 4.5, precoRolo: 1300, prazoDias: 10, cor: [0.82, 0.68, 0.36] },
      { id: "inconel",nome: "Inconel 625",            familia: "Superligas",      densidade: 4.2, precoRolo: 2400, prazoDias: 15, cor: [0.55, 0.57, 0.58] },
      { id: "boro",   nome: "Borossilicato",          familia: "Vidros e cerâmicas", densidade: 1.9, precoRolo: 900, prazoDias: 12, cor: [0.80, 0.88, 0.90] },
      { id: "porc",   nome: "Porcelana",              familia: "Vidros e cerâmicas", densidade: 2.0, precoRolo: 800, prazoDias: 12, cor: [0.93, 0.92, 0.89] }
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
