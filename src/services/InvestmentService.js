// InvestmentService - Lógica de negocio para inversiones
class InvestmentService {
  constructor(databaseService) {
    this.db = databaseService;
    
    // Configuración de portafolios según tu Plan Maestro
    this.portfolioConfig = {
      etoro: {
        name: 'eToro',
        percentage: 0.5, // 50%
        assets: [
          { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', weight: 0.50 },
          { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', weight: 0.25 },
          { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'ETF', weight: 0.15 },
          { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'ETF', weight: 0.10 }
        ]
      },
      hapi: {
        name: 'Hapi',
        percentage: 0.5, // 50%
        assets: [
          { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'Stock', weight: 0.20, dividendYield: 0 },
          { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'Stock', weight: 0.20, dividendYield: 0 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', weight: 0.15, dividendYield: 0.008 },
          { symbol: 'AAPL', name: 'Apple Inc', type: 'Stock', weight: 0.10, dividendYield: 0.005 },
          { symbol: 'O', name: 'Realty Income Corporation', type: 'REIT', weight: 0.10, dividendYield: 0.053 },
          { symbol: 'STAG', name: 'STAG Industrial Inc', type: 'REIT', weight: 0.10, dividendYield: 0.043 },
          { symbol: 'VICI', name: 'VICI Properties Inc', type: 'REIT', weight: 0.10, dividendYield: 0.055 },
          { symbol: 'BTCUSD', name: 'Bitcoin', type: 'Crypto', weight: 0.05, dividendYield: 0 }
        ]
      }
    };
  }

  // ========== INICIALIZACIÓN ==========
  async initializePortfolios() {
    const existingPortfolios = await this.db.getAllPortfolios();
    
    if (existingPortfolios.length === 0) {
      // Crear portafolios iniciales
      const etoroPortfolio = {
        id: 'portfolio-etoro',
        broker: 'etoro',
        name: 'eToro - Crecimiento Largo Plazo',
        assets: this.portfolioConfig.etoro.assets,
        monthlyContribution: 100,
        active: true,
        createdDate: new Date().toISOString(),
        totalInvested: 0,
        currentValue: 0
      };

      const hapiPortfolio = {
        id: 'portfolio-hapi',
        broker: 'hapi',
        name: 'Hapi - Dividendos y Crecimiento',
        assets: this.portfolioConfig.hapi.assets,
        monthlyContribution: 100,
        active: true,
        createdDate: new Date().toISOString(),
        totalInvested: 0,
        currentValue: 0
      };

      await this.db.savePortfolio(etoroPortfolio);
      await this.db.savePortfolio(hapiPortfolio);

      console.log('✅ Portafolios inicializados');
    }
  }

  // ========== APORTES ==========
  async addContribution(portfolioId, amount, assets = []) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    if (!portfolio) throw new Error('Portafolio no encontrado');

    const contribution = {
      id: `contribution-${Date.now()}`,
      portfolioId,
      amount: parseFloat(amount),
      assets: assets.length > 0 ? assets : this.calculateAssetDistribution(portfolio, amount),
      date: new Date().toISOString(),
      type: 'manual'
    };

    await this.db.saveContribution(contribution);

    // Actualizar total invertido del portafolio
    portfolio.totalInvested = (portfolio.totalInvested || 0) + contribution.amount;
    await this.db.savePortfolio(portfolio);

    return contribution;
  }

  calculateAssetDistribution(portfolio, totalAmount) {
    return portfolio.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      amount: totalAmount * asset.weight,
      weight: asset.weight
    }));
  }

  // ========== PROYECCIONES ==========
  calculateProjections(initialAmount, monthlyContribution, years, annualReturn) {
    const months = years * 12;
    const monthlyReturn = annualReturn / 12;
    const projections = [];

    let totalInvested = initialAmount;
    let currentValue = initialAmount;

    for (let month = 1; month <= months; month++) {
      // Agregar aporte mensual
      totalInvested += monthlyContribution;
      currentValue += monthlyContribution;

      // Aplicar rendimiento mensual
      currentValue = currentValue * (1 + monthlyReturn);

      // Guardar proyección cada 12 meses
      if (month % 12 === 0) {
        projections.push({
          year: month / 12,
          totalInvested: Math.round(totalInvested * 100) / 100,
          projectedValue: Math.round(currentValue * 100) / 100,
          gains: Math.round((currentValue - totalInvested) * 100) / 100
        });
      }
    }

    return projections;
  }

  async getPortfolioProjections(portfolioId, years = 10) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    const contributions = await this.db.getContributionsByPortfolio(portfolioId);

    const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
    const monthlyContribution = portfolio.monthlyContribution || 0;

    // Calcular proyecciones con diferentes tasas de retorno
    const projections = {
      conservative: this.calculateProjections(totalInvested, monthlyContribution, years, 0.07),
      moderate: this.calculateProjections(totalInvested, monthlyContribution, years, 0.08),
      optimistic: this.calculateProjections(totalInvested, monthlyContribution, years, 0.09)
    };

    return projections;
  }

  // ========== DIVIDENDOS ==========
  calculateMonthlyDividends(portfolio, totalInvested) {
    let monthlyDividends = 0;

    portfolio.assets.forEach(asset => {
      if (asset.dividendYield && asset.dividendYield > 0) {
        const assetValue = totalInvested * asset.weight;
        const annualDividend = assetValue * asset.dividendYield;
        monthlyDividends += annualDividend / 12;
      }
    });

    return Math.round(monthlyDividends * 100) / 100;
  }

  async getPortfolioDividends(portfolioId) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    const contributions = await this.db.getContributionsByPortfolio(portfolioId);

    const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
    const monthlyDividends = this.calculateMonthlyDividends(portfolio, totalInvested);
    const annualDividends = monthlyDividends * 12;

    return {
      monthly: monthlyDividends,
      annual: annualDividends,
      yieldPercentage: totalInvested > 0 ? (annualDividends / totalInvested) * 100 : 0
    };
  }

  // ========== RESUMEN GENERAL ==========
  async getOverallSummary() {
    const portfolios = await this.db.getAllPortfolios();
    const allContributions = await this.db.getAllContributions();

    let totalInvested = 0;
    let monthlyDividends = 0;

    for (const portfolio of portfolios) {
      const portfolioContributions = allContributions.filter(c => c.portfolioId === portfolio.id);
      const portfolioTotal = portfolioContributions.reduce((sum, c) => sum + c.amount, 0);
      
      totalInvested += portfolioTotal;
      monthlyDividends += this.calculateMonthlyDividends(portfolio, portfolioTotal);
    }

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      portfolioCount: portfolios.length,
      monthlyDividends: Math.round(monthlyDividends * 100) / 100,
      annualDividends: Math.round(monthlyDividends * 12 * 100) / 100,
      contributionCount: allContributions.length
    };
  }

  // ========== DISTRIBUCIÓN AUTOMÁTICA ==========
  async distributeMonthlyContribution(totalAmount) {
    const portfolios = await this.db.getAllPortfolios();
    const distributions = [];

    for (const portfolio of portfolios) {
      const config = this.portfolioConfig[portfolio.broker];
      if (!config) continue;

      const portfolioAmount = totalAmount * config.percentage;
      const assetDistribution = this.calculateAssetDistribution(portfolio, portfolioAmount);

      distributions.push({
        portfolioId: portfolio.id,
        broker: portfolio.broker,
        amount: portfolioAmount,
        assets: assetDistribution
      });
    }

    return distributions;
  }

  // ========== ALERTAS ==========
  async checkAlerts() {
    const summary = await this.getOverallSummary();
    const alerts = [];

    // Alerta: Alcanzar milestone de inversión
    const milestones = [500, 1000, 2500, 5000, 10000];
    for (const milestone of milestones) {
      if (summary.totalInvested >= milestone && summary.totalInvested < milestone + 200) {
        alerts.push({
          type: 'milestone',
          level: 'success',
          message: `¡Felicidades! Has alcanzado $${milestone} en inversiones totales`,
          value: milestone
        });
      }
    }

    // Alerta: Dividendos mensuales significativos
    if (summary.monthlyDividends >= 10) {
      alerts.push({
        type: 'dividends',
        level: 'info',
        message: `Estás generando $${summary.monthlyDividends.toFixed(2)} mensuales en dividendos`,
        value: summary.monthlyDividends
      });
    }

    return alerts;
  }

  // ========== ACTUALIZAR CONFIGURACIÓN ==========
  async updatePortfolioContribution(portfolioId, newAmount) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    if (!portfolio) throw new Error('Portafolio no encontrado');

    portfolio.monthlyContribution = parseFloat(newAmount);
    await this.db.savePortfolio(portfolio);

    return portfolio;
  }

  async updatePortfolioAssets(portfolioId, newAssets) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    if (!portfolio) throw new Error('Portafolio no encontrado');

    // Validar que los pesos sumen 1 (100%)
    const totalWeight = newAssets.reduce((sum, asset) => sum + asset.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error('Los pesos de los activos deben sumar 100%');
    }

    portfolio.assets = newAssets;
    await this.db.savePortfolio(portfolio);

    return portfolio;
  }
}

export default InvestmentService;
