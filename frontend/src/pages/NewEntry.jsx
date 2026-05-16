import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EntryForm from '../components/EntryForm';
import { entryService } from '../services/api';

const NewEntry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      await entryService.create(data);
      toast.success('Lançamento salvo com sucesso!');
      navigate('/entries');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar lançamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/entries');
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Novo Lançamento</h1>
              <p className="text-gray-600 mt-1">Registre uma entrada ou saída financeira</p>
            </div>
            
            <EntryForm onSubmit={handleSubmit} onClose={handleClose} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewEntry;
