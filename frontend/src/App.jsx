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
      // Em desktop, sidebar sempre visível
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - controlada por estado */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={toggleSidebar} 
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
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
