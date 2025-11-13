import React, { useState, useEffect } from 'react';
import InvestmentSummary from './InvestmentSummary';
import PortfolioCard from './PortfolioCard';
import ContributionForm from './ContributionForm';
import ContributionHistory from './ContributionHistory';
import ProjectionChart from './ProjectionChart';
import ImportBackup from './ImportBackup';
import Modal from './Modal';
import './InvestmentDashboard.css';

const InvestmentDashboard = ({ investmentService, exportService }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      // Inicializar portafolios si no existen
      await investmentService.initializePortfolios();

      // Cargar datos
      const portfolioData = await investmentService.db.getAllPortfolios();
      const summaryData = await investmentService.getOverallSummary();
      const alertsData = await investmentService.checkAlerts();

      setPortfolios(portfolioData);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error cargando datos de inversión:', error);
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleAddContribution = async (portfolioId, amount, assets) => {
    try {
      await investmentService.addContribution(portfolioId, amount, assets || []);
      await loadData();
      setShowContributionForm(false);
      showModal('¡Éxito!', 'Aporte agregado correctamente', 'success');
      setHistoryRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Error agregando aporte:', error);
      showModal('Error', 'No se pudo agregar el aporte. Intenta nuevamente.', 'error');
    }
  };

  const handleDistributeContribution = async (totalAmount) => {
    try {
      const distributions = await investmentService.distributeMonthlyContribution(totalAmount);

      for (const dist of distributions) {
        await investmentService.addContribution(dist.portfolioId, dist.amount, dist.assets);
      }

      setShowContributionForm(false);
      await loadData();
      showModal('¡Éxito!', `Aporte de $${totalAmount} distribuido exitosamente entre tus portafolios`, 'success');
      setHistoryRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Error distribuyendo aporte:', error);
      showModal('Error', 'No se pudo distribuir el aporte. Intenta nuevamente.', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportService.exportToExcel();
      showModal('¡Exportado!', 'Tus datos han sido exportados a Excel exitosamente', 'success');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      showModal('Error', 'No se pudo exportar a Excel. Intenta nuevamente.', 'error');
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportService.exportToJSON();
      showModal('¡Backup Creado!', 'Tu copia de seguridad ha sido descargada exitosamente', 'success');
    } catch (error) {
      console.error('Error exportando a JSON:', error);
      showModal('Error', 'No se pudo crear el backup. Intenta nuevamente.', 'error');
    }
  };

  if (!summary) {
    return <div className="loading">Cargando inversiones...</div>;
  }

  return (
    <div className="investment-dashboard">
      <div className="dashboard-header">
        <h1>📈 Módulo de Inversiones</h1>
        <p>Gestiona tus portafolios y proyecciones a largo plazo</p>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.level}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Resumen General */}
      <InvestmentSummary summary={summary} />

      {/* Acciones Rápidas */}
      <div className="quick-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowContributionForm(!showContributionForm)}
        >
          + Agregar Aporte
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleExportExcel}
        >
          📊 Exportar a Excel
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleExportJSON}
        >
          💾 Crear Backup
        </button>

        <ImportBackup
          exportService={exportService}
          onImportSuccess={loadData}
        />
      </div>

      {/* Formulario de Aporte */}
      {showContributionForm && (
        <ContributionForm
          portfolios={portfolios}
          onSubmit={handleAddContribution}
          onDistribute={handleDistributeContribution}
          onCancel={() => setShowContributionForm(false)}
        />
      )}

      {/* Portafolios */}
      <div className="portfolios-grid">
        {portfolios.map(portfolio => (
          <PortfolioCard
            key={`${portfolio.id}-${summary.totalInvested}`}
            portfolio={portfolio}
            investmentService={investmentService}
            onSelect={() => setSelectedPortfolio(portfolio)}
            onUpdate={loadData}
          />
        ))}
      </div>

      {/* Historial de Aportes */}
      <ContributionHistory
        investmentService={investmentService}
        onUpdate={loadData}
        refreshKey={historyRefreshKey}
      />

      {/* Gráfico de Proyecciones */}
      {selectedPortfolio && (
        <ProjectionChart
          portfolio={selectedPortfolio}
          investmentService={investmentService}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default InvestmentDashboard;
