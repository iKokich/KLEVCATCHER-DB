// src/pages/dashboard/SigmaCollectionView.js

import { useEffect, useMemo, useState } from 'react';
import { FiBookmark, FiCopy, FiHeart, FiStar, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import apiUrl from '../../apiClient';
import { readBookmarks, toggleBookmark } from '../../utils/bookmarks';
import ConfirmModal from '../../components/ConfirmModal';

function SigmaCollectionView() {
  const location = useLocation();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedContent, setSelectedContent] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());
  const [likedRules, setLikedRules] = useState({});
  const [favoriteRules, setFavoriteRules] = useState({});
  const [copied, setCopied] = useState(false);
  const [hoveredCode, setHoveredCode] = useState(null);
  const [deleteNotification, setDeleteNotification] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  
  // Check user role for delete permission
  const currentUser = JSON.parse(localStorage.getItem('kc_user') || '{}');
  const userRole = currentUser?.role?.toLowerCase();
  const canDelete = userRole === 'admin' || userRole === 'analyst';

  const loadRules = () => {
    setLoading(true);
    setError('');
    fetch(apiUrl('/api/sigma-rules'))
      .then((r) => r.json())
      .then((list) => setRules(Array.isArray(list) ? list : []))
      .catch(() => setError('Не удалось загрузить Sigma rules'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRules();
  }, []);

  useEffect(() => {
    const handleBookmarksUpdate = (event) => {
      setBookmarks(event.detail || readBookmarks());
    };
    window.addEventListener('bookmarks:updated', handleBookmarksUpdate);
    return () => window.removeEventListener('bookmarks:updated', handleBookmarksUpdate);
  }, []);

  useEffect(() => {
    if (rules.length === 0) return;
    const focusRuleId = location.state?.focusRuleId;
    if (focusRuleId) {
      const found = rules.find((rule) => rule.id === focusRuleId);
      if (found) {
        selectRule(found);
      }
    } else if (!selectedRule) {
      selectRule(rules[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, location.state]);

  const selectRule = (rule) => {
    setSelectedRule(rule);
    setSelectedContent('');
    if (!rule) return;
    setDetailLoading(true);
    fetch(apiUrl(`/api/sigma-rules/${rule.id}`))
      .then((res) => res.json())
      .then((data) => setSelectedContent(data.content || ''))
      .catch(() => setSelectedContent('Не удалось загрузить содержимое правила'))
      .finally(() => setDetailLoading(false));
  };

  const handleCopy = () => {
    if (!selectedContent) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(selectedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleHeart = (ruleId) => {
    setLikedRules((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const toggleStar = (ruleId) => {
    setFavoriteRules((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const isBookmarked = useMemo(
    () => (ruleId) => bookmarks.some((item) => item.id === ruleId),
    [bookmarks]
  );

  const handleBookmark = (rule) => {
    const next = toggleBookmark(rule);
    setBookmarks(next);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;
    
    try {
      const res = await fetch(apiUrl(`/api/sigma-rules/${ruleToDelete.id}`), {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Remove from list
        setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
        // Clear selection if deleted rule was selected
        if (selectedRule?.id === ruleToDelete.id) {
          setSelectedRule(null);
          setSelectedContent('');
        }
        // Show delete notification
        setDeleteNotification(`Правило "${ruleToDelete.name}" удалено`);
        setTimeout(() => setDeleteNotification(null), 3000);
      } else {
        alert('Не удалось удалить правило');
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert('Ошибка при удалении правила');
    } finally {
      setRuleToDelete(null);
    }
  };

  return (
    <div className="panel-card sigma-library">
      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить правило?"
        message={`Вы уверены, что хотите удалить правило "${ruleToDelete?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
      />

      {/* Delete notification */}
      {deleteNotification && (
        <div className="sigma-delete-notification">
          <FiCheck className="notification-icon" />
          <span>{deleteNotification}</span>
        </div>
      )}
      
      <div className="sigma-collection-header">
        <div>
          <p className="eyebrow">Data Library</p>
          <h2>Sigma rules</h2>
          <p className="muted">Загружайте правила и работайте с ними в одном просматривателе</p>
        </div>
        <button className="button-28" type="button" onClick={loadRules} disabled={loading}>
          {loading ? 'Обновление...' : 'Обновить список'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444' }}>{error}</div>}

      <div className="sigma-split">
        <div className="sigma-list">
          {loading ? (
            <div className="loading-state">Загрузка Sigma правил...</div>
          ) : rules.length === 0 ? (
            <div className="empty-state">Пока нет сохранённых Sigma правил</div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`sigma-rule-card-new ${selectedRule?.id === rule.id ? 'active' : ''}`}
                onClick={() => selectRule(rule)}
              >
                <div className="sigma-card-header">
                  <div className="sigma-card-badge">Sigma rule</div>
                  <div className="sigma-rule-icons">
                    <button
                      type="button"
                      className={`sigma-icon-btn bookmark ${isBookmarked(rule.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(rule);
                      }}
                      aria-label="Bookmark rule"
                    >
                      <FiBookmark />
                    </button>
                    <button
                      type="button"
                      className={`sigma-icon-btn heart ${likedRules[rule.id] ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHeart(rule.id);
                      }}
                      aria-label="Like rule"
                    >
                      <FiHeart />
                    </button>
                    <button
                      type="button"
                      className={`sigma-icon-btn star ${favoriteRules[rule.id] ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(rule.id);
                      }}
                      aria-label="Favorite rule"
                    >
                      <FiStar />
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        className="sigma-icon-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(rule);
                        }}
                        aria-label="Delete rule"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
                <div className="sigma-card-body">
                  <h3 className="sigma-card-title">{rule.name}</h3>
                  <p className="sigma-card-desc">{rule.description || 'No description'}</p>
                  <p className="sigma-card-date">
                    {rule.created_at ? new Date(rule.created_at).toLocaleDateString('ru-RU', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Дата не указана'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sigma-detail-pane">
          {!selectedRule ? (
            <div className="empty-state">Выберите правило слева</div>
          ) : detailLoading ? (
            <div className="loading-state">Загружаем правило...</div>
          ) : (
            <>
              <div className="sigma-detail-head">
                <div>
                  <p className="eyebrow">Rule detail</p>
                  <h3>{selectedRule.name}</h3>
                  <p className="muted">{selectedRule.description || 'Описание отсутствует'}</p>
                </div>
              </div>
              <div 
                className="sigma-detail-code-wrapper"
                onMouseEnter={() => setHoveredCode(true)}
                onMouseLeave={() => setHoveredCode(false)}
              >
                {hoveredCode && (
                  <button
                    className="sigma-copy-btn"
                    type="button"
                    onClick={handleCopy}
                    aria-label="Скопировать Sigma rule"
                  >
                    <FiCopy />
                  </button>
                )}
                {copied && (
                  <div className="copy-notification">
                    <FiCheck /> Copied
                  </div>
                )}
                <pre className="sigma-detail-code">
                  <code>{selectedContent || '# Пусто'}</code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SigmaCollectionView;
