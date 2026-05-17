import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Printer, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { dreService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const DreMonthly = () => {
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [dre, setDre] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadDRE();
  }, [selectedMonth, selectedYear]);

  const loadDRE = async () => {
    try {
      setLoading(true);
      const response = await dreService.getMonthly(selectedMonth, selectedYear);
      setDre(response.data);
    } catch (error) {
      toast.error('Erro ao carregar DRE');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMonth = async () => {
    if (!confirm('Tem certeza que deseja fechar este mês? Após fechado, você não poderá mais editar lançamentos deste período.')) {
      return;
    }
    
    try {
      setClosing(true);
      await dreService.closeMonth(selectedMonth, selectedYear);
      toast.success('Mês fechado com sucesso!');
      loadDRE();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fechar mês');
    } finally {
      setClosing(false);
    }
  };

  const handleExportExcel = () => {
    toast.success('Exportação em Excel disponível em breve!');
  };

  const handlePrint = () => {
    window.print();
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

  if (!dre) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Erro ao carregar DRE</p>
        </div>
      </div>
    );
  }

  const DRELine = ({ label, value, percent, isBold = false, isNegative = false }) => (
    <div className={`flex justify-between items-center py-2 sm:py-3 ${isBold ? 'border-t-2 border-gray-300 font-bold' : 'border-b border-gray-100'}`}>
      <span className={`${isBold ? 'text-gray-900 font-semibold' : 'text-gray-600'} text-sm sm:text-base`}>
        {label}
      </span>
      <div className="text-right">
        <span className={`${isBold ? 'font-bold text-gray-900' : 'text-gray-700'} text-sm sm:text-base`}>
          {formatCurrency(value)}
        </span>
        {percent && (
          <span className={`ml-2 sm:ml-3 text-xs sm:text-sm ${parseFloat(percent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({percent}%)
          </span>
        )}
      </div>
    </div>
  );

  const DREHeader = ({ children }) => (
    <div className="bg-gray-100 px-4 sm:px-6 py-2 sm:py-3">
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{children}</h3>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header Responsivo */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Demonstração de Resultados</h1>
            <p className="text-sm text-gray-600 mt-1">DRE completo do período</p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field w-32 sm:w-40 text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field w-24 text-sm"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Action Buttons - Responsivo */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 md:mb-6">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Exportar</span>
          <span className="xs:hidden">Excel</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm"
        >
          <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Imprimir</span>
          <span className="xs:hidden">PDF</span>
        </button>
        {!dre.closed && (
          <button
            onClick={handleCloseMonth}
            disabled={closing}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs sm:text-sm"
          >
            {closing ? (
              <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline">Fechar Mês</span>
            <span className="xs:hidden">Fechar</span>
          </button>
        )}
        {dre.closed && (
          <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Mês Fechado</span>
            <span className="xs:hidden">Fechado</span>
          </div>
        )}
      </div>
      
      {/* DRE Content - Responsivo */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 print:bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-center">Bebidas & Companhia</h2>
          <p className="text-sm text-center text-gray-600">
            Demonstração de Resultados - {months[selectedMonth - 1]} de {selectedYear}
          </p>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* RECEITA BRUTA */}
          <DREHeader>1. RECEITA BRUTA</DREHeader>
          <DRELine 
            label="Vendas e Serviços" 
            value={dre.receitaBruta} 
          />
          <DRELine 
            label="(-) Deduções" 
            value={dre.deducoes} 
            isNegative 
          />
          <DRELine 
            label="RECEITA LÍQUIDA" 
            value={dre.receitaLiquida} 
            percent={100}
            isBold 
          />
          
          <div className="h-3 sm:h-4"></div>
          
          {/* CUSTOS */}
          <DREHeader>2. CUSTOS OPERACIONAIS</DREHeader>
          <DRELine 
            label="(-) CMV" 
            value={dre.cmv} 
            percent={dre.percentuais?.cmvPercent}
          />
          <DRELine 
            label="LUCRO BRUTO" 
            value={dre.lucroBruto} 
            percent={dre.percentuais?.margemBruta}
            isBold 
          />
          
          <div className="h-3 sm:h-4"></div>
          
          {/* DESPESAS */}
          <DREHeader>3. DESPESAS OPERACIONAIS</DREHeader>
          <DRELine 
            label="Despesas Operacionais" 
            value={dre.despesasOperacionais}
            percent={dre.percentuais?.despesasPercent}
          />
          <DRELine 
            label="RESULTADO OPERACIONAL (EBIT)" 
            value={dre.resultadoOperacional}
            percent={dre.percentuais?.margemOperacional}
            isBold 
          />
          
          <div className="h-3 sm:h-4"></div>
          
          {/* RESULTADO FINANCEIRO */}
          <DREHeader>4. RESULTADO FINANCEIRO</DREHeader>
          <DRELine 
            label="Despesas Financeiras" 
            value={dre.despesasFinanceiras}
          />
          <DRELine 
            label="Outras Receitas" 
            value={dre.outrasReceitas}
          />
          <DRELine 
            label="Outras Despesas" 
            value={dre.outrasDespesas}
          />
          
          <div className="h-3 sm:h-4"></div>
          
          {/* RESULTADO LÍQUIDO */}
          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
            <DRELine 
              label="RESULTADO LÍQUIDO DO PERÍODO" 
              value={dre.lucroLiquido}
              percent={dre.percentuais?.margemLiquida}
              isBold 
            />
          </div>
        </div>
        
        {/* Footer - Responsivo */}
        <div className="p-4 sm:p-6 border-t bg-gray-50 text-xs sm:text-sm text-gray-500 text-center print:hidden">
          <p>Relatório gerado pelo Bebcom Financeiro - Bebidas & Companhia</p>
          <p className="text-[10px] sm:text-xs mt-1">* CMV calculado com base no markup padrão de 35% sobre vendas</p>
        </div>
      </div>
    </div>
  );
};

export default DreMonthly;
