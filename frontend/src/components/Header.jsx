import React, { useState, useEffect } from 'react';
import { User, Calendar, Menu } from 'lucide-react';

const Header = ({ onMenuClick, isMobile }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Botão hamburger - apenas mobile */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{currentDate}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              {user.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 hidden sm:block">Administrador</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
