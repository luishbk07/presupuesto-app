import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from './Modal';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const ExpenseList = ({ activeBudget, onRemoveExpense, onToggleExpensePaid, onReorderExpenses }) => {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, expenseId: null, expenseDesc: '' });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleDeleteClick = (expenseId, expenseDesc) => {
    setConfirmDelete({ isOpen: true, expenseId, expenseDesc });
  };

  const confirmDeleteAction = () => {
    const { expenseId } = confirmDelete;
    setConfirmDelete({ isOpen: false, expenseId: null, expenseDesc: '' });
    onRemoveExpense(expenseId);
    showModal('¡Eliminado!', 'El gasto ha sido eliminado exitosamente', 'success');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    onReorderExpenses(sourceIndex, destinationIndex);
  };

  if (!activeBudget) {
    return (
      <div className="card">
        <h2>Lista de Gastos</h2>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Selecciona un presupuesto para ver los gastos.
        </p>
      </div>
    );
  }

  if (activeBudget.expenses.length === 0) {
    return (
      <div className="card">
        <h2>Lista de Gastos</h2>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          Presupuesto: <strong>{activeBudget.name}</strong>
        </p>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No hay gastos registrados aún.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <h2>Lista de Gastos</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Presupuesto: <strong>{activeBudget.name}</strong>
      </p>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="expenses">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={snapshot.isDraggingOver ? 'expenses-dragging-over' : ''}
            >
              {activeBudget.expenses.map((expense, index) => (
                <Draggable key={expense.id} draggableId={expense.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`expense-item ${expense.paid ? 'expense-paid' : ''} ${snapshot.isDragging ? 'expense-dragging' : ''}`}
                    >
                      <div className="expense-drag-handle" {...provided.dragHandleProps}>
                        ⋮⋮
                      </div>
                      <div className="expense-checkbox">
                        <input
                          type="checkbox"
                          id={`expense-${expense.id}`}
                          checked={expense.paid || false}
                          onChange={() => onToggleExpensePaid(expense.id)}
                          className="expense-checkbox-input"
                        />
                        <label htmlFor={`expense-${expense.id}`} className="expense-checkbox-label">
                          <span className="checkbox-custom"></span>
                        </label>
                      </div>
                      <div className="expense-info">
                        <div className="expense-description">{expense.description}</div>
                        <div className="expense-amount">
                          {CurrencyFormatter.formatAmount(expense.amount, activeBudget.currency)} • {formatDate(expense.date)}
                        </div>
                      </div>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteClick(expense.id, expense.description)}
                        style={{ marginLeft: '12px' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, expenseId: null, expenseDesc: '' })}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el gasto "${confirmDelete.expenseDesc}"?`}
        type="confirm"
        onConfirm={confirmDeleteAction}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de mensajes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default ExpenseList;
