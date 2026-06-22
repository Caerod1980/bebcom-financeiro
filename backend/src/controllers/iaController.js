const Entry = require('../models/Entry');
const Account = require('../models/Account');
const ManagementReport = require('../models/ManagementReport');
const InventoryBalance = require('../models/InventoryBalance');
const ExecutiveMemoryEvent = require('../models/ExecutiveMemoryEvent');
const iaKnowledgeBase = require('../data/iaKnowledgeBase');

let lastIAContext = {
  intent: null,
  topic: null,
  periodLabel: null,
  summary: null,
  recommendedNextStep: null,
  lastAnswerType: null,
  updatedAt: null,
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const INVENTORY_REFERENCE_VALUE = 27830;

const getInventoryInitialStock = (ctx) =>
  Number(ctx.inventory?.initialStock || 0);

const getInventoryStockBalance = (ctx) =>
  Number(ctx.inventory?.stockBalance || 0);

const getInventoryEstimatedPosition = (ctx) =>
  getInventoryInitialStock(ctx) + getInventoryStockBalance(ctx);

const getInventoryGrowthAmount = (ctx) =>
  getInventoryEstimatedPosition(ctx) - getInventoryInitialStock(ctx);

const updateExecutiveContext = ({
  intent = null,
  topic = null,
  periodLabel = null,
  summary = null,
  recommendedNextStep = null,
  lastAnswerType = null,
}) => {
  lastIAContext = {
    intent,
    topic,
    periodLabel,
    summary,
    recommendedNextStep,
    lastAnswerType,
    updatedAt: new Date(),
  };
};

const buildConsultiveClosing = ({
  situation,
  recommendation,
}) => {
  return `
━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${situation}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${recommendation}
`.trim();
};

const bebcomBrain = {
  identity: {
    name: 'Bebidas & Companhia',
    brandNickname: 'Bebcom',
    foundedAt: '27/03/2021',
    businessType:
      'Conveniência física e delivery com amplo mix de bebidas, mercearia, tabacaria, drinks e espaço lounge para eventos.',
    positioning:
      'Preço justo, cerveja sempre gelada, grande variedade de produtos e atendimento com excelência.',
    vision:
      'Tornar-se a maior e melhor rede de conveniência com espaço agregado para festas, eventos e confraternizações, com potencial de expansão por franquias em todo o Brasil.',
  },

  history: [
    'A Bebidas & Companhia iniciou suas atividades em 27 de março de 2021.',
    'A loja nasceu da oportunidade de atender uma região em crescimento com uma conveniência completa.',
    'No primeiro ano, os empreendedores não realizaram retirada de salário e reinvestiram o lucro em freezers, reformas, mix de produtos e capital de giro.',
    'A loja cresceu ouvindo os clientes, ampliando produtos com demanda e retirando itens com baixo giro.',
    'A construção de condomínios próximos à loja impulsionou o fluxo e ajudou a formar uma base fiel de clientes.',
  ],

  values: [
    'Preço justo.',
    'Cerveja sempre gelada.',
    'Atendimento próximo e de excelência.',
    'Grande variedade de produtos.',
    'Adaptação constante ao cliente.',
    'Controle operacional para sustentar crescimento.',
  ],

  challenges: [
    'Restrições operacionais durante a pandemia.',
    'Dificuldade de obter preços competitivos com fornecedores para pequeno comércio.',
    'Necessidade de manter estoque para alto volume de vendas.',
    'Busca por melhores prazos com fornecedores.',
    'Ajuste de preços no iFood considerando taxas e concorrência.',
    'Contratação e controle de funcionários de confiança.',
    'Risco de desvios financeiros e de mercadorias.',
    'Concorrência próxima com preços agressivos.',
  ],

  lessons: [
    'Com funcionários, o estoque deve ser contado frequentemente e comparado com relatórios de venda.',
    'Câmeras devem ser monitoradas como ferramenta de gestão e prevenção.',
    'Relatórios mensais revelam falhas administrativas e operacionais invisíveis no dia a dia.',
    'Focar apenas em vendas pode esconder problemas de margem, estoque, caixa e operação.',
    'Crescimento sem controle de compras pode pressionar o caixa.',
    'A Bebcom historicamente reage melhor com eficiência operacional, revisão de preços, fornecedores e mix do que apenas reduzindo preço.',
  ],

  milestones: {
    bestRevenueMonth: {
      period: 'Dezembro/2023',
      amount: 122524.10,
      note: 'Maior faturamento mensal registrado na história da loja.',
    },
    hardestFinancialMonth: {
      period: 'Junho/2025',
      amount: 57062.92,
      note:
        'Pior momento financeiro percebido pela gestão, não pelo menor faturamento, mas pelo peso do custo operacional, especialmente funcionários.',
    },
  },

  keyCategories: [
    'Cervejas',
    'Destilados',
    'Refrigerantes',
    'Energético',
    'Tabacaria',
  ],

  keyProducts: [
    'Antarctica Pilsen',
    'Brahma',
    'Coca Cola',
    'Heineken',
    'Monster',
  ],

  strategicTurns: [
    'Implantação de energia solar em 2023.',
    'Redução do quadro de funcionários.',
    'Reavaliação de preços diante de nova concorrência.',
    'Expansão do mix de mercearia.',
    'Reorganização da vitrine da loja.',
    'Busca por novos fornecedores.',
  ],

  timeline: [
  {
    year: 2021,
    event: 'Fundação da Bebidas & Companhia em 27/03/2021.',
    lesson:
      'O início exigiu reinvestimento, construção de estrutura, formação de mix e foco total em crescimento sustentável.',
  },
  {
    year: 2022,
    event: 'Ação de fidelização com camisas comemorativas da Copa do Mundo.',
    lesson:
      'Marketing com vínculo emocional fortalece relacionamento e ajuda na fidelização dos clientes.',
  },
  {
    year: 2023,
    event: 'Maior faturamento mensal da história em Dezembro/2023.',
    lesson:
      'A Bebcom mostrou capacidade real de alto faturamento quando estoque, demanda, atendimento e operação trabalham alinhados.',
  },
  {
    year: 2023,
    event: 'Implantação da energia solar.',
    lesson:
      'Decisões estruturais que reduzem custos fixos aumentam a resistência financeira da operação.',
  },
  {
    year: 2025,
    event: 'Junho/2025 foi percebido como o pior momento financeiro.',
    lesson:
      'Alto custo operacional, especialmente com funcionários, pode comprometer a saúde financeira mesmo quando o faturamento não é o menor.',
  },
  {
    year: 2025,
    event: 'Abertura de concorrente próximo em Dezembro/2025.',
    lesson:
      'Preço baixo do concorrente não substitui relacionamento, atendimento, variedade e confiança construída com o cliente.',
  },
  {
    year: 2026,
    event: 'Fechamento do concorrente próximo em Maio/2026.',
    lesson:
      'A permanência dos clientes reforçou a força da identidade, atendimento e padrão próprio da Bebcom.',
  },
],

managementPhilosophy: [
  'Planejamento, execução e controle são os três pilares da gestão da Bebcom.',
  'Crescimento rápido pode gerar ânimo e recursos, mas precisa acontecer com segurança e escala responsável.',
  'Quando o caixa aperta, a primeira reação deve ser procurar melhorias dentro da operação.',
  'A operação nunca deve ficar sem contagem periódica de estoque.',
  'O capital de giro deve ser acompanhado semanalmente, não apenas mensalmente.',
],

purchaseAndInventoryRules: [
  'Produto novo deve nascer de pedido real de cliente, análise de demanda, margem, caixa disponível e aderência ao mix.',
  'Faltar produto essencial é perigoso, mas sobrar produto é ainda mais perigoso porque prende capital e gera risco de perda.',
  'Produtos com baixa procura, pouca margem, custo próximo ao de marcas fortes ou preço fora da realidade devem sair do mix.',
  'Antes de comprar, a Bebcom deve cotar preço, entrega e prazo em todos os fornecedores possíveis.',
  'Estocar demais para fim de ano foi um erro que não deve ser repetido.',
],

customerPrinciples: [
  'Cliente volta por bom atendimento, produto gelado e mix de produtos.',
  'Mau atendimento, falta de produto, preço fora da realidade e clima desfavorável afastam clientes.',
  'O cliente da Bebcom valoriza ambiente familiar, fachada, público, padrão de atendimento e cerveja gelada.',
  'Quando compra em grande quantidade, o cliente espera desconto.',
  'A marca deve transmitir: tudo que eu preciso perto de mim.',
],

competitionLessons: [
  'Concorrência de preço baixo pode impactar, mas preço insustentável não mantém uma operação com custos altos.',
  'A resposta da Bebcom à concorrência deve ser qualidade, preço justo, atendimento personalizado e fidelização.',
  'Quando um concorrente baixa preço, a Bebcom deve analisar perda de volume e buscar compensação com promoções em produtos de melhor margem.',
  'A Bebcom não deve sacrificar vida pessoal e identidade apenas para vender mais.',
],

teamLessons: [
  'Funcionários não cuidam naturalmente da empresa como o dono cuidaria.',
  'Equipe exige controle de estoque, acompanhamento de vendas e monitoramento próximo.',
  'Bom funcionário executa o que se pede; excelente funcionário executa e questiona onde melhorar.',
  'Ao contratar, é essencial entender por que a pessoa quer trabalhar na Bebcom e por que essa resposta merece confiança.',
],

marketingLessons: [
  'Ação com camisas da Copa de 2022 ajudou no processo de fidelização.',
  'Instagram fortalece divulgação dos produtos e serviços, atuando junto com o movimento físico diário.',
  'O iFood vende pela marca consolidada e pela praticidade, não apenas pelo preço.',
  'O Bebcom Lounge precisa de trabalho de marketing mais consistente.',
],

failurePatterns: [
  'Não acumular reserva para comprar mercadorias à vista elevou o custo da mercadoria vendida.',
  'Trabalhar com espetinho não trouxe o resultado esperado.',
  'Diversificação sem aderência ao negócio principal pode consumir energia, estoque e capital sem retorno proporcional.',
  'Falta de mercadoria para trabalhar foi um dos momentos mais críticos da jornada.',
],

successPatterns: [
  'Preparar estoque corretamente para eventos locais pode gerar grande resultado.',
  'Reorganizar a frente da loja com produtos de maior margem melhora a experiência e o resultado.',
  'Melhorar a exposição visual ajuda o cliente a encontrar produtos e aumenta a eficiência da venda.',
  'Aplicar margens melhores desde o início teria fortalecido o negócio mais cedo.',
],

executiveInstinct: [
  'Problemas podem ser percebidos antes dos números quando o gestor fortalece presença operacional e estuda processos.',
  'Dias quentes indicam maior chance de bom volume de vendas.',
  'Chuva e frio em vários dias tendem a reduzir vendas.',
  'Movimento fraco em comércios de outros ramos pode antecipar queda no fluxo local.',
  'Relatórios não mostram totalmente o quanto o cliente se sente bem no ambiente familiar da loja.',
],

worldView: [
  'Sucesso é o resultado de todo esforço realizado em favor do objetivo.',
  'Dinheiro é consequência de ação.',
  'Uma empresa nunca pode perder sua identidade.',
  'Vender é necessidade; servir é necessário.',
  'Quem acredita sempre alcança.',
],

futureVision: [
  'A Bebcom deve chegar a 2030 onde o trabalho com excelência no presente puder colocá-la.',
  'Mesmo como franquia, a empresa não pode perder relacionamento com clientes, organização funcional e padrão próprio.',
  'A IA Bebcom deve ampliar a capacidade de gestão e preservar padrões de análise mesmo na ausência do Rodrigo.',
],

personality: {
  tone:
    'Consultora firme, direta, estratégica e parceira da gestão.',

  behavior:
    'Sempre relacionar os números atuais com a história real da Bebcom antes de recomendar ações.',

  communicationRules: [
    'Falar como uma consultora da empresa.',
    'Evitar respostas genéricas.',
    'Explicar o motivo das recomendações.',
    'Usar linguagem executiva simples.',
    'Conectar decisões atuais com experiências passadas da Bebcom.',
    'Valorizar disciplina operacional.',
    'Ser firme quando identificar riscos.',
    'Ser motivadora quando identificar evolução.'
  ]
},
};

const buildInstitutionalInsight = (ctx) => {
  const insights = [];

  if (ctx.balance < 0) {
    insights.push(
      'Pela história da Bebcom, caixa pressionado deve ser tratado com firmeza, porque crescimento sem controle de compras e despesas já se mostrou um risco operacional.'
    );
  }

  const topExpense = ctx.expenseCategories?.[0];

  if (topExpense?.category === 'compras_mercadorias') {
    insights.push(
      'Compras de mercadorias aparecem como ponto sensível. A Bebcom cresceu com variedade, mas a memória institucional mostra que mix forte precisa caminhar junto com giro e controle de estoque.'
    );
  }

  const averageTicket =
    ctx.managementReport?.averageTicket || 0;

  if (averageTicket === 0) {
    insights.push(
      'O ticket médio precisa ser alimentado para que a IA consiga analisar se a loja está vendendo apenas volume ou também melhorando qualidade de venda.'
    );
  }

  if (ctx.totalIncome > 0) {
    const distanceFromBest =
      ((ctx.totalIncome - bebcomBrain.milestones.bestRevenueMonth.amount) /
        bebcomBrain.milestones.bestRevenueMonth.amount) *
      100;

    insights.push(
      `Considerando que o período atual ainda pode estar em andamento, as entradas registradas até agora estão ${Math.abs(distanceFromBest).toFixed(1)}% ${
  distanceFromBest >= 0 ? 'acima' : 'abaixo'
} do maior mês histórico (${bebcomBrain.milestones.bestRevenueMonth.period}).`
    );
  }

  if (!insights.length) {
    insights.push(
      'A memória institucional da Bebcom reforça a importância de manter preço justo, variedade, atendimento forte e controle operacional.'
    );
  }

  return insights;
};

const buildTemporalMemoryInsight = (ctx) => {
  const insights = [];

  const purchases =
    ctx.expenseCategories?.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases &&
    ctx.totalIncome > 0
      ? (
          purchases.amount /
          ctx.totalIncome
        ) * 100
      : 0;

  if (purchaseShare > 70) {
    insights.push(
      'A memória da Bebcom mostra que crescimento sem controle de compras costuma pressionar o caixa.'
    );
  }

  if (ctx.balance < 0) {
    insights.push(
      'Historicamente, quando o caixa aperta, Rodrigo procura primeiro melhorias dentro da própria operação antes de buscar soluções externas.'
    );
  }

  const ticket =
    ctx.managementReport?.averageTicket || 0;

  if (ticket > 0 && ticket < 20) {
    insights.push(
      'A experiência acumulada da Bebcom mostra que aumentar ticket médio costuma gerar resultado mais rápido do que simplesmente tentar aumentar fluxo.'
    );
  }

 const inventoryPosition =
  getInventoryEstimatedPosition(ctx);

if (
  purchases &&
  inventoryPosition > purchases.amount
) {
    insights.push(
      'A memória operacional da empresa alerta que excesso de estoque é mais perigoso do que falta de estoque.'
    );
  }

  if (
    ctx.pendingPayable >
    ctx.totalIncome
  ) {
    insights.push(
      'A Bebcom já enfrentou momentos em que contas pendentes cresceram mais rápido do que as vendas. Isso exige atenção imediata.'
    );
  }

  if (!insights.length) {
    insights.push(
      'Os indicadores atuais não estão repetindo nenhum padrão crítico já registrado na memória da empresa.'
    );
  }

  return insights;
};

const buildRodrigoExecutiveOpinion = (ctx) => {
  const opinions = [];

  const purchases =
    ctx.expenseCategories?.find(
      item =>
        item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases &&
    ctx.totalIncome > 0
      ? (
          purchases.amount /
          ctx.totalIncome
        ) * 100
      : 0;

  if (ctx.balance < 0) {
    opinions.push(
      'Quando o caixa aperta, a primeira reação deve ser procurar melhorias dentro da própria operação antes de buscar soluções externas.'
    );
  }

  if (purchaseShare > 60) {
    opinions.push(
      'Pela experiência da Bebcom, excesso de estoque costuma ser mais perigoso do que falta de estoque.'
    );
  }

  if (ctx.pendingPayable > ctx.totalIncome) {
    opinions.push(
      'Contas pendentes crescendo mais rápido que vendas exigem disciplina financeira imediata.'
    );
  }

  if (
    ctx.managementReport?.averageTicket > 0 &&
    ctx.managementReport.averageTicket < 20
  ) {
    opinions.push(
      'Eu procuraria aumentar o ticket médio antes de buscar crescimento apenas por volume.'
    );
  }

  if (!opinions.length) {
    opinions.push(
      'Os números atuais não indicam repetição de erros históricos da Bebcom.'
    );
  }

  return opinions;
};

const buildInstitutionalMemoryAnswer = (
  question,
  currentCtx
) => {

  const lower =
    String(question || '').toLowerCase();

  // ERRO HISTÓRICO

  if (
    lower.includes('erro histórico') ||
    lower.includes('erro historico')
  ) {
    return `
🧠 MEMÓRIA INSTITUCIONAL

━━━━━━━━━━━━━━━━━━

O principal erro histórico que eu evitaria repetir neste momento é permitir que o estoque cresça mais rápido do que a capacidade de giro da operação.

A experiência da Bebcom mostrou que excesso de estoque é mais perigoso do que falta de estoque.

Capital parado reduz capacidade de reposição, aumenta risco de perdas e pressiona o caixa.

Além disso, a falta de contagem periódica foi identificada como um dos erros administrativos mais caros da história da empresa.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Antes de ampliar compras, confirme se o estoque atual está realmente se transformando em vendas.
`.trim();
  }

  // EXPERIÊNCIA DA BEBCOM

  if (
    lower.includes('experiência da bebcom') ||
    lower.includes('experiencia da bebcom')
  ) {
    return `
🧠 EXPERIÊNCIA ACUMULADA DA BEBCOM

━━━━━━━━━━━━━━━━━━

A experiência da empresa ensina que os maiores riscos normalmente não começam nas vendas.

Eles começam quando:

• o estoque cresce sem giro;
• as contas pendentes aumentam;
• o gestor perde proximidade com a operação;
• compras passam a acontecer sem planejamento.

━━━━━━━━━━━━━━━━━━

💡 O que a história da Bebcom mostra

Nos momentos em que a operação esteve mais organizada, a empresa cresceu mantendo controle sobre estoque, compras e atendimento.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Continue acompanhando caixa, estoque e vencimentos antes que os indicadores financeiros mostrem deterioração.
`.trim();
  }

  // CRESCIMENTO OU CORREÇÃO

  if (
    lower.includes('crescimento') &&
    lower.includes('correção')
  ) {
    return `
🧭 POSICIONAMENTO ESTRATÉGICO

━━━━━━━━━━━━━━━━━━

Hoje eu considero que a Bebcom está mais próxima de uma fase de correção operacional do que de expansão.

━━━━━━━━━━━━━━━━━━

Motivos:

• contas pendentes continuam elevadas;
• compras ainda possuem peso relevante;
• ticket médio precisa evoluir;
• a operação pode ganhar eficiência antes de buscar crescimento adicional.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Primeiro fortalecer a estrutura.

Depois acelerar crescimento.

A história da Bebcom mostra que crescimento sustentável acontece quando caixa, compras e operação estão alinhados.
`.trim();
  }

  // O QUE APRENDI

  if (
    lower.includes('aprendi nesses') ||
    lower.includes('aprendi nestes') ||
    lower.includes('aprendi em')
  ) {
    return `
📚 LIÇÕES DA JORNADA BEBCOM

━━━━━━━━━━━━━━━━━━

Ao longo dos anos a Bebcom aprendeu que:

• preço justo vence preço irresponsável;
• estoque precisa ser controlado continuamente;
• atendimento fideliza mais que promoções isoladas;
• capital de giro deve ser acompanhado semanalmente;
• fornecedores precisam ser constantemente avaliados;
• crescimento sem controle gera problemas futuros.

━━━━━━━━━━━━━━━━━━

💡 Conclusão

A combinação entre organização, atendimento e disciplina operacional sempre trouxe mais resultado do que decisões impulsivas.
`.trim();
  }

  // O QUE FARIA DIFERENTE

  if (
    lower.includes('faria diferente')
  ) {
    return `
🔎 VISÃO RETROSPECTIVA

━━━━━━━━━━━━━━━━━━

Se pudesse voltar ao início da jornada, algumas decisões seriam antecipadas:

• aplicar margens melhores mais cedo;
• fortalecer reserva financeira;
• implantar contagem de estoque antes;
• acompanhar capital de giro semanalmente;
• revisar mix de produtos com maior frequência.

━━━━━━━━━━━━━━━━━━

🎯 Minha leitura

Essas mudanças não alterariam a essência da Bebcom.

Elas apenas permitiriam chegar mais rápido ao nível de organização atual.
`.trim();
  }

  // FILOSOFIA DE GESTÃO

if (
  lower.includes('filosofia de gestão') ||
  lower.includes('filosofia de gestao') ||
  lower.includes('filosofia da bebcom') ||
  lower.includes('gestão da bebcom') ||
  lower.includes('gestao da bebcom')
) {
  return `
🧭 FILOSOFIA DE GESTÃO DA BEBCOM

━━━━━━━━━━━━━━━━━━

A filosofia de gestão da Bebcom se apoia em três pilares:

• planejamento;
• execução;
• controle.

Neste cenário, a recomendação mais coerente com a história da empresa é não tomar decisões apenas pelo saldo atual.

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

A Bebcom cresceu quando manteve proximidade com a operação, controle de estoque, atenção ao caixa e adaptação ao cliente.

Quando esses pontos ficam soltos, o risco aumenta mesmo com vendas acontecendo.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Antes de buscar crescimento, fortaleça controle de compras, estoque, contas pendentes e margem.
`.trim();
}

  // LIMITAÇÃO DO CRESCIMENTO

if (
  lower.includes('limitando') &&
  lower.includes('crescimento')
) {
  const purchases = currentCtx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  const purchaseShare =
    purchases && currentCtx.totalIncome > 0
      ? (purchases.amount / currentCtx.totalIncome) * 100
      : 0;

  return `
🚧 O QUE LIMITA O CRESCIMENTO DA BEBCOM AGORA

━━━━━━━━━━━━━━━━━━

O crescimento da Bebcom neste momento parece limitado menos pela falta de potencial comercial e mais pela necessidade de controle operacional.

━━━━━━━━━━━━━━━━━━

📊 Pontos que pressionam

• Contas pendentes: ${formatCurrency(currentCtx.pendingPayable)}
• Compras de mercadorias: ${
    purchases
      ? `${formatCurrency(purchases.amount)} — ${purchaseShare.toFixed(1)}% das entradas`
      : 'sem concentração relevante identificada'
  }
• Resultado atual: ${formatCurrency(currentCtx.balance)}
• Ticket médio: ${formatCurrency(currentCtx.managementReport?.averageTicket || 0)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

A Bebcom tem força de marca, atendimento e variedade. O limite atual não é identidade comercial.

O limite está em transformar vendas, estoque e compras em caixa saudável.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Trate este momento como correção operacional antes de acelerar expansão.
`.trim();
}

  // APRENDIZADO MAIS RELEVANTE

if (
  lower.includes('aprendizado da história') ||
  lower.includes('aprendizado da historia') ||
  lower.includes('mais relevante para este momento') ||
  lower.includes('mais relevante para esse momento')
) {
  return `
📌 APRENDIZADO MAIS RELEVANTE DA HISTÓRIA DA BEBCOM

━━━━━━━━━━━━━━━━━━

O aprendizado mais relevante para este momento é:

crescimento só é saudável quando compras, estoque, caixa e operação caminham juntos.

━━━━━━━━━━━━━━━━━━

🧠 O que a história mostra

A Bebcom cresceu quando ouviu clientes, organizou o mix, manteve bom atendimento e controlou melhor a operação.

Mas os maiores riscos apareceram quando estoque, capital de giro, funcionários e compras ficaram menos acompanhados.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use o resultado atual para fortalecer controle, não para criar falsa sensação de folga.
`.trim();
}

  // AUSÊNCIA DO RODRIGO

if (
  lower.includes('rodrigo') &&
  (
    lower.includes('ausentar') ||
    lower.includes('ausência') ||
    lower.includes('ausencia') ||
    lower.includes('30 dias')
  )
) {
  return `
🛡️ PROTEÇÃO DA BEBCOM NA AUSÊNCIA DO RODRIGO

━━━━━━━━━━━━━━━━━━

Se Rodrigo se ausentasse por 30 dias, eu monitoraria diariamente:

• saldo de caixa;
• contas a pagar vencidas e próximas;
• compras de mercadorias;
• estoque físico versus relatório de vendas;
• ticket médio;
• comandas;
• consumo interno;
• fornecedores críticos;
• produtos de maior giro;
• divergências operacionais.

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

A história da Bebcom mostra que a ausência de acompanhamento próximo pode abrir espaço para perda de controle em estoque, compras e operação.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Criar uma rotina diária simples: caixa, vendas, compras, estoque e vencimentos. Esses cinco pontos protegem a operação.
`.trim();
}

  return null;
};

const buildConsultiveIntroduction = (
  ctx,
  subject
) => {
  const balance = ctx.balance || 0;

  if (balance < 0) {
    return `Rodrigo,

olhando ${subject}, eu enxergo um cenário que exige atenção imediata.

A Bebcom já passou por momentos em que caixa, compras e despesas pressionaram a operação.

Por isso minha análise será focada em decisões práticas e não apenas nos números.`;
  }

  return `Rodrigo,

olhando ${subject}, vejo uma oportunidade de fortalecer ainda mais a operação.

Vou analisar os números considerando não apenas o período atual, mas também a experiência acumulada da Bebcom ao longo dos anos.`;
};

const isFollowUpQuestion = (question) => {
  const lower = String(question || '').toLowerCase().trim();

  return (
    lower === 'continue' ||
    lower === 'continua' ||
    lower === 'explique melhor' ||
    lower === 'me explique melhor' ||
    lower === 'detalhe melhor' ||
    lower === 'detalhe isso' ||
    lower === 'qual prioridade?' ||
    lower === 'qual a prioridade?' ||
    lower === 'e depois?' ||
    lower === 'e agora?' ||
    lower.includes('me explique esse ponto') ||
    lower.includes('explique esse ponto') ||
    lower.includes('continua nesse ponto') ||
    lower.includes('continue nesse ponto')
  );
};

const buildFollowUpAnswer = (
  question,
  ctx
) => {
  if (!lastIAContext || !lastIAContext.topic) {
    return null;
  }

  const topic = lastIAContext.topic;

  const topicLabels = {
    memoria_estrategica: 'memória estratégica',
    tendencias_historicas: 'tendências históricas',
    modo_ceo: 'Modo CEO',
    plano_recuperacao: 'plano de recuperação',
    decisao_executiva: 'decisão executiva',
    alertas: 'alertas gerenciais',
    fluxo_caixa: 'fluxo de caixa',
    geral: 'análise anterior',
  };

  const topicLabel =
    topicLabels[topic] || 'análise anterior';

  let focus = 'caixa, compras, despesas e contas pendentes';

  if (topic === 'memoria_estrategica') {
    focus = 'padrões que se repetem na operação';
  }

  if (topic === 'tendencias_historicas') {
    focus = 'evolução dos números ao longo dos meses';
  }

  if (topic === 'modo_ceo') {
    focus = 'prioridades executivas da operação';
  }

  if (topic === 'plano_recuperacao') {
    focus = 'ações práticas para recuperar o caixa';
  }

  if (topic === 'alertas') {
    focus = 'riscos que exigem atenção imediata';
  }

  if (topic === 'fluxo_caixa') {
    focus = 'entradas, saídas, saldo e próximos compromissos';
  }

  return `
📌 CONTINUIDADE DA ANÁLISE

━━━━━━━━━━━━━━━━━━

🧠 Assunto anterior

${topicLabel}

📍 Foco da continuidade

${focus}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

Pelo contexto anterior, eu manteria a análise concentrada no ponto mais importante antes de abrir novas frentes.

No momento, a melhor decisão é transformar o diagnóstico em ação prática.

━━━━━━━━━━━━━━━━━━

👉 O que eu faria primeiro

1. Identificar o maior ponto de pressão.
2. Separar o que é urgente do que pode ser negociado.
3. Evitar novas decisões que aumentem a pressão no caixa.
4. Acompanhar o efeito nos próximos lançamentos.

━━━━━━━━━━━━━━━━━━

✅ Próxima pergunta recomendada

“Monte um plano prático para esse ponto.”
`.trim();
};

const monthNames = [
  { number: 1, names: ['janeiro', 'jan'] },
  { number: 2, names: ['fevereiro', 'fev'] },
  { number: 3, names: ['março', 'marco', 'mar'] },
  { number: 4, names: ['abril', 'abr'] },
  { number: 5, names: ['maio', 'mai'] },
  { number: 6, names: ['junho', 'jun'] },
  { number: 7, names: ['julho', 'jul'] },
  { number: 8, names: ['agosto', 'ago'] },
  { number: 9, names: ['setembro', 'set'] },
  { number: 10, names: ['outubro', 'out'] },
  { number: 11, names: ['novembro', 'nov'] },
  { number: 12, names: ['dezembro', 'dez'] },
];

const getPeriodFromQuestion = (question) => {
  const now = new Date();
  const lower = question.toLowerCase();

  let month = now.getMonth() + 1;
  let year = now.getFullYear();

 const foundMonth = monthNames.find((item) =>
  item.names.some((name) =>
    new RegExp(`\\b${name}\\b`, 'i').test(lower)
  )
);

  if (foundMonth) {
    month = foundMonth.number;
  }

  const yearMatch = lower.match(/\b(20\d{2})\b/);

  if (yearMatch) {
    year = Number(yearMatch[1]);
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  return { month, year, start, end };
};

const getRelativePeriod = (question) => {
  const lower = question.toLowerCase();

  if (
  lower.includes('vendendo mais') ||
  lower.includes('vendi mais') ||
  lower.includes('vendas') ||
  lower.includes('faturamento') ||
  lower.includes('comandas') ||
  lower.includes('movimento')
) {
  return null;
}

  if (
  lower.includes('o que devo fazer primeiro') ||
  lower.includes('o que faço primeiro') ||
  lower.includes('o que faco primeiro') ||
  lower.includes('por onde começo') ||
  lower.includes('por onde comeco') ||
  lower.includes('prioridade financeira') ||
  lower.includes('não deveria fazer') ||
  lower.includes('nao deveria fazer')
) {
  return null;
}

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  // Hoje
  if (lower.includes('hoje')) {
    return {
      label: 'Hoje',
      start: startOfToday,
      end: endOfToday,
    };
  }

  // Ontem
  if (lower.includes('ontem')) {
    const yesterdayStart = new Date(startOfToday);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(endOfToday);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    return {
      label: 'Ontem',
      start: yesterdayStart,
      end: yesterdayEnd,
    };
  }

  // Últimos 7 dias
  if (
    lower.includes('últimos 7 dias') ||
    lower.includes('ultimos 7 dias')
  ) {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);

    return {
      label: 'Últimos 7 dias',
      start,
      end: endOfToday,
    };
  }

  // Últimos 15 dias
  if (
    lower.includes('últimos 15 dias') ||
    lower.includes('ultimos 15 dias')
  ) {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 14);

    return {
      label: 'Últimos 15 dias',
      start,
      end: endOfToday,
    };
  }

  // Últimos 30 dias
  if (
    lower.includes('últimos 30 dias') ||
    lower.includes('ultimos 30 dias')
  ) {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 29);

    return {
      label: 'Últimos 30 dias',
      start,
      end: endOfToday,
    };
  }

 // Semana passada
if (lower.includes('semana passada')) {
  const day = startOfToday.getDay();

  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;

  const currentWeekStart = new Date(startOfToday);
  currentWeekStart.setDate(
    startOfToday.getDate() + mondayOffset
  );

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(
    currentWeekStart.getDate() - 7
  );

  const lastWeekEnd = new Date(currentWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  return {
    label: 'Semana passada',
    start: lastWeekStart,
    end: lastWeekEnd,
  };
}

  // Esta semana
if (
  lower.includes('esta semana') ||
  lower.includes('essa semana')
) {
  const day = startOfToday.getDay();

  const mondayOffset =
    day === 0
      ? -6
      : 1 - day;

  const weekStart = new Date(startOfToday);
  weekStart.setDate(
    startOfToday.getDate() + mondayOffset
  );

  return {
    label: 'Esta semana',
    start: weekStart,
    end: endOfToday,
  };
}

  // Mês passado
  if (
    lower.includes('mês passado') ||
    lower.includes('mes passado')
  ) {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    return {
      label: 'Mês passado',
      start,
      end,
    };
  }

  return null;
};

const getSpecificDatePeriod = (question) => {
  const lower = question.toLowerCase();

  const dateMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);

  if (!dateMatch) {
    return null;
  }

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);

  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  return {
    label: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
    start,
    end,
  };
};

const getPartialComparisonLimitDay = (question, currentPeriod) => {
  const lower = normalizeText(question);
  const now = new Date();

  const explicitDayMatch = lower.match(/ate o dia\s+(\d{1,2})|ate dia\s+(\d{1,2})/);
  const explicitDay = explicitDayMatch
    ? Number(explicitDayMatch[1] || explicitDayMatch[2])
    : null;

  const isCurrentMonth =
    Number(currentPeriod.month) === now.getMonth() + 1 &&
    Number(currentPeriod.year) === now.getFullYear();

  if (explicitDay) return explicitDay;

 if (isCurrentMonth && !lower.includes('completo')) {
  return Math.max(1, now.getDate() - 1);
}

  return null;
};

const getComparisonPeriods = (question) => {
  const lower = question.toLowerCase();

  const now = new Date();

  if (
  lower.includes('comparado ao mês passado') ||
  lower.includes('comparado ao mes passado') ||
  lower.includes('em relação ao mês passado') ||
  lower.includes('em relacao ao mes passado') ||
  lower.includes('comparado com o mês passado') ||
  lower.includes('comparado com o mes passado') ||
  lower.includes('melhorou em relação ao mês passado') ||
  lower.includes('melhorou em relacao ao mes passado')
) {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const previousDate = new Date(
    currentYear,
    currentMonth - 2,
    1
  );

  const previousMonth = previousDate.getMonth() + 1;
  const previousYear = previousDate.getFullYear();

  return {
    current: {
      month: currentMonth,
      year: currentYear,
      start: new Date(currentYear, currentMonth - 1, 1),
      end: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999),
    },
    compare: {
      month: previousMonth,
      year: previousYear,
      start: new Date(previousYear, previousMonth - 1, 1),
      end: new Date(previousYear, previousMonth, 0, 23, 59, 59, 999),
    },
  };
}

    if (
    lower.includes('comparado ao mês passado') ||
    lower.includes('comparado ao mes passado') ||
    lower.includes('em relação ao mês passado') ||
    lower.includes('em relacao ao mes passado') ||
    lower.includes('comparado com o mês passado') ||
    lower.includes('comparado com o mes passado')
  ) {
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const previousDate = new Date(
      currentYear,
      currentMonth - 2,
      1
    );

    const previousMonth = previousDate.getMonth() + 1;
    const previousYear = previousDate.getFullYear();

    return {
      current: {
        month: currentMonth,
        year: currentYear,
        start: new Date(currentYear, currentMonth - 1, 1),
        end: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999),
      },
      compare: {
        month: previousMonth,
        year: previousYear,
        start: new Date(previousYear, previousMonth - 1, 1),
        end: new Date(previousYear, previousMonth, 0, 23, 59, 59, 999),
      },
    };
  }

  const detected = [];

  monthNames.forEach((item) => {
    item.names.forEach((name) => {
      const regex = new RegExp(
  `\\b${name}\\b\\s*(20\\d{2})?`,
  'gi'
   );

      let match;

      while ((match = regex.exec(lower)) !== null) {
        detected.push({
          month: item.number,
          year: match[1]
            ? Number(match[1])
            : now.getFullYear(),
          index: match.index,
        });
      }
    });
  });

  detected.sort((a, b) => a.index - b.index);

  const uniqueDetected = [];

  detected.forEach((item) => {
    const alreadyExists = uniqueDetected.find(
      (d) =>
        d.month === item.month &&
        d.year === item.year
    );

    if (!alreadyExists) {
      uniqueDetected.push(item);
    }
  });

  if (uniqueDetected.length >= 2) {
  const first = uniqueDetected[0];
  const second = uniqueDetected[1];
  const relationExpression =
  lower.includes('em relação a') ||
  lower.includes('em relacao a');

const versusExpression =
  lower.includes(' vs ') ||
  lower.includes(' versus ');

if (relationExpression || versusExpression) {
  return {
    current: {
      month: first.month,
      year: first.year,
      start: new Date(first.year, first.month - 1, 1),
      end: new Date(first.year, first.month, 0, 23, 59, 59, 999),
    },

    compare: {
      month: second.month,
      year: second.year,
      start: new Date(second.year, second.month - 1, 1),
      end: new Date(second.year, second.month, 0, 23, 59, 59, 999),
    },
  };
}
  return {
    current: {
      month: second.month,
      year: second.year,
      start: new Date(second.year, second.month - 1, 1),
      end: new Date(
        second.year,
        second.month,
        0,
        23,
        59,
        59,
        999
      ),
    },

    compare: {
      month: first.month,
      year: first.year,
      start: new Date(first.year, first.month - 1, 1),
      end: new Date(
        first.year,
        first.month,
        0,
        23,
        59,
        59,
        999
      ),
    },
  };
}
  return null;
};

const extractFinancialIntent = (question) => {
  const lower = question.toLowerCase();

  const categoryAliases = [
    { category: 'energia', terms: ['energia', 'cpfl', 'luz'] },
    { category: 'imposto', terms: ['imposto', 'impostos', 'tributo'] },
    { category: 'taxas', terms: ['taxa', 'taxas'] },
    { category: 'funcionarios', terms: ['funcionario', 'funcionário', 'funcionarios', 'funcionários', 'folha', 'salario', 'salário'] },
    { category: 'aluguel', terms: ['aluguel'] },
    { category: 'emprestimos', terms: ['emprestimo', 'empréstimo', 'emprestimos', 'empréstimos'] },
    { category: 'compras_mercadorias', terms: ['compra de mercadoria', 'compras de mercadorias', 'mercadorias'] },
  ];

  let detectedCategory = null;

  categoryAliases.forEach((item) => {
    if (item.terms.some((term) => lower.includes(term))) {
      detectedCategory = item.category;
    }
  });

  let supplier = null;

  const supplierPatterns = [
    /(?:fornecedor|com|despesa com|gasto com|gastou com|total de)\s+([a-zA-ZÀ-ÿ0-9\s\-]+)/i,
    /^total\s+([a-zA-ZÀ-ÿ0-9\s\-]+)/i,
  ];

  for (const pattern of supplierPatterns) {
    const match = lower.match(pattern);

    if (match?.[1]) {
      supplier = match[1]
        .replace(/esse ano/g, '')
        .replace(/este ano/g, '')
        .replace(/ano atual/g, '')
        .replace(/de janeiro a maio/g, '')
        .replace(/janeiro a maio/g, '')
        .replace(/\?/g, '')
        .trim()
        .toLowerCase();

      break;
    }
  }

  if (detectedCategory) {
    supplier = null;
  }

  return {
    wantsTotal:
      lower.includes('quanto') ||
      lower.includes('total') ||
      lower.includes('gastou') ||
      lower.includes('gasto') ||
      lower.includes('despesa'),

    category: detectedCategory,
    supplier,
  };
};
const getMonthLabel = (month, year) => {
  const fullMonths = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  return `${fullMonths[month - 1]}/${year}`;
};

const getCategoryTotals = (entries, type) => {
  const grouped = {};

  entries
    .filter((entry) => entry.type === type)
    .forEach((entry) => {
      const key = entry.category || 'sem_categoria';

      if (!grouped[key]) {
        grouped[key] = 0;
      }

      grouped[key] += Math.abs(Number(entry.amount || 0));
    });

  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const groupEntriesByField = (
  entries,
  type,
  field,
  fallback = 'não informado'
) => {
  const grouped = {};

  entries
    .filter((entry) => entry.type === type)
    .forEach((entry) => {
      const key =
        entry[field] ||
        fallback;

      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          amount: 0,
          count: 0,
        };
      }

      grouped[key].amount += Math.abs(Number(entry.amount || 0));
      grouped[key].count += 1;
    });

  return Object.values(grouped)
    .sort((a, b) => b.amount - a.amount);
};

const groupEntriesByDay = (entries, type) => {
  const grouped = {};

  entries
    .filter((entry) => entry.type === type)
    .forEach((entry) => {
      const date = new Date(entry.date)
        .toLocaleDateString('pt-BR');

      if (!grouped[date]) {
        grouped[date] = {
          name: date,
          amount: 0,
          count: 0,
        };
      }

      grouped[date].amount += Math.abs(Number(entry.amount || 0));
      grouped[date].count += 1;
    });

  return Object.values(grouped)
    .sort((a, b) => b.amount - a.amount);
};

const sumGroupedItems = (group, searchTerm) => {
  const normalizedSearch =
    normalizeText(searchTerm);

  const items = (group || []).filter((item) =>
    normalizeText(item.name).includes(normalizedSearch)
  );

  return {
    items,
    amount: items.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    ),
    count: items.reduce(
      (acc, item) => acc + Number(item.count || 0),
      0
    ),
  };
};

const formatRanking = (items, limit = 10) =>
  (items || [])
    .slice(0, limit)
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} — ${formatCurrency(item.amount)} — ${item.count} lançamento(s)`
    )
    .join('\n');

const buildContext = async ({ month, year, start, end, customLabel }) => {
  const entries = await Entry.find({
    deleted: { $ne: true },
    date: {
      $gte: start,
      $lte: end,
    },
  });

  const accounts = await Account.find({
    deleted: false,
    status: { $in: ['pending', 'overdue'] },
  });

  const managementReport = await ManagementReport.findOne({
    year,
    month,
  });

  const inventory = await InventoryBalance.findOne({
    year,
    month,
  });

  const totalIncome = entries
    .filter((entry) => entry.type === 'income')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const totalExpenses = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const balance = totalIncome - totalExpenses;

  const pendingPayable = accounts
    .filter((account) => account.type === 'payable')
    .reduce((acc, account) => acc + Math.abs(Number(account.amount || 0)), 0);

  const pendingReceivable = accounts
    .filter((account) => account.type === 'receivable')
    .reduce((acc, account) => acc + Math.abs(Number(account.amount || 0)), 0);

  const expenseCategories = getCategoryTotals(entries, 'expense');
  const incomeCategories = getCategoryTotals(entries, 'income');

  const expensesByDescription =
  groupEntriesByField(entries, 'expense', 'description');

const incomeByDescription =
  groupEntriesByField(entries, 'income', 'description');

const expensesByPerson =
  groupEntriesByField(entries, 'expense', 'person');

const incomeByPerson =
  groupEntriesByField(entries, 'income', 'person');

const expensesByPaymentMethod =
  groupEntriesByField(entries, 'expense', 'paymentMethod');

const incomeByPaymentMethod =
  groupEntriesByField(entries, 'income', 'paymentMethod');

const expensesByCostCenter =
  groupEntriesByField(entries, 'expense', 'costCenter');

const incomeByCostCenter =
  groupEntriesByField(entries, 'income', 'costCenter');

const expensesByChannel =
  groupEntriesByField(entries, 'expense', 'channel');

const incomeByChannel =
  groupEntriesByField(entries, 'income', 'channel');

const incomeByDay =
  groupEntriesByDay(entries, 'income');

const expensesByDay =
  groupEntriesByDay(entries, 'expense');

  return {
  month,
  year,
  start,
  end,
  periodLabel:
  customLabel ||
  (
    month && year
      ? getMonthLabel(month, year)
      : 'Período personalizado'
  ),
  entries,
  totalIncome,
  totalExpenses,
  balance,
  pendingPayable,
  pendingReceivable,
  managementReport,
  inventory,
  accounts,
  expenseCategories,
  incomeCategories,
  expensesByDescription,
  incomeByDescription,
  expensesByPerson,
  incomeByPerson,
  expensesByPaymentMethod,
  incomeByPaymentMethod,
  expensesByCostCenter,
  incomeByCostCenter,
  expensesByChannel,
  incomeByChannel,
  incomeByDay,
  expensesByDay,
};
};

const extractSupplierPayableName = (question) => {
  const lower = normalizeText(question);

const patterns = [
  /^total de contas a pagar\s+(?:de|da|do)?\s*(.+?)\??$/i,
  /^total contas a pagar\s+(?:de|da|do)?\s*(.+?)\??$/i,

  /^total\s+(?:de\s+)?(.+?)\s+a pagar\??$/i,
  /^(.+?)\s+a pagar\??$/i,

  /^boletos\s+(?:de|da|do)?\s*(.+?)\??$/i,
  /^boleto\s+(?:de|da|do)?\s*(.+?)\??$/i,

  /^vencimentos\s+(?:de|da|do)?\s*(.+?)\??$/i,
  /^vencimento\s+(?:de|da|do)?\s*(.+?)\??$/i,

  /^quanto devo\s+(?:para|pra|a)\s+(.+?)\??$/i,
  /^quanto tenho de\s+(.+?)\s+(?:para pagar|pra pagar|a pagar)\??$/i,
  /^quanto tem de\s+(.+?)\s+(?:para pagar|pra pagar|a pagar)\??$/i,
];

  for (const pattern of patterns) {
    const match = lower.match(pattern);

    if (match?.[1]) {
      const supplier = match[1]
        .replace(/\?/g, '')
        .trim();

    const invalidSupplierTerms = [
  'proximos 3 dias',
  'proximos 5 dias',
  'proximos 7 dias',
  '3 dias',
  '5 dias',
  '7 dias',
];

if (invalidSupplierTerms.includes(supplier)) {
  return null;
}  

      return supplier || null;
    }
  }

  return null;
};
const buildSupplierPayableAnswer = (ctx, supplierName) => {
  const supplier = String(supplierName || '').toLowerCase().trim();

  if (!supplier) return null;

  const accounts = (ctx.accounts || []).filter((account) => {
    const person = String(account.person || '').toLowerCase();
    const description = String(account.description || '').toLowerCase();

    return (
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status) &&
      (
        person.includes(supplier) ||
        description.includes(supplier)
      )
    );
  });

  if (accounts.length === 0) {
    return `
🏦 CONTAS A PAGAR — ${String(supplierName).toUpperCase()}

━━━━━━━━━━━━━━━━━━

Não encontrei contas a pagar em aberto para este fornecedor.

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Pode ser que esse fornecedor esteja cadastrado com outro nome, abreviação, acento diferente ou esteja na descrição em vez do campo Pessoa/Empresa.

🎯 Minha recomendação

Confira o cadastro do fornecedor no contas a pagar ou tente perguntar usando parte do nome.
`.trim();
  }

  const total = accounts.reduce(
    (acc, item) => acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const ordered = [...accounts].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  const nextDue = ordered[0];

  const list = ordered
    .slice(0, 10)
    .map((item, index) => {
      const date = new Date(item.dueDate).toLocaleDateString('pt-BR');

      return `${index + 1}. ${date} — ${item.description} — ${formatCurrency(item.amount)}`;
    })
    .join('\n');

  return `
🏦 CONTAS A PAGAR — ${supplierName.toUpperCase()}

━━━━━━━━━━━━━━━━━━

💰 Total em aberto
${formatCurrency(total)}

📋 Quantidade de contas
${accounts.length}

📅 Próximo vencimento
${new Date(nextDue.dueDate).toLocaleDateString('pt-BR')}

━━━━━━━━━━━━━━━━━━

📝 Detalhamento

${list}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

Esse fornecedor possui compromissos pendentes e deve ser acompanhado junto com o fluxo previsto de caixa.

👉 Próxima ação sugerida

Verifique se os vencimentos estão alinhados com as entradas previstas dos próximos dias.
`.trim();
};

const getPayableDuePeriodFromQuestion = (question) => {
  const lower = question.toLowerCase();
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() + 1);

    const end = new Date(endOfToday);
    end.setDate(end.getDate() + 1);

    return {
      label: 'amanhã',
      start,
      end,
    };
  }

  if (lower.includes('hoje')) {
    return {
      label: 'hoje',
      start: startOfToday,
      end: endOfToday,
    };
  }

  if (
    lower.includes('esta semana') ||
    lower.includes('essa semana') ||
    lower.includes('semana')
  ) {
    const start = new Date(startOfToday);
    const end = new Date(endOfToday);
    end.setDate(end.getDate() + 7);

    return {
      label: 'nos próximos 7 dias',
      start,
      end,
    };
  }

  const specific = getSpecificDatePeriod(question);

  if (specific) {
    return specific;
  }

  return null;
};

const buildPayablesDueDateAnswer = (ctx, duePeriod) => {
  if (!duePeriod) return null;

  const accounts = (ctx.accounts || []).filter((account) => {
    const dueDate = new Date(account.dueDate);

    return (
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status) &&
      dueDate >= duePeriod.start &&
      dueDate <= duePeriod.end
    );
  });

  if (accounts.length === 0) {
    return `
Não encontrei contas a pagar com vencimento ${duePeriod.label}.

Minha leitura:
Não há compromissos pendentes/vencidos cadastrados para esse período no contas a pagar.
    `.trim();
  }

  const ordered = [...accounts].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  const total = ordered.reduce(
    (acc, item) => acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const list = ordered
    .map((item, index) => {
      const date = new Date(item.dueDate).toLocaleDateString('pt-BR');
      const name = item.person || item.description || 'Conta';

      return `${index + 1}. ${date} — ${name} — ${formatCurrency(item.amount)}`;
    })
    .join('\n');

  return `
📅 VENCIMENTOS — ${duePeriod.label.toUpperCase()}

━━━━━━━━━━━━━━━━━━

💰 Total previsto
${formatCurrency(total)}

📋 Quantidade de contas
${ordered.length}

━━━━━━━━━━━━━━━━━━

📝 Contas previstas

${list}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

Esse é o valor previsto de saída para o período informado.

👉 Próxima ação sugerida

Compare esses vencimentos com o caixa disponível e priorize pagamentos críticos.
`.trim();
};


const buildGenericPayablesAnswer = (ctx, question) => {
  const lower = normalizeText(question);

  if (extractSupplierPayableName(question)) {
  return null;
}
  
  const raw = String(question || '').toLowerCase();

  const isPayableQuestion =
    lower.includes('contas a pagar') ||
    lower.includes('contas vencidas') ||
    lower.includes('contas pendentes');

  if (!isPayableQuestion) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let title = `CONTAS A PAGAR — ${ctx.periodLabel}`;
  let filterMode = 'all';
  let start = null;
  let end = null;

  const dates = [...raw.matchAll(/\b(\d{1,2})\/(\d{1,2})(?:\/(20\d{2}))?\b/g)]
    .map((m) => ({
      day: Number(m[1]),
      month: Number(m[2]),
      year: m[3] ? Number(m[3]) : (ctx.year || now.getFullYear()),
    }));

  if (lower.includes('vencidas') || lower.includes('vencidos')) {
    filterMode = 'overdue';
    title = 'CONTAS A PAGAR VENCIDAS';
  }

  if (lower.includes('hoje')) {
    filterMode = lower.includes('vencidas') || lower.includes('vencidos')
      ? 'overdue_and_today'
      : 'period';

    start = todayStart;
    end = todayEnd;
    title = filterMode === 'overdue_and_today'
      ? 'CONTAS VENCIDAS E DE HOJE'
      : 'CONTAS A PAGAR — HOJE';
  }

  if (lower.includes('amanha')) {
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    filterMode = 'period';
    start = tomorrowStart;
    end = tomorrowEnd;
    title = 'CONTAS A PAGAR — AMANHÃ';
  }

  if (dates.length >= 2) {
    filterMode = 'period';
    start = new Date(dates[0].year, dates[0].month - 1, dates[0].day, 0, 0, 0, 0);
    end = new Date(dates[1].year, dates[1].month - 1, dates[1].day, 23, 59, 59, 999);
    title = `CONTAS A PAGAR — ${start.toLocaleDateString('pt-BR')} A ${end.toLocaleDateString('pt-BR')}`;
  } else if (dates.length === 1) {
    filterMode = 'period';
    start = new Date(dates[0].year, dates[0].month - 1, dates[0].day, 0, 0, 0, 0);
    end = new Date(dates[0].year, dates[0].month - 1, dates[0].day, 23, 59, 59, 999);
    title = `CONTAS A PAGAR — ${start.toLocaleDateString('pt-BR')}`;
  }

  if (
    lower.includes('de junho') ||
    lower.includes('do mes') ||
    lower.includes('do mês') ||
    lower.includes('de mes') ||
    lower.includes('de mês')
  ) {
    const month = ctx.month || now.getMonth() + 1;
    const year = ctx.year || now.getFullYear();

    filterMode = 'period';
    start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    end = new Date(year, month, 0, 23, 59, 59, 999);
    title = `CONTAS A PAGAR — ${getMonthLabel(month, year)}`;
  }

  let accounts = (ctx.accounts || []).filter(
    (account) =>
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status)
  );

  if (filterMode === 'overdue') {
    accounts = accounts.filter(
      (account) =>
        account.status === 'overdue' ||
        new Date(account.dueDate) < todayStart
    );
  }

  if (filterMode === 'overdue_and_today') {
    accounts = accounts.filter((account) => {
      const due = new Date(account.dueDate);

      return (
        account.status === 'overdue' ||
        due < todayStart ||
        (due >= todayStart && due <= todayEnd)
      );
    });
  }

  if (filterMode === 'period') {
    accounts = accounts.filter((account) => {
      const due = new Date(account.dueDate);

      return due >= start && due <= end;
    });
  }

  accounts = accounts.sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

  const total = accounts.reduce(
    (acc, item) => acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const list = accounts
    .slice(0, 20)
    .map((item, index) => {
      const date = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString('pt-BR')
        : 'sem vencimento';

      const name =
        item.person ||
        item.description ||
        'Conta sem identificação';

      return `${index + 1}. ${date} — ${name} — ${formatCurrency(item.amount)}`;
    })
    .join('\n');

  return `
📅 ${title}

━━━━━━━━━━━━━━━━━━

💰 Total
${formatCurrency(total)}

📋 Quantidade de contas
${accounts.length}

━━━━━━━━━━━━━━━━━━

📝 Detalhamento

${list || 'Nenhuma conta encontrada para este filtro.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Esse valor representa compromissos financeiros em aberto conforme o filtro solicitado.

🎯 Minha recomendação

Compare esses vencimentos com o caixa disponível e priorize pagamentos críticos.
`.trim();
};

const buildOpenSupplierRankingAnswer = (ctx) => {
  const accounts = (ctx.accounts || []).filter(
    (account) =>
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status)
  );

  if (accounts.length === 0) {
    return `
Não encontrei contas a pagar em aberto.

Minha leitura:
No momento não há fornecedores com compromissos pendentes ou vencidos registrados.
    `.trim();
  }

  const grouped = {};

  accounts.forEach((account) => {
    const supplier =
      account.person ||
      account.description ||
      'Fornecedor não informado';

    if (!grouped[supplier]) {
      grouped[supplier] = {
        supplier,
        total: 0,
        count: 0,
        nextDueDate: null,
      };
    }

    const amount = Math.abs(Number(account.amount || 0));
    const dueDate = new Date(account.dueDate);

    grouped[supplier].total += amount;
    grouped[supplier].count += 1;

    if (
      !grouped[supplier].nextDueDate ||
      dueDate < grouped[supplier].nextDueDate
    ) {
      grouped[supplier].nextDueDate = dueDate;
    }
  });

  const ranking = Object.values(grouped).sort(
    (a, b) => b.total - a.total
  );

  const totalOpen = ranking.reduce(
    (acc, item) => acc + item.total,
    0
  );

  const list = ranking
    .slice(0, 10)
    .map((item, index) => {
      const share =
        totalOpen > 0
          ? ((item.total / totalOpen) * 100).toFixed(1)
          : '0.0';

      return `${index + 1}. ${item.supplier} — ${formatCurrency(item.total)} — ${item.count} conta(s) — ${share}% do total`;
    })
    .join('\n');

  const leader = ranking[0];

return `
🏆 RANKING DE FORNECEDORES EM ABERTO

━━━━━━━━━━━━━━━━━━

💰 Total em contas a pagar
${formatCurrency(totalOpen)}

📋 Fornecedores com pendências
${ranking.length}

━━━━━━━━━━━━━━━━━━

📊 Maiores fornecedores

${list}

━━━━━━━━━━━━━━━━━━

🥇 Fornecedor com maior peso

${leader.supplier}
${formatCurrency(leader.total)}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

O ranking mostra onde está concentrada a maior pressão do contas a pagar.

Quanto maior a concentração em poucos fornecedores, maior deve ser a atenção na negociação de prazos e priorização de pagamentos.

👉 Próxima ação sugerida

Avalie os maiores fornecedores e confira quais vencimentos podem ser negociados ou priorizados.
`.trim();
};

const buildUpcomingDueAnswer = (ctx, days = 7) => {
  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(start);
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);

  const accounts = (ctx.accounts || [])
    .filter((account) => {
      const dueDate = new Date(account.dueDate);

      return (
        account.type === 'payable' &&
        ['pending', 'overdue'].includes(account.status) &&
        dueDate >= start &&
        dueDate <= end
      );
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const total = accounts.reduce(
    (acc, item) => acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const list = accounts
    .slice(0, 20)
    .map((item, index) => {
      const date = new Date(item.dueDate).toLocaleDateString('pt-BR');
      const name = item.person || item.description || 'Conta';

      return `${index + 1}. ${date} — ${name} — ${formatCurrency(item.amount)}`;
    })
    .join('\n');

  return `
📅 VENCIMENTOS — PRÓXIMOS ${days} DIAS

━━━━━━━━━━━━━━━━━━

💰 Total previsto
${formatCurrency(total)}

📋 Quantidade de contas
${accounts.length}

━━━━━━━━━━━━━━━━━━

📝 Contas previstas

${list || 'Nenhuma conta prevista para este período.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Esses são os compromissos com vencimento dentro dos próximos ${days} dias.

🎯 Minha recomendação

Compare esse total com o caixa disponível e priorize fornecedores críticos.
`.trim();
};

const buildPaymentPriorityAnswer = (ctx) => {
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );

  const accounts = (ctx.accounts || [])
    .filter(
      (account) =>
        account.type === 'payable' &&
        ['pending', 'overdue'].includes(account.status) &&
        account.dueDate &&
        Number(account.amount || 0) > 0
    )
    .map((account) => {
      const dueDate = new Date(account.dueDate);

      const days = Math.ceil(
        (dueDate - startOfToday) /
          (1000 * 60 * 60 * 24)
      );

      return {
        name:
          account.person ||
          account.description ||
          'Conta sem identificação',
        description: account.description || '',
        amount: Math.abs(Number(account.amount || 0)),
        dueDate,
        days,
      };
    })
    .filter((account) => !Number.isNaN(account.dueDate.getTime()))
    .sort((a, b) => a.days - b.days);

  if (!accounts.length) {
    return `
Não existem contas pendentes ou vencidas.

Minha leitura:
A agenda financeira não possui compromissos em aberto neste momento.
    `.trim();
  }

  const critical = accounts.filter(
    (item) => item.days <= 3
  );

  const totalCritical = critical.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const list = critical
    .slice(0, 10)
    .map((item, index) => {
      const due = item.dueDate.toLocaleDateString('pt-BR');

      let priority = 'Baixa';

      if (item.days < 0) priority = 'Vencida';
      else if (item.days === 0) priority = 'Hoje';
      else if (item.days <= 3) priority = 'Alta';

      return `${index + 1}. ${item.name}
Vencimento: ${due}
Valor: ${formatCurrency(item.amount)}
Prioridade: ${priority}`;
    })
    .join('\n\n');

 return `
🚨 PRIORIZAÇÃO INTELIGENTE DE PAGAMENTOS

━━━━━━━━━━━━━━━━━━

📋 Contas críticas
${critical.length}

💰 Valor crítico
${formatCurrency(totalCritical)}

━━━━━━━━━━━━━━━━━━

🔥 Prioridades

${list}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

Essas contas concentram os compromissos financeiros mais próximos e merecem acompanhamento prioritário para evitar atrasos e pressão adicional sobre o caixa.

👉 Próxima ação sugerida

Confira se o caixa comporta esses pagamentos e priorize vencimentos de hoje, vencidos ou fornecedores estratégicos.
`.trim();
};

const buildCashForecastAnswer = (ctx) => {
  const today = new Date();

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const payables = (ctx.accounts || []).filter(
    (account) =>
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status) &&
      new Date(account.dueDate) <= next7Days
  );

  const receivables = (ctx.accounts || []).filter(
    (account) =>
      account.type === 'receivable' &&
      ['pending', 'overdue'].includes(account.status) &&
      new Date(account.dueDate) <= next7Days
  );

  const totalPayables = payables.reduce(
    (acc, item) =>
      acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const totalReceivables = receivables.reduce(
    (acc, item) =>
      acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const projectedCash =
    Number(ctx.balance || 0) +
    totalReceivables -
    totalPayables;

  let status = 'Equilibrado';

  if (projectedCash < 0) {
    status = 'Atenção';
  }

 return `
📈 PREVISÃO DE CAIXA — PRÓXIMOS 7 DIAS

━━━━━━━━━━━━━━━━━━

📊 Resultado realizado do período
${formatCurrency(ctx.balance)}

💵 Contas a receber
${formatCurrency(totalReceivables)}

💸 Contas a pagar
${formatCurrency(totalPayables)}

━━━━━━━━━━━━━━━━━━

📌 Saldo projetado
${formatCurrency(projectedCash)}

⚠️ Situação
${status}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

${
  projectedCash >= 0
    ? 'O resultado projetado cobre os compromissos previstos para os próximos dias.'
    : 'Os compromissos previstos superam a disponibilidade projetada. É recomendável acompanhar entradas, renegociações e prioridades de pagamento.'
}

👉 Próxima ação sugerida

Compare os vencimentos dos próximos dias com as entradas previstas e evite assumir novos compromissos antes de estabilizar o caixa.
`.trim();
};

const buildDecisionSimulationAnswer = (ctx) => {
  const today = new Date();

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const payables = (ctx.accounts || []).filter(
    (account) =>
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status) &&
      new Date(account.dueDate) <= next7Days
  );

  const totalPayables = payables.reduce(
    (acc, item) =>
      acc + Math.abs(Number(item.amount || 0)),
    0
  );

  const projectedBalance =
    Number(ctx.balance || 0) -
    totalPayables;

  let situation = 'Confortável';

  if (projectedBalance < 0) {
    situation = 'Atenção';
  }

 return `
🧭 SIMULAÇÃO DE DECISÃO

━━━━━━━━━━━━━━━━━━

📊 Resultado realizado do período
${formatCurrency(ctx.balance)}

💸 Pagamentos previstos (7 dias)
${formatCurrency(totalPayables)}

━━━━━━━━━━━━━━━━━━

📌 Saldo após pagamentos
${formatCurrency(projectedBalance)}

⚠️ Situação
${situation}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

${
  projectedBalance >= 0
    ? 'Mesmo após os pagamentos previstos, o resultado permanece positivo.'
    : 'Os pagamentos previstos pressionam o resultado do período. Avalie prioridades, renegociações e preservação de caixa.'
}

👉 Próxima ação sugerida

Antes de novas compras ou despesas, confira se os pagamentos prioritários já estão cobertos pelo fluxo previsto.
`.trim();
};

const buildFlowAnswer = (ctx) => {
  const topExpenses = ctx.expenseCategories
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. ${item.category}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

  const deepQuestions =
  buildDeepDiveQuestions(ctx);

 return `
📊 FLUXO DE CAIXA — ${ctx.periodLabel}

${buildConsultiveIntroduction(
  ctx,
  'o fluxo de caixa'
)}

━━━━━━━━━━━━━━━━━━

💰 Entradas realizadas
${formatCurrency(ctx.totalIncome)}

💸 Saídas realizadas
${formatCurrency(ctx.totalExpenses)}

📈 Resultado do período
${formatCurrency(ctx.balance)}

━━━━━━━━━━━━━━━━━━

📋 Contas pendentes

A pagar:
${formatCurrency(ctx.pendingPayable)}

A receber:
${formatCurrency(ctx.pendingReceivable)}

━━━━━━━━━━━━━━━━━━

🏆 Principais grupos de saída

${topExpenses || 'Ainda não há despesas suficientes classificadas.'}

${buildConsultiveClosing({
  situation:
    ctx.balance >= 0
      ? 'As entradas estão sustentando as saídas registradas e o período apresenta resultado positivo.'
      : 'As saídas estão pressionando o caixa e o período apresenta resultado negativo.',

  recommendation:
    'Acompanhe o fluxo previsto junto com o realizado. Priorize fornecedores críticos, vencimentos próximos e preserve caixa para a operação essencial.',
})}

━━━━━━━━━━━━━━━━━━

🤔 O que eu investigaria agora

${
  deepQuestions.length
    ? deepQuestions
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhum aprofundamento adicional identificado.'
}
`.trim();
  };
  
const buildRelativePeriodAnswer = (ctx) => {
  const topExpenses = ctx.expenseCategories
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. ${item.category}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

  const recommendations = buildAutomaticRecommendations(ctx);

  return `
Análise de ${ctx.periodLabel}:

Entradas realizadas: ${formatCurrency(ctx.totalIncome)}
Saídas realizadas: ${formatCurrency(ctx.totalExpenses)}
Saldo realizado: ${formatCurrency(ctx.balance)}

Contas pendentes/vencidas:
Pagar: ${formatCurrency(ctx.pendingPayable)}
Receber: ${formatCurrency(ctx.pendingReceivable)}

Principais despesas identificadas:
${topExpenses || 'Ainda não há despesas suficientes classificadas neste período.'}

Leitura gerencial:
${
  ctx.balance >= 0
    ? 'O período apresentou resultado positivo, indicando equilíbrio operacional nas movimentações registradas.'
    : 'O período apresentou resultado negativo, exigindo atenção ao caixa e ao controle de despesas.'
}

Minha leitura:
Períodos curtos ajudam a identificar comportamento operacional recente, pressão de caixa e tendência imediata da operação.
Recomendações automáticas:
${
  recommendations.length > 0
    ? recommendations.map((item) => `• ${item}`).join('\n')
    : 'Nenhuma recomendação crítica identificada para este período.'
}
  `.trim();
};

const buildBiggestRiskAnswer = (ctx) => {
  const risks = [];

  const purchases =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  const payableShare =
    ctx.totalIncome > 0
      ? (ctx.pendingPayable / ctx.totalIncome) * 100
      : 0;

  if (ctx.pendingPayable > 20000) {
    risks.push({
      title: 'Contas a pagar elevadas',
      score: ctx.pendingPayable,
      indicator: formatCurrency(ctx.pendingPayable),
      analysis:
        `As contas a pagar representam ${payableShare.toFixed(1)}% das entradas do período.`,
    });
  }

  if (ctx.balance < 0) {
    risks.push({
      title: 'Resultado negativo',
      score: Math.abs(ctx.balance),
      indicator: formatCurrency(ctx.balance),
      analysis:
        'A operação está consumindo mais recursos do que gera no período.',
    });
  }

  if (purchaseShare > 60) {
    risks.push({
      title: 'Compras de mercadorias',
      score: purchases.amount,
      indicator:
        `${formatCurrency(purchases.amount)} — ${purchaseShare.toFixed(1)}% das entradas`,
      analysis:
        'As compras continuam sendo uma das maiores pressões sobre o caixa e precisam ser acompanhadas junto com giro e estoque.',
    });
  }

  const ticket =
    Number(ctx.managementReport?.averageTicket || 0);

  if (ticket > 0 && ticket < 20) {
    risks.push({
      title: 'Ticket médio baixo',
      score: 1000,
      indicator: formatCurrency(ticket),
      analysis:
        'O ticket médio está abaixo de R$ 20,00, o que aumenta a dependência de volume para gerar resultado.',
    });
  }

  const selected =
    risks.sort((a, b) => b.score - a.score)[0];

  if (!selected) {
    return `
🚨 MAIOR RISCO ATUAL

━━━━━━━━━━━━━━━━━━

Nenhum risco relevante foi identificado.

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Os indicadores atuais estão equilibrados.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Continue monitorando caixa, compras, contas pendentes e ticket médio.
`.trim();
  }

  return `
🚨 MAIOR RISCO ATUAL

━━━━━━━━━━━━━━━━━━

${selected.title}

━━━━━━━━━━━━━━━━━━

📊 Indicador

${selected.indicator}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${selected.analysis}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Esse é o principal ponto que merece atenção da gestão neste momento.
`.trim();
};

const buildTicketAnswer = (ctx) => {
  const averageTicket = ctx.managementReport?.averageTicket || 0;
  const netRevenue = ctx.managementReport?.netRevenue || 0;
  const totalTickets = ctx.managementReport?.totalTickets || 0;

 return `
🎯 TICKET MÉDIO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Receita líquida gerencial
${formatCurrency(netRevenue)}

🧾 Total de comandas
${totalTickets}

📌 Ticket médio
${formatCurrency(averageTicket)}

${buildConsultiveClosing({
  situation:
    averageTicket > 0
      ? 'O ticket médio já possui dados suficientes para análise comercial.'
      : 'Ainda não existem dados suficientes de ticket médio para uma leitura confiável.',

  recommendation:
    'Aumente vendas complementares, combos e produtos de maior margem para elevar o valor médio por cliente.'
})}
`.trim();
};

const buildTicketImprovementAnswer = (question, ctx) => {
  const lower = normalizeText(question);

  if (
    !lower.includes('ticket') ||
    !(
      lower.includes('melhorar') ||
      lower.includes('aumentar') ||
      lower.includes('elevar')
    )
  ) {
    return null;
  }

  return `
🎯 COMO MELHORAR O TICKET MÉDIO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📌 Ticket médio atual
${formatCurrency(ctx.managementReport?.averageTicket || 0)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

O caminho não é apenas vender mais, mas fazer cada cliente levar mais itens por compra.

━━━━━━━━━━━━━━━━━━

✅ Ações práticas

1. Criar combos simples: bebida + gelo + energético.
2. Oferecer complemento no balcão: gelo, carvão, petisco, copo ou energético.
3. Destacar produtos de maior margem na frente da loja.
4. Criar ofertas por ocasião: churrasco, jogo, fim de semana e lounge.
5. Treinar atendimento para sugerir complemento antes de fechar a venda.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Comece por combos fáceis de entender e produtos que já têm giro. Isso aumenta o ticket sem depender apenas de novos clientes.
`.trim();
};

const buildExpenseAnswer = (ctx) => {
  const topExpenses = ctx.expenseCategories
    .slice(0, 5)
    .map(
      (item, index) =>
        `${index + 1}. ${item.category}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

return `
💸 ANÁLISE DE DESPESAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Total de despesas
${formatCurrency(ctx.totalExpenses)}

━━━━━━━━━━━━━━━━━━

📊 Maiores grupos de despesas

${topExpenses || 'Não encontrei despesas classificadas suficientes neste período.'}

${buildConsultiveClosing({
  situation:
    'As despesas mostram onde está concentrada a pressão financeira da operação.',

  recommendation:
    'Comece revisando o maior grupo de despesa, pois ele tende a gerar o maior impacto financeiro.'
})}
`.trim();
};

const getSharePercent = (value, total) => {
  if (!total || total <= 0) return '0.0';

  return ((Number(value || 0) / Number(total || 0)) * 100).toFixed(1);
};

const getTopItem = (items) => {
  if (!items || !items.length) return null;

  return [...items].sort(
    (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
  )[0];
};

const calculateVariation = (current, previous) => {
  current = Number(current || 0);
  previous = Number(previous || 0);

  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
};

const getItemAmountByName = (items, searchTerm) => {
  const normalizedSearch = normalizeText(searchTerm);

  const item = (items || []).find((entry) =>
    normalizeText(entry.name || entry.category).includes(normalizedSearch)
  );

  return item ? Number(item.amount || 0) : 0;
};

const buildEvolutionLineAnswer = ({
  title,
  label,
  currentAmount,
  previousAmount,
  currentLabel,
  previousLabel,
}) => {
  const variation = calculateVariation(
    currentAmount,
    previousAmount
  );

  if (variation === null) {
    return `
${title}

━━━━━━━━━━━━━━━━━━

${label}

Período atual: ${formatCurrency(currentAmount)}
Período anterior: ${formatCurrency(previousAmount)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Não há base suficiente no período anterior para calcular evolução percentual.
`.trim();
  }

  const trend =
    variation > 0
      ? 'cresceu'
      : variation < 0
        ? 'caiu'
        : 'ficou estável';

  return `
${title}

━━━━━━━━━━━━━━━━━━

${label}

${currentLabel}: ${formatCurrency(currentAmount)}
${previousLabel}: ${formatCurrency(previousAmount)}

📊 Variação
${variation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse indicador ${trend} em relação ao período anterior.
`.trim();
};

const getGrowthRanking = (currentItems, previousItems, key = 'name') => {
  const results = [];

  (currentItems || []).forEach((current) => {
    const currentName = current[key] || current.name || current.category;

    const previous = (previousItems || []).find((item) =>
      normalizeText(item[key] || item.name || item.category) ===
      normalizeText(currentName)
    );

    const variation = calculateVariation(
      current.amount,
      previous?.amount || 0
    );

    if (variation !== null) {
      results.push({
        name: currentName,
        current: current.amount,
        previous: previous?.amount || 0,
        variation,
      });
    }
  });

  return results;
};

const buildSimpleEvolutionAnswer = ({
  title,
  name,
  current,
  previous,
  currentLabel,
  previousLabel,
  variation,
  analysis,
  recommendation,
}) => `
${title}

━━━━━━━━━━━━━━━━━━

${name}

${currentLabel}: ${formatCurrency(current)}
${previousLabel}: ${formatCurrency(previous)}

📊 Variação
${variation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${analysis}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${recommendation}
`.trim();

const buildDataReliabilityProfile = async (ctx) => {
  const reports = await ManagementReport.find({})
    .sort({ year: 1, month: 1 });

  const totalReports = reports.length;

  const reportsWithRevenue = reports.filter((report) =>
    Number(
      report.netRevenue ||
      report.grossRevenue ||
      report.totalIncome ||
      report.revenue ||
      0
    ) > 0
  ).length;

  const reportsWithExpenses = reports.filter((report) =>
    Number(
      report.totalExpenses ||
      report.expenses ||
      0
    ) > 0
  ).length;

  const entriesCount = (ctx.entries || []).length;

  const incomeEntries = (ctx.entries || []).filter(
    (entry) => entry.type === 'income'
  ).length;

  const expenseEntries = (ctx.entries || []).filter(
    (entry) => entry.type === 'expense'
  ).length;

  const expenseCoverage =
    reportsWithRevenue > 0
      ? (reportsWithExpenses / reportsWithRevenue) * 100
      : 0;

  let level = '🟢 Alta';
  const notes = [];

  if (expenseCoverage < 70) {
    level = '🟡 Média';
    notes.push(
      'O histórico de entradas está mais completo que o histórico de despesas.'
    );
  }

  if (expenseCoverage < 40) {
    level = '🔴 Baixa';
    notes.push(
      'As despesas históricas ainda parecem incompletas para uma leitura definitiva de resultado.'
    );
  }

  if (entriesCount > 0 && expenseEntries === 0) {
    level = '🟡 Média';
    notes.push(
      'No período atual existem lançamentos, mas não encontrei despesas registradas.'
    );
  }

  if (entriesCount < 5) {
    notes.push(
      'O período atual ainda possui poucos lançamentos para uma leitura operacional madura.'
    );
  }

  return {
    level,
    totalReports,
    reportsWithRevenue,
    reportsWithExpenses,
    expenseCoverage,
    entriesCount,
    incomeEntries,
    expenseEntries,
    notes,
  };
};

const buildDataReliabilityAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  if (
    !lower.includes('confiabilidade') &&
    !lower.includes('base de dados') &&
    !lower.includes('dados estao completos') &&
    !lower.includes('dados estão completos') &&
    !lower.includes('dados incompletos')
  ) {
    return null;
  }

  const profile = await buildDataReliabilityProfile(ctx);

  return `
🧠 CONFIABILIDADE DA BASE — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Nível de confiabilidade
${profile.level}

━━━━━━━━━━━━━━━━━━

📊 Histórico gerencial

Relatórios encontrados:
${profile.totalReports}

Relatórios com entradas:
${profile.reportsWithRevenue}

Relatórios com despesas:
${profile.reportsWithExpenses}

Cobertura de despesas históricas:
${profile.expenseCoverage.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

📋 Lançamentos do período atual

Total de lançamentos:
${profile.entriesCount}

Entradas:
${profile.incomeEntries}

Saídas:
${profile.expenseEntries}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${
  profile.notes.length
    ? profile.notes.map((item) => `• ${item}`).join('\n')
    : 'A base possui dados suficientes para uma leitura consistente do período.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Enquanto os dados históricos de despesas ainda estiverem em construção, trate análises de resultado, margem e piora financeira como leituras provisórias.

As análises de faturamento, ticket médio e períodos de maior venda já podem ser consideradas mais fortes quando o Relatório Gerencial estiver completo.
`.trim();
};

const getManagementReportValue = (report) => {
  return Number(
    report?.netRevenue ||
    report?.grossRevenue ||
    report?.totalIncome ||
    report?.revenue ||
    0
  );
};

const buildManagementReportRankingAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  const asksTicket =
  lower.includes('ticket medio') ||
  lower.includes('ticket médio') ||
  lower.includes('melhor ticket') ||
  lower.includes('maior ticket') ||
  lower.includes('pior ticket') ||
  lower.includes('menor ticket');

  const asksRevenue =
  lower.includes('faturamento') ||
  lower.includes('melhor mes') ||
  lower.includes('pior mes') ||
  lower.includes('maior mes') ||
  lower.includes('menor mes');

  const asksBest =
    lower.includes('melhor') ||
    lower.includes('maior');

  const asksWorst =
    lower.includes('pior') ||
    lower.includes('menor');

  const asksHistory =
    lower.includes('historia') ||
    lower.includes('historico') ||
    lower.includes('história');

  const asksYear =
    lower.includes('do ano') ||
    lower.includes('este ano') ||
    lower.includes('ano atual');

 const validIntent =
  (asksTicket || asksRevenue) &&
  (asksBest || asksWorst) &&
  (
    asksHistory ||
    asksYear ||
    lower.includes('em qual mes') ||
    lower.includes('melhor mes') ||
    lower.includes('pior mes') ||
    lower.includes('maior mes') ||
    lower.includes('menor mes')
  );

  if (!validIntent) {
    return null;
  }

  let reports = await ManagementReport.find({}).sort({
    year: 1,
    month: 1,
  });

  reports = (reports || []).filter((report) => {
    const revenue = getManagementReportValue(report);
    const tickets = Number(report.totalTickets || 0);
    const ticket =
      Number(report.averageTicket || 0) ||
      (tickets > 0 ? revenue / tickets : 0);

    if (asksTicket) return ticket > 0;
    if (asksRevenue) return revenue > 0;

    return false;
  });

  if (asksYear) {
    reports = reports.filter(
      (report) => Number(report.year) === Number(ctx.year)
    );
  }

  if (!reports.length) {
    return `
Não encontrei dados suficientes no Relatório Gerencial para responder essa pergunta.
`.trim();
  }

  const enriched = reports.map((report) => {
    const revenue = getManagementReportValue(report);
    const tickets = Number(report.totalTickets || 0);
    const ticket =
      Number(report.averageTicket || 0) ||
      (tickets > 0 ? revenue / tickets : 0);

    return {
      report,
      revenue,
      tickets,
      ticket,
      label: getMonthLabel(
        Number(report.month),
        Number(report.year)
      ),
    };
  });

  enriched.sort((a, b) => {
    const valueA = asksTicket ? a.ticket : a.revenue;
    const valueB = asksTicket ? b.ticket : b.revenue;

    return asksBest
      ? valueB - valueA
      : valueA - valueB;
  });

  const selected = enriched[0];

  const title =
    asksTicket
      ? `${asksBest ? '🏆 MELHOR' : '📉 PIOR'} TICKET MÉDIO`
      : `${asksBest ? '🏆 MAIOR' : '📉 MENOR'} FATURAMENTO`;

  const scope = asksYear
    ? `DO ANO — ${ctx.year}`
    : 'DA HISTÓRIA';

  return `
${title} ${scope}

━━━━━━━━━━━━━━━━━━

📅 Período
${selected.label}

💰 Faturamento
${formatCurrency(selected.revenue)}

🧾 Comandas
${selected.tickets}

🎯 Ticket médio
${formatCurrency(selected.ticket)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa leitura usa o Relatório Gerencial mês a mês, que é a base correta para comparar faturamento, comandas e ticket médio ao longo do tempo.
`.trim();
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

const buildPartialMetric = ({
  report,
  limitDay,
  useRealCurrent = false,
}) => {
  if (!report) {
    return {
      revenue: 0,
      tickets: 0,
      averageTicket: 0,
      estimated: true,
    };
  }

  const revenue = getManagementReportValue(report);
  const tickets = Number(report.totalTickets || 0);

  if (useRealCurrent) {
    return {
      revenue,
      tickets,
      averageTicket: tickets > 0 ? revenue / tickets : 0,
      estimated: false,
    };
  }

  const year = Number(report.year);
  const month = Number(report.month);
  const daysInMonth = getDaysInMonth(month, year);
  const safeLimitDay = Math.min(limitDay, daysInMonth);
  const factor = safeLimitDay / daysInMonth;

  const partialRevenue = revenue * factor;
  const partialTickets = tickets * factor;

  return {
    revenue: partialRevenue,
    tickets: partialTickets,
    averageTicket:
      partialTickets > 0
        ? partialRevenue / partialTickets
        : 0,
    estimated: true,
  };
};

const formatTickets = (value) => {
  return Math.round(Number(value || 0));
};

const buildManagementReportComparisonAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  const asksDayRanking =
  lower.includes('pior dia') ||
  lower.includes('melhor dia') ||
  lower.includes('menor dia') ||
  lower.includes('maior dia') ||
  lower.includes('dia de menor') ||
  lower.includes('dia de maior');

if (asksDayRanking) {
  return null;
}

  const mentionsManagementReport =
    lower.includes('relatorio gerencial') ||
    lower.includes('relatório gerencial');

  const asksSalesEvolution =
    lower.includes('vendendo mais') ||
    lower.includes('vendas') ||
    lower.includes('faturamento') ||
    lower.includes('comandas') ||
    lower.includes('clientes') ||
    lower.includes('vendendo mais que no mes passado') ||
    lower.includes('vendendo mais que no mês passado') ||
    lower.includes('vendi mais que no mes passado') ||
    lower.includes('vendi mais que no mês passado') ||
    lower.includes('empresa esta crescendo') ||
    lower.includes('empresa está crescendo') ||
    lower.includes('a empresa esta crescendo') ||
    lower.includes('a empresa está crescendo') ||
    lower.includes('bebcom esta crescendo') ||
    lower.includes('bebcom está crescendo') ||
    lower.includes('estou crescendo') ||
    lower.includes('crescimento da empresa') ||
    lower.includes('movimento');

  if (!mentionsManagementReport && !asksSalesEvolution) {
    return null;
  }

  if (!ctx.month || !ctx.year) {
    return null;
  }

  const reports = await ManagementReport.find({})
    .sort({ year: 1, month: 1 });

  const validReports = (reports || []).filter(
    (report) =>
      report.year &&
      report.month &&
      getManagementReportValue(report) > 0
  );

  const currentReport = validReports.find(
    (report) =>
      Number(report.year) === Number(ctx.year) &&
      Number(report.month) === Number(ctx.month)
  );

  if (!currentReport) {
    return `
📊 RELATÓRIO GERENCIAL — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Não encontrei Relatório Gerencial cadastrado para este período.

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Para analisar vendas, comandas e ticket médio pelo histórico gerencial, preciso que o relatório mensal esteja lançado.
`.trim();
  }

  const currentRevenue = getManagementReportValue(currentReport);
  const currentTickets = Number(currentReport.totalTickets || 0);
  const currentTicket = Number(currentReport.averageTicket || 0);

  const now = new Date();

const isCurrentMonth =
  Number(ctx.month) === now.getMonth() + 1 &&
  Number(ctx.year) === now.getFullYear();

const currentDay = isCurrentMonth
  ? now.getDate()
  : getDaysInMonth(ctx.month, ctx.year);

const currentPartial = buildPartialMetric({
  report: currentReport,
  limitDay: currentDay,
  useRealCurrent: true,
});

  const previousMonth = ctx.month === 1 ? 12 : ctx.month - 1;
  const previousYear = ctx.month === 1 ? ctx.year - 1 : ctx.year;

  const previousReport = validReports.find(
    (report) =>
      Number(report.year) === Number(previousYear) &&
      Number(report.month) === Number(previousMonth)
  );

const previousPartial = buildPartialMetric({
  report: previousReport,
  limitDay: currentDay,
  useRealCurrent: false,
});

const previousRevenue = isCurrentMonth
  ? previousPartial.revenue
  : getManagementReportValue(previousReport);

const previousTickets = isCurrentMonth
  ? previousPartial.tickets
  : Number(previousReport?.totalTickets || 0);

const previousTicket =
  previousTickets > 0
    ? previousRevenue / previousTickets
    : 0;

  const revenueVariation =
    previousRevenue > 0
      ? calculateVariation(currentRevenue, previousRevenue)
      : null;

  const ticketsVariation =
    previousTickets > 0
      ? calculateVariation(currentTickets, previousTickets)
      : null;

  const ticketVariation =
    previousTicket > 0
      ? calculateVariation(currentTicket, previousTicket)
      : null;

  const sameMonthHistory = validReports
    .filter((report) => Number(report.month) === Number(ctx.month))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const quarter = Math.ceil(ctx.month / 3);
  const semester = ctx.month <= 6 ? 1 : 2;

  const groupByYear = (items) => {
  const grouped = {};

  items.forEach((report) => {
    const year = Number(report.year);
    const month = Number(report.month);

    const isCurrentReport =
      year === Number(ctx.year) &&
      month === Number(ctx.month);

    const shouldPartialize =
      isCurrentMonth &&
      month === Number(ctx.month);

    const metric = shouldPartialize
      ? buildPartialMetric({
          report,
          limitDay: currentDay,
          useRealCurrent: isCurrentReport,
        })
      : {
          revenue: getManagementReportValue(report),
          tickets: Number(report.totalTickets || 0),
          averageTicket: Number(report.averageTicket || 0),
          estimated: false,
        };

    if (!grouped[year]) {
      grouped[year] = {
        year,
        revenue: 0,
        tickets: 0,
        months: 0,
        hasPartialMonth: false,
      };
    }

    grouped[year].revenue += metric.revenue;
    grouped[year].tickets += metric.tickets;
    grouped[year].months += 1;

    if (shouldPartialize) {
      grouped[year].hasPartialMonth = true;
    }
  });

  return Object.values(grouped).sort(
    (a, b) => a.year - b.year
  );
};

  const sameQuarterByYear = groupByYear(
    validReports.filter((report) => {
      const reportQuarter = Math.ceil(Number(report.month) / 3);
      return reportQuarter === quarter;
    })
  );

  const sameSemesterByYear = groupByYear(
    validReports.filter((report) => {
      const reportSemester =
        Number(report.month) <= 6 ? 1 : 2;

      return reportSemester === semester;
    })
  );

  const currentYearMonths = validReports
    .filter((report) => Number(report.year) === Number(ctx.year))
    .sort((a, b) => Number(a.month) - Number(b.month));

  const formatVariationText = (variation) => {
    if (variation === null || Number.isNaN(variation)) {
      return 'sem base anterior';
    }

    return `${variation.toFixed(1)}%`;
  };

const sameMonthList = sameMonthHistory
  .map((report) => {
    const isCurrentReport =
      Number(report.year) === Number(ctx.year) &&
      Number(report.month) === Number(ctx.month);

    const partial = buildPartialMetric({
      report,
      limitDay: currentDay,
      useRealCurrent: isCurrentReport,
    });

    const suffix = partial.estimated
      ? `estimado até dia ${currentDay}`
      : `real até dia ${currentDay}`;

    return `${report.year}: ${formatCurrency(partial.revenue)} — ${formatTickets(partial.tickets)} comandas — ticket ${formatCurrency(partial.averageTicket)} — ${suffix}`;
  })
  .join('\n');

const quarterList = sameQuarterByYear
  .map((item) => {
    const suffix = item.hasPartialMonth
      ? `${item.months} meses considerados, com ${getMonthLabel(ctx.month, ctx.year).split('/')[0]} até dia ${currentDay}`
      : `${item.months} meses considerados`;

    return `${item.year}: ${formatCurrency(item.revenue)} — ${formatTickets(item.tickets)} comandas — ${suffix}`;
  })
  .join('\n');

  const semesterList = sameSemesterByYear
  .map((item) => {
    const suffix = item.hasPartialMonth
      ? `${item.months} meses considerados, com ${getMonthLabel(ctx.month, ctx.year).split('/')[0]} até dia ${currentDay}`
      : `${item.months} meses considerados`;

    return `${item.year}: ${formatCurrency(item.revenue)} — ${formatTickets(item.tickets)} comandas — ${suffix}`;
  })
  .join('\n');

  const currentYearList = currentYearMonths
    .map((report) => {
      const revenue = getManagementReportValue(report);
      const tickets = Number(report.totalTickets || 0);
      const ticket = Number(report.averageTicket || 0);

      return `${getMonthLabel(report.month, report.year)}: ${formatCurrency(revenue)} — ${tickets} comandas — ticket ${formatCurrency(ticket)}`;
    })
    .join('\n');

  let diagnosis = '';

  if (
    revenueVariation !== null &&
    ticketsVariation !== null
  ) {
    if (revenueVariation > 0 && ticketsVariation > 0) {
      diagnosis =
        'A Bebcom está vendendo mais em faturamento e também em volume de comandas.';
    } else if (revenueVariation > 0 && ticketsVariation <= 0) {
      diagnosis =
        'A Bebcom está faturando mais, mas não necessariamente atendendo mais clientes. A melhora vem mais de ticket médio ou vendas maiores.';
    } else if (revenueVariation < 0 && ticketsVariation < 0) {
      diagnosis =
        isCurrentMonth
  ? `Até o momento, ${ctx.periodLabel} está abaixo em faturamento e comandas na comparação parcial. Essa leitura ainda pode mudar até o fechamento do mês.`
  : 'A Bebcom está vendendo menos em faturamento e também em volume de comandas.';
    } else {
      diagnosis =
        'A leitura está mista: faturamento, comandas e ticket médio não caminharam na mesma direção.';
    }
  } else {
    diagnosis =
      'Ainda não há base anterior suficiente para afirmar evolução mensal completa.';
  }


  const partialMonthNote = isCurrentMonth
    ? `
━━━━━━━━━━━━━━━━━━

⚠️ Observação sobre o mês atual

${ctx.periodLabel} ainda está em andamento.

Por isso, comparações contra meses fechados devem ser lidas como parciais. A leitura ficará mais precisa conforme novos lançamentos forem adicionados ao Relatório Gerencial.
`
    : '';

  return `
📈 EVOLUÇÃO COMERCIAL DA BEBCOM — ${ctx.periodLabel}



━━━━━━━━━━━━━━━━━━

📌 Leitura atual pelo Relatório Gerencial

Faturamento:
${formatCurrency(currentRevenue)}

Comandas:
${currentTickets}

Ticket médio:
${formatCurrency(currentTicket)}

━━━━━━━━━━━━━━━━━━

📊 Comparação parcial com ${getMonthLabel(previousMonth, previousYear)} até dia ${currentDay}

Faturamento anterior:
${formatCurrency(previousRevenue)}

Comandas anteriores:
${formatTickets(previousTickets)}

Ticket médio anterior:
${formatCurrency(previousTicket)}

━━━━━━━━━━━━━━━━━━

📈 Variação mensal

Faturamento:
${formatVariationText(revenueVariation)}

Comandas:
${formatVariationText(ticketsVariation)}

Ticket médio:
${formatVariationText(ticketVariation)}

━━━━━━━━━━━━━━━━━━

📅 Comparação histórica do mês de ${getMonthLabel(ctx.month, ctx.year).split('/')[0]}

${sameMonthList || 'Sem histórico suficiente para este mês.'}

━━━━━━━━━━━━━━━━━━

📊 Comparação do ${quarter}º trimestre entre os anos

${quarterList || 'Sem histórico suficiente para este trimestre.'}

━━━━━━━━━━━━━━━━━━

📊 Comparação do ${semester}º semestre entre os anos

${semesterList || 'Sem histórico suficiente para este semestre.'}

━━━━━━━━━━━━━━━━━━

📆 Evolução mês a mês de ${ctx.year}

${currentYearList || 'Sem meses suficientes lançados para este ano.'}

${partialMonthNote}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${diagnosis}

A leitura mais correta não é olhar apenas o mês anterior. Para saber se a loja está vendendo mais, eu comparo o mês atual, o mesmo mês em outros anos, o trimestre, o semestre e a evolução dentro do ano.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa visão para separar queda normal de período, sazonalidade, perda real de fluxo e mudança de ticket médio.

Para caixa, despesas e vencimentos, continue usando os lançamentos diários. Para vendas, comandas e evolução comercial, use o Relatório Gerencial.
`.trim();
};

const registerExecutiveMemoryEvent = async ({
  type,
  severity = 'medium',
  periodLabel,
  month,
  year,
  title,
  summary,
  metric,
  currentValue,
  previousValue,
  variation,
  source = 'System',
}) => {
  const fingerprint = [
    type,
    periodLabel,
    metric || '',
    Number(currentValue || 0).toFixed(2),
    Number(previousValue || 0).toFixed(2),
  ].join('|');

  try {
    await ExecutiveMemoryEvent.findOneAndUpdate(
      { fingerprint },
      {
        type,
        severity,
        periodLabel,
        month,
        year,
        title,
        summary,
        metric,
        currentValue,
        previousValue,
        variation,
        source,
        active: true,
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    console.error('Erro ao registrar memória evolutiva:', error.message);
  }
};

const getRecentExecutiveMemoryEvents = async (limit = 5) => {
  return ExecutiveMemoryEvent.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const buildRecentExecutiveMemoryText = async () => {
  const events = await getRecentExecutiveMemoryEvents(5);

  if (!events.length) {
    return 'Ainda não há eventos evolutivos registrados.';
  }

  await ExecutiveMemoryEvent.updateMany(
    { _id: { $in: events.map((event) => event._id) } },
    { $inc: { usedInAnswers: 1 } }
  );

  return events
    .map((event, index) => {
      return `${index + 1}. ${event.title}
${event.summary}`;
    })
    .join('\n\n');
};

const buildIntuitiveMemorySignal = (ctx, recentEvents = []) => {
  const signals = [];

  const purchases =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  const ticket =
    Number(ctx.managementReport?.averageTicket || 0);

  if (ctx.balance < 0) {
    signals.push({
      weight: 100,
      type: 'cash_pressure',
      level: 'high',
      title: 'Caixa pressionado',
      message: `O resultado atual está negativo em ${formatCurrency(ctx.balance)}.`,
    });
  }

  if (ctx.pendingPayable > ctx.totalIncome * 0.5) {
    signals.push({
      weight: 90,
      type: 'payable_pressure',
      level: 'high',
      title: 'Contas pendentes relevantes',
      message: `As contas a pagar somam ${formatCurrency(ctx.pendingPayable)}.`,
    });
  }

  if (purchaseShare > 60) {
    signals.push({
      weight: 80,
      type: 'purchase_pressure',
      level: 'medium',
      title: 'Compras pressionando o caixa',
      message: `Compras representam ${purchaseShare.toFixed(1)}% das entradas.`,
    });
  }

  if (ticket > 0 && ticket < 20) {
    signals.push({
      weight: 70,
      type: 'ticket_attention',
      level: 'medium',
      title: 'Ticket médio abaixo do ideal',
      message: `O ticket médio atual está em ${formatCurrency(ticket)}.`,
    });
  }

  const improvementEvents =
    (recentEvents || []).filter((event) => {
      const text = normalizeText(
        `${event.type || ''} ${event.title || ''} ${event.summary || ''}`
      );

      return (
        text.includes('melhora') ||
        text.includes('recuperacao') ||
        text.includes('improvement')
      );
    });

  const worseningEvents =
    (recentEvents || []).filter((event) => {
      const text = normalizeText(
        `${event.type || ''} ${event.title || ''} ${event.summary || ''}`
      );

      return (
        text.includes('piora') ||
        text.includes('queda') ||
        text.includes('worsening')
      );
    });

  let pattern = 'Sem padrão recente suficiente';
  let interpretation =
    'Ainda não há eventos suficientes para formar uma leitura intuitiva consolidada.';

  if (improvementEvents.length > worseningEvents.length && ctx.balance < 0) {
    pattern = 'Recuperação com caixa ainda pressionado';
    interpretation =
      'A memória recente mostra sinais de melhora, mas o caixa ainda não está confortável. O plano deve proteger caixa antes de acelerar crescimento.';
  } else if (improvementEvents.length > worseningEvents.length && ctx.balance >= 0) {
    pattern = 'Recuperação em consolidação';
    interpretation =
      'A memória recente mostra melhora e o resultado atual permite uma postura mais equilibrada entre controle e crescimento.';
  } else if (worseningEvents.length > improvementEvents.length) {
    pattern = 'Deterioração operacional recente';
    interpretation =
      'A memória recente aponta mais sinais de piora do que melhora. O plano deve ser defensivo, focado em caixa, compras e vencimentos.';
  } else if (signals.length) {
    pattern = 'Pressão operacional recorrente';
    interpretation =
      'Mesmo sem domínio claro entre melhora e piora, os sinalizadores atuais apontam pressão em caixa, compras ou contas pendentes.';
  }

  signals.sort((a, b) => b.weight - a.weight);

  return {
    pattern,
    interpretation,
    signals,
    improvementCount: improvementEvents.length,
    worseningCount: worseningEvents.length,
    dominantSignal: signals[0] || null,
  };
};

const buildIntuitiveMemoryAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  if (
  lower.includes('o que faco agora') ||
  lower.includes('o que devo fazer agora') ||
  lower.includes('monte um plano') ||
  lower.includes('plano de acao') ||
  lower.includes('acoes praticas')
) {
  return null;
}

  const isIntuitiveMemoryQuestion =
  lower.includes('memoria intuitiva') ||
  lower.includes('qual padrao esta se repetindo') ||
  lower.includes('qual padrao') ||
  lower.includes('o que voce vem percebendo') ||
  lower.includes('qual fato recente mais importa') ||
  lower.includes('quais eventos recentes') ||
  lower.includes('ultimos acontecimentos') ||
  lower.includes('resumo da memoria evolutiva') ||
  lower.includes('mais preocupa') ||
  lower.includes('merece mais atencao') ||
  lower.includes('qual sua percepcao') ||
  lower.includes('qual sua intuicao');

  const asksEvents =
  lower.includes('quais eventos recentes') ||
  lower.includes('ultimos acontecimentos');

const asksPattern =
  lower.includes('qual padrao') ||
  lower.includes('o que voce vem percebendo');

const asksMostImportant =
  lower.includes('fato recente mais importa') ||
  lower.includes('mais preocupa') ||
  lower.includes('merece mais atencao');

const asksSummary =
  lower.includes('resumo da memoria evolutiva');

const asksIntuition =
  lower.includes('memoria intuitiva') ||
  lower.includes('qual sua percepcao') ||
  lower.includes('qual sua intuicao');

  if (!isIntuitiveMemoryQuestion) {
    return null;
  }

  const recentEvents =
    await getRecentExecutiveMemoryEvents(8);

  const memory =
    buildIntuitiveMemorySignal(ctx, recentEvents);

  const eventsText =
    recentEvents.length
      ? recentEvents
          .slice(0, 5)
          .map(
            (event, index) =>
              `${index + 1}. ${event.title}\n${event.summary}`
          )
          .join('\n\n')
      : 'Ainda não há eventos evolutivos suficientes.';

  const signalsText =
    memory.signals.length
      ? memory.signals
          .slice(0, 5)
          .map(
            (signal, index) =>
              `${index + 1}. ${signal.title}\n${signal.message}`
          )
          .join('\n\n')
      : 'Nenhum sinalizador crítico identificado agora.';

  if (asksEvents) {
  return `
📊 EVENTOS RECENTES DA BEBCOM

━━━━━━━━━━━━━━━━━━

${eventsText}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Esses são os acontecimentos mais relevantes registrados recentemente na operação.
`.trim();
}

  if (asksPattern) {
  return `
🔄 PADRÃO IDENTIFICADO

━━━━━━━━━━━━━━━━━━

${memory.pattern}

━━━━━━━━━━━━━━━━━━

📈 Sinais positivos
${memory.improvementCount}

📉 Sinais negativos
${memory.worseningCount}

━━━━━━━━━━━━━━━━━━

🧠 Minha percepção

${memory.interpretation}
`.trim();
}

  if (asksMostImportant) {

  const signal =
    memory.dominantSignal;

  return `
🚨 FATO MAIS IMPORTANTE AGORA

━━━━━━━━━━━━━━━━━━

${signal?.title || 'Sem sinal dominante'}

━━━━━━━━━━━━━━━━━━

Motivo:

${signal?.message || 'Nenhum fator crítico identificado.'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Eu concentraria a atenção primeiro neste ponto.
`.trim();
}

  if (asksSummary) {
  return `
📚 RESUMO EVOLUTIVO DA BEBCOM

━━━━━━━━━━━━━━━━━━

Padrão atual:

${memory.pattern}

━━━━━━━━━━━━━━━━━━

Eventos positivos:
${memory.improvementCount}

Eventos negativos:
${memory.worseningCount}

━━━━━━━━━━━━━━━━━━

🧠 Conclusão

${memory.interpretation}
`.trim();
}

  return `
🧠 MEMÓRIA INTUITIVA DA BEBCOM

━━━━━━━━━━━━━━━━━━

📌 Padrão percebido

${memory.pattern}

━━━━━━━━━━━━━━━━━━

🧠 Minha intuição gerencial

${memory.interpretation}

━━━━━━━━━━━━━━━━━━

📊 Histórico recente

Melhoras:
${memory.improvementCount}

Pioras:
${memory.worseningCount}

━━━━━━━━━━━━━━━━━━

🎯 O que isso significa

A próxima decisão deve considerar não apenas os números atuais, mas também a direção que a operação vem seguindo.
`.trim();
};
  
const buildDynamicExecutiveMemoryAnswer = async (question, ctx, previousCtx) => {
  const lower = normalizeText(question);

  if (
    !lower.includes('o que mudou') &&
    !lower.includes('mudou desde') &&
    !lower.includes('minha situacao melhorou') &&
    !lower.includes('minha situação melhorou') &&
    !lower.includes('a operacao evoluiu') &&
    !lower.includes('a operação evoluiu') &&
    !lower.includes('estou melhorando') &&
    !lower.includes('estou piorando')
  ) {
    return null;
  }

  const profile = await buildDataReliabilityProfile(ctx);

  const incomeVariation = previousCtx
    ? calculateVariation(ctx.totalIncome, previousCtx.totalIncome)
    : null;

  const expenseVariation = previousCtx
    ? calculateVariation(ctx.totalExpenses, previousCtx.totalExpenses)
    : null;

 const balanceDifference = previousCtx
  ? Number(ctx.balance || 0) - Number(previousCtx.balance || 0)
  : null;

  const signals = [];

  if (incomeVariation !== null) {
    signals.push(
      `Entradas: ${incomeVariation.toFixed(1)}% em relação ao período anterior.`
    );
  }

  if (expenseVariation !== null) {
    signals.push(
      `Saídas: ${expenseVariation.toFixed(1)}% em relação ao período anterior.`
    );
  }

  if (balanceDifference !== null) {
  const resultSignal =
    balanceDifference >= 0
      ? `Resultado melhorou ${formatCurrency(balanceDifference)} em relação ao período anterior.`
      : `Resultado piorou ${formatCurrency(Math.abs(balanceDifference))} em relação ao período anterior.`;

  signals.push(resultSignal);
}

  let diagnosis =
    'Ainda preciso de mais base comparativa para afirmar uma evolução clara.';

  if (
    incomeVariation !== null &&
    expenseVariation !== null
  ) {
    if (
      incomeVariation > 0 &&
      expenseVariation <= incomeVariation &&
      ctx.balance >= previousCtx.balance
    ) {
      diagnosis =
        'A operação mostra sinais de evolução: as entradas melhoraram e as despesas não cresceram acima da receita.';
    } else if (
      expenseVariation > incomeVariation ||
      ctx.balance < previousCtx.balance
    ) {
      diagnosis =
        'A operação exige atenção: as despesas ou o resultado estão piorando em relação ao período anterior.';
    } else {
      diagnosis =
        'A operação está em comportamento misto, com sinais que precisam ser acompanhados nos próximos lançamentos.';
    }
  }

if (previousCtx) {
  if (ctx.balance < previousCtx.balance) {
    await registerExecutiveMemoryEvent({
      type: 'cash_pressure',
      severity: ctx.balance < 0 ? 'high' : 'medium',
      periodLabel: ctx.periodLabel,
      month: ctx.month,
      year: ctx.year,
      title: `Piora de caixa em ${ctx.periodLabel}`,
      summary: `O resultado piorou ${formatCurrency(Math.abs(ctx.balance - previousCtx.balance))} em relação ao período anterior.`,
      metric: 'balance',
      currentValue: ctx.balance,
      previousValue: previousCtx.balance,
      variation: ctx.balance - previousCtx.balance,
      source: 'Entry',
    });
  }

  if (ctx.balance > previousCtx.balance) {
    await registerExecutiveMemoryEvent({
      type: 'cash_recovery',
      severity: 'medium',
      periodLabel: ctx.periodLabel,
      month: ctx.month,
      year: ctx.year,
      title: `Melhora de caixa em ${ctx.periodLabel}`,
      summary: `O resultado melhorou ${formatCurrency(ctx.balance - previousCtx.balance)} em relação ao período anterior.`,
      metric: 'balance',
      currentValue: ctx.balance,
      previousValue: previousCtx.balance,
      variation: ctx.balance - previousCtx.balance,
      source: 'Entry',
    });
  }
}

  const recentMemoryText =
  await buildRecentExecutiveMemoryText();
  
  return `
🧠 MEMÓRIA EXECUTIVA DINÂMICA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 O que mudou

${
  signals.length
    ? signals.map((item) => `• ${item}`).join('\n')
    : 'Ainda não há comparação suficiente com o período anterior.'
}

━━━━━━━━━━━━━━━━━━

📌 Leitura atual

Entradas:
${formatCurrency(ctx.totalIncome)}

Saídas:
${formatCurrency(ctx.totalExpenses)}

Resultado:
${formatCurrency(ctx.balance)}

Contas pendentes:
${formatCurrency(ctx.pendingPayable)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${diagnosis}

━━━━━━━━━━━━━━━━━━

🔎 Confiabilidade da leitura

${profile.level}

${
  profile.notes.length
    ? profile.notes.map((item) => `• ${item}`).join('\n')
    : 'A base atual permite uma leitura consistente.'
}

━━━━━━━━━━━━━━━━━━

🧠 Eventos recentes da memória evolutiva

${recentMemoryText}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Continue lançando os dados diariamente. A cada novo lançamento, minha leitura pode mudar, porque a memória executiva deve acompanhar a base viva da Bebcom e não repetir conclusões antigas.
`.trim();
};

const buildOperationalAnalyticsAnswer = (
  question,
  ctx,
  previousCtx
) => {
  const lower = normalizeText(question);

  const wantsIncome =
    lower.includes('recebi') ||
    lower.includes('receita') ||
    lower.includes('faturamento') ||
    lower.includes('entrada') ||
    lower.includes('venda');

  const wantsExpense =
  lower.includes('gastei') ||
  lower.includes('gasto') ||
  lower.includes('despesa') ||
  lower.includes('paguei') ||
  lower.includes('pago') ||
  lower.includes('saida');

  const wantsTotal =
    lower.includes('quanto') ||
    lower.includes('total') ||
    lower.includes('somar') ||
    lower.includes('soma');

  if (
  lower.includes('resultado') &&
  lower.includes('saudavel')
) {
  const margin =
    ctx.totalIncome > 0
      ? (ctx.balance / ctx.totalIncome) * 100
      : 0;

  const status =
    ctx.balance >= 0
      ? '🟢 Saudável'
      : margin > -10
        ? '🟡 Atenção'
        : '🔴 Não saudável';

  return `
🏥 SAÚDE DO RESULTADO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Entradas
${formatCurrency(ctx.totalIncome)}

Saídas
${formatCurrency(ctx.totalExpenses)}

Resultado
${formatCurrency(ctx.balance)}

Margem do período
${margin.toFixed(1)}%

Classificação
${status}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${ctx.balance >= 0
  ? 'O período está gerando caixa e apresenta resultado positivo.'
  : 'O período está consumindo caixa. As saídas superaram as entradas.'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${ctx.balance >= 0
  ? 'Mantenha controle de compras e use a folga para proteger próximos vencimentos.'
  : 'Evite novas despesas, revise compras e priorize recuperação de caixa antes de ampliar compromissos.'}
`.trim();
}

  if (
  lower.includes('caixa suporta') ||
  lower.includes('suporta novas compras') ||
  lower.includes('posso comprar') ||
  lower.includes('comprar mais mercadoria')
) {
  const purchases = ctx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  const canBuy =
    ctx.balance > 0 &&
    ctx.pendingPayable < ctx.totalIncome &&
    purchaseShare < 60;

  return `
🛒 CAPACIDADE PARA NOVAS COMPRAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Resultado atual
${formatCurrency(ctx.balance)}

Contas pendentes
${formatCurrency(ctx.pendingPayable)}

Compras de mercadorias
${purchases ? formatCurrency(purchases.amount) : 'Não identificado'}

Peso das compras sobre entradas
${purchaseShare.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${canBuy
  ? 'O caixa possui alguma capacidade para compras, desde que sejam reposições estratégicas e de alto giro.'
  : 'Eu não ampliaria compras neste momento. O caixa está pressionado ou as compras já representam peso elevado.'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${canBuy
  ? 'Compre apenas itens essenciais, de giro rápido e com margem clara.'
  : 'Priorize vender estoque, negociar vencimentos e preservar caixa antes de assumir novas compras.'}
`.trim();
}

  if (
  lower.includes('quem merece renegociacao') ||
  lower.includes('fornecedores para negociar') ||
  lower.includes('quem devo renegociar')
) {
  const purchaseEntries = (ctx.entries || []).filter(
  (entry) =>
    entry.type === 'expense' &&
    entry.category === 'compras_mercadorias'
);

const suppliers = groupEntriesByField(
  purchaseEntries,
  'expense',
  'description'
).slice(0, 5);

  const list = suppliers
  .map((item, index) => {
    const share = getSharePercent(item.amount, ctx.totalExpenses);

    let reason = 'Concentração financeira relevante no período.';

    if (index === 0) {
      reason = 'Maior concentração financeira entre fornecedores/descrições.';
    } else if (item.count >= 3) {
      reason = 'Recorrência elevada de lançamentos no período.';
    }

    return `${index + 1}. ${item.name}
Valor: ${formatCurrency(item.amount)}
Participação nas saídas: ${share}%
Lançamentos: ${item.count}
Motivo: ${reason}`;
  })
  .join('\n\n');

  return `
🏦 FORNECEDORES DE MERCADORIAS PARA RENEGOCIAÇÃO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${list || 'Não encontrei fornecedores suficientes para análise.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Considerei como fornecedor apenas lançamentos de despesa classificados na categoria "compras_mercadorias".

Assim, funcionários, faturas, taxas, empréstimos e outras despesas não entram nesta análise.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Comece negociando prazo, frequência de compra, bonificação ou condição comercial com os maiores impactos antes de cortar itens importantes do mix.
`.trim();
}

  if (
  lower.includes('despesas merecem revisao') ||
  lower.includes('despesas merecem revisão') ||
  lower.includes('quais despesas revisar') ||
  lower.includes('despesas para revisar')
) {
  const expenses = (ctx.expensesByDescription || [])
    .filter((item) => item.amount > 0)
    .slice(0, 5);

  const list = expenses
    .map((item, index) => {
      const share = getSharePercent(item.amount, ctx.totalExpenses);

      return `${index + 1}. ${item.name}
Valor: ${formatCurrency(item.amount)}
Participação nas saídas: ${share}%
Lançamentos: ${item.count}`;
    })
    .join('\n\n');

  return `
🔎 DESPESAS QUE MERECEM REVISÃO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${list || 'Não encontrei despesas suficientes para análise.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Aqui considero todas as despesas, não apenas fornecedores de mercadorias.

Essa visão ajuda a separar negociação comercial de revisão de custos operacionais.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Revise primeiro despesas recorrentes, custos financeiros, folha, taxas e gastos que não estejam gerando retorno direto para a operação.
`.trim();
}

  if (
  lower.includes('canal mais cresceu') ||
  lower.includes('canal que mais cresceu')
) {
  const results = getGrowthRanking(
  ctx.incomeByChannel,
  previousCtx?.incomeByChannel
).filter((item) => item.variation > 0);

results.sort((a, b) => b.variation - a.variation);

const winner = results[0];

  if (!winner) {
    return 'Nenhum canal apresentou crescimento em relação ao período anterior.';
  }

  return buildSimpleEvolutionAnswer({
    title: '📈 CANAL QUE MAIS CRESCEU',
    name: winner.name,
    current: winner.current,
    previous: winner.previous,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
    variation: winner.variation,
    analysis: 'Esse foi o canal com maior crescimento proporcional em relação ao período anterior.',
    recommendation: 'Verifique se esse crescimento também preserva margem, recorrência e qualidade do caixa.',
  });
}

if (
  lower.includes('canal mais caiu') ||
  lower.includes('canal que mais caiu')
) {
  const results = getGrowthRanking(
    ctx.incomeByChannel,
    previousCtx?.incomeByChannel
  );

  results.sort((a, b) => a.variation - b.variation);

  const winner = results[0];

  if (!winner) {
    return 'Não encontrei base suficiente para comparar canais com o período anterior.';
  }

  return buildSimpleEvolutionAnswer({
    title: '📉 CANAL QUE MAIS CAIU',
    name: winner.name,
    current: winner.current,
    previous: winner.previous,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
    variation: winner.variation,
    analysis: 'Esse foi o canal com maior queda proporcional em relação ao período anterior.',
    recommendation: 'Investigue se a queda veio de preço, demanda, divulgação, concorrência ou comportamento do cliente.',
  });
}

  if (
  lower.includes('loja fisica esta crescendo') ||
  lower.includes('loja fisica cresceu') 
) {
  const currentAmount =
    getItemAmountByName(ctx.incomeByChannel, 'loja_fisica');

  const previousAmount =
    getItemAmountByName(previousCtx?.incomeByChannel, 'loja_fisica');

  return buildEvolutionLineAnswer({
    title: '🏪 EVOLUÇÃO DA LOJA FÍSICA',
    label: 'Canal loja física',
    currentAmount,
    previousAmount,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
  });
}

  if (
  lower.includes('ticket atual preocupa') ||
  lower.includes('ticket preocupa') ||
  lower.includes('ticket esta ajudando') ||
  lower.includes('ticket está ajudando') ||
  lower.includes('ticket esta atrapalhando') 
) {
  const ticket = ctx.managementReport?.averageTicket || 0;
  const previousTicket = previousCtx?.managementReport?.averageTicket || 0;
  const variation = calculateVariation(ticket, previousTicket);

  const status =
    ticket >= 22
      ? '🟢 Saudável'
      : ticket >= 20
        ? '🟡 Atenção'
        : '🔴 Crítico';

  return `
🎯 LEITURA EXECUTIVA DO TICKET — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Ticket atual
${formatCurrency(ticket)}

Ticket anterior
${formatCurrency(previousTicket)}

Variação
${variation === null ? 'Sem base anterior' : `${variation.toFixed(1)}%`}

Classificação
${status}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${ticket >= 20
  ? 'O ticket não é o principal problema isolado, mas ainda pode ajudar mais na recuperação do caixa.'
  : 'O ticket merece atenção porque está baixo para sustentar margem e geração de caixa.'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Trabalhe combos, adicionais e produtos de maior margem para elevar o valor médio sem depender apenas de mais fluxo.
`.trim();
}

  if (
  lower.includes('vendendo para mais clientes') ||
  lower.includes('mais clientes') ||
  lower.includes('mesmos clientes') ||
  lower.includes('atraindo mais clientes') ||
  lower.includes('volume de vendas preocupa')
) {
  const currentTickets = ctx.managementReport?.totalTickets || 0;
  const previousTickets = previousCtx?.managementReport?.totalTickets || 0;

  const currentTicketAvg = ctx.managementReport?.averageTicket || 0;
  const previousTicketAvg = previousCtx?.managementReport?.averageTicket || 0;

  const ticketVar = calculateVariation(currentTicketAvg, previousTicketAvg);
  const volumeVar = calculateVariation(currentTickets, previousTickets);

  return `
👥 CLIENTES, VOLUME E TICKET — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Comandas atuais
${currentTickets}

Comandas anteriores
${previousTickets}

Variação de volume
${volumeVar === null ? 'Sem base anterior' : `${volumeVar.toFixed(1)}%`}

Ticket atual
${formatCurrency(currentTicketAvg)}

Ticket anterior
${formatCurrency(previousTicketAvg)}

Variação do ticket
${ticketVar === null ? 'Sem base anterior' : `${ticketVar.toFixed(1)}%`}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${
  volumeVar !== null &&
  ticketVar !== null &&
  volumeVar < ticketVar
    ? 'O ponto mais sensível está no volume de vendas/clientes, não apenas no ticket médio.'
    : 'O comportamento exige acompanhamento conjunto de fluxo de clientes e valor médio por compra.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Se o volume caiu mais que o ticket, foque em fluxo, divulgação, recorrência e canais de venda. Se o ticket caiu mais, foque em combos e adicionais.
`.trim();
}

  if (
  lower.includes('despesa mais cresceu') ||
  lower.includes('despesas mais cresceram')
) {
  const results = getGrowthRanking(
    ctx.expenseCategories,
    previousCtx?.expenseCategories,
    'category'
  );

  results.sort((a, b) => b.variation - a.variation);

  const winner = results[0];

  if (!winner) {
    return 'Não encontrei base suficiente para comparar despesas com o período anterior.';
  }

  return buildSimpleEvolutionAnswer({
    title: '📈 DESPESA QUE MAIS CRESCEU',
    name: winner.name,
    current: winner.current,
    previous: winner.previous,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
    variation: winner.variation,
    analysis: 'Essa foi a despesa com maior crescimento proporcional no período.',
    recommendation: 'Verifique se esse aumento era planejado, recorrente ou pontual. Se for recorrente, merece ação imediata.',
  });
}

if (
  lower.includes('despesa mais caiu') ||
  lower.includes('despesas mais cairam') ||
  lower.includes('despesas mais caíram')
) {
  const results = getGrowthRanking(
    ctx.expenseCategories,
    previousCtx?.expenseCategories,
    'category'
  );

  results.sort((a, b) => a.variation - b.variation);

  const winner = results[0];

  if (!winner) {
    return 'Não encontrei base suficiente para comparar despesas com o período anterior.';
  }

  return buildSimpleEvolutionAnswer({
    title: '📉 DESPESA QUE MAIS CAIU',
    name: winner.name,
    current: winner.current,
    previous: winner.previous,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
    variation: winner.variation,
    analysis: 'Essa foi a despesa com maior redução proporcional no período.',
    recommendation: 'Confirme se a queda é economia real ou apenas adiamento de pagamento.',
  });
}

  if (
  lower.includes('caixa esta melhor') ||
  lower.includes('caixa melhor ou pior') ||
  lower.includes('situacao financeira melhorou') ||
  lower.includes('melhorou ou piorou')
) {
  const variation = calculateVariation(
    ctx.balance,
    previousCtx?.balance || 0
  );

  return `
📊 COMPARAÇÃO DE CAIXA

━━━━━━━━━━━━━━━━━━

${ctx.periodLabel}
${formatCurrency(ctx.balance)}

${previousCtx?.periodLabel || 'Período anterior'}
${formatCurrency(previousCtx?.balance || 0)}

Variação
${variation === null ? 'Sem base anterior' : `${variation.toFixed(1)}%`}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${
  ctx.balance >= (previousCtx?.balance || 0)
    ? 'A situação de caixa melhorou em relação ao período anterior.'
    : 'A situação de caixa piorou em relação ao período anterior.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa comparação para decidir se o foco deve ser crescimento, contenção ou recuperação de caixa.
`.trim();
}

  // V11.4.97.1 — CATEGORIA QUE MAIS PRESSIONA
if (
  lower.includes('categoria mais pesa') ||
  lower.includes('categoria mais consome') ||
  lower.includes('maior despesa') ||
  lower.includes('maior categoria') ||
  lower.includes('categorias mais pesaram')||
  lower.includes('despesa mais consome') ||
  lower.includes('despesa que mais consome') ||
  lower.includes('qual despesa mais consome') 
) {
  const topCategory = ctx.expenseCategories?.[0];

  if (!topCategory) {
    return 'Não encontrei categorias de despesas suficientes para essa análise.';
  }

  return `
🏆 CATEGORIA QUE MAIS PRESSIONA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Categoria
${topCategory.category}

💰 Valor
${formatCurrency(topCategory.amount)}

📊 Participação nas saídas
${getSharePercent(topCategory.amount, ctx.totalExpenses)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa é a categoria que mais consumiu recursos no período analisado.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Comece por essa categoria antes de tentar cortar pequenas despesas, porque ela tende a gerar o maior impacto no caixa.
`.trim();
}

  if (
  lower.includes('categoria mais cresceu')
) {

  const growths = [];

  ctx.expenseCategories.forEach((current) => {

    const previous =
      previousCtx?.expenseCategories?.find(
        item =>
          item.category === current.category
      );

    const variation =
      calculateVariation(
        current.amount,
        previous?.amount || 0
      );

    if (variation !== null) {
      growths.push({
        category: current.category,
        variation,
        current: current.amount,
      });
    }
  });

  growths.sort(
    (a, b) => b.variation - a.variation
  );

  const winner = growths[0];
  if (!winner) {
  return 'Não encontrei base suficiente para comparar categorias com o período anterior.';
}

  return `
📈 CATEGORIA QUE MAIS CRESCEU

━━━━━━━━━━━━━━━━━━

Categoria
${winner.category}

📊 Crescimento
${winner.variation.toFixed(1)}%

💰 Valor atual
${formatCurrency(winner.current)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa foi a categoria com maior crescimento em relação ao mês anterior.
`.trim();
}

  if (
  lower.includes('categoria mais caiu')
) {

  const growths = [];

  ctx.expenseCategories.forEach((current) => {

    const previous =
      previousCtx?.expenseCategories?.find(
        item =>
          item.category === current.category
      );

    const variation =
      calculateVariation(
        current.amount,
        previous?.amount || 0
      );

    if (variation !== null) {
      growths.push({
        category: current.category,
        variation,
        current: current.amount,
      });
    }
  });

 growths.sort(
  (a, b) => a.variation - b.variation
);

  const winner = growths[0];
  if (!winner) {
  return 'Não encontrei base suficiente para comparar categorias com o período anterior.';
}

return `
📉 CATEGORIA QUE MAIS CAIU

━━━━━━━━━━━━━━━━━━

Categoria
${winner.category}

📊 Variação
${winner.variation.toFixed(1)}%

💰 Valor atual
${formatCurrency(winner.current)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa foi a categoria com maior queda em relação ao período anterior.
`.trim();
}
  
  // V11.4.97.3 — COMPRAS ESTÃO AUMENTANDO?
if (
  lower.includes('compras estao aumentando') ||
  lower.includes('compras cresceram') ||
  lower.includes('compras aumentaram')
) {
  const currentAmount =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    )?.amount || 0;

  const previousAmount =
    previousCtx?.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    )?.amount || 0;

  return buildEvolutionLineAnswer({
    title: '📦 EVOLUÇÃO DAS COMPRAS DE MERCADORIAS',
    label: 'Compras de mercadorias',
    currentAmount,
    previousAmount,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
  });
}

// V11.4.97.3 — FUNCIONÁRIOS ESTÃO PESANDO MAIS?
if (
  lower.includes('funcionarios estao pesando') ||
  lower.includes('funcionários estao pesando') ||
  lower.includes('funcionarios pesando mais') ||
  lower.includes('funcionários pesando mais')
) {
  const currentAmount =
    ctx.expenseCategories?.find(
      (item) => item.category === 'funcionarios'
    )?.amount || 0;

  const previousAmount =
    previousCtx?.expenseCategories?.find(
      (item) => item.category === 'funcionarios'
    )?.amount || 0;

  return buildEvolutionLineAnswer({
    title: '👥 EVOLUÇÃO DE FUNCIONÁRIOS',
    label: 'Funcionários',
    currentAmount,
    previousAmount,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
  });
}

// V11.4.97.3 — PIX ESTÁ CRESCENDO?
if (
  lower.includes('pix esta crescendo') ||
  lower.includes('pix cresceu') ||
  lower.includes('pix aumentando')
) {
  const currentAmount =
    getItemAmountByName(ctx.incomeByPaymentMethod, 'pix');

  const previousAmount =
    getItemAmountByName(previousCtx?.incomeByPaymentMethod, 'pix');

  return buildEvolutionLineAnswer({
    title: '💳 EVOLUÇÃO DO PIX',
    label: 'Recebimentos em PIX',
    currentAmount,
    previousAmount,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
  });
}

// V11.4.97.3 — IFOOD ESTÁ CRESCENDO?
if (
  lower.includes('ifood esta crescendo') ||
  lower.includes('ifood cresceu') ||
  lower.includes('ifood aumentando')
) {
  const currentAmount =
    getItemAmountByName(ctx.incomeByChannel, 'ifood');

  const previousAmount =
    getItemAmountByName(previousCtx?.incomeByChannel, 'ifood');

  return buildEvolutionLineAnswer({
    title: '🛒 EVOLUÇÃO DO IFOOD',
    label: 'Canal iFood',
    currentAmount,
    previousAmount,
    currentLabel: ctx.periodLabel,
    previousLabel: previousCtx?.periodLabel || 'Período anterior',
  });
}

  

  // V11.4.97.1 — FORNECEDOR QUE MAIS CONSOME CAIXA
if (
  lower.includes('fornecedor mais consome') ||
  lower.includes('fornecedor mais consumiu') ||
  lower.includes('maior fornecedor') ||
  lower.includes('quem mais recebeu') ||
  lower.includes('fornecedor que mais pesa')
) {
  const topSupplier = getTopItem(ctx.expensesByDescription);

  if (!topSupplier) {
    return 'Não encontrei fornecedores suficientes para essa análise.';
  }

  return `
🏦 FORNECEDOR QUE MAIS CONSUMIU CAIXA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Descrição/Fornecedor
${topSupplier.name}

💰 Valor
${formatCurrency(topSupplier.amount)}

📋 Lançamentos
${topSupplier.count}

📊 Participação nas saídas
${getSharePercent(topSupplier.amount, ctx.totalExpenses)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse fornecedor concentra a maior saída financeira registrada no período.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Revise prazo, frequência de compra, necessidade real de reposição e possibilidade de negociação.
`.trim();
}

  // V11.4.97.3 — FORNECEDOR MAIS CRESCEU / CAIU
if (
  lower.includes('fornecedor mais cresceu') ||
  lower.includes('fornecedor mais caiu')
) {
  const results = [];

  (ctx.expensesByDescription || []).forEach((current) => {
    const previousAmount =
      getItemAmountByName(
        previousCtx?.expensesByDescription,
        current.name
      );

    const variation =
      calculateVariation(
        current.amount,
        previousAmount
      );

    if (variation !== null) {
      results.push({
        name: current.name,
        current: current.amount,
        previous: previousAmount,
        variation,
      });
    }
  });

  if (!results.length) {
    return 'Não encontrei base suficiente para comparar fornecedores com o período anterior.';
  }

  const isDecline =
    lower.includes('caiu');

  results.sort((a, b) =>
    isDecline
      ? a.variation - b.variation
      : b.variation - a.variation
  );

  const winner = results[0];

  return `
${isDecline ? '📉 FORNECEDOR QUE MAIS CAIU' : '📈 FORNECEDOR QUE MAIS CRESCEU'}

━━━━━━━━━━━━━━━━━━

Fornecedor/Descrição
${winner.name}

${ctx.periodLabel}: ${formatCurrency(winner.current)}
${previousCtx?.periodLabel || 'Período anterior'}: ${formatCurrency(winner.previous)}

📊 Variação
${winner.variation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse foi o fornecedor/descrição com maior ${isDecline ? 'queda' : 'crescimento'} em relação ao período anterior.
`.trim();
}

  // V11.4.97.1 — CANAL QUE MAIS VENDE
if (
  lower.includes('canal vende mais') ||
  lower.includes('canal que mais vende') ||
  lower.includes('canal mais vendeu') ||
  lower.includes('quem vende mais') ||
  lower.includes('maior canal de venda')
) {
  const topChannel = getTopItem(ctx.incomeByChannel);

  if (!topChannel) {
    return 'Não encontrei canais de venda suficientes para essa análise.';
  }

  return `
🛒 CANAL QUE MAIS VENDE — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Canal
${topChannel.name}

💰 Faturamento
${formatCurrency(topChannel.amount)}

📋 Lançamentos
${topChannel.count}

📊 Participação nas entradas
${getSharePercent(topChannel.amount, ctx.totalIncome)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse foi o canal com maior volume financeiro de entradas no período.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Fortaleça esse canal, mas observe se ele também preserva margem e recorrência.
`.trim();
}

  // V11.4.97.1 — FORMA DE PAGAMENTO DOMINANTE
if (
  lower.includes('forma de pagamento domina') ||
  lower.includes('forma de pagamento dominante') ||
  lower.includes('recebo mais em') ||
  lower.includes('pagamento mais usado') ||
  lower.includes('maior forma de pagamento')
) {
  const topPayment = getTopItem(ctx.incomeByPaymentMethod);

  if (!topPayment) {
    return 'Não encontrei formas de pagamento suficientes para essa análise.';
  }

  return `
💳 FORMA DE PAGAMENTO DOMINANTE — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Forma de pagamento
${topPayment.name}

💰 Total recebido
${formatCurrency(topPayment.amount)}

📋 Lançamentos
${topPayment.count}

📊 Participação nas entradas
${getSharePercent(topPayment.amount, ctx.totalIncome)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa foi a forma de pagamento mais representativa no faturamento registrado.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Acompanhe taxas, prazos de recebimento e impacto no caixa real.
`.trim();
}

  // V11.4.97.2 — O QUE MAIS PRESSIONA O CAIXA
if (
  lower.includes('o que mais pressiona meu caixa') ||
  lower.includes('maior pressao do caixa') ||
  lower.includes('o que pressiona o caixa')
) {
  const topCategory = ctx.expenseCategories?.[0];

  if (!topCategory) {
    return 'Não encontrei despesas suficientes para identificar a pressão principal do caixa.';
  }

  return `
🚨 PRINCIPAL PRESSÃO DO CAIXA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Categoria principal
${topCategory.category}

💰 Valor
${formatCurrency(topCategory.amount)}

📊 Peso nas saídas
${getSharePercent(topCategory.amount, ctx.totalExpenses)}%

━━━━━━━━━━━━━━━━━━

📌 Situação do período

Entradas: ${formatCurrency(ctx.totalIncome)}
Saídas: ${formatCurrency(ctx.totalExpenses)}
Resultado: ${formatCurrency(ctx.balance)}
Contas pendentes: ${formatCurrency(ctx.pendingPayable)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Hoje a maior pressão do caixa está concentrada nessa categoria.

Pela memória da Bebcom, o ponto de atenção não é apenas vender, mas transformar venda em caixa saudável.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Ataque primeiro essa categoria e acompanhe se ela está gerando giro real ou apenas aumentando pressão financeira.
`.trim();
}

  // V11.4.97.2 — ONDE ESTOU PERDENDO DINHEIRO
if (
  lower.includes('onde estou perdendo dinheiro') ||
  lower.includes('onde perco dinheiro') ||
  lower.includes('onde a operação perde dinheiro') ||
  lower.includes('onde a operacao perde dinheiro')
) {
  const topCategory = ctx.expenseCategories?.[0];

  return `
🔎 ONDE A OPERAÇÃO ESTÁ PERDENDO FORÇA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 Resultado do período
${formatCurrency(ctx.balance)}

💸 Maior grupo de saída
${topCategory ? `${topCategory.category} — ${formatCurrency(topCategory.amount)}` : 'Não identificado'}

💰 Contas pendentes
${formatCurrency(ctx.pendingPayable)}

🎯 Ticket médio
${formatCurrency(ctx.managementReport?.averageTicket || 0)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

A perda de força não está necessariamente apenas nas vendas.

Ela pode estar na combinação entre compras, despesas, contas pendentes, margem e giro de estoque.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Procure primeiro onde há maior saída recorrente e compare com o retorno real em vendas, margem e giro.
`.trim();
}

  // V11.4.97.2 — PRIMEIRA AÇÃO EXECUTIVA
if (
  lower.includes('qual seria minha primeira ação') ||
  lower.includes('qual seria minha primeira acao') ||
  lower.includes('o que faço primeiro') ||
  lower.includes('o que faco primeiro') ||
  lower.includes('primeira ação') ||
  lower.includes('primeira acao')
) {
  const topCategory = ctx.expenseCategories?.[0];

  let firstAction =
    'Organizar caixa, revisar compras e acompanhar vencimentos.';

  if (ctx.pendingPayable > ctx.totalIncome) {
    firstAction =
      'Mapear contas a pagar, priorizar vencimentos críticos e negociar prazos antes de assumir novas compras.';
  } else if (ctx.balance < 0) {
    firstAction =
      'Conter novas despesas e entender por que as saídas superaram as entradas.';
  } else if (topCategory?.category === 'compras_mercadorias') {
    firstAction =
      'Revisar compras de mercadorias e confirmar se o estoque comprado está realmente virando venda.';
  }

  return `
🎯 PRIMEIRA AÇÃO EXECUTIVA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Minha primeira ação seria:

${firstAction}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

A Bebcom historicamente melhora quando Rodrigo começa pela operação: caixa, compras, estoque, vencimentos e giro.

━━━━━━━━━━━━━━━━━━

✅ Próximo passo prático

Hoje eu separaria:

1. contas urgentes;
2. compras indispensáveis;
3. produtos parados;
4. fornecedores negociáveis;
5. ações rápidas para gerar caixa.
`.trim();
}

  // V11.4.97.2 — SE EU FOSSE O RODRIGO
if (
  lower.includes('se fosse o rodrigo') ||
  lower.includes('o que eu faria como rodrigo') ||
  lower.includes('o que voce faria se fosse o rodrigo')
) {
  return `
🧭 VISÃO EXECUTIVA DO RODRIGO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Se eu pensasse com a experiência acumulada da Bebcom, eu faria nesta ordem:

1. Conferir caixa e vencimentos próximos.
2. Revisar compras de mercadorias.
3. Verificar se o estoque está girando.
4. Observar ticket médio e comandas.
5. Negociar fornecedores com maior peso.
6. Evitar decisões que aumentem pressão no caixa.

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

A história da Bebcom mostra que os melhores ajustes vieram de controle operacional, revisão de preços, fornecedores, mix e atendimento — não de decisões impulsivas.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Agir com firmeza, mas sem perder a identidade da Bebcom: preço justo, atendimento forte, produto gelado, variedade e controle.
`.trim();
}

  // V11.4.97.3 — COMPARATIVO EVOLUTIVO

  // CONTAS PAGAS / BOLETOS / PAGAMENTOS REALIZADOS
if (
  (
    lower.includes('contas pagas') ||
    lower.includes('boletos') ||
    lower.includes('pagamentos realizados')
  ) &&
  !extractSupplierPayableName(question)
) {
  const paidEntries = (ctx.entries || []).filter(
    (entry) => entry.type === 'expense'
  );

  const totalPaid = paidEntries.reduce(
    (acc, entry) => acc + Math.abs(Number(entry.amount || 0)),
    0
  );

  return `
💸 PAGAMENTOS REALIZADOS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Total pago
${formatCurrency(totalPaid)}

📋 Quantidade de lançamentos
${paidEntries.length}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor representa o total de pagamentos/despesas já lançados no período analisado.

Se a intenção for contas ainda em aberto, use: "Total de contas a pagar".
`.trim();
}

  // TOTAL DE FATURAMENTO / RECEITA / ENTRADAS
  if (
    wantsTotal &&
    (
      lower.includes('faturamento') ||
      lower.includes('receita') ||
      lower.includes('entrada') ||
      lower.includes('vendas')
    )
  ) {
    return `
📈 TOTAL DE ENTRADAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Total recebido
${formatCurrency(ctx.totalIncome)}

📋 Quantidade de lançamentos
${
  (ctx.entries || []).filter(
    (entry) => entry.type === 'income'
  ).length
}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor representa o total de entradas registradas no período analisado.
`.trim();
  }

 // TOTAL DE DESPESAS / SAÍDAS / PAGO
if (
  wantsTotal &&
  (
    lower.includes('despesa') ||
    lower.includes('despesas') ||
    lower.includes('saida') ||
    lower.includes('saidas') ||
    lower.includes('pago') ||
    lower.includes('paguei') ||
    lower.includes('gastos')
  )
) {
  return `
💸 TOTAL DE SAÍDAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Total pago/lançado
${formatCurrency(ctx.totalExpenses)}

📋 Quantidade de lançamentos
${
  (ctx.entries || []).filter(
    (entry) => entry.type === 'expense'
  ).length
}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor representa o total de saídas registradas no período analisado.
`.trim();
}

  // FORMA DE PAGAMENTO — PIX / DINHEIRO / CRÉDITO / DÉBITO
  const paymentTerms = [
    'pix',
    'dinheiro',
    'credito',
    'crédito',
    'debito',
    'débito',
    'cartao',
    'cartão',
  ];

  const paymentTerm = paymentTerms.find((term) =>
    lower.includes(normalizeText(term))
  );

  if (paymentTerm && wantsIncome) {
    const result = sumGroupedItems(
      ctx.incomeByPaymentMethod,
      paymentTerm
    );

    return `
💳 RECEBIMENTOS POR FORMA DE PAGAMENTO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Forma de pagamento
${paymentTerm.toUpperCase()}

💰 Total recebido
${formatCurrency(result.amount)}

📋 Quantidade de lançamentos
${result.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor representa quanto entrou por essa forma de pagamento no período analisado.
`.trim();
  }

  if (paymentTerm && wantsExpense) {
    const result = sumGroupedItems(
      ctx.expensesByPaymentMethod,
      paymentTerm
    );

    return `
💳 PAGAMENTOS POR FORMA DE PAGAMENTO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Forma de pagamento
${paymentTerm.toUpperCase()}

💰 Total pago
${formatCurrency(result.amount)}

📋 Quantidade de lançamentos
${result.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor representa quanto saiu por essa forma de pagamento no período analisado.
`.trim();
  }

  // CANAL DE VENDA — IFOOD / DELIVERY / LOJA
  const channelTerms = [
    'ifood',
    'delivery',
    'loja',
    'loja fisica',
    'loja física',
    'balcao',
    'balcão',
  ];

  const channelTerm = channelTerms.find((term) =>
    lower.includes(normalizeText(term))
  );

  if (channelTerm && wantsIncome) {
    const result = sumGroupedItems(
      ctx.incomeByChannel,
      channelTerm
    );

    return `
🛒 RECEBIMENTOS POR CANAL — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Canal
${channelTerm.toUpperCase()}

💰 Total recebido
${formatCurrency(result.amount)}

📋 Quantidade de lançamentos
${result.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor mostra quanto entrou por esse canal de venda no período analisado.
`.trim();
  }

  // MELHOR DIA DE VENDAS
  if (
    (
      lower.includes('melhor dia') ||
      lower.includes('maior dia')
    ) &&
    (
      lower.includes('venda') ||
      lower.includes('faturamento') ||
      lower.includes('receita')
    )
  ) {
    const bestDay = ctx.incomeByDay?.[0];

    if (!bestDay) {
      return `
Não encontrei entradas suficientes para identificar o melhor dia de vendas em ${ctx.periodLabel}.
`.trim();
    }

    return `
🏆 MELHOR DIA DE VENDAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📅 Dia
${bestDay.name}

💰 Total recebido
${formatCurrency(bestDay.amount)}

📋 Quantidade de lançamentos
${bestDay.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse foi o dia com maior volume financeiro registrado em entradas no período analisado.
`.trim();
  }

  // RANKINGS
  if (
    lower.includes('ranking') ||
    lower.includes('top 10') ||
    lower.includes('maiores')
  ) {
    if (lower.includes('fornecedor')) {
      return `
🏆 RANKING DE FORNECEDORES — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${formatRanking(ctx.expensesByPerson)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse ranking mostra os fornecedores ou pessoas com maior volume de saídas registradas no período.
`.trim();
    }

    if (
      lower.includes('categoria') ||
      lower.includes('despesa') ||
      lower.includes('gasto')
    ) {
      return `
🏆 RANKING DE CATEGORIAS DE DESPESA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${formatRanking(
  (ctx.expenseCategories || []).map((item) => ({
    name: item.category,
    amount: item.amount,
    count: 0,
  }))
)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse ranking mostra as categorias que mais consumiram recursos no período.
`.trim();
    }
  }

  // BUSCA POR FORNECEDOR / DESCRIÇÃO GENÉRICA
  if (wantsTotal || lower.includes('total de')) {
    const cleaned = lower
      .replace('quanto', '')
      .replace('total de', '')
      .replace('total', '')
      .replace('somar', '')
      .replace('soma', '')
      .replace('recebi de', '')
      .replace('gastei com', '')
      .replace('gasto com', '')
      .replace('paguei para', '')
      .replace('paguei de', '')
      .replace('pago em', '')
      .replace('em junho', '')
      .replace('em maio', '')
      .replace('essa semana', '')
      .replace('nesta semana', '')
      .replace('semana passada', '')
      .replace('mes passado', '')
      .replace('mês passado', '')
      .replace('do mes', '')
      .replace('do mês', '')
      .replace('do ano', '')
      .replace('?', '')
      .trim();

    if (cleaned.length >= 3) {
      const source =
        wantsIncome
          ? ctx.incomeByDescription
          : ctx.expensesByDescription;

      const result = sumGroupedItems(
        source,
        cleaned
      );

      if (result.amount > 0 || result.count > 0) {
        return `
🔎 TOTAL POR DESCRIÇÃO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Busca
${cleaned}

💰 Total
${formatCurrency(result.amount)}

📋 Quantidade de lançamentos
${result.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor foi encontrado somando lançamentos cuja descrição contém o termo pesquisado.
`.trim();
      }

      const personSource =
        wantsIncome
          ? ctx.incomeByPerson
          : ctx.expensesByPerson;

      const personResult = sumGroupedItems(
        personSource,
        cleaned
      );

      if (personResult.amount > 0 || personResult.count > 0) {
        return `
🔎 TOTAL POR PESSOA/FORNECEDOR — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Busca
${cleaned}

💰 Total
${formatCurrency(personResult.amount)}

📋 Quantidade de lançamentos
${personResult.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse valor foi encontrado somando lançamentos vinculados a pessoa/fornecedor correspondente.
`.trim();
      }
    }
  }

  return null;
};

const buildOperationAnswer = (ctx) => {
  const averageTicket = ctx.managementReport?.averageTicket || 0;
  const inventoryPosition = getInventoryEstimatedPosition(ctx);
  const inventoryBalance = getInventoryStockBalance(ctx);

 return `
🧠 PONTOS DE ATENÇÃO OPERACIONAL — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 Caixa

Resultado realizado do período
${formatCurrency(ctx.balance)}

${
  ctx.balance < 0
    ? '⚠️ O resultado realizado está negativo no período analisado.'
    : '🟢 O resultado realizado está positivo no período analisado.'
}

━━━━━━━━━━━━━━━━━━

💸 Despesas

Saídas realizadas
${formatCurrency(ctx.totalExpenses)}

━━━━━━━━━━━━━━━━━━

📋 Contas

Contas a pagar pendentes/vencidas
${formatCurrency(ctx.pendingPayable)}

━━━━━━━━━━━━━━━━━━

🎯 Ticket médio

Ticket médio registrado
${formatCurrency(averageTicket)}

${
  averageTicket === 0
    ? '⚠️ O Relatório Gerencial ainda precisa ser alimentado para leitura operacional completa.'
    : '🟢 Esse indicador já permite avaliar qualidade de venda e comportamento de consumo.'
}

━━━━━━━━━━━━━━━━━━

📦 Estoque

Posição estimada do estoque
${formatCurrency(inventoryPosition)}

${buildConsultiveClosing({
  situation:
    'A operação depende do equilíbrio entre caixa, compras, estoque e vendas.',

  recommendation:
    'Acompanhe diariamente caixa, compras e contas a pagar para evitar pressão operacional acumulada.'
})}
`.trim();
};

const buildProfitStatusAnswer = (ctx) => {
  const balance = Number(ctx.balance || 0);

  const status =
    balance >= 0
      ? 'ganhando dinheiro'
      : 'perdendo dinheiro';

  const reading =
    balance >= 0
      ? 'As entradas superam as saídas no período analisado.'
      : 'As saídas superam as entradas no período analisado.';

  return `
📊 RESULTADO DO PERÍODO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Entradas
${formatCurrency(ctx.totalIncome)}

💸 Saídas
${formatCurrency(ctx.totalExpenses)}

📈 Resultado
${formatCurrency(balance)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Neste momento, a operação está ${status} no período analisado.

${reading}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use esse resultado junto com compras, contas a pagar e estoque para entender se o caixa está realmente saudável ou apenas temporariamente equilibrado.
`.trim();
};

const buildAlertsAnswer = (
  currentCtx,
  previousCtx
) => {

  const alerts =
    buildOperationalAlerts(
      currentCtx,
      previousCtx
    );

  if (!alerts.length) {
    return `
🚨 ALERTAS GERENCIAIS

━━━━━━━━━━━━━━━━━━

🟢 Nenhum alerta crítico identificado.

A operação não apresenta riscos relevantes neste momento.

👉 Próxima ação sugerida

Continue acompanhando caixa, despesas e compras regularmente.
`.trim();
  }

  const list = alerts
    .map((alert, index) => {

      const icon =
        alert.level === 'critical'
          ? '🔴'
          : '🟡';

      return `${index + 1}. ${icon} ${alert.message}`;
    })
    .join('\n\n');

  return `
🚨 ALERTAS GERENCIAIS

━━━━━━━━━━━━━━━━━━

${list}

${buildConsultiveClosing({
  situation:
    'Os alertas representam os principais riscos operacionais e financeiros identificados automaticamente pela IA.',

  recommendation:
    'Comece corrigindo os alertas críticos antes dos alertas de atenção.'
})}
`.trim();
};

const buildExecutiveAdviceAnswer = (
  currentCtx,
  previousCtx
) => {

  const decisions =
    buildExecutiveDecision(currentCtx);

  const recommendations =
    buildStrategicRecommendations(currentCtx);

  const memory =
    buildExecutiveMemory(
      currentCtx,
      previousCtx
    );

  return `
🧠 O QUE EU FARIA NO SEU LUGAR

━━━━━━━━━━━━━━━━━━

📊 Situação atual

Resultado:
${formatCurrency(currentCtx.balance)}

Contas pendentes:
${formatCurrency(currentCtx.pendingPayable)}

━━━━━━━━━━━━━━━━━━

🎯 Minha decisão

${
  decisions.length
    ? decisions.map(item => `• ${item}`).join('\n')
    : 'Nenhuma ação crítica identificada.'
}

━━━━━━━━━━━━━━━━━━

📈 Recomendações estratégicas

${
  recommendations.length
    ? recommendations.map(item => `• ${item}`).join('\n')
    : 'Nenhuma recomendação adicional.'
}

━━━━━━━━━━━━━━━━━━

🧠 Memória operacional

${
  memory.length
    ? memory.map(item => `• ${item}`).join('\n')
    : 'Ainda não existem períodos suficientes para análise evolutiva.'
}

━━━━━━━━━━━━━━━━━━

👉 Minha posição

Hoje eu tomaria decisões focadas em caixa, compras, contas pendentes e geração de margem antes de buscar expansão.
`.trim();
};

const buildRecoveryPlanAnswer = (
  currentCtx,
  operationalScore,
  operationalPriorities,
  strategicRecommendations
) => {
  const topExpense = currentCtx.expenseCategories?.[0];

  const purchases = currentCtx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  const purchaseShare =
    purchases && currentCtx.totalIncome > 0
      ? (purchases.amount / currentCtx.totalIncome) * 100
      : 0;

  const decisions = buildExecutiveDecision(currentCtx);

  const sevenDaysActions = [];

  if (currentCtx.balance < 0) {
    sevenDaysActions.push(
      `Preservar caixa imediatamente. O resultado atual está negativo em ${formatCurrency(Math.abs(currentCtx.balance))}.`
    );
  }

  if (purchaseShare > 60) {
    sevenDaysActions.push(
      `Reduzir compras não críticas por 7 dias. Compras representam ${purchaseShare.toFixed(1)}% das entradas.`
    );
  }

  if (currentCtx.pendingPayable > 0) {
    sevenDaysActions.push(
      `Acompanhar vencimentos diariamente. Contas pendentes somam ${formatCurrency(currentCtx.pendingPayable)}.`
    );
  }

  if (topExpense) {
    sevenDaysActions.push(
      `Atacar primeiro o maior grupo de saída: ${topExpense.category}, com ${formatCurrency(topExpense.amount)}.`
    );
  }

  const thirtyDaysActions = [
    'Renegociar prazos com fornecedores de maior peso.',
    'Revisar compras com baixo giro antes de novas reposições.',
    'Aumentar margem com combos, adicionais e produtos complementares.',
    'Separar despesas essenciais das despesas negociáveis.',
  ];

  const ninetyDaysActions = [
    'Construir reserva operacional mínima.',
    'Ajustar estoque ao ritmo real de faturamento.',
    'Criar rotina semanal de análise de caixa, compras e contas a pagar.',
    'Usar o score gerencial como indicador de saúde da operação.',
  ];

  return `
🛠️ PLANO PERSONALIZADO DE RECUPERAÇÃO — ${currentCtx.periodLabel}

━━━━━━━━━━━━━━━━━━

🎯 Objetivo principal

Recuperar equilíbrio de caixa, reduzir pressão financeira e melhorar a geração de margem da operação.

━━━━━━━━━━━━━━━━━━

📊 Diagnóstico rápido

Resultado do período
${formatCurrency(currentCtx.balance)}

Contas pendentes
${formatCurrency(currentCtx.pendingPayable)}

Score gerencial
${operationalScore.score}/100 — ${operationalScore.status}

${
  purchases
    ? `Compras de mercadorias\n${formatCurrency(purchases.amount)} — ${purchaseShare.toFixed(1)}% das entradas`
    : 'Compras de mercadorias\nSem concentração relevante identificada.'
}

━━━━━━━━━━━━━━━━━━

📅 Próximos 7 dias — Ações imediatas

${
  sevenDaysActions.length
    ? sevenDaysActions.map((item) => `• ${item}`).join('\n')
    : '• Manter acompanhamento diário do caixa e evitar novas pressões financeiras.'
}

━━━━━━━━━━━━━━━━━━

📅 Próximos 30 dias — Ajuste operacional

${thirtyDaysActions.map((item) => `• ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━

📅 Próximos 90 dias — Estabilização

${ninetyDaysActions.map((item) => `• ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━

🚨 Prioridades identificadas

${
  operationalPriorities.length
    ? operationalPriorities
        .slice(0, 5)
        .map((item) => `• ${item.message}`)
        .join('\n')
    : 'Nenhuma prioridade crítica identificada.'
}

━━━━━━━━━━━━━━━━━━

🧠 Decisão executiva

${
  decisions.length
    ? decisions.map((item) => `• ${item}`).join('\n')
    : 'Nenhuma decisão crítica adicional identificada.'
}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

${
  operationalScore.score >= 80
    ? 'A operação permite foco em crescimento sustentável, mantendo disciplina financeira.'
    : operationalScore.score >= 60
      ? 'A operação precisa de estabilidade, proteção de caixa e controle mais firme das compras.'
      : 'A operação exige recuperação financeira imediata. O foco deve ser preservar caixa, controlar compras e reduzir pressão de contas pendentes.'
}

━━━━━━━━━━━━━━━━━━

👉 Indicador de sucesso

Voltar o resultado do período para positivo, reduzir contas pendentes e diminuir o peso das compras sobre as entradas.
`.trim();
};

const buildExecutivePriorityAnswer = (ctx) => {
  const priorities = [];

  const purchases =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  const ticket =
    Number(ctx.managementReport?.averageTicket || 0);

  if (ctx.balance < 0) {
    priorities.push({
      weight: 100,
      title: 'Recuperar o caixa',
      reason: `O resultado do período está negativo em ${formatCurrency(ctx.balance)}.`,
      action:
        'Evitar novas compras não essenciais e priorizar geração rápida de caixa.',
    });
  }

  if (ctx.pendingPayable > ctx.totalIncome * 0.5) {
    priorities.push({
      weight: 90,
      title: 'Controlar contas pendentes',
      reason: `As contas a pagar somam ${formatCurrency(ctx.pendingPayable)}.`,
      action:
        'Listar vencimentos próximos e negociar ou priorizar pagamentos críticos.',
    });
  }

  if (purchaseShare > 60) {
    priorities.push({
      weight: 80,
      title: 'Reduzir pressão de compras',
      reason: `Compras representam ${purchaseShare.toFixed(1)}% das entradas.`,
      action:
        'Comprar apenas itens de giro alto até o caixa ficar mais confortável.',
    });
  }

  if (ticket > 0 && ticket < 20) {
    priorities.push({
      weight: 70,
      title: 'Elevar ticket médio',
      reason: `O ticket médio atual está em ${formatCurrency(ticket)}.`,
      action:
        'Criar combos simples e oferecer complementos em toda venda.',
    });
  }

  if (ctx.totalIncome > 0 && ctx.balance >= 0) {
    priorities.push({
      weight: 60,
      title: 'Preservar margem e caixa',
      reason:
        'O período está positivo, mas ainda exige disciplina para não perder o ganho.',
      action:
        'Manter controle de compras, vencimentos e giro de estoque.',
    });
  }

  priorities.sort((a, b) => b.weight - a.weight);

  const main = priorities[0];

  if (!main) {
    return `
🎯 PRIORIDADE EXECUTIVA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Não identifiquei uma prioridade crítica neste momento.

🧠 Minha leitura

A operação parece estável, mas deve manter acompanhamento diário de caixa, compras e contas pendentes.
`.trim();
  }

  const list = priorities
    .slice(0, 5)
    .map(
      (item, index) => `
${index + 1}. ${item.title}

Motivo:
${item.reason}

Ação:
${item.action}
`
    )
    .join('\n━━━━━━━━━━━━━━━━━━\n');

  return `
🎯 PRIORIDADE EXECUTIVA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

🏆 O que eu faria primeiro

${main.title}

━━━━━━━━━━━━━━━━━━

📌 Prioridades identificadas

${list}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

A prioridade executiva é o ponto que mais pode proteger ou melhorar a operação agora.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Comece pela primeira prioridade antes de abrir novas frentes.
`.trim();
};

const buildAutomaticActionPlanAnswer = async (ctx) => {
  const recentEvents =
    await getRecentExecutiveMemoryEvents(8);

  const memory =
    buildIntuitiveMemorySignal(ctx, recentEvents);

  const actions = [];

  if (
    memory.dominantSignal?.type === 'cash_pressure' ||
    ctx.balance < 0
  ) {
    actions.push({
      impact: 100,
      title: 'Preservar caixa imediatamente',
      reason: `O resultado atual está em ${formatCurrency(ctx.balance)}.`,
      action:
        'Evitar novas compras não essenciais e concentrar esforços em entradas rápidas.',
      risk:
        'Se o caixa não for protegido, a recuperação recente pode perder força.',
    });
  }

  if (
    memory.dominantSignal?.type === 'payable_pressure' ||
    ctx.pendingPayable > ctx.totalIncome * 0.5
  ) {
    actions.push({
      impact: 90,
      title: 'Organizar contas pendentes',
      reason: `As contas a pagar somam ${formatCurrency(ctx.pendingPayable)}.`,
      action:
        'Separar vencimentos por urgência: vencidas, hoje, próximos 3 dias e fornecedores estratégicos.',
      risk:
        'Sem priorização, a pressão financeira pode se concentrar em poucos dias.',
    });
  }

  const purchases =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  if (
    memory.dominantSignal?.type === 'purchase_pressure' ||
    purchaseShare > 60
  ) {
    actions.push({
      impact: 80,
      title: 'Reduzir pressão de compras',
      reason: `Compras representam ${purchaseShare.toFixed(1)}% das entradas.`,
      action:
        'Comprar somente itens de giro alto e evitar reposições por impulso.',
      risk:
        'Compras acima do ritmo de venda prendem capital e aumentam a pressão do caixa.',
    });
  }

  const ticket =
    Number(ctx.managementReport?.averageTicket || 0);

  if (
    memory.dominantSignal?.type === 'ticket_attention' ||
    (ticket > 0 && ticket < 20)
  ) {
    actions.push({
      impact: 70,
      title: 'Elevar ticket médio',
      reason: `O ticket médio atual está em ${formatCurrency(ticket)}.`,
      action:
        'Criar combos simples e orientar atendimento para oferecer complementos em cada venda.',
      risk:
        'Sem melhora no ticket, a operação depende mais de fluxo para recuperar caixa.',
    });
  }

  if (
    memory.improvementCount > memory.worseningCount &&
    ctx.balance < 0
  ) {
    actions.push({
      impact: 65,
      title: 'Consolidar a recuperação',
      reason:
        'A memória recente mostra mais sinais de melhora do que piora, mas o caixa ainda está pressionado.',
      action:
        'Manter disciplina por alguns dias antes de acelerar compras ou assumir novos compromissos.',
      risk:
        'A recuperação pode ser interrompida se a operação voltar a aumentar despesas cedo demais.',
    });
  }

  actions.sort((a, b) => b.impact - a.impact);

  const topActions = actions.slice(0, 3);

  const actionsText =
    topActions.length
      ? topActions
          .map(
            (item, index) => `
${index + 1}. ${item.title}

Motivo:
${item.reason}

Ação prática:
${item.action}

Risco se não agir:
${item.risk}
`
          )
          .join('\n━━━━━━━━━━━━━━━━━━\n')
      : 'Não identifiquei ações críticas neste momento.';

  return `
🎯 PLANO DE AÇÃO AUTOMÁTICO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

🧠 Base da Memória Intuitiva

Padrão percebido:
${memory.pattern}

Interpretação:
${memory.interpretation}

━━━━━━━━━━━━━━━━━━

🚀 3 ações práticas por impacto

${actionsText}

━━━━━━━━━━━━━━━━━━

📊 Leitura executiva

Melhoras recentes:
${memory.improvementCount}

Pioras recentes:
${memory.worseningCount}

Sinal dominante:
${memory.dominantSignal?.title || 'Sem sinal dominante'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Execute a primeira ação antes de abrir novas frentes. Depois acompanhe se o saldo, as compras e as contas pendentes começam a responder.
`.trim();
};

const buildExecutivePlanAnswer = (
  currentCtx,
  operationalScore,
  operationalPriorities
) => {
  const purchases = currentCtx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  const purchaseShare =
    purchases && currentCtx.totalIncome > 0
      ? (purchases.amount / currentCtx.totalIncome) * 100
      : 0;

  const averageTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const memoryInsights =
  buildTemporalMemoryInsight(currentCtx);

  const executiveOpinion =
  buildRodrigoExecutiveOpinion(
    currentCtx
  );

  return `
📋 PLANO EXECUTIVO BEBCOM — ${currentCtx.periodLabel}

━━━━━━━━━━━━━━━━━━

🎯 Objetivo estratégico

Organizar a operação para recuperar caixa, reduzir pressão financeira, melhorar giro, proteger margem e evitar que o problema se repita.

━━━━━━━━━━━━━━━━━━

📊 Diagnóstico executivo

Resultado atual
${formatCurrency(currentCtx.balance)}

Contas pendentes
${formatCurrency(currentCtx.pendingPayable)}

Score gerencial
${operationalScore.score}/100 — ${operationalScore.status}

Compras de mercadorias
${
  purchases
    ? `${formatCurrency(purchases.amount)} — ${purchaseShare.toFixed(1)}% das entradas`
    : 'Sem concentração relevante identificada.'
}

Ticket médio
${formatCurrency(averageTicket)}

━━━━━━━━━━━━━━━━━━

📅 Próximos 7 dias — Controle imediato

• Preservar caixa e evitar novas despesas não essenciais.
• Priorizar contas vencidas e fornecedores estratégicos.
• Reduzir compras não críticas até estabilizar o resultado.
• Avaliar se as compras recentes estão virando venda ou apenas aumentando estoque.

━━━━━━━━━━━━━━━━━━

📅 Próximos 30 dias — Ajuste gerencial

• Renegociar fornecedores de maior impacto financeiro.
• Revisar mix parado e produtos com baixo giro.
• Melhorar ticket médio com combos, adicionais e produtos de maior margem.
• Reforçar divulgação para recuperar volume de vendas.
• Separar despesas essenciais das despesas negociáveis.

━━━━━━━━━━━━━━━━━━

📅 Próximos 90 dias — Estruturação

• Criar rotina semanal de análise: caixa, compras, contas a pagar, ticket médio e estoque.
• Ajustar compras ao ritmo real de vendas.
• Construir reserva operacional mínima.
• Usar o score gerencial como indicador fixo de saúde da empresa.
• Consolidar processos para reduzir dependência de decisões emergenciais.

━━━━━━━━━━━━━━━━━━

🚨 Prioridades executivas

${
  operationalPriorities.length
    ? operationalPriorities
        .slice(0, 5)
        .map((item) => `• ${item.message}`)
        .join('\n')
    : '• Manter acompanhamento de caixa, compras, estoque, ticket médio e fornecedores.'
}

━━━━━━━━━━━━━━━━━━

🧠 Memória temporal da Bebcom

${
  memoryInsights.length
    ? memoryInsights
        .map(item => `• ${item}`)
        .join('\n')
    : 'Nenhum padrão histórico relevante identificado.'
}

━━━━━━━━━━━━━━━━━━

🧭 Opinião executiva do Rodrigo

${
  executiveOpinion.length
    ? executiveOpinion
        .map(item => `• ${item}`)
        .join('\n')
    : 'Nenhuma opinião executiva disponível.'
}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Este plano não trata apenas de recuperar caixa.

Ele organiza a operação para que a Bebcom volte a crescer com mais controle, mais margem e menor pressão financeira.
━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Trate os próximos 7 dias como contenção, os próximos 30 dias como ajuste e os próximos 90 dias como construção de uma operação mais previsível.
`.trim();
};

const buildMotivationalInsight = (
  currentCtx,
  previousCtx,
  operationalScore
) => {
  const previousBalance = previousCtx?.balance || 0;
  const currentBalance = currentCtx.balance || 0;

  const balanceImproved =
    previousCtx &&
    currentBalance > previousBalance;

  const incomeImproved =
    previousCtx &&
    currentCtx.totalIncome > previousCtx.totalIncome;

  const expensesReduced =
    previousCtx &&
    currentCtx.totalExpenses < previousCtx.totalExpenses;

  if (operationalScore.score >= 80) {
    return `
💪 Leitura motivacional executiva

A operação demonstra boa saúde gerencial.

Os números indicam que existe base para crescer com responsabilidade, desde que o controle de caixa, compras e despesas continue firme.

O momento é favorável para transformar organização em crescimento.
`.trim();
  }

  if (operationalScore.score >= 60) {
    return `
💪 Leitura motivacional executiva

A operação exige atenção, mas não está sem direção.

Os dados já mostram onde agir: caixa, compras, contas pendentes e margem.

Com acompanhamento diário e decisões firmes, é possível estabilizar o resultado e melhorar o score operacional.
`.trim();
  }

  if (balanceImproved || incomeImproved || expensesReduced) {
    return `
💪 Leitura motivacional executiva

O cenário ainda exige firmeza, mas existe sinal de reação nos números.

Isso é importante: quando algum indicador começa a melhorar, a gestão deixa de agir no escuro e passa a ter um caminho real de recuperação.

O foco agora é proteger essa melhora e evitar novas pressões desnecessárias.
`.trim();
  }

  return `
💪 Leitura motivacional executiva

O momento pede controle, não desespero.

A IA já identificou os principais pontos de pressão: caixa, compras, contas pendentes e despesas.

Isso significa que o problema está mapeado. Agora o caminho é agir com método, preservar caixa e acompanhar os números diariamente.
`.trim();
};

const buildCEOQuestions = (
  currentCtx,
  operationalScore,
  operationalAlerts,
  operationalPriorities
) => {
  const questions = [];

  if (currentCtx.balance < 0) {
    questions.push('Como recuperar o caixa?');
    questions.push('Quanto preciso vender para sair do negativo?');
  }

  if (currentCtx.pendingPayable > 0) {
    questions.push('Quem devo pagar primeiro?');
    questions.push('Quanto vence nos próximos 7 dias?');
  }

  const purchases = currentCtx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (purchases && currentCtx.totalIncome > 0) {
    const purchaseShare =
      (purchases.amount / currentCtx.totalIncome) * 100;

    if (purchaseShare > 60) {
      questions.push('Como reduzir compras sem prejudicar a loja?');
      questions.push('Quais fornecedores mais pressionam o caixa?');
    }
  }

  const averageTicket =
    currentCtx.managementReport?.averageTicket || 0;

  if (averageTicket === 0) {
    questions.push('Como lançar o ticket médio corretamente?');
  } else {
    questions.push('Como melhorar o ticket médio?');
  }

  if (operationalScore.score < 60) {
    questions.push('O que você faria no meu lugar?');
    questions.push('Monte um plano para mim');
  }

  if (operationalAlerts.length > 0) {
    questions.push('Mostre meus alertas');
  }

  if (operationalPriorities.length > 0) {
    questions.push('Quais pontos merecem atenção?');
  }

  const uniqueQuestions = [...new Set(questions)];

  return `
🎯 O que eu investigaria agora

${uniqueQuestions
  .slice(0, 7)
  .map((item) => `• ${item}`)
  .join('\n')}
`.trim();
};

const buildDeepDiveQuestions = (ctx) => {
  const questions = [];

  if (ctx.balance < 0) {
    questions.push(
      'O resultado negativo está vindo de queda nas vendas ou aumento das despesas?'
    );
  }

  const purchases = ctx.expenseCategories?.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (
    purchases &&
    ctx.totalIncome > 0 &&
    purchases.amount / ctx.totalIncome > 0.6
  ) {
    questions.push(
      'Essas compras já estão se transformando em vendas ou estão aumentando o estoque?'
    );

    questions.push(
      'Existe algum fornecedor que pode ser renegociado neste momento?'
    );
  }

  if (ctx.pendingPayable > 0) {
    questions.push(
      'Todos os vencimentos precisam realmente ser pagos agora ou parte deles pode ser negociada?'
    );
  }

  const ticket =
    ctx.managementReport?.averageTicket || 0;

  if (ticket > 0) {
    questions.push(
      'A loja está vendendo mais clientes ou vendendo melhor para os mesmos clientes?'
    );
  }

  return questions;
};

const buildDeepDiveAnswer = (
  question,
  currentCtx,
  previousCtx
) => {
  const lower = question.toLowerCase();

  const purchases =
    currentCtx.expenseCategories?.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  // Pergunta 1
  if (
    lower.includes('compras') &&
    (
      lower.includes('transformando em vendas') ||
      lower.includes('aumentando o estoque')
    )
  ) {
   const inventory =
  getInventoryEstimatedPosition(currentCtx);

    const purchaseValue =
      purchases?.amount || 0;

    return `
📦 ANÁLISE DE COMPRAS X ESTOQUE

━━━━━━━━━━━━━━━━━━

Compras registradas
${formatCurrency(purchaseValue)}

Estoque financeiro estimado
${formatCurrency(inventory)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Compras elevadas só geram resultado quando se transformam em giro.

Quando o estoque cresce mais rápido que as vendas, o caixa fica pressionado.

Pela experiência histórica da Bebcom, variedade é uma força competitiva, mas precisa estar acompanhada de giro.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Revise os itens de menor saída e priorize reposição dos produtos de maior giro antes de ampliar estoque.
`.trim();
  }

  // Pergunta 2
  if (
    lower.includes('queda nas vendas') ||
    lower.includes('aumento das despesas')
  ) {
    if (!previousCtx) {
      return `
📊 DIAGNÓSTICO DE CAUSA RAIZ

━━━━━━━━━━━━━━━━━━

Ainda não existe período anterior suficiente para comparação.

👉 Minha recomendação

Alimente pelo menos dois períodos para que eu possa identificar se a pressão está vindo das vendas ou das despesas.
`.trim();
    }

    const revenueVariation = calculateVariation(
      currentCtx.totalIncome,
      previousCtx.totalIncome
    );

    const expenseVariation = calculateVariation(
      currentCtx.totalExpenses,
      previousCtx.totalExpenses
    );

    let diagnosis = '';

    if (revenueVariation < 0 && expenseVariation > 0) {
      diagnosis =
        'O resultado negativo está sendo causado por uma combinação de queda nas vendas e aumento das despesas.';
    } else if (revenueVariation < 0) {
      diagnosis =
        'O principal fator identificado é a redução das vendas.';
    } else if (expenseVariation > 0) {
      diagnosis =
        'O principal fator identificado é o aumento das despesas.';
    } else {
      diagnosis =
        'Os números não apontam uma causa dominante. O resultado parece estar relacionado ao equilíbrio geral da operação.';
    }

    return `
📊 DIAGNÓSTICO DE CAUSA RAIZ — COMPARAÇÃO EQUIVALENTE

Período atual
${currentCtx.periodLabel}

Período comparado
${previousCtx.periodLabel || 'Período anterior equivalente'}

━━━━━━━━━━━━━━━━━━

📈 Variação das entradas

${revenueVariation.toFixed(1)}%

📉 Variação das despesas

${expenseVariation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${diagnosis}

━━━━━━━━━━━━━━━━━━

💡 Leitura institucional

A Bebcom historicamente reage melhor quando identifica rapidamente a origem do problema antes de tomar decisões de corte ou expansão.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Corrija primeiro a causa principal identificada antes de atacar sintomas secundários.
`.trim();
  }

  // Pergunta 2.5
if (
  lower.includes('fornecedor') &&
  lower.includes('renegoci')
) {

  const supplierMap = {};

  currentCtx.entries
    .filter(
      (entry) =>
        entry.type === 'expense' &&
        entry.category === 'compras_mercadorias'
    )
    .forEach((entry) => {

      const supplier =
        entry.person ||
        entry.description ||
        'Fornecedor não informado';

      if (!supplierMap[supplier]) {
        supplierMap[supplier] = 0;
      }

      supplierMap[supplier] +=
        Math.abs(Number(entry.amount || 0));
    });

  const ranking =
    Object.entries(supplierMap)
      .map(([name, amount]) => ({
        name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

  if (!ranking.length) {
    return `
Não encontrei fornecedores suficientes para análise.
`.trim();
  }

  const leader = ranking[0];

  const totalPurchases =
    ranking.reduce(
      (acc, item) => acc + item.amount,
      0
    );

  const share =
    totalPurchases > 0
      ? (
          (leader.amount /
            totalPurchases) *
          100
        ).toFixed(1)
      : '0.0';

  return `
🏦 FORNECEDOR PRIORITÁRIO

━━━━━━━━━━━━━━━━━━

Fornecedor

${leader.name}

━━━━━━━━━━━━━━━━━━

💰 Valor comprado

${formatCurrency(
  leader.amount
)}

📊 Participação

${share}% das compras

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Se eu pudesse negociar apenas um fornecedor hoje, começaria por este.

Ele representa a maior concentração financeira dentro das compras registradas no período.

Pequenas melhorias de prazo, desconto ou condição comercial podem gerar impacto relevante no caixa.

━━━━━━━━━━━━━━━━━━

💡 Leitura institucional

A Bebcom cresceu buscando novos fornecedores e melhores condições comerciais.

Historicamente, negociações bem conduzidas produziram mais resultado do que cortes operacionais extremos.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Revise prazo, desconto, bonificações e frequência de compra antes de reduzir mix ou estoque.
`.trim();
}

  // Pergunta 3
if (
  (
    lower.includes('vencimentos') ||
    lower.includes('precisam realmente ser pagos') ||
    lower.includes('parte deles pode ser negociada') ||
    lower.includes('pode ser negociada')
  ) &&
  !extractSupplierPayableName(question) &&
  !lower.includes('proximos 3 dias') &&
  !lower.includes('próximos 3 dias') &&
  !lower.includes('proximos 5 dias') &&
  !lower.includes('próximos 5 dias') &&
  !lower.includes('proximos 7 dias') &&
  !lower.includes('próximos 7 dias')
) {
  const today = new Date();

  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  const payables = (currentCtx.accounts || []).filter(
    (account) =>
      account.type === 'payable' &&
      ['pending', 'overdue'].includes(account.status)
  );

  const overdue = payables.filter(
    (account) => new Date(account.dueDate) < today
  );

  const nextDue = payables.filter((account) => {
    const dueDate = new Date(account.dueDate);

    return dueDate >= today && dueDate <= next7Days;
  });

  const future = payables.filter(
    (account) => new Date(account.dueDate) > next7Days
  );

  const sumAccounts = (items) =>
    items.reduce(
      (acc, item) => acc + Math.abs(Number(item.amount || 0)),
      0
    );

  const totalOpen = sumAccounts(payables);
  const totalOverdue = sumAccounts(overdue);
  const totalNextDue = sumAccounts(nextDue);
  const totalFuture = sumAccounts(future);

  return `
📅 ANÁLISE DE VENCIMENTOS

━━━━━━━━━━━━━━━━━━

💰 Total em aberto
${formatCurrency(totalOpen)}

🔴 Vencidos
${formatCurrency(totalOverdue)}

🟡 Próximos 7 dias
${formatCurrency(totalNextDue)}

🔵 Após 7 dias
${formatCurrency(totalFuture)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Nem todos os vencimentos possuem a mesma prioridade.

Com o caixa pressionado, eu separaria o que é crítico do que pode ser negociado.

Prioridade maior deve ir para contas vencidas, fornecedores estratégicos e compromissos que possam gerar juros, bloqueios ou ruptura de abastecimento.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Não trate todas as contas da mesma forma. Priorize vencidos e fornecedores essenciais, negocie prazos onde houver menor risco operacional e preserve caixa para manter a loja funcionando.
`.trim();
}

// Pergunta 4
if (
  lower.includes('vendendo mais clientes') ||
  lower.includes('vendendo melhor') ||
  lower.includes('mesmos clientes')
) {
  const currentTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const previousTicket =
    previousCtx?.managementReport?.averageTicket || 0;

 const currentSales =
  currentCtx.managementReport?.totalTickets || 0;

const previousSales =
  previousCtx?.managementReport?.totalTickets || 0;

  const ticketVariation =
    previousTicket > 0
      ? calculateVariation(
          currentTicket,
          previousTicket
        )
      : 0;

  const salesVariation =
    previousSales > 0
      ? calculateVariation(
          currentSales,
          previousSales
        )
      : 0;

 let diagnosis = '';

if (
  salesVariation < 0 &&
  ticketVariation < 0
) {
  if (
    Math.abs(salesVariation) >
    Math.abs(ticketVariation)
  ) {
    diagnosis =
      'O principal problema está na redução do volume de vendas.';
  } else {
    diagnosis =
      'O principal problema está na redução do ticket médio.';
  }
}
else if (
  salesVariation > 0 &&
  ticketVariation > 0
) {
  if (
    salesVariation >
    ticketVariation
  ) {
    diagnosis =
      'O crescimento está sendo impulsionado principalmente pelo aumento do número de vendas.';
  } else {
    diagnosis =
      'O crescimento está sendo impulsionado principalmente pelo aumento do ticket médio.';
  }
}
else if (
  salesVariation > 0
) {
  diagnosis =
    'A operação está atraindo mais clientes, mesmo sem aumento relevante do ticket médio.';
}
else if (
  ticketVariation > 0
) {
  diagnosis =
    'Os clientes estão comprando mais por venda realizada.';
}
else {
  diagnosis =
    'Os indicadores apresentam comportamento misto e exigem análise complementar.';
}
  return `
👥 CLIENTES OU TICKET

━━━━━━━━━━━━━━━━━━

🎯 Ticket médio atual

${formatCurrency(currentTicket)}

📦 Quantidade de vendas

${
  currentSales > 0
    ? currentSales
    : 'Não disponível'
}

━━━━━━━━━━━━━━━━━━

📈 Evolução do ticket

${ticketVariation.toFixed(1)}%

📈 Evolução das vendas

${salesVariation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${diagnosis}

━━━━━━━━━━━━━━━━━━

💡 Leitura institucional

Historicamente a Bebcom cresceu combinando variedade, atendimento e adaptação rápida às necessidades dos clientes.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa leitura para decidir a ação correta: se o problema for queda de vendas, foque em fluxo, divulgação e recorrência; se for queda de ticket médio, foque em combos, adicionais e produtos de maior margem.
`.trim();
}   
  
  return null;
};

const buildCEOAnswer = (
  currentCtx,
  previousCtx,
  operationalScore,
  operationalAlerts,
  operationalPriorities
) => {
  const averageTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const inventoryPosition =
  getInventoryEstimatedPosition(currentCtx);

const inventoryBalance =
  getInventoryStockBalance(currentCtx);

  const motivationalInsight = buildMotivationalInsight(
    currentCtx,
    previousCtx,
    operationalScore
  );

  const institutionalInsights =
  buildInstitutionalInsight(currentCtx);

  const ceoQuestions = buildCEOQuestions(
    currentCtx,
    operationalScore,
    operationalAlerts,
    operationalPriorities
  );

  const executiveDecisions =
    buildExecutiveDecision(currentCtx);

  const topExpenses = currentCtx.expenseCategories
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. ${item.category}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

  const supplierMap = {};

  (currentCtx.accounts || [])
    .filter(
      (account) =>
        account.type === 'payable' &&
        ['pending', 'overdue'].includes(account.status)
    )
    .forEach((account) => {
      const name =
        account.person ||
        account.description ||
        'Fornecedor não informado';

      if (!supplierMap[name]) {
        supplierMap[name] = 0;
      }

      supplierMap[name] += Math.abs(Number(account.amount || 0));
    });

  const supplierRanking = Object.entries(supplierMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

  return `
👔 MODO CEO — BEBCOM

━━━━━━━━━━━━━━━━━━

🏅 Score gerencial

${operationalScore.score}/100 — ${operationalScore.status}

━━━━━━━━━━━━━━━━━━

📊 Resumo financeiro

Entradas
${formatCurrency(currentCtx.totalIncome)}

Saídas
${formatCurrency(currentCtx.totalExpenses)}

Resultado
${formatCurrency(currentCtx.balance)}

━━━━━━━━━━━━━━━━━━

💰 Contas pendentes

A pagar
${formatCurrency(currentCtx.pendingPayable)}

A receber
${formatCurrency(currentCtx.pendingReceivable)}

━━━━━━━━━━━━━━━━━━

🚨 Alertas principais

${
  operationalAlerts.length
    ? operationalAlerts
        .slice(0, 5)
        .map((alert) => `• ${alert.message}`)
        .join('\n')
    : 'Nenhum alerta crítico identificado.'
}

━━━━━━━━━━━━━━━━━━

🏆 Maiores grupos de saída

${topExpenses || 'Nenhuma despesa relevante identificada.'}

━━━━━━━━━━━━━━━━━━

🏦 Fornecedores com maior pressão

${supplierRanking || 'Nenhum fornecedor em aberto identificado.'}

━━━━━━━━━━━━━━━━━━

🎯 Ticket médio

${formatCurrency(averageTicket)}

━━━━━━━━━━━━━━━━━━

📦 Estoque financeiro estimado

Saldo Estoque:
${formatCurrency(inventoryBalance)}

Posição estimada:
${formatCurrency(inventoryPosition)}

━━━━━━━━━━━━━━━━━━

🧠 Decisão executiva

${
  executiveDecisions.length
    ? executiveDecisions.map((item) => `• ${item}`).join('\n')
    : 'Manter acompanhamento do caixa, compras, contas pendentes e margem.'
}

━━━━━━━━━━━━━━━━━━

🚨 Prioridades executivas

${
  operationalPriorities.length
    ? operationalPriorities
        .slice(0, 5)
        .map((item) => `• ${item.message}`)
        .join('\n')
    : 'Nenhuma prioridade crítica identificada.'
}

━━━━━━━━━━━━━━━━━━

${motivationalInsight}

━━━━━━━━━━━━━━━━━━

🧠 Leitura institucional da Bebcom

${
  institutionalInsights.length
    ? institutionalInsights.map((item) => `• ${item}`).join('\n')
    : 'Nenhuma leitura institucional adicional identificada.'
}

━━━━━━━━━━━━━━━━━━

${ceoQuestions}

${buildConsultiveClosing({
  situation:
    'A visão executiva mostra pressão em caixa, compras, contas pendentes e fornecedores estratégicos.',

  recommendation:
    'Priorize geração de caixa, giro de estoque, controle de compras e negociação dos maiores fornecedores antes de assumir novos compromissos.'
})}
`.trim();
};

const buildHistoricalTrendAnswer = async () => {
  const reports = await ManagementReport.find({})
    .sort({ year: 1, month: 1 });

  const validReports = (reports || []).filter(
    (report) =>
      report.year &&
      report.month &&
      getManagementReportValue(report) > 0
  );

  if (!validReports.length) {
    return `
📖 NARRATIVA EVOLUTIVA DA BEBCOM

Ainda não encontrei dados suficientes no Relatório Gerencial para contar a evolução histórica da empresa.
`.trim();
  }

  const yearly = {};

  validReports.forEach((report) => {
    const year = Number(report.year);
    const revenue = getManagementReportValue(report);
    const tickets = Number(report.totalTickets || 0);

    if (!yearly[year]) {
      yearly[year] = {
        year,
        revenue: 0,
        tickets: 0,
        months: 0,
      };
    }

    yearly[year].revenue += revenue;
    yearly[year].tickets += tickets;
    yearly[year].months += 1;
  });

  const years = Object.values(yearly).sort(
    (a, b) => a.year - b.year
  );

  const bestYear = [...years].sort(
    (a, b) => b.revenue - a.revenue
  )[0];

  const latestYear = years[years.length - 1];

  const yearlyLines = years
    .map((item) => {
      const ticket =
        item.tickets > 0
          ? item.revenue / item.tickets
          : 0;

      return `${item.year}: ${formatCurrency(item.revenue)} — ${item.tickets} comandas — ticket médio ${formatCurrency(ticket)} — ${item.months} meses considerados`;
    })
    .join('\n');

  return `
📖 NARRATIVA EVOLUTIVA DA BEBCOM

━━━━━━━━━━━━━━━━━━

📊 Evolução anual pelo Relatório Gerencial

${yearlyLines}

━━━━━━━━━━━━━━━━━━

🏆 Ano de maior faturamento

${bestYear.year}
${formatCurrency(bestYear.revenue)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

A Bebcom nasceu em 2021 em fase de construção, reinvestimento e formação de estrutura.

A empresa ganhou força com variedade, atendimento, adaptação ao cliente e presença local.

O melhor ciclo histórico aparece em ${bestYear.year}, quando a operação atingiu o maior volume anual registrado.

Depois desse pico, a leitura precisa separar faturamento, comandas e ticket médio.

Se o ticket médio se mantém forte, mas as comandas caem, o desafio principal não é apenas vender mais caro: é recuperar fluxo de clientes.

━━━━━━━━━━━━━━━━━━

📍 Fase atual

Em ${latestYear.year}, a Bebcom parece viver uma fase de ajuste e leitura estratégica.

O foco não deve ser apenas buscar recorde de faturamento, mas recuperar movimento, proteger margem, controlar compras e transformar vendas em caixa saudável.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use a história da Bebcom como guia:

1. preservar a identidade da loja;
2. recuperar fluxo de clientes;
3. manter ticket médio forte;
4. controlar estoque e compras;
5. acompanhar caixa diariamente.

A Bebcom já provou que tem capacidade de crescimento. O desafio agora é crescer com controle.
`.trim();
};

const buildRootCauseAnswer = (
  currentCtx,
  previousCtx
) => {
  if (!previousCtx) {
    return `
🔍 DIAGNÓSTICO INTELIGENTE DE CAUSA

Ainda não existe período anterior suficiente para comparar a causa da mudança.
`.trim();
  }

  const revenueVariation = calculateVariation(
    currentCtx.totalIncome,
    previousCtx.totalIncome
  );

  const expenseVariation = calculateVariation(
    currentCtx.totalExpenses,
    previousCtx.totalExpenses
  );

  const currentTicket =
    Number(currentCtx.managementReport?.averageTicket || 0);

  const previousTicket =
    Number(previousCtx.managementReport?.averageTicket || 0);

  const ticketVariation = calculateVariation(
    currentTicket,
    previousTicket
  );

  const currentTickets =
    Number(currentCtx.managementReport?.totalTickets || 0);

  const previousTickets =
    Number(previousCtx.managementReport?.totalTickets || 0);

  const ticketsVariation = calculateVariation(
    currentTickets,
    previousTickets
  );

  const purchases =
    currentCtx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && currentCtx.totalIncome > 0
      ? (purchases.amount / currentCtx.totalIncome) * 100
      : 0;

  const payablePressure =
    currentCtx.totalIncome > 0
      ? (currentCtx.pendingPayable / currentCtx.totalIncome) * 100
      : 0;

  const causes = [];

  if (ticketsVariation !== null && ticketsVariation < 0) {
    causes.push({
      score: 30,
      title: 'Queda no fluxo de clientes',
      detail: `As comandas caíram ${Math.abs(ticketsVariation).toFixed(1)}%.`,
    });
  }

  if (revenueVariation !== null && revenueVariation < 0) {
    causes.push({
      score: 25,
      title: 'Redução de faturamento',
      detail: `As entradas caíram ${Math.abs(revenueVariation).toFixed(1)}%.`,
    });
  }

  if (expenseVariation !== null && expenseVariation > 0) {
    causes.push({
      score: 20,
      title: 'Aumento das despesas',
      detail: `As despesas cresceram ${expenseVariation.toFixed(1)}%.`,
    });
  }

  if (purchaseShare > 70) {
    causes.push({
      score: 18,
      title: 'Compras pressionando o caixa',
      detail: `Compras de mercadorias representam ${purchaseShare.toFixed(1)}% das entradas.`,
    });
  }

  if (payablePressure > 80) {
    causes.push({
      score: 15,
      title: 'Contas pendentes elevadas',
      detail: `Contas a pagar representam ${payablePressure.toFixed(1)}% das entradas do período.`,
    });
  }

  if (ticketVariation !== null && ticketVariation > 0) {
    causes.push({
      score: 5,
      title: 'Ticket médio melhorou, mas não compensou',
      detail: `O ticket médio subiu ${ticketVariation.toFixed(1)}%, mas isso não foi suficiente para neutralizar a pressão principal.`,
    });
  }

  causes.sort((a, b) => b.score - a.score);

  const mainCause = causes[0];

  const secondaryCauses = causes
    .slice(1, 4)
    .map((item, index) => `${index + 1}. ${item.title} — ${item.detail}`)
    .join('\n');

  return `
🔍 DIAGNÓSTICO INTELIGENTE DE CAUSA — ${currentCtx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 Comparação usada
${currentCtx.periodLabel}
vs
${previousCtx.periodLabel}

━━━━━━━━━━━━━━━━━━

📈 Entradas
${revenueVariation !== null ? `${revenueVariation.toFixed(1)}%` : 'sem base anterior'}

💸 Despesas
${expenseVariation !== null ? `${expenseVariation.toFixed(1)}%` : 'sem base anterior'}

🧾 Comandas
${ticketsVariation !== null ? `${ticketsVariation.toFixed(1)}%` : 'sem base anterior'}

🎯 Ticket médio
${ticketVariation !== null ? `${ticketVariation.toFixed(1)}%` : 'sem base anterior'}

━━━━━━━━━━━━━━━━━━

🏆 Principal causa identificada

${mainCause ? mainCause.title : 'Não identifiquei uma causa dominante.'}

${mainCause ? mainCause.detail : 'Os indicadores não apontam um fator isolado com força suficiente.'}

━━━━━━━━━━━━━━━━━━

⚠️ Causas secundárias

${secondaryCauses || 'Nenhuma causa secundária relevante identificada.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  ticketsVariation !== null &&
  ticketsVariation < 0 &&
  ticketVariation !== null &&
  ticketVariation > 0
    ? 'A Bebcom não está sofrendo principalmente por ticket médio. O cliente que compra está gastando bem, mas o volume de comandas caiu. O problema central parece estar no fluxo de clientes.'
    : 'A deterioração parece vir da combinação entre vendas, despesas, compras e pressão financeira. A análise deve focar no fator com maior impacto operacional.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Ataque primeiro a causa principal antes de tentar corrigir sintomas menores.

Se a causa for fluxo, foque em movimento, recorrência, divulgação e combos de entrada.

Se a causa for compras, preserve caixa, revise estoque e compre apenas itens de maior giro.
`.trim();
};

const buildTrendForecastAnswer = (
  ctx,
  previousCtx
) => {
  const now = new Date();

  const currentDay = now.getDate();

  const totalDaysInMonth =
    new Date(
      ctx.year,
      ctx.month,
      0
    ).getDate();

  const incomeDailyAverage =
    currentDay > 0
      ? ctx.totalIncome / currentDay
      : 0;

  const expenseDailyAverage =
    currentDay > 0
      ? ctx.totalExpenses / currentDay
      : 0;

  const projectedIncome =
    incomeDailyAverage * totalDaysInMonth;

  const projectedExpenses =
    expenseDailyAverage * totalDaysInMonth;

  const projectedBalance =
    projectedIncome - projectedExpenses;

  const incomeVariation =
    previousCtx && previousCtx.totalIncome > 0
      ? calculateVariation(
          projectedIncome,
          previousCtx.totalIncome
        )
      : null;

  const expenseVariation =
    previousCtx && previousCtx.totalExpenses > 0
      ? calculateVariation(
          projectedExpenses,
          previousCtx.totalExpenses
        )
      : null;

  let trend = 'estabilidade';

  if (projectedBalance < 0) {
    trend = 'pressão de caixa';
  }

  if (
    incomeVariation !== null &&
    incomeVariation < -10
  ) {
    trend = 'queda de faturamento';
  }

  if (
    projectedBalance < 0 &&
    projectedExpenses > projectedIncome
  ) {
    trend = 'deterioração operacional';
  }

  return `
📈 PREVISÃO DE TENDÊNCIA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 Ritmo atual

Faturamento acumulado:
${formatCurrency(ctx.totalIncome)}

Despesas acumuladas:
${formatCurrency(ctx.totalExpenses)}

Resultado atual:
${formatCurrency(ctx.balance)}

Dias decorridos:
${currentDay}

━━━━━━━━━━━━━━━━━━

📌 Médias diárias

Receita média por dia:
${formatCurrency(incomeDailyAverage)}

Despesa média por dia:
${formatCurrency(expenseDailyAverage)}

━━━━━━━━━━━━━━━━━━

🎯 Projeção de fechamento

Receita projetada:
${formatCurrency(projectedIncome)}

Despesas projetadas:
${formatCurrency(projectedExpenses)}

Resultado projetado:
${formatCurrency(projectedBalance)}

━━━━━━━━━━━━━━━━━━

📅 Comparação com ${previousCtx?.periodLabel || 'período anterior'}

Receita anterior:
${formatCurrency(previousCtx?.totalIncome || 0)}

Despesas anteriores:
${formatCurrency(previousCtx?.totalExpenses || 0)}

Variação projetada de receita:
${incomeVariation !== null ? `${incomeVariation.toFixed(1)}%` : 'sem base suficiente'}

Variação projetada de despesas:
${expenseVariation !== null ? `${expenseVariation.toFixed(1)}%` : 'sem base suficiente'}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Mantido o ritmo atual, a tendência principal é de ${trend}.

${
  projectedBalance < 0
    ? 'A projeção indica que, se nada mudar, o mês pode fechar com resultado negativo. Isso exige atenção a compras, vencimentos e geração rápida de caixa.'
    : 'A projeção indica possibilidade de fechamento positivo, desde que o ritmo atual seja mantido e as despesas não acelerem.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa projeção como alerta de gestão, não como número definitivo.

Acompanhe diariamente se a média de vendas está subindo e se as despesas estão ficando abaixo do ritmo projetado.
`.trim();
};

const buildOperationalRiskRadarAnswer = (ctx) => {
  const risks = [];

  const purchases =
    ctx.expenseCategories?.find(
      item =>
        item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (
          purchases.amount /
          ctx.totalIncome
        ) * 100
      : 0;

  // CAIXA NEGATIVO

  if (ctx.balance < 0) {
    risks.push({
      level: '🔴 Alto',
      title: 'Caixa negativo',
      impact: 'Alto',
      description:
        'As saídas superam as entradas no período.'
    });
  }

  // CONTAS PENDENTES

 if (
  ctx.pendingPayable >
  ctx.totalIncome * 0.5
) {
    risks.push({
      level: '🟠 Médio',
      title: 'Contas pendentes elevadas',
      impact: 'Médio',
      description:
        'As contas a pagar representam parcela relevante das entradas.'
    });
  }

  // COMPRAS

  if (purchaseShare > 60) {
    risks.push({
      level: '🟠 Médio',
      title: 'Compras pressionando caixa',
      impact: 'Médio',
      description:
        `Compras representam ${purchaseShare.toFixed(1)}% das entradas.`
    });
  }

  // TICKET

  if (
    ctx.managementReport?.averageTicket >= 20
  ) {
    risks.push({
      level: '🟢 Positivo',
      title: 'Ticket médio saudável',
      impact: 'Positivo',
      description:
        'O cliente continua comprando bem.'
    });
  }

  const list = risks
    .map(
      risk => `
${risk.level}
${risk.title}

Impacto:
${risk.impact}

${risk.description}
`
    )
    .join('\n━━━━━━━━━━━━━━━━━━\n');

  return `
🚨 RADAR DE RISCO OPERACIONAL

━━━━━━━━━━━━━━━━━━

${list}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Priorize primeiro os riscos vermelhos, depois os laranjas.

Os indicadores verdes representam forças atuais da operação.
`.trim();
};

const calculateRiskScore = (ctx) => {
  let score = 0;

  const purchases =
    ctx.expenseCategories?.find(
      (item) => item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (purchases.amount / ctx.totalIncome) * 100
      : 0;

  const payableShare =
    ctx.totalIncome > 0
      ? (ctx.pendingPayable / ctx.totalIncome) * 100
      : 0;

  const ticket =
    Number(ctx.managementReport?.averageTicket || 0);

  if (ctx.balance < 0) {
    score += 40;
  }

  if (payableShare > 100) {
    score += 25;
  } else if (payableShare > 70) {
    score += 20;
  } else if (payableShare > 40) {
    score += 15;
  } else if (payableShare > 20) {
    score += 10;
  }

  if (purchaseShare > 80) {
    score += 20;
  } else if (purchaseShare > 70) {
    score += 15;
  } else if (purchaseShare > 60) {
    score += 10;
  }

  if (ticket >= 20 && score > 0) {
    score -= 5;
  }

  return Math.max(0, Math.min(score, 100));
};
const buildRiskScoreAnswer = (ctx) => {
  const score = calculateRiskScore(ctx);

  let level = '🟢 Baixo';

  if (score >= 30) {
    level = '🟡 Moderado';
  }

  if (score >= 60) {
    level = '🟠 Alto';
  }

  if (score >= 80) {
    level = '🔴 Crítico';
  }

  return `
📊 SCORE DE RISCO OPERACIONAL

━━━━━━━━━━━━━━━━━━

Pontuação:
${score}/100

Classificação:
${level}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Quanto maior a pontuação, maior a probabilidade de a operação sofrer pressão financeira ou operacional.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa pontuação como termômetro executivo diário.
`.trim();
};

const buildExecutiveTrafficLightAnswer = (ctx) => {
  const score = calculateRiskScore(ctx);

 let status = '🟢 Verde';
let classification = 'Operação saudável';

if (score >= 80) {
  status = '🔴 Vermelho';
  classification = 'Risco crítico';
} else if (score >= 60) {
  status = '🟠 Laranja';
  classification = 'Risco alto';
} else if (score >= 30) {
  status = '🟡 Amarelo';
  classification = 'Atenção';
}

  const risks = [];

  if (ctx.balance < 0) {
    risks.push('Caixa negativo');
  }

  if (
    ctx.pendingPayable >
    ctx.totalIncome * 0.5
  ) {
    risks.push('Contas pendentes elevadas');
  }

  const purchases =
    ctx.expenseCategories?.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  const purchaseShare =
    purchases && ctx.totalIncome > 0
      ? (
          purchases.amount /
          ctx.totalIncome
        ) * 100
      : 0;

  if (purchaseShare > 70) {
    risks.push('Compras pressionando caixa');
  }

  return `
🚦 SEMÁFORO EXECUTIVO

━━━━━━━━━━━━━━━━━━

📊 Score de risco

${score}/100

━━━━━━━━━━━━━━━━━━

${status}

${classification}

━━━━━━━━━━━━━━━━━━

📌 Principais fatores

${
  risks.length
    ? risks.map(item => `• ${item}`).join('\n')
    : '• Nenhum risco relevante identificado'
}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  score >= 80
    ? 'A operação exige atenção imediata.'
    : score >= 30
      ? 'A operação merece monitoramento próximo.'
      : 'A operação apresenta estabilidade.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${
  score >= 80
    ? 'Priorize preservação de caixa e redução dos riscos identificados.'
    : score >= 30
      ? 'Monitore os indicadores diariamente.'
      : 'Mantenha a disciplina operacional atual.'
}
`.trim();
};

const buildInventoryAnswer = (ctx) => {
  const initialStock =
    getInventoryInitialStock(ctx);

  const inventoryBalance =
    getInventoryStockBalance(ctx);

  const inventoryPosition =
    getInventoryEstimatedPosition(ctx);

  const growthAmount =
    getInventoryGrowthAmount(ctx);

  const purchases =
    Number(ctx.inventory?.purchases || 0);

  const referenceDifference =
    inventoryBalance - INVENTORY_REFERENCE_VALUE;

  return `
📦 ANÁLISE DO ESTOQUE FINANCEIRO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Estoque inicial:
${formatCurrency(initialStock)}

Compras:
${formatCurrency(ctx.inventory?.purchases || 0)}

Saldo Estoque:
${formatCurrency(inventoryBalance)}

Posição estimada do estoque:
${formatCurrency(inventoryPosition)}

━━━━━━━━━━━━━━━━━━

📊 Variação do estoque

${
  growthAmount >= 0
    ? `O estoque cresceu ${formatCurrency(growthAmount)} em relação ao início do mês.`
    : `O estoque reduziu ${formatCurrency(Math.abs(growthAmount))} em relação ao início do mês.`
}

━━━━━━━━━━━━━━━━━━

📌 Referência gerencial

Referência mensal:
${formatCurrency(INVENTORY_REFERENCE_VALUE)}

Diferença do Saldo Estoque:
${formatCurrency(referenceDifference)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

O Saldo Estoque é o indicador principal para acompanhar o giro do mês.

A posição estimada mostra se o estoque cresceu ou diminuiu em relação ao estoque inicial.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use o Saldo Estoque para avaliar o giro e a posição estimada para entender se o estoque está aumentando ou reduzindo ao longo do mês.
`.trim();
};

const buildInventoryIntentAnswer = (question, ctx) => {
  const lower = normalizeText(question);

  const initialStock =
    getInventoryInitialStock(ctx);

  const stockBalance =
    getInventoryStockBalance(ctx);

  const inventoryPosition =
    getInventoryEstimatedPosition(ctx);

  const growthAmount =
    getInventoryGrowthAmount(ctx);

  const purchases =
    Number(ctx.inventory?.purchases || 0);

  const netRevenue =
    Number(ctx.totalIncome || 0);

  const purchaseShare =
    netRevenue > 0
      ? (purchases / netRevenue) * 100
      : 0;

  const referenceDifference =
    inventoryPosition - INVENTORY_REFERENCE_VALUE;

  const stockGrowthPercent =
    initialStock > 0
      ? (growthAmount / initialStock) * 100
      : 0;

  const asksExcessStock =
    lower.includes('excesso de estoque') ||
    lower.includes('estoque em excesso') ||
    lower.includes('estoque alto') ||
    lower.includes('estoque elevado');

  const asksBuyingMoreThanSelling =
    lower.includes('comprando mais do que vendo') ||
    lower.includes('compro mais do que vendo') ||
    lower.includes('compras estao virando vendas') ||
    lower.includes('compras estão virando vendas') ||
    lower.includes('compras virando vendas');

  const asksStockCashPressure =
    lower.includes('estoque consumindo meu caixa') ||
    lower.includes('estoque esta consumindo meu caixa') ||
    lower.includes('estoque está consumindo meu caixa') ||
    lower.includes('estoque pressionando o caixa') ||
    lower.includes('estoque esta pressionando o caixa') ||
    lower.includes('estoque está pressionando o caixa');

  const asksStockGrowth =
    lower.includes('estoque crescendo') ||
    lower.includes('estoque esta crescendo') ||
    lower.includes('estoque está crescendo') ||
    lower.includes('estoque diminuindo') ||
    lower.includes('estoque esta diminuindo') ||
    lower.includes('estoque está diminuindo') ||
    lower.includes('estoque aumentou') ||
    lower.includes('estoque reduziu');

  if (
    !asksExcessStock &&
    !asksBuyingMoreThanSelling &&
    !asksStockCashPressure &&
    !asksStockGrowth
  ) {
    return null;
  }

  if (asksExcessStock) {
    const hasExcess =
      inventoryPosition > INVENTORY_REFERENCE_VALUE;

    return `
📦 EXCESSO DE ESTOQUE — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📊 Posição estimada do estoque
${formatCurrency(inventoryPosition)}

📌 Referência gerencial
${formatCurrency(INVENTORY_REFERENCE_VALUE)}

📈 Diferença
${formatCurrency(referenceDifference)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  hasExcess
    ? `Sim. A posição estimada do estoque está ${formatCurrency(
        Math.abs(referenceDifference)
      )} acima da referência gerencial da Bebcom.`
    : `Não identifico excesso pela referência gerencial. A posição estimada está ${formatCurrency(
        Math.abs(referenceDifference)
      )} abaixo da referência de ${formatCurrency(INVENTORY_REFERENCE_VALUE)}.`
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${
  hasExcess
    ? 'Antes de ampliar compras, priorize giro dos produtos atuais, combos e ações para transformar estoque em caixa.'
    : 'Mantenha o acompanhamento. O ponto principal é garantir que não faltem produtos de alto giro, sem aumentar compras por impulso.'
}
`.trim();
  }

  if (asksBuyingMoreThanSelling) {
    return `
🛒 COMPRAS VS VENDAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

💰 Receita realizada
${formatCurrency(netRevenue)}

🛒 Compras de mercadorias
${formatCurrency(purchases)}

📊 Compras sobre entradas
${purchaseShare.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

📦 Efeito no estoque

Estoque inicial:
${formatCurrency(initialStock)}

Saldo Estoque:
${formatCurrency(stockBalance)}

Posição estimada:
${formatCurrency(inventoryPosition)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  purchaseShare > 70
    ? `As compras estão pesadas: representam ${purchaseShare.toFixed(
        1
      )}% das entradas.`
    : `As compras representam ${purchaseShare.toFixed(
        1
      )}% das entradas, um nível menos pressionado.`
}

${
  growthAmount > 0
    ? `Além disso, o estoque cresceu ${formatCurrency(
        growthAmount
      )}. Isso indica que parte das compras ainda não virou venda.`
    : `O estoque não cresceu no período. Isso indica que as compras estão mais próximas do ritmo de giro.`
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Se o objetivo é proteger caixa, compre apenas itens de alto giro até confirmar que as compras atuais estão se transformando em venda.
`.trim();
  }

  if (asksStockCashPressure) {
    return `
💸 ESTOQUE E PRESSÃO DE CAIXA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📈 Resultado do período
${formatCurrency(ctx.balance)}

🛒 Compras
${formatCurrency(purchases)}

📊 Compras sobre entradas
${purchaseShare.toFixed(1)}%

📦 Crescimento do estoque
${formatCurrency(growthAmount)}

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  ctx.balance < 0 && purchaseShare > 70
    ? 'Sim. O estoque e as compras estão pressionando o caixa neste momento.'
    : ctx.balance < 0
      ? 'O caixa está pressionado, mas não apenas pelo estoque. É preciso olhar também despesas e contas pendentes.'
      : purchaseShare > 70
        ? 'As compras estão altas em relação às entradas, mas o caixa ainda precisa ser analisado junto com o resultado do período.'
        : 'Não vejo sinal forte de que o estoque esteja consumindo o caixa de forma crítica neste momento.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Acompanhe diariamente compras, saldo de estoque e contas a pagar. Se o caixa estiver negativo, reduza compras não essenciais e foque em vender o estoque já comprado.
`.trim();
  }

  if (asksStockGrowth) {
    return `
📈 MOVIMENTO DO ESTOQUE — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📦 Estoque inicial
${formatCurrency(initialStock)}

📊 Saldo Estoque
${formatCurrency(stockBalance)}

📌 Posição estimada
${formatCurrency(inventoryPosition)}

━━━━━━━━━━━━━━━━━━

📈 Variação

${formatCurrency(growthAmount)}
${stockGrowthPercent.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

${
  growthAmount > 0
    ? `O estoque está crescendo. A posição estimada aumentou ${formatCurrency(
        growthAmount
      )} em relação ao início do mês.`
    : growthAmount < 0
      ? `O estoque está diminuindo. A posição estimada caiu ${formatCurrency(
          Math.abs(growthAmount)
        )} em relação ao início do mês.`
      : 'O estoque está estável em relação ao início do mês.'
}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

${
  growthAmount > 0
    ? 'Confirme se esse crescimento está acompanhado de vendas. Se não estiver, reduza novas compras e acelere giro.'
    : 'Se o estoque está caindo, confira se os produtos de maior giro continuam disponíveis para evitar ruptura.'
}
`.trim();
  }

  return null;
};

const buildAnalyticalInsights = (currentCtx, previousCtx) => {
  const insights = [];

  const revenueVariation = calculateVariation(
    currentCtx.totalIncome,
    previousCtx.totalIncome
  );

  const expenseVariation = calculateVariation(
    currentCtx.totalExpenses,
    previousCtx.totalExpenses
  );

  const currentTicket = currentCtx.managementReport?.averageTicket || 0;
  const previousTicket = previousCtx.managementReport?.averageTicket || 0;

  const ticketVariation = calculateVariation(currentTicket, previousTicket);

  const currentTickets = currentCtx.managementReport?.totalTickets || 0;
  const previousTickets = previousCtx.managementReport?.totalTickets || 0;

  if (revenueVariation > 0 && currentCtx.balance < previousCtx.balance) {
    insights.push(
      'Apesar do crescimento da receita, o lucro caiu. Isso pode indicar aumento de despesas operacionais ou redução de margem.'
    );
  }

  if (expenseVariation > revenueVariation && expenseVariation > 0) {
    insights.push(
      'As despesas cresceram proporcionalmente mais que a receita. Isso merece atenção para evitar pressão no caixa.'
    );
  }

  if (ticketVariation > 0 && currentTickets < previousTickets) {
    insights.push(
      'O ticket médio aumentou, porém o volume de comandas caiu. Isso indica vendas mais qualificadas, mas para menos clientes.'
    );
  }

  if (currentCtx.balance < 0) {
    insights.push(
      'O saldo realizado do período está negativo. É importante preservar caixa e acompanhar vencimentos próximos.'
    );
  }

  if (currentTicket === 0) {
    insights.push(
      'O Relatório Gerencial deste período ainda não possui ticket médio lançado.'
    );
  }

  return insights;
};

const buildTemporalOperationalMemory = (
  currentCtx,
  previousCtx
) => {
  const memories = [];

  if (!previousCtx) {
    return memories;
  }

  // Caixa
  if (
    currentCtx.balance < 0 &&
    previousCtx.balance < 0
  ) {
    memories.push(
      'O caixa vem operando pressionado nos últimos períodos.'
    );
  }

  // Despesas
  if (
    currentCtx.totalExpenses >
      currentCtx.totalIncome &&
    previousCtx.totalExpenses >
      previousCtx.totalIncome
  ) {
    memories.push(
      'As despesas seguem acima das entradas nos períodos analisados.'
    );
  }

  // Compras
  const currentPurchases =
    currentCtx.expenseCategories.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  const previousPurchases =
    previousCtx.expenseCategories.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  if (
    currentPurchases &&
    previousPurchases &&
    currentCtx.totalIncome > 0 &&
    previousCtx.totalIncome > 0
  ) {
    const currentRatio =
      currentPurchases.amount /
      currentCtx.totalIncome;

    const previousRatio =
      previousPurchases.amount /
      previousCtx.totalIncome;

    if (
      currentRatio > 0.6 &&
      previousRatio > 0.6
    ) {
      memories.push(
        'As compras de mercadorias seguem acima da média saudável da operação.'
      );
    }
  }

  // Ticket médio
  const currentTicket =
    currentCtx.managementReport
      ?.averageTicket || 0;

  const previousTicket =
    previousCtx.managementReport
      ?.averageTicket || 0;

  if (
    currentTicket > 0 &&
    previousTicket > 0
  ) {
    if (
      currentTicket < previousTicket
    ) {
      memories.push(
        'O ticket médio demonstra tendência de queda operacional.'
      );
    }

    if (
      currentTicket >
      previousTicket
    ) {
      memories.push(
        'O ticket médio demonstra recuperação operacional.'
      );
    }
  }

  return memories;
};

const buildOperationalTrend = (currentCtx, previousCtx) => {
  const trends = [];

  if (!previousCtx) return trends;

  const incomeVariation = calculateVariation(
    currentCtx.totalIncome,
    previousCtx.totalIncome
  );

  const expenseVariation = calculateVariation(
    currentCtx.totalExpenses,
    previousCtx.totalExpenses
  );

  const balanceVariation = calculateVariation(
    currentCtx.balance,
    previousCtx.balance
  );

  const currentTicket = currentCtx.managementReport?.averageTicket || 0;
  const previousTicket = previousCtx.managementReport?.averageTicket || 0;

  const ticketVariation = calculateVariation(currentTicket, previousTicket);

  if (currentCtx.balance < 0 && previousCtx.balance < 0) {
    trends.push('O caixa vem pressionado nos períodos analisados.');
  }

  if (expenseVariation > incomeVariation && currentCtx.totalExpenses > 0) {
    trends.push('As despesas cresceram mais que as entradas, indicando pressão operacional.');
  }

  if (currentCtx.balance < previousCtx.balance) {
    trends.push('O resultado piorou em relação ao período anterior.');
  }

  if (currentCtx.balance > previousCtx.balance) {
    trends.push('O resultado melhorou em relação ao período anterior.');
  }

  if (previousTicket > 0 && currentTicket > 0 && ticketVariation > 0) {
  trends.push('O ticket médio apresenta tendência de melhora.');
  }

 if (previousTicket > 0 && currentTicket > 0 && ticketVariation < 0) {
  trends.push('O ticket médio apresenta queda em relação ao período anterior.');
  }

  const currentTopExpense = currentCtx.expenseCategories?.[0];
  const previousTopExpense = previousCtx.expenseCategories?.[0];

  if (
    currentTopExpense &&
    previousTopExpense &&
    currentTopExpense.category === previousTopExpense.category &&
    currentTopExpense.amount > previousTopExpense.amount
  ) {
    trends.push(
      `A categoria ${currentTopExpense.category} segue como principal saída e aumentou no período atual.`
    );
  }

  return trends;
};
const buildOperationalPriorities = (currentCtx, previousCtx) => {
  const priorities = [];

  const currentTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const previousTicket =
    previousCtx.managementReport?.averageTicket || 0;

  const expenseVariation = calculateVariation(
    currentCtx.totalExpenses,
    previousCtx.totalExpenses
  );

  const revenueVariation = calculateVariation(
    currentCtx.totalIncome,
    previousCtx.totalIncome
  );

  // Caixa negativo
  if (currentCtx.balance < 0) {
    priorities.push({
      level: 1,
      message:
        'Atenção imediata ao caixa: o período está operando com saldo negativo.',
    });
  }

  // Despesas maiores que receita
  if (currentCtx.totalExpenses > currentCtx.totalIncome) {
    priorities.push({
      level: 2,
      message:
        'As despesas estão maiores que as entradas no período analisado.',
    });
  }

  // Crescimento descontrolado de despesas
  if (expenseVariation > revenueVariation && expenseVariation > 10) {
    priorities.push({
      level: 3,
      message:
        'As despesas cresceram proporcionalmente mais que a receita.',
    });
  }

  // Ticket médio caiu
 if (
  previousTicket > 0 &&
  currentTicket > 0 &&
  currentTicket < previousTicket
) {
    priorities.push({
      level: 4,
      message:
        'O ticket médio apresentou queda em relação ao período anterior.',
    });
  }

  // Contas elevadas
  if (currentCtx.pendingPayable > currentCtx.totalIncome * 0.5) {
    priorities.push({
      level: 5,
      message:
        'As contas pendentes representam pressão relevante sobre o caixa.',
    });
  }

  // Compras muito altas
  const topExpense = currentCtx.expenseCategories?.[0];

  if (
    topExpense &&
    topExpense.category === 'compras_mercadorias'
  ) {
    priorities.push({
      level: 6,
      message:
        'Compras de mercadorias seguem como principal pressão financeira da operação.',
    });
  }

  // Ordena prioridades
  priorities.sort((a, b) => a.level - b.level);

  return priorities;
};

const buildOperationalScore = (currentCtx, previousCtx) => {
  let score = 100;

  const strengths = [];
  const weaknesses = [];

  const currentTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const previousTicket =
    previousCtx.managementReport?.averageTicket || 0;

  // Caixa negativo
  if (currentCtx.balance < 0) {
    score -= 20;

    weaknesses.push(
      'Caixa operando com saldo negativo.'
    );
  } else {
    strengths.push(
      'O caixa do período está positivo.'
    );
  }

  // Despesas maiores que receita
  if (currentCtx.totalExpenses > currentCtx.totalIncome) {
    score -= 15;

    weaknesses.push(
      'As despesas estão maiores que as entradas.'
    );
  } else {
    strengths.push(
      'As entradas superam as despesas.'
    );
  }

  // Ticket médio
  // Ticket médio
  if (
    previousTicket > 0 &&
    currentTicket > 0 &&
    currentTicket > previousTicket
  ) {
    strengths.push(
      'O ticket médio apresenta evolução positiva.'
    );
  }

  if (
    previousTicket > 0 &&
    currentTicket > 0 &&
    currentTicket < previousTicket
  ) {
    score -= 10;

    weaknesses.push(
      'O ticket médio caiu em relação ao período anterior.'
    );
  }

  // Contas pendentes
  if (
    currentCtx.pendingPayable >
    currentCtx.totalIncome * 0.5
  ) {
    score -= 10;

    weaknesses.push(
      'As contas pendentes estão elevadas.'
    );
  }

  // Compras muito altas
  const topExpense =
    currentCtx.expenseCategories?.[0];

  if (
    topExpense &&
    topExpense.category === 'compras_mercadorias'
  ) {
    weaknesses.push(
      'Compras seguem como principal pressão financeira.'
    );

    score -= 5;
  }

  // Receita relevante
  if (currentCtx.totalIncome > 50000) {
    strengths.push(
      'A operação apresenta volume financeiro relevante.'
    );
  }

  // Limites
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // Classificação
  let status = 'Saudável';

  if (score < 80) {
    status = 'Atenção';
  }

  if (score < 60) {
    status = 'Crítico';
  }

  return {
    score,
    status,
    strengths,
    weaknesses,
  };
};

const buildOperationalAlerts = (
  currentCtx,
  previousCtx
) => {
  const alerts = [];

  // Caixa negativo
  if (currentCtx.balance < 0) {
    alerts.push({
      level: 'critical',
      message:
        'Caixa operando com saldo negativo no período.',
    });
  }

  // Despesas maiores que entradas
  if (
    currentCtx.totalExpenses >
    currentCtx.totalIncome
  ) {
    alerts.push({
      level: 'critical',
      message:
        'As despesas ultrapassaram as entradas do período.',
    });
  }

  // Crescimento de despesas
  if (
    previousCtx?.totalExpenses > 0
  ) {
    const growth =
      (
        (currentCtx.totalExpenses -
          previousCtx.totalExpenses) /
        previousCtx.totalExpenses
      ) * 100;

    if (growth > 20) {
      alerts.push({
        level: 'warning',
        message: `Despesas cresceram ${growth.toFixed(
          1
        )}% em relação ao período anterior.`,
      });
    }
  }

  // Queda no ticket médio
  const currentTicket =
    currentCtx.managementReport
      ?.averageTicket || 0;

  const previousTicket =
    previousCtx.managementReport
      ?.averageTicket || 0;

  if (
  previousTicket > 0 &&
  currentTicket > 0 &&
  currentTicket < previousTicket
) {
    const drop =
      (
        (previousTicket -
          currentTicket) /
        previousTicket
      ) * 100;

    if (drop > 10) {
      alerts.push({
        level: 'warning',
        message: `Ticket médio caiu ${drop.toFixed(
          1
        )}% em relação ao período anterior.`,
      });
    }
  }

  // Compras muito altas
  const purchases =
    currentCtx.expenseCategories.find(
      (item) =>
        item.category ===
        'compras_mercadorias'
    );

  if (
    purchases &&
    currentCtx.totalIncome > 0
  ) {
    const percentage =
      (
        purchases.amount /
        currentCtx.totalIncome
      ) * 100;

    if (percentage > 60) {
      alerts.push({
        level: 'warning',
        message: `Compras de mercadorias representam ${percentage.toFixed(
          1
        )}% das entradas do período.`,
      });
    }
  }

  // Contas pendentes elevadas
  if (
    currentCtx.pendingPayable >
    currentCtx.totalIncome * 0.5
  ) {
    alerts.push({
      level: 'warning',
      message:
        'Contas pendentes representam parcela elevada do faturamento.',
    });
  }

  return alerts;
};

const buildAutomaticRecommendations = (ctx) => {
  const recommendations = [];

  const topExpense = ctx.expenseCategories?.[0];

  if (ctx.balance < 0) {
    recommendations.push(
      'Priorizar preservação de caixa: evitar novas despesas não essenciais até equilibrar entradas e saídas.'
    );
  }

  if (topExpense) {
    recommendations.push(
      `Revisar o maior grupo de saída do período: ${topExpense.category}, que somou ${formatCurrency(topExpense.amount)}.`
    );
  }

  if (ctx.pendingPayable > 0) {
    recommendations.push(
      `Acompanhar contas a pagar pendentes/vencidas, atualmente em ${formatCurrency(ctx.pendingPayable)}.`
    );
  }

  if (ctx.totalIncome === 0 && ctx.totalExpenses > 0) {
    recommendations.push(
      'O período teve saídas sem entradas registradas. Verifique se as receitas do dia/período já foram lançadas.'
    );
  }

  if (ctx.balance > 0) {
    recommendations.push(
      'Manter o controle atual e avaliar se parte do saldo positivo pode reforçar caixa para próximos vencimentos.'
    );
  }

  return recommendations;
};

const buildMainOperationalIndicator = (ctx) => {
  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (ctx.balance < 0) {
    return `O principal indicador do período é o saldo negativo de ${formatCurrency(Math.abs(ctx.balance))}. Isso mostra que as saídas superaram as entradas e exige preservação imediata de caixa.`;
  }

  if (purchases && ctx.totalIncome > 0) {
    const percentage = (purchases.amount / ctx.totalIncome) * 100;

    if (percentage > 60) {
      return `O principal indicador do período é o peso das compras de mercadorias, que representam ${percentage.toFixed(1)}% das entradas. Isso pode pressionar o caixa se não houver giro suficiente.`;
    }
  }

  if (ctx.pendingPayable > ctx.totalIncome * 0.5) {
    return `O principal indicador do período é o volume de contas pendentes, que representa pressão relevante sobre o caixa.`;
  }

  return 'O principal indicador do período é manter o equilíbrio entre entradas, saídas, compras e contas pendentes.';
};

const buildOperationalBehavior = (ctx) => {
  const behaviors = [];

  const entries = ctx.entries || [];

  if (entries.length === 0) {
    return behaviors;
  }

  const weekDays = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];

  const incomeByDay = {};
  const expenseByDay = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const dayName = weekDays[date.getDay()];
    const amount = Math.abs(Number(entry.amount || 0));

    if (entry.type === 'income') {
      incomeByDay[dayName] = (incomeByDay[dayName] || 0) + amount;
    }

    if (entry.type === 'expense') {
      expenseByDay[dayName] = (expenseByDay[dayName] || 0) + amount;
    }
  });

  const topIncomeDay = Object.entries(incomeByDay)
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => b.amount - a.amount)[0];

  const weakIncomeDay = Object.entries(incomeByDay)
  .map(([day, amount]) => ({ day, amount }))
  .sort((a, b) => a.amount - b.amount)[0];

  if (topIncomeDay) {
    behaviors.push(
      `O dia com maior concentração de entradas foi ${topIncomeDay.day}, com ${formatCurrency(topIncomeDay.amount)}.`
    );
  }
  const topExpenseDay = Object.entries(expenseByDay)
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => b.amount - a.amount)[0];

  if (weakIncomeDay) {
  behaviors.push(
    `O dia com menor volume de entradas foi ${weakIncomeDay.day}, com ${formatCurrency(weakIncomeDay.amount)}.`
  );
}
  
  const totalIncomeDays = Object.values(incomeByDay).reduce(
  (acc, value) => acc + value,
  0
);

if (
  topIncomeDay &&
  totalIncomeDays > 0
) {
  const concentration =
    (topIncomeDay.amount / totalIncomeDays) * 100;

  if (concentration > 35) {
    behaviors.push(
      `As entradas estão muito concentradas em ${topIncomeDay.day}, representando ${concentration.toFixed(1)}% do faturamento do período.`
    );
  }
}

  if (topExpenseDay) {
    behaviors.push(
      `O dia com maior concentração de saídas foi ${topExpenseDay.day}, com ${formatCurrency(topExpenseDay.amount)}.`
    );
  }

  if (
    topIncomeDay &&
    topExpenseDay &&
    topIncomeDay.day === topExpenseDay.day
  ) {
    behaviors.push(
      'Entradas e saídas se concentram no mesmo dia da semana, exigindo atenção ao fluxo diário de caixa.'
    );
  }

  const firstHalfEntries = entries.filter((entry) => {
    const day = new Date(entry.date).getDate();
    return day <= 15;
  });

  const secondHalfEntries = entries.filter((entry) => {
    const day = new Date(entry.date).getDate();
    return day > 15;
  });

  const firstHalfIncome = firstHalfEntries
    .filter((entry) => entry.type === 'income')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const secondHalfIncome = secondHalfEntries
    .filter((entry) => entry.type === 'income')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const firstHalfExpenses = firstHalfEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const secondHalfExpenses = secondHalfEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((acc, entry) => acc + Math.abs(Number(entry.amount || 0)), 0);

  const weekendIncome =
  (incomeByDay['sábado'] || 0) +
  (incomeByDay['domingo'] || 0);

if (
  totalIncomeDays > 0 &&
  weekendIncome / totalIncomeDays > 0.4
) {
  behaviors.push(
    'A operação demonstra forte dependência do movimento de fim de semana.'
  );
}

  if (secondHalfIncome > firstHalfIncome * 1.2) {
    behaviors.push(
      'As entradas aceleraram na segunda metade do período, indicando melhora recente no ritmo de vendas ou recebimentos.'
    );
  }

  if (firstHalfIncome > secondHalfIncome * 1.2) {
    behaviors.push(
      'As entradas foram mais fortes na primeira metade do período, indicando desaceleração recente no ritmo de vendas ou recebimentos.'
    );
  }

  if (secondHalfExpenses > firstHalfExpenses * 1.2) {
    behaviors.push(
      'As saídas aceleraram na segunda metade do período, indicando aumento recente de pressão financeira.'
    );
  }

  if (firstHalfExpenses > secondHalfExpenses * 1.2) {
    behaviors.push(
      'As saídas foram mais concentradas na primeira metade do período.'
    );
  }

  const purchaseEntries = entries.filter(
    (entry) =>
      entry.type === 'expense' &&
      entry.category === 'compras_mercadorias'
  );

  const purchaseTotal = purchaseEntries.reduce(
    (acc, entry) => acc + Math.abs(Number(entry.amount || 0)),
    0
  );

  if (purchaseTotal > 0 && ctx.totalExpenses > 0) {
    const purchaseShare = (purchaseTotal / ctx.totalExpenses) * 100;

    if (purchaseShare > 50) {
      behaviors.push(
        `As compras de mercadorias representam ${purchaseShare.toFixed(1)}% das saídas do período, mostrando forte peso operacional nas compras.`
      );
}
    if (purchaseShare > 70) {
  behaviors.push(
    'O nível de compras está muito elevado em relação ao porte operacional do período.'
  );
}
  }


  return behaviors;
};

const buildStrategicRecommendations = (ctx) => {
  const recommendations = [];

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  // Caixa negativo
  if (ctx.balance < 0) {
    recommendations.push(
      'Minha prioridade imediata seria preservar caixa e evitar novas despesas não essenciais.'
    );
  }

  // Compras muito altas
  if (
    purchases &&
    ctx.totalIncome > 0
  ) {
    const percentage =
      (purchases.amount / ctx.totalIncome) * 100;

    if (percentage > 60) {
      recommendations.push(
        'Eu reduziria temporariamente o ritmo de compras até melhorar o equilíbrio do caixa.'
      );
    }

    if (percentage > 75) {
      recommendations.push(
        'O volume de compras está muito acima do ideal. O foco agora deve ser aumentar giro antes de novas reposições.'
      );
    }
  }

  // Contas pendentes
  if (
    ctx.pendingPayable >
    ctx.totalIncome * 0.4
  ) {
    recommendations.push(
      'Minha recomendação seria acompanhar vencimentos diariamente para evitar pressão acumulada no caixa.'
    );
  }

  // Ticket médio
  const ticket =
    ctx.managementReport?.averageTicket || 0;

  if (ticket > 0 && ticket < 25) {
    recommendations.push(
      'Eu trabalharia estratégias simples para elevar ticket médio, como combos e produtos complementares.'
    );
  }

  // Caixa positivo
  if (
    ctx.balance > 0 &&
    ctx.pendingPayable <
      ctx.totalIncome * 0.3
  ) {
    recommendations.push(
      'A operação apresenta espaço para crescimento controlado mantendo equilíbrio financeiro.'
    );
  }

  // Estoque
  const stock =
  getInventoryEstimatedPosition(ctx);

  if (
    stock > ctx.totalIncome
  ) {
    recommendations.push(
      'O estoque financeiro parece elevado em relação ao faturamento atual. Eu focaria em giro antes de ampliar compras.'
    );
  }

  return recommendations;
};

const buildOperationalPlan = (ctx) => {
  const plans = [];

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  // Caixa negativo
  if (ctx.balance < 0) {
    plans.push(
      'Preservar caixa imediatamente até estabilizar o resultado operacional.'
    );
  }

  // Compras elevadas
  if (
    purchases &&
    ctx.totalIncome > 0
  ) {
    const percentage =
      (purchases.amount / ctx.totalIncome) * 100;

    if (percentage > 70) {
      plans.push(
        'Reduzir temporariamente compras e focar aumento de giro do estoque atual.'
      );
    }
  }

  // Ticket médio
  const ticket =
    ctx.managementReport?.averageTicket || 0;

  if (ticket > 0 && ticket < 25) {
    plans.push(
      'Criar ações para elevar ticket médio com combos, adicionais e produtos complementares.'
    );
  }

  // Fim de semana
  const saturdayIncome =
    ctx.weekdayIncome?.sábado || 0;

  const sundayIncome =
    ctx.weekdayIncome?.domingo || 0;

  const weekendIncome =
    saturdayIncome + sundayIncome;

  if (
    ctx.totalIncome > 0 &&
    weekendIncome / ctx.totalIncome > 0.35
  ) {
    plans.push(
      'Fortalecer campanhas e ações comerciais para o fim de semana, principal período operacional da loja.'
    );
  }

  // Contas pendentes
  if (
    ctx.pendingPayable >
    ctx.totalIncome * 0.35
  ) {
    plans.push(
      'Acompanhar contas pendentes diariamente para evitar pressão acumulada de vencimentos.'
    );
  }

  // Estoque
  const stock =
  getInventoryEstimatedPosition(ctx);

  if (
    stock > ctx.totalIncome
  ) {
    plans.push(
      'Priorizar giro de estoque antes de ampliar reposições.'
    );
  }

  // Crescimento saudável
  if (
    ctx.balance > 0 &&
    ctx.pendingPayable <
      ctx.totalIncome * 0.25
  ) {
    plans.push(
      'A operação permite crescimento controlado mantendo equilíbrio financeiro.'
    );
  }

  return plans;
};

const buildStrategicSimulation = (ctx) => {
  const simulations = [];

  const absBalance = Math.abs(ctx.balance || 0);

  // Caixa negativo
  if (ctx.balance < 0) {
    simulations.push({
      type: 'cash_recovery',
      message: `Para equilibrar o caixa atual, a operação precisaria gerar aproximadamente ${formatCurrency(absBalance)} adicionais sem aumentar despesas.`,
    });
  }

  // Compras
  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (
    purchases &&
    ctx.totalIncome > 0
  ) {
    const purchaseShare =
      (purchases.amount / ctx.totalIncome) * 100;

    simulations.push({
      type: 'purchase_share',
      message: `As compras atuais representam ${purchaseShare.toFixed(1)}% das entradas do período.`,
    });

    if (purchaseShare > 70) {
      const suggestedPurchases =
        ctx.totalIncome * 0.55;

      simulations.push({
        type: 'purchase_reduction',
        message: `Para uma operação mais equilibrada, as compras deveriam ficar próximas de ${formatCurrency(suggestedPurchases)} neste nível de faturamento.`,
      });
    }
  }

  // Ticket médio
  const ticket =
    ctx.managementReport?.averageTicket || 0;

  const commands =
    ctx.managementReport?.totalOrders || 0;

  if (ticket > 0 && commands > 0) {
    const simulatedTicket =
      ticket + 5;

    const projectedRevenue =
      simulatedTicket * commands;

    simulations.push({
      type: 'ticket_growth',
      message: `Se o ticket médio subisse para ${formatCurrency(simulatedTicket)}, o faturamento projetado seria aproximadamente ${formatCurrency(projectedRevenue)}.`,
    });
  }

  // Crescimento
  if (ctx.totalIncome > 0) {
    const targetGrowth =
      ctx.totalIncome * 1.15;

    simulations.push({
      type: 'growth_projection',
      message: `Uma meta saudável de crescimento seria atingir aproximadamente ${formatCurrency(targetGrowth)} em entradas mantendo controle operacional.`,
    });
  }

  return simulations;
};

const buildExecutiveDecision = (ctx) => {
  const decisions = [];

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  // Caixa negativo
  if (ctx.balance < 0) {
    decisions.push(
      'Eu evitaria assumir novas despesas até estabilizar o caixa operacional.'
    );
  }

  // Compras elevadas
  if (
    purchases &&
    ctx.totalIncome > 0
  ) {
    const purchaseShare =
      (purchases.amount / ctx.totalIncome) * 100;

    if (purchaseShare > 75) {
      decisions.push(
        'Eu reduziria temporariamente o ritmo de compras antes de ampliar estoque.'
      );
    }
  }

  // Contas pendentes
  if (
    ctx.pendingPayable >
    ctx.totalIncome * 0.4
  ) {
    decisions.push(
      'A pressão de contas pendentes exige acompanhamento financeiro diário.'
    );
  }

  // Resultado saudável
  if (
    ctx.balance > 0 &&
    ctx.pendingPayable <
      ctx.totalIncome * 0.25
  ) {
    decisions.push(
      'A operação demonstra espaço para crescimento controlado com responsabilidade financeira.'
    );
  }

  // Estoque elevado
 const stock =
  getInventoryEstimatedPosition(ctx);

  if (
    stock > ctx.totalIncome
  ) {
    decisions.push(
      'Eu priorizaria giro do estoque antes de aumentar reposições.'
    );
  }

  // Situação crítica
  if (
    ctx.balance < 0 &&
    ctx.pendingPayable >
      ctx.totalIncome * 0.35
  ) {
    decisions.push(
      'Minha prioridade absoluta seria recuperar equilíbrio financeiro antes de expandir operação ou assumir novos compromissos.'
    );
  }

  return decisions;
};

const buildExecutiveMemory = (
  currentCtx,
  previousCtx
) => {
  const memories = [];

  if (!previousCtx) {
    return memories;
  }

  // Caixa
  if (
    currentCtx.balance < 0 &&
    previousCtx.balance < 0
  ) {
    memories.push(
      'O caixa permanece pressionado em relação ao período anterior.'
    );
  }

  if (
    currentCtx.balance > previousCtx.balance &&
    currentCtx.balance > 0
  ) {
    memories.push(
      'O resultado operacional demonstra melhora em relação ao período anterior.'
    );
  }

  if (
    currentCtx.balance < previousCtx.balance
  ) {
    memories.push(
      'O resultado operacional piorou em relação ao período anterior.'
    );
  }

  // Compras
  const currentPurchases =
    currentCtx.expenseCategories.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  const previousPurchases =
    previousCtx.expenseCategories.find(
      (item) =>
        item.category === 'compras_mercadorias'
    );

  if (
    currentPurchases &&
    previousPurchases &&
    currentCtx.totalIncome > 0 &&
    previousCtx.totalIncome > 0
  ) {
    const currentShare =
      (currentPurchases.amount /
        currentCtx.totalIncome) *
      100;

    const previousShare =
      (previousPurchases.amount /
        previousCtx.totalIncome) *
      100;

    if (
      currentShare > previousShare
    ) {
      memories.push(
        'A pressão de compras aumentou em relação ao período anterior.'
      );
    }

    if (
      currentShare < previousShare
    ) {
      memories.push(
        'O peso das compras reduziu em relação ao período anterior.'
      );
    }
  }

  // Contas pendentes
  if (
    currentCtx.pendingPayable >
    previousCtx.pendingPayable
  ) {
    memories.push(
      'As contas pendentes cresceram em relação ao período anterior.'
    );
  }

  if (
    currentCtx.pendingPayable <
    previousCtx.pendingPayable
  ) {
    memories.push(
      'As contas pendentes reduziram em relação ao período anterior.'
    );
  }

  // Receita
  if (
    currentCtx.totalIncome >
    previousCtx.totalIncome
  ) {
    memories.push(
      'A receita operacional aumentou em relação ao período anterior.'
    );
  }

  if (
    currentCtx.totalIncome <
    previousCtx.totalIncome
  ) {
    memories.push(
      'A receita operacional caiu em relação ao período anterior.'
    );
  }

  return memories;
};

const buildExecutiveResponseStyle = (
  question
) => {
  const lower =
    question.toLowerCase();

  // Perguntas objetivas
  if (
    lower.includes('acha') ||
    lower.includes('preocupa') ||
    lower.includes('vale a pena') ||
    lower.includes('estamos evoluindo') ||
    lower.includes('recuperação') ||
    lower.includes('recuperacao') ||
    lower.includes('piorando') ||
    lower.includes('melhorou') ||
    lower.includes('focaria') ||
    lower.includes('contrataria') ||
    lower.includes('abriria') ||
    lower.includes('investir')
  ) {
    return 'executive_short';
  }

  // Perguntas profundas
  if (
    lower.includes('análise') ||
    lower.includes('analise') ||
    lower.includes('detalhada') ||
    lower.includes('completa') ||
    lower.includes('relatório') ||
    lower.includes('relatorio')
  ) {
    return 'executive_long';
  }

  return 'normal';
};

  const buildSmartGoal = (
  ctx,
  operationalScore,
  actionPlan,
  strategicSimulations,
  horizon = 'general'
  ) => {

     if (horizon === 'daily') {
  return {
    period: 'diário',
    mainGoal:
      'Preservar caixa e evitar novas pressões financeiras.',
    financialGoal:
      'Não ampliar o saldo negativo.',
    operationalGoal:
      'Priorizar vendas e evitar compras não urgentes.',
    successIndicator:
      'Fechar o dia sem deterioração do caixa.',
  };
}

    if (horizon === 'weekly') {
  return {
    period: 'semanal',
    mainGoal:
      `Recuperar ${formatCurrency(
        Math.abs(ctx.balance)
      )} do saldo negativo.`,
    financialGoal:
      'Aumentar geração de caixa.',
    operationalGoal:
      'Melhorar giro e reduzir compras.',
    successIndicator:
      'Encerrar a semana com melhora financeira.',
  };
}

    if (horizon === 'monthly') {
  return {
    period: 'mensal',
    mainGoal:
      'Voltar ao equilíbrio financeiro.',
    financialGoal:
      'Fechar o mês com saldo positivo.',
    operationalGoal:
      'Reduzir peso das compras e melhorar margem.',
    successIndicator:
      'Score operacional acima de 70.',
  };
}

  let mainGoal = 'Manter crescimento com equilíbrio operacional.';
  let financialGoal = 'Preservar caixa e manter despesas proporcionais às entradas.';
  let operationalGoal = 'Manter giro saudável, controle de compras e estabilidade operacional.';
  let successIndicator = 'Manter score operacional saudável.';
  let period = 'curto prazo';

  if (ctx.balance < 0) {
    mainGoal = `Eliminar o saldo negativo de ${formatCurrency(Math.abs(ctx.balance))}.`;
    financialGoal = `Gerar pelo menos ${formatCurrency(Math.abs(ctx.balance))} adicionais sem aumentar despesas.`;
    operationalGoal = 'Reduzir compras temporariamente e acelerar o giro do estoque atual.';
    successIndicator = 'Voltar o caixa para saldo positivo.';
    period = 'imediato';
  }

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (purchases && ctx.totalIncome > 0) {
    const purchaseShare = (purchases.amount / ctx.totalIncome) * 100;

    if (purchaseShare > 70) {
      operationalGoal =
        'Reduzir o peso das compras para uma faixa mais saudável e priorizar venda do estoque atual.';

      successIndicator =
        'Compras abaixo de 60% das entradas e caixa em recuperação.';
    }
  }

  if (operationalScore?.score < 60) {
    period = 'urgente';
    mainGoal = 'Recuperar saúde operacional antes de expandir.';
    successIndicator = 'Elevar o score operacional para pelo menos 70/100.';
  }

  if (
    ctx.balance > 0 &&
    ctx.pendingPayable < ctx.totalIncome * 0.3
  ) {
    mainGoal = 'Crescer com controle e preservar margem.';
    financialGoal = 'Manter saldo positivo e evitar aumento desnecessário de despesas.';
    operationalGoal = 'Aumentar vendas sem elevar compras acima do ritmo de giro.';
    successIndicator = 'Manter caixa positivo, compras controladas e score saudável.';
    period = 'mensal';
  }
  return {
    period,
    mainGoal,
    financialGoal,
    operationalGoal,
    successIndicator,
  };
};

const buildManagerCopilot = ({
  type,
  currentCtx,
  operationalPriorities,
  operationalTrends,
  temporalMemories,
  operationalBehavior,
  strategicRecommendations,
  operationalScore,
  operationalAlerts,
}) => {
  const currentMonth = currentCtx.periodLabel || 'Período atual';

  const prioritiesText =
    operationalPriorities.length > 0
      ? operationalPriorities
          .map((item, index) => `${index + 1}. ${item.message}`)
          .join('\n')
      : 'Nenhuma prioridade crítica identificada.';

  const trendsText =
    operationalTrends.length > 0
      ? operationalTrends.map((item) => `• ${item}`).join('\n')
      : 'Ainda não identifiquei tendência operacional relevante.';

  const alertsText =
    operationalAlerts && operationalAlerts.length > 0
      ? operationalAlerts.map((alert) => `⚠️ ${alert.message}`).join('\n')
      : 'Nenhum alerta operacional relevante identificado.';

  const behaviorText =
  operationalBehavior && operationalBehavior.length > 0
    ? operationalBehavior.map((item) => `• ${item}`).join('\n')
    : 'Ainda não identifiquei padrão operacional suficiente neste período.';

  const recommendationsText =
  strategicRecommendations &&
  strategicRecommendations.length > 0
    ? strategicRecommendations
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhuma recomendação estratégica relevante identificada.';

  if (type === 'morning') {
    return `
Bom dia, Rodrigo.

Panorama do Bebcom hoje:

${trendsText}

Prioridades do dia:
${prioritiesText}

Alertas automáticos:
${alertsText}


Minha percepção:
Hoje o principal foco deve ser preservar caixa, controlar compras e acompanhar o ritmo operacional da loja.

Sugestão prática:
Defina uma prioridade operacional para acompanhar ao longo do dia.
    `.trim();
  }

  if (type === 'operation') {
    return `
Análise operacional do Bebcom em ${currentMonth}:

Prioridades identificadas:
${prioritiesText}

Tendências operacionais:
${trendsText}

Alertas automáticos:
${alertsText}

Leitura gerencial:
A operação apresenta pontos que exigem atenção principalmente em caixa, despesas e equilíbrio operacional.

Minha percepção:
O crescimento precisa acontecer com controle financeiro e operacional para preservar margem e saúde do caixa.
    `.trim();
  }

  if (type === 'panorama') {
    return `
Panorama executivo do Bebcom — ${currentMonth}

Tendências:
${trendsText}

Prioridades:
${prioritiesText}

Alertas automáticos:
${alertsText}

Visão gerencial:
O Bebcom já possui operação relevante e movimentação consistente, mas os números mostram necessidade de equilíbrio entre crescimento, despesas e geração de caixa.
    `.trim();
  }

  if (type === 'month') {
    return `
Resumo gerencial de ${currentMonth}:

Prioridades do período:
${prioritiesText}

Tendências identificadas:
${trendsText}

${
  temporalMemories.length > 0
    ? `
Memória operacional:
${temporalMemories
  .map((item) => `• ${item}`)
  .join('\n')}
`
    : ''
}

Comportamento operacional:
${behaviorText}

Recomendações estratégicas:
${recommendationsText}

Alertas automáticos:
${alertsText}

Minha percepção gerencial:
O período mostra comportamento operacional que exige atenção principalmente sobre caixa, despesas e desempenho financeiro.
    `.trim();
  }

  if (type === 'score') {
  return `
🏅 SCORE GERENCIAL — ${currentMonth}

━━━━━━━━━━━━━━━━━━

📊 Nota da operação

${operationalScore.score}/100

🏷️ Classificação

${operationalScore.status}

━━━━━━━━━━━━━━━━━━

🟢 Pontos fortes

${
  operationalScore.strengths.length > 0
    ? operationalScore.strengths.map((item) => `• ${item}`).join('\n')
    : 'Nenhum ponto forte relevante identificado.'
}

━━━━━━━━━━━━━━━━━━

⚠️ Pontos de atenção

${
  operationalScore.weaknesses.length > 0
    ? operationalScore.weaknesses.map((item) => `• ${item}`).join('\n')
    : 'Nenhum ponto crítico identificado.'
}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

${
  operationalScore.score >= 80
    ? 'A operação demonstra boa saúde financeira e operacional.'
    : operationalScore.score >= 60
      ? 'A operação merece acompanhamento, mas ainda apresenta estabilidade.'
      : 'A operação exige atenção gerencial. O foco deve estar em caixa, compras e controle de despesas.'
}

━━━━━━━━━━━━━━━━━━

👉 Próxima ação sugerida

Priorize os pontos críticos listados acima. Pequenas melhorias nas maiores pressões financeiras costumam gerar grande impacto no resultado.
    `.trim();
}

  return `
Resumo operacional do Bebcom:

${prioritiesText}

${trendsText}

Alertas automáticos:
${alertsText}
  `.trim();
};

const hasReliableComparisonData = (ctx) => {
  if (!ctx) return false;

  const hasEntries = ctx.entries && ctx.entries.length > 0;
  const hasIncome = ctx.totalIncome > 0;
  const hasExpenses = ctx.totalExpenses > 0;

  return hasEntries && hasIncome && hasExpenses;
};

const buildComparisonAnswer = (currentCtx, compareCtx) => {
  const currentReliable = hasReliableComparisonData(currentCtx);
  const compareReliable = hasReliableComparisonData(compareCtx);

  if (!currentReliable || !compareReliable) {
    return `
Comparativo entre ${currentCtx.periodLabel} e ${compareCtx.periodLabel}

Não encontrei dados suficientes em um dos períodos para fazer um comparativo financeiro confiável.

Dados encontrados:
${currentCtx.periodLabel}:
• Entradas: ${formatCurrency(currentCtx.totalIncome)}
• Saídas: ${formatCurrency(currentCtx.totalExpenses)}
• Saldo: ${formatCurrency(currentCtx.balance)}

${compareCtx.periodLabel}:
• Entradas: ${formatCurrency(compareCtx.totalIncome)}
• Saídas: ${formatCurrency(compareCtx.totalExpenses)}
• Saldo: ${formatCurrency(compareCtx.balance)}

Minha leitura:
Eu evitaria concluir que o resultado melhorou ou piorou sem lançamentos suficientes nos dois períodos.

Próxima ação sugerida:
Verifique se entradas, saídas e despesas do período comparado foram lançadas corretamente antes de tomar decisão.
    `.trim();
  }

  const revenueVariation = calculateVariation(
    currentCtx.totalIncome,
    compareCtx.totalIncome
  );

  const expenseVariation = calculateVariation(
    currentCtx.totalExpenses,
    compareCtx.totalExpenses
  );

  const resultDifference =
    Number(currentCtx.balance || 0) -
    Number(compareCtx.balance || 0);

  const crossedFromLossToProfit =
    Number(compareCtx.balance || 0) < 0 &&
    Number(currentCtx.balance || 0) > 0;

  const crossedFromProfitToLoss =
    Number(compareCtx.balance || 0) > 0 &&
    Number(currentCtx.balance || 0) < 0;

  let resultStatus = '';

  if (crossedFromLossToProfit) {
    resultStatus = '✅ Saiu de prejuízo para lucro';
  } else if (crossedFromProfitToLoss) {
    resultStatus = '⚠️ Saiu de lucro para prejuízo';
  } else if (resultDifference > 0) {
    resultStatus = `✅ Melhorou ${formatCurrency(resultDifference)}`;
  } else if (resultDifference < 0) {
    resultStatus = `⚠️ Piorou ${formatCurrency(Math.abs(resultDifference))}`;
  } else {
    resultStatus = 'Estável';
  }

  let reading = 'O comparativo mostra mudança operacional entre os períodos.';

  if (
    currentCtx.totalIncome > compareCtx.totalIncome &&
    currentCtx.balance < compareCtx.balance
  ) {
    reading =
      'A receita cresceu, porém o resultado piorou. Isso indica aumento relevante das despesas, compras ou perda de margem.';
  } else if (resultDifference > 0) {
    reading =
      'O resultado operacional melhorou em relação ao período comparado.';
  } else if (resultDifference < 0) {
    reading =
      'O resultado operacional piorou em relação ao período comparado.';
  }

  return `
Comparativo: ${currentCtx.periodLabel} vs ${compareCtx.periodLabel}

Receita:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.totalIncome)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.totalIncome)}
Variação: ${revenueVariation !== null ? `${revenueVariation.toFixed(1)}%` : 'sem base'}

Despesas:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.totalExpenses)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.totalExpenses)}
Variação: ${expenseVariation !== null ? `${expenseVariation.toFixed(1)}%` : 'sem base'}

Resultado:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.balance)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.balance)}

Diferença:
${formatCurrency(resultDifference)}

Situação:
${resultStatus}

Minha leitura:
${reading}

Minha posição:
Eu analisaria esse comparativo junto com compras, contas pendentes e ticket médio para entender se houve crescimento saudável ou apenas maior movimentação financeira.
  `.trim();
};

const buildTicketComparisonAnswer = (currentCtx, compareCtx) => {
  const currentTicket = currentCtx.managementReport?.averageTicket || 0;
  const compareTicket = compareCtx.managementReport?.averageTicket || 0;

  const currentRevenue = currentCtx.managementReport?.netRevenue || 0;
  const compareRevenue = compareCtx.managementReport?.netRevenue || 0;

  const currentTickets = currentCtx.managementReport?.totalTickets || 0;
  const compareTickets = compareCtx.managementReport?.totalTickets || 0;

  if (
    currentTicket <= 0 ||
    compareTicket <= 0 ||
    currentTickets <= 0 ||
    compareTickets <= 0
  ) {
    return `
Comparativo de ticket médio entre ${currentCtx.periodLabel} e ${compareCtx.periodLabel}

Não há dados gerenciais suficientes para comparar ticket médio com segurança.

Dados encontrados:
${currentCtx.periodLabel}:
• Ticket médio: ${formatCurrency(currentTicket)}
• Total de comandas: ${currentTickets}
• Receita líquida gerencial: ${formatCurrency(currentRevenue)}

${compareCtx.periodLabel}:
• Ticket médio: ${formatCurrency(compareTicket)}
• Total de comandas: ${compareTickets}
• Receita líquida gerencial: ${formatCurrency(compareRevenue)}

Minha leitura:
Antes de concluir melhora ou queda no ticket médio, é necessário ter receita líquida e total de comandas lançados nos dois períodos.

Próxima ação sugerida:
Alimente o Relatório Gerencial dos dois períodos para permitir uma análise confiável de ticket médio.
    `.trim();
  }

  const ticketVariation = calculateVariation(currentTicket, compareTicket);
  const revenueVariation = calculateVariation(currentRevenue, compareRevenue);
  const volumeVariation = calculateVariation(currentTickets, compareTickets);

  let reading = 'O ticket médio ficou estável no comparativo.';

  if (currentTicket > compareTicket && currentTickets < compareTickets) {
    reading =
      'O ticket médio subiu, mas o volume de comandas caiu. Isso indica vendas de maior valor para menos clientes.';
  } else if (currentTicket > compareTicket) {
    reading =
      'O ticket médio melhorou em relação ao período comparado, indicando aumento no valor médio por venda.';
  } else if (currentTicket < compareTicket) {
    reading =
      'O ticket médio caiu em relação ao período comparado. Vale revisar mix de produtos, combos e estratégias de venda.';
  }

  return `
Comparativo de Ticket Médio: ${currentCtx.periodLabel} vs ${compareCtx.periodLabel}

Ticket médio:
${compareCtx.periodLabel}: ${formatCurrency(compareTicket)}
${currentCtx.periodLabel}: ${formatCurrency(currentTicket)}
Variação: ${ticketVariation.toFixed(1)}%

Receita líquida gerencial:
${compareCtx.periodLabel}: ${formatCurrency(compareRevenue)}
${currentCtx.periodLabel}: ${formatCurrency(currentRevenue)}
Variação: ${revenueVariation.toFixed(1)}%

Total de comandas:
${compareCtx.periodLabel}: ${compareTickets}
${currentCtx.periodLabel}: ${currentTickets}
Variação: ${volumeVariation.toFixed(1)}%

Minha leitura:
${reading}

Minha sugestão:
Use esse comparativo para entender se a empresa está crescendo por volume de clientes, por aumento do valor médio de compra, ou por uma combinação dos dois.
  `.trim();
};
const getEducationalAnswer = (question) => {
  const lower = question.toLowerCase();

  // COMO FUNCIONA
  if (
    lower.includes('como funciona o site') ||
    lower.includes('como funciona')
  ) {
    return `
O Bebcom Financeiro funciona como uma central de gestão financeira, operacional e estratégica.

Você pode:
• lançar entradas e saídas
• controlar contas a pagar e receber
• acompanhar fluxo de caixa
• analisar DRE mensal
• visualizar dashboards
• acompanhar indicadores
• utilizar a IA Bebcom para análises e decisões gerenciais

O objetivo do sistema é ajudar na tomada de decisão e no controle inteligente da operação.
    `.trim();
  }

  // LANÇAMENTOS
  if (
    lower.includes('como faço os lançamentos') ||
    lower.includes('como lançar')
  ) {
    return `
Os lançamentos representam entradas e saídas financeiras da operação.

Exemplos:
• vendas
• compras
• despesas
• pagamentos
• recebimentos

Cada lançamento ajuda a compor:
• fluxo de caixa
• DRE
• dashboards
• análises da IA Bebcom

O ideal é manter os lançamentos sempre organizados por:
• categoria
• centro de custo
• canal de venda
• data correta da competência.
    `.trim();
  }

  // CENTRO DE CUSTO
  if (lower.includes('centro de custo')) {
    return `
Centro de custo é a área responsável por determinada despesa ou operação.

Exemplos:
• Operação Loja
• Administrativo
• Financeiro
• Estrutura

Isso ajuda a identificar onde o dinheiro está sendo gasto e quais áreas consomem mais recursos.
    `.trim();
  }

  // CANAL DE VENDA
  if (lower.includes('canal de venda')) {
    return `
Canal de venda é a origem da venda realizada.

Exemplos:
• Loja Física
• Delivery
• iFood
• WhatsApp
• Bebcom Delivery

Isso ajuda a entender quais canais vendem mais e geram melhor resultado.
    `.trim();
  }

  // LUCRO LIQUIDO
  if (lower.includes('lucro líquido')) {
    return `
Lucro líquido é o valor que sobra após descontar todas as despesas da empresa.

Exemplo:

Receita: R$ 10.000
Despesas: R$ 8.000

Lucro líquido:
R$ 2.000

Esse indicador mostra se a operação realmente está gerando resultado positivo.
    `.trim();
  }

  // MARGEM LIQUIDA
  if (lower.includes('margem líquida')) {
    return `
Margem líquida mostra quanto da receita realmente virou lucro.

Exemplo:

Receita: R$ 10.000
Lucro líquido: R$ 2.000

Margem líquida:
20%

Quanto maior a margem líquida, maior a eficiência financeira da operação.
    `.trim();
  }

  // MARGEM BRUTA
  if (lower.includes('margem bruta')) {
    return `
Margem bruta mede o lucro da operação antes das despesas administrativas, financeiras e operacionais.

Ela ajuda a entender se os produtos vendidos possuem boa rentabilidade.
    `.trim();
  }

  // MARGEM OPERACIONAL
  if (lower.includes('margem operacional')) {
    return `
Margem operacional mede a eficiência da operação principal da empresa.

Ela mostra quanto sobra após os custos operacionais da atividade.
    `.trim();
  }

  return null;
};

const getKnowledgeBaseAnswer = (question, ctx) => {
  const lower = question.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  iaKnowledgeBase.forEach((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      if (lower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  });

  if (!bestMatch || highestScore === 0) {
    return null;
  }

  const topExpense = ctx.expenseCategories?.[0];
  const secondExpense = ctx.expenseCategories?.[1];
  const hasNegativeBalance = ctx.balance < 0;
  const hasHighExpenses = ctx.totalExpenses > ctx.totalIncome && ctx.totalIncome > 0;
  const hasNoIncome = ctx.totalIncome === 0 && ctx.totalExpenses > 0;

  let appliedContext = '';

  if (bestMatch.aplicacaoComDados) {
    const contextualAlerts = [];

    if (hasNegativeBalance) {
      contextualAlerts.push(
        `o saldo analisado está negativo em ${formatCurrency(ctx.balance)}`
      );
    }

    if (hasHighExpenses) {
      contextualAlerts.push(
        'as despesas estão maiores que as entradas no período analisado'
      );
    }

    if (hasNoIncome) {
      contextualAlerts.push(
        'existem saídas registradas sem entradas no período analisado'
      );
    }

    if (topExpense) {
      contextualAlerts.push(
        `o maior grupo de saída é ${topExpense.category}, com ${formatCurrency(topExpense.amount)}`
      );
    }

    if (secondExpense) {
      contextualAlerts.push(
        `o segundo maior grupo de saída é ${secondExpense.category}, com ${formatCurrency(secondExpense.amount)}`
      );
    }

let strategicReading = '';
let nextAction = '';

if (bestMatch.id.includes('fluxo')) {
  strategicReading = `
Minha leitura aplicada:
O fluxo de caixa do Bebcom mostra que o principal ponto de atenção está no equilíbrio entre compras, vencimentos e entradas da operação.

Quando compras acontecem antes da entrada do caixa, mesmo uma operação que vende bem pode ficar pressionada financeiramente.

O ideal é acompanhar diariamente:
• saldo disponível;
• contas próximas do vencimento;
• ritmo das compras;
• velocidade de entrada do caixa.
  `;

  nextAction = `
Próxima ação sugerida:
Revise os vencimentos dos próximos 7 dias e avalie se as compras atuais estão proporcionais ao ritmo de entrada do caixa.
  `;
}

else if (bestMatch.id.includes('ticket')) {
  strategicReading = `
Minha leitura aplicada:
O ticket médio melhora quando cada cliente compra mais na mesma visita ou pedido.

No Bebcom, isso pode ser trabalhado com:
• combos;
• kits;
• produtos complementares;
• upgrades;
• sugestões rápidas no delivery.

Pequenos aumentos no ticket médio geram impacto forte no faturamento total.
  `;

  nextAction = `
Próxima ação sugerida:
Escolha 3 produtos complementares e monte ofertas simples para estimular aumento do valor por pedido.
  `;
}

else if (bestMatch.id.includes('lucro')) {
  strategicReading = `
Minha leitura aplicada:
O lucro do Bebcom depende mais de margem, controle operacional e desperdício do que apenas de aumento de faturamento.

Hoje, o maior ponto de pressão está concentrado nas despesas operacionais e nas compras.

Melhorar resultado significa:
• comprar melhor;
• reduzir perdas;
• evitar desperdícios;
• fortalecer produtos mais rentáveis.
  `;

  nextAction = `
Próxima ação sugerida:
Analise os produtos com maior saída e identifique quais possuem melhor margem para aumentar foco comercial.
  `;
}

else if (bestMatch.id.includes('estoque')) {
  strategicReading = `
Minha leitura aplicada:
Estoque parado deve ser tratado como dinheiro parado.

Quando a empresa compra acima do giro real, o caixa perde força e a operação fica mais pressionada.

O ideal é:
• reduzir recompra de baixo giro;
• acelerar saída dos produtos parados;
• trabalhar promoções;
• revisar compras semanalmente.
  `;

  nextAction = `
Próxima ação sugerida:
Liste os produtos com menor saída e crie ações simples para transformar estoque parado em caixa.
  `;
}

else if (bestMatch.id.includes('delivery')) {
  strategicReading = `
Minha leitura aplicada:
No delivery, velocidade, praticidade e conveniência possuem grande impacto na recompra.

A operação do Bebcom pode crescer fortalecendo:
• combos;
• divulgação;
• rapidez;
• presença digital;
• facilidade de pedido.

Delivery forte é construído com recorrência e experiência.
  `;

  nextAction = `
Próxima ação sugerida:
Escolha um combo estratégico e trabalhe divulgação forte nos horários de maior movimento.
  `;
}

else if (bestMatch.id.includes('marketing')) {
  strategicReading = `
Minha leitura aplicada:
O marketing do Bebcom deve gerar desejo imediato e lembrança constante da marca.

O mais importante para o segmento é:
• presença nas redes sociais;
• ofertas frequentes;
• divulgação visual forte;
• campanhas simples;
• constância.

Marketing eficiente transforma conveniência em hábito de compra.
  `;

  nextAction = `
Próxima ação sugerida:
Defina uma campanha simples da semana com foco em giro, ticket médio ou delivery.
  `;
}

else if (bestMatch.id.includes('concorrencia')) {
  strategicReading = `
Minha leitura aplicada:
A melhor forma de enfrentar concorrência não é apenas baixar preço.

O Bebcom deve fortalecer:
• atendimento;
• rapidez;
• confiança;
• variedade;
• presença digital;
• conveniência.

Preço chama atenção. Experiência faz o cliente voltar.
  `;

  nextAction = `
Próxima ação sugerida:
Observe quais diferenciais o cliente mais percebe hoje e fortaleça isso na divulgação e operação.
  `;
}

else if (bestMatch.id.includes('compras')) {
  strategicReading = `
Minha leitura aplicada:
Compras organizadas ajudam diretamente o caixa, o estoque e a margem.

O principal erro operacional normalmente é comprar baseado em impulso e não em giro real.

Comprar melhor significa:
• acompanhar saída;
• evitar excesso;
• reforçar produtos fortes;
• preservar capital de giro.
  `;

  nextAction = `
Próxima ação sugerida:
Revise os produtos comprados recentemente e compare com o ritmo real de saída.
  `;
}

else if (bestMatch.id.includes('fornecedores')) {
  strategicReading = `
Minha leitura aplicada:
Negociação com fornecedores impacta diretamente fluxo de caixa e capacidade operacional.

Preço é importante, mas prazo e equilíbrio de compra também possuem grande peso financeiro.

A operação saudável compra com estratégia e não apenas por oportunidade.
  `;

  nextAction = `
Próxima ação sugerida:
Revise fornecedores com maior volume financeiro e avalie possibilidade de melhoria de prazo ou condição.
  `;
}

else if (bestMatch.id.includes('crescimento')) {
  strategicReading = `
Minha leitura aplicada:
Crescimento sustentável exige equilíbrio entre vendas, operação, margem e caixa.

Crescer sem controle pode aumentar faturamento e piorar resultado.

O ideal é:
• crescer mantendo margem;
• fortalecer recorrência;
• organizar operação;
• preservar caixa.
  `;

  nextAction = `
Próxima ação sugerida:
Escolha um único indicador principal para melhorar nos próximos 30 dias e acompanhe diariamente.
  `;
}

else {
  strategicReading = `
Minha leitura aplicada:
A decisão deve considerar caixa, comportamento das despesas, operação e momento financeiro da empresa.
  `;

  nextAction = `
Próxima ação sugerida:
Escolha uma melhoria prática e acompanhe o impacto nos números da operação.
  `;
}

    appliedContext = `

Aplicação prática no Bebcom:

No período analisado:
• Entradas: ${formatCurrency(ctx.totalIncome)}
• Saídas: ${formatCurrency(ctx.totalExpenses)}
• Saldo: ${formatCurrency(ctx.balance)}
• Contas a pagar pendentes/vencidas: ${formatCurrency(ctx.pendingPayable)}

Pontos que merecem atenção:
${
  contextualAlerts.length > 0
    ? contextualAlerts.map((item) => `• ${item}`).join('\n')
    : '• Não identifiquei alerta crítico nos dados atuais, mas vale acompanhar caixa, compras e vencimentos.'
}

${strategicReading.trim()}

${nextAction.trim()}
    `;
  }

  return `
${bestMatch.titulo}

${bestMatch.respostaBase}

${appliedContext}
  `.trim();
};

const buildTopExpensesAnswer = (ctx) => {
  const topExpenses = ctx.expenseCategories
    .slice(0, 5)
    .map(
      (item, index) =>
        `${index + 1}. ${item.category}: ${formatCurrency(item.amount)}`
    )
    .join('\n');

  return `
Maiores despesas de ${ctx.periodLabel}:

${topExpenses || 'Não encontrei despesas classificadas neste período.'}

Total de saídas: ${formatCurrency(ctx.totalExpenses)}

Minha leitura:
O maior ponto de atenção deve ser o grupo que mais consome caixa no período.
  `.trim();
};

const buildSupplierImpactAnswer = (ctx) => {
  const grouped = {};

  ctx.entries
    .filter(
      (entry) =>
        entry.type === 'expense' &&
        entry.category === 'compras_mercadorias'
    )
    .forEach((entry) => {
      const supplier = (entry.description || 'sem_fornecedor')
        .trim()
        .toLowerCase();

      if (!grouped[supplier]) {
        grouped[supplier] = 0;
      }

      grouped[supplier] += Math.abs(Number(entry.amount || 0));
    });

  const totals = Object.entries(grouped)
    .map(([supplier, amount]) => ({ supplier, amount }))
    .sort((a, b) => b.amount - a.amount);

  return `
Fornecedores com maior impacto em compras de mercadorias em ${ctx.periodLabel}:

${
  totals.length > 0
    ? totals
        .slice(0, 10)
        .map(
          (item, index) =>
            `${index + 1}. ${item.supplier}: ${formatCurrency(item.amount)}`
        )
        .join('\n')
    : 'Não encontrei compras de mercadorias com fornecedor na descrição neste período.'
}

Minha leitura:
Esse ranking mostra quais fornecedores mais impactaram o caixa dentro das compras de mercadorias.
  `.trim();
};

const buildCategoryTotalAnswer = (ctx, category) => {
  const entries = ctx.entries.filter(
    (entry) =>
      entry.type === 'expense' &&
      entry.category === category
  );

  const total = entries.reduce(
    (acc, entry) => acc + Math.abs(Number(entry.amount || 0)),
    0
  );

  return `
Total de despesas com ${category.replace('_', ' ')} em ${ctx.periodLabel}:

${formatCurrency(total)}

Quantidade de lançamentos:
${entries.length}

Minha leitura:
Esse valor representa o impacto financeiro da categoria ${category.replace('_', ' ')} dentro da operação.
  `.trim();
};

const buildSupplierTotalAnswer = (
  ctx,
  supplier
) => {
  const entries = ctx.entries.filter(
  (entry) =>
    entry.type === 'expense' &&
    (entry.description || '')
      .toLowerCase()
      .includes(supplier)
);

  const total = entries.reduce(
    (acc, entry) =>
      acc + Math.abs(Number(entry.amount || 0)),
    0
  );

  return `
Total gasto com ${supplier} em ${ctx.periodLabel}:

${formatCurrency(total)}

Quantidade de lançamentos:
${entries.length}

Minha leitura:
Esse fornecedor possui impacto financeiro relevante dentro das compras de mercadorias.
  `.trim();
};

const getAnalyticalPeriod = (question) => {
  const lower = question.toLowerCase();
  const now = new Date();

  if (
    lower.includes('esse ano') ||
    lower.includes('este ano') ||
    lower.includes('ano atual')
  ) {
    const year = now.getFullYear();

    return {
      label: `${year}`,
      month: null,
      year,
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }

  const detectedMonths = [];

  monthNames.forEach((item) => {
    item.names.forEach((name) => {
      const regex = new RegExp(`\\b${name}\\b`, 'i');

      if (regex.test(lower)) {
        detectedMonths.push(item.number);
      }
    });
  });

  if (
    detectedMonths.length >= 2 &&
    (lower.includes(' a ') || lower.includes(' até ') || lower.includes(' ate '))
  ) {
    const yearMatch = lower.match(/\b(20\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : now.getFullYear();

    const startMonth = Math.min(...detectedMonths);
    const endMonth = Math.max(...detectedMonths);

    return {
      label: `${getMonthLabel(startMonth, year)} a ${getMonthLabel(endMonth, year)}`,
      month: null,
      year,
      start: new Date(year, startMonth - 1, 1),
      end: new Date(year, endMonth, 0, 23, 59, 59, 999),
    };
  }

  return null;
};

const detectAdvancedIntent = (question) => {
  const lower = question.toLowerCase();

  if (
    lower.includes('resumo executivo') ||
    lower.includes('panorama executivo')
  ) return 'executive_summary';

  if (
    lower.includes('insight') ||
    lower.includes('percepção') ||
    lower.includes('percepcao') ||
    lower.includes('o que você acha') ||
    lower.includes('o que acha')
  ) return 'insights';

  if (
  lower.includes('oportunidade') ||
  lower.includes('maior oportunidade') ||
  lower.includes('onde devo focar') ||
  lower.includes('gargalo') ||
  lower.includes('o que pode melhorar') ||
  lower.includes('ação gera maior impacto') ||
  lower.includes('acao gera maior impacto') ||
  lower.includes('qual oportunidade') ||
  lower.includes('onde está a oportunidade') ||
  lower.includes('onde esta a oportunidade')
) return 'opportunity';

  if (
  lower.includes('sazonalidade') ||
  lower.includes('sazonal') ||
  lower.includes('meses mais fortes') ||
  lower.includes('meses mais fracos') ||
  lower.includes('qual mês vende mais') ||
  lower.includes('qual mes vende mais') ||
  lower.includes('qual mês vende menos') ||
  lower.includes('qual mes vende menos') ||
  lower.includes('quando devo comprar mais estoque') ||
  lower.includes('quando devo comprar mais') ||
  lower.includes('quando devo ser mais conservador') ||
  lower.includes('período tende a vender mais') ||
  lower.includes('quais meses são mais fortes') ||
  lower.includes('quais meses sao mais fortes') ||
  lower.includes('quais meses são mais fracos') ||
  lower.includes('quais meses sao mais fracos') ||
  lower.includes('meses são mais fortes') ||
  lower.includes('meses sao mais fortes') ||
  lower.includes('meses são mais fracos') ||
  lower.includes('meses sao mais fracos') ||
  lower.includes('periodo tende a vender mais')
 ) return 'seasonality';

  if (
  lower.includes('histórico') ||
  lower.includes('historico') ||
  lower.includes('últimos meses') ||
  lower.includes('ultimos meses') ||
  lower.includes('vem acontecendo') ||
  lower.includes('isso é recorrente') ||
  lower.includes('isso e recorrente') ||
  lower.includes('problema é recorrente') ||
  lower.includes('problema e recorrente') ||
  lower.includes('recorrente') ||
  lower.includes('isso se repete') ||
  lower.includes('vem se repetindo') ||
  lower.includes('padrão histórico') ||
  lower.includes('padrao historico') ||
  lower.includes('padrões operacionais') ||
  lower.includes('padroes operacionais') ||
  lower.includes('quais padrões') ||
  lower.includes('quais padroes') ||
  lower.includes('o que vem se repetindo') ||
  lower.includes('pressão recorrente') ||
  lower.includes('pressao recorrente') ||
  lower.includes('ao longo dos meses')
) return 'historical_memory';

  if (
  lower.includes('score histórico') ||
  lower.includes('score historico') ||
  lower.includes('evolução do score') ||
  lower.includes('evolucao do score') ||
  lower.includes('nossa nota melhorou') ||
  lower.includes('o score melhorou') ||
  lower.includes('estamos mais saudáveis') ||
  lower.includes('estamos mais saudaveis') ||
  lower.includes('como evoluiu o score')
) return 'score_evolution';

  if (
  lower.includes('estamos evoluindo') ||
  lower.includes('estamos melhorando') ||
  lower.includes('estamos piorando') ||
  lower.includes('empresa está mais saudável') ||
  lower.includes('empresa esta mais saudavel') ||
  lower.includes('situação melhorou') ||
  lower.includes('situacao melhorou') ||
  lower.includes('situação piorou') ||
  lower.includes('situacao piorou') ||
  lower.includes('ao longo dos meses') ||
  lower.includes('situação melhorou') ||
  lower.includes('situacao melhorou') ||
  lower.includes('situação piorou') ||
  lower.includes('situacao piorou') ||
  lower.includes('ao longo dos meses')
) return 'historical_evolution';

 if (
  lower.includes('tendência') ||
  lower.includes('tendencia') ||
  lower.includes('o que mudou') ||
  lower.includes('melhorou ou piorou') ||
  lower.includes('resultado piorou') ||
  lower.includes('resultado melhorou') ||
  lower.includes('evoluiu') ||
  lower.includes('evolução') ||
  lower.includes('evolucao') ||
  lower.includes('pressão financeira') ||
  lower.includes('pressao financeira') ||
  lower.includes('contas pendentes cresceram') ||
  lower.includes('demonstra recuperação') ||
  lower.includes('demonstra recuperacao') ||
  lower.includes('estamos evoluindo') ||
  lower.includes('crescendo de forma saudável') ||
  lower.includes('crescendo de forma saudavel') ||
  lower.includes('amadurecendo') ||
  lower.includes('pressionando') ||
  lower.includes('vem piorando') ||
  lower.includes('situação vem piorando') ||
  lower.includes('situacao vem piorando')
) return 'trends';

if (
  lower.includes('empresa fosse sua') ||
  lower.includes('no meu lugar') ||
  lower.includes('caminho certo') ||
  lower.includes('maior preocupação') ||
  lower.includes('maior preocupacao') ||
  lower.includes('o que te preocupa') ||
  lower.includes('o que te incomoda') ||
  lower.includes('acredita no futuro') ||
  lower.includes('futuro da empresa') ||
  lower.includes('crescendo de forma saudável') ||
  lower.includes('crescendo de forma saudavel') ||
  lower.includes('expandiria') ||
  lower.includes('abriria outra unidade') ||
  lower.includes('segunda unidade') ||
  lower.includes('qual oportunidade') ||
  lower.includes('que oportunidade') ||
  lower.includes('qual conselho') ||
  lower.includes('que conselho')
) return 'president_decision';

  if (
    lower.includes('risco') ||
    lower.includes('principal problema') ||
    lower.includes('alerta') ||
    lower.includes('preocupa')
  ) return 'risk';

  if (
    lower.includes('prioridade') ||
    lower.includes('onde focar') ||
    lower.includes('focaria') ||
    lower.includes('o que fazer primeiro')
  ) return 'priority';

  if (
    lower.includes('educacional') ||
    lower.includes('me explique') ||
    lower.includes('o que significa') ||
    lower.includes('como funciona')
  ) return 'educational';

 if (
  lower.includes('dias mais fortes') ||
  lower.includes('dias mais fracos') ||
  lower.includes('parecem mais fortes') ||
  lower.includes('parecem mais fracos') ||
  lower.includes('dia forte') ||
  lower.includes('dia fraco') ||
  lower.includes('comportamento operacional') ||
  lower.includes('acelerou') ||
  lower.includes('desacelerou') ||
  lower.includes('ritmo operacional')
) return 'operational_behavior';

  if (
  lower.includes('quanto preciso vender') ||
  lower.includes('quanto preciso crescer') ||
  lower.includes('quanto posso comprar') ||
  lower.includes('e se eu reduzir compras') ||
  lower.includes('e se aumentar ticket') ||
  lower.includes('simulação') ||
  lower.includes('projeção') ||
  lower.includes('projecao')
) return 'strategic_simulation';

  if (
  lower.includes('empresa fosse sua') ||
  lower.includes('no meu lugar') ||
  lower.includes('caminho certo') ||
  lower.includes('maior preocupação') ||
  lower.includes('maior preocupacao') ||
  lower.includes('o que te preocupa') ||
  lower.includes('o que te incomoda') ||
  lower.includes('acredita no futuro') ||
  lower.includes('futuro da empresa') ||
  lower.includes('crescendo de forma saudável') ||
  lower.includes('crescendo de forma saudavel') ||
  lower.includes('expandiria') ||
  lower.includes('abriria outra unidade') ||
  lower.includes('segunda unidade') ||
  lower.includes('qual oportunidade') ||
  lower.includes('que oportunidade') ||
  lower.includes('qual conselho') ||
  lower.includes('que conselho')
) return 'president_decision';

  if (
  lower.includes('vale a pena') ||
  lower.includes('você abriria') ||
  lower.includes('voce abriria') ||
  lower.includes('você contrataria') ||
  lower.includes('voce contrataria') ||
  lower.includes('o que faria no meu lugar') ||
  lower.includes('a situação é preocupante') ||
  lower.includes('a situacao é preocupante') ||
  lower.includes('a situacao e preocupante') ||
  lower.includes('devo investir')
) return 'executive_decision';

if (
  lower.includes('plano de ação') ||
  lower.includes('plano de acao') ||
  lower.includes('o que devo fazer agora') ||
  lower.includes('qual sua recomendação') ||
  lower.includes('qual sua recomendacao') ||
  lower.includes('próximos passos') ||
  lower.includes('proximos passos') ||
  lower.includes('proximo passo')
) return 'action_plan';

if (
  lower.includes('meta inteligente') ||
  lower.includes('minha meta principal') ||
  lower.includes('qual meta devo perseguir') ||
  lower.includes('qual meta devo buscar') ||
  lower.includes('qual objetivo da semana') ||
  lower.includes('qual objetivo do mês') ||
  lower.includes('qual objetivo do mes') ||
  lower.includes('qual objetivo hoje') ||
  lower.includes('objetivo hoje') ||
  lower.includes('meta diária') ||
  lower.includes('meta diaria') ||
  lower.includes('meta semanal') ||
  lower.includes('meta mensal') ||
  lower.includes('que meta você definiria') ||
  lower.includes('que meta voce definiria')
) return 'smart_goal';

if (
  lower.includes('plano') ||
  lower.includes('o que devo fazer') ||
  lower.includes('como recuperar') ||
  lower.includes('como melhorar') ||
  lower.includes('qual meta') ||
  lower.includes('qual estratégia') ||
  lower.includes('qual estrategia') ||
  lower.includes('planejamento')
) return 'operational_plan';

  return 'general';
};

const buildAdvancedIntentAnswer = ({
  intent,
  question,
  ctx,
  previousCtx,
  analyticalInsights,
  operationalTrends,
  temporalMemories,
  operationalBehavior,
  strategicRecommendations,
  operationalPlan,
  strategicSimulations,
  executiveDecisions,
  executiveMemory,
  historicalMemory,
  seasonalityAnalysis,
  opportunityAnalysis,
  executiveResponseStyle,
  actionPlan,
  smartGoal,
  presidentDecision,
  operationalPriorities,
  operationalAlerts,
  operationalScore,
}) => {
  const mainIndicator = buildMainOperationalIndicator(ctx);

  if (intent === 'executive_summary') {
    return `
Resumo executivo do Bebcom — ${ctx.periodLabel}

Indicador principal:
${mainIndicator}

Números principais:
• Entradas: ${formatCurrency(ctx.totalIncome)}
• Saídas: ${formatCurrency(ctx.totalExpenses)}
• Saldo: ${formatCurrency(ctx.balance)}
• Contas pendentes: ${formatCurrency(ctx.pendingPayable)}

Prioridades:
${
  operationalPriorities.length > 0
    ? operationalPriorities.map((item, index) => `${index + 1}. ${item.message}`).join('\n')
    : 'Nenhuma prioridade crítica identificada.'
}

Recomendações estratégicas:
${
  strategicRecommendations.length > 0
    ? strategicRecommendations
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhuma recomendação estratégica relevante identificada.'
}

Memória executiva:
${
  executiveMemory &&
  executiveMemory.length > 0
    ? executiveMemory
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Ainda não há histórico suficiente para leitura executiva contínua.'
}

Minha percepção estratégica:
O Bebcom possui movimentação relevante, mas o foco agora deve ser equilibrar compras, caixa e despesas para proteger a margem operacional.
    `.trim();
  }

  if (intent === 'insights') {
    return `
Minha percepção gerencial sobre ${ctx.periodLabel}:

${mainIndicator}

Insights identificados:
${
  analyticalInsights.length > 0
    ? analyticalInsights.map((item) => `• ${item}`).join('\n')
    : '• Não identifiquei insight crítico além dos indicadores atuais.'
}

Minha leitura:
A operação não parece fraca em volume, mas exige atenção no equilíbrio entre faturamento, compras e geração real de caixa.

Ação sugerida:
Acompanhar diariamente compras de mercadorias, saldo disponível e contas pendentes.
    `.trim();
  }

if (intent === 'score_evolution') {
  const evolution = historicalMemory?.scoreEvolution;

  return `
Score histórico evolutivo — ${ctx.periodLabel}

Tendência:
${evolution?.trend || 'Indefinida'}

Histórico de score:
${
  evolution?.scores?.length > 0
    ? evolution.scores
        .map(
          (item) =>
            `• ${item.period}: ${item.score}/100`
        )
        .join('\n')
    : 'Ainda não há histórico suficiente.'
}

Minha leitura:
${evolution?.summary || 'Ainda não há histórico suficiente para avaliar evolução do score.'}

Confiança:
${historicalMemory?.confidence || 'Baixa'}

Conclusão:
O score histórico ajuda a medir se a saúde operacional está evoluindo, piorando ou permanecendo estável ao longo dos períodos.
  `.trim();
}

if (intent === 'historical_evolution') {
  const evolution = historicalMemory?.executiveEvolution;

  return `
Evolução executiva multiperíodo — ${ctx.periodLabel}

Períodos analisados:
${historicalMemory?.periodsAnalyzed || 0}

Confiança da leitura:
${historicalMemory?.confidence || 'Baixa'}

Status:
${evolution?.status || 'Indefinido'}

Sinais identificados:
${
  evolution?.signals && evolution.signals.length > 0
    ? evolution.signals.map((item) => `• ${item}`).join('\n')
    : 'Ainda não há sinais históricos suficientes para avaliar evolução.'
}

Minha leitura executiva:
${evolution?.summary || 'Ainda não há histórico suficiente para avaliar evolução executiva com segurança.'}

Força do padrão:
${historicalMemory?.patternStrength || 'Insuficiente'}

Conclusão:
Com mais períodos alimentados, a IA Bebcom poderá avaliar com mais precisão se a empresa está melhorando, piorando ou passando por ajuste temporário.
  `.trim();
}

if (intent === 'opportunity') {
  return `
Oportunidades identificadas — ${ctx.periodLabel}

Maior oportunidade:
${opportunityAnalysis?.mainOpportunity?.title || 'Não identificada'}

Descrição:
${opportunityAnalysis?.mainOpportunity?.description || ''}

Outras oportunidades:
${
  opportunityAnalysis?.opportunities?.length > 0
    ? opportunityAnalysis.opportunities
        .slice(1)
        .map(
          (item) =>
            `• ${item.title}: ${item.description}`
        )
        .join('\n')
    : 'Nenhuma oportunidade adicional identificada.'
}

Minha leitura:
A melhor oportunidade é aquela que gera impacto relevante sem aumentar risco financeiro ou operacional.

Conclusão:
A IA Bebcom considera essa a ação com maior potencial de melhorar resultado, caixa ou eficiência neste momento.
  `.trim();
}

if (intent === 'seasonality') {
  return `
Sazonalidade operacional — ${ctx.periodLabel}

Confiança da leitura:
${seasonalityAnalysis?.confidence || 'Baixa'}

Períodos analisados:
${seasonalityAnalysis?.totalPeriods || 0}

Meses mais fortes:
${
  seasonalityAnalysis?.strongestMonths?.length > 0
    ? seasonalityAnalysis.strongestMonths
        .map(
          (item, index) =>
            `${index + 1}. ${item.period}: ${formatCurrency(item.income)}`
        )
        .join('\n')
    : 'Ainda não há meses suficientes para identificar os mais fortes.'
}

Meses mais fracos:
${
  seasonalityAnalysis?.weakestMonths?.length > 0
    ? seasonalityAnalysis.weakestMonths
        .map(
          (item, index) =>
            `${index + 1}. ${item.period}: ${formatCurrency(item.income)}`
        )
        .join('\n')
    : 'Ainda não há meses suficientes para identificar os mais fracos.'
}

Minha leitura:
${seasonalityAnalysis?.reading || 'Ainda não há sazonalidade suficiente para análise confiável.'}

Recomendação:
${seasonalityAnalysis?.recommendation || 'Alimente mais meses para melhorar a leitura sazonal.'}
  `.trim();
}

 if (intent === 'historical_memory') {
  return `
Memória histórica multiperíodo — ${ctx.periodLabel}

Períodos analisados:
${historicalMemory?.periodsAnalyzed || 0}

Confiança da leitura:
${historicalMemory?.confidence || 'Baixa'}

Força do padrão:
${historicalMemory?.patternStrength || 'Insuficiente'}

Direção histórica:
${historicalMemory?.direction || 'Histórico insuficiente'}

Leitura histórica:
${
  historicalMemory?.memories && historicalMemory.memories.length > 0
    ? historicalMemory.memories.map((item) => `• ${item}`).join('\n')
    : 'Ainda não há histórico suficiente para identificar padrões consistentes.'
}

Minha interpretação:
A memória histórica ajuda a entender se o cenário atual é um fato isolado ou parte de um comportamento recorrente da operação.

Conclusão:
${historicalMemory?.conclusion || 'Quanto mais meses forem alimentados no sistema, mais confiável será a leitura histórica.'}
  `.trim();
}
  if (intent === 'trends') {
    if (
  executiveResponseStyle ===
  'executive_short'
) {
  return `
Minha percepção:

${
  executiveMemory &&
  executiveMemory.length > 0
    ? executiveMemory
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Ainda não há histórico suficiente para uma leitura executiva contínua.'
}

Os principais pontos que mais chamam atenção hoje são:
• pressão operacional
• compras elevadas
• necessidade de preservar caixa

Minha posição:
Eu focaria primeiro em recuperar equilíbrio financeiro antes de acelerar crescimento.
  `.trim();
}
    
    return `
Tendências operacionais de ${ctx.periodLabel}:

${
  operationalTrends.length > 0
    ? operationalTrends.map((item) => `• ${item}`).join('\n')
    : 'Ainda não identifiquei tendência operacional relevante no comparativo atual.'
}

${
  temporalMemories.length > 0
    ? `
Memória operacional:
${temporalMemories
  .map((item) => `• ${item}`)
  .join('\n')}
`
    : ''
}

Comportamento operacional:
${
  operationalBehavior && operationalBehavior.length > 0
    ? operationalBehavior.map((item) => `• ${item}`).join('\n')
    : 'Ainda não identifiquei padrão operacional suficiente neste período.'
}

Memória executiva:
${
  executiveMemory &&
  executiveMemory.length > 0
    ? executiveMemory
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Ainda não há histórico suficiente para leitura executiva contínua.'
}

Minha interpretação:
${mainIndicator}

Conclusão:
O ponto mais importante é observar se a operação está crescendo com equilíbrio ou apenas movimentando mais dinheiro com pressão no caixa.
    `.trim();
  }

  if (intent === 'operational_behavior') {
return `
Comportamento operacional de ${ctx.periodLabel}:

${
  operationalBehavior && operationalBehavior.length > 0
    ? operationalBehavior
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Ainda não identifiquei padrão operacional suficiente neste período.'
}

Minha leitura:
O comportamento operacional ajuda a entender ritmo de vendas, concentração financeira e pressão de caixa ao longo do período.

Conclusão:
Esses padrões ajudam a identificar dias fortes, aceleração da operação e momentos de maior pressão financeira.
  `.trim();
}

 if (intent === 'president_decision') {
  return `
Diretor Presidente IA — ${ctx.periodLabel}

${presidentDecision.headline}

Tom da análise:
${presidentDecision.tone}

Minha resposta direta:
${presidentDecision.directAnswer}

Minha maior preocupação:
${
  presidentDecision.concerns.length > 0
    ? presidentDecision.concerns
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhuma preocupação crítica identificada.'
}

Oportunidades identificadas:
${
  presidentDecision.opportunities.length > 0
    ? presidentDecision.opportunities
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhuma oportunidade relevante identificada.'
}

Nível de confiança:
${presidentDecision.confidence}

Minha posição final:
${presidentDecision.conclusion}

Próxima decisão que eu tomaria:
${smartGoal?.mainGoal || 'Preservar caixa e fortalecer a operação.'}
  `.trim();
}

  if (intent === 'strategic_simulation') {
  return `
Simulação estratégica do Bebcom — ${ctx.periodLabel}

Projeções identificadas:
${
  strategicSimulations &&
  strategicSimulations.length > 0
    ? strategicSimulations
        .map((item) => `• ${item.message}`)
        .join('\n')
    : 'Nenhuma simulação estratégica relevante identificada.'
}

Minha visão:
A simulação estratégica ajuda a visualizar metas possíveis, equilíbrio financeiro e impacto operacional antes da tomada de decisão.

Conclusão:
O foco principal deve ser crescer preservando caixa, margem e equilíbrio entre compras e faturamento.
  `.trim();
}

  if (intent === 'action_plan') {
  return `
Plano de ação automático — ${ctx.periodLabel}

Foco principal:
${actionPlan?.focus || 'Manter equilíbrio operacional'}

Urgência:
${actionPlan?.urgency || 'Baixa'}

Ações recomendadas:
${
  actionPlan?.actions && actionPlan.actions.length > 0
    ? actionPlan.actions
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n')
    : 'Nenhuma ação crítica identificada para este período.'
}

Meta sugerida:
${actionPlan?.target || 'Manter crescimento com equilíbrio'}

Minha visão:
Eu executaria essas ações antes de pensar em expansão, novas compras ou investimentos.

Conclusão:
O objetivo do plano é transformar a análise da IA em ações práticas para proteger caixa, melhorar giro e fortalecer a operação.
  `.trim();
}

  if (intent === 'smart_goal') {
  return `
Meta inteligente — ${ctx.periodLabel}

Horizonte:
${smartGoal?.period || 'curto prazo'}

Meta principal:
${smartGoal?.mainGoal || 'Manter crescimento com equilíbrio operacional.'}

Meta financeira:
${smartGoal?.financialGoal || 'Preservar caixa e manter despesas proporcionais às entradas.'}

Meta operacional:
${smartGoal?.operationalGoal || 'Manter giro saudável, controle de compras e estabilidade operacional.'}

Indicador de sucesso:
${smartGoal?.successIndicator || 'Manter score operacional saudável.'}

Minha visão:
A meta mais importante agora deve atacar o principal gargalo da operação, sem criar nova pressão financeira.

Conclusão:
A IA Bebcom deve usar essa meta como referência para orientar compras, despesas, ações comerciais e decisões dos próximos dias.
  `.trim();
}

  if (intent === 'operational_plan') {
  return `
Planejamento operacional do Bebcom — ${ctx.periodLabel}

Plano recomendado:
${
  operationalPlan && operationalPlan.length > 0
    ? operationalPlan
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n')
    : 'Nenhum plano operacional relevante identificado.'
}

Minha visão estratégica:
O objetivo principal agora deve ser preservar caixa, melhorar eficiência operacional e aumentar resultado sem elevar pressão financeira.

Meta operacional sugerida:
Buscar crescimento com equilíbrio entre vendas, compras e geração de caixa.

Minha posição:
Eu priorizaria decisões que aumentem giro, reduzam pressão financeira e fortaleçam os dias mais fortes da operação.
  `.trim();
}

  if (intent === 'risk') {
    return `
Principais riscos operacionais em ${ctx.periodLabel}:

${
  operationalAlerts.length > 0
    ? operationalAlerts.map((alert) => `⚠️ ${alert.message}`).join('\n')
    : 'Nenhum alerta operacional crítico identificado.'
}

Risco principal:
${mainIndicator}

Minha posição:
Eu trataria esse ponto como prioridade gerencial antes de assumir novas compras, investimentos ou despesas não essenciais.
    `.trim();
  }

if (intent === 'priority') {
  return `
Prioridades gerenciais do Bebcom em ${ctx.periodLabel}:

${
  operationalPriorities.length > 0
    ? operationalPriorities
        .map((item, index) => `${index + 1}. ${item.message}`)
        .join('\n')
    : 'Nenhuma prioridade crítica identificada.'
}

Recomendações estratégicas:
${
  strategicRecommendations.length > 0
    ? strategicRecommendations
        .map((item) => `• ${item}`)
        .join('\n')
    : 'Nenhuma recomendação estratégica relevante identificada.'
}

Onde eu focaria primeiro:
${mainIndicator}

Próxima ação prática:
Definir uma meta simples para os próximos dias: reduzir pressão de compras, preservar caixa e acompanhar vencimentos próximos.
  `.trim();
}

  return null;
};

const buildConversationalContext = ({
  question,
  intent,
  ctx,
  mainIndicator,
  executiveDecisions,
  strategicRecommendations,
}) => {
  const lower = question.toLowerCase();

  const isFollowUp =
  lower.startsWith('e ') ||
  lower.startsWith('e se') ||
  lower.startsWith('nesse caso') ||
  lower.startsWith('neste caso') ||
  lower.includes('e contratar') ||
  lower.includes('e contratação') ||
  lower.includes('e contratacao') ||
  lower.includes('e compra') ||
  lower.includes('e comprar') ||
  lower.includes('e compras') ||
  lower.includes('e mercadorias') ||
  lower.includes('comprar mais mercadorias') ||
  lower.includes('e investimento') ||
  lower.includes('nesse caso') ||
  lower.includes('neste caso') ||
  lower.includes('então') ||
  lower.includes('entao') ||
  lower.includes('por esse motivo') ||
  lower.includes('seguindo essa linha') ||
  lower.includes('o que você faria') ||
  lower.includes('o que voce faria');
  if (!isFollowUp || !lastIAContext) {
    return null;
  }

  if (
    lastIAContext.intent === 'executive_decision' ||
    lastIAContext.intent === 'operational_plan' ||
    lastIAContext.intent === 'strategic_simulation'
  ) {
    return `
Complementando a análise anterior:

Pelo mesmo cenário identificado em ${ctx.periodLabel}, eu manteria cautela.

Motivo principal:
${mainIndicator}

Minha posição:
${
  executiveDecisions && executiveDecisions.length > 0
    ? executiveDecisions.slice(0, 2).map((item) => `• ${item}`).join('\n')
    : strategicRecommendations && strategicRecommendations.length > 0
      ? strategicRecommendations.slice(0, 2).map((item) => `• ${item}`).join('\n')
      : 'Eu priorizaria preservar caixa antes de assumir novas decisões operacionais.'
}

Conclusão:
A decisão deve continuar alinhada com recuperação de caixa, controle de compras e redução de pressão operacional.
    `.trim();
  }

  return null;
};

const buildActionPlan = (
  ctx,
  operationalScore,
  operationalPriorities,
  strategicRecommendations
) => {

  const actions = [];

  let focus =
    'Manter crescimento sustentável';

  let urgency = 'Baixa';

  // Score crítico
  if (operationalScore.score < 60) {
    urgency = 'Alta';
  }

  if (ctx.balance < 0) {
    focus = 'Recuperação de caixa';

    actions.push(
      'Suspender despesas não essenciais.'
    );

    actions.push(
      'Priorizar geração imediata de caixa.'
    );
  }

  const purchases =
    ctx.expenseCategories.find(
      item =>
        item.category ===
        'compras_mercadorias'
    );

  if (
    purchases &&
    ctx.totalIncome > 0
  ) {
    const share =
      (purchases.amount /
        ctx.totalIncome) *
      100;

    if (share > 70) {
      actions.push(
        'Reduzir temporariamente compras.'
      );

      actions.push(
        'Aumentar giro do estoque atual.'
      );
    }
  }

  if (
    ctx.pendingPayable >
    ctx.totalIncome * 0.4
  ) {
    actions.push(
      'Monitorar vencimentos diariamente.'
    );
  }

  return {
    focus,
    urgency,
    actions,
    target:
      ctx.balance < 0
        ? `Eliminar saldo negativo de ${formatCurrency(
            Math.abs(ctx.balance)
          )}`
        : 'Manter crescimento com equilíbrio',
  };
};

const detectPresidentStyle = (question) => {
  const lower = question.toLowerCase();

  if (
    lower.includes('futuro') ||
    lower.includes('caminho certo') ||
    lower.includes('onde podemos chegar') ||
    lower.includes('potencial')
  ) return 'visionary';

  if (
    lower.includes('segunda unidade') ||
    lower.includes('expandiria') ||
    lower.includes('abriria') ||
    lower.includes('contrataria') ||
    lower.includes('investiria') ||
    lower.includes('vale investir')
  ) return 'conservative';

  if (
    lower.includes('preocupação') ||
    lower.includes('preocupacao') ||
    lower.includes('preocupa') ||
    lower.includes('incomoda') ||
    lower.includes('maior receio') ||
    lower.includes('pior número') ||
    lower.includes('pior numero')
  ) return 'critical';

  if (
    lower.includes('oportunidade') ||
    lower.includes('ponto positivo') ||
    lower.includes('lado bom')
  ) return 'opportunity';

  if (
    lower.includes('conselho') ||
    lower.includes('meu lugar') ||
    lower.includes('empresa fosse sua') ||
    lower.includes('o que faria')
  ) return 'mentor';

  return 'default';
};

const buildPresidentDecision = (
  ctx,
  operationalScore,
  operationalAlerts,
  strategicRecommendations,
  smartGoal,
  presidentStyle = 'default'
) => {
  const concerns = [];
  const opportunities = [];

  if (ctx.balance < 0) {
    concerns.push(
      `O caixa apresenta saldo negativo de ${formatCurrency(Math.abs(ctx.balance))}.`
    );
  }

  if (ctx.pendingPayable > ctx.totalIncome * 0.3) {
    concerns.push(
      'As contas pendentes representam pressão financeira relevante.'
    );
  }

  if (operationalScore.score < 70) {
    concerns.push(
      'A saúde operacional ainda não atingiu um nível confortável.'
    );
  }

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (purchases && ctx.totalIncome > 0) {
    const purchaseShare = (purchases.amount / ctx.totalIncome) * 100;

    if (purchaseShare > 70) {
      concerns.push(
        `As compras representam ${purchaseShare.toFixed(1)}% das entradas, pressionando a geração de caixa.`
      );
    }
  }

  if (ctx.totalIncome > 50000) {
    opportunities.push(
      'A operação possui volume financeiro suficiente para crescer após estabilização.'
    );
  }

  if (getInventoryEstimatedPosition(ctx) > 0) {
  opportunities.push(
    'Existe posição estimada de estoque para gerar caixa sem necessidade imediata de novas compras.'
  );
}

  let headline = 'Minha leitura presidencial';
  let tone = 'equilibrado';
  let conclusion =
    ctx.balance < 0
      ? 'Minha prioridade absoluta seria recuperar caixa antes de acelerar crescimento.'
      : 'Eu focaria em crescimento sustentável preservando margem e geração de caixa.';

  let directAnswer =
    'Eu tomaria decisões focadas em preservar caixa, fortalecer margem e preparar a empresa para crescimento sustentável.';

  if (presidentStyle === 'visionary') {
    headline = 'Minha visão sobre o futuro da empresa';
    tone = 'estratégico e otimista com cautela';

    directAnswer =
      'Sim, eu vejo potencial real na operação. O Bebcom já demonstra capacidade de movimentação financeira relevante. O ponto principal agora é transformar esse volume em caixa saudável e previsível.';

    conclusion =
      'Eu acredito no futuro da empresa, mas só aceleraria crescimento depois de recuperar previsibilidade financeira.';
  }

  if (presidentStyle === 'conservative') {
    headline = 'Minha posição sobre expansão ou novos compromissos';
    tone = 'conservador e prudente';

    directAnswer =
      'Hoje eu não expandiria. Antes de abrir nova unidade, contratar ou assumir novos compromissos, eu provaria que a operação atual consegue gerar caixa positivo com compras controladas.';

    conclusion =
      'Expandir uma operação pressionada pode ampliar os problemas existentes. Primeiro eu estabilizaria caixa, margem e compras.';
  }

  if (presidentStyle === 'critical') {
    headline = 'O que mais me preocupa nos números';
    tone = 'crítico e direto';

    directAnswer =
      'O que mais me incomoda não é o faturamento. É o fato de a operação movimentar dinheiro, mas ainda terminar com caixa negativo e forte pressão de compras.';

    conclusion =
      'Eu investigaria primeiro compras, margem e giro, porque esses três pontos parecem estar segurando a geração real de caixa.';
  }

  if (presidentStyle === 'opportunity') {
    headline = 'Onde eu vejo oportunidade agora';
    tone = 'orientado a oportunidade';

    directAnswer =
      'A maior oportunidade está em transformar o estoque atual em caixa, vender melhor os produtos já comprados e aumentar giro sem criar novas despesas.';

    conclusion =
      'Eu buscaria crescimento usando melhor o que a empresa já possui, antes de colocar mais dinheiro em compras ou expansão.';
  }

  if (presidentStyle === 'mentor') {
    headline = 'O que eu faria no seu lugar';
    tone = 'mentor executivo';

    directAnswer =
      'Se eu estivesse no seu lugar, passaria os próximos dias focado em três pontos: recuperar caixa, reduzir compras temporariamente e acelerar o giro do estoque atual.';

    conclusion =
      'Crescimento pode esperar alguns dias. Caixa não. Eu primeiro recuperaria controle financeiro para depois voltar a acelerar.';
  }

  return {
    style: presidentStyle,
    headline,
    tone,
    directAnswer,
    concerns,
    opportunities,
    conclusion,
    confidence: 'Moderada',
  };
};

const buildHistoricalContexts = async (basePeriod, monthsBack = 6) => {
  const contexts = [];

  if (!basePeriod?.month || !basePeriod?.year) {
    return contexts;
  }

  for (let i = 1; i <= monthsBack; i++) {
    const date = new Date(basePeriod.year, basePeriod.month - 1 - i, 1);

    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const period = {
      month,
      year,
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59, 999),
    };

    const ctx = await buildContext(period);

    contexts.push(ctx);
  }

  return contexts;
};

const buildHistoricalMemory = (currentCtx, historicalContexts = []) => {
  const validPeriods = historicalContexts.filter(
    (ctx) =>
      ctx &&
      ctx.entries &&
      ctx.entries.length > 0 &&
      ctx.totalIncome > 0
  );

  const allPeriods = [currentCtx, ...validPeriods].filter(
    (ctx) => ctx && ctx.totalIncome > 0
  );

  const scoreHistory = allPeriods.map((ctx) => ({
  period: ctx.periodLabel,
  score: buildOperationalScore(ctx, ctx).score,
}));

  const memories = [];

  if (allPeriods.length < 2) {
    return {
      available: false,
      periodsAnalyzed: allPeriods.length,
      confidence: 'Baixa',
      direction: 'Histórico insuficiente',
      patternStrength: 'Insuficiente',
      executiveEvolution: {
  status: 'Indefinido',
  summary:
    'Ainda não há histórico suficiente para avaliar evolução executiva com segurança.',
  signals: [],
},
      scoreEvolution: {
  trend: 'Indefinida',
  summary:
    'Ainda não há histórico suficiente para avaliar evolução do score.',
  scores: [],
},
      memories: [
        'Ainda não há períodos históricos suficientes para identificar padrões multiperíodo.',
      ],
      conclusion:
        'Com mais meses lançados, a IA conseguirá diferenciar problema isolado de padrão operacional recorrente.',
    };
  }

  const negativeCashPeriods = allPeriods.filter(
    (ctx) => ctx.balance < 0
  ).length;

  const expensePressurePeriods = allPeriods.filter(
    (ctx) => ctx.totalExpenses > ctx.totalIncome
  ).length;

  const purchasePressurePeriods = allPeriods.filter((ctx) => {
    const purchases = ctx.expenseCategories.find(
      (item) => item.category === 'compras_mercadorias'
    );

    if (!purchases || ctx.totalIncome <= 0) return false;

    return purchases.amount / ctx.totalIncome > 0.6;
  }).length;

  const highPendingPeriods = allPeriods.filter((ctx) => {
  if (!ctx.totalIncome || ctx.totalIncome <= 0) return false;

  return ctx.pendingPayable > ctx.totalIncome * 0.3;
}).length;

const highStockPeriods = allPeriods.filter((ctx) => {
  const stock =
    getInventoryEstimatedPosition(ctx);

  if (!ctx.totalIncome || ctx.totalIncome <= 0) return false;

  return stock > ctx.totalIncome * 0.7;
}).length;

const lowScorePeriods = allPeriods.filter((ctx) => {
  const score = buildOperationalScore(ctx, ctx).score;

  return score < 70;
}).length;

  if (negativeCashPeriods >= 2) {
    memories.push(
      `O caixa ficou negativo em ${negativeCashPeriods} dos ${allPeriods.length} períodos analisados.`
    );
  }

  if (expensePressurePeriods >= 2) {
    memories.push(
      `As despesas superaram as entradas em ${expensePressurePeriods} dos ${allPeriods.length} períodos analisados.`
    );
  }

  if (purchasePressurePeriods >= 2) {
    memories.push(
      `As compras de mercadorias ficaram acima de 60% das entradas em ${purchasePressurePeriods} dos ${allPeriods.length} períodos analisados.`
    );
  }

 if (highPendingPeriods >= 2) {
  memories.push(
    `As contas pendentes representaram pressão relevante em ${highPendingPeriods} dos ${allPeriods.length} períodos analisados.`
  );
}

if (highStockPeriods >= 2) {
  memories.push(
    `O estoque financeiro ficou elevado em ${highStockPeriods} dos ${allPeriods.length} períodos analisados.`
  );
}

if (lowScorePeriods >= 2) {
  memories.push(
    `O score operacional ficou abaixo do ideal em ${lowScorePeriods} dos ${allPeriods.length} períodos analisados.`
  );
} 

  const ordered = [...allPeriods].reverse();

  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  let direction = 'Sem direção histórica forte identificada.';

  if (first && last && first.totalIncome > 0) {
    const incomeVariation =
      ((last.totalIncome - first.totalIncome) / first.totalIncome) * 100;

    if (incomeVariation > 10) {
      direction = 'Receita em crescimento nos períodos analisados.';

      memories.push(
        `A receita apresenta crescimento acumulado de ${incomeVariation.toFixed(1)}% nos períodos analisados.`
      );
    }

    if (incomeVariation < -10) {
      direction = 'Receita em queda nos períodos analisados.';

      memories.push(
        `A receita apresenta queda acumulada de ${Math.abs(incomeVariation).toFixed(1)}% nos períodos analisados.`
      );
    }
  }

  let confidence = 'Baixa';

  if (allPeriods.length >= 3) {
    confidence = 'Média';
  }

  if (allPeriods.length >= 6) {
    confidence = 'Alta';
  }

   let patternStrength = 'Fraco';

const recurringSignals = [
  negativeCashPeriods,
  expensePressurePeriods,
  purchasePressurePeriods,
  highPendingPeriods,
  highStockPeriods,
  lowScorePeriods,
].filter((count) => count >= 2).length;

if (recurringSignals >= 2) {
  patternStrength = 'Moderado';
}

if (recurringSignals >= 4) {
  patternStrength = 'Forte';
}

 let conclusion =
  'O histórico ainda é curto para afirmar recorrência forte, mas já ajuda a observar sinais iniciais de tendência.';

if (patternStrength === 'Moderado') {
  conclusion =
    'Há sinais moderados de padrão operacional recorrente. A IA deve acompanhar se caixa, compras e contas continuam pressionando nos próximos períodos.';
}

if (patternStrength === 'Forte') {
  conclusion =
    'Há sinais fortes de padrão operacional recorrente. O cenário atual parece fazer parte de um comportamento que vem se repetindo nos períodos analisados.';
}

let scoreEvolution = {
  trend: 'Indefinida',
  summary:
    'Ainda não há histórico suficiente para avaliar evolução do score.',
  scores: scoreHistory,
};

if (scoreHistory.length >= 2) {
  const firstScore = scoreHistory[scoreHistory.length - 1].score;
  const lastScore = scoreHistory[0].score;

  const variation = lastScore - firstScore;

  if (variation >= 5) {
    scoreEvolution.trend = 'Melhora';

    scoreEvolution.summary =
      `O score operacional evoluiu ${variation} pontos nos períodos analisados.`;
  }

  if (variation <= -5) {
    scoreEvolution.trend = 'Piora';

    scoreEvolution.summary =
      `O score operacional caiu ${Math.abs(
        variation
      )} pontos nos períodos analisados.`;
  }

  if (variation > -5 && variation < 5) {
    scoreEvolution.trend = 'Estável';

    scoreEvolution.summary =
      'O score operacional permanece relativamente estável nos períodos analisados.';
  }
}

let executiveEvolution = {
  status: 'Indefinido',
  summary:
    'Ainda não há histórico suficiente para avaliar evolução executiva com segurança.',
  signals: [],
};

if (allPeriods.length >= 2) {
  const orderedEvolution = [...allPeriods].reverse();

  const firstPeriod = orderedEvolution[0];
  const lastPeriod = orderedEvolution[orderedEvolution.length - 1];

  const incomeChange =
    firstPeriod.totalIncome > 0
      ? ((lastPeriod.totalIncome - firstPeriod.totalIncome) /
          firstPeriod.totalIncome) *
        100
      : 0;

  const expenseChange =
    firstPeriod.totalExpenses > 0
      ? ((lastPeriod.totalExpenses - firstPeriod.totalExpenses) /
          firstPeriod.totalExpenses) *
        100
      : 0;

  const balanceImproved =
    lastPeriod.balance > firstPeriod.balance;

  if (incomeChange > 10) {
    executiveEvolution.signals.push(
      `A receita cresceu ${incomeChange.toFixed(1)}% nos períodos analisados.`
    );
  }

  if (incomeChange < -10) {
    executiveEvolution.signals.push(
      `A receita caiu ${Math.abs(incomeChange).toFixed(1)}% nos períodos analisados.`
    );
  }

  if (expenseChange > 10) {
    executiveEvolution.signals.push(
      `As despesas cresceram ${expenseChange.toFixed(1)}% nos períodos analisados.`
    );
  }

  if (expenseChange < -10) {
    executiveEvolution.signals.push(
      `As despesas caíram ${Math.abs(expenseChange).toFixed(1)}% nos períodos analisados.`
    );
  }

  if (balanceImproved) {
    executiveEvolution.signals.push(
      'O saldo operacional melhorou em relação ao primeiro período analisado.'
    );
  } else {
    executiveEvolution.signals.push(
      'O saldo operacional piorou em relação ao primeiro período analisado.'
    );
  }

  const positiveSignals = [];
  const negativeSignals = [];

  if (incomeChange > 10) positiveSignals.push('receita');
  if (expenseChange < -10) positiveSignals.push('despesas');
  if (balanceImproved) positiveSignals.push('saldo');

  if (incomeChange < -10) negativeSignals.push('receita');
  if (expenseChange > 10) negativeSignals.push('despesas');
  if (!balanceImproved) negativeSignals.push('saldo');

  if (positiveSignals.length > negativeSignals.length) {
    executiveEvolution.status = 'Evolução positiva';
    executiveEvolution.summary =
      'Os sinais históricos indicam melhora operacional nos períodos analisados.';
  } else if (negativeSignals.length > positiveSignals.length) {
    executiveEvolution.status = 'Evolução negativa';
    executiveEvolution.summary =
      'Os sinais históricos indicam piora operacional nos períodos analisados.';
  } else {
    executiveEvolution.status = 'Evolução mista';
    executiveEvolution.summary =
      'Os sinais históricos estão mistos, sem conclusão forte de melhora ou piora.';
  }
}
  
  return {
    available: true,
    periodsAnalyzed: allPeriods.length,
    confidence,
    direction,
    patternStrength,
    executiveEvolution,
    scoreEvolution,
    memories:
      memories.length > 0
        ? memories
        : ['Ainda não há padrão histórico forte identificado nos períodos disponíveis.'],
    conclusion,
  };
};

const buildSeasonalityAnalysis = (currentCtx, historicalContexts = []) => {
  const allPeriods = [currentCtx, ...historicalContexts].filter(
    (ctx) =>
      ctx &&
     ctx.totalIncome > 0
  );

if (allPeriods.length < 3) {
  return {
    available: false,
    confidence: 'Baixa',
    currentRank: null,
    totalPeriods: allPeriods.length,
    strongestMonths: allPeriods
      .sort((a, b) => b.totalIncome - a.totalIncome)
      .map((ctx) => ({
        period: ctx.periodLabel,
        income: ctx.totalIncome,
      })),
    weakestMonths: allPeriods
      .sort((a, b) => a.totalIncome - b.totalIncome)
      .map((ctx) => ({
        period: ctx.periodLabel || `${ctx.month}/${ctx.year}`,
        income: ctx.totalIncome,
      })),
    reading:
      'Ainda não há meses suficientes para identificar sazonalidade com segurança, mas já é possível visualizar os períodos disponíveis.',
    recommendation:
      'Quando houver pelo menos 3 meses completos, a IA poderá apontar meses fortes, meses fracos e períodos de maior cautela.',
  };
} 

  const orderedByIncome = [...allPeriods].sort(
    (a, b) => b.totalIncome - a.totalIncome
  );

  const strongestMonths = orderedByIncome.slice(0, 3).map((ctx) => ({
    period: ctx.periodLabel || `${ctx.month}/${ctx.year}`,
    income: ctx.totalIncome,
  }));

  const weakestMonths = [...orderedByIncome]
    .reverse()
    .slice(0, 3)
    .map((ctx) => ({
      period: ctx.periodLabel || `${ctx.month}/${ctx.year}`,
      income: ctx.totalIncome,
    }));

  const currentLabel =
  currentCtx.periodLabel || `${currentCtx.month}/${currentCtx.year}`;

const currentRank =
  orderedByIncome.findIndex((ctx) => {
    const label = ctx.periodLabel || `${ctx.month}/${ctx.year}`;
    return label === currentLabel;
  }) + 1;

  let reading =
    'Ainda não há padrão sazonal forte, mas já é possível comparar força relativa entre os meses disponíveis.';

  if (currentRank === 1) {
    reading =
      'O período atual está entre os mais fortes do histórico analisado.';
  }

  if (currentRank === orderedByIncome.length) {
    reading =
      'O período atual está entre os mais fracos do histórico analisado.';
  }

  let confidence = 'Baixa';

  if (allPeriods.length >= 6) {
    confidence = 'Média';
  }

  if (allPeriods.length >= 12) {
    confidence = 'Alta';
  }

  let recommendation =
    'Use essa leitura como apoio inicial. A sazonalidade ficará mais confiável quando houver 6 a 12 meses completos.';

  if (currentRank === 1) {
    recommendation =
      'Como o período atual está forte, vale priorizar giro, margem e reposições cuidadosas sem perder controle de caixa.';
  }

  if (currentRank === orderedByIncome.length) {
    recommendation =
      'Como o período atual está fraco, eu seria mais conservador em compras, despesas e novos compromissos.';
  }

  return {
    available: true,
    confidence,
    currentRank,
    totalPeriods: allPeriods.length,
    strongestMonths,
    weakestMonths,
    reading,
    recommendation,
  };
};

const buildOpportunityAnalysis = (
  ctx,
  operationalScore,
  historicalMemory
) => {
  const opportunities = [];

  if (ctx.balance < 0) {
    opportunities.push({
      priority: 10,
      title: 'Recuperação de caixa',
      description:
        `Eliminar o saldo negativo de ${formatCurrency(
          Math.abs(ctx.balance)
        )} pode gerar impacto imediato na saúde financeira.`,
    });
  }

  const purchases = ctx.expenseCategories.find(
    (item) => item.category === 'compras_mercadorias'
  );

  if (purchases && ctx.totalIncome > 0) {
    const share =
      (purchases.amount / ctx.totalIncome) * 100;

    if (share > 70) {
      opportunities.push({
        priority: 9,
        title: 'Aumentar giro do estoque',
        description:
          `As compras representam ${share.toFixed(
            1
          )}% das entradas. Vender melhor o estoque atual pode gerar caixa sem novas compras.`,
      });
    }
  }

 const inventoryPosition =
  getInventoryEstimatedPosition(ctx);

if (
  ctx.inventory &&
  inventoryPosition > ctx.totalIncome * 0.5
) {
  opportunities.push({
    priority: 8,
    title: 'Transformar estoque em caixa',
    description:
      `A posição estimada de estoque de ${formatCurrency(
        inventoryPosition
      )} representa uma oportunidade de geração de caixa.`,
  });
}

  if (
    historicalMemory?.executiveEvolution?.status ===
    'Evolução negativa'
  ) {
    opportunities.push({
      priority: 7,
      title: 'Interromper deterioração operacional',
      description:
        'Os indicadores históricos mostram piora operacional. Corrigir tendências negativas pode gerar melhora estrutural.',
    });
  }

  opportunities.sort(
    (a, b) => b.priority - a.priority
  );

  const mainOpportunity =
    opportunities[0] ||
    {
      title: 'Crescimento sustentável',
      description:
        'A operação não apresenta gargalos críticos relevantes neste momento.',
    };

  return {
    opportunities,
    mainOpportunity,
  };
};

const getWeekdayName = (date) =>
  new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
  });

const getWeekendKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();

  // Sexta, sábado e domingo
  if (![5, 6, 0].includes(day)) {
    return null;
  }

  const friday = new Date(d);

  if (day === 6) friday.setDate(d.getDate() - 1);
  if (day === 0) friday.setDate(d.getDate() - 2);

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);

  return {
    key: friday.toISOString().slice(0, 10),
    label: `${friday.toLocaleDateString('pt-BR')} a ${sunday.toLocaleDateString('pt-BR')}`,
  };
};

const buildWeekendRanking = (entries, type = 'income') => {
  const grouped = {};

  entries
    .filter((entry) => entry.type === type)
    .forEach((entry) => {
      const weekend = getWeekendKey(entry.date);

      if (!weekend) return;

      if (!grouped[weekend.key]) {
        grouped[weekend.key] = {
          label: weekend.label,
          amount: 0,
          count: 0,
        };
      }

      grouped[weekend.key].amount += Math.abs(Number(entry.amount || 0));
      grouped[weekend.key].count += 1;
    });

  return Object.values(grouped).sort(
    (a, b) => b.amount - a.amount
  );
};

const buildWeekRanking = (
  entries,
  type = 'income',
  periodStart = null,
  periodEnd = null
) => {
  const grouped = {};

  entries
    .filter((entry) => entry.type === type)
    .forEach((entry) => {
      const date = new Date(entry.date);
      const day = date.getDay();

const mondayOffset =
  day === 0
    ? -6
    : 1 - day;

const weekStart = new Date(date);
weekStart.setDate(
  date.getDate() + mondayOffset
);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (
  periodStart &&
  periodEnd &&
  (
    weekStart < periodStart ||
    weekEnd > periodEnd
  )
) {
  return;
}

      const key = weekStart.toISOString().slice(0, 10);
      const label = `${weekStart.toLocaleDateString('pt-BR')} a ${weekEnd.toLocaleDateString('pt-BR')}`;

      if (!grouped[key]) {
        grouped[key] = {
          label,
          amount: 0,
          count: 0,
        };
      }

      grouped[key].amount += Math.abs(Number(entry.amount || 0));
      grouped[key].count += 1;
    });

  return Object.values(grouped).sort(
    (a, b) => b.amount - a.amount
  );
};

const isAdvancedTemporalQuestion = (question) => {
  const lower = normalizeText(question);

  const hasTemporalTerm =
  lower.includes('final de semana') ||
  lower.includes('fim de semana') ||
  lower.includes('semana') ||
  lower.includes('dia') ||
  lower.includes('trimestre') ||
  lower.includes('semestre') ||
  lower.includes('ano foi') ||
  lower.includes('melhor ano') ||
  lower.includes('pior ano') ||
  lower.includes('recuperacao') ||
  lower.includes('piora');

  const hasRankingTerm =
    lower.includes('melhor') ||
    lower.includes('maior') ||
    lower.includes('pior') ||
    lower.includes('piro') ||
    lower.includes('menor') ||
    lower.includes('menos') ||
    lower.includes('mais critico') ||
    lower.includes('recuperacao') ||
    lower.includes('piora') ||
    lower.includes('critico');

  const hasHistoricalRange =
    lower.includes('do ano') ||
    lower.includes('no ano') ||
    lower.includes('de 2026') ||
    lower.includes('em 2026') ||
    lower.includes('desde janeiro') ||
    lower.includes('janeiro a') ||
    lower.includes('fevereiro a') ||
    lower.includes('marco a') ||
    lower.includes('março a') ||
    lower.includes('abril a') ||
    lower.includes('maio a') ||
    lower.includes('junho a') ||
    lower.includes('julho a') ||
    lower.includes('agosto a') ||
    lower.includes('setembro a') ||
    lower.includes('outubro a') ||
    lower.includes('novembro a');

  return hasTemporalTerm && hasRankingTerm && hasHistoricalRange;
};

const getAdvancedHistoricalPeriod = (question) => {
  const lower = normalizeText(question);
  const now = new Date();

  const yearMatch = lower.match(/\b(20\d{2})\b/);
  const year = yearMatch
    ? Number(yearMatch[1])
    : now.getFullYear();

  const monthsFound = [];

  monthNames.forEach((item) => {
    item.names.forEach((name) => {
      const normalizedName = normalizeText(name);
      const regex = new RegExp(`\\b${normalizedName}\\b`, 'i');

      if (regex.test(lower)) {
        const already = monthsFound.find(
          (month) => month.number === item.number
        );

        if (!already) {
          monthsFound.push({
            number: item.number,
            label: getMonthLabel(item.number, year).split('/')[0],
          });
        }
      }
    });
  });

  monthsFound.sort((a, b) => a.number - b.number);

  // Exemplo: "janeiro a junho"
  if (
    monthsFound.length >= 2 &&
    lower.includes(' a ')
  ) {
    const firstMonth = monthsFound[0];
    const lastMonth = monthsFound[monthsFound.length - 1];

    return {
      month: null,
      year,
      start: new Date(year, firstMonth.number - 1, 1),
      end: new Date(year, lastMonth.number, 0, 23, 59, 59, 999),
      customLabel: `${firstMonth.label} a ${lastMonth.label}/${year}`,
    };
  }

  // Exemplo: "desde janeiro"
  if (
    lower.includes('desde janeiro')
  ) {
    return {
      month: null,
      year,
      start: new Date(year, 0, 1),
      end:
        year === now.getFullYear()
          ? now
          : new Date(year, 11, 31, 23, 59, 59, 999),
      customLabel: `Desde Janeiro/${year}`,
    };
  }

  // Exemplo: "do ano", "de 2026", "em 2026"
  if (
    lower.includes('do ano') ||
    lower.includes('no ano') ||
    lower.includes(`de ${year}`) ||
    lower.includes(`em ${year}`)
  ) {
    return {
      month: null,
      year,
      start: new Date(year, 0, 1),
      end:
        year === now.getFullYear()
          ? now
          : new Date(year, 11, 31, 23, 59, 59, 999),
      customLabel: `Ano de ${year}`,
    };
  }

  return null;
};

const buildHistoricalPeriodRanking = (entries, mode = 'quarter') => {
  const grouped = {};

  (entries || [])
    .filter((entry) => entry.type === 'income')
    .forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      let key = '';
      let label = '';

      if (mode === 'quarter') {
        const quarter = Math.ceil(month / 3);
        key = `${year}-T${quarter}`;
        label = `${quarter}º trimestre/${year}`;
      }

      if (mode === 'semester') {
        const semester = month <= 6 ? 1 : 2;
        key = `${year}-S${semester}`;
        label = `${semester}º semestre/${year}`;
      }

      if (mode === 'year') {
        key = `${year}`;
        label = `${year}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          label,
          amount: 0,
          count: 0,
        };
      }

      grouped[key].amount += Math.abs(Number(entry.amount || 0));
      grouped[key].count += 1;
    });

  return Object.values(grouped).sort(
    (a, b) => b.amount - a.amount
  );
};

const buildMonthlyHistoricalRanking = (entries) => {
  const grouped = {};

  (entries || [])
    .filter((entry) => entry.type === 'income')
    .forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = {
          key,
          year,
          month,
          label: getMonthLabel(month, year),
          income: 0,
          expenses: 0,
          balance: 0,
          count: 0,
        };
      }

      grouped[key].income += Math.abs(Number(entry.amount || 0));
      grouped[key].count += 1;
    });

  (entries || [])
    .filter((entry) => entry.type === 'expense')
    .forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = {
          key,
          year,
          month,
          label: getMonthLabel(month, year),
          income: 0,
          expenses: 0,
          balance: 0,
          count: 0,
        };
      }

      grouped[key].expenses += Math.abs(Number(entry.amount || 0));
    });

  return Object.values(grouped)
.map((item) => ({
  ...item,
  balance: item.income - item.expenses,
}))
    .sort((a, b) => a.key.localeCompare(b.key));
};

const buildManagementReportPeriodRanking = async (mode = 'quarter') => {
  const reports = await ManagementReport.find({})
    .sort({ year: 1, month: 1 });

  const grouped = {};

  (reports || [])
    .filter((report) => report.year && report.month)
    .forEach((report) => {
      const year = Number(report.year);
      const month = Number(report.month);

      const amount = Number(
        report.netRevenue ||
        report.grossRevenue ||
        report.totalIncome ||
        report.revenue ||
        0
      );

      if (amount <= 0) return;

      let key = '';
      let label = '';

      if (mode === 'quarter') {
        const quarter = Math.ceil(month / 3);
        key = `${year}-T${quarter}`;
        label = `${quarter}º trimestre/${year}`;
      }

      if (mode === 'semester') {
        const semester = month <= 6 ? 1 : 2;
        key = `${year}-S${semester}`;
        label = `${semester}º semestre/${year}`;
      }

      if (mode === 'year') {
        key = `${year}`;
        label = `${year}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          label,
          amount: 0,
          count: 0,
        };
      }

      grouped[key].amount += amount;
      grouped[key].count += 1;
    });

  return Object.values(grouped).sort(
    (a, b) => b.amount - a.amount
  );
};

  const buildHistoricalAggregatorAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  const wantsBest =
    lower.includes('melhor') ||
    lower.includes('maior');

  const wantsWorst =
    lower.includes('pior') ||
    lower.includes('menor');

  let mode = null;
  let titleLabel = '';

  if (lower.includes('trimestre')) {
    mode = 'quarter';
    titleLabel = 'TRIMESTRE';
  }

  if (lower.includes('semestre')) {
    mode = 'semester';
    titleLabel = 'SEMESTRE';
  }

  if (
    lower.includes('ano foi melhor') ||
    lower.includes('ano foi pior') ||
    lower.includes('melhor ano') ||
    lower.includes('pior ano')
  ) {
    mode = 'year';
    titleLabel = 'ANO';
  }

  if (!mode || (!wantsBest && !wantsWorst)) {
    return null;
  }

const ranking = await buildManagementReportPeriodRanking(mode);

  if (!ranking.length) {
    return `
Não encontrei dados suficientes para comparar ${titleLabel.toLowerCase()}s.
`.trim();
  }

  const selected = wantsWorst
    ? [...ranking].sort((a, b) => a.amount - b.amount)[0]
    : ranking[0];

  return `
${wantsWorst ? '📉 PIOR' : '🏆 MELHOR'} ${titleLabel} — Histórico gerencial

━━━━━━━━━━━━━━━━━━

📅 Período
${selected.label}

💰 Faturamento
${formatCurrency(selected.amount)}

📋 Lançamentos
${selected.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa análise agrupa as entradas por ${titleLabel.toLowerCase()} e identifica o ${wantsWorst ? 'menor' : 'maior'} faturamento do período analisado.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use essa leitura para entender sazonalidade, períodos fortes e períodos que exigem reforço de caixa, compras e marketing.
`.trim();
};

const getManagementReportMonthlyHistory = async () => {
  const reports = await ManagementReport.find({})
    .sort({ year: 1, month: 1 });

  return (reports || [])
    .filter((report) => report.year && report.month)
    .map((report) => {
      const income =
        Number(
          report.netRevenue ||
          report.grossRevenue ||
          report.totalIncome ||
          report.revenue ||
          0
        );

      const expenses =
        Number(
          report.totalExpenses ||
          report.expenses ||
          0
        );

      const balance =
        Number(
          report.balance ||
          report.result ||
          income - expenses
        );

      return {
        year: report.year,
        month: report.month,
        label: getMonthLabel(report.month, report.year),
        income,
        expenses,
        balance,
        averageTicket: Number(report.averageTicket || 0),
        totalTickets: Number(report.totalTickets || 0),
      };
    })
    .filter((item) => item.income > 0);
};

const buildHistoricalTrendPointAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  const wantsRecovery =
    lower.includes('recuperacao') ||
    lower.includes('recuperou') ||
    lower.includes('melhora');

  const wantsDecline =
    lower.includes('piora') ||
    lower.includes('piorou') ||
    lower.includes('queda');

  if (!wantsRecovery && !wantsDecline) {
    return null;
  }

  const months = await getManagementReportMonthlyHistory();

  if (months.length < 3) {
    return `
Não encontrei meses suficientes para identificar tendência histórica.

Para analisar recuperação ou piora, preciso de pelo menos três meses no Relatório Gerencial.
`.trim();
  }

  const candidates = [];

  for (let i = 1; i < months.length; i += 1) {
    const previous = months[i - 1];
    const current = months[i];

    const incomeVariation =
      calculateVariation(current.income, previous.income);

    const balanceVariation =
      calculateVariation(current.balance, previous.balance);

    if (incomeVariation === null) continue;

    if (
      wantsRecovery &&
      current.income > previous.income &&
      current.balance >= previous.balance
    ) {
      candidates.push({
        month: current,
        previous,
        incomeVariation,
        balanceVariation,
      });
    }

    if (
      wantsDecline &&
      current.income < previous.income &&
      current.balance <= previous.balance
    ) {
      candidates.push({
        month: current,
        previous,
        incomeVariation,
        balanceVariation,
      });
    }
  }

  const selected = candidates[0];

  if (!selected) {
    return `
📊 TENDÊNCIA HISTÓRICA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Não identifiquei uma sequência clara de ${wantsRecovery ? 'recuperação' : 'piora'} no período analisado.

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Os dados mostram oscilações, mas não um ponto suficientemente claro para afirmar o início de uma tendência consistente.
`.trim();
  }

  return `
${wantsRecovery ? '📈 INÍCIO DE RECUPERAÇÃO' : '📉 INÍCIO DE PIORA'} — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📅 Ponto identificado
${selected.month.label}

📊 Comparado com
${selected.previous.label}

━━━━━━━━━━━━━━━━━━

💰 Faturamento anterior
${formatCurrency(selected.previous.income)}

💰 Faturamento no ponto identificado
${formatCurrency(selected.month.income)}

📊 Variação de faturamento
${selected.incomeVariation.toFixed(1)}%

━━━━━━━━━━━━━━━━━━

📈 Resultado anterior
${formatCurrency(selected.previous.balance)}

📈 Resultado no ponto identificado
${formatCurrency(selected.month.balance)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${wantsRecovery
  ? 'Esse foi o primeiro ponto em que a operação mostrou melhora simultânea em faturamento e resultado.'
  : 'Esse foi o primeiro ponto em que a operação mostrou deterioração simultânea em faturamento e resultado.'}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Use esse ponto como referência para entender o que mudou em vendas, compras, despesas, estoque e operação naquele momento.
`.trim();
};

const buildDailyRevenueRankingAnswer = async (question, ctx) => {
  const lower = normalizeText(question);

  const asksDay =
    lower.includes('pior dia') ||
    lower.includes('melhor dia') ||
    lower.includes('menor dia') ||
    lower.includes('maior dia') ||
    lower.includes('dia de menor') ||
    lower.includes('dia de maior');

  const asksRevenue =
    lower.includes('faturamento') ||
    lower.includes('vendas') ||
    lower.includes('venda') ||
    asksDay;

  if (!asksDay || !asksRevenue) {
    return null;
  }

  const wantsBest =
    lower.includes('melhor') ||
    lower.includes('maior');

  const now = new Date();

  let start = ctx.start;
  let end = ctx.end;
  let label = ctx.periodLabel;

  const dateRange = lower.match(
    /(\d{1,2})\/(\d{1,2})\s*a\s*(\d{1,2})\/(\d{1,2})/
  );

  if (dateRange) {
    const year = ctx.year || now.getFullYear();

    start = new Date(
      year,
      Number(dateRange[2]) - 1,
      Number(dateRange[1]),
      0,
      0,
      0,
      0
    );

    end = new Date(
      year,
      Number(dateRange[4]) - 1,
      Number(dateRange[3]),
      23,
      59,
      59,
      999
    );

    label = `${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`;
  } else if (
    lower.includes('historia') ||
    lower.includes('historico')
  ) {
    start = new Date(2021, 0, 1);
    end = now;
    label = 'História da Bebcom';
  } else if (lower.includes('2026')) {
    start = new Date(2026, 0, 1);
    end = new Date(2026, 11, 31, 23, 59, 59, 999);
    label = 'Ano de 2026';
  } else {
    const foundMonth = monthNames.find((item) =>
      item.names.some((name) =>
        lower.includes(normalizeText(name))
      )
    );

    if (foundMonth) {
      const year = ctx.year || now.getFullYear();

      start = new Date(year, foundMonth.number - 1, 1);
      end = new Date(year, foundMonth.number, 0, 23, 59, 59, 999);
      label = getMonthLabel(foundMonth.number, year);
    }
  }

  const entries = await Entry.find({
    deleted: { $ne: true },
    type: 'income',
    date: {
      $gte: start,
      $lte: end,
    },
  });

  const grouped = {};

  entries.forEach((entry) => {
    const date = new Date(entry.date).toLocaleDateString('pt-BR');

    if (!grouped[date]) {
      grouped[date] = {
        date,
        amount: 0,
        count: 0,
      };
    }

    grouped[date].amount += Math.abs(Number(entry.amount || 0));
    grouped[date].count += 1;
  });

  const days = Object.values(grouped).filter(
    (item) => item.amount > 0
  );

  if (!days.length) {
    return `
Não encontrei entradas suficientes para identificar o ${
      wantsBest ? 'melhor' : 'pior'
    } dia em ${label}.
`.trim();
  }

  days.sort((a, b) =>
    wantsBest
      ? b.amount - a.amount
      : a.amount - b.amount
  );

  const selected = days[0];

  return `
${wantsBest ? '🏆 MELHOR DIA DE VENDAS' : '🚨 PIOR DIA DE VENDAS'} — ${label}

━━━━━━━━━━━━━━━━━━

📅 Dia
${selected.date}

💰 Faturamento
${formatCurrency(selected.amount)}

📋 Lançamentos
${selected.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse foi o dia com ${
    wantsBest ? 'maior' : 'menor'
  } volume financeiro de entradas registradas no período analisado.

━━━━━━━━━━━━━━━━━━

🔎 Observação

Essa leitura considera apenas dias com entradas registradas. Dias sem lançamento não entram no ranking para evitar falso pior dia.
`.trim();
};

const buildTemporalAnalyticsAnswer = (question, ctx) => {
  const lower = normalizeText(question);

  const wantsBest =
    lower.includes('melhor') ||
    lower.includes('maior') ||
    lower.includes('mais vendeu') ||
    lower.includes('maior faturamento');

  const wantsWorst =
  lower.includes('pior') ||
  lower.includes('menor') ||
  lower.includes('menos') ||
  lower.includes('mais critico') ||
  lower.includes('critico');

// FINAL DE SEMANA
if (
  lower.includes('final de semana') ||
  lower.includes('fim de semana')
) {
const weeks = buildWeekRanking(
  ctx.entries,
  'income',
  ctx.start,
  ctx.end
);

  if (!weekends.length) {
    return `
Não encontrei vendas registradas em finais de semana em ${ctx.periodLabel}.
`.trim();
  }

  if (weekends.length < 2 && wantsWorst) {
    return `
📅 ANÁLISE DE FINAL DE SEMANA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Existe apenas um final de semana com vendas registradas no período.

Com apenas um final de semana disponível, não é possível afirmar qual vendeu menos.

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Para identificar o pior final de semana, preciso comparar pelo menos dois finais de semana dentro do mesmo período.
`.trim();
  }

  const selected = wantsWorst
    ? [...weekends].sort((a, b) => a.amount - b.amount)[0]
    : weekends[0];

  return `
🏆 ${wantsWorst ? 'PIOR' : 'MELHOR'} FINAL DE SEMANA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📅 Período
${selected.label}

💰 Faturamento
${formatCurrency(selected.amount)}

📋 Lançamentos
${selected.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Para esta análise, considerei final de semana como sexta, sábado e domingo.
`.trim();
}

  // SEMANA
if (
  lower.includes('melhor semana') ||
  lower.includes('pior semana') ||
  lower.includes('pior de semana') ||
  lower.includes('piro de semana') ||
  lower.includes('pior semana do ano') ||
  lower.includes('semana do ano') ||
  lower.includes('semana vendeu mais') ||
  lower.includes('semana vendeu menos') ||
  lower.includes('semana teve menor faturamento') ||
  lower.includes('semana teve maior faturamento')
) {
    const weeks = buildWeekRanking(
  ctx.entries,
  'income',
  ctx.start,
  ctx.end
);

    if (!weeks.length) {
      return `
Não encontrei vendas suficientes para analisar semanas em ${ctx.periodLabel}.
`.trim();
    }

    const selected = wantsWorst
      ? [...weeks].sort((a, b) => a.amount - b.amount)[0]
      : weeks[0];

    return `
📅 ${wantsWorst ? 'PIOR' : 'MELHOR'} SEMANA — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Período
${selected.label}

💰 Faturamento
${formatCurrency(selected.amount)}

📋 Lançamentos
${selected.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Essa análise agrupa as entradas por semana e identifica o maior ou menor faturamento semanal.
`.trim();
  }

  // PIOR DIA / DIA MAIS CRÍTICO
 if (
  (
    lower.includes('pior dia') ||
    lower.includes('menor dia') ||
    lower.includes('dia mais critico') ||
    lower.includes('dia foi o mais critico') ||
    (
      lower.includes('dia') &&
      lower.includes('mais critico')
    )
  )
) {
    const days = [...(ctx.incomeByDay || [])].sort(
      (a, b) => a.amount - b.amount
    );

    const selected = days[0];

    if (!selected) {
      return `
Não encontrei entradas suficientes para identificar o pior dia em ${ctx.periodLabel}.
`.trim();
    }

    return `
🚨 DIA MAIS CRÍTICO DE VENDAS — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

📅 Dia
${selected.name}

💰 Faturamento
${formatCurrency(selected.amount)}

📋 Lançamentos
${selected.count}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Esse foi o dia com menor volume financeiro de entradas registradas no período.
`.trim();
  }

  return null;
};

const buildBebcomHistoryAnswer = (question) => {
  const lower = normalizeText(question);

  if (
  lower.includes('final de semana') ||
  lower.includes('fim de semana') ||
  lower.includes('semana') ||
  lower.includes('dia')
) {
  return null;
}

  if (
    lower.includes('pior mes da historia') ||
    lower.includes('periodo mais critico') ||
    lower.includes('periodo mais dificil') 
  ) {
    const milestone =
      bebcomBrain.milestones.hardestFinancialMonth;

    return `
🧠 PERÍODO MAIS CRÍTICO DA HISTÓRIA DA BEBCOM

━━━━━━━━━━━━━━━━━━

📅 Período
${milestone.period}

💰 Faturamento registrado
${formatCurrency(milestone.amount)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${milestone.note}

O ponto mais importante é que o pior momento financeiro não foi definido apenas pelo faturamento.

A leitura correta considera custo operacional, pressão de caixa, funcionários, compras e capacidade de sustentar a operação.

━━━━━━━━━━━━━━━━━━

🎯 Aprendizado institucional

A Bebcom aprendeu que faturamento sozinho não representa saúde financeira.

O que define a segurança da empresa é a relação entre vendas, margem, despesas, estoque e contas pendentes.
`.trim();
  }

  if (
    lower.includes('melhor mes da historia') ||
    lower.includes('maior faturamento') ||
    lower.includes('recorde de faturamento')
  ) {
    const milestone =
      bebcomBrain.milestones.bestRevenueMonth;

    return `
🏆 MAIOR FATURAMENTO DA HISTÓRIA DA BEBCOM

━━━━━━━━━━━━━━━━━━

📅 Período
${milestone.period}

💰 Faturamento
${formatCurrency(milestone.amount)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${milestone.note}

Esse marco mostra a capacidade da Bebcom quando estoque, demanda, atendimento, variedade e operação trabalham alinhados.

━━━━━━━━━━━━━━━━━━

🎯 Aprendizado institucional

O objetivo não é apenas repetir o faturamento recorde.

O objetivo é repetir o alinhamento operacional que permitiu esse resultado.
`.trim();
  }

  if (
    lower.includes('maior virada') ||
    lower.includes('virada da empresa') ||
    lower.includes('decisao mudou') 
  ) {
    return `
🔁 MAIORES VIRADAS ESTRATÉGICAS DA BEBCOM

━━━━━━━━━━━━━━━━━━

• Implantação de energia solar em 2023.
• Redução do quadro de funcionários.
• Reavaliação de preços diante de nova concorrência.
• Expansão do mix de mercearia.
• Reorganização da vitrine da loja.
• Busca por novos fornecedores.

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

As maiores viradas da Bebcom não vieram de uma única ação isolada.

Elas vieram de decisões que melhoraram estrutura, margem, compras, exposição de produtos e controle operacional.

━━━━━━━━━━━━━━━━━━

🎯 Aprendizado institucional

A Bebcom evolui melhor quando transforma pressão em ajuste de gestão.
`.trim();
  }

  return null;
};

const buildExpenseGrowthAnswer = (ctx, previousCtx) => {
  if (!previousCtx) {
    return 'Não encontrei período anterior suficiente para comparar despesas.';
  }

  const previousMap = new Map(
    (previousCtx.expenseCategories || []).map((item) => [
      item.category,
      Number(item.amount || 0),
    ])
  );

  const items = (ctx.expenseCategories || [])
    .map((item) => {
      const previous = previousMap.get(item.category) || 0;
      const current = Number(item.amount || 0);
      const difference = current - previous;

      return {
        category: item.category,
        current,
        previous,
        difference,
        variation:
          previous > 0
            ? (difference / previous) * 100
            : null,
      };
    })
    .filter((item) => item.difference > 0)
    .sort((a, b) => b.difference - a.difference);

  const list = items
    .slice(0, 5)
    .map((item, index) => {
      const variationText =
        item.variation === null
          ? 'novo indicador'
          : `${item.variation.toFixed(1)}%`;

      return `${index + 1}. ${item.category}
Anterior: ${formatCurrency(item.previous)}
Atual: ${formatCurrency(item.current)}
Aumento: ${formatCurrency(item.difference)}
Variação: ${variationText}`;
    })
    .join('\n\n');

  return `
💸 DESPESAS QUE MAIS CRESCERAM — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${list || 'Não identifiquei crescimento de despesas no comparativo.'}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

Aqui estou olhando apenas pressão de custo, não crescimento saudável da operação.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Revise primeiro as despesas que cresceram em valor absoluto, porque elas são as que mais afetam o caixa.
`.trim();
};

const buildGrowthDeclineAnswer = (ctx, previousCtx, mode = 'growth') => {
  if (!previousCtx) {
    return `
Não encontrei período anterior suficiente para comparar crescimento ou queda.

Minha leitura:
Para identificar o que mais cresceu ou caiu, preciso comparar o período atual com um período anterior.
`.trim();
  }

 const makeCategoryItems = (currentList = [], previousList = [], prefix = '') => {
  return currentList.map((currentItem) => {
    const previousItem = previousList.find(
      (item) => item.category === currentItem.category
    );

    return {
      name: `${prefix}${currentItem.category}`,
      current: Number(currentItem.amount || 0),
      previous: Number(previousItem?.amount || 0),
    };
  });
};

const currentItems = [
  {
    name: 'Entradas',
    current: Number(ctx.totalIncome || 0),
    previous: Number(previousCtx.totalIncome || 0),
  },
  {
    name: 'Saídas',
    current: Number(ctx.totalExpenses || 0),
    previous: Number(previousCtx.totalExpenses || 0),
  },
  {
    name: 'Resultado',
    current: Number(ctx.balance || 0),
    previous: Number(previousCtx.balance || 0),
  },
  {
    name: 'Contas a pagar',
    current: Number(ctx.pendingPayable || 0),
    previous: Number(previousCtx.pendingPayable || 0),
  },
  {
    name: 'Ticket médio',
    current: Number(ctx.managementReport?.averageTicket || 0),
    previous: Number(previousCtx.managementReport?.averageTicket || 0),
  },
  ...makeCategoryItems(
    ctx.expenseCategories,
    previousCtx.expenseCategories,
    'Despesa — '
  ),
  ...makeCategoryItems(
    ctx.incomeCategories,
    previousCtx.incomeCategories,
    'Receita — '
  ),
];

 const variations = currentItems
  .filter((item) => item.previous > 0 || item.current > 0)
  .map((item) => ({
    ...item,
    variation:
      item.previous > 0
        ? (
            (item.current - item.previous) /
            Math.abs(item.previous)
          ) * 100
        : null,
    difference:
      item.current - item.previous,
  }));

  const isExpensePressureItem = (name = '') => {
  const normalized = normalizeText(name);

  return (
    normalized.startsWith('despesa') ||
    normalized.includes('saidas') ||
    normalized.includes('contas a pagar') ||
    normalized.includes('compras')
  );
};

const isHealthyGrowthItem = (item) => {
  const normalized = normalizeText(item.name);

  return (
    normalized.includes('entradas') ||
    normalized.includes('receita') ||
    normalized.includes('ticket') ||
    normalized.includes('resultado')
  );
};

const candidateItems =
  mode === 'growth'
    ? variations.filter((item) => {
        const lowerQuestion = normalizeText(item.name);

        return (
          item.difference > 0 &&
          isHealthyGrowthItem(item) &&
          !isExpensePressureItem(lowerQuestion)
        );
      })
    : variations.filter((item) => item.difference < 0);

const selected = candidateItems
  .sort((a, b) => {
    if (mode === 'growth') {
      return b.difference - a.difference;
    }

    return a.difference - b.difference;
  })[0];

 if (!selected) {
  return `
📊 COMPARATIVO EVOLUTIVO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

Não identifiquei crescimento saudável relevante em relação ao período anterior.

━━━━━━━━━━━━━━━━━━

🧠 Minha leitura

Os aumentos encontrados parecem estar mais ligados a despesas, compras ou pressão financeira do que a crescimento de receita, ticket médio ou resultado.

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Para analisar pressão de custo, pergunte: "Quais despesas mais cresceram?"
`.trim();
}

 const selectedName =
  normalizeText(selected.name);

const isHealthyDecrease =
  mode === 'decline' &&
  (
    selectedName.includes('saidas') ||
    selectedName.includes('despesa') ||
    selectedName.includes('compras') ||
    selectedName.includes('contas a pagar')
  );

const analysis =
  mode === 'growth'
    ? `O indicador que mais cresceu foi ${selected.name}. Como estou filtrando crescimento saudável, essa leitura considera principalmente receita, resultado, ticket médio ou entradas.`
    : isHealthyDecrease
      ? `O indicador que mais caiu foi ${selected.name}. Neste caso, a queda é positiva, porque representa redução de pressão financeira sobre o caixa.`
      : `O indicador que mais caiu foi ${selected.name}. Isso pode indicar perda de força, redução de receita ou piora operacional importante.`; 

  return `
📊 COMPARATIVO EVOLUTIVO — ${ctx.periodLabel}

━━━━━━━━━━━━━━━━━━

${mode === 'growth' ? '📈 O que mais cresceu' : '📉 O que mais caiu'}

${selected.name}

━━━━━━━━━━━━━━━━━━

Período anterior:
${formatCurrency(selected.previous)}

Período atual:
${formatCurrency(selected.current)}

Variação:
${
  selected.variation === null
    ? 'Novo indicador no período'
    : `${selected.variation.toFixed(1)}%`
}

Diferença:
${formatCurrency(selected.difference)}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${analysis}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Analise esse indicador junto com caixa, compras, contas pendentes e ticket médio antes de tomar decisão.
`.trim();
};

const buildBiggestProblemAnswer = (ctx) => {

  const problems = [];

  if (ctx.pendingPayable > ctx.balance) {
    problems.push({
      score: ctx.pendingPayable,
      title: 'Contas pendentes elevadas',
      reason:
        'O valor em aberto representa forte pressão sobre o caixa.'
    });
  }

  const purchases =
    ctx.expenseCategories?.find(
      item => item.category === 'compras_mercadorias'
    );

  if (purchases) {
    const share =
      ctx.totalIncome > 0
        ? (purchases.amount / ctx.totalIncome) * 100
        : 0;

    if (share > 60) {
      problems.push({
        score: purchases.amount,
        title: 'Compras de mercadorias',
        reason:
          `As compras representam ${share.toFixed(1)}% das entradas.`
      });
    }
  }

  if (
    ctx.managementReport?.averageTicket > 0 &&
    ctx.managementReport.averageTicket < 20
  ) {
    problems.push({
      score: 1000,
      title: 'Ticket médio baixo',
      reason:
        'A operação depende de volume para gerar resultado.'
    });
  }

  const biggest =
    problems.sort((a,b) => b.score - a.score)[0];

  if (!biggest) {
    return `
Nenhum problema estrutural relevante foi identificado.
`.trim();
  }

  return `
🚨 MAIOR PROBLEMA ATUAL

━━━━━━━━━━━━━━━━━━

${biggest.title}

━━━━━━━━━━━━━━━━━━

🧠 Minha análise

${biggest.reason}

━━━━━━━━━━━━━━━━━━

🎯 Minha recomendação

Este é o primeiro ponto que eu atacaria antes de qualquer outra iniciativa.
`.trim();
};

// @desc    Ask IA Bebcom
// @route   POST /api/ia/ask
const askIABebcom = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: 'Pergunta é obrigatória.',
      });
    }

   const specificDatePeriod = getSpecificDatePeriod(question);
   const relativePeriod = getRelativePeriod(question);
   const comparisonPeriods = getComparisonPeriods(question);
   const analyticalPeriod = getAnalyticalPeriod(question);

    let period;
    let ctx;
    let previousCtx;
    let historicalContexts = [];
    let historicalMemory = {
       available: false,
       periodsAnalyzed: 0,
       memories: [
         'Ainda não há períodos históricos suficientes para identificar padrões multiperíodo.',
      ],
    };

    let seasonalityAnalysis = {
  available: false,
  confidence: 'Baixa',
  currentRank: null,
  totalPeriods: 0,
  strongestMonths: [],
  weakestMonths: [],
  reading:
    'Ainda não há meses suficientes para identificar sazonalidade com segurança.',
  recommendation:
    'Alimente mais meses completos para melhorar a leitura sazonal.',
};

   let opportunityAnalysis = {
      opportunities: [],
      mainOpportunity: null,
};

  if (specificDatePeriod) {
  period = {
    month: null,
    year: null,
    start: specificDatePeriod.start,
    end: specificDatePeriod.end,
  };

  ctx = await buildContext(period);
  ctx.periodLabel = specificDatePeriod.label;
  previousCtx = { ...ctx };

} else if (comparisonPeriods) {
  const limitDay = getPartialComparisonLimitDay(
    question,
    comparisonPeriods.current
  );

  let currentPeriod = comparisonPeriods.current;
  let comparePeriod = comparisonPeriods.compare;

  if (limitDay) {
    const currentEndDay = Math.min(
      limitDay,
      new Date(currentPeriod.year, currentPeriod.month, 0).getDate()
    );

    const compareEndDay = Math.min(
      limitDay,
      new Date(comparePeriod.year, comparePeriod.month, 0).getDate()
    );

    currentPeriod = {
      ...currentPeriod,
      end: new Date(
        currentPeriod.year,
        currentPeriod.month - 1,
        currentEndDay,
        23,
        59,
        59,
        999
      ),
      customLabel: `${getMonthLabel(currentPeriod.month, currentPeriod.year)} até dia ${currentEndDay}`,
    };

    comparePeriod = {
      ...comparePeriod,
      end: new Date(
        comparePeriod.year,
        comparePeriod.month - 1,
        compareEndDay,
        23,
        59,
        59,
        999
      ),
      customLabel: `${getMonthLabel(comparePeriod.month, comparePeriod.year)} até dia ${compareEndDay}`,
    };
  }

  period = currentPeriod;
  ctx = await buildContext(currentPeriod);
  previousCtx = await buildContext(comparePeriod);

} else if (relativePeriod) {
  period = {
    month: null,
    year: null,
    start: relativePeriod.start,
    end: relativePeriod.end,
  };

  ctx = await buildContext(period);
  ctx.periodLabel = relativePeriod.label;
  previousCtx = { ...ctx };

} else if (analyticalPeriod) { 
  period = {
    month: null,
    year: analyticalPeriod.year,
    start: analyticalPeriod.start,
    end: analyticalPeriod.end,
  };

  ctx = await buildContext(period);
  ctx.periodLabel = analyticalPeriod.label;
  previousCtx = { ...ctx };
} else {
     period = getPeriodFromQuestion(question);

const previousMonth =
  period.month === 1 ? 12 : period.month - 1;

const previousYear =
  period.month === 1 ? period.year - 1 : period.year;

let currentPeriod = period;

let previousPeriod = {
  month: previousMonth,
  year: previousYear,
  start: new Date(previousYear, previousMonth - 1, 1),
  end: new Date(previousYear, previousMonth, 0, 23, 59, 59, 999),
};

const limitDay =
  getPartialComparisonLimitDay(question, period);

if (limitDay) {
  const currentEndDay = Math.min(
    limitDay,
    new Date(period.year, period.month, 0).getDate()
  );

  const previousEndDay = Math.min(
    limitDay,
    new Date(previousYear, previousMonth, 0).getDate()
  );

  currentPeriod = {
    ...period,
    end: new Date(
      period.year,
      period.month - 1,
      currentEndDay,
      23,
      59,
      59,
      999
    ),
    customLabel: `${getMonthLabel(period.month, period.year)} até dia ${currentEndDay}`,
  };

  previousPeriod = {
    ...previousPeriod,
    end: new Date(
      previousYear,
      previousMonth - 1,
      previousEndDay,
      23,
      59,
      59,
      999
    ),
    customLabel: `${getMonthLabel(previousMonth, previousYear)} até dia ${previousEndDay}`,
  };
}

period = currentPeriod;
ctx = await buildContext(currentPeriod);
previousCtx = await buildContext(previousPeriod);
    }

     if (period?.month && period?.year) {
  historicalContexts = await buildHistoricalContexts(period, 6);

  historicalMemory = buildHistoricalMemory(ctx, historicalContexts);
  seasonalityAnalysis = buildSeasonalityAnalysis(ctx, historicalContexts);
} 

    const analyticalInsights = buildAnalyticalInsights(ctx, previousCtx);
    const operationalTrends = buildOperationalTrend(ctx, previousCtx);
    const temporalMemories = buildTemporalOperationalMemory(ctx, previousCtx);
    const operationalBehavior = buildOperationalBehavior(ctx);
    const strategicRecommendations = buildStrategicRecommendations(ctx);
    const operationalPlan = buildOperationalPlan(ctx);
    const strategicSimulations = buildStrategicSimulation(ctx);
    const executiveDecisions = buildExecutiveDecision(ctx);
    const executiveMemory = buildExecutiveMemory(ctx, previousCtx);
    const executiveResponseStyle = buildExecutiveResponseStyle(question);
    const operationalScore = buildOperationalScore(ctx, previousCtx);
    opportunityAnalysis = buildOpportunityAnalysis(ctx, operationalScore, historicalMemory);
    const operationalPriorities = buildOperationalPriorities(ctx, previousCtx);
    const operationalAlerts = buildOperationalAlerts(ctx, previousCtx);
    const actionPlan = buildActionPlan(ctx, operationalScore, operationalPriorities, strategicRecommendations);
    const lowerQuestion = question.toLowerCase();
    const institutionalAnswer =
  buildInstitutionalMemoryAnswer(
    question,
    ctx
  );

if (institutionalAnswer) {

  updateExecutiveContext({
    intent: 'institutional_memory',
    topic: 'institutional_memory',
    periodLabel: ctx.periodLabel,
    summary:
      'Resposta baseada na memória institucional da Bebcom.',
    recommendedNextStep:
      'Relacionar experiência histórica com situação atual.',
    lastAnswerType:
      'institutional_memory',
  });

  return res.json({
    answer: institutionalAnswer,
  });
}
    const followUpAnswer =
  isFollowUpQuestion(question)
    ? buildFollowUpAnswer(question, ctx)
    : null;

if (followUpAnswer) {
  return res.json({
    answer: followUpAnswer,
  });
}

let equivalentPreviousCtx = previousCtx;

if (
  ctx.month &&
  ctx.year &&
  ctx.month === new Date().getMonth() + 1 &&
  ctx.year === new Date().getFullYear()
) {
  const today = new Date();
  const currentDay = today.getDate();

  const previousMonth = ctx.month === 1 ? 12 : ctx.month - 1;
  const previousYear = ctx.month === 1 ? ctx.year - 1 : ctx.year;

  const equivalentPreviousPeriod = {
    month: previousMonth,
    year: previousYear,
    start: new Date(previousYear, previousMonth - 1, 1),
    end: new Date(previousYear, previousMonth - 1, currentDay, 23, 59, 59, 999),
  };

  equivalentPreviousCtx = await buildContext(equivalentPreviousPeriod);
  equivalentPreviousCtx.periodLabel = `${getMonthLabel(previousMonth, previousYear)} até dia ${currentDay}`;
}

const deepDiveAnswer =
  buildDeepDiveAnswer(
    question,
    ctx,
    equivalentPreviousCtx
  );

if (deepDiveAnswer) {
  return res.json({
    answer: deepDiveAnswer,
  });
}

const dataReliabilityAnswer =
  await buildDataReliabilityAnswer(
    question,
    ctx
  );

if (dataReliabilityAnswer) {
  return res.json({
    answer: dataReliabilityAnswer,
  });
}

const managementReportRankingAnswer =
  await buildManagementReportRankingAnswer(
    question,
    ctx
  );

if (managementReportRankingAnswer) {
  return res.json({
    answer: managementReportRankingAnswer,
  });
}

const dailyRevenueRankingAnswer =
  await buildDailyRevenueRankingAnswer(
    question,
    ctx
  );

if (dailyRevenueRankingAnswer) {
  return res.json({
    answer: dailyRevenueRankingAnswer,
  });
}

const managementReportComparisonAnswer =
  await buildManagementReportComparisonAnswer(
    question,
    ctx
  );

if (managementReportComparisonAnswer) {
  return res.json({
    answer: managementReportComparisonAnswer,
  });
}

const dynamicExecutiveMemoryAnswer =
 await buildDynamicExecutiveMemoryAnswer(
  question,
  ctx,
  equivalentPreviousCtx
);

if (dynamicExecutiveMemoryAnswer) {
  return res.json({
    answer: dynamicExecutiveMemoryAnswer,
  });
}
    
const operationalAnalyticsAnswer =
  buildOperationalAnalyticsAnswer(
    question,
    ctx,
    equivalentPreviousCtx
  );

if (operationalAnalyticsAnswer) {
  return res.json({
    answer: operationalAnalyticsAnswer,
  });
}
    
     const goalHorizon = (() => {
  if (
    lowerQuestion.includes('hoje') ||
    lowerQuestion.includes('diária') ||
    lowerQuestion.includes('diaria')
  ) return 'daily';

  if (
    lowerQuestion.includes('semana') ||
    lowerQuestion.includes('semanal')
  ) return 'weekly';

  if (
    lowerQuestion.includes('mês') ||
    lowerQuestion.includes('mes') ||
    lowerQuestion.includes('mensal')
  ) return 'monthly';

  return 'general';
})();
    const smartGoal = buildSmartGoal(ctx, operationalScore, actionPlan, strategicSimulations, goalHorizon);

   const presidentStyle = detectPresidentStyle(question);

   const presidentDecision = buildPresidentDecision(ctx, operationalScore, operationalAlerts, strategicRecommendations, smartGoal, presidentStyle);
    
    const financialIntent = extractFinancialIntent(question);

    const advancedIntent = detectAdvancedIntent(question);

    const isMorningQuestion = lowerQuestion.includes('bom dia');

    const isOperationQuestion =
      lowerQuestion.includes('como está a operação');

    const isProfitStatusQuestion =
  lowerQuestion.includes('ganhando dinheiro') ||
  lowerQuestion.includes('perdendo dinheiro') ||
  lowerQuestion.includes('estou ganhando') ||
  lowerQuestion.includes('estou perdendo') ||
  lowerQuestion.includes('estou lucrando') ||
  lowerQuestion.includes('tendo lucro') ||
  lowerQuestion.includes('tendo prejuizo') ||
  lowerQuestion.includes('tendo prejuízo');

 const isAlertQuestion =
  lowerQuestion.includes('alerta') ||
  lowerQuestion.includes('alertas') ||
  lowerQuestion.includes('risco') ||
  lowerQuestion.includes('riscos') ||
  lowerQuestion.includes('preocupa') ||
  lowerQuestion.includes('preocupando') ||
  lowerQuestion.includes('me preocupar') ||
  lowerQuestion.includes('o que devo me preocupar') ||
  lowerQuestion.includes('existe algo') ||
  lowerQuestion.includes('situação crítica') ||
  lowerQuestion.includes('situacao critica');

const isExecutiveAdviceQuestion =
  lowerQuestion.includes('o que você faria') ||
  lowerQuestion.includes('o que faria') ||
  lowerQuestion.includes('sua opinião') ||
  lowerQuestion.includes('sua opiniao') ||
  lowerQuestion.includes('qual sua opinião') ||
  lowerQuestion.includes('qual sua opiniao') ||
  lowerQuestion.includes('o que devo fazer') ||
  lowerQuestion.includes('o que você recomenda') ||
  lowerQuestion.includes('o que recomenda') ||
  lowerQuestion.includes('o que eu não deveria fazer') ||
  lowerQuestion.includes('o que eu nao deveria fazer') ||
  lowerQuestion.includes('o que não devo fazer') ||
  lowerQuestion.includes('o que nao devo fazer') || 
  lowerQuestion.includes('o que devo fazer primeiro') ||
  lowerQuestion.includes('o que faço primeiro') ||
  lowerQuestion.includes('o que faco primeiro') ||
  lowerQuestion.includes('por onde começo') ||
  lowerQuestion.includes('por onde comeco');

    const isRecoveryPlanQuestion =
  lowerQuestion.includes('como saio dessa situação') ||
  lowerQuestion.includes('como sair dessa situação') ||
  lowerQuestion.includes('como recuperar o caixa') ||
  lowerQuestion.includes('plano de recuperação') ||
  lowerQuestion.includes('plano de recuperacao') ||
  lowerQuestion.includes('qual plano você faria') ||
  lowerQuestion.includes('qual plano voce faria') ||
  lowerQuestion.includes('monte um plano') ||
  lowerQuestion.includes('o que devo fazer agora');

  const isAutomaticActionPlanQuestion =
  lowerQuestion.includes('plano de ação automático') ||
  lowerQuestion.includes('plano de acao automatico') ||
  lowerQuestion.includes('monte um plano de ação') ||
  lowerQuestion.includes('monte um plano de acao') ||
  lowerQuestion.includes('quais 3 ações') ||
  lowerQuestion.includes('quais 3 acoes') ||
  lowerQuestion.includes('3 ações práticas') ||
  lowerQuestion.includes('3 acoes praticas') ||
  lowerQuestion.includes('o que faço agora com base na memória') ||
  lowerQuestion.includes('o que faco agora com base na memoria') ||
  lowerQuestion.includes('com base na memória intuitiva') ||
  lowerQuestion.includes('com base na memoria intuitiva') ||
  lowerQuestion.includes('baseado na memória intuitiva') ||
  lowerQuestion.includes('baseado na memoria intuitiva') ||
  lowerQuestion.includes('o que faço agora') ||
  lowerQuestion.includes('o que faco agora');

    const isExecutivePriorityQuestion =
  lowerQuestion.includes('prioridade executiva') ||
  lowerQuestion.includes('qual minha prioridade') ||
  lowerQuestion.includes('qual a prioridade') ||
  lowerQuestion.includes('o que devo priorizar') ||
  lowerQuestion.includes('o que fazer primeiro') ||
  lowerQuestion.includes('o que eu faria primeiro') ||
  lowerQuestion.includes('por onde começo') ||
  lowerQuestion.includes('por onde comeco');

    const isStrategicMemoryQuestion =
  lowerQuestion.includes('memória estratégica') ||
  lowerQuestion.includes('memoria estrategica') ||
  lowerQuestion.includes('o que a ia percebe') ||
  lowerQuestion.includes('o que você percebe') ||
  lowerQuestion.includes('o que voce percebe') ||
  lowerQuestion.includes('padrões se repetem') ||
  lowerQuestion.includes('padroes se repetem') ||
  lowerQuestion.includes('padrão da empresa') ||
  lowerQuestion.includes('padrao da empresa') ||
  lowerQuestion.includes('o que acontece com frequência') ||
  lowerQuestion.includes('o que acontece com frequencia');

    const isHistoricalTrendQuestion =
  lowerQuestion.includes('tendência histórica') ||
  lowerQuestion.includes('tendencias historicas') ||
  lowerQuestion.includes('tendências históricas') ||
  lowerQuestion.includes('como a empresa evoluiu') ||
  lowerQuestion.includes('como minha empresa evoluiu') ||
  lowerQuestion.includes('como a bebcom evoluiu') ||
  lowerQuestion.includes('conte a história da bebcom') ||
  lowerQuestion.includes('conte a historia da bebcom') ||
  lowerQuestion.includes('qual fase estou vivendo') ||
  lowerQuestion.includes('em que fase estou') ||
  lowerQuestion.includes('estou melhorando') ||
  lowerQuestion.includes('estamos melhorando') ||
  lowerQuestion.includes('evolução da empresa') ||
  lowerQuestion.includes('evolucao da empresa');

    const isCEOQuestion =
  lowerQuestion.includes('modo ceo') ||
  lowerQuestion.includes('análise completa') ||
  lowerQuestion.includes('analise completa') ||
  lowerQuestion.includes('analise a empresa') ||
  lowerQuestion.includes('analise minha empresa') ||
  lowerQuestion.includes('como está a bebcom') ||
  lowerQuestion.includes('como esta a bebcom') ||
  lowerQuestion.includes('reunião gerencial') ||
  lowerQuestion.includes('reuniao gerencial') ||
  lowerQuestion.includes('visão geral da empresa') ||
  lowerQuestion.includes('visao geral da empresa');

    const isRootCauseQuestion =
  lowerQuestion.includes('por que meu resultado piorou') ||
  lowerQuestion.includes('porque meu resultado piorou') ||
  lowerQuestion.includes('qual a causa principal') ||
  lowerQuestion.includes('o que está causando') ||
  lowerQuestion.includes('o que esta causando') ||
  lowerQuestion.includes('por que estou ganhando menos') ||
  lowerQuestion.includes('por que meu lucro caiu') ||
  lowerQuestion.includes('o que está pressionando') ||
  lowerQuestion.includes('o que esta pressionando');

    const isTrendForecastQuestion =
  lowerQuestion.includes('tendencia') ||
  lowerQuestion.includes('tendência') ||
  lowerQuestion.includes('como vou fechar') ||
  lowerQuestion.includes('como devo terminar') ||
  lowerQuestion.includes('como vou terminar') ||
  lowerQuestion.includes('previsao') ||
  lowerQuestion.includes('previsão') ||
  lowerQuestion.includes('estou melhorando') ||
  lowerQuestion.includes('estou piorando') ||
  lowerQuestion.includes('continuar assim') ||
  lowerQuestion.includes('fecha positivo') ||
  lowerQuestion.includes('fecha negativo') ||
  lowerQuestion.includes('fechar positivo') ||
  lowerQuestion.includes('fechar negativo') ||
  lowerQuestion.includes('projeção de resultado') ||
  lowerQuestion.includes('projecao de resultado') ||
  lowerQuestion.includes('projeção de fechamento') ||
  lowerQuestion.includes('projecao de fechamento');

    const isRiskRadarQuestion =
    lowerQuestion.includes('risco') ||
    lowerQuestion.includes('alerta') ||
    lowerQuestion.includes('perigo') ||
    lowerQuestion.includes('atenção') ||
    lowerQuestion.includes('atencao') ||
    lowerQuestion.includes('radar') ||
    lowerQuestion.includes('segura') ||
    lowerQuestion.includes('saudável') ||
    lowerQuestion.includes('saudavel');

    const isRiskScoreQuestion =
  lowerQuestion.includes('score de risco') ||
  lowerQuestion.includes('nota de risco') ||
  lowerQuestion.includes('qual meu score') ||
  lowerQuestion.includes('nível de risco') ||
  lowerQuestion.includes('nivel de risco');

    const isTrafficLightQuestion =
  lowerQuestion.includes('semaforo') ||
  lowerQuestion.includes('semáforo') ||
  lowerQuestion.includes('status operacional') ||
  lowerQuestion.includes('saude financeira') ||
  lowerQuestion.includes('saúde financeira') ||
  lowerQuestion.includes('zona de risco') ||
  lowerQuestion.includes('operacao saudavel') ||
  lowerQuestion.includes('operação saudável');
    
    const isAttentionQuestion =
      lowerQuestion.includes('o que merece atenção');

    const isPanoramaQuestion =
      lowerQuestion.includes('panorama');

    const isMonthQuestion =
      lowerQuestion.includes('como está o mês') ||
      lowerQuestion.includes('resumo do mês');

    const isScoreQuestion =
  lowerQuestion.includes('score') ||
  lowerQuestion.includes('nota') ||
  lowerQuestion.includes('qual nota') ||
  lowerQuestion.includes('saúde da empresa') ||
  lowerQuestion.includes('saude da empresa') ||
  lowerQuestion.includes('saúde da operação') ||
  lowerQuestion.includes('saude operacional') ||
  lowerQuestion.includes('saúde operacional') ||
  lowerQuestion.includes('como está a saúde') ||
  lowerQuestion.includes('como você avalia') ||
  lowerQuestion.includes('como voce avalia') ||
  lowerQuestion.includes('avaliaria a operação') ||
  lowerQuestion.includes('avalia a operação') ||
  lowerQuestion.includes('avalia a operacao');

    const isCopilotQuestion =
      isMorningQuestion ||
      isOperationQuestion ||
      isAttentionQuestion ||
      isPanoramaQuestion ||
      isMonthQuestion ||
      isScoreQuestion ||
      lowerQuestion.includes('como estamos');

    let copilotType = 'default';

    if (isMorningQuestion) {
      copilotType = 'morning';
    } else if (isOperationQuestion) {
      copilotType = 'operation';
    } else if (isAttentionQuestion) {
      copilotType = 'attention';
    } else if (isPanoramaQuestion) {
      copilotType = 'panorama';
    } else if (isMonthQuestion) {
      copilotType = 'month';
    } else if (isScoreQuestion) {
      copilotType = 'score';
    }

 const conversationalContextAnswer = buildConversationalContext({
  question,
  intent: advancedIntent,
  ctx,
  mainIndicator: buildMainOperationalIndicator(ctx),
  executiveDecisions,
  strategicRecommendations,
});

if (conversationalContextAnswer) {
  const preservedIntent =
    lastIAContext?.intent &&
    lastIAContext.intent !== 'general'
      ? lastIAContext.intent
      : advancedIntent;

  lastIAContext = {
    intent: preservedIntent,
    periodLabel: ctx.periodLabel,
    question,
  };

  return res.json({
    answer: conversationalContextAnswer,
  });
}
   
 const managerCopilot = buildManagerCopilot({
  type: copilotType,
  currentCtx: ctx,
  operationalPriorities,
  operationalTrends,
  temporalMemories,
  operationalBehavior,
  strategicRecommendations,
  operationalScore,
  operationalAlerts,
});

    const isComparisonQuestion =
      lowerQuestion.includes('compare') ||
      lowerQuestion.includes('compar') ||
      lowerQuestion.includes('versus') ||
      lowerQuestion.includes('vs') ||
      lowerQuestion.includes('em relação a') ||
      lowerQuestion.includes('em relacao a') ||
      lowerQuestion.includes('ficou em relação') ||
      lowerQuestion.includes('ficou em relacao');

    const isDailyBriefing =
      lowerQuestion.includes('resumo do dia') ||
      lowerQuestion.includes('o que posso saber') ||
      lowerQuestion.includes('como estamos hoje');

    const isRelativeQuestion =
      !!relativePeriod || !!specificDatePeriod;

    const isSupplierImpactQuestion =
      lowerQuestion.includes('fornecedor') ||
      lowerQuestion.includes('fornecedores') ||
      lowerQuestion.includes('descrição') ||
      lowerQuestion.includes('descricao') ||
      lowerQuestion.includes('nome do fornecedor');

    const isTopExpensesQuestion =
      lowerQuestion.includes('maiores despesas') ||
      lowerQuestion.includes('maior despesa') ||
      lowerQuestion.includes('principais despesas') ||
      lowerQuestion.includes('maiores gastos') ||
      lowerQuestion.includes('principais gastos');

    const isAccountsPayableQuestion =
      lowerQuestion.includes('contas a pagar') ||
      lowerQuestion.includes('total de contas') ||
      lowerQuestion.includes('pagar da semana') ||
      lowerQuestion.includes('quanto tenho para pagar');

    const isBiggestRiskQuestion =
  lowerQuestion.includes('maior risco') ||
  lowerQuestion.includes('o que mais me preocupa') ||
  lowerQuestion.includes('maior preocupação') ||
  lowerQuestion.includes('maior preocupacao') ||
  lowerQuestion.includes('o que preocupa') ||
  lowerQuestion.includes('qual o risco') ||
  lowerQuestion.includes('qual meu risco');

  const isBiggestProblemQuestion =
  lowerQuestion.includes('maior problema') ||
  lowerQuestion.includes('onde esta meu problema') ||
  lowerQuestion.includes('onde está meu problema') ||
  lowerQuestion.includes('principal problema') ||
  lowerQuestion.includes('maior gargalo');

   
    const invalidSupplierTerms = [
  'proximos 3 dias',
  'próximos 3 dias',
  'proximos 5 dias',
  'próximos 5 dias',
  'proximos 7 dias',
  'próximos 7 dias',
  '3 dias',
  '5 dias',
  '7 dias',
];

let supplierPayableName =
  extractSupplierPayableName(question);

if (
  supplierPayableName &&
  invalidSupplierTerms.includes(
    supplierPayableName.toLowerCase()
  )
) {
  supplierPayableName = null;
}

const wantsNext3Days =
  lowerQuestion.includes('próximos 3 dias') ||
  lowerQuestion.includes('proximos 3 dias');

const wantsNext5Days =
  lowerQuestion.includes('próximos 5 dias') ||
  lowerQuestion.includes('proximos 5 dias');

const wantsNext7Days =
  lowerQuestion.includes('próximos 7 dias') ||
  lowerQuestion.includes('proximos 7 dias');

if (wantsNext3Days) {
  return res.json({
    answer: buildUpcomingDueAnswer(ctx, 3),
  });
}

if (wantsNext5Days) {
  return res.json({
    answer: buildUpcomingDueAnswer(ctx, 5),
  });
}

if (wantsNext7Days) {
  return res.json({
    answer: buildUpcomingDueAnswer(ctx, 7),
  });
}
    
const isSupplierPayableQuestion =
  !!supplierPayableName &&
  (
    lowerQuestion.includes('pagar') ||
    lowerQuestion.includes('devo') ||
    lowerQuestion.includes('contas a pagar') ||
    lowerQuestion.includes('boleto') ||
    lowerQuestion.includes('boletos') ||
    lowerQuestion.includes('vencimento') ||
    lowerQuestion.includes('vencimentos')
  );

    const payableDuePeriod = getPayableDuePeriodFromQuestion(question);

const isPayablesDueDateQuestion =
  !!payableDuePeriod &&
  !extractSupplierPayableName(question) &&
  (
    lowerQuestion.includes('vence') ||
    lowerQuestion.includes('vencem') ||
    lowerQuestion.includes('vencimento') ||
    lowerQuestion.includes('vencimentos') ||
    lowerQuestion.includes('contas a pagar') ||
    lowerQuestion.includes('quanto pagar') ||
    lowerQuestion.includes('quanto tenho para pagar')
  );
    const isOpenSupplierRankingQuestion =
  (
    lowerQuestion.includes('ranking') ||
    lowerQuestion.includes('maiores fornecedores') ||
    lowerQuestion.includes('fornecedores em aberto') ||
    lowerQuestion.includes('fornecedor mais pesa') ||
    lowerQuestion.includes('quem mais pesa') ||
    lowerQuestion.includes('top fornecedores') ||
    lowerQuestion.includes('maior fornecedor')
  ) &&
  (
    lowerQuestion.includes('pagar') ||
    lowerQuestion.includes('contas') ||
    lowerQuestion.includes('aberto') ||
    lowerQuestion.includes('pendente') ||
    lowerQuestion.includes('pendentes')
  );

    const isPaymentPriorityQuestion =
  lowerQuestion.includes('quem devo pagar') ||
  lowerQuestion.includes('pagar primeiro') ||
  lowerQuestion.includes('quem pagar primeiro') ||
  lowerQuestion.includes('quais contas são mais urgentes') ||
  lowerQuestion.includes('quais contas sao mais urgentes') ||
  lowerQuestion.includes('mais urgentes') ||
  lowerQuestion.includes('atenção hoje') ||
  lowerQuestion.includes('atencao hoje') ||
  lowerQuestion.includes('vencimentos próximos') ||
  lowerQuestion.includes('vencimentos proximos') ||
  lowerQuestion.includes('prioridade de pagamento');

const isCashForecastQuestion =
  lowerQuestion.includes('consigo pagar') ||
  lowerQuestion.includes('caixa cobre') ||
  lowerQuestion.includes('vou faltar dinheiro') ||
  lowerQuestion.includes('previsão de caixa') ||
  lowerQuestion.includes('previsao de caixa') ||
  lowerQuestion.includes('saldo projetado');

    const isDecisionSimulationQuestion =
  lowerQuestion.includes('quanto sobra') ||
  lowerQuestion.includes('se eu pagar tudo') ||
  lowerQuestion.includes('após os vencimentos') ||
  lowerQuestion.includes('apos os vencimentos') ||
  lowerQuestion.includes('depois dos pagamentos') ||
  lowerQuestion.includes('saldo após pagamentos') ||
  lowerQuestion.includes('saldo apos pagamentos');
  
    const isSuggestionQuestion =
      lowerQuestion.includes('pode sugerir') ||
      lowerQuestion.includes('sugere algum') ||
      lowerQuestion.includes('me sugira') ||
      lowerQuestion.includes('alguma sugestão') ||
      lowerQuestion.includes('alguma sugestao');

    const isExecutivePlanQuestion =
  lowerQuestion.includes('monte um plano') ||
  lowerQuestion.includes('plano executivo') ||
  lowerQuestion.includes('plano geral') ||
  lowerQuestion.includes('plano completo') ||
  lowerQuestion.includes('organize um plano') ||
  lowerQuestion.includes('faça um plano') ||
  lowerQuestion.includes('faca um plano');

    const bebcomHistoryAnswer =
  buildBebcomHistoryAnswer(question);

if (bebcomHistoryAnswer) {
  return res.json({
    answer: bebcomHistoryAnswer,
  });
}

let temporalCtx = ctx;

if (isAdvancedTemporalQuestion(question)) {
  const advancedPeriod =
    getAdvancedHistoricalPeriod(question);

  if (advancedPeriod) {
    temporalCtx =
      await buildContext(advancedPeriod);
  }
}

const ticketImprovementAnswer =
  buildTicketImprovementAnswer(question, ctx);

if (ticketImprovementAnswer) {
  return res.json({
    answer: ticketImprovementAnswer,
  });
}

const historicalAggregatorAnswer =
  await buildHistoricalAggregatorAnswer(
    question,
    temporalCtx
  );

if (historicalAggregatorAnswer) {
  return res.json({
    answer: historicalAggregatorAnswer,
  });
}

// ✅ V11.5.5.1 — Diagnóstico de causa antes da tendência histórica
if (isRootCauseQuestion) {
  const rootCauseAnswer = buildRootCauseAnswer(
    ctx,
    previousCtx
  );

  updateExecutiveContext({
    intent: 'root_cause',
    topic: 'diagnostico_causa',
    periodLabel: ctx.periodLabel,
    summary: rootCauseAnswer.slice(0, 500),
    recommendedNextStep:
      'Transformar o diagnóstico de causa em plano de ação.',
    lastAnswerType: 'root_cause',
  });

  return res.json({
    answer: rootCauseAnswer,
  });
}

if (isTrendForecastQuestion) {

  const trendAnswer =
    buildTrendForecastAnswer(
      ctx,
      previousCtx
    );

  updateExecutiveContext({
    intent: 'trend_forecast',
    topic: 'previsao_tendencia',
    periodLabel: ctx.periodLabel,
    summary: trendAnswer.slice(0, 500),
    recommendedNextStep:
      'Avaliar riscos da tendência projetada.',
    lastAnswerType: 'trend_forecast',
  });

  return res.json({
    answer: trendAnswer,
  });
}

if (isTrafficLightQuestion) {
  const answer =
    buildExecutiveTrafficLightAnswer(ctx);

  updateExecutiveContext({
    intent: 'traffic_light',
    topic: 'semaforo_executivo',
    periodLabel: ctx.periodLabel,
    summary: answer.slice(0, 500),
    recommendedNextStep:
      'Analisar riscos identificados.',
    lastAnswerType: 'traffic_light',
  });

  return res.json({
    answer,
  });
}

if (isRiskScoreQuestion) {
  return res.json({
    answer: buildRiskScoreAnswer(ctx),
  });
}

if (isRiskRadarQuestion) {
  return res.json({
    answer: buildOperationalRiskRadarAnswer(ctx),
  });
}

const historicalTrendAnswer =
  await buildHistoricalTrendPointAnswer(
    question,
    temporalCtx
  );

if (historicalTrendAnswer) {
  return res.json({
    answer: historicalTrendAnswer,
  });
}
    
const temporalAnalyticsAnswer =
  buildTemporalAnalyticsAnswer(
    question,
    temporalCtx
  );

if (temporalAnalyticsAnswer) {
  return res.json({
    answer: temporalAnalyticsAnswer,
  });
}

    const educationalAnswer = getEducationalAnswer(question);
    
    const knowledgeBaseAnswer = getKnowledgeBaseAnswer(question, ctx);

 if (isHistoricalTrendQuestion) {
  const historicalNarrativeAnswer =
    await buildHistoricalTrendAnswer();

  updateExecutiveContext({
    intent: 'historical_trend',
    topic: 'tendencias_historicas',
    periodLabel: ctx.periodLabel,
    summary: historicalNarrativeAnswer.slice(0, 500),
    recommendedNextStep:
      'Relacionar a fase atual com a evolução histórica da Bebcom.',
    lastAnswerType: 'historical_trend',
  });

  return res.json({
    answer: historicalNarrativeAnswer,
  });
}

  const advancedIntentAnswer = buildAdvancedIntentAnswer({
  intent: advancedIntent,
  question,
  ctx,
  previousCtx,
  analyticalInsights,
  operationalTrends,
  temporalMemories,
  operationalBehavior,
  strategicRecommendations,
  operationalPlan,
  strategicSimulations,
  executiveDecisions,
  executiveMemory,
  historicalMemory,
  seasonalityAnalysis,
  opportunityAnalysis,
  executiveResponseStyle,
  actionPlan,
  smartGoal,
  presidentDecision,
  operationalPriorities,
  operationalAlerts,
  operationalScore,
});

  const intuitiveMemoryAnswer =
  await buildIntuitiveMemoryAnswer(
    question,
    ctx
  );

  const wantsExpenseGrowth =
  lowerQuestion.includes('despesa cresceu') ||
  lowerQuestion.includes('despesas cresceram') ||
  lowerQuestion.includes('aumentou de despesa') ||
  lowerQuestion.includes('aumentaram de despesa') ||
  lowerQuestion.includes('o que aumentou de despesa') ||
  lowerQuestion.includes('quais despesas cresceram');

const wantsGrowth =
  !wantsExpenseGrowth &&
  (
    lowerQuestion.includes('mais cresceu') ||
    lowerQuestion.includes('cresceu') ||
    lowerQuestion.includes('aumentando') ||
    lowerQuestion.includes('esta aumentando') ||
    lowerQuestion.includes('está aumentando')
  );

const wantsDecline =
  lowerQuestion.includes('mais caiu') ||
  lowerQuestion.includes('caiu') ||
  lowerQuestion.includes('diminuindo') ||
  lowerQuestion.includes('esta diminuindo') ||
  lowerQuestion.includes('está diminuindo');

const wantsGrowthDeclineQuestion =
  wantsGrowth || wantsDecline;

 
    let answer = '';

const earlySupplierPayableName =
  extractSupplierPayableName(question);

if (earlySupplierPayableName) {
  const earlySupplierPayableAnswer =
    buildSupplierPayableAnswer(
      ctx,
      earlySupplierPayableName
    );

  return res.json({
    answer: earlySupplierPayableAnswer,
  });
}

const genericPayablesAnswer =
  buildGenericPayablesAnswer(ctx, question);

if (managementReportRankingAnswer) {
  answer = managementReportRankingAnswer;
} else if (wantsExpenseGrowth) {
  answer = buildExpenseGrowthAnswer(
    ctx,
    previousCtx
  );
} else if (wantsGrowthDeclineQuestion) {
  answer = buildGrowthDeclineAnswer(
    ctx,
    previousCtx,
    wantsGrowth ? 'growth' : 'decline'
  );
} else if (isBiggestRiskQuestion) {
  answer = buildBiggestRiskAnswer(ctx);
} else if (isBiggestProblemQuestion) {
  answer = buildBiggestProblemAnswer(ctx);
} else if (genericPayablesAnswer) {
  answer = genericPayablesAnswer;
} else if (intuitiveMemoryAnswer) {
  answer = intuitiveMemoryAnswer;
} else if (isStrategicMemoryQuestion) {
  answer = buildStrategicMemoryAnswer(historicalContexts);
} else if (isCEOQuestion) {
  answer = buildCEOAnswer(
    ctx,
    previousCtx,
    operationalScore,
    operationalAlerts,
    operationalPriorities
  );
} else if (isAutomaticActionPlanQuestion) {
  answer = await buildAutomaticActionPlanAnswer(ctx);

} else if (isExecutivePlanQuestion) {
  answer = buildExecutivePlanAnswer(
    ctx,
    operationalScore,
    operationalPriorities
  );

} else if (isRecoveryPlanQuestion) {
  answer = buildRecoveryPlanAnswer(
    ctx,
    operationalScore,
    operationalPriorities,
    strategicRecommendations
  );
  } else if (isExecutivePriorityQuestion) {
  answer = buildExecutivePriorityAnswer(ctx);
} else if (isExecutiveAdviceQuestion) {
  answer = buildExecutiveAdviceAnswer(
    ctx,
    previousCtx
  );
} else if (isAlertQuestion) {
  answer = buildAlertsAnswer(ctx, previousCtx);
} else if (isProfitStatusQuestion) {
  answer = buildProfitStatusAnswer(ctx);
} else if (
  advancedIntentAnswer &&
  advancedIntent !== 'educational'
) {
  answer = advancedIntentAnswer;
} else if (isCopilotQuestion) {
      answer = managerCopilot;
    } else if (
      financialIntent.wantsTotal &&
      financialIntent.category
    ) {
      answer = buildCategoryTotalAnswer(
        ctx,
        financialIntent.category
      );
  } else if (isDecisionSimulationQuestion) {
  answer = buildDecisionSimulationAnswer(ctx);

} else if (isCashForecastQuestion) {
  answer = buildCashForecastAnswer(ctx);

} else if (isPaymentPriorityQuestion) {
  answer = buildPaymentPriorityAnswer(ctx);

} else if (isOpenSupplierRankingQuestion) {
  answer = buildOpenSupplierRankingAnswer(ctx);

} else if (isSupplierPayableQuestion) {
  answer = buildSupplierPayableAnswer(
    ctx,
    supplierPayableName
  );

} else if (isPayablesDueDateQuestion) {
  answer = buildPayablesDueDateAnswer(
    ctx,
    payableDuePeriod
  ); 
    } else if (
      financialIntent.wantsTotal &&
      financialIntent.supplier
    ) {
      answer = buildSupplierTotalAnswer(
        ctx,
        financialIntent.supplier
      );
    } else if (
      isComparisonQuestion &&
      (
        lowerQuestion.includes('ticket') ||
        lowerQuestion.includes('médio') ||
        lowerQuestion.includes('medio') ||
        lowerQuestion.includes('comanda')
      )
    ) {
      answer = buildTicketComparisonAnswer(ctx, previousCtx);
    } else if (isComparisonQuestion) {
      answer = buildComparisonAnswer(ctx, previousCtx);
    } else if (isRelativeQuestion) {
      answer = buildRelativePeriodAnswer(ctx);
    } else if (isSupplierImpactQuestion) {
      answer = buildSupplierImpactAnswer(ctx);
    } else if (isTopExpensesQuestion) {
      answer = buildTopExpensesAnswer(ctx);
    } else if (
      lowerQuestion.includes('ticket') ||
      lowerQuestion.includes('médio') ||
      lowerQuestion.includes('medio') ||
      lowerQuestion.includes('comanda')
    ) {
      answer = buildTicketAnswer(ctx);
    } else if (isAccountsPayableQuestion) {
      answer = `
Contas a pagar pendentes/vencidas em ${ctx.periodLabel}:

Total: ${formatCurrency(ctx.pendingPayable)}

Minha leitura:
Esse valor representa compromissos financeiros em aberto no sistema. Ele deve ser acompanhado junto com o saldo de caixa, entradas previstas e prioridades de pagamento.
      `.trim();
    } else if (isSuggestionQuestion) {
      answer = `
Sugestões práticas para aumentar o ticket médio:

1. Combo bebida + energético + gelo.
2. Kit fim de semana com cerveja + gelo + carvão.
3. Copão + energético adicional.
4. Oferta “complete seu pedido” no delivery.
5. Combo de conveniência: bebida + gelo + petisco.

Minha sugestão inicial:
Comece com combos simples, fáceis de entender e com produtos de boa saída.
      `.trim();
   } else if (isDailyBriefing) {
  answer = buildDailyBriefingAnswer(ctx);

} else {
  const inventoryIntentAnswer =
    buildInventoryIntentAnswer(question, ctx);

  if (inventoryIntentAnswer) {
    answer = inventoryIntentAnswer;

  } else if (
    lowerQuestion.includes('fluxo') ||
    lowerQuestion.includes('caixa')
  ) {
    answer = buildFlowAnswer(ctx);

  } else if ( 
      lowerQuestion.includes('despesa') ||
      lowerQuestion.includes('reduzir') ||
      lowerQuestion.includes('custo') ||
      lowerQuestion.includes('gasto')
    ) {
      answer = buildExpenseAnswer(ctx);
    } else if (
  lowerQuestion.includes('estoque') ||
  lowerQuestion.includes('mercadoria') ||
  lowerQuestion.includes('compra')
) {
  const inventoryIntentAnswer =
    buildInventoryIntentAnswer(question, ctx);

  answer =
    inventoryIntentAnswer ||
    buildInventoryAnswer(ctx);
    } else if (
      lowerQuestion.includes('operação') ||
      lowerQuestion.includes('operacao') ||
      lowerQuestion.includes('atenção') ||
      lowerQuestion.includes('atencao') ||
      lowerQuestion.includes('ponto')
    ) {
      answer = buildOperationAnswer(ctx);
    } else if (educationalAnswer) {
      answer = educationalAnswer;
    } else if (knowledgeBaseAnswer) {
      answer = knowledgeBaseAnswer;
    } else {
      answer = `
Entendi sua pergunta: "${question}".

Analisei o período ${ctx.periodLabel} em modo leitura segura.

Resumo rápido:
Entradas: ${formatCurrency(ctx.totalIncome)}
Saídas: ${formatCurrency(ctx.totalExpenses)}
Saldo realizado: ${formatCurrency(ctx.balance)}
Contas a pagar pendentes/vencidas: ${formatCurrency(ctx.pendingPayable)}
Ticket médio: ${formatCurrency(ctx.managementReport?.averageTicket || 0)}
Estoque estimado: ${formatCurrency(getInventoryEstimatedPosition(ctx))}

Insights automáticos identificados:
${
  analyticalInsights.length > 0
    ? analyticalInsights.map((i) => `• ${i}`).join('\n')
    : 'Nenhum insight crítico identificado no comparativo atual.'
}

Tendências operacionais:
${
  operationalTrends.length > 0
    ? operationalTrends.map((i) => `• ${i}`).join('\n')
    : 'Ainda não identifiquei tendência operacional relevante no comparativo atual.'
}

Prioridades operacionais:
${
  operationalPriorities.length > 0
    ? operationalPriorities
        .map((item, index) => `${index + 1}. ${item.message}`)
        .join('\n')
    : 'Nenhuma prioridade crítica identificada no período atual.'
}

Alertas automáticos:
${
  operationalAlerts.length > 0
    ? operationalAlerts
        .map(
          (alert) =>
            `⚠️ ${alert.message}`
        )
        .join('\n')
    : 'Nenhum alerta operacional relevante identificado.'
}

Você pode perguntar de forma mais específica, por exemplo:
“Como estava meu fluxo em abril de 2026?”
“Quais despesas pesaram em maio?”
“Como melhorar o ticket médio?”
“Como foi a semana passada?”
      `.trim();
    }
}
   updateExecutiveContext({
  intent: advancedIntent,
  topic:
    isStrategicMemoryQuestion
      ? 'memoria_estrategica'
      : isHistoricalTrendQuestion
        ? 'tendencias_historicas'
        : isCEOQuestion
          ? 'modo_ceo'
          : isRecoveryPlanQuestion
            ? 'plano_recuperacao'
            : isExecutiveAdviceQuestion
              ? 'decisao_executiva'
              : isAlertQuestion
                ? 'alertas'
                : lowerQuestion.includes('fluxo') || lowerQuestion.includes('caixa')
                  ? 'fluxo_caixa'
                  : 'geral',
  periodLabel: ctx.periodLabel,
  summary: answer.slice(0, 500),
  recommendedNextStep:
    'Continue a análise pelo ponto mais crítico identificado na resposta anterior.',
  lastAnswerType:
    isStrategicMemoryQuestion
      ? 'strategic_memory'
      : isHistoricalTrendQuestion
        ? 'historical_trend'
        : isCEOQuestion
          ? 'ceo'
          : isRecoveryPlanQuestion
            ? 'recovery_plan'
            : 'general',
});

    return res.json({
  answer,
  context: {
    month: ctx.month,
    year: ctx.year,
    totalIncome: ctx.totalIncome,
    totalExpenses: ctx.totalExpenses,
    balance: ctx.balance,
    pendingPayable: ctx.pendingPayable,
    pendingReceivable: ctx.pendingReceivable,
    averageTicket:
      ctx.managementReport?.averageTicket || 0,

    inventoryPosition:
      getInventoryEstimatedPosition(ctx),

    inventoryStockBalance:
      getInventoryStockBalance(ctx),
  },
});
  } catch (error) {
    console.error('Erro IA Bebcom:', error);

    return res.status(500).json({
      error: 'Erro ao consultar IA Bebcom.',
    });
  }
};

module.exports = {
  askIABebcom,
};
