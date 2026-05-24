const ManagementReport = require('../models/ManagementReport');
const Entry = require('../models/Entry');

// ============================================
// CREATE OR UPDATE REPORT
// ============================================

// @desc    Save management report
// @route   POST /api/management-report
const saveManagementReport = async (req, res) => {
  try {
    const {
      year,
      month,
      netRevenue,
      totalTickets,
      notes,
    } = req.body;

    let report = await ManagementReport.findOne({
      year,
      month,
    });

    const averageTicket =
      totalTickets > 0
        ? netRevenue / totalTickets
        : 0;

    if (!report) {
      report = await ManagementReport.create({
        year,
        month,
        netRevenue,
        totalTickets,
        averageTicket,
        notes: notes || '',
        createdBy: req.user?._id,
      });
    } else {
      report.netRevenue = netRevenue;
      report.totalTickets = totalTickets;
      report.averageTicket = averageTicket;
      report.notes = notes || '';
      report.updatedBy = req.user?._id;

      await report.save();
    }

    return res.json({
      message: 'Relatório gerencial salvo com sucesso',
      report,
    });
  } catch (error) {
    console.error('Erro ao salvar relatório gerencial:', error);

    return res.status(500).json({
      error: 'Erro ao salvar relatório gerencial',
    });
  }
};

// ============================================
// GET MONTH REPORT
// ============================================

// @desc    Get management report
// @route   GET /api/management-report/:year/:month
const getManagementReport = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);

    const report = await ManagementReport.findOne({
      year,
      month,
    });

    return res.json({
      report,
    });
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);

    return res.status(500).json({
      error: 'Erro ao buscar relatório gerencial',
    });
  }
};

// ============================================
// GET ANNUAL ANALYTICS
// ============================================

// @desc    Get annual management analytics
// @route   GET /api/management-report/analytics/:year
const getAnnualAnalytics = async (req, res) => {
  try {
    const year = Number(req.params.year);

    const reports = await ManagementReport.find({
      year,
    }).sort({ month: 1 });

    const totalRevenue = reports.reduce(
      (acc, item) => acc + (item.netRevenue || 0),
      0
    );

    const totalTickets = reports.reduce(
      (acc, item) => acc + (item.totalTickets || 0),
      0
    );

    const averageAnnualTicket =
      totalTickets > 0
        ? totalRevenue / totalTickets
        : 0;

    // Melhor ticket médio
    const bestMonth =
      reports.length > 0
        ? reports.reduce((prev, current) =>
            prev.averageTicket >
            current.averageTicket
              ? prev
              : current
          )
        : null;

    // Pior ticket médio
    const worstMonth =
      reports.length > 0
        ? reports.reduce((prev, current) =>
            prev.averageTicket <
            current.averageTicket
              ? prev
              : current
          )
        : null;

    return res.json({
      reports,

      indicators: {
        totalRevenue,
        totalTickets,
        averageAnnualTicket,

        bestMonth: bestMonth
          ? {
              month: bestMonth.month,
              averageTicket:
                bestMonth.averageTicket,
            }
          : null,

        worstMonth: worstMonth
          ? {
              month: worstMonth.month,
              averageTicket:
                worstMonth.averageTicket,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Erro analytics gerencial:', error);

    return res.status(500).json({
      error: 'Erro ao gerar analytics',
    });
  }
};

// ============================================
// HISTORICAL COMPARISON
// ============================================

// @desc    Historical management comparison
// @route   GET /api/management-report/historical
const getHistoricalComparison = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

const currentYearReports = await ManagementReport.find({
  year: currentYear,
}).sort({ month: 1 });

const comparisonLimitMonth =
  currentYearReports.length > 0
    ? Math.max(...currentYearReports.map((item) => item.month))
    : new Date().getMonth() + 1;

const reports = await ManagementReport.find({
  month: { $lte: comparisonLimitMonth },
});

    const groupedByYear = {};

    reports.forEach((report) => {
      if (!groupedByYear[report.year]) {
        groupedByYear[report.year] = {
          totalRevenue: 0,
          totalTickets: 0,
        };
      }

      groupedByYear[report.year].totalRevenue +=
        report.netRevenue || 0;

      groupedByYear[report.year].totalTickets +=
        report.totalTickets || 0;
    });

    const years = Object.keys(groupedByYear)
      .map(Number)
      .sort((a, b) => a - b);

    const comparison = years.map((year, index) => {
      const current = groupedByYear[year];

      const averageTicket =
        current.totalTickets > 0
          ? current.totalRevenue / current.totalTickets
          : 0;

      const previousYear = years[index - 1];

      let revenueGrowth = 0;
      let ticketGrowth = 0;
      let ticketIncrease = 0;

      if (previousYear) {
        const previous = groupedByYear[previousYear];

        const previousAverageTicket =
          previous.totalTickets > 0
            ? previous.totalRevenue / previous.totalTickets
            : 0;

        if (previous.totalRevenue > 0) {
          revenueGrowth =
            (
              (current.totalRevenue - previous.totalRevenue) /
              previous.totalRevenue
            ) * 100;
        }

        if (previousAverageTicket > 0) {
          ticketGrowth =
            (
              (averageTicket - previousAverageTicket) /
              previousAverageTicket
            ) * 100;
        }

        ticketIncrease =
          averageTicket - previousAverageTicket;
      }

      return {
        year,

        totalRevenue: current.totalRevenue,

        averageTicket,

        revenueGrowth,

        ticketGrowth,

        ticketIncrease,
      };
    });

   return res.json({
  comparison,
  comparisonLimitMonth,
});
  } catch (error) {
    console.error(
      'Erro comparativo histórico:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao gerar comparativo histórico',
    });
  }
};

// ============================================
// MONTHLY COMPARISON
// ============================================

// @desc    Monthly comparison by year
// @route   GET /api/management-report/monthly-comparison/:year
const getMonthlyComparison = async (req, res) => {
  try {
    const currentYear = Number(req.params.year);

    const comparisonYears = [
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
    ];

    const currentReports = await ManagementReport.find({
      year: currentYear,
    });

    const previousReports = await ManagementReport.find({
      year: { $in: comparisonYears },
    });

    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const monthlyComparison = months.map((monthName, index) => {
      const monthNumber = index + 1;

      const currentMonth = currentReports.find(
        (item) => item.month === monthNumber
      );

      const currentRevenue =
        currentMonth?.netRevenue || 0;

      const comparisons = {};

      comparisonYears.forEach((year) => {
        const previousMonth = previousReports.find(
          (item) =>
            item.year === year &&
            item.month === monthNumber
        );

        const previousRevenue =
          previousMonth?.netRevenue || 0;

        let growth = 0;

        if (previousRevenue > 0) {
          growth =
            (
              (currentRevenue - previousRevenue) /
              previousRevenue
            ) * 100;
        }

        comparisons[year] = growth;
      });

      return {
        month: monthName,
        ...comparisons,
      };
    });

    // TOTAL CONSOLIDADO
    const currentTotal = currentReports.reduce(
      (acc, item) => acc + (item.netRevenue || 0),
      0
    );

    const totalRow = {
      month: 'TOTAL',
    };

    comparisonYears.forEach((year) => {
      const previousTotal = previousReports
        .filter((item) => item.year === year)
        .reduce(
          (acc, item) => acc + (item.netRevenue || 0),
          0
        );

      let growth = 0;

      if (previousTotal > 0) {
        growth =
          (
            (currentTotal - previousTotal) /
            previousTotal
          ) * 100;
      }

      totalRow[year] = growth;
    });

    monthlyComparison.push(totalRow);

    return res.json({
      currentYear,
      comparisonYears,
      monthlyComparison,
    });
  } catch (error) {
    console.error(
      'Erro comparativo mensal:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao gerar comparativo mensal',
    });
  }
};

