import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import BudgetSelector from './components/BudgetSelector';
import BudgetForm from './components/BudgetForm';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BudgetSummary from './components/BudgetSummary';
import BudgetChart from './components/BudgetChart';
import InvestmentDashboard from './components/InvestmentDashboard';
import BudgetServiceDB from './services/BudgetServiceDB';
import DatabaseService from './services/DatabaseService';
import InvestmentService from './services/InvestmentService';
import ExportService from './services/ExportService';

function App() {
  // Initialize services
  const [dbInitialized, setDbInitialized] = useState(false);
  const [activeModule, setActiveModule] = useState(() => {
    // Recuperar el módulo activo desde localStorage
    return localStorage.getItem('activeModule') || 'budget';
  });
  const [services, setServices] = useState(null);
  const [budgetData, setBudgetData] = useState({ budgets: [], activeBudgetId: null });

  // Initialize database and services
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const databaseService = new DatabaseService();
      await databaseService.initDB();
      
      // Migrar datos de localStorage si es necesario
      const migrated = await databaseService.getSetting('migrated');
      if (!migrated) {
        await databaseService.migrateFromLocalStorage();
      }

      const budgetServiceDB = new BudgetServiceDB(databaseService);
      const investmentService = new InvestmentService(databaseService);
      const exportService = new ExportService(databaseService);

      setServices({
        database: databaseService,
        budget: budgetServiceDB,
        investment: investmentService,
        export: exportService
      });

      // Cargar datos de presupuesto desde IndexedDB
      const data = await budgetServiceDB.loadBudgetData();
      setBudgetData(data);

      setDbInitialized(true);
    } catch (error) {
      console.error('Error inicializando la aplicación:', error);
    }
  };

  // Get active budget and derived calculations
  const activeBudget = budgetData.budgets.find(b => b.id === budgetData.activeBudgetId) || null;
  const totalExpenses = activeBudget ? activeBudget.expenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  const remaining = activeBudget ? activeBudget.amount - totalExpenses : 0;
  const getStatus = (budget, expenses) => {
    if (!budget || budget === 0) return 'neutral';
    const percentage = (expenses / budget) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'safe';
  };
  const status = activeBudget ? getStatus(activeBudget.amount, totalExpenses) : 'neutral';

  // Event handlers using IndexedDB
  const handleCreateBudget = async (budgetInfo) => {
    if (!services) return;
    const updatedData = await services.budget.createBudget(budgetInfo);
    setBudgetData(updatedData);
  };

  const handleSelectBudget = async (budgetId) => {
    if (!services) return;
    const updatedData = await services.budget.setActiveBudget(budgetId);
    setBudgetData(updatedData);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!services) return;
    const updatedData = await services.budget.deleteBudget(budgetId);
    setBudgetData(updatedData);
  };

  const handleBudgetUpdate = async (budgetInfo) => {
    if (!services) return;
    const updatedData = await services.budget.updateBudget(budgetInfo);
    setBudgetData(updatedData);
  };

  const handleAddExpense = async (expense) => {
    if (!services) return;
    const updatedData = await services.budget.addExpense(expense);
    setBudgetData(updatedData);
  };

  const handleRemoveExpense = async (expenseId) => {
    if (!services) return;
    const updatedData = await services.budget.removeExpense(expenseId);
    setBudgetData(updatedData);
  };

  const handleToggleExpensePaid = async (expenseId) => {
    if (!services) return;
    const updatedData = await services.budget.toggleExpensePaid(expenseId);
    setBudgetData(updatedData);
  };

  const handleReorderExpenses = async (sourceIndex, destinationIndex) => {
    if (!services) return;
    const updatedData = await services.budget.reorderExpenses(sourceIndex, destinationIndex);
    setBudgetData(updatedData);
  };

  const handleModuleChange = (module) => {
    setActiveModule(module);
    localStorage.setItem('activeModule', module);
  };

  if (!dbInitialized || !services) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>⏳ Inicializando aplicación...</h2>
        <p>Configurando base de datos y servicios</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>💰 Presupuesto e Inversiones</h1>
        <p>Gestiona tus finanzas personales de manera inteligente</p>
      </header>

      <Navigation 
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      {activeModule === 'budget' ? (
        <>
          <BudgetSummary
            activeBudget={activeBudget}
            totalExpenses={totalExpenses}
            remaining={remaining}
            status={status}
          />

          <BudgetSelector
            budgets={budgetData.budgets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))}
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
              onToggleExpensePaid={handleToggleExpensePaid}
              onReorderExpenses={handleReorderExpenses}
            />
          </div>
        </>
      ) : (
        <InvestmentDashboard 
          investmentService={services.investment}
          exportService={services.export}
        />
      )}
    </div>
  );
}

export default App;
