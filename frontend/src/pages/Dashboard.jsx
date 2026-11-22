import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ShoppingBag,
  Truck,
  Package,
  Loader
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Card from '../components/Card';
import { dreService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadDashboard();
  }, [selectedMonth, selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dreService.getDashboard(selectedMonth, selectedYear);
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const { current, topExpenses } = dashboardData;

  
  // EVOLUÇÃO DA RECEITA — Faturamento bruto semanal real
  const weeklyRevenue = dashboardData.weeklyRevenue || [];

  const lineChartData = {
    labels: weeklyRevenue.map(item => item.week),
    datasets: [
      {
        label: 'Receita Bruta',
        data: weeklyRevenue.map(item => item.total),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

    // DASHBOARD — EVOLUÇÃO DO FATURAMENTO DIÁRIO
    const dailyRevenue = dashboardData.dailyRevenue || [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dailyChartData = {
        labels: dailyRevenue.map(item =>
            String(item.day).padStart(2, '0')
        ),
        datasets: [
            {
                label: 'Receita Bruta Diária',

                data: dailyRevenue.map(item => {
                    const date = new Date(
                        selectedYear,
                        selectedMonth - 1,
                        item.day
                    );

                    return date > today ? null : Number(item.total || 0);
                }),

                backgroundColor: dailyRevenue.map(item => {
                    const dayOfWeek = new Date(
                        selectedYear,
                        selectedMonth - 1,
                        item.day
                    ).getDay();

                    if (dayOfWeek === 6) return '#3B82F6'; // Sábado
                    if (dayOfWeek === 0) return '#10B981'; // Domingo

                    return '#F59E0B'; // Segunda a sexta
                }),

                borderRadius: 3,
                maxBarThickness: 24
            }
        ]
    };

  // Doughnut chart data - Expense distribution
  const doughnutData = {
    labels: topExpenses.map(exp => exp._id.replace(/_/g, ' ').toUpperCase()),
    datasets: [
      {
        data: topExpenses.map(exp => exp.total),
        backgroundColor: [
          '#f59e0b',
          '#ef4444',
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
        ],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        }
      },
    },
    };

    // DASHBOARD — CONFIGURAÇÕES DO GRÁFICO DIÁRIO
    const dailyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    title: (items) => {
                        if (!items.length) return '';

                        const day = Number(items[0].label);

                        const date = new Date(
                            selectedYear,
                            selectedMonth - 1,
                            day
                        );

                        return date.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        });
                    },

                    label: (context) =>
                        `Faturamento: ${formatCurrency(context.parsed.y)}`
                }
            }
        },

        scales: {
            x: {
                grid: {
                    display: false
                },

                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 16,
                    maxRotation: 0
                }
            },

            y: {
                beginAtZero: true,

                ticks: {
                    callback: (value) =>
                        new Intl.NumberFormat('pt-BR', {
                            notation: 'compact',
                            maximumFractionDigits: 1
                        }).format(value)
                }
            }
        }
    };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        }
      },
    },
  };

  return (
    <div className="p-3 sm:p-4 md:py-6 md:pr-6 md:pl-4 lg:pl-6">
      {/* Month Selector - Responsivo */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field w-32 sm:w-40 text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field w-24 text-sm"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
   {/* Cards - Grid Responsivo */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
  {/* Novo card — Receita Bruta */}
  <Card
    title="Receita Bruta"
    value={
      current.receitaBruta != null
        ? formatCurrency(current.receitaBruta)
        : "Não disponível"
    }
    icon={ShoppingBag}
    color="blue"
    percentage={dashboardData.comparison?.grossRevenueVariation}
  />

  <Card
    title="Receita Líquida"
    value={formatCurrency(current.receitaLiquida)}
    icon={TrendingUp}
    color="green"
    percentage={dashboardData.comparison?.revenueVariation}
  />
        <Card
          title="Lucro Bruto"
          value={formatCurrency(current.lucroBruto)}
          icon={DollarSign}
          color="amber"
          percentage={dashboardData.comparison?.grossProfitVariation}
        />
       <Card
          title="Despesas"
          value={formatCurrency(current.totalDespesas || 0)}
          icon={CreditCard}
          color="red"
          percentage={dashboardData.comparison?.expensesVariation}
          inversePercentage={true}
        />
        <Card
          title="Lucro Líquido"
          value={formatCurrency(current.lucroLiquido)}
          icon={TrendingUp}
          color={current.lucroLiquido >= 0 ? "green" : "red"}
          percentage={dashboardData.comparison?.profitVariation}
        />
      </div>
      
      {/* Charts - Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                      Evolução do Faturamento Diário
                  </h3>

                  <div className="h-72 md:h-80">
                      <Bar data={dailyChartData} options={dailyChartOptions} />
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-600">
                      <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                          Segunda a sexta
                      </span>

                      <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                          Sábados
                      </span>

                      <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                          Domingos
                      </span>
                  </div>
              </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Top Despesas</h3>
          {topExpenses && topExpenses.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma despesa no período</p>
          )}
        </div>
      </div>
      
      {/* Key Metrics - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Package className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            <h3 className="font-semibold text-sm md:text-base">Margem Bruta</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold">{current.percentuais?.margemBruta || 0}%</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
            CMV: {current.percentuais?.cmvPercent || 0}% da receita
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <h3 className="font-semibold text-sm md:text-base">Margem Operacional</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold">{current.percentuais?.margemOperacional || 0}%</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
            Despesas: {current.percentuais?.despesasPercent || 0}% da receita
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Truck className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <h3 className="font-semibold text-sm md:text-base">Margem Líquida</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold">{current.percentuais?.margemLiquida || 0}%</p>
          <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
            Resultado final do período
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
