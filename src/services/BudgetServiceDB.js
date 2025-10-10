// BudgetServiceDB - Servicio de presupuestos con IndexedDB
class BudgetServiceDB {
  constructor(databaseService) {
    this.db = databaseService;
  }

  async loadBudgetData() {
    const budgets = await this.db.getAllBudgets();
    const activeBudgetId = await this.db.getSetting('activeBudgetId');
    
    return {
      budgets: budgets || [],
      activeBudgetId: activeBudgetId?.value || null
    };
  }

  async createBudget(budgetInfo) {
    const newBudget = {
      id: `budget-${Date.now()}`,
      name: budgetInfo.name || `Presupuesto ${new Date().toLocaleDateString()}`,
      amount: parseFloat(budgetInfo.amount),
      currency: budgetInfo.currency,
      expenses: [],
      createdDate: new Date().toISOString(),
      status: 'active'
    };

    await this.db.saveBudget(newBudget);
    await this.db.saveSetting('activeBudgetId', newBudget.id);

    return await this.loadBudgetData();
  }

  async getActiveBudget() {
    const data = await this.loadBudgetData();
    if (!data.activeBudgetId) return null;
    return data.budgets.find(budget => budget.id === data.activeBudgetId) || null;
  }

  async setActiveBudget(budgetId) {
    await this.db.saveSetting('activeBudgetId', budgetId);
    return await this.loadBudgetData();
  }

  async addExpense(expense) {
    const activeBudget = await this.getActiveBudget();
    if (!activeBudget) return await this.loadBudgetData();

    const newExpense = {
      id: `expense-${Date.now()}`,
      description: expense.description,
      amount: parseFloat(expense.amount),
      date: new Date().toISOString()
    };

    activeBudget.expenses.push(newExpense);
    await this.db.saveBudget(activeBudget);

    return await this.loadBudgetData();
  }

  async removeExpense(expenseId) {
    const activeBudget = await this.getActiveBudget();
    if (!activeBudget) return await this.loadBudgetData();

    activeBudget.expenses = activeBudget.expenses.filter(expense => expense.id !== expenseId);
    await this.db.saveBudget(activeBudget);

    return await this.loadBudgetData();
  }

  async updateBudget(budgetInfo) {
    const activeBudget = await this.getActiveBudget();
    if (!activeBudget) return await this.loadBudgetData();

    activeBudget.name = budgetInfo.name || activeBudget.name;
    activeBudget.amount = parseFloat(budgetInfo.amount);
    activeBudget.currency = budgetInfo.currency || activeBudget.currency;

    await this.db.saveBudget(activeBudget);

    return await this.loadBudgetData();
  }

  async deleteBudget(budgetId) {
    await this.db.deleteBudget(budgetId);
    
    const data = await this.loadBudgetData();
    
    if (data.activeBudgetId === budgetId) {
      const newActiveBudget = data.budgets.length > 0 ? data.budgets[0].id : null;
      await this.db.saveSetting('activeBudgetId', newActiveBudget);
    }

    return await this.loadBudgetData();
  }

  async getBudgetHistory() {
    const budgets = await this.db.getAllBudgets();
    return budgets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }

  calculateTotalExpenses(expenses) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  calculateRemainingBudget(budget, totalExpenses) {
    return budget - totalExpenses;
  }

  getBudgetStatus(budget, totalExpenses) {
    if (budget === 0) return 'neutral';
    
    const percentage = (totalExpenses / budget) * 100;
    
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  }

  getBudgetStatusColor(status) {
    const colors = {
      safe: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      neutral: '#6c757d'
    };
    return colors[status] || colors.neutral;
  }
}

export default BudgetServiceDB;
