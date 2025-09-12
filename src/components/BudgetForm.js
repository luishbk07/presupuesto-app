import React, { useState, useEffect } from 'react';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const BudgetForm = ({ activeBudget, onBudgetUpdate }) => {
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('USD');

  useEffect(() => {
    if (activeBudget) {
      setBudgetName(activeBudget.name);
      setBudgetAmount(activeBudget.amount.toString());
      setBudgetCurrency(activeBudget.currency);
    }
  }, [activeBudget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (budgetName.trim() && budgetAmount && parseFloat(budgetAmount) >= 0) {
      onBudgetUpdate({
        name: budgetName.trim(),
        amount: parseFloat(budgetAmount),
        currency: budgetCurrency
      });
    }
  };

  if (!activeBudget) {
    return (
      <div className="card">
        <h2>Configurar Presupuesto</h2>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Selecciona o crea un presupuesto para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Configurar Presupuesto Activo</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre del Presupuesto:</label>
          <input
            type="text"
            className="form-input"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            placeholder="Nombre del presupuesto"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Moneda:</label>
          <select 
            className="form-select"
            value={budgetCurrency}
            onChange={(e) => setBudgetCurrency(e.target.value)}
          >
            <option value="USD">Dólar Estadounidense (USD)</option>
            <option value="DOP">Peso Dominicano (DOP)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Presupuesto Total ({CurrencyFormatter.getCurrencySymbol(budgetCurrency)}):
          </label>
          <input
            type="number"
            className="form-input"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="Ingresa tu presupuesto"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Actualizar Presupuesto
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
