const Entry = require('../models/Entry');
const Account = require('../models/Account');
const ManagementReport = require('../models/ManagementReport');
const InventoryBalance = require('../models/InventoryBalance');

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const getCurrentPeriod = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
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

    const { month, year, start, end } = getCurrentPeriod();

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

    const pendingPayable = accounts
      .filter((account) => account.type === 'payable')
      .reduce((acc, account) => acc + Math.abs(Number(account.amount || 0)), 0);

    const pendingReceivable = accounts
      .filter((account) => account.type === 'receivable')
      .reduce((acc, account) => acc + Math.abs(Number(account.amount || 0)), 0);

    const balance = totalIncome - totalExpenses;

    let answer = '';

    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('fluxo')) {
      answer = `
Com base nos dados atuais de ${month}/${year}, seu fluxo mostra:

Entradas realizadas no mês: ${formatCurrency(totalIncome)}
Saídas realizadas no mês: ${formatCurrency(totalExpenses)}
Saldo realizado parcial: ${formatCurrency(balance)}

Contas a pagar pendentes/vencidas: ${formatCurrency(pendingPayable)}
Contas a receber pendentes/vencidas: ${formatCurrency(pendingReceivable)}

Leitura gerencial:
${
  balance >= 0
    ? 'O saldo realizado está positivo, o que indica boa sustentação financeira parcial no mês.'
    : 'O saldo realizado está negativo, então é importante acompanhar vencimentos próximos e preservar caixa.'
}

Minha sugestão inicial é acompanhar diariamente o fluxo previsto, priorizar contas críticas e evitar novas despesas não essenciais até confirmar as entradas previstas.
      `.trim();
    } else if (
      lowerQuestion.includes('ticket') ||
      lowerQuestion.includes('médio') ||
      lowerQuestion.includes('medio')
    ) {
      const averageTicket = managementReport?.averageTicket || 0;

      answer = `
Com base no relatório gerencial atual, o ticket médio registrado para ${month}/${year} é:

Ticket médio: ${formatCurrency(averageTicket)}

Leitura gerencial:
Um ticket médio maior indica venda mais qualificada por cliente. Para melhorar esse indicador, você pode trabalhar combos, ofertas progressivas, sugestão de produtos complementares e campanhas focadas em aumentar o valor por pedido.

Sugestões práticas:
1. Criar combos de bebidas + energético + gelo.
2. Incentivar compra acima de um valor mínimo.
3. Destacar produtos de maior margem.
4. Usar mensagens no delivery como “complete seu pedido”.
      `.trim();
    } else if (
      lowerQuestion.includes('estoque') ||
      lowerQuestion.includes('mercadoria')
    ) {
      answer = `
Análise inicial do estoque financeiro no período ${month}/${year}:

Estoque inicial: ${formatCurrency(inventory?.initialStock || 0)}
Compras: ${formatCurrency(inventory?.purchases || 0)}
Saldo/estoque final estimado: ${formatCurrency(inventory?.finalStock || 0)}

Leitura gerencial:
O estoque precisa ser acompanhado junto com vendas, compras e margem. Se o estoque cresce mas o caixa aperta, pode indicar capital parado. Se o estoque cai demais, pode indicar risco de ruptura e perda de vendas.

Sugestão:
Use o estoque financeiro como termômetro de equilíbrio entre compra, giro e caixa.
      `.trim();
    } else {
      answer = `
Entendi sua pergunta: "${question}".

Nesta fase inicial, já consigo analisar dados reais do Bebcom Financeiro em modo leitura, especialmente:
- fluxo de caixa
- entradas e saídas
- contas pendentes e vencidas
- ticket médio
- estoque financeiro
- leitura operacional

Para uma análise mais precisa, você pode perguntar por exemplo:
“Como está meu fluxo de caixa?”
“Como melhorar meu ticket médio?”
“Meu estoque está saudável?”
“Quais pontos merecem atenção este mês?”
      `.trim();
    }

    return res.json({
      answer,
      context: {
        month,
        year,
        totalIncome,
        totalExpenses,
        balance,
        pendingPayable,
        pendingReceivable,
        averageTicket: managementReport?.averageTicket || 0,
        inventoryFinalStock: inventory?.finalStock || 0,
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
