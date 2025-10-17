import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './ContributionHistory.css';

const ContributionHistory = ({ investmentService, onUpdate }) => {
  const [contributions, setContributions] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, contribution: null });

  useEffect(() => {
    loadContributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadContributions = async () => {
    try {
      const allContributions = await investmentService.db.getAllContributions();
      const allPortfolios = await investmentService.db.getAllPortfolios();

      // Ordenar por fecha descendente (más reciente primero)
      const sorted = allContributions.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setContributions(sorted);
      setPortfolios(allPortfolios);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const getPortfolioName = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    return portfolio ? portfolio.broker.toUpperCase() : 'Desconocido';
  };

  const handleEdit = (contribution) => {
    setEditingId(contribution.id);
    setEditAmount(contribution.amount.toString());
  };

  const handleSaveEdit = async (contribution) => {
    try {
      const newAmount = parseFloat(editAmount);
      if (isNaN(newAmount) || newAmount <= 0) {
        showModal('Error', 'Por favor ingresa un monto válido mayor a cero', 'error');
        return;
      }

      // Actualizar el aporte
      const updatedContribution = {
        ...contribution,
        amount: newAmount,
        assets: contribution.assets.map(asset => ({
          ...asset,
          amount: (newAmount / contribution.amount) * asset.amount
        }))
      };

      await investmentService.db.saveContribution(updatedContribution);

      // Recalcular total invertido del portafolio
      const portfolio = await investmentService.db.getPortfolio(contribution.portfolioId);
      const allContribs = await investmentService.db.getContributionsByPortfolio(contribution.portfolioId);
      const totalInvested = allContribs.reduce((sum, c) => sum + (c.id === contribution.id ? newAmount : c.amount), 0);

      portfolio.totalInvested = totalInvested;
      await investmentService.db.savePortfolio(portfolio);

      setEditingId(null);
      await loadContributions();
      if (onUpdate) onUpdate();

      showModal('¡Actualizado!', 'El aporte ha sido actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error actualizando aporte:', error);
      showModal('Error', 'No se pudo actualizar el aporte. Intenta nuevamente.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const handleDelete = (contribution) => {
    setConfirmDelete({ isOpen: true, contribution });
  };

  const confirmDeleteAction = async () => {
    const { contribution } = confirmDelete;
    setConfirmDelete({ isOpen: false, contribution: null });

    try {
      // Eliminar el aporte
      await investmentService.db.deleteContribution(contribution.id);

      // Recalcular total invertido del portafolio
      const portfolio = await investmentService.db.getPortfolio(contribution.portfolioId);
      const allContribs = await investmentService.db.getContributionsByPortfolio(contribution.portfolioId);
      const totalInvested = allContribs.reduce((sum, c) => sum + c.amount, 0);

      portfolio.totalInvested = totalInvested;
      await investmentService.db.savePortfolio(portfolio);

      await loadContributions();
      if (onUpdate) onUpdate();

      showModal('¡Eliminado!', 'El aporte ha sido eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error eliminando aporte:', error);
      showModal('Error', 'No se pudo eliminar el aporte. Intenta nuevamente.', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (contributions.length === 0) {
    return (
      <div className="contribution-history card">
        <h3>📜 Historial de Aportes</h3>
        <p className="no-contributions">No hay aportes registrados aún</p>
      </div>
    );
  }

  return (
    <div className="contribution-history card">
      <div className="header">
        <h3>📜 Historial de Aportes</h3>
        <h3> 📊 Total invertido: ${contributions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}</h3>
      </div>
      <div className="contributions-list">
        {contributions.map(contribution => (
          <div key={contribution.id} className="contribution-item">
            <div className="contribution-header">
              <div className="contribution-info">
                <span className="contribution-broker">
                  {getPortfolioName(contribution.portfolioId)}
                </span>
                <span className="contribution-date">
                  {formatDate(contribution.date)}
                </span>
              </div>

              {editingId === contribution.id ? (
                <div className="contribution-edit">
                  <input
                    type="number"
                    className="edit-input"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Monto"
                    min="0.01"
                    step="0.01"
                  />
                  <button
                    className="btn-save"
                    onClick={() => handleSaveEdit(contribution)}
                  >
                    ✓
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancelEdit}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="contribution-actions">
                  <span className="contribution-amount">
                    ${contribution.amount.toFixed(2)}
                  </span>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(contribution)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(contribution)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {contribution.assets && contribution.assets.length > 0 && (
              <>
                <div className="contribution-assets-header">
                  <span className="assets-count">
                    📊 {contribution.assets.filter(a => a.amount > 0).length} activos
                  </span>
                </div>
                <div className="contribution-assets">
                  {contribution.assets
                    .filter(asset => asset.amount > 0)
                    .sort((a, b) => b.amount - a.amount)
                    .map((asset, index) => (
                      <div key={index} className="contribution-asset">
                        <span className="asset-symbol-small">{asset.symbol}</span>
                        <span className="asset-amount-small">
                          ${asset.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            )}
            {contribution.assets && contribution.assets.length === 0 && (
              <div className="contribution-assets">
                <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                  Sin distribución por activos
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, contribution: null })}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar este aporte de $${confirmDelete.contribution?.amount.toFixed(2)}?`}
        type="confirm"
        onConfirm={confirmDeleteAction}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de mensajes */}
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

export default ContributionHistory;
