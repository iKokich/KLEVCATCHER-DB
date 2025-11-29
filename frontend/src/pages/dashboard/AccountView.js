// src/pages/dashboard/AccountView.js
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield } from 'react-icons/fi';
import apiUrl from '../../apiClient';
import { readBookmarks } from '../../utils/bookmarks';

function AccountView() {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => readBookmarks());
  const [showBookmarkList, setShowBookmarkList] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleBookmarksUpdate = (event) => {
      setBookmarks(event.detail || readBookmarks());
    };
    window.addEventListener('bookmarks:updated', handleBookmarksUpdate);
    return () => window.removeEventListener('bookmarks:updated', handleBookmarksUpdate);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('kc_user');
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      // Load avatar from profile if exists
      if (parsed.profile?.avatar) {
        setAvatarPreview(parsed.profile.avatar);
      }
      fetch(apiUrl(`/api/users/${parsed.id}`))
        .then((res) => {
          if (!res.ok) throw new Error('Не удалось загрузить профиль');
          return res.json();
        })
        .then((data) => {
          setUser(data);
          // Set avatar from server response
          if (data.profile?.avatar) {
            setAvatarPreview(data.profile.avatar);
          }
          localStorage.setItem('kc_user', JSON.stringify(data));
        })
        .catch(() => {
          // оставляем данные из localStorage
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const planLabel = useMemo(() => {
    const plan = user?.profile?.plan || 'free';
    return plan === 'pro' ? 'Pro • Платная версия' : 'Starter • Бесплатная версия';
  }, [user]);

  const jobTitle = user?.profile?.job_title || user?.role || 'Analyst';

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setAvatarPreview(base64);
      setAvatarUploading(true);
      
      try {
        const res = await fetch(apiUrl(`/api/users/${user.id}/avatar`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        });
        
        if (res.ok) {
          // Update local storage with new avatar
          const updatedUser = {
            ...user,
            profile: { ...user.profile, avatar: base64 }
          };
          setUser(updatedUser);
          localStorage.setItem('kc_user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    if (!passwords.current || !passwords.next) {
      setPasswordMessage('Заполните все поля');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage('Пароли не совпадают');
      return;
    }
    try {
      const res = await fetch(apiUrl(`/api/users/${user.id}/password`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.next,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || 'Ошибка обновления пароля');
      }
      setPasswordMessage(payload.message || 'Пароль обновлен');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPasswordMessage(err.message);
    }
  };

  const handleBookmarkNavigate = (bookmark) => {
    navigate('/dashboard/sigma-collection', { state: { focusRuleId: bookmark.id } });
  };

  if (loading) {
    return <div className="panel-card">Загрузка профиля...</div>;
  }

  if (!user) {
    return (
      <div className="panel-card">
        <h2>Нет данных пользователя</h2>
        <p className="muted">Войдите в систему, чтобы увидеть профиль.</p>
        <div className="form-actions">
          <button className="button-28" type="button" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="panel-card account-card profile-card">
        <div className="account-avatar">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar preview" />
          ) : (
            <span>{user.username?.slice(0, 1).toUpperCase()}</span>
          )}
          {avatarUploading && <div className="avatar-loading">...</div>}
        </div>
        <div className="profile-info">
          <p className="eyebrow">Account</p>
          <h2>{user.username}</h2>
          <p className="muted">{jobTitle}</p>
          {isAdmin ? (
            <div className="admin-badges">
              <span className="badge badge-admin">
                <span className="badge-dot badge-dot-red" />
                Admin
              </span>
              <span className="badge badge-verified">
                <FiCheckCircle className="badge-icon" />
                Verified
              </span>
              <span className="badge badge-official">
                <FiShield className="badge-icon" />
                Official
              </span>
            </div>
          ) : (
            <div className="plan-pill">{planLabel}</div>
          )}
          <label className="account-upload">
            {avatarUploading ? 'Загрузка...' : 'Загрузить фото'}
            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
        </div>
      </div>

      <div className="account-grid">
        <div className="account-card">
          <h3>Общая информация</h3>
          <dl className="account-meta-list">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>ID пользователя</dt>
              <dd>#{user.id}</dd>
            </div>
            <div>
              <dt>Роль</dt>
              <dd>{user.role}</dd>
            </div>
            {!isAdmin && (
              <div>
                <dt>Подписка</dt>
                <dd>{planLabel}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="account-card password-card">
          <h3>Смена пароля</h3>
          <form className="account-password-form" onSubmit={handlePasswordSubmit}>
            <label>
              Текущий пароль
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </label>
            <label>
              Новый пароль
              <input
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              />
            </label>
            <label>
              Подтвердите пароль
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </label>
            {passwordMessage && <div className="vt-error">{passwordMessage}</div>}
            <div className="form-actions">
              <button className="button-28" type="submit">
                Обновить пароль
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="account-card bookmarks-card">
        <div className="account-card-head">
          <div>
            <h3>Закладки Sigma</h3>
            <p className="muted">Фиксируются локально и доступны только вам</p>
          </div>
          <button
            className="button-28"
            type="button"
            onClick={() => setShowBookmarkList((prev) => !prev)}
          >
            Bookmarks ({bookmarks.length})
          </button>
        </div>

        {showBookmarkList && (
          <div className="bookmark-dropdown">
            {bookmarks.length === 0 ? (
              <p className="muted">Пока нет сохранённых правил</p>
            ) : (
              bookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  type="button"
                  onClick={() => handleBookmarkNavigate(bookmark)}
                >
                  {bookmark.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountView;

