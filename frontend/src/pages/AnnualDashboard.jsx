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
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { dreService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const AnnualDashboard = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAnnual();
  }, [year]);

  const loadAnnual = async () => {
    try {
      setLoading(true);

      const response = await dreService.getYearSummary(year);

      setData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dashboard anual');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        <p>Carregando...</p>
      </div>
    );
  }

  const bestMonth = [...data.months].sort(
    (a, b) => b.lucroLiquido - a.lucroLiquido
  )[0];

  const worstMonth = [...data.months].sort(
    (a, b) => a.lucroLiquido - b.lucroLiquido
  )[0];

  const chartData = data.months.map((m) => ({
    name: `${m.month}`,
    receita: m.receitaLiquida,
    lucro: m.lucroLiquido,
  }));

  const cards = [
    {
      title: 'Faturamento Anual',
      value: formatCurrency(data.totals.receitaAnual),
      icon: DollarSign,
    },
    {
      title: 'Lucro Anual',
      value: formatCurrency(data.totals.lucroAnual),
      icon: Wallet,
    },
    {
      title: 'Margem Média',
      value: `${data.totals.margemMedia}%`,
      icon: TrendingUp,
    },
    {
      title: 'Ano',
      value: year,
      icon: Calendar,
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Executivo Anual
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Visão estratégica anual da Bebidas & Companhia
          </p>
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>

                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </h3>
              </div>

              <div className="bg-amber-100 p-3 rounded-xl">
                <card.icon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Receita x Lucro
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="receita" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lucro" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Evolução do Lucro
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="lucro"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Melhor Mês
          </h2>

          <div className="text-3xl font-bold text-green-600">
            Mês {bestMonth.month}
          </div>

          <p className="text-gray-600 mt-2">
            Lucro: {formatCurrency(bestMonth.lucroLiquido)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Pior Mês
          </h2>

          <div className="text-3xl font-bold text-red-600">
            Mês {worstMonth.month}
          </div>

          <p className="text-gray-600 mt-2">
            Lucro: {formatCurrency(worstMonth.lucroLiquido)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnualDashboard;
