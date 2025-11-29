// src/components/NotificationContainer.js
import NotificationToast from './NotificationToast';
import './NotificationContainer.css';

function NotificationContainer({ notifications, onClose }) {
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

export default NotificationContainer;
