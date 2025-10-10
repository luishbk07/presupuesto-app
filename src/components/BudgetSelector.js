import React, { useState } from 'react';
import Modal from './Modal';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const BudgetSelector = ({ budgets, activeBudget, onSelectBudget, onCreateBudget, onDeleteBudget }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetCurrency, setNewBudgetCurrency] = useState('USD');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, budgetId: null, budgetName: '' });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleCreateBudget = (e) => {
    e.preventDefault();
    
    if (newBudgetName.trim() && newBudgetAmount && parseFloat(newBudgetAmount) > 0) {
      onCreateBudget({
        name: newBudgetName.trim(),
        amount: parseFloat(newBudgetAmount),
        currency: newBudgetCurrency
      });
      
      setNewBudgetName('');
      setNewBudgetAmount('');
      setNewBudgetCurrency('USD');
      setShowCreateForm(false);
      
      showModal('¡Presupuesto Creado!', `El presupuesto "${newBudgetName}" ha sido creado exitosamente`, 'success');
    }
  };

  const handleDeleteClick = (budgetId, budgetName, e) => {
    e.stopPropagation();
    setConfirmDelete({ isOpen: true, budgetId, budgetName });
  };

  const confirmDeleteAction = () => {
    const { budgetId } = confirmDelete;
    setConfirmDelete({ isOpen: false, budgetId: null, budgetName: '' });
    onDeleteBudget(budgetId);
    showModal('¡Eliminado!', 'El presupuesto ha sido eliminado exitosamente', 'success');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Mis Presupuestos</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancelar' : '+ Nuevo Presupuesto'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateBudget} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Crear Nuevo Presupuesto</h3>
          
          <div className="form-group">
            <label className="form-label">Nombre del Presupuesto:</label>
            <input
              type="text"
              className="form-input"
              value={newBudgetName}
              onChange={(e) => setNewBudgetName(e.target.value)}
              placeholder="Ej: Presupuesto Enero 2024"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Moneda:</label>
            <select 
              className="form-select"
              value={newBudgetCurrency}
              onChange={(e) => setNewBudgetCurrency(e.target.value)}
            >
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="DOP">Peso Dominicano (DOP)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Monto ({CurrencyFormatter.getCurrencySymbol(newBudgetCurrency)}):
            </label>
            <input
              type="number"
              className="form-input"
              value={newBudgetAmount}
              onChange={(e) => setNewBudgetAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Crear Presupuesto
          </button>
        </form>
      )}

      {budgets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No tienes presupuestos creados. ¡Crea tu primer presupuesto!
        </p>
      ) : (
        <div>
          {budgets.map((budget) => (
            <div 
              key={budget.id} 
              className={`expense-item ${activeBudget?.id === budget.id ? 'active-budget' : ''}`}
              style={{ 
                cursor: 'pointer',
                border: activeBudget?.id === budget.id ? '2px solid #007bff' : '1px solid #e1e5e9',
                backgroundColor: activeBudget?.id === budget.id ? '#f0f8ff' : '#fafafa'
              }}
              onClick={() => onSelectBudget(budget.id)}
            >
              <div className="expense-info" style={{ flex: 1 }}>
                <div className="expense-description" style={{ fontWeight: 'bold' }}>
                  {budget.name}
                </div>
                <div className="expense-amount">
                  {CurrencyFormatter.formatAmount(budget.amount, budget.currency)} • {formatDate(budget.createdDate)}
                </div>
              </div>
              
              {activeBudget?.id === budget.id && (
                <span style={{ 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  marginRight: '8px'
                }}>
                  Activo
                </span>
              )}
              
              {budgets.length > 1 && (
                <button
                  className="btn btn-danger"
                  onClick={(e) => handleDeleteClick(budget.id, budget.name, e)}
                  style={{ marginLeft: '8px' }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, budgetId: null, budgetName: '' })}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el presupuesto "${confirmDelete.budgetName}"?`}
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

export default BudgetSelector;
