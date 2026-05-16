import React, { useState } from 'react';
import { X } from 'lucide-react';

const EntryForm = ({ onSubmit, onClose, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    channel: '',
    paymentMethod: '',
    dreGroup: '',
    notes: '',
  });

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
      { value: 'fornecedores', label: 'Fornecedores', dreGroup: 'cmv' },
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
      { value: 'impostos', label: 'Impostos', dreGroup: 'deducoes' },
      { value: 'manutencao', label: 'Manutenção', dreGroup: 'despesas_operacionais' },
      { value: 'embalagens', label: 'Embalagens', dreGroup: 'despesas_operacionais' },
      { value: 'outras_despesas', label: 'Outras Despesas', dreGroup: 'outras_despesas' },
    ],
  };

  const channels = [
    'loja_fisica',
    'bebcom_delivery',
    'ifood',
    'whatsapp',
    'bebcom_lounge',
    'eventos',
    'outros',
  ];

  const paymentMethods = [
    'dinheiro',
    'pix',
    'debito',
    'credito',
    'mercado_pago',
    'ifood_repasse',
    'transferencia',
    'outros',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const selectedCategory = categories[formData.type].find(cat => cat.value === value);
      setFormData({
        ...formData,
        [name]: value,
        dreGroup: selectedCategory?.dreGroup || '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="income">Entrada (Receita)</option>
                <option value="expense">Saída (Despesa)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: Venda loja física - sexta-feira"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                placeholder="0,00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Selecione...</option>
                {categories[formData.type].map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canal de Venda
              </label>
              <select
                name="channel"
                value={formData.channel}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Selecione...</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Selecione...</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observação
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Informações adicionais..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Salvar Lançamento
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;
