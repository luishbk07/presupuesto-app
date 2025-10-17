import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from './Modal';
import './AssetManager.css';

const AssetManager = ({ portfolio, investmentService, onUpdate, onClose }) => {
  const [assets, setAssets] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({ symbol: '', name: '', weight: '', amount: '', dividendYield: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, assetIndex: null });
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (portfolio) {
      // Asegurar que todos los activos tengan el campo amount
      const assetsWithAmount = portfolio.assets.map(asset => ({
        ...asset,
        amount: asset.amount || 0
      }));
      setAssets(assetsWithAmount);
      
      // Calcular el total basado en los montos existentes
      const calculatedTotal = assetsWithAmount.reduce((sum, asset) => sum + (asset.amount || 0), 0);
      if (calculatedTotal > 0) {
        setTotalAmount(calculatedTotal);
      }
    }
  }, [portfolio]);

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const getTotalWeight = () => {
    return assets.reduce((sum, asset) => sum + (parseFloat(asset.weight) || 0), 0);
  };

  const getTotalAmountFromAssets = () => {
    return assets.reduce((sum, asset) => {
      const amount = parseFloat(asset.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const calculateWeightFromAmount = (amount, total) => {
    if (!total || total === 0) return 0;
    return parseFloat((amount / total).toFixed(4));
  };

  const calculateAmountFromWeight = (weight, total) => {
    return parseFloat((weight * total).toFixed(2));
  };

  const handleTotalAmountChange = (newTotal) => {
    const total = parseFloat(newTotal) || 0;
    setTotalAmount(total);
    
    if (total > 0 && assets.length > 0) {
      // Recalcular pesos para todos los activos que tengan monto
      const updatedAssets = assets.map(asset => {
        if (asset.amount > 0) {
          // Recalcular peso basado en el monto
          return {
            ...asset,
            weight: calculateWeightFromAmount(asset.amount, total)
          };
        } else if (asset.weight > 0) {
          // Si solo tiene peso, calcular monto
          return {
            ...asset,
            amount: calculateAmountFromWeight(asset.weight, total)
          };
        }
        return asset;
      });
      setAssets(updatedAssets);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(assets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAssets(items);
  };

  const handleAddAsset = () => {
    const { symbol, name, weight, amount, dividendYield } = newAsset;
    
    if (!symbol.trim() || !name.trim()) {
      showModal('Error', 'Por favor completa el símbolo y nombre', 'error');
      return;
    }

    if (!weight && !amount) {
      showModal('Error', 'Debes ingresar el peso O el monto', 'error');
      return;
    }

    let finalWeight = 0;
    let finalAmount = 0;

    // Priorizar monto si ambos están presentes
    if (amount) {
      finalAmount = parseFloat(amount);
      if (finalAmount <= 0) {
        showModal('Error', 'El monto debe ser mayor a 0', 'error');
        return;
      }
      // Calcular peso solo si hay un total definido
      if (totalAmount > 0) {
        finalWeight = calculateWeightFromAmount(finalAmount, totalAmount);
      } else {
        // Advertir que debe definir el total primero
        showModal('Advertencia', 'Define el "Monto Total del Portafolio" arriba para calcular el peso automáticamente. Por ahora se guardará con peso 0%.', 'warning');
        finalWeight = 0;
      }
    } else if (weight) {
      // Si solo ingresó peso
      finalWeight = parseFloat(weight);
      if (finalWeight <= 0 || finalWeight > 1) {
        showModal('Error', 'El peso debe estar entre 0 y 1 (0% - 100%)', 'error');
        return;
      }
      // Calcular monto solo si hay un total definido
      finalAmount = totalAmount > 0 ? calculateAmountFromWeight(finalWeight, totalAmount) : 0;
    }

    const newAssetObj = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      weight: finalWeight,
      amount: finalAmount,
      dividendYield: parseFloat(dividendYield) || 0
    };

    setAssets([...assets, newAssetObj]);
    setNewAsset({ symbol: '', name: '', weight: '', amount: '', dividendYield: '' });
    setShowAddForm(false);
    showModal('¡Activo Agregado!', `${newAssetObj.symbol} ha sido agregado exitosamente`, 'success');
  };

  const handleEditAsset = (index) => {
    setEditingAsset({ ...assets[index], index });
  };

  const handleSaveEdit = () => {
    const { index, symbol, name, weight, amount, dividendYield } = editingAsset;
    
    if (!symbol.trim() || !name.trim()) {
      showModal('Error', 'Por favor completa el símbolo y nombre', 'error');
      return;
    }

    if (!weight && !amount) {
      showModal('Error', 'Debes ingresar el peso O el monto', 'error');
      return;
    }

    let finalWeight = 0;
    let finalAmount = 0;

    // Priorizar monto si ambos están presentes
    if (amount) {
      finalAmount = parseFloat(amount);
      if (finalAmount <= 0) {
        showModal('Error', 'El monto debe ser mayor a 0', 'error');
        return;
      }
      // Calcular peso solo si hay un total definido
      if (totalAmount > 0) {
        finalWeight = calculateWeightFromAmount(finalAmount, totalAmount);
      } else {
        finalWeight = 0;
      }
    } else if (weight) {
      // Si solo ingresó peso
      finalWeight = parseFloat(weight);
      if (finalWeight <= 0 || finalWeight > 1) {
        showModal('Error', 'El peso debe estar entre 0 y 1 (0% - 100%)', 'error');
        return;
      }
      // Calcular monto solo si hay un total definido
      finalAmount = totalAmount > 0 ? calculateAmountFromWeight(finalWeight, totalAmount) : 0;
    }

    const updatedAssets = [...assets];
    updatedAssets[index] = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      weight: finalWeight,
      amount: finalAmount,
      dividendYield: parseFloat(dividendYield) || 0
    };

    setAssets(updatedAssets);
    setEditingAsset(null);
    showModal('¡Actualizado!', 'El activo ha sido actualizado exitosamente', 'success');
  };

  const handleDeleteAsset = (index) => {
    setConfirmDelete({ isOpen: true, assetIndex: index });
  };

  const confirmDeleteAction = () => {
    const { assetIndex } = confirmDelete;
    const deletedAsset = assets[assetIndex];
    const updatedAssets = assets.filter((_, i) => i !== assetIndex);
    setAssets(updatedAssets);
    setConfirmDelete({ isOpen: false, assetIndex: null });
    showModal('¡Eliminado!', `${deletedAsset.symbol} ha sido eliminado exitosamente`, 'success');
  };

  const handleNormalizeWeights = () => {
    const total = getTotalWeight();
    if (total === 0) {
      showModal('Error', 'No hay activos con peso asignado', 'error');
      return;
    }

    const normalizedAssets = assets.map(asset => ({
      ...asset,
      weight: parseFloat((asset.weight / total).toFixed(4))
    }));

    setAssets(normalizedAssets);
    showModal('¡Normalizado!', 'Los pesos han sido normalizados a 100%', 'success');
  };

  const handleRecalculateWeights = () => {
    if (totalAmount <= 0) {
      showModal('Error', 'Debes definir el monto total primero', 'error');
      return;
    }

    const totalFromAmounts = getTotalAmountFromAssets();
    if (totalFromAmounts === 0) {
      showModal('Error', 'No hay activos con montos asignados', 'error');
      return;
    }

    // Recalcular pesos basándose en los montos actuales
    const updatedAssets = assets.map(asset => {
      if (asset.amount > 0) {
        return {
          ...asset,
          weight: calculateWeightFromAmount(asset.amount, totalAmount)
        };
      }
      return asset;
    });

    setAssets(updatedAssets);
    showModal('¡Recalculado!', 'Los pesos han sido recalculados basándose en los montos', 'success');
  };

  const handleSavePortfolio = async () => {
    const total = getTotalWeight();
    
    if (Math.abs(total - 1) > 0.01) {
      showModal(
        'Advertencia', 
        `La suma de los pesos es ${(total * 100).toFixed(2)}%. Debe ser 100%. ¿Deseas normalizar automáticamente?`,
        'warning'
      );
      return;
    }

    if (assets.length === 0) {
      showModal('Error', 'Debes tener al menos un activo en el portafolio', 'error');
      return;
    }

    try {
      const updatedPortfolio = {
        ...portfolio,
        assets: assets
      };

      await investmentService.db.savePortfolio(updatedPortfolio);
      
      if (onUpdate) onUpdate();
      if (onClose) onClose();
      
      showModal('¡Guardado!', 'El portafolio ha sido actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error guardando portafolio:', error);
      showModal('Error', 'No se pudo guardar el portafolio', 'error');
    }
  };

  return (
    <div className="asset-manager-overlay" onClick={onClose}>
      <div className="asset-manager-container" onClick={(e) => e.stopPropagation()}>
        <div className="asset-manager-header">
          <h2>📊 Gestionar Activos - {portfolio?.broker.toUpperCase()}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="asset-manager-body">
          {/* Campo de monto total */}
          <div className={`total-amount-section ${!totalAmount ? 'highlight-required' : ''}`}>
            <label>💰 Monto Total del Portafolio (REQUERIDO para calcular pesos):</label>
            <input
              type="number"
              placeholder="ej: 10000 - Define esto PRIMERO"
              value={totalAmount || ''}
              onChange={(e) => handleTotalAmountChange(e.target.value)}
              className="total-amount-input"
              step="0.01"
              min="0"
            />
            <span className="total-amount-hint">
              {!totalAmount ? (
                <strong style={{ color: '#dc3545' }}>⚠️ Define el monto total primero para que los pesos se calculen automáticamente</strong>
              ) : (
                `✓ Monto total definido. Los pesos se calcularán automáticamente.`
              )}
            </span>
          </div>

          {/* Resumen de pesos */}
          <div className={`weight-summary ${Math.abs(getTotalWeight() - 1) < 0.01 ? 'valid' : 'invalid'}`}>
            <div>
              <span>Total de Pesos: <strong>{(getTotalWeight() * 100).toFixed(2)}%</strong></span>
              {totalAmount > 0 && (
                <span style={{ marginLeft: '16px', color: '#666' }}>
                  Total en $: <strong>${getTotalAmountFromAssets().toFixed(2)}</strong>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {totalAmount > 0 && getTotalAmountFromAssets() > 0 && (
                <button className="btn-normalize" onClick={handleRecalculateWeights}>
                  🔢 Recalcular Pesos
                </button>
              )}
              {Math.abs(getTotalWeight() - 1) >= 0.01 && (
                <button className="btn-normalize" onClick={handleNormalizeWeights}>
                  🔄 Normalizar a 100%
                </button>
              )}
            </div>
          </div>

          {/* Lista de activos con Drag & Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="assets">
              {(provided, snapshot) => (
                <div 
                  className={`assets-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {assets.length === 0 ? (
                    <p className="no-assets">No hay activos. Agrega el primero.</p>
                  ) : (
                    assets.map((asset, index) => (
                      <Draggable key={`asset-${index}`} draggableId={`asset-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            className={`asset-row ${snapshot.isDragging ? 'dragging' : ''}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            {editingAsset?.index === index ? (
                              // Modo edición
                              <div className="asset-edit-form">
                                <input
                                  type="text"
                                  placeholder="Símbolo"
                                  value={editingAsset.symbol}
                                  onChange={(e) => setEditingAsset({ ...editingAsset, symbol: e.target.value })}
                                  className="input-symbol"
                                />
                                <input
                                  type="text"
                                  placeholder="Nombre"
                                  value={editingAsset.name}
                                  onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                                  className="input-name"
                                />
                                <input
                                  type="number"
                                  placeholder="Monto $"
                                  value={editingAsset.amount || ''}
                                  onChange={(e) => {
                                    const amount = e.target.value;
                                    const weight = totalAmount > 0 ? calculateWeightFromAmount(parseFloat(amount) || 0, totalAmount) : 0;
                                    setEditingAsset({ ...editingAsset, amount, weight });
                                  }}
                                  className="input-amount"
                                  step="0.01"
                                  min="0"
                                />
                                <input
                                  type="text"
                                  value={editingAsset.weight ? `${(editingAsset.weight * 100).toFixed(2)}%` : ''}
                                  readOnly
                                  className="input-weight-display"
                                  placeholder="Peso %"
                                  style={{ backgroundColor: '#f0f0f0' }}
                                />
                                <input
                                  type="number"
                                  placeholder="Div %"
                                  value={editingAsset.dividendYield || ''}
                                  onChange={(e) => setEditingAsset({ ...editingAsset, dividendYield: e.target.value })}
                                  className="input-dividend"
                                  step="0.01"
                                  min="0"
                                />
                                <div className="edit-actions">
                                  <button className="btn-save" onClick={handleSaveEdit}>✓</button>
                                  <button className="btn-cancel" onClick={() => setEditingAsset(null)}>✕</button>
                                </div>
                              </div>
                            ) : (
                              // Modo vista
                              <>
                                <div className="drag-handle" {...provided.dragHandleProps}>
                                  ⋮⋮
                                </div>
                                <div className="asset-info">
                                  <div className="asset-symbol">{asset.symbol}</div>
                                  <div className="asset-name">{asset.name}</div>
                                </div>
                                <div className="asset-stats">
                                  <div className="asset-weight">{(asset.weight * 100).toFixed(2)}%</div>
                                  {asset.amount > 0 && (
                                    <div className="asset-amount-display">${asset.amount.toFixed(2)}</div>
                                  )}
                                  {asset.dividendYield > 0 && (
                                    <div className="asset-dividend">Div: {asset.dividendYield.toFixed(2)}%</div>
                                  )}
                                </div>
                                <div className="asset-actions">
                                  <button className="btn-edit-small" onClick={() => handleEditAsset(index)}>✏️</button>
                                  <button className="btn-delete-small" onClick={() => handleDeleteAsset(index)}>🗑️</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Formulario para agregar nuevo activo */}
          {showAddForm ? (
            <div className="add-asset-form">
              <h3>➕ Agregar Nuevo Activo</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Símbolo *</label>
                  <input
                    type="text"
                    placeholder="ej: AAPL"
                    value={newAsset.symbol}
                    onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    placeholder="ej: Apple Inc"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Monto en $ *</label>
                  <input
                    type="number"
                    placeholder="ej: 2500"
                    value={newAsset.amount || ''}
                    onChange={(e) => {
                      const amount = e.target.value;
                      const weight = totalAmount > 0 ? calculateWeightFromAmount(parseFloat(amount) || 0, totalAmount) : 0;
                      setNewAsset({ ...newAsset, amount, weight });
                    }}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Peso % (calculado)</label>
                  <input
                    type="text"
                    value={newAsset.weight ? `${(newAsset.weight * 100).toFixed(2)}%` : ''}
                    readOnly
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    placeholder="Se calcula automáticamente"
                  />
                </div>
                <div className="form-group">
                  <label>Dividendo Anual %</label>
                  <input
                    type="number"
                    placeholder="ej: 2.5"
                    value={newAsset.dividendYield}
                    onChange={(e) => setNewAsset({ ...newAsset, dividendYield: e.target.value })}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleAddAsset}>Agregar Activo</button>
                <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              ➕ Agregar Activo
            </button>
          )}
        </div>

        <div className="asset-manager-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSavePortfolio}>
            💾 Guardar Cambios
          </button>
        </div>

        {/* Modal de confirmación de eliminación */}
        <Modal
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, assetIndex: null })}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar ${assets[confirmDelete.assetIndex]?.symbol}?`}
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
    </div>
  );
};

export default AssetManager;
