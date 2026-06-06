const Entry = require('../models/Entry');
const Account = require('../models/Account');
const ManagementReport = require('../models/ManagementReport');
const InventoryBalance = require('../models/InventoryBalance');
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
    'Implantação de energia solar.',
    'Redução do quadro de funcionários.',
    'Reavaliação de preços diante de nova concorrência.',
    'Expansão do mix de mercearia.',
    'Reorganização da vitrine da loja.',
    'Busca por novos fornecedores.',
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
    lower === 'o que faço primeiro?' ||
    lower === 'o que faco primeiro?' ||
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
    const day = now.getDay();

    const currentWeekStart = new Date(startOfToday);
    currentWeekStart.setDate(currentWeekStart.getDate() - day);

    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

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
    const day = now.getDay();

    const weekStart = new Date(startOfToday);
    weekStart.setDate(weekStart.getDate() - day);

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

const getComparisonPeriods = (question) => {
  const lower = question.toLowerCase();

  const now = new Date();

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
    { category: 'imposto', terms: ['imposto', 'impostos', 'taxa', 'tributo'] },
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

const buildContext = async ({ month, year, start, end }) => {
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

  return {
  month,
  year,
  periodLabel:
    month && year
      ? getMonthLabel(month, year)
      : 'Período personalizado',
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
};
};

const extractSupplierPayableName = (question) => {
  const lower = question.toLowerCase();

  const patterns = [
    /quanto tenho de\s+(.+?)\s+(para pagar|pra pagar|a pagar)/i,
    /quanto devo para\s+(.+?)\??$/i,
    /quanto tem de\s+(.+?)\s+(para pagar|pra pagar|a pagar)/i,
    /total de contas a pagar de\s+(.+?)\??$/i,
    /previsão de contas a pagar\s+(.+?)\??$/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);

    if (match?.[1]) {
      return match[1]
        .replace(/\?/g, '')
        .trim();
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
Não encontrei contas a pagar em aberto para "${supplierName}".

Minha leitura:
Pode ser que esse fornecedor esteja cadastrado com outro nome, abreviação ou esteja na descrição em vez do campo Pessoa/Empresa.
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

const buildOperationAnswer = (ctx) => {
  const averageTicket = ctx.managementReport?.averageTicket || 0;
  const inventoryFinal = ctx.inventory?.finalStock || 0;

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

Estoque financeiro estimado
${formatCurrency(inventoryFinal)}

${buildConsultiveClosing({
  situation:
    'A operação depende do equilíbrio entre caixa, compras, estoque e vendas.',

  recommendation:
    'Acompanhe diariamente caixa, compras e contas a pagar para evitar pressão operacional acumulada.'
})}
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

const buildCEOAnswer = (
  currentCtx,
  previousCtx,
  operationalScore,
  operationalAlerts,
  operationalPriorities
) => {
  const averageTicket =
    currentCtx.managementReport?.averageTicket || 0;

  const inventoryFinal =
    currentCtx.inventory?.finalStock || 0;

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

${formatCurrency(inventoryFinal)}

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

const buildHistoricalTrendAnswer = (history) => {
  const orderedHistory = (history || [])
    .filter((item) => item?.month && item?.year)
    .sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);

      return dateA - dateB;
    });

  if (orderedHistory.length < 2) {
    return `
📈 TENDÊNCIAS HISTÓRICAS

━━━━━━━━━━━━━━━━━━

Ainda não existem períodos suficientes para análise histórica.

👉 Próxima ação sugerida

Mantenha os lançamentos mensais para que a IA possa identificar padrões e tendências.
`.trim();
  }

const validHistory = orderedHistory.filter(
  (item) =>
    item.totalIncome > 0 ||
    item.totalExpenses > 0
);

if (validHistory.length < 2) {
  return `
📈 TENDÊNCIAS HISTÓRICAS

━━━━━━━━━━━━━━━━━━

Ainda não existem pelo menos 2 períodos com movimentação financeira para medir evolução real.

👉 Próxima ação sugerida

Continue alimentando os lançamentos mensais. A IA precisa de pelo menos dois meses com entradas ou despesas para comparar tendências.
`.trim();
}
  const first = validHistory[0];
  const last = validHistory[validHistory.length - 1];

  const incomeVariation = calculateVariation(
    last.totalIncome,
    first.totalIncome
  );

  const expenseVariation = calculateVariation(
    last.totalExpenses,
    first.totalExpenses
  );

  const balanceVariation = calculateVariation(
    last.balance,
    first.balance
  );

  const trends = [];

  if (first.totalIncome === 0) {
    trends.push(
      'Ainda não existe base suficiente para medir evolução das entradas.'
    );
  } else if (incomeVariation > 0) {
    trends.push(
      `As entradas cresceram ${incomeVariation.toFixed(1)}% no período analisado.`
    );
  } else {
    trends.push(
      `As entradas caíram ${Math.abs(incomeVariation).toFixed(1)}% no período analisado.`
    );
  }

  if (first.totalExpenses === 0) {
    trends.push(
      'Ainda não existe base suficiente para medir evolução das despesas.'
    );
  } else if (expenseVariation > 0) {
    trends.push(
      `As despesas cresceram ${expenseVariation.toFixed(1)}%.`
    );
  } else {
    trends.push(
      `As despesas reduziram ${Math.abs(expenseVariation).toFixed(1)}%.`
    );
  }

  if (balanceVariation > 0) {
    trends.push(
      'O resultado operacional demonstra evolução positiva.'
    );
  } else {
    trends.push(
      'O resultado operacional demonstra deterioração.'
    );
  }

  return `
📈 TENDÊNCIAS HISTÓRICAS

━━━━━━━━━━━━━━━━━━

📅 Períodos analisados

${orderedHistory.length} meses

━━━━━━━━━━━━━━━━━━

📊 Evolução identificada

${trends.map((item) => `• ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

A análise histórica permite identificar comportamento estrutural da operação, evitando decisões baseadas apenas no mês atual.

━━━━━━━━━━━━━━━━━━

👉 Próxima ação sugerida

Observe principalmente a tendência de caixa, compras e despesas. A direção da curva costuma ser mais importante que o resultado isolado de um único mês.
`.trim();
};

const buildStrategicMemoryAnswer = (history) => {
  const validHistory = (history || [])
    .filter(
      (item) =>
        item?.month &&
        item?.year &&
        (
          item.totalIncome > 0 ||
          item.totalExpenses > 0
        )
    )
    .sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);

      return dateA - dateB;
    });

  if (validHistory.length < 2) {
    return `
🧠 MEMÓRIA ESTRATÉGICA — BEBCOM

━━━━━━━━━━━━━━━━━━

Ainda não existem períodos suficientes com movimentação financeira para formar uma memória estratégica confiável.

👉 Próxima ação sugerida

Continue alimentando os meses anteriores. A IA precisa de histórico real para identificar padrões repetidos da operação.
`.trim();
  }

  const memories = [];

  const negativeCashMonths = validHistory.filter(
    (item) => item.balance < 0
  );

  if (negativeCashMonths.length >= 2) {
    memories.push(
      `O caixa ficou negativo em ${negativeCashMonths.length} dos ${validHistory.length} períodos analisados.`
    );
  }

  const expensePressureMonths = validHistory.filter(
    (item) => item.totalExpenses > item.totalIncome
  );

  if (expensePressureMonths.length >= 2) {
    memories.push(
      `As despesas superaram as entradas em ${expensePressureMonths.length} períodos.`
    );
  }

  const ticketMissingMonths = validHistory.filter(
    (item) =>
      !item.managementReport ||
      !item.managementReport.averageTicket
  );

  if (ticketMissingMonths.length >= 2) {
    memories.push(
      `O ticket médio ainda não foi alimentado em ${ticketMissingMonths.length} períodos analisados.`
    );
  }

  const purchasePressureMonths = validHistory.filter((item) => {
    const purchases = item.expenseCategories?.find(
      (cat) => cat.category === 'compras_mercadorias'
    );

    return (
      purchases &&
      item.totalIncome > 0 &&
      purchases.amount / item.totalIncome > 0.6
    );
  });

  if (purchasePressureMonths.length >= 2) {
    memories.push(
      `Compras de mercadorias ficaram acima de 60% das entradas em ${purchasePressureMonths.length} períodos.`
    );
  }

  const categoryFrequency = {};

  validHistory.forEach((item) => {
    const topCategory = item.expenseCategories?.[0];

    if (!topCategory) return;

    const category = topCategory.category || 'sem_categoria';

    if (!categoryFrequency[category]) {
      categoryFrequency[category] = {
        category,
        count: 0,
        total: 0,
      };
    }

    categoryFrequency[category].count += 1;
    categoryFrequency[category].total += Math.abs(Number(topCategory.amount || 0));
  });

  const recurrentCategory = Object.values(categoryFrequency)
    .sort((a, b) => b.count - a.count || b.total - a.total)[0];

  if (recurrentCategory && recurrentCategory.count >= 2) {
    memories.push(
      `A categoria ${recurrentCategory.category} apareceu como maior saída em ${recurrentCategory.count} períodos.`
    );
  }

  const bestMonth = [...validHistory].sort(
    (a, b) => b.balance - a.balance
  )[0];

  const worstMonth = [...validHistory].sort(
    (a, b) => a.balance - b.balance
  )[0];

  const first = validHistory[0];
  const last = validHistory[validHistory.length - 1];

  const incomeVariation = calculateVariation(
    last.totalIncome,
    first.totalIncome
  );

  if (first.totalIncome > 0) {
    if (incomeVariation > 0) {
      memories.push(
        `As entradas evoluíram ${incomeVariation.toFixed(1)}% entre ${first.periodLabel} e ${last.periodLabel}.`
      );
    } else if (incomeVariation < 0) {
      memories.push(
        `As entradas caíram ${Math.abs(incomeVariation).toFixed(1)}% entre ${first.periodLabel} e ${last.periodLabel}.`
      );
    }
  }

  if (!memories.length) {
    memories.push(
      'Ainda não há padrões repetidos fortes. A operação precisa de mais períodos completos para uma leitura estratégica mais profunda.'
    );
  }

  return `
🧠 MEMÓRIA ESTRATÉGICA — BEBCOM

━━━━━━━━━━━━━━━━━━

📅 Períodos com dados analisados

${validHistory.length} períodos

━━━━━━━━━━━━━━━━━━

📌 Padrões identificados

${memories.map((item) => `• ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━

🏆 Melhor mês identificado

${bestMonth.periodLabel}
Resultado: ${formatCurrency(bestMonth.balance)}

━━━━━━━━━━━━━━━━━━

⚠️ Pior mês identificado

${worstMonth.periodLabel}
Resultado: ${formatCurrency(worstMonth.balance)}

━━━━━━━━━━━━━━━━━━

💡 Minha leitura

A memória estratégica mostra comportamentos que se repetem na operação. Ela ajuda a separar um problema pontual de um padrão recorrente da empresa.

━━━━━━━━━━━━━━━━━━

👉 Decisão recomendada

Use esses padrões para definir prioridades fixas de gestão: caixa, compras, vencimentos, ticket médio, margem e controle da categoria de maior pressão.
`.trim();
};

const buildInventoryAnswer = (ctx) => `
Análise do estoque financeiro em ${ctx.periodLabel}:

Estoque inicial: ${formatCurrency(ctx.inventory?.initialStock || 0)}
Compras: ${formatCurrency(ctx.inventory?.purchases || 0)}
Estoque final estimado: ${formatCurrency(ctx.inventory?.finalStock || 0)}

Leitura gerencial:
O estoque deve ser visto junto com caixa, compras e vendas. Estoque alto pode significar capital parado; estoque baixo pode gerar ruptura e perda de vendas.

Sugestão:
Use essa informação para equilibrar compra, giro e disponibilidade dos produtos mais importantes.
`.trim();

const calculateVariation = (current, previous) => {
  if (!previous || previous === 0) return 0;

  return ((current - previous) / previous) * 100;
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
    ctx.inventory?.finalStock || 0;

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
    ctx.inventory?.finalStock || 0;

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
    ctx.inventory?.finalStock || 0;

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

  const balanceVariation = calculateVariation(
    currentCtx.balance,
    compareCtx.balance
  );

  let reading = 'O comparativo mostra mudança operacional entre os períodos.';

  if (
    currentCtx.totalIncome > compareCtx.totalIncome &&
    currentCtx.balance < compareCtx.balance
  ) {
    reading =
      'A receita cresceu, porém o resultado piorou. Isso indica aumento relevante das despesas, compras ou perda de margem.';
  } else if (currentCtx.balance > compareCtx.balance) {
    reading =
      'O resultado operacional melhorou em relação ao período comparado.';
  } else if (currentCtx.balance < compareCtx.balance) {
    reading =
      'O resultado operacional piorou em relação ao período comparado.';
  }

  return `
Comparativo: ${currentCtx.periodLabel} vs ${compareCtx.periodLabel}

Receita:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.totalIncome)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.totalIncome)}
Variação: ${revenueVariation.toFixed(1)}%

Despesas:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.totalExpenses)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.totalExpenses)}
Variação: ${expenseVariation.toFixed(1)}%

Resultado:
${compareCtx.periodLabel}: ${formatCurrency(compareCtx.balance)}
${currentCtx.periodLabel}: ${formatCurrency(currentCtx.balance)}
Variação: ${balanceVariation.toFixed(1)}%

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

  if (ctx.inventory?.finalStock > 0) {
    opportunities.push(
      'Existe estoque disponível para gerar caixa sem necessidade imediata de novas compras.'
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
  const stock = ctx.inventory?.finalStock || 0;

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

  if (
    ctx.inventory &&
    ctx.inventory.finalStock > ctx.totalIncome * 0.5
  ) {
    opportunities.push({
      priority: 8,
      title: 'Transformar estoque em caixa',
      description:
        `O estoque estimado de ${formatCurrency(
          ctx.inventory.finalStock
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
   } else if (comparisonPeriods) {
  period = comparisonPeriods.current;
  ctx = await buildContext(comparisonPeriods.current);
  previousCtx = await buildContext(comparisonPeriods.compare);
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
      ctx = await buildContext(period);

      const previousMonth = period.month === 1 ? 12 : period.month - 1;
      const previousYear = period.month === 1 ? period.year - 1 : period.year;

      const previousPeriod = {
        month: previousMonth,
        year: previousYear,
        start: new Date(previousYear, previousMonth - 1, 1),
        end: new Date(previousYear, previousMonth, 0, 23, 59, 59, 999),
      };

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
    const followUpAnswer =
  isFollowUpQuestion(question)
    ? buildFollowUpAnswer(question, ctx)
    : null;

if (followUpAnswer) {
  return res.json({
    answer: followUpAnswer,
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
  lowerQuestion.includes('o que recomenda');

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

    const supplierPayableName = extractSupplierPayableName(question);

const isSupplierPayableQuestion =
  !!supplierPayableName &&
  (
    lowerQuestion.includes('pagar') ||
    lowerQuestion.includes('devo') ||
    lowerQuestion.includes('contas a pagar')
  );

    const payableDuePeriod = getPayableDuePeriodFromQuestion(question);

const isPayablesDueDateQuestion =
  !!payableDuePeriod &&
  (
    lowerQuestion.includes('vence') ||
    lowerQuestion.includes('vencem') ||
    lowerQuestion.includes('vencimento') ||
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

    const educationalAnswer = getEducationalAnswer(question);
    
    const knowledgeBaseAnswer = getKnowledgeBaseAnswer(question, ctx);

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

    let answer = '';

if (isStrategicMemoryQuestion) {
  answer = buildStrategicMemoryAnswer(historicalContexts);
} else if (isHistoricalTrendQuestion) {
  answer = buildHistoricalTrendAnswer(historicalContexts);
} else if (isCEOQuestion) {
  answer = buildCEOAnswer(
    ctx,
    previousCtx,
    operationalScore,
    operationalAlerts,
    operationalPriorities
  );
} else if (isRecoveryPlanQuestion) {
  answer = buildRecoveryPlanAnswer(
    ctx,
    operationalScore,
    operationalPriorities,
    strategicRecommendations
  );
} else if (isExecutiveAdviceQuestion) {
  answer = buildExecutiveAdviceAnswer(
    ctx,
    previousCtx
  );
} else if (isAlertQuestion) {
  answer = buildAlertsAnswer(ctx, previousCtx);
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
} else if (isPayablesDueDateQuestion) {
  answer = buildPayablesDueDateAnswer(
    ctx,
    payableDuePeriod
  );
} else if (isSupplierPayableQuestion) {
  answer = buildSupplierPayableAnswer(
    ctx,
    supplierPayableName
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
      answer = buildInventoryAnswer(ctx);
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
Estoque estimado: ${formatCurrency(ctx.inventory?.finalStock || 0)}

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
        averageTicket: ctx.managementReport?.averageTicket || 0,
        inventoryFinalStock: ctx.inventory?.finalStock || 0,
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
