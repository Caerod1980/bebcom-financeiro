import React, { useEffect, useState } from 'react';
import {
  Building2,
  Save,
  Loader,
  FileText,
  Landmark,
  Wallet,
  Scale,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { balanceSheetService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const BalanceSheet = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    referenceDate: '31/12',
    assets: {
      cash: 0,
      bank: 0,
      inventory: 0,
      receivables: 0,
      equipment: 0,
      otherAssets: 0,
    },
    liabilities: {
      loans: 0,
      suppliers: 0,
      taxes: 0,
      fixedBills: 0,
      otherLiabilities: 0,
    },
    notes: '',
  });

  const [totals, setTotals] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    equity: 0,
    annualProfit: 0,
    loansPaidInYear: 0,
  });

  const [annualDREPreview, setAnnualDREPreview] = useState({
    lucroLiquido: 0,
    emprestimosPagosNoAno: 0,
  });

  useEffect(() => {
    loadBalanceSheet();
  }, [year]);

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);

      const response = await balanceSheetService.getByYear(year);
      const balanceSheet = response.data.balanceSheet;

      setFormData({
        referenceDate: balanceSheet.referenceDate || '31/12',
        assets: {
          cash: balanceSheet.assets?.cash || 0,
          bank: balanceSheet.assets?.bank || 0,
          inventory: balanceSheet.assets?.inventory || 0,
          receivables: balanceSheet.assets?.receivables || 0,
          equipment: balanceSheet.assets?.equipment || 0,
          otherAssets: balanceSheet.assets?.otherAssets || 0,
        },
        liabilities: {
          loans: balanceSheet.liabilities?.loans || 0,
          suppliers: balanceSheet.liabilities?.suppliers || 0,
          taxes: balanceSheet.liabilities?.taxes || 0,
          fixedBills: balanceSheet.liabilities?.fixedBills || 0,
          otherLiabilities: balanceSheet.liabilities?.otherLiabilities || 0,
        },
        notes: balanceSheet.notes || '',
      });

      setTotals(response.data.totals || {});
      setAnnualDREPreview(response.data.annualDREPreview || {});
    } catch (error) {
      toast.error('Erro ao carregar Balanço Patrimonial');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toNumber = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  };

  const calculateLocalTotals = (data) => {
  const assets = data.assets || {};
  const liabilities = data.liabilities || {};

  const totalAssets =
    toNumber(assets.cash) +
    toNumber(assets.bank) +
    toNumber(assets.inventory) +
    toNumber(assets.receivables) +
    toNumber(assets.equipment) +
    toNumber(assets.otherAssets);

  const totalLiabilities =
    toNumber(liabilities.loans) +
    toNumber(liabilities.suppliers) +
    toNumber(liabilities.taxes) +
    toNumber(liabilities.fixedBills) +
    toNumber(liabilities.otherLiabilities);

  return {
    totalAssets,
    totalLiabilities,
    equity: totalAssets - totalLiabilities,
  };
};

  const calculateIndicators = (totalAssets, totalLiabilities, equity) => {
  const liquidity =
    totalLiabilities > 0 ? totalAssets / totalLiabilities : 0;

  const debtRatio =
    totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const equityRatio =
    totalAssets > 0 ? (equity / totalAssets) * 100 : 0;

  return { liquidity, debtRatio, equityRatio };
};

