// src/components/ConfirmModal.js
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Удалить', cancelText = 'Отмена' }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onClose}>
          <FiX />
        </button>
        
        <div className="confirm-modal-icon">
          <FiAlertTriangle />
        </div>
        
        <h3 className="confirm-modal-title">{title || 'Подтверждение'}</h3>
        <p className="confirm-modal-message">{message || 'Вы уверены, что хотите выполнить это действие?'}</p>
        
        <div className="confirm-modal-actions">
          <button className="confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-btn-delete" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
