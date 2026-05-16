import React from 'react';

const Card = ({ title, value, icon: Icon, color, percentage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {percentage && (
            <p className={`text-sm mt-2 ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentage >= 0 ? '+' : ''}{percentage}% vs mês anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