const getEquityStatus = (equity) => {
  if (equity < 0) return 'Crítico';
  if (equity === 0) return 'Atenção';
  return 'Saudável';
};

  const handleAssetChange = (field, value) => {
    const updated = {
      ...formData,
      assets: {
        ...formData.assets,
        [field]: value,
      },
    };

    setFormData(updated);
    setTotals((prev) => ({
      ...prev,
      ...calculateLocalTotals(updated),
    }));
  };

  const handleLiabilityChange = (field, value) => {
    const updated = {
      ...formData,
      liabilities: {
        ...formData.liabilities,
        [field]: value,
      },
    };

    setFormData(updated);
    setTotals((prev) => ({
      ...prev,
      ...calculateLocalTotals(updated),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        referenceDate: formData.referenceDate,
        assets: {
          cash: toNumber(formData.assets.cash),
          bank: toNumber(formData.assets.bank),
          inventory: toNumber(formData.assets.inventory),
          receivables: toNumber(formData.assets.receivables),
          equipment: toNumber(formData.assets.equipment),
          otherAssets: toNumber(formData.assets.otherAssets),
        },
        liabilities: {
          loans: toNumber(formData.liabilities.loans),
          suppliers: toNumber(formData.liabilities.suppliers),
          taxes: toNumber(formData.liabilities.taxes),
          fixedBills: toNumber(formData.liabilities.fixedBills),
          otherLiabilities: toNumber(formData.liabilities.otherLiabilities),
        },
        notes: formData.notes,
      };

      const response = await balanceSheetService.save(year, payload);

      setTotals(response.data.totals || calculateLocalTotals(payload));
      toast.success('Balanço Patrimonial salvo com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar Balanço Patrimonial');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const NumberInput = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        placeholder="0,00"
      />
    </div>
  );

  const SummaryCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(value || 0)}
          </h3>
        </div>

        <div className="bg-amber-100 p-3 rounded-xl">
          <Icon className="w-6 h-6 text-amber-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="w-5 h-5 animate-spin text-amber-500" />
          Carregando Balanço Patrimonial...
        </div>
      </div>
    );
  }

  const localTotals = calculateLocalTotals(formData);
  const displayTotals = {
    ...totals,
    totalAssets: localTotals.totalAssets,
    totalLiabilities: localTotals.totalLiabilities,
    equity: localTotals.equity,
  };

  const indicators = calculateIndicators(
  displayTotals.totalAssets,
  displayTotals.totalLiabilities,
  displayTotals.equity
);

