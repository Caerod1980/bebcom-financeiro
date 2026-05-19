import React, { useState } from 'react';
import { X } from 'lucide-react';

const EntryForm = ({ onSubmit, onClose, initialData = null }) => {
  const normalizeInitialData = (data) => {
    if (!data) {
      return {
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: '',
        channel: '',
        costCenter: '',
        paymentMethod: '',
        dreGroup: '',
        notes: '',
      };
    }

    return {
      ...data,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      amount: data.amount || '',
      channel: data.channel || '',
      costCenter: data.costCenter || '',
      paymentMethod: data.paymentMethod || '',
      notes: data.notes || '',
    };
  };

  const [formData, setFormData] = useState(normalizeInitialData(initialData));

  const categories = {
    income: [
      { value: 'vendas_loja_fisica', label: 'Venda Loja Física', dreGroup: 'receita_bruta' },
      { value: 'vendas_delivery', label: 'Venda Delivery', dreGroup: 'receita_bruta' },
      { value: 'vendas_ifood', label: 'Venda iFood', dreGroup: 'receita_bruta' },
      { value: 'vendas_lounge', label: 'Venda Lounge', dreGroup: 'receita_bruta' },
      { value: 'eventos', label: 'Eventos', dreGroup: 'receita_bruta' },
      { value: 'outras_receitas', label: 'Outras Receitas', dreGroup: 'outras_receitas' },
    ],
    expense: [
      { value: 'compras_mercadorias', label: 'Compras de Mercadorias', dreGroup: 'cmv' },
      { value: 'funcionarios', label: 'Funcionários', dreGroup: 'despesas_operacionais' },
      { value: 'motoboy', label: 'Motoboy', dreGroup: 'despesas_operacionais' },
      { value: 'aluguel', label: 'Aluguel', dreGroup: 'despesas_operacionais' },
      { value: 'energia', label: 'Energia', dreGroup: 'despesas_operacionais' },
      { value: 'agua', label: 'Água', dreGroup: 'despesas_operacionais' },
      { value: 'internet', label: 'Internet', dreGroup: 'despesas_operacionais' },
      { value: 'sistema', label: 'Sistema', dreGroup: 'despesas_operacionais' },
      { value: 'contador', label: 'Contador', dreGroup: 'despesas_operacionais' },
      { value: 'marketing', label: 'Marketing', dreGroup: 'despesas_operacionais' },
      { value: 'taxas_cartao', label: 'Taxas de Cartão', dreGroup: 'despesas_financeiras' },
      { value: 'taxas_mercado_pago', label: 'Taxas Mercado Pago', dreGroup: 'despesas_financeiras' },
      { value: 'taxas_ifood', label: 'Taxas iFood', dreGroup: 'despesas_financeiras' },
      { value: 'emprestimos', label: 'Empréstimos', dreGroup: 'despesas_financeiras' },
      { value: 'impostos', label: 'Impostos', dreGroup: 'deducoes' },
      { value: 'manutencao', label: 'Manutenção', dreGroup: 'despesas_operacionais' },
      { value: 'embalagens', label: 'Embalagens', dreGroup: 'despesas_operacionais' },
      { value: 'outras_despesas', label: 'Outras Despesas', dreGroup: 'outras_despesas' },
    ],
  };

  const channels = [
    { value: 'loja_fisica', label: 'Loja Física' },
    { value: 'bebcom_delivery', label: 'Bebcom Delivery' },
    { value: 'ifood', label: 'iFood' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'bebcom_lounge', label: 'Bebcom Lounge' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'outros', label: 'Outros' },
  ];

  const costCenters = [
    { value: 'operacao_loja', label: 'Operação Loja' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'ifood', label: 'iFood' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'estrutura', label: 'Estrutura' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'estoque', label: 'Estoque' },
    { value: 'outros', label: 'Outros' },
  ];

  const paymentMethods = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'debito', label: 'Débito' },
    { value: 'credito', label: 'Crédito' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
    { value: 'ifood_repasse', label: 'iFood Repasse' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'outros', label: 'Outros' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'type') {
      setFormData({
        ...formData,
        type: value,
        category: '',
        dreGroup: '',
        channel: value === 'income' ? formData.channel : '',
        costCenter: value === 'expense' ? formData.costCenter : '',
      });
      return;
    }

    if (name === 'category') {
      const selectedCategory = categories[formData.type].find((cat) => cat.value === value);

      setFormData({
        ...formData,
        category: value,
        dreGroup: selectedCategory?.dreGroup || '',
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      amount: Math.abs(parseFloat(formData.amount)),
      channel: formData.type === 'income' ? formData.channel : '',
      costCenter: formData.type === 'expense' ? formData.costCenter : '',
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>

          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field" required>
                <option value="income">Entrada (Receita)</option>
                <option value="expense">Saída (Despesa)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder={formData.type === 'income' ? 'Ex: Faturamento loja física' : 'Ex: Ambev / Santander / Energia'}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <input type="number" step="0.01" min="0.01" name="amount" value={formData.amount} onChange={handleChange} className="input-field" placeholder="0,00" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                <option value="">Selecione...</option>
                {categories[formData.type].map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.type === 'income' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canal de Venda *</label>
                <select name="channel" value={formData.channel} onChange={handleChange} className="input-field" required>
                  <option value="">Selecione...</option>
                  {channels.map((channel) => (
                    <option key={channel.value} value={channel.value}>{channel.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo *</label>
                <select name="costCenter" value={formData.costCenter} onChange={handleChange} className="input-field" required>
                  <option value="">Selecione...</option>
                  {costCenters.map((center) => (
                    <option key={center.value} value={center.value}>{center.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="input-field">
                <option value="">Selecione...</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows="3" placeholder="Informações adicionais..." />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Salvar Lançamento</button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
