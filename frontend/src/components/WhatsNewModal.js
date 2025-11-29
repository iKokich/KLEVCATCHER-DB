// src/components/WhatsNewModal.js
import { useState, useEffect } from 'react';
import { FiX, FiGift, FiStar, FiZap, FiBell } from 'react-icons/fi';
import './WhatsNewModal.css';

function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [changelog, setChangelog] = useState(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Добавляем timestamp чтобы избежать кэширования
      const response = await fetch(`/changelog.json?t=${Date.now()}`);
      const data = await response.json();
      
      const lastSeenVersion = localStorage.getItem('kc_last_seen_version');
      
      if (!lastSeenVersion || lastSeenVersion !== data.version) {
        setChangelog(data);
        setHasNewUpdate(true);
        // Автоматически показываем модалку при новом обновлении
        setTimeout(() => setIsOpen(true), 1500);
      }
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (changelog) {
      localStorage.setItem('kc_last_seen_version', changelog.version);
      setHasNewUpdate(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feature': return <FiStar className="change-icon feature" />;
      case 'improvement': return <FiZap className="change-icon improvement" />;
      case 'fix': return <FiGift className="change-icon fix" />;
      default: return <FiGift className="change-icon" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'feature': return 'Новое';
      case 'improvement': return 'Улучшение';
      case 'fix': return 'Исправление';
      default: return 'Обновление';
    }
  };


  return (
    <>
      {/* Notification Bell - показывается если есть новое обновление */}
      {hasNewUpdate && !isOpen && (
        <button className="whats-new-bell" onClick={() => setIsOpen(true)}>
          <FiBell />
          <span className="bell-badge" />
        </button>
      )}

      {/* Modal */}
      {isOpen && changelog && (
        <div className="whats-new-overlay" onClick={handleClose}>
          <div className="whats-new-modal" onClick={(e) => e.stopPropagation()}>
            <button className="whats-new-close" onClick={handleClose}>
              <FiX />
            </button>

            <div className="whats-new-header">
              <div className="whats-new-icon">
                <FiGift />
              </div>
              <h2>Что нового? 🎉</h2>
              <p className="version-badge">Версия {changelog.version}</p>
            </div>

            <div className="whats-new-content">
              {changelog.updates.map((update, idx) => (
                <div key={idx} className="update-section">
                  <div className="update-header">
                    <h3>{update.title}</h3>
                    <span className="update-date">{update.date}</span>
                  </div>
                  
                  <ul className="changes-list">
                    {update.changes.map((change, changeIdx) => (
                      <li key={changeIdx} className="change-item">
                        {getTypeIcon(change.type)}
                        <span className={`change-type ${change.type}`}>
                          {getTypeLabel(change.type)}
                        </span>
                        <span className="change-text">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="whats-new-footer">
              <button className="whats-new-btn" onClick={handleClose}>
                Понятно, спасибо!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WhatsNewModal;
