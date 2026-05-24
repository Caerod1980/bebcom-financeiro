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

module.exports = {
  saveManagementReport,
  getManagementReport,
  getAnnualAnalytics,
};
