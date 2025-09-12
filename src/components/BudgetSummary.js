import React from 'react';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const BudgetSummary = ({ activeBudget, totalExpenses, remaining, status }) => {
  const getStatusClass = (status) => {
    const classes = {
      safe: 'status-green',
      warning: 'status-yellow',
      danger: 'status-red'
    };
    return classes[status] || '';
  };

  const getStatusText = (status) => {
    const texts = {
      safe: 'Presupuesto Saludable',
      warning: 'Precaución',
      danger: 'Límite Alcanzado'
    };
    return texts[status] || 'Estado del Presupuesto';
  };

  if (!activeBudget) {
    return (
      <div className="budget-summary">
        <div className="summary-item">
          <div className="summary-value">--</div>
          <div className="summary-label">Presupuesto Total</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">--</div>
          <div className="summary-label">Total Gastado</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">--</div>
          <div className="summary-label">Restante</div>
        </div>
        <div className="summary-item">
          <div className="summary-value">Sin Presupuesto</div>
          <div className="summary-label">Estado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-summary">
      <div className="summary-item">
        <div className="summary-value">
          {CurrencyFormatter.formatAmount(activeBudget.amount, activeBudget.currency)}
        </div>
        <div className="summary-label">Presupuesto Total</div>
      </div>
      
      <div className="summary-item">
        <div className="summary-value">
          {CurrencyFormatter.formatAmount(totalExpenses, activeBudget.currency)}
        </div>
        <div className="summary-label">Total Gastado</div>
      </div>
      
      <div className="summary-item">
        <div className={`summary-value ${getStatusClass(status)}`}>
          {CurrencyFormatter.formatAmount(remaining, activeBudget.currency)}
        </div>
        <div className="summary-label">Restante</div>
      </div>
      
      <div className="summary-item">
        <div className={`summary-value ${getStatusClass(status)}`}>
          {getStatusText(status)}
        </div>
        <div className="summary-label">Estado</div>
      </div>
    </div>
  );
};

export default BudgetSummary;
