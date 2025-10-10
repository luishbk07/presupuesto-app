import React, { useState } from 'react';

const ContributionForm = ({ portfolios, onSubmit, onDistribute, onCancel }) => {
  const [mode, setMode] = useState('distribute'); // 'distribute' o 'manual'
  const [totalAmount, setTotalAmount] = useState('200');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [manualAmount, setManualAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'distribute') {
      const amount = parseFloat(totalAmount);
      if (amount > 0) {
        onDistribute(amount);
      }
    } else {
      const amount = parseFloat(manualAmount);
      if (selectedPortfolio && amount > 0) {
        onSubmit(selectedPortfolio, amount);
      }
    }
  };

  return (
    <div className="contribution-form-overlay">
      <div className="contribution-form card">
        <h2>Agregar Aporte</h2>

        <div className="form-mode-selector">
          <button
            className={`mode-btn ${mode === 'distribute' ? 'active' : ''}`}
            onClick={() => setMode('distribute')}
          >
            Distribución Automática
          </button>
          <button
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Aporte Manual
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'distribute' ? (
            <>
              <div className="form-group">
                <label className="form-label">Monto Total a Invertir:</label>
                <input
                  type="number"
                  className="form-input"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="200"
                  min="1"
                  step="0.01"
                  required
                />
                <small className="form-hint">
                  Se distribuirá automáticamente: 50% eToro, 50% Hapi
                </small>
              </div>

              <div className="distribution-preview">
                <h4>Vista Previa de Distribución:</h4>
                <div className="preview-item">
                  <span>eToro:</span>
                  <strong>${(parseFloat(totalAmount || 0) * 0.5).toFixed(2)}</strong>
                </div>
                <div className="preview-item">
                  <span>Hapi:</span>
                  <strong>${(parseFloat(totalAmount || 0) * 0.5).toFixed(2)}</strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Seleccionar Portafolio:</label>
                <select
                  className="form-select"
                  value={selectedPortfolio}
                  onChange={(e) => setSelectedPortfolio(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona un portafolio --</option>
                  {portfolios.map(portfolio => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.broker.toUpperCase()} - {portfolio.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto:</label>
                <input
                  type="number"
                  className="form-input"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Confirmar Aporte
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionForm;
