export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';

  const safeDate = String(date).slice(0, 10);

  const [year, month, day] = safeDate.split('-');

  return `${day}/${month}/${year}`;
};

export const formatPercentage = (value) => {
  return `${value}%`;
};
