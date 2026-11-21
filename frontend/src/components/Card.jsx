import React from 'react';

const Card = ({ title, value, icon: Icon, color, percentage, inversePercentage = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 border border-gray-100 min-w-0 h-full">
      <div className="flex flex-col h-full">

        {/* Cabeçalho: título e ícone */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-xs md:text-sm text-gray-500 font-medium">
            {title}
          </p>

          <div className={`p-2 rounded-lg bg-${color}-100 flex-shrink-0`}>
            <Icon className={`w-4 h-4 text-${color}-600`} />
          </div>
        </div>

        {/* Valor financeiro */}
        <p className="text-base lg:text-lg xl:text-xl font-bold text-gray-900 whitespace-nowrap tracking-tight">
          {value}
        </p>

        {/* Comparação mensal */}
        <div className="mt-auto pt-3 min-h-[44px]">
          {percentage !== undefined && percentage !== null && (
            <p className={`text-xs leading-4 ${
              (inversePercentage
                ? parseFloat(percentage) <= 0
                : parseFloat(percentage) >= 0)
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {parseFloat(percentage) >= 0 ? '+' : ''}
              {percentage}% vs mês anterior
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Card;