const equityStatus = getEquityStatus(displayTotals.equity);

  return (
  <>
    <div className="p-3 sm:p-4 md:p-6 print:hidden">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Balanço Patrimonial
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Posição patrimonial da Bebidas & Companhia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-40"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={formData.referenceDate}
            onChange={(e) =>
              setFormData({ ...formData, referenceDate: e.target.value })
            }
            className="input-field w-32"
            placeholder="31/12"
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Balanço
          </button>

          <button
            type="button"
            onClick={() => setTimeout(() => window.print(), 100)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Total do Ativo" value={displayTotals.totalAssets} icon={Wallet} />
        <SummaryCard title="Total do Passivo" value={displayTotals.totalLiabilities} icon={Landmark} />
        <SummaryCard title="Patrimônio Líquido" value={displayTotals.equity} icon={Scale} />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Análise Patrimonial
        </h2>

        <p className="text-sm text-gray-600 mt-1">
          Leitura gerencial da estrutura patrimonial da empresa
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Situação Patrimonial</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{equityStatus}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Liquidez Patrimonial</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {indicators.liquidity.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">Endividamento</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {indicators.debtRatio.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">
                Capital Próprio
             </p>

          <p className="text-xl font-bold text-gray-900 mt-1">
               {indicators.equityRatio.toFixed(1)}%
         </p>
          </div>       
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold">Integração com DRE Anual</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500">Lucro líquido anual apurado</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(annualDREPreview.lucroLiquido || 0)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500">Empréstimos pagos no ano</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(annualDREPreview.emprestimosPagosNoAno || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Informação vinda da categoria Empréstimos.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Visão Estratégica da IA Bebcom
        </h2>

        <p className="text-sm text-gray-600 mt-3">
          O Balanço Patrimonial mostra a posição financeira acumulada da empresa.
          Quando o patrimônio líquido está positivo, a operação possui mais bens e direitos
          do que obrigações registradas.
        </p>

        <p className="text-sm text-gray-600 mt-3">
          Minha leitura gerencial: acompanhe a relação entre ativo, passivo e patrimônio líquido.
          Quanto menor a dependência de dívidas e maior a formação de patrimônio próprio,
          mais forte tende a ser a estrutura financeira da empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-green-50 px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-700" />
              <h2 className="text-lg font-semibold text-gray-900">Ativo</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tudo que a empresa possui ou tem a receber.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <NumberInput label="Caixa" value={formData.assets.cash} onChange={(value) => handleAssetChange('cash', value)} />
            <NumberInput label="Banco" value={formData.assets.bank} onChange={(value) => handleAssetChange('bank', value)} />
            <NumberInput label="Estoque" value={formData.assets.inventory} onChange={(value) => handleAssetChange('inventory', value)} />
            <NumberInput label="Contas a Receber" value={formData.assets.receivables} onChange={(value) => handleAssetChange('receivables', value)} />
            <NumberInput label="Equipamentos / Imobilizado" value={formData.assets.equipment} onChange={(value) => handleAssetChange('equipment', value)} />
            <NumberInput label="Outros Ativos" value={formData.assets.otherAssets} onChange={(value) => handleAssetChange('otherAssets', value)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-red-50 px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-red-700" />
              <h2 className="text-lg font-semibold text-gray-900">Passivo</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tudo que a empresa deve ou precisa pagar.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <NumberInput label="Empréstimos / Financiamentos" value={formData.liabilities.loans} onChange={(value) => handleLiabilityChange('loans', value)} />
            <NumberInput label="Fornecedores a Pagar" value={formData.liabilities.suppliers} onChange={(value) => handleLiabilityChange('suppliers', value)} />
            <NumberInput label="Impostos a Pagar" value={formData.liabilities.taxes} onChange={(value) => handleLiabilityChange('taxes', value)} />
            <NumberInput label="Contas Fixas a Pagar" value={formData.liabilities.fixedBills} onChange={(value) => handleLiabilityChange('fixedBills', value)} />
            <NumberInput label="Outros Passivos" value={formData.liabilities.otherLiabilities} onChange={(value) => handleLiabilityChange('otherLiabilities', value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>

        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input-field"
          rows="4"
          placeholder="Ex: Informações sobre empréstimos, estoque, saldos bancários ou ajustes patrimoniais..."
        />
      </div>
    </div>

    <div className="hidden print:block p-10 text-gray-900">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">BEBIDAS & COMPANHIA</h1>
        <p className="text-sm mt-1">Balanço Patrimonial Gerencial</p>
        <p className="text-sm mt-1">
          Ano: {year} | Data de referência: {formData.referenceDate}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">
          Resumo Patrimonial
        </h2>
        <p>Total do Ativo: <strong>{formatCurrency(displayTotals.totalAssets)}</strong></p>
        <p>Total do Passivo: <strong>{formatCurrency(displayTotals.totalLiabilities)}</strong></p>
        <p>Patrimônio Líquido: <strong>{formatCurrency(displayTotals.equity)}</strong></p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">
          Indicadores Patrimoniais
        </h2>
        <p>Situação Patrimonial: <strong>{equityStatus}</strong></p>
        <p>Liquidez Patrimonial: <strong>{indicators.liquidity.toFixed(2)}</strong></p>
        <p>Endividamento: <strong>{indicators.debtRatio.toFixed(1)}%</strong></p>
        <p>Capital Próprio: <strong>{indicators.equityRatio.toFixed(1)}%</strong></p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">Ativo</h2>
        <p>Caixa: {formatCurrency(formData.assets.cash)}</p>
        <p>Banco: {formatCurrency(formData.assets.bank)}</p>
        <p>Estoque: {formatCurrency(formData.assets.inventory)}</p>
        <p>Contas a Receber: {formatCurrency(formData.assets.receivables)}</p>
        <p>Equipamentos / Imobilizado: {formatCurrency(formData.assets.equipment)}</p>
        <p>Outros Ativos: {formatCurrency(formData.assets.otherAssets)}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">Passivo</h2>
        <p>Empréstimos / Financiamentos: {formatCurrency(formData.liabilities.loans)}</p>
        <p>Fornecedores a Pagar: {formatCurrency(formData.liabilities.suppliers)}</p>
        <p>Impostos a Pagar: {formatCurrency(formData.liabilities.taxes)}</p>
        <p>Contas Fixas a Pagar: {formatCurrency(formData.liabilities.fixedBills)}</p>
        <p>Outros Passivos: {formatCurrency(formData.liabilities.otherLiabilities)}</p>
      </div>

      <div className="text-xs text-gray-500 border-t pt-4 mt-8 text-center">
        Documento gerado pelo Bebcom Financeiro — IA Bebcom
      </div>
    </div>
  </>
);
};

export default BalanceSheet;
