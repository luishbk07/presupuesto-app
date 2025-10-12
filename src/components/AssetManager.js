import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from './Modal';
import './AssetManager.css';

const AssetManager = ({ portfolio, investmentService, onUpdate, onClose }) => {
  const [assets, setAssets] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({ symbol: '', name: '', weight: '', dividendYield: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, assetIndex: null });

  useEffect(() => {
    if (portfolio) {
      setAssets([...portfolio.assets]);
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(assets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAssets(items);
  };

  const handleAddAsset = () => {
    const { symbol, name, weight, dividendYield } = newAsset;
    
    if (!symbol.trim() || !name.trim() || !weight) {
      showModal('Error', 'Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const weightNum = parseFloat(weight);
    if (weightNum <= 0 || weightNum > 1) {
      showModal('Error', 'El peso debe estar entre 0 y 1 (0% - 100%)', 'error');
      return;
    }

    const newAssetObj = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      weight: weightNum,
      dividendYield: parseFloat(dividendYield) || 0
    };

    setAssets([...assets, newAssetObj]);
    setNewAsset({ symbol: '', name: '', weight: '', dividendYield: '' });
    setShowAddForm(false);
    showModal('¡Activo Agregado!', `${newAssetObj.symbol} ha sido agregado exitosamente`, 'success');
  };

  const handleEditAsset = (index) => {
    setEditingAsset({ ...assets[index], index });
  };

  const handleSaveEdit = () => {
    const { index, symbol, name, weight, dividendYield } = editingAsset;
    
    if (!symbol.trim() || !name.trim() || !weight) {
      showModal('Error', 'Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const weightNum = parseFloat(weight);
    if (weightNum <= 0 || weightNum > 1) {
      showModal('Error', 'El peso debe estar entre 0 y 1 (0% - 100%)', 'error');
      return;
    }

    const updatedAssets = [...assets];
    updatedAssets[index] = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      weight: weightNum,
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
          {/* Resumen de pesos */}
          <div className={`weight-summary ${Math.abs(getTotalWeight() - 1) < 0.01 ? 'valid' : 'invalid'}`}>
            <span>Total de Pesos: <strong>{(getTotalWeight() * 100).toFixed(2)}%</strong></span>
            {Math.abs(getTotalWeight() - 1) >= 0.01 && (
              <button className="btn-normalize" onClick={handleNormalizeWeights}>
                🔄 Normalizar a 100%
              </button>
            )}
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
                                  placeholder="Símbolo (ej: SPY)"
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
                                  placeholder="Peso (0-1)"
                                  value={editingAsset.weight}
                                  onChange={(e) => setEditingAsset({ ...editingAsset, weight: e.target.value })}
                                  className="input-weight"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                />
                                <input
                                  type="number"
                                  placeholder="Dividendo %"
                                  value={editingAsset.dividendYield}
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
                  <label>Peso (0-1) *</label>
                  <input
                    type="number"
                    placeholder="ej: 0.25 = 25%"
                    value={newAsset.weight}
                    onChange={(e) => setNewAsset({ ...newAsset, weight: e.target.value })}
                    step="0.01"
                    min="0"
                    max="1"
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
