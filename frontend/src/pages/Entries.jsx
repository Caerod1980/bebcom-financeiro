import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Eye, Loader, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    channel: '',
    paymentMethod: '',
  });

  const types = ['income', 'expense'];
  const categories = {
    income: ['vendas_loja_fisica', 'vendas_delivery', 'vendas_ifood', 'vendas_lounge', 'eventos', 'outras_receitas'],
    expense: ['compras_mercadorias', 'fornecedores', 'funcionarios', 'motoboy', 'aluguel', 'energia', 'agua', 'internet', 'sistema', 'contador', 'marketing', 'taxas_cartao', 'taxas_mercado_pago', 'taxas_ifood', 'impostos', 'manutencao', 'embalagens', 'outras_despesas'],
  };
  const channels = ['loja_fisica', 'bebcom_delivery', 'ifood', 'whatsapp', 'bebcom_lounge', 'eventos', 'outros'];
  const paymentMethods = ['dinheiro', 'pix', 'debito', 'credito', 'mercado_pago', 'ifood_repasse', 'transferencia', 'outros'];

  useEffect(() => {
    loadEntries();
  }, [filters]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.channel) params.channel = filters.channel;
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
      toast.error('Erro ao excluir lançamento');
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
      toast.error('Erro ao atualizar lançamento');
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      category: '',
      channel: '',
      paymentMethod: '',
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
      fornecedores: 'Fornecedores',
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
      impostos: 'Impostos',
      manutencao: 'Manutenção',
      embalagens: 'Embalagens',
      outras_despesas: 'Outras Despesas',
    };
    return labels[category] || category;
  };

  const getChannelLabel = (channel) => {
    const labels = {
      loja_fisica: 'Loja Física',
      bebcom_delivery: 'Delivery',
      ifood: 'iFood',
      whatsapp: 'WhatsApp',
      bebcom_lounge: 'Lounge',
      eventos: 'Eventos',
      outros: 'Outros',
    };
    return labels[channel] || channel;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
              <p className="text-gray-600 mt-1">Histórico completo de transações</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filtros de Busca</h3>
                <button onClick={clearFilters} className="text-sm text-amber-600 hover:text-amber-700">
                  Limpar filtros
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="income">Entrada</option>
                    <option value="expense">Saída</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todas</option>
                    {filters.type === 'income' && categories.income.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                    {filters.type === 'expense' && categories.expense.map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                    {!filters.type && [...categories.income, ...categories.expense].map(cat => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canal
                  </label>
                  <select
                    value={filters.channel}
                    onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    {channels.map(ch => (
                      <option key={ch} value={ch}>{getChannelLabel(ch)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pagamento
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    {paymentMethods.map(pm => (
                      <option key={pm} value={pm}>{pm.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Entries Table */}
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
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Data</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Descrição</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Categoria</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Canal</th>
                      <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Valor</th>
                      <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 text-sm">{entry.description}</td>
                        <td className="px-6 py-4 text-sm">{getCategoryLabel(entry.category)}</td>
                        <td className="px-6 py-4 text-sm">{getChannelLabel(entry.channel)}</td>
                        <td className={`px-6 py-4 text-sm text-right font-semibold ${
                          entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'income' ? '+' : '-'} {formatCurrency(entry.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </main>
      </div>
      
      {/* Edit Modal */}
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
