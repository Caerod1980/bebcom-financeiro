// Mantenha os imports existentes...

const Dashboard = () => {
  // ... código existente ...

  return (
    <div>
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
          <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Top Despesas</h3>
          {topExpenses.length > 0 ? (
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
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
