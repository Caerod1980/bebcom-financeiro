const DRE_GROUPS = {
  RECEITA_BRUTA: 'receita_bruta',
  DEDUCOES: 'deducoes',
  CMV: 'cmv',
  DESPESAS_OPERACIONAIS: 'despesas_operacionais',
  DESPESAS_FINANCEIRAS: 'despesas_financeiras',
  OUTRAS_RECEITAS: 'outras_receitas',
  OUTRAS_DESPESAS: 'outras_despesas',
};

const DRE_GROUPS_LIST = Object.values(DRE_GROUPS);

module.exports = { DRE_GROUPS, DRE_GROUPS_LIST };
