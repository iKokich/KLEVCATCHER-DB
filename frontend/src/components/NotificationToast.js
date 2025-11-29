// src/components/NotificationToast.js
import { useEffect } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import './NotificationToast.css';

function NotificationToast({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const getMessage = () => {
    switch (notification.type) {
      case 'report':
        return 'Отчет создан успешно!';
      case 'sigma':
        return 'Sigma Rule создано!';
      case 'threat':
        return 'Угроза добавлена!';
      default:
        return 'Выполнено успешно!';
    }
  };

  return (
    <div className="notification-toast">
      <div className="notification-content">
        <FiCheckCircle className="notification-check-icon" />
        <span className="notification-message">{getMessage()}</span>
      </div>
      <button className="notification-close" onClick={() => onClose(notification.id)}>
        <FiX />
      </button>
    </div>
  );
}

export default NotificationToast;
