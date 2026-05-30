import React, { useEffect, useState } from 'react';
import {
  Boxes,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader,
  Save,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { inventoryService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const Inventory = () => {
  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [inventory, setInventory] = useState(null);

  const [formData, setFormData] = useState({
    initialStock: 0,
    notes: '',
  });

 const [totals, setTotals] = useState({
  initialStock: 0,
  purchases: 0,
  cmv: 0,
  netRevenue: 0,
  grossMarginPercent: 0,
  stockBalance: 0,
  internalConsumption: 0,
  losses: 0,
  stockConsumption: 0,
  finalStock: 0,
});

  useEffect(() => {
    loadInventory();
  }, [month, year]);

  const loadInventory = async () => {
    try {
      setLoading(true);

      const response =
        await inventoryService.getInventory(
          year,
          month
        );

      const inventoryData =
        response.data.inventory;

      const totalsData =
        response.data.totals;

      setInventory(inventoryData);

      setTotals(totalsData);

      setFormData({
        initialStock:
          inventoryData?.initialStock || 0,

        notes:
          inventoryData?.notes || '',
      });
    } catch (error) {
      toast.error(
        'Erro ao carregar estoque'
      );

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await inventoryService.saveInventory(
        year,
        month,
        {
          initialStock: Number(
            formData.initialStock || 0
          ),
          notes: formData.notes,
        }
      );

      toast.success(
        'Estoque salvo com sucesso!'
      );

      loadInventory();
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          'Erro ao salvar estoque'
      );

      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const SummaryCard = ({
    title,
    value,
    icon: Icon,
    tone = 'amber',
  }) => {
    const colors = {
      amber:
        'bg-amber-100 text-amber-600',

      green:
        'bg-green-100 text-green-600',

      red:
        'bg-red-100 text-red-600',

      blue:
        'bg-blue-100 text-blue-600',
    };

    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {title}
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(value || 0)}
            </h3>
          </div>

          <div
            className={`${colors[tone]} p-3 rounded-xl`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="w-5 h-5 animate-spin text-amber-500" />

          Carregando estoque...
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Estoque Financeiro
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Controle financeiro estimado do estoque
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) =>
              setMonth(
                Number(e.target.value)
              )
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
            ].map((monthName, index) => (
              <option
                key={monthName}
                value={index + 1}
              >
                {monthName}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) =>
              setYear(
                Number(e.target.value)
              )
            }
            className="input-field"
          >
            {[2024, 2025, 2026, 2027].map(
              (yearValue) => (
                <option
                  key={yearValue}
                  value={yearValue}
                >
                  {yearValue}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Estoque Inicial"
          value={totals.initialStock}
          icon={Package}
          tone="blue"
        />

        <SummaryCard
          title="Compras"
          value={totals.purchases}
          icon={TrendingUp}
          tone="green"
        />

       <div className="bg-white rounded-2xl p-5 shadow-sm border">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">
        Saldo Estoque
      </p>

      <h3 className="text-2xl font-bold text-gray-900 mt-2">
        {formatCurrency(totals.stockBalance || 0)}
      </h3>

      <p className="text-xs text-gray-500 mt-2">
        Receita Líquida:
        {' '}
        {formatCurrency(totals.netRevenue || 0)}
      </p>

      <p className="text-xs text-gray-500">
        Margem Bruta:
        {' '}
        {((totals.grossMarginPercent || 0) * 100).toFixed(1)}%
      </p>

     <p className="text-xs text-gray-500">
  Consumo Interno:
  {' '}
  {formatCurrency(totals.internalConsumption || 0)}
</p>

<p className="text-xs text-gray-500">
  Perdas:
  {' '}
  {formatCurrency(totals.losses || 0)}
</p>

<p className="text-xs text-gray-500 font-medium">
  Baixa Total:
  {' '}
  {formatCurrency(totals.stockConsumption || 0)}
</p>
    </div>

    <div className="bg-red-100 text-red-600 p-3 rounded-xl">
      <TrendingDown className="w-6 h-6" />
    </div>
  </div>
</div>
        <SummaryCard
          title="Estoque Final"
          value={totals.finalStock}
          icon={Wallet}
          tone="amber"
        />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Boxes className="w-5 h-5 text-amber-600" />

          <h2 className="text-lg font-semibold">
            Configuração do Estoque
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque Inicial
            </label>

            <input
  type="number"
  step="0.01"
  min="0"
  disabled={month !== 1}
  value={formData.initialStock}
  onChange={(e) =>
    setFormData({
      ...formData,
      initialStock: e.target.value,
    })
  }
  className="input-field"
  placeholder="0,00"
/>
            {month !== 1 && (
  <p className="text-xs text-gray-500 mt-1">
    Valor herdado automaticamente do mês anterior
  </p>
)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque Final Estimado
            </label>

            <div className="input-field bg-gray-50 flex items-center font-bold text-gray-900">
              {formatCurrency(
                totals.finalStock || 0
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>

          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
            className="input-field"
            rows="4"
            placeholder="Observações sobre estoque, compras, ajustes ou inventário..."
          />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            Salvar Estoque
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
