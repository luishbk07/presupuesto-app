import React, { useState } from 'react';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const ExpenseForm = ({ activeBudget, onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (description.trim() && amount && parseFloat(amount) > 0) {
      onAddExpense({
        description: description.trim(),
        amount: parseFloat(amount)
      });
      
      setDescription('');
      setAmount('');
    }
  };

  if (!activeBudget) {
    return (
      <div className="card">
        <h2>Agregar Gasto</h2>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Selecciona un presupuesto para agregar gastos.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Agregar Gasto</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Presupuesto: <strong>{activeBudget.name}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Descripción:</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Supermercado, Gasolina, etc."
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Monto ({CurrencyFormatter.getCurrencySymbol(activeBudget.currency)}):
          </label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Agregar Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
