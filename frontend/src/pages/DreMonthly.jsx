import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Loader, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
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
    if (!confirm('Tem certeza que deseja fechar este mês? Esta ação será definitiva.')) return;

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

  const getDreRows = () => {
    if (!dre) return [];

    return [
      ['DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO', '', ''],
      ['Empresa', 'Bebidas & Companhia', ''],
      ['Período', `${months[selectedMonth - 1]} de ${selectedYear}`, ''],
      ['', '', ''],
      ['Descrição', 'Valor', '% Receita Líquida'],
      ['Receita Bruta', dre.receitaBruta, ''],
      ['(-) Deduções', dre.deducoes, ''],
      ['Receita Líquida', dre.receitaLiquida, '100%'],
      ['(-) CMV', dre.cmv, `${dre.percentuais?.cmvPercent || '0.00'}%`],
      ['Lucro Bruto', dre.lucroBruto, `${dre.percentuais?.margemBruta || '0.00'}%`],
      ['(-) Despesas Operacionais', dre.despesasOperacionais, `${dre.percentuais?.despesasOperacionaisPercent || '0.00'}%`],
      ['Resultado Operacional', dre.resultadoOperacional, `${dre.percentuais?.margemOperacional || '0.00'}%`],
      ['(-) Despesas Financeiras', dre.despesasFinanceiras, ''],
      ['Outras Receitas', dre.outrasReceitas, ''],
      ['Outras Despesas', dre.outrasDespesas, ''],
      ['Resultado Líquido do Período', dre.lucroLiquido, `${dre.percentuais?.margemLiquida || '0.00'}%`],
    ];
  };

  const handleExportExcel = () => {
    if (!dre) return;

    const worksheet = XLSX.utils.aoa_to_sheet(getDreRows());
    worksheet['!cols'] = [{ wch: 38 }, { wch: 18 }, { wch: 18 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DRE Mensal');

    XLSX.writeFile(
      workbook,
      `DRE_Bebidas_e_Companhia_${months[selectedMonth - 1]}_${selectedYear}.xlsx`
    );

    toast.success('Excel exportado com sucesso!');
  };

  const handleExportPDF = () => {
    if (!dre) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const emittedAt = new Date().toLocaleString('pt-BR');
    const period = `${months[selectedMonth - 1]} de ${selectedYear}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Bebidas & Companhia', 105, 18, { align: 'center' });

    doc.setFontSize(13);
    doc.text('Demonstração do Resultado do Exercício', 105, 27, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Período: ${period}`, 105, 34, { align: 'center' });
    doc.text(`Data de emissão: ${emittedAt}`, 105, 40, { align: 'center' });

    const tableBody = [
      ['Receita Bruta', formatCurrency(dre.receitaBruta), '-'],
      ['(-) Deduções', formatCurrency(dre.deducoes), '-'],
      ['Receita Líquida', formatCurrency(dre.receitaLiquida), '100.00%'],
      ['(-) CMV', formatCurrency(dre.cmv), `${dre.percentuais?.cmvPercent || '0.00'}%`],
      ['Lucro Bruto', formatCurrency(dre.lucroBruto), `${dre.percentuais?.margemBruta || '0.00'}%`],
      ['(-) Despesas Operacionais', formatCurrency(dre.despesasOperacionais), `${dre.percentuais?.despesasOperacionaisPercent || '0.00'}%`],
      ['Resultado Operacional', formatCurrency(dre.resultadoOperacional), `${dre.percentuais?.margemOperacional || '0.00'}%`],
      ['(-) Despesas Financeiras', formatCurrency(dre.despesasFinanceiras), '-'],
      ['Outras Receitas', formatCurrency(dre.outrasReceitas), '-'],
      ['Outras Despesas', formatCurrency(dre.outrasDespesas), '-'],
      ['Resultado Líquido do Período', formatCurrency(dre.lucroLiquido), `${dre.percentuais?.margemLiquida || '0.00'}%`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Descrição', 'Valor', '% Receita Líquida']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 95 },
        1: { cellWidth: 45, halign: 'right' },
        2: { cellWidth: 38, halign: 'right' },
      },
      didParseCell: (data) => {
        const label = data.row.raw?.[0];

        if (
          label === 'Receita Líquida' ||
          label === 'Lucro Bruto' ||
          label === 'Resultado Operacional' ||
          label === 'Resultado Líquido do Período'
        ) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [245, 245, 245];
        }

        if (label === 'Resultado Líquido do Período') {
          data.cell.styles.fillColor = [254, 243, 199];
        }
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (dre.closed) {
      doc.text('Status: Mês fechado oficialmente', 14, finalY);

      if (dre.auditHash) {
        doc.text('Hash de auditoria SHA256:', 14, finalY + 7);
        doc.setFontSize(7);
        doc.text(String(dre.auditHash), 14, finalY + 12, { maxWidth: 180 });
        doc.setFontSize(9);
      }

      if (dre.closedAt) {
        doc.text(
          `Fechado em: ${new Date(dre.closedAt).toLocaleString('pt-BR')}`,
          14,
          finalY + 20
        );
      }
    } else {
      doc.text('Status: Relatório preliminar — mês ainda não fechado', 14, finalY);
    }

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      'Documento gerado pelo Bebcom Financeiro — Bebidas & Companhia',
      105,
      287,
      { align: 'center' }
    );

    doc.save(`DRE_Oficial_Bebidas_e_Companhia_${period.replaceAll(' ', '_')}.pdf`);
    toast.success('PDF oficial gerado com sucesso!');
  };

  const Line = ({ label, value, percent, bold = false, highlight = false }) => (
    <div
      className={`
        flex justify-between gap-4 py-3 border-b border-gray-100
        ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}
        ${highlight ? 'bg-amber-50 px-4 rounded-lg border-none mt-3' : ''}
        print:bg-transparent print:px-0 print:rounded-none
      `}
    >
      <span>{label}</span>
      <div className="text-right whitespace-nowrap">
        <span>{formatCurrency(value || 0)}</span>
        {percent !== undefined && percent !== null && (
          <span className="ml-3 text-sm text-gray-500 print:text-gray-700">
            {percent}%
          </span>
        )}
      </div>
    </div>
  );

  const Section = ({ children }) => (
    <div className="mt-5 mb-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold print:bg-gray-200 print:rounded-none print:border print:border-gray-300">
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!dre) {
    return <p className="text-gray-500">Erro ao carregar DRE</p>;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 print:p-0">
      <div className="print:hidden mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demonstração de Resultados</h1>
            <p className="text-sm text-gray-600 mt-1">DRE mensal da Bebidas & Companhia</p>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field w-40"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input-field w-28"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm"
          >
            <FileText className="w-4 h-4" />
            PDF Oficial
          </button>

          {!dre.closed ? (
            <button
              onClick={handleCloseMonth}
              disabled={closing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              {closing ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Fechar Mês
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" />
              Mês Fechado
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none print:rounded-none print:w-full">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-6 text-center print:bg-white print:border-b print:border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 print:text-xl">
            Bebidas & Companhia
          </h2>
          <p className="text-gray-700 mt-1 font-medium">
            Demonstração do Resultado do Exercício
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Período: {months[selectedMonth - 1]} de {selectedYear}
          </p>
        </div>

        <div className="p-6 print:p-4">
          <Section>1. Receita</Section>
          <Line label="Receita Bruta" value={dre.receitaBruta} />
          <Line label="(-) Deduções" value={dre.deducoes} />
          <Line label="Receita Líquida" value={dre.receitaLiquida} percent="100.00" bold />

          <Section>2. Custos</Section>
          <Line label="(-) CMV" value={dre.cmv} percent={dre.percentuais?.cmvPercent || '0.00'} />
          <Line label="Lucro Bruto" value={dre.lucroBruto} percent={dre.percentuais?.margemBruta || '0.00'} bold />

          <Section>3. Despesas Operacionais</Section>
          <Line label="(-) Despesas Operacionais" value={dre.despesasOperacionais} percent={dre.percentuais?.despesasOperacionaisPercent || '0.00'} />
          <Line label="Resultado Operacional" value={dre.resultadoOperacional} percent={dre.percentuais?.margemOperacional || '0.00'} bold />

          <Section>4. Resultado Financeiro e Outros</Section>
          <Line label="(-) Despesas Financeiras" value={dre.despesasFinanceiras} />
          <Line label="Outras Receitas" value={dre.outrasReceitas} />
          <Line label="Outras Despesas" value={dre.outrasDespesas} />

          <Line
            label="Resultado Líquido do Período"
            value={dre.lucroLiquido}
            percent={dre.percentuais?.margemLiquida || '0.00'}
            bold
            highlight
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500 print:bg-white print:border-t print:border-gray-300">
          Relatório gerado pelo Bebcom Financeiro
        </div>
      </div>
    </div>
  );
};

export default DreMonthly;
