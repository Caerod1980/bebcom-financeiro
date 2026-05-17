import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import Entries from './pages/Entries';
import DreMonthly from './pages/DreMonthly';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Layout component para páginas autenticadas
const AuthenticatedLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => isMobile && setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop - FIXA, escondida em mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white z-20">
        <Sidebar isOpen={true} onClose={closeSidebar} isMobile={false} />
      </aside>

      {/* Sidebar para mobile (overlay) - já tratada no componente Sidebar, mas evitamos duplicação */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        isMobile={isMobile} 
      />

      {/* Conteúdo principal – desktop com margem esquerda igual à largura da sidebar */}
      <main className={`min-h-screen ${!isMobile ? 'lg:ml-64' : ''}`}>
        <Header onMenuClick={toggleSidebar} isMobile={isMobile} sidebarOpen={sidebarOpen} />
        <div className="w-full max-w-none p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
          },
          mobile: {
            duration: 2000,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/new-entry" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <NewEntry />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/entries" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Entries />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="/dre" element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <DreMonthly />
            </AuthenticatedLayout>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
