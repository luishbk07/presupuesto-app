import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header modal-${type}`}>
          <span className="modal-icon">{getIcon()}</span>
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {type === 'confirm' ? (
            <>
              <button className="modal-btn modal-btn-cancel" onClick={onClose}>
                {cancelText}
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>
                {confirmText}
              </button>
            </>
          ) : (
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
