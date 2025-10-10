import React, { useState } from 'react';
import Modal from './Modal';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const ExpenseList = ({ activeBudget, onRemoveExpense }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, expenseId: null, expenseDesc: '' });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteClick = (expenseId, expenseDesc) => {
    setConfirmDelete({ isOpen: true, expenseId, expenseDesc });
  };

  const confirmDeleteAction = () => {
    const { expenseId } = confirmDelete;
    setConfirmDelete({ isOpen: false, expenseId: null, expenseDesc: '' });
    onRemoveExpense(expenseId);
    showModal('¡Eliminado!', 'El gasto ha sido eliminado exitosamente', 'success');
  };
  if (!activeBudget) {
    return (
      <div className="card">
        <h2>Lista de Gastos</h2>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Selecciona un presupuesto para ver los gastos.
        </p>
      </div>
    );
  }

  if (activeBudget.expenses.length === 0) {
    return (
      <div className="card">
        <h2>Lista de Gastos</h2>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          Presupuesto: <strong>{activeBudget.name}</strong>
        </p>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No hay gastos registrados aún.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <h2>Lista de Gastos</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Presupuesto: <strong>{activeBudget.name}</strong>
      </p>
      <div>
        {activeBudget.expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-info">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-amount">
                {CurrencyFormatter.formatAmount(expense.amount, activeBudget.currency)} • {formatDate(expense.date)}
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteClick(expense.id, expense.description)}
              style={{ marginLeft: '12px' }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, expenseId: null, expenseDesc: '' })}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el gasto "${confirmDelete.expenseDesc}"?`}
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

export default ExpenseList;
