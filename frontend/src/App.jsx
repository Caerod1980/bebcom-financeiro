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
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header onMenuClick={toggleSidebar} isMobile={isMobile} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
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
