// Budget Service - Business Logic Layer
class BudgetService {
  constructor(storageService) {
    this.storageService = storageService;
    this.defaultData = {
      budgets: [],
      activeBudgetId: null
    };
  }

  loadBudgetData() {
    const data = this.storageService.load();
    return data || this.defaultData;
  }

  saveBudgetData(data) {
    return this.storageService.save(data);
  }

  createBudget(data, budgetInfo) {
    const newBudget = {
      id: Date.now().toString(),
      name: budgetInfo.name || `Presupuesto ${new Date().toLocaleDateString()}`,
      amount: parseFloat(budgetInfo.amount),
      currency: budgetInfo.currency,
      expenses: [],
      createdDate: new Date().toISOString(),
      status: 'active'
    };

    const updatedData = {
      ...data,
      budgets: [...data.budgets, newBudget],
      activeBudgetId: newBudget.id
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  getActiveBudget(data) {
    if (!data.activeBudgetId) return null;
    return data.budgets.find(budget => budget.id === data.activeBudgetId) || null;
  }

  setActiveBudget(data, budgetId) {
    const updatedData = {
      ...data,
      activeBudgetId: budgetId
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  addExpense(data, expense) {
    const activeBudget = this.getActiveBudget(data);
    if (!activeBudget) return data;

    const newExpense = {
      id: Date.now().toString(),
      description: expense.description,
      amount: parseFloat(expense.amount),
      date: new Date().toISOString()
    };

    const updatedBudgets = data.budgets.map(budget => {
      if (budget.id === activeBudget.id) {
        return {
          ...budget,
          expenses: [...budget.expenses, newExpense]
        };
      }
      return budget;
    });

    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  toggleExpensePaid(data, expenseId) {
    const activeBudget = this.getActiveBudget(data);
    if (!activeBudget) return data;

    const updatedBudgets = data.budgets.map(budget => {
      if (budget.id === activeBudget.id) {
        return {
          ...budget,
          expenses: budget.expenses.map(expense => {
            if (expense.id === expenseId) {
              return {
                ...expense,
                paid: !expense.paid
              };
            }
            return expense;
          })
        };
      }
      return budget;
    });

    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  reorderExpenses(data, sourceIndex, destinationIndex) {
    const activeBudget = this.getActiveBudget(data);
    if (!activeBudget) return data;

    const updatedBudgets = data.budgets.map(budget => {
      if (budget.id === activeBudget.id) {
        const expenses = Array.from(budget.expenses);
        const [removed] = expenses.splice(sourceIndex, 1);
        expenses.splice(destinationIndex, 0, removed);
        
        return {
          ...budget,
          expenses
        };
      }
      return budget;
    });

    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  removeExpense(data, expenseId) {
    const activeBudget = this.getActiveBudget(data);
    if (!activeBudget) return data;

    const updatedBudgets = data.budgets.map(budget => {
      if (budget.id === activeBudget.id) {
        return {
          ...budget,
          expenses: budget.expenses.filter(expense => expense.id !== expenseId)
        };
      }
      return budget;
    });

    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  updateBudget(data, budgetInfo) {
    const activeBudget = this.getActiveBudget(data);
    if (!activeBudget) return data;

    const updatedBudgets = data.budgets.map(budget => {
      if (budget.id === activeBudget.id) {
        return {
          ...budget,
          name: budgetInfo.name || budget.name,
          amount: parseFloat(budgetInfo.amount),
          currency: budgetInfo.currency || budget.currency
        };
      }
      return budget;
    });

    const updatedData = {
      ...data,
      budgets: updatedBudgets
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  deleteBudget(data, budgetId) {
    const updatedBudgets = data.budgets.filter(budget => budget.id !== budgetId);
    const updatedData = {
      ...data,
      budgets: updatedBudgets,
      activeBudgetId: data.activeBudgetId === budgetId ? 
        (updatedBudgets.length > 0 ? updatedBudgets[0].id : null) : 
        data.activeBudgetId
    };

    this.saveBudgetData(updatedData);
    return updatedData;
  }

  getBudgetHistory(data) {
    return data.budgets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
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

export default BudgetService;