// ============================================
// GROWTH CURVE
// ============================================

// @desc    Growth curve current year vs previous year
// @route   GET /api/management-report/growth-curve/:year
const getGrowthCurve = async (req, res) => {
  try {
    const currentYear = Number(req.params.year);
    const previousYear = currentYear - 1;
    // Buscar todos os relatórios históricos
const allReports = await ManagementReport.find({});

// Agrupar receita por ano
const revenueByYear = {};

allReports.forEach((report) => {
  if (!revenueByYear[report.year]) {
    revenueByYear[report.year] = 0;
  }

  revenueByYear[report.year] +=
    report.netRevenue || 0;
});

// Descobrir melhor ano
let bestYear = null;
let bestRevenue = 0;

Object.entries(revenueByYear).forEach(
  ([year, revenue]) => {
    if (revenue > bestRevenue) {
      bestRevenue = revenue;
      bestYear = Number(year);
    }
  }
);

    const currentReports = await ManagementReport.find({
      year: currentYear,
    });

    const previousReports = await ManagementReport.find({
      year: previousYear,
    });

    const bestYearReports = await ManagementReport.find({
  year: bestYear,
});

    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const growthCurve = months.map((monthName, index) => {
      const monthNumber = index + 1;

      const currentMonth = currentReports.find(
        (item) => item.month === monthNumber
      );

      const previousMonth = previousReports.find(
        (item) => item.month === monthNumber
      );
      const bestYearMonth = bestYearReports.find(
        (item) => item.month === monthNumber
      );

      const currentRevenue =
        currentMonth?.netRevenue || 0;

      const previousRevenue =
        previousMonth?.netRevenue || 0;

      const bestYearRevenue =
        bestYearMonth?.netRevenue || 0;

      let growthPercent = 0;

      if (previousRevenue > 0) {
        growthPercent =
          (
            (currentRevenue - previousRevenue) /
            previousRevenue
          ) * 100;
      }

     return {
  month: monthName,
  currentRevenue,
  previousRevenue,
  bestYearRevenue,
  growthPercent,
  bestYear,
};
    });

   return res.json({
  currentYear,
  previousYear,
  bestYear,
  bestRevenue,
  growthCurve,
});
  } catch (error) {
    console.error(
      'Erro curva de crescimento:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao gerar curva de crescimento',
    });
  }
};
module.exports = {
  saveManagementReport,
  getManagementReport,
  getAnnualAnalytics,
  getHistoricalComparison,
  getMonthlyComparison,
  getGrowthCurve,
};
