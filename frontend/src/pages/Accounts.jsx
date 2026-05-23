import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Save,
  Pencil,
  Loader,
  X,
  CheckCircle,
  Trash2,
  Ban,
  Filter,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { accountService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({});
  const [cashFlow, setCashFlow] = useState([]);
  const [realizedCashFlow, setRealizedCashFlow] = useState([]);
  const [cashFlowFilters, setCashFlowFilters] = useState(() => {
  const currentDate = new Date();

  return {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };
});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    description: '',
    person: '',
    startDate: '',
    endDate: '',
    category: '',
    costCenter: '',
    channel: '',
    paymentMethod: '',
  });

  const emptyForm = {
    type: 'payable',
    description: '',
    person: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    category: '',
    channel: '',
    costCenter: '',
    paymentMethod: '',
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const categories = {
    payable: [
      { value: 'compras_mercadorias', label: 'Compras de Mercadorias' },
      { value: 'funcionarios', label: 'Funcionários' },
      { value: 'motoboy', label: 'Motoboy' },
      { value: 'aluguel', label: 'Aluguel' },
      { value: 'energia', label: 'Energia' },
      { value: 'agua', label: 'Água' },
      { value: 'internet', label: 'Internet' },
      { value: 'sistema', label: 'Sistema' },
      { value: 'contador', label: 'Contador' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'taxas_cartao', label: 'Taxas de Cartão' },
      { value: 'taxas_mercado_pago', label: 'Taxas Mercado Pago' },
      { value: 'taxas_ifood', label: 'Taxas iFood' },
      { value: 'emprestimos', label: 'Empréstimos' },
      { value: 'impostos', label: 'Impostos' },
      { value: 'manutencao', label: 'Manutenção' },
      { value: 'embalagens', label: 'Embalagens' },
      { value: 'outras_despesas', label: 'Outras Despesas' },
    ],
    receivable: [
      { value: 'vendas_loja_fisica', label: 'Venda Loja Física' },
      { value: 'vendas_delivery', label: 'Venda Delivery' },
      { value: 'vendas_ifood', label: 'Venda iFood' },
      { value: 'vendas_lounge', label: 'Venda Lounge' },
      { value: 'eventos', label: 'Eventos' },
      { value: 'outras_receitas', label: 'Outras Receitas' },
    ],
  };

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

  const channels = [
    { value: 'loja_fisica', label: 'Loja Física' },
    { value: 'bebcom_delivery', label: 'Bebcom Delivery' },
    { value: 'ifood', label: 'iFood' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'bebcom_lounge', label: 'Bebcom Lounge' },
    { value: 'eventos', label: 'Eventos' },
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

useEffect(() => {
  loadAccounts();
}, [
  filters.type,
  filters.status,
  filters.description,
  filters.person,
  filters.startDate,
  filters.endDate,
  filters.category,
  filters.costCenter,
  filters.channel,
  filters.paymentMethod,
]);
useEffect(() => {
  loadCashFlow();
}, [cashFlowFilters.month, cashFlowFilters.year]);

  const loadAccounts = async () => {
  try {
    setLoading(true);

    const response = await accountService.getAll(filters);

    setAccounts(response.data.accounts || []);
    setSummary(response.data.summary || {});
  } catch (error) {
    toast.error('Erro ao carregar contas');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const loadCashFlow = async () => {
  try {
    const cashFlowResponse = await accountService.getCashFlow(
      cashFlowFilters.month,
      cashFlowFilters.year
    );

    const realizedResponse = await accountService.getRealizedCashFlow(
      cashFlowFilters.month,
      cashFlowFilters.year
    );

    setCashFlow(cashFlowResponse.data.projection || []);
    setRealizedCashFlow(realizedResponse.data.realized || []);
  } catch (error) {
    toast.error('Erro ao carregar fluxo de caixa');
    console.error(error);
  }
};

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingAccount(null);
    setShowForm(false);
  };

  const normalizeDateForInput = (date) => {
    if (!date) return '';
    return String(date).slice(0, 10);
  };

  const handleEdit = (account) => {
  setEditingAccount(account);
  setFormData({
    type: account.type || 'payable',
    description: account.description || '',
    person: account.person || '',
    amount: account.amount || '',
    dueDate: normalizeDateForInput(account.dueDate),
    category: account.category || '',
    channel: account.channel || '',
    costCenter: account.costCenter || '',
    paymentMethod: account.paymentMethod || '',
    notes: account.notes || '',
  });

  setShowForm(true);

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, 100);
};

  const handleChange = (field, value) => {
    if (field === 'type') {
      setFormData({
        ...formData,
        type: value,
        category: '',
        channel: value === 'receivable' ? formData.channel : '',
        costCenter: value === 'payable' ? formData.costCenter : '',
      });
      return;
    }

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...formData,
        amount: Math.abs(Number(formData.amount || 0)),
        channel: formData.type === 'receivable' ? formData.channel : '',
        costCenter: formData.type === 'payable' ? formData.costCenter : '',
      };

      if (editingAccount) {
        await accountService.update(editingAccount._id, payload);
        toast.success('Conta atualizada com sucesso!');
      } else {
        await accountService.create(payload);
        toast.success('Conta cadastrada com sucesso!');
      }

      resetForm();
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar conta');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getTodayLocalDate = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

  const handleSettle = async (account) => {
    const label = account.type === 'payable' ? 'paga' : 'recebida';

    if (!confirm(`Marcar esta conta como ${label}?`)) return;

    try {
      await accountService.settle(account._id, getTodayLocalDate());
      toast.success(`Conta marcada como ${label}!`);
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao baixar conta');
    }
  };

  const handleCancel = async (account) => {
    if (!confirm('Cancelar esta conta?')) return;

    try {
      await accountService.cancel(account._id);
      toast.success('Conta cancelada com sucesso!');
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar conta');
    }
  };

  const handleDelete = async (account) => {
    if (!confirm('Excluir esta conta?')) return;

    try {
      await accountService.delete(account._id);
      toast.success('Conta excluída com sucesso!');
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao excluir conta');
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      description: '',
      person: '',
      startDate: '',
      endDate: '',
      category: '',
      costCenter: '',
      channel: '',
      paymentMethod: '',
    });
  };

  const getTypeLabel = (type) => {
    if (type === 'payable') return 'A pagar';
    if (type === 'receivable') return 'A receber';
    return '-';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      overdue: 'Vencida',
      paid: 'Paga',
      received: 'Recebida',
      cancelled: 'Cancelada',
    };

    return labels[status] || status || '-';
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-700',
    };

    return classes[status] || 'bg-gray-100 text-gray-700';
  };

  const getLabel = (items, value) => {
    const found = items.find((item) => item.value === value);
    return found?.label || value || '-';
  };

  const SummaryCard = ({ title, value, icon: Icon, tone = 'amber' }) => {
    const colors = {
      amber: 'bg-amber-100 text-amber-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
    };

    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(value || 0)}
            </h3>
          </div>

          <div className={`${colors[tone]} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const availableCategories = formData.type
    ? categories[formData.type]
    : [...categories.payable, ...categories.receivable];

  const filterCategories = filters.type
    ? categories[filters.type]
    : [...categories.payable, ...categories.receivable];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contas a Pagar / Receber
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Controle de compromissos financeiros futuros e pendentes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingAccount(null);
              setFormData(emptyForm);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Conta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total a Pagar"
          value={summary.totalPayable}
          icon={TrendingDown}
          tone="red"
        />

        <SummaryCard
          title="Total a Receber"
          value={summary.totalReceivable}
          icon={TrendingUp}
          tone="green"
        />

        <SummaryCard
          title="Saldo Previsto"
          value={summary.projectedBalance}
          icon={Wallet}
          tone="blue"
        />

        <SummaryCard
          title="Vencidas"
          value={(summary.overduePayable || 0) + (summary.overdueReceivable || 0)}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Análise de Fluxo de Caixa
      </h2>

      <p className="text-sm text-gray-600">
        Selecione o mês e ano para atualizar o fluxo previsto e realizado
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={cashFlowFilters.month}
        onChange={(e) =>
          setCashFlowFilters((prev) => ({
            ...prev,
            month: Number(e.target.value),
          }))
        }
        className="input-field"
      >
        {[
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
        ].map((month, index) => (
          <option key={month} value={index + 1}>
            {month}
          </option>
        ))}
      </select>

      <select
        value={cashFlowFilters.year}
        onChange={(e) =>
          setCashFlowFilters((prev) => ({
            ...prev,
            year: Number(e.target.value),
          }))
        }
        className="input-field"
      >
        {[2024, 2025, 2026, 2027, 2028].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>

      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Fluxo de Caixa Previsto
      </h2>

      <p className="text-sm text-gray-600">
        Projeção baseada em contas pendentes e vencidas
      </p>
    </div>

    <div className="bg-blue-100 p-3 rounded-xl">
      <Activity className="w-6 h-6 text-blue-600" />
    </div>
  </div>

  {cashFlow.length === 0 ? (
    <p className="text-gray-500">
      Sem dados para projeção.
    </p>
  ) : (
    <>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={cashFlow}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="label" />

          <YAxis tickFormatter={(value) => formatCurrency(value)} />

          <Tooltip formatter={(value) => formatCurrency(value)} />

          <Bar
            dataKey="receivable"
            name="Entradas Previstas"
            radius={[8, 8, 0, 0]}
          />

          <Bar
            dataKey="payable"
            name="Saídas Previstas"
            radius={[8, 8, 0, 0]}
          />

          <Bar
            dataKey="balance"
            name="Saldo Previsto"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {cashFlow.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl p-4 border ${
              item.balance < 0
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <p className="text-sm font-medium text-gray-700">
              {item.label}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Entradas: {formatCurrency(item.receivable || 0)}
            </p>

            <p className="text-xs text-gray-500">
              Saídas: {formatCurrency(item.payable || 0)}
            </p>

            <p
              className={`text-lg font-bold mt-2 ${
                item.balance < 0
                  ? 'text-red-700'
                  : 'text-green-700'
              }`}
            >
              {formatCurrency(item.balance || 0)}
            </p>
          </div>
        ))}
      </div>
    </>
  )}
</div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
  <div className="flex items-center justify-between p-5 border-b">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Fluxo de Caixa Realizado
      </h2>

      <p className="text-sm text-gray-600">
        Entradas e saídas reais provenientes dos lançamentos
      </p>
    </div>

    <div className="bg-green-100 p-3 rounded-xl">
      <Wallet className="w-6 h-6 text-green-600" />
    </div>
  </div>

  {realizedCashFlow.length === 0 ? (
    <div className="p-6 text-gray-500">
      Nenhum lançamento encontrado.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
              Data
            </th>

            <th className="text-right px-4 py-3 text-sm font-semibold text-green-700">
              Entradas
            </th>

            <th className="text-right px-4 py-3 text-sm font-semibold text-red-700">
              Saídas
            </th>

            <th className="text-right px-4 py-3 text-sm font-semibold text-blue-700">
              Saldo do Dia
            </th>

            <th className="text-right px-4 py-3 text-sm font-semibold text-amber-700">
              Saldo Acumulado
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {realizedCashFlow.map((item) => (
            <tr
              key={item.date}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {formatDate(item.date)}
              </td>

              <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                {formatCurrency(item.income || 0)}
              </td>

              <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                {formatCurrency(item.expense || 0)}
              </td>

              <td
                className={`px-4 py-3 text-sm text-right font-bold ${
                  item.balance < 0
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}
              >
                {formatCurrency(item.balance || 0)}
              </td>

              <td
                className={`px-4 py-3 text-sm text-right font-bold ${
                  item.accumulated < 0
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}
              >
                {formatCurrency(item.accumulated || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {showFilters && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Filtros</h2>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <input
              type="text"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
              className="input-field"
              placeholder="Descrição"
            />

            <input
              type="text"
              value={filters.person}
              onChange={(e) => setFilters({ ...filters, person: e.target.value })}
              className="input-field"
              placeholder="Pessoa/Empresa"
            />

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field"
            />

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value,
                  category: '',
                  channel: '',
                  costCenter: '',
                })
              }
              className="input-field"
            >
              <option value="">Tipo</option>
              <option value="payable">A pagar</option>
              <option value="receivable">A receber</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">Status</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Vencida</option>
              <option value="paid">Paga</option>
              <option value="received">Recebida</option>
              <option value="cancelled">Cancelada</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">Categoria</option>
              {filterCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {filters.type === 'receivable' ? (
              <select
                value={filters.channel}
                onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                className="input-field"
              >
                <option value="">Canal</option>
                {channels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={filters.costCenter}
                onChange={(e) => setFilters({ ...filters, costCenter: e.target.value })}
                className="input-field"
              >
                <option value="">Centro de Custo</option>
                {costCenters.map((center) => (
                  <option key={center.value} value={center.value}>
                    {center.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingAccount ? 'Editar Conta' : 'Nova Conta'}
            </h2>

            <button type="button" onClick={resetForm}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="input-field"
              required
            >
              <option value="payable">A pagar</option>
              <option value="receivable">A receber</option>
            </select>

            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field"
              placeholder="Descrição"
              required
            />

            <input
              type="text"
              value={formData.person}
              onChange={(e) => handleChange('person', e.target.value)}
              className="input-field"
              placeholder="Pessoa/Empresa"
            />

            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className="input-field"
              placeholder="Valor"
              required
            />

            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="input-field"
              required
            />

            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">Categoria</option>
              {availableCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {formData.type === 'receivable' ? (
              <select
                value={formData.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                className="input-field"
              >
                <option value="">Canal de venda</option>
                {channels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={formData.costCenter}
                onChange={(e) => handleChange('costCenter', e.target.value)}
                className="input-field"
              >
                <option value="">Centro de custo</option>
                {costCenters.map((center) => (
                  <option key={center.value} value={center.value}>
                    {center.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="input-field"
            >
              <option value="">Forma de pagamento</option>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>

            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="input-field md:col-span-2 xl:col-span-3"
              rows="3"
              placeholder="Observações"
            />

            <div className="md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Conta
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhuma conta encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vencimento</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Descrição</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Pessoa/Empresa</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Valor</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {accounts.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(account.dueDate)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {getTypeLabel(account.type)}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {account.description}
                      <p className="text-xs text-gray-400 mt-1">
                        {getLabel(
                          account.type === 'payable' ? costCenters : channels,
                          account.type === 'payable' ? account.costCenter : account.channel
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {account.person || '-'}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(account.status)}`}>
                        {getStatusLabel(account.status)}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-3 text-sm text-right font-semibold ${
                        account.type === 'payable'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {account.type === 'payable' ? '-' : '+'}{' '}
                      {formatCurrency(account.amount)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {(account.status === 'pending' || account.status === 'overdue') && (
                          <button
                            type="button"
                            onClick={() => handleSettle(account)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Baixar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(account)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                          >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {(account.status === 'pending' || account.status === 'overdue') && (
                          <button
                            type="button"
                            onClick={() => handleCancel(account)}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title="Cancelar"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(account)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Excluir"
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
    </div>
  );
};

export default Accounts;
