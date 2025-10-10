import React, { useState } from 'react';
import Modal from './Modal';
import './ImportBackup.css';

const ImportBackup = ({ exportService, onImportSuccess }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmImport, setConfirmImport] = useState({ isOpen: false, file: null });

  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showModal('Error', 'Por favor selecciona un archivo JSON válido', 'error');
      return;
    }

    setConfirmImport({ isOpen: true, file });
  };

  const confirmImportAction = async () => {
    const { file } = confirmImport;
    setConfirmImport({ isOpen: false, file: null });
    setShowImportModal(false);

    try {
      await exportService.importFromJSON(file);
      showModal(
        '¡Importación Exitosa!', 
        'Tus datos han sido restaurados correctamente. La página se recargará en 2 segundos.',
        'success'
      );
      
      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error importando backup:', error);
      showModal(
        'Error al Importar', 
        'No se pudo importar el archivo. Verifica que sea un backup válido.',
        'error'
      );
    }
  };

  return (
    <>
      <button 
        className="btn btn-secondary"
        onClick={() => setShowImportModal(true)}
        title="Importar Backup"
      >
        📥 Importar Backup
      </button>

      {/* Modal de selección de archivo */}
      {showImportModal && (
        <div className="import-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="import-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="import-modal-header">
              <h3>📥 Importar Backup</h3>
              <button 
                className="close-btn"
                onClick={() => setShowImportModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="import-modal-body">
              <p className="import-warning">
                ⚠️ <strong>Advertencia:</strong> Al importar un backup, todos tus datos actuales 
                serán reemplazados por los datos del archivo.
              </p>
              
              <div className="file-input-container">
                <label htmlFor="backup-file" className="file-input-label">
                  <span className="file-icon">📁</span>
                  <span>Seleccionar archivo JSON</span>
                </label>
                <input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>

              <div className="import-info">
                <h4>ℹ️ Información:</h4>
                <ul>
                  <li>Solo se aceptan archivos .json</li>
                  <li>El archivo debe ser un backup válido de esta aplicación</li>
                  <li>Se recomienda hacer un backup actual antes de importar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <Modal
        isOpen={confirmImport.isOpen}
        onClose={() => setConfirmImport({ isOpen: false, file: null })}
        title="⚠️ Confirmar Importación"
        message={`¿Estás seguro de que deseas importar "${confirmImport.file?.name}"? Esto reemplazará todos tus datos actuales.`}
        type="confirm"
        onConfirm={confirmImportAction}
        confirmText="Importar"
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
    </>
  );
};

export default ImportBackup;
