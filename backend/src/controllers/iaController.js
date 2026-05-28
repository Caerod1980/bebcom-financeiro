const Entry = require('../models/Entry');
const Account = require('../models/Account');
const ManagementReport = require('../models/ManagementReport');
const InventoryBalance = require('../models/InventoryBalance');
const iaKnowledgeBase = require('../data/iaKnowledgeBase');

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

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
        `${name}\\s*(20\\d{2})?`,
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
  expenseCategories,
  incomeCategories,
};
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
Análise do fluxo de caixa de ${ctx.periodLabel}:

Entradas realizadas: ${formatCurrency(ctx.totalIncome)}
Saídas realizadas: ${formatCurrency(ctx.totalExpenses)}
Saldo realizado: ${formatCurrency(ctx.balance)}

Contas a pagar pendentes/vencidas no sistema: ${formatCurrency(ctx.pendingPayable)}
Contas a receber pendentes/vencidas no sistema: ${formatCurrency(ctx.pendingReceivable)}

Leitura gerencial:
${
  ctx.balance >= 0
    ? 'O período apresenta saldo realizado positivo. Isso indica que as entradas estão sustentando as saídas registradas.'
    : 'O período apresenta saldo realizado negativo. Isso exige atenção ao caixa, principalmente antes de assumir novas compras ou despesas.'
}

Principais grupos de saída no período:
${topExpenses || 'Ainda não há despesas suficientes classificadas para destacar.'}

Sugestão:
Acompanhe o fluxo previsto junto com o fluxo realizado. Se as contas a pagar forem altas em relação ao saldo realizado, priorize fornecedores críticos e preserve caixa para operação essencial.
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
Análise de ticket médio de ${ctx.periodLabel}:

Receita líquida gerencial: ${formatCurrency(netRevenue)}
Total de comandas: ${totalTickets}
Ticket médio: ${formatCurrency(averageTicket)}

Leitura gerencial:
${
  averageTicket > 0
    ? 'O ticket médio já possui dados lançados e pode ser usado para analisar qualidade das vendas.'
    : 'Ainda não há dados de comandas/receita lançados no Relatório Gerencial deste período. Para uma análise precisa, preencha receita líquida e total de comandas.'
}

Estratégias para melhorar o ticket médio:
1. Criar combos com bebida + energético + gelo.
2. Oferecer produtos complementares no balcão e delivery.
3. Destacar itens de maior margem.
4. Criar faixas de incentivo: “acima de R$ X, leve vantagem”.
5. Trabalhar kits para fim de semana e datas de maior movimento.
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
Análise de despesas de ${ctx.periodLabel}:

Total de despesas no período: ${formatCurrency(ctx.totalExpenses)}

Maiores grupos de despesas:
${topExpenses || 'Não encontrei despesas classificadas suficientes neste período.'}

Leitura gerencial:
Para reduzir despesas sem prejudicar a loja, o ideal é separar o que é essencial para venda do que é administrativo, financeiro ou negociável.

Sugestões práticas:
1. Renegociar vencimentos para aliviar dias de maior pressão no caixa.
2. Revisar compras com baixo giro.
3. Comparar fornecedores recorrentes.
4. Evitar cortes em produtos que puxam venda.
5. Atacar primeiro despesas que não afetam atendimento, estoque essencial ou entrega.
  `.trim();
};

const buildOperationAnswer = (ctx) => {
  const averageTicket = ctx.managementReport?.averageTicket || 0;
  const inventoryFinal = ctx.inventory?.finalStock || 0;

  return `
Pontos de atenção operacional em ${ctx.periodLabel}:

1. Caixa:
Saldo realizado do período: ${formatCurrency(ctx.balance)}
${
  ctx.balance < 0
    ? 'Atenção: o caixa realizado está negativo no período analisado.'
    : 'O caixa realizado está positivo no período analisado.'
}

2. Despesas:
Saídas realizadas: ${formatCurrency(ctx.totalExpenses)}

3. Contas:
Contas a pagar pendentes/vencidas: ${formatCurrency(ctx.pendingPayable)}

4. Ticket médio:
Ticket médio registrado: ${formatCurrency(averageTicket)}
${
  averageTicket === 0
    ? 'O Relatório Gerencial ainda precisa ser alimentado para leitura operacional completa.'
    : 'Esse indicador já permite avaliar qualidade de venda e comportamento de consumo.'
}

5. Estoque:
Estoque financeiro estimado: ${formatCurrency(inventoryFinal)}

Minha leitura:
O ponto principal é acompanhar se o crescimento de vendas está vindo com margem, caixa e controle de compras. Receita alta sem controle de despesas ou estoque pode apertar o caixa.
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
Saúde operacional do Bebcom:
${operationalScore.score}/100

Classificação:
${operationalScore.status}

Pontos fortes:
${
  operationalScore.strengths.length > 0
    ? operationalScore.strengths.map((item) => `• ${item}`).join('\n')
    : 'Nenhum ponto forte relevante identificado.'
}

Pontos críticos:
${
  operationalScore.weaknesses.length > 0
    ? operationalScore.weaknesses.map((item) => `• ${item}`).join('\n')
    : 'Nenhum ponto crítico relevante identificado.'
}
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
    lower.includes('tendência') ||
    lower.includes('tendencia') ||
    lower.includes('o que mudou') ||
    lower.includes('melhorou ou piorou') ||
    lower.includes('resultado piorou') ||
    lower.includes('resultado melhorou')
  ) return 'trends';

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
  lower.includes('plano') ||
  lower.includes('o que devo fazer') ||
  lower.includes('como recuperar') ||
  lower.includes('como melhorar') ||
  lower.includes('qual meta') ||
  lower.includes('qual estratégia') ||
  lower.includes('planejamento')
) return 'operational_plan';

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

  if (intent === 'trends') {
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

    const analyticalInsights = buildAnalyticalInsights(ctx, previousCtx);
    const operationalTrends = buildOperationalTrend(ctx, previousCtx);
    const temporalMemories = buildTemporalOperationalMemory(ctx, previousCtx);
    const operationalBehavior = buildOperationalBehavior(ctx);
    const strategicRecommendations = buildStrategicRecommendations(ctx);
    const operationalPlan = buildOperationalPlan(ctx);
    const strategicSimulations = buildStrategicSimulation(ctx);
    const operationalScore = buildOperationalScore(ctx, previousCtx);
    const operationalPriorities = buildOperationalPriorities(ctx, previousCtx);
    const operationalAlerts = buildOperationalAlerts(ctx, previousCtx);

    const lowerQuestion = question.toLowerCase();
    
    const financialIntent = extractFinancialIntent(question);

    const advancedIntent = detectAdvancedIntent(question);

    const isMorningQuestion = lowerQuestion.includes('bom dia');

    const isOperationQuestion =
      lowerQuestion.includes('como está a operação');

    const isAttentionQuestion =
      lowerQuestion.includes('o que merece atenção');

    const isPanoramaQuestion =
      lowerQuestion.includes('panorama');

    const isMonthQuestion =
      lowerQuestion.includes('como está o mês') ||
      lowerQuestion.includes('resumo do mês');

    const isScoreQuestion =
      lowerQuestion.includes('score') ||
      lowerQuestion.includes('saúde da operação') ||
      lowerQuestion.includes('como está a saúde') ||
      lowerQuestion.includes('saude operacional') ||
      lowerQuestion.includes('saúde operacional');

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
  operationalPriorities,
  operationalAlerts,
  operationalScore,
});

    let answer = '';

    if (
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
