import React, { useState, useEffect } from 'react';
import { Calendar, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, isMobile, sidebarOpen }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentDate, setCurrentDate] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={`
      bg-white border-b border-gray-200 px-4 py-3 z-10
      ${isMobile ? 'fixed top-0 right-0 left-0' : 'relative w-full'}
    `}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Botão hamburger - apenas mobile */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {/* Logo mobile */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-600 text-lg">Bebcom</span>
              <span className="text-gray-400 text-sm">Financeiro</span>
            </div>
          )}
          
          {/* Data - esconder em mobile muito pequeno */}
          <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        
        {/* Menu do usuário */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">
                {user.name?.split(' ')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-amber-600" />
            </div>
          </button>
          
          {/* Dropdown menu do usuário */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-20"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-30">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
