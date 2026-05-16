import React from 'react';
import { User, Calendar } from 'lucide-react';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">{currentDate}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
