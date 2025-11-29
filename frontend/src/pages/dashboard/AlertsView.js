// src/pages/dashboard/AlertsView.js
import { useEffect, useState } from 'react';
import { BiBell, BiFile, BiCode, BiShieldX } from 'react-icons/bi';
import apiUrl from '../../apiClient';
import './AlertsView.css';

function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    fetch(apiUrl('/api/alerts'))
      .then(r => r.json())
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAlerts([]);
        setLoading(false);
      });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'report':
        return <BiFile />;
      case 'sigma':
        return <BiCode />;
      case 'threat':
        return <BiShieldX />;
      default:
        return <BiBell />;
    }
  };

  const getAlertTitle = (type) => {
    switch (type) {
      case 'report':
        return 'Новый отчет';
      case 'sigma':
        return 'Новое Sigma Rule';
      case 'threat':
        return 'Новая угроза';
      default:
        return 'Уведомление';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="alerts-view">
        <h2>Уведомления</h2>
        <div className="loading-state">Загрузка уведомлений...</div>
      </div>
    );
  }

  return (
    <div className="alerts-view">
      <div className="alerts-header">
        <h2>Уведомления</h2>
        <span className="alerts-count">{alerts.length} уведомлений</span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-alerts">
          <div className="empty-alerts-icon"><BiBell /></div>
          <h3>Нет уведомлений</h3>
          <p>Здесь будут отображаться уведомления о новых отчетах, угрозах и правилах</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <div className="alert-icon">{getAlertIcon(alert.type)}</div>
              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-title">{getAlertTitle(alert.type)}</span>
                  <span className="alert-time">{formatDate(alert.created_at)}</span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-user">
                  Инициатор: <strong>{alert.username || 'Неизвестный пользователь'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertsView;
