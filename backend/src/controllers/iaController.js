const Entry = require('../models/Entry');
const Account = require('../models/Account');
const ManagementReport = require('../models/ManagementReport');
const InventoryBalance = require('../models/InventoryBalance');

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
    item.names.some((name) => lower.includes(name))
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
    const current = uniqueDetected[0];
    const compare = uniqueDetected[1];

    return {
      current: {
        month: current.month,
        year: current.year,
        start: new Date(current.year, current.month - 1, 1),
        end: new Date(
          current.year,
          current.month,
          0,
          23,
          59,
          59,
          999
        ),
      },

      compare: {
        month: compare.month,
        year: compare.year,
        start: new Date(compare.year, compare.month - 1, 1),
        end: new Date(
          compare.year,
          compare.month,
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
    periodLabel: getMonthLabel(month, year),
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

const buildComparisonAnswer = (currentCtx, compareCtx) => {
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

Leitura gerencial:
${
  currentCtx.totalIncome > compareCtx.totalIncome &&
  currentCtx.balance < compareCtx.balance
    ? 'A receita cresceu, porém o resultado piorou. Isso indica aumento relevante das despesas ou perda de margem.'
    : currentCtx.balance > compareCtx.balance
    ? 'O resultado operacional melhorou em relação ao período comparado.'
    : 'O período atual apresentou pior desempenho operacional em relação ao comparativo.'
}

Minha leitura:
O ideal é acompanhar crescimento de receita junto com margem, despesas e geração de caixa. Crescimento sem controle operacional pode pressionar o financeiro.
  `.trim();
};

const buildTicketComparisonAnswer = (currentCtx, compareCtx) => {
  const currentTicket = currentCtx.managementReport?.averageTicket || 0;
  const compareTicket = compareCtx.managementReport?.averageTicket || 0;

  const currentRevenue = currentCtx.managementReport?.netRevenue || 0;
  const compareRevenue = compareCtx.managementReport?.netRevenue || 0;

  const currentTickets = currentCtx.managementReport?.totalTickets || 0;
  const compareTickets = compareCtx.managementReport?.totalTickets || 0;

  const ticketVariation = calculateVariation(currentTicket, compareTicket);
  const revenueVariation = calculateVariation(currentRevenue, compareRevenue);
  const volumeVariation = calculateVariation(currentTickets, compareTickets);

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

Leitura gerencial:
${
  currentTicket > compareTicket && currentTickets < compareTickets
    ? 'O ticket médio subiu, mas o volume de comandas caiu. Isso indica vendas de maior valor, porém para menos clientes.'
    : currentTicket > compareTicket
    ? 'O ticket médio melhorou em relação ao período comparado, indicando aumento no valor médio por venda.'
    : currentTicket < compareTicket
    ? 'O ticket médio caiu em relação ao período comparado. Vale revisar mix de produtos, combos e estratégias de venda.'
    : 'O ticket médio ficou estável no comparativo.'
}

Minha sugestão:
Use esse comparativo para entender se a empresa está crescendo por volume de clientes, por aumento do valor médio de compra, ou por uma combinação dos dois.
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

    const comparisonPeriods = getComparisonPeriods(question);

let period;
let ctx;
let previousCtx;

if (comparisonPeriods) {
  period = comparisonPeriods.current;

  ctx = await buildContext(comparisonPeriods.current);

  previousCtx = await buildContext(
    comparisonPeriods.compare
  );
} else {
  period = getPeriodFromQuestion(question);

  ctx = await buildContext(period);

  const previousMonth =
    period.month === 1 ? 12 : period.month - 1;

  const previousYear =
    period.month === 1
      ? period.year - 1
      : period.year;

  const previousPeriod = {
    month: previousMonth,
    year: previousYear,
    start: new Date(previousYear, previousMonth - 1, 1),
    end: new Date(
      previousYear,
      previousMonth,
      0,
      23,
      59,
      59,
      999
    ),
  };

  previousCtx = await buildContext(previousPeriod);
}

const analyticalInsights = buildAnalyticalInsights(
  ctx,
  previousCtx
);

    const lowerQuestion = question.toLowerCase();
    const isComparisonQuestion =
  lowerQuestion.includes('compare') ||
  lowerQuestion.includes('compar') ||
  lowerQuestion.includes('versus') ||
  lowerQuestion.includes('vs');

    let answer = '';

  if (
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
} else if (lowerQuestion.includes('fluxo') || lowerQuestion.includes('caixa')) {
  answer = buildFlowAnswer(ctx);
} else if (
  lowerQuestion.includes('ticket') ||
  lowerQuestion.includes('médio') ||
  lowerQuestion.includes('medio') ||
  lowerQuestion.includes('comanda')
) {
  answer = buildTicketAnswer(ctx);
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

Você pode perguntar de forma mais específica, por exemplo:
“Como estava meu fluxo em abril de 2026?”
“Quais despesas pesaram em maio?”
“Como melhorar o ticket médio?”
“Quais pontos merecem atenção na operação?”
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
