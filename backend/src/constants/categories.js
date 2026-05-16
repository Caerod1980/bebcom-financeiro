const INCOME_CATEGORIES = {
  VENDAS_LOJA_FISICA: { value: 'vendas_loja_fisica', dreGroup: 'receita_bruta', label: 'Venda Loja Física' },
  VENDAS_DELIVERY: { value: 'vendas_delivery', dreGroup: 'receita_bruta', label: 'Venda Delivery' },
  VENDAS_IFOOD: { value: 'vendas_ifood', dreGroup: 'receita_bruta', label: 'Venda iFood' },
  VENDAS_LOUNGE: { value: 'vendas_lounge', dreGroup: 'receita_bruta', label: 'Venda Lounge' },
  EVENTOS: { value: 'eventos', dreGroup: 'receita_bruta', label: 'Eventos' },
  OUTRAS_RECEITAS: { value: 'outras_receitas', dreGroup: 'outras_receitas', label: 'Outras Receitas' },
};

const EXPENSE_CATEGORIES = {
  COMPRAS_MERCADORIAS: { value: 'compras_mercadorias', dreGroup: 'cmv', label: 'Compras de Mercadorias' },
  FORNECEDORES: { value: 'fornecedores', dreGroup: 'cmv', label: 'Fornecedores' },
  FUNCIONARIOS: { value: 'funcionarios', dreGroup: 'despesas_operacionais', label: 'Funcionários' },
  MOTOBOY: { value: 'motoboy', dreGroup: 'despesas_operacionais', label: 'Motoboy' },
  ALUGUEL: { value: 'aluguel', dreGroup: 'despesas_operacionais', label: 'Aluguel' },
  ENERGIA: { value: 'energia', dreGroup: 'despesas_operacionais', label: 'Energia' },
  AGUA: { value: 'agua', dreGroup: 'despesas_operacionais', label: 'Água' },
  INTERNET: { value: 'internet', dreGroup: 'despesas_operacionais', label: 'Internet' },
  SISTEMA: { value: 'sistema', dreGroup: 'despesas_operacionais', label: 'Sistema' },
  CONTADOR: { value: 'contador', dreGroup: 'despesas_operacionais', label: 'Contador' },
  MARKETING: { value: 'marketing', dreGroup: 'despesas_operacionais', label: 'Marketing' },
  TAXAS_CARTAO: { value: 'taxas_cartao', dreGroup: 'despesas_financeiras', label: 'Taxas de Cartão' },
  TAXAS_MERCADO_PAGO: { value: 'taxas_mercado_pago', dreGroup: 'despesas_financeiras', label: 'Taxas Mercado Pago' },
  TAXAS_IFOOD: { value: 'taxas_ifood', dreGroup: 'despesas_financeiras', label: 'Taxas iFood' },
  IMPOSTOS: { value: 'impostos', dreGroup: 'deducoes', label: 'Impostos' },
  MANUTENCAO: { value: 'manutencao', dreGroup: 'despesas_operacionais', label: 'Manutenção' },
  EMBALAGENS: { value: 'embalagens', dreGroup: 'despesas_operacionais', label: 'Embalagens' },
  OUTRAS_DESPESAS: { value: 'outras_despesas', dreGroup: 'outras_despesas', label: 'Outras Despesas' },
};

const ALL_CATEGORIES = {
  income: Object.values(INCOME_CATEGORIES),
  expense: Object.values(EXPENSE_CATEGORIES),
};

module.exports = { INCOME_CATEGORIES, EXPENSE_CATEGORIES, ALL_CATEGORIES };
