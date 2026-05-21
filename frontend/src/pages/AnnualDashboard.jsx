import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

import {
  TrendingUp,
  DollarSign,
  Wallet,
  Calendar,
  CreditCard,
  Package,
  FileText,
  Download,
} from 'lucide-react';

import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dreService } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const AnnualDashboard = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const monthsNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];

  useEffect(() => {
    loadAnnual();
  }, [year]);

  const loadAnnual = async () => {
    try {
      setLoading(true);
      const response = await dreService.getYearSummary(year);
      setData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dashboard anual');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value) => `${value || '0.00'}%`;

  const getCategoryLabel = (category) => {
    const labels = {
      compras_mercadorias: 'Compras de Mercadorias',
      funcionarios: 'Funcionários',
      motoboy: 'Motoboy',
      aluguel: 'Aluguel',
      energia: 'Energia',
      agua: 'Água',
      internet: 'Internet',
      sistema: 'Sistema',
      contador: 'Contador',
      marketing: 'Marketing',
      taxas_cartao: 'Taxas de Cartão',
      taxas_mercado_pago: 'Taxas Mercado Pago',
      taxas_ifood: 'Taxas iFood',
      emprestimos: 'Empréstimos',
      impostos: 'Impostos',
      manutencao: 'Manutenção',
      embalagens: 'Embalagens',
      outras_despesas: 'Outras Despesas',
    };

    return labels[category] || category || 'Não informado';
  };

  const getCostCenterLabel = (center) => {
    const labels = {
      operacao_loja: 'Operação Loja',
      delivery: 'Delivery',
      ifood: 'iFood',
      lounge: 'Lounge',
      marketing: 'Marketing',
      administrativo: 'Administrativo',
      estrutura: 'Estrutura',
      impostos: 'Impostos',
      financeiro: 'Financeiro',
      estoque: 'Estoque',
      outros: 'Outros',
    };

    return labels[center] || center || 'Não informado';
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Carregando dashboard anual...</p>
      </div>
    );
  }

  const annual = data.annualDRE || {};
  const percentuais = data.percentuais || {};
  const months = data.months || [];

  const monthsWithEntries = months.filter((m) => m.hasEntries);

  const bestMonth = monthsWithEntries.length
    ? [...monthsWithEntries].sort((a, b) => b.lucroLiquido - a.lucroLiquido)[0]
    : null;

  const worstMonth = monthsWithEntries.length
    ? [...monthsWithEntries].sort((a, b) => a.lucroLiquido - b.lucroLiquido)[0]
    : null;

  const chartData = months.map((m) => ({
    name: monthsNames[m.month - 1],
    receita: m.receitaLiquida,
    lucro: m.lucroLiquido,
    despesas: m.totalDespesas,
  }));

  const categoryData = (data.expensesByCategory || []).map((item) => ({
    name: getCategoryLabel(item._id),
    value: item.total,
  }));

  const costCenterData = (data.expensesByCostCenter || []).map((item) => ({
    name: getCostCenterLabel(item._id),
    value: item.total,
  }));

  const handleExportAnnualPDF = () => {
    if (!data || !annual) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const emittedAt = new Date().toLocaleString('pt-BR');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Bebidas & Companhia', 105, 18, { align: 'center' });

    doc.setFontSize(13);
    doc.text('DRE Consolidada Anual', 105, 27, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Exercício: ${year}`, 105, 34, { align: 'center' });
    doc.text(`Data de emissão: ${emittedAt}`, 105, 40, { align: 'center' });

    const tableBody = [
      ['Receita Bruta', formatCurrency(annual.receitaBruta), '-'],
      ['(-) Deduções', formatCurrency(annual.deducoes), '-'],
      ['Receita Líquida', formatCurrency(annual.receitaLiquida), '100.00%'],
      ['(-) CMV', formatCurrency(annual.cmv), `${percentuais.cmvPercent || '0.00'}%`],
      ['Lucro Bruto', formatCurrency(annual.lucroBruto), `${percentuais.margemBruta || '0.00'}%`],
      ['(-) Despesas Operacionais', formatCurrency(annual.despesasOperacionais), `${percentuais.despesasOperacionaisPercent || '0.00'}%`],
      ['Resultado Operacional', formatCurrency(annual.resultadoOperacional), `${percentuais.margemOperacional || '0.00'}%`],
      ['(-) Despesas Financeiras', formatCurrency(annual.despesasFinanceiras), '-'],
      ['Outras Receitas', formatCurrency(annual.outrasReceitas), '-'],
      ['Outras Despesas', formatCurrency(annual.outrasDespesas), '-'],
      ['Resultado Líquido do Exercício', formatCurrency(annual.lucroLiquido), `${percentuais.margemLiquida || '0.00'}%`],
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
      didParseCell: (cellData) => {
        const label = cellData.row.raw?.[0];

        if (
          label === 'Receita Líquida' ||
          label === 'Lucro Bruto' ||
          label === 'Resultado Operacional' ||
          label === 'Resultado Líquido do Exercício'
        ) {
          cellData.cell.styles.fontStyle = 'bold';
          cellData.cell.styles.fillColor = [245, 245, 245];
        }

        if (label === 'Resultado Líquido do Exercício') {
          cellData.cell.styles.fillColor = [254, 243, 199];
        }
      },
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Resumo Patrimonial Preparatório', 14, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Empréstimos pagos no exercício: ${formatCurrency(data.patrimonialPreview?.emprestimosPagosNoAno || 0)}`,
      14,
      finalY + 7
    );

    doc.text(
      'Valor separado para futura composição de passivo/amortização no Balanço Patrimonial.',
      14,
      finalY + 13,
      { maxWidth: 180 }
    );

    finalY += 32;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Assinatura Contábil / Responsável', 14, finalY);

    doc.setDrawColor(180);
    doc.line(14, finalY + 18, 90, finalY + 18);
    doc.line(120, finalY + 18, 196, finalY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Responsável pela Empresa', 14, finalY + 24);
    doc.text('Responsável Contábil', 120, finalY + 24);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      'Documento gerado pelo Bebcom Financeiro — DRE Consolidada Anual',
      105,
      287,
      { align: 'center' }
    );

    doc.save(`DRE_Anual_Oficial_Bebidas_e_Companhia_${year}.pdf`);
    toast.success('PDF anual oficial gerado com sucesso!');
  };

  const cards = [
    {
      title: 'Receita Líquida Anual',
      value: formatCurrency(annual.receitaLiquida || 0),
      icon: DollarSign,
    },
    {
      title: 'Lucro Líquido Anual',
      value: formatCurrency(annual.lucroLiquido || 0),
      icon: Wallet,
    },
    {
      title: 'Margem Líquida',
      value: formatPercent(percentuais.margemLiquida),
      icon: TrendingUp,
    },
    {
      title: 'Total de Despesas',
      value: formatCurrency(annual.totalDespesas || 0),
      icon: CreditCard,
    },
    {
      title: 'CMV Anual',
      value: formatCurrency(annual.cmv || 0),
      icon: Package,
    },
    {
      title: 'Empréstimos no Ano',
      value: formatCurrency(annual.emprestimos || 0),
      icon: FileText,
    },
  ];

  const DreLine = ({ label, value, percent, bold = false, highlight = false }) => (
    <div
      className={`
        flex justify-between gap-4 py-3 border-b border-gray-100
        ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}
        ${highlight ? 'bg-amber-50 px-4 rounded-lg border-none mt-3' : ''}
      `}
    >
      <span>{label}</span>

      <div className="text-right whitespace-nowrap">
        <span>{formatCurrency(value || 0)}</span>

        {percent !== undefined && percent !== null && (
          <span className="ml-3 text-sm text-gray-500">
            {percent}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Executivo Anual
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            DRE consolidada anual da Bebidas & Companhia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-40"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportAnnualPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-sm"
          >
            <Download className="w-4 h-4" />
            PDF Anual Oficial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>

                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </h3>
              </div>

              <div className="bg-amber-100 p-3 rounded-xl">
                <card.icon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Receita x Lucro x Despesas
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="receita" name="Receita" radius={[8, 8, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Evolução do Lucro Líquido
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="lucro" name="Lucro" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Despesas por Categoria
          </h2>

          {categoryData.length === 0 ? (
            <p className="text-gray-500">Sem despesas no ano selecionado.</p>
          ) : (
           <ResponsiveContainer width="100%" height={320}>
  <BarChart
    data={categoryData}
    layout="vertical"
    margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      type="number"
      tickFormatter={(value) => formatCurrency(value)}
    />

    <YAxis
      dataKey="name"
      type="category"
      width={140}
    />

    <Tooltip formatter={(value) => formatCurrency(value)} />

    <Bar
      dataKey="value"
      radius={[0, 8, 8, 0]}
    />
  </BarChart>
</ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Despesas por Centro de Custo
          </h2>

          {costCenterData.length === 0 ? (
            <p className="text-gray-500">Sem despesas no ano selecionado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
  <BarChart
    data={costCenterData}
    layout="vertical"
    margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      type="number"
      tickFormatter={(value) => formatCurrency(value)}
    />

    <YAxis
      dataKey="name"
      type="category"
      width={140}
    />

    <Tooltip formatter={(value) => formatCurrency(value)} />

    <Bar
      dataKey="value"
      radius={[0, 8, 8, 0]}
    />
  </BarChart>
</ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Melhor Mês
          </h2>

          {bestMonth ? (
            <>
              <div className="text-3xl font-bold text-green-600">
                {monthsNames[bestMonth.month - 1]}
              </div>

              <p className="text-gray-600 mt-2">
                Lucro: {formatCurrency(bestMonth.lucroLiquido)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Ainda não há dados lançados.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">
            Pior Mês
          </h2>

          {worstMonth ? (
            <>
              <div className="text-3xl font-bold text-red-600">
                {monthsNames[worstMonth.month - 1]}
              </div>

              <p className="text-gray-600 mt-2">
                Lucro: {formatCurrency(worstMonth.lucroLiquido)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Ainda não há dados lançados.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">
            DRE Consolidada Anual
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Exercício de {year}
          </p>
        </div>

        <div className="p-6">
          <DreLine label="Receita Bruta" value={annual.receitaBruta} />
          <DreLine label="(-) Deduções" value={annual.deducoes} />
          <DreLine label="Receita Líquida" value={annual.receitaLiquida} percent="100.00" bold />

          <DreLine label="(-) CMV" value={annual.cmv} percent={percentuais.cmvPercent || '0.00'} />
          <DreLine label="Lucro Bruto" value={annual.lucroBruto} percent={percentuais.margemBruta || '0.00'} bold />

          <DreLine
            label="(-) Despesas Operacionais"
            value={annual.despesasOperacionais}
            percent={percentuais.despesasOperacionaisPercent || '0.00'}
          />

          <DreLine
            label="Resultado Operacional"
            value={annual.resultadoOperacional}
            percent={percentuais.margemOperacional || '0.00'}
            bold
          />

          <DreLine label="(-) Despesas Financeiras" value={annual.despesasFinanceiras} />
          <DreLine label="Outras Receitas" value={annual.outrasReceitas} />
          <DreLine label="Outras Despesas" value={annual.outrasDespesas} />

          <DreLine
            label="Resultado Líquido do Exercício"
            value={annual.lucroLiquido}
            percent={percentuais.margemLiquida || '0.00'}
            bold
            highlight
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-2">
          Prévia Patrimonial
        </h2>

        <p className="text-sm text-gray-600">
          Empréstimos pagos no ano identificados pela categoria{' '}
          <strong>Empréstimos</strong>:
        </p>

        <p className="text-2xl font-bold text-gray-900 mt-3">
          {formatCurrency(data.patrimonialPreview?.emprestimosPagosNoAno || 0)}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Este valor ficará separado para futura composição do Balanço Patrimonial.
        </p>
      </div>
    </div>
  );
};

export default AnnualDashboard;
