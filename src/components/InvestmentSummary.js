import React from 'react';

const InvestmentSummary = ({ summary }) => {
  return (
    <div className="investment-summary">
      <div className="summary-card">
        <div className="summary-icon">💵</div>
        <div className="summary-content">
          <div className="summary-value">${summary.totalInvested.toFixed(2)}</div>
          <div className="summary-label">Total Invertido</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">📊</div>
        <div className="summary-content">
          <div className="summary-value">{summary.portfolioCount}</div>
          <div className="summary-label">Portafolios Activos</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">💰</div>
        <div className="summary-content">
          <div className="summary-value">${summary.monthlyDividends.toFixed(2)}</div>
          <div className="summary-label">Dividendos Mensuales</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon">📅</div>
        <div className="summary-content">
          <div className="summary-value">${summary.annualDividends.toFixed(2)}</div>
          <div className="summary-label">Dividendos Anuales</div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSummary;
