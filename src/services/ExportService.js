import * as XLSX from 'xlsx';

// ExportService - Exportar e importar datos en diferentes formatos
class ExportService {
  constructor(databaseService) {
    this.db = databaseService;
  }

  // ========== EXPORTAR A JSON ==========
  async exportToJSON() {
    try {
      const data = await this.db.exportAllData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `presupuesto-inversion-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exportando a JSON:', error);
      return false;
    }
  }

  // ========== IMPORTAR DESDE JSON ==========
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const success = await this.db.importAllData(data);
          resolve(success);
        } catch (error) {
          console.error('Error importando JSON:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsText(file);
    });
  }

  // ========== EXPORTAR A EXCEL ==========
  async exportToExcel() {
    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen General
      const summary = await this.generateSummarySheet();
      const summarySheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Hoja 2: Presupuestos
      const budgets = await this.db.getAllBudgets();
      if (budgets.length > 0) {
        const budgetData = budgets.map(b => ({
          'Nombre': b.name,
          'Monto': b.amount,
          'Moneda': b.currency,
          'Fecha Creación': new Date(b.createdDate).toLocaleDateString(),
          'Estado': b.status
        }));
        const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
        XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Presupuestos');
      }

      // Hoja 3: Portafolios
      const portfolios = await this.db.getAllPortfolios();
      if (portfolios.length > 0) {
        const portfolioData = portfolios.map(p => ({
          'Broker': p.broker,
          'Nombre': p.name,
          'Aporte Mensual': p.monthlyContribution,
          'Total Invertido': p.totalInvested || 0,
          'Fecha Creación': new Date(p.createdDate).toLocaleDateString()
        }));
        const portfolioSheet = XLSX.utils.json_to_sheet(portfolioData);
        XLSX.utils.book_append_sheet(workbook, portfolioSheet, 'Portafolios');
      }

      // Hoja 4: Aportes
      const contributions = await this.db.getAllContributions();
      if (contributions.length > 0) {
        const contributionData = contributions.map(c => ({
          'Portafolio': c.portfolioId,
          'Monto': c.amount,
          'Fecha': new Date(c.date).toLocaleDateString(),
          'Tipo': c.type
        }));
        const contributionSheet = XLSX.utils.json_to_sheet(contributionData);
        XLSX.utils.book_append_sheet(workbook, contributionSheet, 'Aportes');
      }

      // Hoja 5: Proyecciones eToro
      const etoroProjections = await this.generateProjectionSheet('portfolio-etoro');
      if (etoroProjections.length > 0) {
        const etoroSheet = XLSX.utils.json_to_sheet(etoroProjections);
        XLSX.utils.book_append_sheet(workbook, etoroSheet, 'Proyecciones eToro');
      }

      // Hoja 6: Proyecciones Hapi
      const hapiProjections = await this.generateProjectionSheet('portfolio-hapi');
      if (hapiProjections.length > 0) {
        const hapiSheet = XLSX.utils.json_to_sheet(hapiProjections);
        XLSX.utils.book_append_sheet(workbook, hapiSheet, 'Proyecciones Hapi');
      }

      // Generar archivo
      const fileName = `Plan-Maestro-Inversiones-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return true;
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      return false;
    }
  }

  // ========== GENERAR HOJA DE RESUMEN ==========
  async generateSummarySheet() {
    const budgets = await this.db.getAllBudgets();
    const portfolios = await this.db.getAllPortfolios();
    const contributions = await this.db.getAllContributions();

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);

    return [
      { 'Métrica': 'Total Presupuestos', 'Valor': budgets.length },
      { 'Métrica': 'Monto Total Presupuestado', 'Valor': `$${totalBudget.toFixed(2)}` },
      { 'Métrica': 'Total Portafolios', 'Valor': portfolios.length },
      { 'Métrica': 'Total Invertido', 'Valor': `$${totalInvested.toFixed(2)}` },
      { 'Métrica': 'Total Aportes Realizados', 'Valor': contributions.length },
      { 'Métrica': 'Fecha de Exportación', 'Valor': new Date().toLocaleString() }
    ];
  }

  // ========== GENERAR HOJA DE PROYECCIONES ==========
  async generateProjectionSheet(portfolioId) {
    const portfolio = await this.db.getPortfolio(portfolioId);
    if (!portfolio) return [];

    const contributions = await this.db.getContributionsByPortfolio(portfolioId);
    const totalInvested = contributions.reduce((sum, c) => sum + c.amount, 0);
    const monthlyContribution = portfolio.monthlyContribution || 0;

    const projections = [];
    const years = 10;
    const rates = [
      { name: 'Conservador (7%)', rate: 0.07 },
      { name: 'Moderado (8%)', rate: 0.08 },
      { name: 'Optimista (9%)', rate: 0.09 }
    ];

    for (let year = 1; year <= years; year++) {
      const row = { 'Año': year };

      rates.forEach(({ name, rate }) => {
        const months = year * 12;
        const monthlyReturn = rate / 12;
        let currentValue = totalInvested;

        for (let month = 1; month <= months; month++) {
          currentValue += monthlyContribution;
          currentValue = currentValue * (1 + monthlyReturn);
        }

        const totalContributed = totalInvested + (monthlyContribution * months);
        row[`${name} - Invertido`] = `$${totalContributed.toFixed(2)}`;
        row[`${name} - Valor`] = `$${currentValue.toFixed(2)}`;
        row[`${name} - Ganancia`] = `$${(currentValue - totalContributed).toFixed(2)}`;
      });

      projections.push(row);
    }

    return projections;
  }

  // ========== EXPORTAR DISTRIBUCIÓN DE APORTES ==========
  async exportContributionDistribution(totalAmount) {
    try {
      const portfolios = await this.db.getAllPortfolios();
      const workbook = XLSX.utils.book_new();

      const distributionData = [];

      for (const portfolio of portfolios) {
        const portfolioAmount = totalAmount * 0.5; // 50% cada uno
        
        portfolio.assets.forEach(asset => {
          const assetAmount = portfolioAmount * asset.weight;
          distributionData.push({
            'Broker': portfolio.broker.toUpperCase(),
            'Activo': asset.symbol,
            'Nombre': asset.name,
            'Tipo': asset.type,
            'Peso (%)': (asset.weight * 100).toFixed(2) + '%',
            'Monto': `$${assetAmount.toFixed(2)}`
          });
        });
      }

      const sheet = XLSX.utils.json_to_sheet(distributionData);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Distribución');

      const fileName = `Distribucion-Aporte-$${totalAmount}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return true;
    } catch (error) {
      console.error('Error exportando distribución:', error);
      return false;
    }
  }
}

export default ExportService;
