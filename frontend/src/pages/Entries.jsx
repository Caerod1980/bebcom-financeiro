import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import EntryForm from '../components/EntryForm';
import { entryService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

const Entries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [filters, setFilters] = useState({
    description: '',
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    channel: '',
    costCenter: '',
    paymentMethod: '',
  });

  const categories = {
    income: [
      'vendas_loja_fisica',
      'vendas_delivery',
      'vendas_ifood',
      'vendas_lounge',
      'eventos',
      'outras_receitas',
    ],
    expense: [
      'compras_mercadorias',
      'funcionarios',
      'motoboy',
      'aluguel',
      'energia',
      'agua',
      'internet',
      'sistema',
      'contador',
      'marketing',
      'taxas_cartao',
      'taxas_mercado_pago',
      'taxas_ifood',
      'emprestimos',
      'impostos',
      'manutencao',
      'embalagens',
      'outras_despesas',
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

  const costCenters = [
    'operacao_loja',
    'delivery',
    'ifood',
    'lounge',
    'marketing',
    'administrativo',
    'estrutura',
    'impostos',
    'financeiro',
    'estoque',
    'outros',
  ];

  const paymentMethods = [
    'dinheiro',
    'pix',
    'debito',
    'credito',
    'mercado_pago',
    'ifood_repasse',
    'boleto',
    'outros',
  ];

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadEntries = async () => {
    try {
      setLoading(true);

      const params = {};

      if (filters.description) params.description = filters.description;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.channel) params.channel = filters.channel;
      if (filters.costCenter) params.costCenter = filters.costCenter;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      const response = await entryService.getAll(params);
      setEntries(response.data);
    } catch (error) {
      toast.error('Erro ao carregar lançamentos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      await entryService.delete(id);
      toast.success('Lançamento excluído com sucesso');
      loadEntries();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir lançamento');
    }
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setShowEditModal(true);
  };

  const handleUpdate = async (data) => {
    try {
      await entryService.update(selectedEntry._id, data);
      toast.success('Lançamento atualizado com sucesso');
      setShowEditModal(false);
      setSelectedEntry(null);
      loadEntries();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar lançamento');
    }
  };

  const clearFilters = () => {
    setFilters({
      description: '',
      startDate: '',
      endDate: '',
      type: '',
      category: '',
      channel: '',
      costCenter: '',
      paymentMethod: '',
    });
  };

  const handleTypeFilterChange = (type) => {
    setFilters({
      ...filters,
      type,
      category: '',
      channel: '',
      costCenter: '',
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      vendas_loja_fisica: 'Venda Loja Física',
      vendas_delivery: 'Venda Delivery',
      vendas_ifood: 'Venda iFood',
      vendas_lounge: 'Venda Lounge',
      eventos: 'Eventos',
      outras_receitas: 'Outras Receitas',

      compras_mercadorias: 'Compras',
      funcionarios: 'Funcionários',
      motoboy: 'Motoboy',
      aluguel: 'Aluguel',
      energia: 'Energia',
      agua: 'Água',
      internet: 'Internet',
      sistema: 'Sistema',
      contador: 'Contador',
      marketing: 'Marketing',
      taxas_cartao: 'Taxas Cartão',
      taxas_mercado_pago: 'Taxas Mercado Pago',
      taxas_ifood: 'Taxas iFood',
      emprestimos: 'Empréstimos',
      impostos: 'Impostos',
      manutencao: 'Manutenção',
      embalagens: 'Embalagens',
      outras_despesas: 'Outras Despesas',
    };

    return labels[category] || category || '-';
  };

  const getChannelLabel = (channel) => {
    const labels = {
      loja_fisica: 'Loja Física',
      bebcom_delivery: 'Bebcom Delivery',
      ifood: 'iFood',
      whatsapp: 'WhatsApp',
      bebcom_lounge: 'Bebcom Lounge',
      eventos: 'Eventos',
      outros: 'Outros',
    };

    return labels[channel] || channel || '-';
  };

  const getCostCenterLabel = (center) => {
    const labels = {
      operacao_loja: 'Operação Loja',
      delivery: 'Delivery',
      ifood: 'iFood',
      lounge: 'Lounge',
      marketing: 'Marketing',
      administrativo: 'Administrativo',
      estrutura: 'Estrutura',
      impostos: 'Impostos',
      financeiro: 'Financeiro',
      estoque: 'Estoque',
      outros: 'Outros',
    };

    return labels[center] || center || '-';
  };

  const getOriginOrCenterLabel = (entry) => {
    if (entry.type === 'income') {
      return getChannelLabel(entry.channel);
    }

    return getCostCenterLabel(entry.costCenter);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      debito: 'Débito',
      credito: 'Crédito',
      mercado_pago: 'Mercado Pago',
      ifood_repasse: 'iFood Repasse',
      boleto: 'Boleto',
      outros: 'Outros',
    };

    return labels[method] || method || '-';
  };

  const availableCategories = filters.type
    ? categories[filters.type]
    : [...categories.income, ...categories.expense];

  return (
    <div className="p-3 sm:p-4 md:py-6 md:pr-6 md:pl-4 lg:pl-6">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Lançamentos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Histórico completo de transações
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtros

            {Object.values(filters).some((f) => f) && (
              <span className="ml-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm md:text-base">
              Filtros de Busca
            </h3>

            <button
              onClick={clearFilters}
              className="text-xs md:text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
              Limpar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>

              <input
                type="text"
                value={filters.description}
                onChange={(e) =>
                  setFilters({ ...filters, description: e.target.value })
                }
                className="input-field text-sm"
                placeholder="Ex: Ambev, Faturamento, Santander..."
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>

              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>

              <select
                value={filters.type}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Todos</option>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>

              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="input-field text-sm"
              >
                <option value="">Todas</option>

                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {filters.type === 'expense' ? (
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Centro de Custo
                </label>

                <select
                  value={filters.costCenter}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      costCenter: e.target.value,
                      channel: '',
                    })
                  }
                  className="input-field text-sm"
                >
                  <option value="">Todos</option>

                  {costCenters.map((center) => (
                    <option key={center} value={center}>
                      {getCostCenterLabel(center)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Canal
                </label>

                <select
                  value={filters.channel}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      channel: e.target.value,
                      costCenter: '',
                    })
                  }
                  className="input-field text-sm"
                >
                  <option value="">Todos</option>

                  {channels.map((ch) => (
                    <option key={ch} value={ch}>
                      {getChannelLabel(ch)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Pagamento
              </label>

              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  setFilters({ ...filters, paymentMethod: e.target.value })
                }
                className="input-field text-sm"
              >
                <option value="">Todos</option>

                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {getPaymentMethodLabel(pm)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum lançamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600">
                    Data
                  </th>
                  <th className="text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600">
                    Descrição
                  </th>
                  <th className="text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hidden md:table-cell">
                    Categoria
                  </th>
                  <th className="text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hidden lg:table-cell">
                    Origem / Centro
                  </th>
                  <th className="text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600 hidden xl:table-cell">
                    Pagamento
                  </th>
                  <th className="text-right px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600">
                    Valor
                  </th>
                  <th className="text-center px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                      {formatDate(entry.date)}
                    </td>

                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                          {entry.description}
                        </p>

                        <p className="text-xs text-gray-400 md:hidden mt-1">
                          {getCategoryLabel(entry.category)}
                        </p>

                        <p className="text-xs text-gray-400 lg:hidden mt-1">
                          {getOriginOrCenterLabel(entry)}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm hidden md:table-cell">
                      {getCategoryLabel(entry.category)}
                    </td>

                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm hidden lg:table-cell">
                      {getOriginOrCenterLabel(entry)}
                    </td>

                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm hidden xl:table-cell">
                      {getPaymentMethodLabel(entry.paymentMethod)}
                    </td>

                    <td
                      className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-right font-semibold ${
                        entry.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(entry.amount)}
                    </td>

                    <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 sm:p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          aria-label="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-1.5 sm:p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && selectedEntry && (
        <EntryForm
          initialData={selectedEntry}
          onSubmit={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default Entries;
