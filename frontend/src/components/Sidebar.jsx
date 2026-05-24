import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  FileText,
  BarChart3,
  ChartNoAxesCombined,
  Scale,
  Receipt,
  LogOut,
  Beer,
  X,
  Boxes,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = `${import.meta.env.BASE_URL}#/login`;
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/new-entry', icon: PlusCircle, label: 'Novo Lançamento' },
    { path: '/entries', icon: List, label: 'Lançamentos' },
    { path: '/accounts', icon: Receipt, label: 'Contas' },
    { path: '/dre', icon: FileText, label: 'DRE Mensal' },
    { path: '/annual-dashboard', icon: BarChart3, label: 'Dashboard Anual' },
    { path: '/balance-sheet', icon: Scale, label: 'Balanço Patrimonial' },
    { path: '/inventory', icon: Boxes, label: 'Estoque' },
    { path: '/management-report', icon: ChartNoAxesCombined, label: 'Relatório Gerencial' },
  ];

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Beer className="w-8 h-8 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold">Bebcom</h1>
              <p className="text-xs text-gray-400">Financeiro</p>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              aria-label="Fechar menu"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition duration-200 ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 transition duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  if (!isMobile) {
    return (
      <div className="flex flex-col h-full w-full">
        <SidebarContent />
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-white z-40
          transition-transform duration-300 ease-in-out w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
