import React from 'react';

const Card = ({ title, value, icon: Icon, color, percentage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 break-words">
            {value}
          </p>
          {percentage !== undefined && percentage !== null && (
            <p className={`text-xs md:text-sm mt-1 md:mt-2 ${parseFloat(percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(percentage) >= 0 ? '+' : ''}{percentage}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-lg bg-${color}-100 flex-shrink-0 ml-2`}>
          <Icon className={`w-4 h-4 md:w-6 md:h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
