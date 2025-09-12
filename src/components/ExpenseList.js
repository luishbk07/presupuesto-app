import React from 'react';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const ExpenseList = ({ activeBudget, onRemoveExpense }) => {
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
              onClick={() => onRemoveExpense(expense.id)}
              style={{ marginLeft: '12px' }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
