import React, { useState, useEffect } from 'react';
import AssetManager from './AssetManager';

const PortfolioCard = ({ portfolio, investmentService, onSelect, onUpdate }) => {
  const [contributions, setContributions] = useState([]);
  const [dividends, setDividends] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showAssetManager, setShowAssetManager] = useState(false);

  useEffect(() => {
    loadPortfolioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio.id, portfolio.totalInvested]);

  const loadPortfolioData = async () => {
    try {
      const contribs = await investmentService.db.getContributionsByPortfolio(portfolio.id);
      const divs = await investmentService.getPortfolioDividends(portfolio.id);
      
      setContributions(contribs);
      setDividends(divs);
    } catch (error) {
      console.error('Error cargando datos del portafolio:', error);
    }
  };

  const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="portfolio-card">
      <div className="portfolio-header">
        <div className="portfolio-broker">{portfolio.broker.toUpperCase()}</div>
        <div className="portfolio-name">{portfolio.name}</div>
      </div>

      <div className="portfolio-stats">
        <div className="stat">
          <div className="stat-label">Total Invertido</div>
          <div className="stat-value">${totalInvested.toFixed(2)}</div>
        </div>

        <div className="stat">
          <div className="stat-label">Aporte Mensual</div>
          <div className="stat-value">${portfolio.monthlyContribution}</div>
        </div>

        {dividends && (
          <div className="stat">
            <div className="stat-label">Dividendos Mensuales</div>
            <div className="stat-value status-green">${dividends.monthly.toFixed(2)}</div>
          </div>
        )}
      </div>

      <button 
        className="btn-expand"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲ Ocultar Activos' : '▼ Ver Activos'}
      </button>

      {expanded && (
        <div className="portfolio-assets">
          <h4>Distribución de Activos</h4>
          {portfolio.assets.map((asset, index) => {
            const assetAmount = totalInvested * asset.weight;
            return (
              <div key={index} className="asset-item">
                <div className="asset-info">
                  <span className="asset-symbol">{asset.symbol}</span>
                  <span className="asset-name">{asset.name}</span>
                </div>
                <div className="asset-amounts">
                  <div className="asset-weight">
                    {(asset.weight * 100).toFixed(1)}%
                  </div>
                  <div className="asset-value">
                    ${assetAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowAssetManager(true)}
          style={{ flex: 1 }}
        >
          ⚙️ Gestionar Activos
        </button>
        <button 
          className="btn btn-primary"
          onClick={onSelect}
          style={{ flex: 1 }}
        >
          📈 Ver Proyecciones
        </button>
      </div>

      {/* Asset Manager Modal */}
      {showAssetManager && (
        <AssetManager
          portfolio={portfolio}
          investmentService={investmentService}
          onUpdate={() => {
            loadPortfolioData();
            if (onUpdate) onUpdate();
          }}
          onClose={() => setShowAssetManager(false)}
        />
      )}
    </div>
  );
};

export default PortfolioCard;
