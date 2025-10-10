import { openDB } from 'idb';

// DatabaseService - Manejo de IndexedDB para presupuestos e inversiones
class DatabaseService {
  constructor() {
    this.dbName = 'PresupuestoInversionDB';
    this.version = 1;
    this.db = null;
  }

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        // Store para presupuestos
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          budgetStore.createIndex('createdDate', 'createdDate');
          budgetStore.createIndex('status', 'status');
        }

        // Store para inversiones
        if (!db.objectStoreNames.contains('investments')) {
          const investmentStore = db.createObjectStore('investments', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          investmentStore.createIndex('broker', 'broker');
          investmentStore.createIndex('date', 'date');
          investmentStore.createIndex('type', 'type');
        }

        // Store para portafolios
        if (!db.objectStoreNames.contains('portfolios')) {
          const portfolioStore = db.createObjectStore('portfolios', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          portfolioStore.createIndex('broker', 'broker');
          portfolioStore.createIndex('active', 'active');
        }

        // Store para aportes mensuales
        if (!db.objectStoreNames.contains('contributions')) {
          const contributionStore = db.createObjectStore('contributions', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          contributionStore.createIndex('portfolioId', 'portfolioId');
          contributionStore.createIndex('date', 'date');
        }

        // Store para configuración general
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { 
            keyPath: 'key'
          });
        }
      },
    });

    return this.db;
  }

  // ========== PRESUPUESTOS ==========
  async getAllBudgets() {
    const db = await this.initDB();
    return await db.getAll('budgets');
  }

  async getBudget(id) {
    const db = await this.initDB();
    return await db.get('budgets', id);
  }

  async saveBudget(budget) {
    const db = await this.initDB();
    return await db.put('budgets', budget);
  }

  async deleteBudget(id) {
    const db = await this.initDB();
    return await db.delete('budgets', id);
  }

  // ========== PORTAFOLIOS ==========
  async getAllPortfolios() {
    const db = await this.initDB();
    return await db.getAll('portfolios');
  }

  async getPortfolio(id) {
    const db = await this.initDB();
    return await db.get('portfolios', id);
  }

  async savePortfolio(portfolio) {
    const db = await this.initDB();
    return await db.put('portfolios', portfolio);
  }

  async deletePortfolio(id) {
    const db = await this.initDB();
    return await db.delete('portfolios', id);
  }

  async getPortfoliosByBroker(broker) {
    const db = await this.initDB();
    return await db.getAllFromIndex('portfolios', 'broker', broker);
  }

  // ========== INVERSIONES ==========
  async getAllInvestments() {
    const db = await this.initDB();
    return await db.getAll('investments');
  }

  async getInvestment(id) {
    const db = await this.initDB();
    return await db.get('investments', id);
  }

  async saveInvestment(investment) {
    const db = await this.initDB();
    return await db.put('investments', investment);
  }

  async deleteInvestment(id) {
    const db = await this.initDB();
    return await db.delete('investments', id);
  }

  async getInvestmentsByBroker(broker) {
    const db = await this.initDB();
    return await db.getAllFromIndex('investments', 'broker', broker);
  }

  // ========== APORTES ==========
  async getAllContributions() {
    const db = await this.initDB();
    return await db.getAll('contributions');
  }

  async getContribution(id) {
    const db = await this.initDB();
    return await db.get('contributions', id);
  }

  async saveContribution(contribution) {
    const db = await this.initDB();
    return await db.put('contributions', contribution);
  }

  async deleteContribution(id) {
    const db = await this.initDB();
    return await db.delete('contributions', id);
  }

  async getContributionsByPortfolio(portfolioId) {
    const db = await this.initDB();
    return await db.getAllFromIndex('contributions', 'portfolioId', portfolioId);
  }

  // ========== CONFIGURACIÓN ==========
  async getSetting(key) {
    const db = await this.initDB();
    return await db.get('settings', key);
  }

  async saveSetting(key, value) {
    const db = await this.initDB();
    return await db.put('settings', { key, value });
  }

  // ========== MIGRACIÓN DESDE LOCALSTORAGE ==========
  async migrateFromLocalStorage() {
    try {
      const oldData = localStorage.getItem('budgetApp');
      if (!oldData) return false;

      const data = JSON.parse(oldData);
      
      // Migrar presupuestos
      if (data.budgets && Array.isArray(data.budgets)) {
        for (const budget of data.budgets) {
          await this.saveBudget(budget);
        }
      }

      // Guardar el ID del presupuesto activo
      if (data.activeBudgetId) {
        await this.saveSetting('activeBudgetId', data.activeBudgetId);
      }

      // Marcar como migrado
      await this.saveSetting('migrated', true);
      
      console.log('✅ Datos migrados exitosamente de localStorage a IndexedDB');
      return true;
    } catch (error) {
      console.error('Error migrando datos:', error);
      return false;
    }
  }

  // ========== EXPORTAR/IMPORTAR ==========
  async exportAllData() {
    const db = await this.initDB();
    
    const data = {
      budgets: await db.getAll('budgets'),
      portfolios: await db.getAll('portfolios'),
      investments: await db.getAll('investments'),
      contributions: await db.getAll('contributions'),
      settings: await db.getAll('settings'),
      exportDate: new Date().toISOString(),
      version: this.version
    };

    return data;
  }

  async importAllData(data) {
    const db = await this.initDB();
    const tx = db.transaction(
      ['budgets', 'portfolios', 'investments', 'contributions', 'settings'], 
      'readwrite'
    );

    try {
      // Importar presupuestos
      if (data.budgets) {
        for (const budget of data.budgets) {
          await tx.objectStore('budgets').put(budget);
        }
      }

      // Importar portafolios
      if (data.portfolios) {
        for (const portfolio of data.portfolios) {
          await tx.objectStore('portfolios').put(portfolio);
        }
      }

      // Importar inversiones
      if (data.investments) {
        for (const investment of data.investments) {
          await tx.objectStore('investments').put(investment);
        }
      }

      // Importar aportes
      if (data.contributions) {
        for (const contribution of data.contributions) {
          await tx.objectStore('contributions').put(contribution);
        }
      }

      // Importar configuración
      if (data.settings) {
        for (const setting of data.settings) {
          await tx.objectStore('settings').put(setting);
        }
      }

      await tx.done;
      console.log('✅ Datos importados exitosamente');
      return true;
    } catch (error) {
      console.error('Error importando datos:', error);
      return false;
    }
  }

  // ========== LIMPIAR DATOS ==========
  async clearAllData() {
    const db = await this.initDB();
    const tx = db.transaction(
      ['budgets', 'portfolios', 'investments', 'contributions', 'settings'], 
      'readwrite'
    );

    await tx.objectStore('budgets').clear();
    await tx.objectStore('portfolios').clear();
    await tx.objectStore('investments').clear();
    await tx.objectStore('contributions').clear();
    await tx.objectStore('settings').clear();

    await tx.done;
    console.log('✅ Todos los datos han sido eliminados');
  }
}

export default DatabaseService;
