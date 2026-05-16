const PAYMENT_METHODS = {
  DINHEIRO: 'dinheiro',
  PIX: 'pix',
  DEBITO: 'debito',
  CREDITO: 'credito',
  MERCADO_PAGO: 'mercado_pago',
  IFOOD_REPASSE: 'ifood_repasse',
  TRANSFERENCIA: 'transferencia',
  OUTROS: 'outros',
};

const PAYMENT_METHODS_LIST = Object.values(PAYMENT_METHODS);

module.exports = { PAYMENT_METHODS, PAYMENT_METHODS_LIST };
