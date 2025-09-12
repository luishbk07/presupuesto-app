import React, { useState } from 'react';
import BudgetSelector from './components/BudgetSelector';
import BudgetForm from './components/BudgetForm';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetSummary from './components/BudgetSummary';
import BudgetChart from './components/BudgetChart';
import StorageService from './services/StorageService';
import BudgetService from './services/BudgetService';

function App() {
  // Initialize services
  const storageService = new StorageService();
  const budgetService = new BudgetService(storageService);

  // State management
  const [budgetData, setBudgetData] = useState(() => budgetService.loadBudgetData());

  // Get active budget and derived calculations
  const activeBudget = budgetService.getActiveBudget(budgetData);
  const totalExpenses = activeBudget ? budgetService.calculateTotalExpenses(activeBudget.expenses) : 0;
  const remaining = activeBudget ? budgetService.calculateRemainingBudget(activeBudget.amount, totalExpenses) : 0;
  const status = activeBudget ? budgetService.getBudgetStatus(activeBudget.amount, totalExpenses) : 'neutral';

  // Event handlers following clean code principles
  const handleCreateBudget = (budgetInfo) => {
    const updatedData = budgetService.createBudget(budgetData, budgetInfo);
    setBudgetData(updatedData);
  };

  const handleSelectBudget = (budgetId) => {
    const updatedData = budgetService.setActiveBudget(budgetData, budgetId);
    setBudgetData(updatedData);
  };

  const handleDeleteBudget = (budgetId) => {
    const updatedData = budgetService.deleteBudget(budgetData, budgetId);
    setBudgetData(updatedData);
  };

  const handleBudgetUpdate = (budgetInfo) => {
    const updatedData = budgetService.updateBudget(budgetData, budgetInfo);
    setBudgetData(updatedData);
  };

  const handleAddExpense = (expense) => {
    const updatedData = budgetService.addExpense(budgetData, expense);
    setBudgetData(updatedData);
  };

  const handleRemoveExpense = (expenseId) => {
    const updatedData = budgetService.removeExpense(budgetData, expenseId);
    setBudgetData(updatedData);
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>💰 Presupuesto Personal</h1>
        <p>Controla tus gastos en tiempo real con múltiples presupuestos</p>
      </header>

      <BudgetSummary
        activeBudget={activeBudget}
        totalExpenses={totalExpenses}
        remaining={remaining}
        status={status}
      />

      <BudgetSelector
        budgets={budgetService.getBudgetHistory(budgetData)}
        activeBudget={activeBudget}
        onSelectBudget={handleSelectBudget}
        onCreateBudget={handleCreateBudget}
        onDeleteBudget={handleDeleteBudget}
      />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <BudgetForm
          activeBudget={activeBudget}
          onBudgetUpdate={handleBudgetUpdate}
        />

        <BudgetChart
          activeBudget={activeBudget}
          totalExpenses={totalExpenses}
          remaining={remaining}
          status={status}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px'
      }}>
        <ExpenseForm
          activeBudget={activeBudget}
          onAddExpense={handleAddExpense}
        />

        <ExpenseList
          activeBudget={activeBudget}
          onRemoveExpense={handleRemoveExpense}
        />
      </div>
    </div>
  );
}

export default App;
