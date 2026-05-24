import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  Save,
  Loader,
  TrendingUp,
  Receipt,
  Wallet,
  Calendar,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { managementReportService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const ManagementReport = () => {
  const currentDate = new Date();

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    netRevenue: '',
    totalTickets: '',
    notes: '',
  });

  const [analytics, setAnalytics] = useState({
    reports: [],
    indicators: {},
  });

  const [historicalComparison, setHistoricalComparison] = useState([]);

  const monthsNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
  reportResponse,
  analyticsResponse,
  historicalResponse,
] = await Promise.all([
        managementReportService.getReport(year, month),
        managementReportService.getAnnualAnalytics(year),
        managementReportService.getHistoricalComparison(),
      ]);

      const report = reportResponse.data.report;

      setFormData({
        netRevenue: report?.netRevenue || '',
        totalTickets: report?.totalTickets || '',
        notes: report?.notes || '',
      });

      setAnalytics(analyticsResponse.data || {
        reports: [],
        indicators: {},
      });

      setHistoricalComparison(
  historicalResponse.data?.comparison || []
);
    } catch (error) {
      toast.error('Erro ao carregar relatório gerencial');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toNumber = (value) => {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
  };

  const averageTicket =
    toNumber(formData.totalTickets) > 0
      ? toNumber(formData.netRevenue) / toNumber(formData.totalTickets)
      : 0;

  const handleSave = async () => {
    try {
      setSaving(true);

      await managementReportService.saveReport({
        year,
        month,
        netRevenue: toNumber(formData.netRevenue),
        totalTickets: toNumber(formData.totalTickets),
        notes: formData.notes,
      });

      toast.success('Relatório gerencial salvo com sucesso!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar relatório');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const chartData = Array.from({ length: 12 }, (_, index) => {
    const found = analytics.reports?.find((item) => item.month === index + 1);

    return {
      month: monthsNames[index],
      receita: found?.netRevenue || 0,
      comandas: found?.totalTickets || 0,
      ticket: found?.averageTicket || 0,
    };
  });

  const SummaryCard = ({ title, value, icon: Icon, tone = 'amber', isCurrency = true }) => {
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
              {isCurrency ? formatCurrency(value || 0) : value || 0}
            </h3>
          </div>

          <div className={`${colors[tone]} p-3 rounded-xl`}>
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
          Carregando relatório gerencial...
        </div>
      </div>
    );
  }

  const indicators = analytics.indicators || {};
  const getMonthName = (monthNumber) => {
  if (!monthNumber) return '-';

  const fullMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return fullMonths[monthNumber - 1] || '-';
};

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Relatório Gerencial
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Indicadores operacionais, ticket médio e evolução anual
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input-field"
          >
            {[
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
            ].map((monthName, index) => (
              <option key={monthName} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="input-field"
          >
            {[2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yearValue) => (
              <option key={yearValue} value={yearValue}>
                {yearValue}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Ticket Médio"
          value={averageTicket}
          icon={Receipt}
          tone="amber"
        />

        <SummaryCard
          title="Receita Líquida"
          value={toNumber(formData.netRevenue)}
          icon={Wallet}
          tone="green"
        />

        <SummaryCard
          title="Total de Comandas"
          value={toNumber(formData.totalTickets)}
          icon={Calendar}
          tone="blue"
          isCurrency={false}
        />

        <SummaryCard
          title="Ticket Médio Anual"
          value={indicators.averageAnnualTicket || 0}
          icon={TrendingUp}
          tone="red"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lançamento Mensal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receita Líquida
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.netRevenue}
              onChange={(e) =>
                setFormData({ ...formData, netRevenue: e.target.value })
              }
              className="input-field"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total de Comandas
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.totalTickets}
              onChange={(e) =>
                setFormData({ ...formData, totalTickets: e.target.value })
              }
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Médio Calculado
            </label>
            <div className="input-field bg-gray-50 flex items-center font-bold text-gray-900">
              {formatCurrency(averageTicket)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="input-field"
            rows="3"
            placeholder="Observações sobre movimento, sazonalidade, eventos, campanhas ou comportamento do mês..."
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">
            Evolução do Ticket Médio
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="ticket"
                name="Ticket Médio"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">
            Receita Líquida x Comandas
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="receita" name="Receita Líquida" radius={[8, 8, 0, 0]} />
              <Bar dataKey="comandas" name="Comandas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Receita Anual"
          value={indicators.totalRevenue || 0}
          icon={Wallet}
          tone="green"
        />

        <SummaryCard
          title="Comandas no Ano"
          value={indicators.totalTickets || 0}
          icon={Receipt}
          tone="blue"
          isCurrency={false}
        />

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Melhor Ticket</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(indicators.bestMonth?.averageTicket || 0)}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Mês: {getMonthName(indicators.bestMonth?.month)}
              </p>
            </div>

            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pior Ticket</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(indicators.worstMonth?.averageTicket || 0)}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Mês: {getMonthName(indicators.worstMonth?.month)}
              </p>
            </div>

            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comparativo Histórico
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Ano</th>
                <th className="px-4 py-3 text-left">Receita Líquida</th>
                <th className="px-4 py-3 text-left">% Receita</th>
                <th className="px-4 py-3 text-left">Ticket Médio</th>
                <th className="px-4 py-3 text-left">% Ticket</th>
                <th className="px-4 py-3 text-left">Acréscimo Ticket</th>
              </tr>
            </thead>

            <tbody>
              {historicalComparison.map((item) => (
                <tr key={item.year} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">
                    {item.year}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(item.totalRevenue || 0)}
                  </td>

                  <td className="px-4 py-3">
                    {item.revenueGrowth?.toFixed(1) || 0}%
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(item.averageTicket || 0)}
                  </td>

                  <td className="px-4 py-3">
                    {item.ticketGrowth?.toFixed(1) || 0}%
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(item.ticketIncrease || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagementReport;
