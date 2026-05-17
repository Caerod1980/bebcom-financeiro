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
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

  // Line chart data - Revenue trend (simulated for now)
  const lineChartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Receita',
        data: [
          current.receitaLiquida * 0.2, 
          current.receitaLiquida * 0.3, 
          current.receitaLiquida * 0.25, 
          current.receitaLiquida * 0.25
        ],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
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
    <div className="p-3 sm:p-4 md:p-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
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
          percentage={current.percentuais?.margemBruta}
        />
        <Card
          title="Despesas"
          value={formatCurrency(current.despesasOperacionais)}
          icon={CreditCard}
          color="red"
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
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Evolução da Receita</h3>
          <Line data={lineChartData} options={lineOptions} />
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
