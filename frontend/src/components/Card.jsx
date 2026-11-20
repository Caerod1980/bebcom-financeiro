import React from 'react';

const Card = ({ title, value, icon: Icon, color, percentage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-5 border border-gray-100 min-w-0">
    <div className="flex flex-col gap-3">
    <div className="min-w-0">
          <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-lg md:text-xl xl:text-2xl font-bold text-gray-900 break-words">
            {value}
          </p>
          {percentage !== undefined && percentage !== null && (
            <p className={`text-xs md:text-sm mt-1 md:mt-2 ${parseFloat(percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(percentage) >= 0 ? '+' : ''}{percentage}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`self-end p-2 rounded-lg bg-${color}-100`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
